import React from "react";
import HomeBannerSvg from "../../assets/svg/HomeBanner.svg";
import Logo from "../../assets/svg/Logo.svg";
import { useMediaQuery } from "@mantine/hooks";

const HomeBanner: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className="relative w-[99%] overflow-hidden px-2 sm:px-2 py-2 mr-4"
      style={{ margin: "0 auto" }}
    >
      {/* Background Image */}
      <img
        src={HomeBannerSvg}
        alt="Home Banner"
        className="w-full max-w-none object-contain h-auto sm:bg-no-repeat"
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
          <h1 className="mb-2">
            <img
              src={Logo}
              alt="ATO IMPRESS"
              className="h-6 sm:h-8 md:h-10 lg:h-12"
            />
          </h1>
          {isMobile ? (
            <>
              {/* Mobile Text */}
              <p className="text-[12px] font-semibold text-gray-800 mb-3 leading-snug" style={{  fontFamily: "cursive", }} >
                Finding the <span className="text-green-500">Perfect Fit</span>{" "}
                Has <br />
                Never Been This Simple!
              </p>

              {/* Mobile Button */}
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 !text-[12px] rounded-full shadow-lg transition duration-300 ease-in-out">
                Calculate Your Size
              </button>
            </>
          ) : (
            <>
              {/* Desktop Text */}
              <p className="text-[40px] font-semibold text-gray-800 mb-4 leading-tight" style={{  fontFamily: "cursive", }} >
                Finding the <span className="text-green-500">Perfect Fit</span>{" "}
                Has <br />
                Never Been This Simple!
              </p>

              {/* Desktop Button */}
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 text-base rounded-full shadow-lg transition duration-300 ease-in-out">
                Calculate Your Size
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
