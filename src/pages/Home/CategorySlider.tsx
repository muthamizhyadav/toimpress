import React from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import HomeBannerCard from "./HomeBannerCard";
import MobileBannerCard from "./MobileBannerCard";
import BraType from "../../assets/svg/BraType.svg";

const bannerData = [
  {
    imageUrl: BraType,
    title: "Everyday Basics",
    subtitle: "Designed for comfort!",
    offer: "BUY 3 @ RS.999",
    buttonText: "SHOP NOW",
  },
  {
    imageUrl: BraType,
    title: "Nursing Bras",
    subtitle: "Perfect for New Moms",
    offer: "BUY 2 @ RS.1299",
    buttonText: "SHOP NOW",
  },
  {
    imageUrl: BraType,
    title: "Luxe Comfort",
    subtitle: "Luxury for every day",
    offer: "BUY 2 @ RS.1499",
    buttonText: "SHOP NOW",
  },
];

const CategorySlider: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    // 📱 Mobile: one card per row with 15px padding on both sides
    return (
      <div className="my-4 px-[15px] flex flex-col gap-4">
        {bannerData.map((banner, index) => (
          <MobileBannerCard key={index} {...banner} />
        ))}
      </div>
    );
  }

  // 💻 Desktop: Carousel with indicators
  return (
    <div className="my-8 px-6">
      <Carousel
        slideSize="33.33%" // 3 slides visible
        slideGap="md"
        align="start"
        height="auto"
        withIndicators
        withControls
        loop
        styles={{
          control: {
            backgroundColor: "#133215",
            color: "white",
            "&:hover": { backgroundColor: "#1a4d1a" },
          },
          indicator: {
            backgroundColor: "#ccc",
            "&[data-active]": {
              backgroundColor: "#133215",
            },
          },
        }}
      >
        {bannerData.map((banner, index) => (
          <Carousel.Slide key={index}>
            <HomeBannerCard {...banner} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  );
};

export default CategorySlider;