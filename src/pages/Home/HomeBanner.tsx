import React, { useEffect, useRef, useState, useMemo } from "react";
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
  bannerType?: "mobile" | "desktop" | string;
}

const HomeBanner: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const emblaRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const getAllBanners = async () => {
    try {
      const response = await axiosInstance.get(GET_HOME_BANNER);
      if (response?.data) {
        setBanners(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  useEffect(() => {
    getAllBanners();
  }, []);

  const visibleBanners = useMemo(() => {
    const wanted = isMobile ? "mobile" : "desktop";
    const filtered = banners.filter((b) => b.bannerType === wanted && b.active);
    if (filtered.length > 0) return filtered;
    const other = banners.filter((b) => b.bannerType !== wanted && b.active);
    if (other.length > 0) return other;
    return banners.filter((b) => b.active);
  }, [banners, isMobile]);

  // Build a category URL safely
  const makeCategoryPath = (params: Record<string, string | number>) => {
    const qs = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    return `/category?${qs}`;
  };

  // Desktop target resolver by slide index
  const desktopTargetForIndex = (index: number): string => {
    console.log(index,"index");
    
    switch (index) {
      case 0:
        return makeCategoryPath({ name: "Combo", price: 999 });
      case 1:
        return makeCategoryPath({ name: "Brassiere" });
      case 2:
        return makeCategoryPath({ name: "Offers Zone" });
      case 3:
        return makeCategoryPath({ name: "Co-Ords" });
      default:
        // Fallback for any 5th+ slides
        return makeCategoryPath({ name: "Brassiere" });
    }
  };

  const onSlideClick = (index: number) => {
    if (isMobile) {
       navigate(desktopTargetForIndex(index));
    } else {
      navigate(desktopTargetForIndex(index));
    }
  };

  useEffect(() => {
    if (visibleBanners.length === 0) {
      setCurrentSlide(0);
      return;
    }

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % visibleBanners.length);
    }, 3000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [visibleBanners]);

  useEffect(() => {
    if (emblaRef.current && typeof emblaRef.current.scrollTo === "function") {
      try {
        emblaRef.current.scrollTo(currentSlide);
      } catch {
        /* ignore */
      }
    }
  }, [currentSlide]);

  // Outer full-bleed wrapper
  const bleedStyle: React.CSSProperties = {
    position: "relative",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
    width: "100vw",
    overflow: "hidden",
  };

  // Inner container:
  const innerStyle: React.CSSProperties = isMobile
    ? {
        width: "100%",
        height: "clamp(320px, 60vh, 620px)",
        maxWidth: "100vw",
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }
    : {
        width: "clamp(479px, 100vw, 1920px)",
        aspectRatio: "1920 / 741",
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

  return (
    <div style={bleedStyle}>
      <div style={innerStyle} className="relative">
        <Carousel
          withIndicators={false}
          withControls={false}
          loop
          slideSize="100%"
          slideGap={0}
          getEmblaApi={(api) => (emblaRef.current = api)}
          className="w-full h-full"
        >
          {visibleBanners.map((banner, idx) => (
            <Carousel.Slide
              key={banner._id}
              onClick={() => onSlideClick(idx)}
              style={{
                width: "100%",
                height: "100%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={banner.url}
                alt={banner.title}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  height: "100%",
                  objectFit: isMobile ? "contain" : "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default HomeBanner;