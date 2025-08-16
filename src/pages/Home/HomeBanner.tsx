import React, { useEffect, useRef, useState } from "react";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import axiosInstance from "../../api/axiosInstance";
import { GET_HOME_BANNER } from "../../api/api";
import { useNavigate } from "react-router-dom";

interface Banner {
  _id: string;
  title: string;
  description: string;
  url: string;
  active: boolean;
}

const HomeBanner: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const emblaRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const navigate = useNavigate()

  const getAllProducts = async () => {
    try {
      const response = await axiosInstance.get(GET_HOME_BANNER);
      if (response?.data) {
        setBanners(response?.data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  const handleNavigation = (str?: string) => {
    navigate(`/${str}`);
  };


  useEffect(() => {
    if (banners.length > 0 && emblaRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners, emblaRef.current]);

  useEffect(() => {
    if (emblaRef.current) {
      emblaRef.current.scrollTo(currentSlide);
    }
  }, [currentSlide]);

  return (
  <Carousel
    withIndicators={false}
    withControls={false}
    slideSize="100%"
    slideGap={0}
    getEmblaApi={(api) => (emblaRef.current = api)}
    className={`${isMobile ? "h-[200px]" : "h-[741px]"} w-full rounded-2xl overflow-hidden`}
  // loop prop removed (not supported by Mantine Carousel)
  >
    {banners.map((banner) => (
      <Carousel.Slide
        key={banner._id}
        onClick={() => handleNavigation("category?id=1")}
      >
        <img
          src={banner.url}
          alt={banner.title}
          className="w-full h-full max-h-[741px] object-cover"
        />
      </Carousel.Slide>
    ))}
  </Carousel>

  );
};

export default HomeBanner;


 {/* <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 text-left p-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div>
          <h1 className="mb-2">
            <img
              src={Logo}
              alt="ATO IMPRESS"
              className="h-6 sm:h-8 md:h-10 lg:h-12"
            />
          </h1>
          {isMobile ? (
            <>
              <p className="text-[12px] font-semibold text-gray-800 mb-3 leading-snug" style={{  fontFamily: "cursive", }} >
                Finding the <span className="text-green-500">Perfect Fit</span>{" "}
                Has <br />
                Never Been This Simple!
              </p>

              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 !text-[12px] rounded-full shadow-lg transition duration-300 ease-in-out" onClick={()=>{navigate('/fit')}}  >
                Calculate Your Size
              </button>
            </>
          ) : (
            <>
              <p className="text-[40px] font-semibold text-gray-800 mb-4 leading-tight" style={{  fontFamily: "cursive", }} >
                Finding the <span className="text-green-500">Perfect Fit</span>{" "}
                Has <br />
                Never Been This Simple!
              </p>

              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 text-base rounded-full shadow-lg transition duration-300 ease-in-out" onClick={()=>{navigate('/fit')}}  >
                Calculate Your Size
              </button>
            </>
          )}
        </div>
      </div> */}