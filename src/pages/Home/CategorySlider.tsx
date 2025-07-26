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
    return (
      <div className={` ${ isMobile && 'h-[400px]' }  my-4 px-2`}>
        <Carousel
          slideSize="70%"
          height={ isMobile ? "auto" : 200}
          slideGap="md"
          controlsOffset="sm"
          controlSize={26}
          withControls={false}
          withIndicators={false}
          styles={{
            viewport: { overflow: "hidden" },
          }}
        >
          {bannerData.map((banner, index) => (
            <Carousel.Slide key={index}>
              <MobileBannerCard {...banner} />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    );
  }

  return (
    <div className="my-8 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {bannerData.map((banner, index) => (
        <HomeBannerCard key={index} {...banner} />
      ))}
    </div>
  );
};

export default CategorySlider;
