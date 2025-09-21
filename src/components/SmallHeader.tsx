// import React from "react";

const SmallHeader = () => {
  return (
    <div className="w-full h-[40px] bg-darkgreen">
      <div className="w-[90%] m-auto flex justify-between items-center">
        <h1 className="font-lato text-white text-center pt-3 text-[12px] md:text-[12px] lg:pt-2  lg:text-[16px]">
          Free shipping on orders over ₹999 and on UPI payments.
        </h1>
      </div>
    </div>
  );
};

export default SmallHeader;
