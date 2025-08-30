// import React from "react";

const SmallHeader = () => {
  return (
    <div className="w-full h-[40px] bg-darkgreen">
      <div className="w-[90%] m-auto flex justify-between items-center">
        <h1 className="font-lato text-white text-center pt-3 text-[12px] md:text-[12px] lg:pt-2  lg:text-[16px]">
          Free Shipping Over ₹999
        </h1>
      </div>
    </div>
  );
};

export default SmallHeader;
