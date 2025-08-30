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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const getAllBanners = async () => {
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
    getAllBanners();
  }, []);

  const handleNavigation = (str?: string) => {
    navigate(`/${str}`);
  };

  // autoplay logic
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
  }, [banners]);

  useEffect(() => {
    if (emblaRef.current) {
      emblaRef.current.scrollTo(currentSlide);
    }
  }, [currentSlide]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden ${
        isMobile ? "h-[220px]" : "aspect-[16/9] max-h-[820px]"
      }`}
    >
      <Carousel
        withIndicators={false}
        withControls={false}
        loop
        slideSize="100%"
        slideGap={0}
        getEmblaApi={(api) => (emblaRef.current = api)}
        className="w-full h-full"
      >
        {banners.map((banner) => (
          <Carousel.Slide
            key={banner._id}
            onClick={() => handleNavigation("category?id=1")}
          >
            <img
              src={banner.url}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          </Carousel.Slide>
        ))}
      </Carousel>

      {/* Example overlay (optional) */}
      {/*
      <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-left p-4">
        <h1 className="mb-2">
          <img src={Logo} alt="TO IMPRESS" className="h-6 sm:h-8 md:h-10 lg:h-12" />
        </h1>
        <p
          className={`${
            isMobile ? "text-[12px]" : "text-[40px]"
          } font-semibold text-gray-800 leading-tight`}
        >
          Finding the <span className="text-green-500">Perfect Fit</span> Has Never Been This Simple!
        </p>
        <button
          className={`bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg transition duration-300 ease-in-out mt-3 ${
            isMobile ? "py-2 px-4 text-[12px]" : "py-3 px-6 text-base"
          }`}
          onClick={() => navigate("/fit")}
        >
          Calculate Your Size
        </button>
      </div>
      */}
    </div>
  );
};

export default HomeBanner;
