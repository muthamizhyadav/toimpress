import React from "react";
import FooterCourierPng from "../../assets/svg/FooterCourier.svg";

const FooterCourier: React.FC = () => {
  return (
    <div
      className="relative w-[99%] overflow-hidden px-4 sm:px-6 py-6 mr-4"
      style={{ margin: "0 auto" }}
    >
      {/* Background Image */}
      <img
        src={FooterCourierPng}
        alt="Home Banner"
        className="w-full max-w-none object-contain h-auto sm:bg-no-repeat "
        style={{
          backgroundImage: `url(${FooterCourierPng})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "top left",
          width: "100%",
          height: "auto",
          minHeight: "200px",
        }}
      />
    </div>
  );
};

export default FooterCourier;
