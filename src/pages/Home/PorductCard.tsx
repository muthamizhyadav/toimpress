// components/ProductCard.tsx
import { useMediaQuery } from "@mantine/hooks";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/features/cartSlice";
import SizeSelectorDrawer from "../../components/SizeSelectorDrawer";

interface ProductCardProps {
  id: string | number;
  imageUrl: string;
  productName: string;
  price: number;
  originalPrice: number;
  rating: number;
  isNew?: boolean;
  isOnSale?: boolean;
  sizeOptions?: Parameters<typeof SizeSelectorDrawer>[0]["options"];
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  imageUrl,
  productName,
  price,
  originalPrice,
  rating,
  isNew = false,
  isOnSale = false,
  sizeOptions,
}) => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector((state: any) =>
    state?.cart?.items?.filter((i: any) => i.id === id)
  );
  const qty = items.reduce((sum: number, it: any) => sum + (it.qty ?? 0), 0);

  const [openSizeDrawer, setOpenSizeDrawer] = useState(false);

  const handleNavigation = () => navigate(`/product/?id=${id}`);

  const handleConfirmSize = (sel: { band: number; cup: string; label: string }) => {
    dispatch(
      addToCart({
        id,
        imageUrl,
        title: productName,
        productName,
        price,
        originalPrice,
        rating,
        qty: 1,
        size: sel.label,
        silent: true,
      })
    );
    setOpenSizeDrawer(false);
  };

  return (
    <div className="rounded-xl shadow p-2 bg-white flex flex-col w-full">
      {/* Image */}
      <div
        className="relative w-full aspect-[4/4] overflow-hidden rounded-lg"
        onClick={handleNavigation}
      >
        <img
          src={imageUrl}
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

      {/* Content */}
      <div className="mt-1 px-1 flex flex-col justify-between flex-grow gap-1">
        <div>
          <p className="text-sm md:text-base line-clamp-2 font-medium">{productName}</p>
          <div className="flex mt-1 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-black font-bold text-sm md:text-base">₹{price}</span>
              <span className="line-through text-gray-400 font-bold text-sm md:text-base">
                ₹{originalPrice}
              </span>
              <span className="text-[#96BD75] font-bold !text-[12px]">
                (SAVE {Math.round(((originalPrice - price) / originalPrice) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {qty === 0 ? (
          <button
            onClick={() => setOpenSizeDrawer(true)}
            className="w-full bg-[#96BD75] text-white py-2 font-bold rounded-full flex justify-center items-center gap-2 shadow-sm mb-2"
          >
            Add to cart
          </button>
        ) : (
          <div className="w-full flex items-center justify-between bg-[#96BD75] text-white rounded-full px-2 py-2 shadow-sm mb-2">
            <button
              onClick={() =>
                dispatch(
                  removeFromCart({
                    id,
                    size: items[items.length - 1]?.size, // remove last added variant
                    silent: true,
                  })
                )
              }
              className="text-xl font-bold px-2"
            >
              −
            </button>
            <input
              type="number"
              value={qty}
              readOnly
              className="w-10 text-center bg-transparent outline-none text-white font-semibold"
            />
            <button
              onClick={() => setOpenSizeDrawer(true)}
              className="text-xl font-bold px-2"
            >
              +
            </button>
          </div>
        )}
      </div>

      <SizeSelectorDrawer
        opened={openSizeDrawer}
        onClose={() => setOpenSizeDrawer(false)}
        onConfirm={handleConfirmSize}
        productTitle={productName}
        price={price}
        imageUrl={imageUrl}
        options={sizeOptions}
      />
    </div>
  );
};

export default ProductCard;