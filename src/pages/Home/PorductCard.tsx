import { useMediaQuery } from "@mantine/hooks";
import React from "react";

interface ProductCardProps {
  imageUrl: string;
  productName: string;
  price: number;
  originalPrice: number;
  rating: number;
  isNew?: boolean;
  isOnSale?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  imageUrl,
  productName,
  price,
  originalPrice,
  rating,
  isNew = false,
  isOnSale = false,
}) => {

  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <div className="rounded-xl shadow p-2 bg-white h-[400px] flex flex-col w-full">
      {/* Image Section with responsive aspect ratio */}
      <div className="relative w-full aspect-[4/4] overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={productName}
          className={` ${isMobile ? `w-[250px]` : `w-full`  } h-full object-cover`}
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
        <div className="absolute top-2 right-2 z-10">
          <button className="text-gray-600">❤️</button>
        </div>
      </div>

      {/* Product Content */}
      <div className="mt-2 px-1 flex flex-col justify-between flex-grow">
        <div>
          <p className="text-sm font-medium line-clamp-2">{productName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-black font-bold text-sm">₹{price}</span>
            <span className="line-through text-gray-400 text-sm">
              ₹{originalPrice}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-yellow-500 text-sm">
            ⭐ {rating}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full mt-3 bg-[#96BD75] text-white py-2 !font-bold rounded-full flex justify-center items-center gap-2 shadow-sm">
          Add to cart
        </button>
      </div>
    </div>
  );
};


export default ProductCard;
