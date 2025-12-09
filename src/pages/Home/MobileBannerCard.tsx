import React from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

interface MobileBannerCardProps {
  url: string;
  title: string;
  subtitle: string;
  offer: string;
  buttonText: string;
}

const MobileBannerCard: React.FC<any> = ({
  url,
  title,
  reDirectionUrl,
}) => {
  // True if screen is ≥640px (desktop/tablet)
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const navigate = useNavigate();

  const handleNavigation = (str?: string) => {
    navigate(`${reDirectionUrl}`);
    close();
  };

  return (
    <div
      className={`relative rounded-md overflow-hidden w-full ${
        isDesktop ? "h-60" : "h-[500px]"
      }`}
      onClick={() => handleNavigation("category?name=Brassiere")}
    >
      <img
        src={url}
        alt={title}
        className={`absolute w-full h-full ${
          isDesktop ? "object-contain" : "object-inherit"
        }`}
      />
    </div>
  );
};

export default MobileBannerCard;
