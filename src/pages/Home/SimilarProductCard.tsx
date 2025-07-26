import { useMediaQuery } from "@mantine/hooks";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string | number;
  imageUrl: string;
  productName: string;
  price: number;
  originalPrice: number;
  rating: number;
  isNew?: boolean;
  isOnSale?: boolean;
}

const SimilarProductCard: React.FC<ProductCardProps> = ({
  id,
  imageUrl,
  productName,
  price,
  originalPrice,
  rating,
  isNew = false,
  isOnSale = false,
}) => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [quantity, setQuantity] = useState<number>(0);
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(`/product/?id=${id}`);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 0));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
  };

  return (
    <div className={`rounded-xl shadow p-2 bg-white flex flex-col w-full ${isMobile ? 'h-[350px]' : 'h-[375px]'}`}>
      {/* Image Section */}
      <div
        className="relative w-full aspect-[4/4] overflow-hidden rounded-lg cursor-pointer"
        onClick={handleNavigation}
      >
        <img
          src={imageUrl}
          alt={productName}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/fallback.png";
          }}
          className={`object-cover ${isMobile ? "w-[250px]" : "w-full"} h-full`}
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOnSale && (
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Sale
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

      {/* Product Details */}
      <div className="mt-2 px-1 flex flex-col justify-between flex-grow gap-1">
        <div>
          <p className="text-sm font-medium line-clamp-2">{productName}</p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className="text-black font-semibold text-sm">₹{price}</span>
              <span className="line-through text-gray-400 text-sm">
                ₹{originalPrice}
              </span>
            </div>
            <span className="text-yellow-500 text-sm">⭐ {rating}</span>
          </div>
        </div>

        {/* Cart Controls */}
        {quantity === 0 ? (
          <button
            onClick={() => setQuantity(1)}
            className="w-full mt-1 bg-[#96BD75] text-white py-2 font-semibold rounded-full flex justify-center items-center shadow-sm"
          >
            Add to cart
          </button>
        ) : (
          <div className="w-full mt-1 flex items-center justify-between bg-[#96BD75] text-white rounded-full px-3 py-1 shadow-sm">
            <button onClick={handleDecrease} className="text-lg font-bold px-2">
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              className="w-10 text-center bg-transparent outline-none text-white font-semibold"
              min={1}
            />
            <button onClick={handleIncrease} className="text-lg font-bold px-2">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarProductCard;
