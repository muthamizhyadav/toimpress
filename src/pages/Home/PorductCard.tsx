import { useMediaQuery } from "@mantine/hooks";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SizeSelectorDrawer from "../../components/SizeSelectorDrawer";
import { showNotification } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";

interface PromoInfo {
  threshold: number;
  discountPercent: number;
  applied?: boolean;
}

type ColorDataMap = Record<
  string,
  {
    sizes: string[];
    images: string[];
  }
>;

interface ProductCardProps {
  id: string | number;
  imageUrl: string;
  productName: string;
  price: number;
  category?: string | number;
  originalPrice: number;
  rating: number;
  isNew?: boolean;
  isOnSale?: boolean;
  sizeOptions?: Parameters<typeof SizeSelectorDrawer>[0]["options"];
  colors?: string[];
  colorData?: ColorDataMap;
  selectedColor?: string;
  promo?: PromoInfo | null;
  sizes: any;
  fromGrid?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  imageUrl,
  productName,
  price,
  originalPrice,
  rating,
  category,
  isNew = false,
  isOnSale = false,
  sizeOptions,
  colors = [],
  colorData,
  selectedColor,
  promo = null,
  sizes,
  fromGrid=false
}) => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openSizeDrawer, setOpenSizeDrawer] = useState(false);
  const [lastSize, setLastSize] = useState<string | undefined>(undefined);
  const [selectedColorLocal, setSelectedColorLocal] = useState<
    string | undefined
  >(selectedColor);

  const handleNavigation = () => navigate(`/product/?id=${id}`);

  const displayImageUrl =
    (selectedColorLocal && colorData?.[selectedColorLocal]?.images?.[0]) ||
    imageUrl;

  // ----------------------------------------------------
  // ✅ ADD TO CART → CHECK SIZE FIRST
  // ----------------------------------------------------
  const AddToCartClick = () => {
    const selectedSize = sizes?.selected ?? null;

    // 🔥 If size is NOT selected → open drawer
    if (!selectedSize && sizeOptions?.length) {
      setOpenSizeDrawer(true);
      return;
    }

    // Otherwise directly add to cart
    dispatch(
      addToCart({
        id,
        title:productName,
        price,
        image: displayImageUrl,
        color: selectedColorLocal,
        size:selectedSize,
        qty: 1,
        category:category as string,
      })
    );

    showNotification({
      title: "Added to Cart",
      message: `${productName} added successfully`,
      color: "green",
      icon: <IconCheck size={18} />,
      autoClose: 2000,
    });
  };

  return (
    <div className="rounded-xl shadow p-2 bg-white flex flex-col w-full h-full">
      {/* PRODUCT IMAGE */}
      <div
        className="relative w-full aspect-[4/4] overflow-hidden rounded-lg"
        onClick={handleNavigation}
      >
        <img
          src={displayImageUrl}
          alt={productName}
          className={`${isMobile ? "w-[250px]" : "w-full"} h-full object-cover`}
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOnSale && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Sale!
            </span>
          )}
          {isNew && (
            <span className="bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>
      </div>

      {/* PRODUCT INFO */}
      <div className="mt-1 px-1 flex flex-col justify-between flex-grow gap-1">
        <div className="flex-grow">
          <p className="text-sm md:text-base line-clamp-2 font-medium">
            {productName}
            {lastSize && (
              <span className="text-xs ml-2 text-gray-600">({lastSize})</span>
            )}
          </p>

          <div className="flex mt-1 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-black font-bold text-sm md:text-base">
                ₹{price}
              </span>
              <span className="line-through text-gray-400 font-bold text-sm md:text-base">
                ₹{originalPrice}
              </span>
              <span className="text-[#96BD75] font-bold !text-[12px]">
                (SAVE{" "}
                {Math.round(((originalPrice - price) / originalPrice) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* ADD TO CART BUTTON */}
        <div>
          {!fromGrid ? <button
            onClick={AddToCartClick}
            className={`w-full bg-[#96BD75] text-white py-2 font-bold rounded-full flex justify-center items-center gap-2 shadow-sm mb-2`}
          >
            Add to cart
          </button> : 
          <button
            onClick={handleNavigation}
            className={`w-full bg-[#96BD75] text-white py-2 font-bold rounded-full flex justify-center items-center gap-2 shadow-sm mb-2`}
          >
            Buy Now
          </button> 
          }
        </div>
      </div>

      <SizeSelectorDrawer
        opened={openSizeDrawer}
        onClose={() => setOpenSizeDrawer(false)}
        onConfirm={(selectedSize: string) => {
          setLastSize(selectedSize);
          setOpenSizeDrawer(false);
        }}
        productTitle={productName}
        price={price}
        imageUrl={displayImageUrl}
        category={category}
        options={sizeOptions}
        productId={id}
        selectedColor={selectedColorLocal}
        colors={colors}
        colorData={colorData}
        sizes={sizes}
      />
    </div>
  );
};

export default ProductCard;
