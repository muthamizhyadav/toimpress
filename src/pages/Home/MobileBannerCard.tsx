import React from "react";

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
  return (
    <div className="relative rounded-md overflow-hidden h-60 w-full">
      <img
        src={imageUrl}
        alt={title}
        className="absolute w-full h-full object-contain"
      />
     
    </div>
  );
};

export default MobileBannerCard;
