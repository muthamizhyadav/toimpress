import React from "react";
import HomeBannerSvg from "../../assets/svg/HomeBanner.svg";
import Logo from "../../assets/svg/Logo.svg";

const HomeBanner: React.FC = () => {
  return (
    <div
      className="relative w-[99%] overflow-hidden px-4 sm:px-6 py-6 mr-4"
      style={{ margin: "0 auto" }}
    >
      {/* Background Image */}
      <img
        src={HomeBannerSvg}
        alt="Home Banner"
        className="w-full max-w-none object-contain h-auto sm:bg-no-repeat "
        style={{
          backgroundImage: `url(${HomeBannerSvg})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "top left",
          width: "100%",
          height: "auto",
        }}
      />

      <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 text-left p-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div>
          {/* Logo */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            <img
              src={Logo}
              alt="ATO IMPRESS"
              className="h-8 md:h-10 lg:h-12 mb-2"
            />
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-4 leading-tight">
            Finding the <span className="text-green-500">Perfect Fit</span> Has{" "}
            <br /> Never Been This Simple!
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-base sm:text-lg shadow-lg transition duration-300 ease-in-out">
            Calculate Your Size
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
