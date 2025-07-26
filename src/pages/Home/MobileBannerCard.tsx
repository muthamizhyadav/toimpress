import React from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

interface MobileBannerCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  offer: string;
  buttonText: string;
}

const MobileBannerCard: React.FC<MobileBannerCardProps> = ({
  imageUrl,
  title,
}) => {
  // True if screen is ≥640px (desktop/tablet)
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const navigate = useNavigate();

  const handleNavigation = (str?: string) => {
    navigate(`/${str}`);
    close(); // close drawer after navigation
  };

  

  return (
    <div
      className={`relative rounded-md overflow-hidden w-full ${
        isDesktop ? "h-60" : "h-[400px]"
      }`}
      onClick={() => handleNavigation("category?id=1")}
    >
      <img
        src={imageUrl}
        alt={title}
        className="absolute w-full h-full object-contain"
      />
    </div>
  );
};

export default MobileBannerCard;