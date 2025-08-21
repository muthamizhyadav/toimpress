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

const ProductCard: React.FC<ProductCardProps> = ({
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

  const updateLocalStorage = (newQty: number) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = cart.findIndex((item: any) => item.id === id);
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity = newQty;
      if (newQty === 0) {
        cart.splice(existingItemIndex, 1); // remove
      }
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  const handleDecrease = () => {
    const newQty = quantity > 1 ? quantity - 1 : 0;
    setQuantity(newQty);
    updateLocalStorage(newQty);
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    updateLocalStorage(newQty);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
  };

  const handleNavigation = () => {
    navigate(`/product/?id=${id}`);
  };

  console.log(id, "product_id");

  return (
    <div
      className={`rounded-xl shadow p-2 bg-white flex flex-col w-full  `}
    >
      {/* Image Section */}
      <div
        className="relative w-full aspect-[4/4] overflow-hidden rounded-lg"
        onClick={() => {
          handleNavigation();
        }}
      >
        <img
          src={imageUrl}
          alt={productName}
          className={`${isMobile ? `w-[250px]` : `w-full`} h-full object-cover`}
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
        {/* <div className="absolute top-2 right-2 z-10">
          <button className="text-gray-600">❤️</button>
        </div> */}
      </div>

      {/* Product Content */}
      <div className="mt-1 px-1 flex flex-col justify-between flex-grow gap-1">
       <div>
        <p className="text-sm md:text-base line-clamp-2 font-medium">{productName}</p>
        <div className="flex mt-1 mb-1">
          <div className="flex items-center gap-1">
            <span className="text-black font-bold text-sm md:text-base">₹{price}</span>
            <span className="line-through text-gray-400 font-bold text-sm md:text-base">
              ₹{originalPrice}
            </span>
            <span className="md:text-base text-[#96BD75] font-bold !text-[12px]">
              (SAVE {Math.round(((originalPrice - price) / originalPrice) * 100)}%)
            </span>
          </div>
          {/* <div className="flex items-center text-yellow-500 text-sm ml-auto">
            ⭐ {rating}
          </div> */}
        </div>
      </div>
        {/* Add to Cart OR Quantity Controller */}
        {quantity === 0 ? (
          <button
            onClick={() => {
              setQuantity(1);
              const cart = JSON.parse(localStorage.getItem("cart") || "[]");
              const existingItemIndex = cart.findIndex(
                (item: any) => item.id === id
              );

              if (existingItemIndex >= 0) {
                cart[existingItemIndex].quantity += 1;
              } else {
                cart.push({
                  id,
                  imageUrl,
                  productName,
                  price,
                  originalPrice,
                  rating,
                  quantity: 1,
                });
              }

              localStorage.setItem("cart", JSON.stringify(cart));
            }}
            className="w-full bg-[#96BD75] text-white py-2 font-bold rounded-full flex justify-center items-center gap-2 shadow-sm mb-2"
          >
            Add to cart
          </button>
        ) : (
          <div className="w-full flex items-center justify-between bg-[#96BD75] text-white rounded-full px-2 py-2 shadow-sm mb-2 ">
            <button onClick={handleDecrease} className="text-xl font-bold px-2">
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              className="w-10 text-center bg-transparent outline-none text-white font-semibold"
              min={1}
            />
            <button onClick={handleIncrease} className="text-xl font-bold px-2">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
