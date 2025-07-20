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
      <div className="absolute inset-0 bg-black/30" />
      {/* <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm">{subtitle}</p>
        </div>
        <div>
          <p className="text-xl font-bold">{offer}</p>
          <button className="mt-2 bg-white text-black text-sm font-semibold py-1 px-3 rounded-full">
            {buttonText}
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default MobileBannerCard;
