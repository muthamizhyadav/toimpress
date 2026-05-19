import React, { useEffect, useRef, useState, useMemo } from "react";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

interface Banner {
  _id: string;
  title: string;
  description: string;
  url: string;
  active: boolean;
  bannerType?: "mobile" | "desktop" | string;
}

interface HomeBannerProps {
  banners: Banner[];
}

const HomeBanner: React.FC<HomeBannerProps> = ({ banners }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [currentSlide, setCurrentSlide] = useState(0);
  const emblaRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const visibleBanners = useMemo(() => {
    const wanted = isMobile ? "mobile" : "desktop";
    if (banners && banners.length > 0) {
      const filtered = banners.filter(
        (b) => b.bannerType === wanted && b.active
      );
      if (filtered.length > 0) return filtered;
      const fallback = banners.filter((b) => b.active);
      return fallback;
    }
  }, [banners, isMobile]);

  const makeCategoryPath = (params: Record<string, string | number>) =>
    `/category?${new URLSearchParams(params as any).toString()}`;

  const desktopTargetForIndex = (index: number): string => {
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
        return makeCategoryPath({ name: "Brassiere" });
    }
  };

  const onSlideClick = (data: any, index: number) => {
    if (data.reDirectionUrl) {
      navigate(data.reDirectionUrl);
    } else {
      navigate(desktopTargetForIndex(index));
    }
  };

  useEffect(() => {
    if (visibleBanners && visibleBanners.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (visibleBanners) {
      intervalRef.current = window.setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % visibleBanners.length);
      }, 3000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [visibleBanners]);

  useEffect(() => {
    try {
      emblaRef.current?.scrollTo?.(currentSlide);
    } catch {}
  }, [currentSlide]);

  const bleedStyle: React.CSSProperties = {
    position: "relative",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
    width: "100vw",
    overflow: "hidden",
  };

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
          {visibleBanners &&
            visibleBanners.map((banner, idx) => (
              <Carousel.Slide
                key={banner._id}
                onClick={() => onSlideClick(banner, idx)}
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
