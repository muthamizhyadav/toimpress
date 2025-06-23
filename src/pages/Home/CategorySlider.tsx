import React from "react";
import HomeBannerCard from "./HomeBannerCard";
import BraType from "../../assets/svg/BraType.svg";

// Example static banner data (replace image URLs accordingly)
const bannerData = [
  {
    imageUrl: BraType, // Replace with actual paths
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
    title: "Everyday Basics",
    subtitle: "Designed for comfort!",
    offer: "BUY 3 @ RS.999",
    buttonText: "SHOP NOW",
  },
];

const CategorySlider: React.FC = () => {
  return (
    <div className="my-8 px-6  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bannerData.map((banner, index) => (
        <HomeBannerCard key={index} {...banner} />
      ))}
    </div>
  );
};

export default CategorySlider;
