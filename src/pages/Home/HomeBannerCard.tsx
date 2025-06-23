import React from "react";

interface HomeBannerCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  offer: string;
  buttonText: string;
  height?: string;
}

const HomeBannerCard: React.FC<HomeBannerCardProps> = ({
  imageUrl,
  title,
  //   subtitle,
  //   offer,
  //   buttonText,
  height = "60vh",
}) => {
  return (
    <div
      className="relative rounded-md overflow-hidden shadow-md mx-2"
      style={{ height }}
    >
      <img
        src={imageUrl}
        alt={title}
        className="absolute  w-full h-full object-cover"
      />
      <div className="absolute bg-black bg-opacity-20" />
      {/* <div className="absolute flex flex-col justify-between p-4 text-white">
        <div>
          <h2 className="text-xl font-semibold text-black">{title}</h2>
          <p className="text-md text-gray-700">{subtitle}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-black">{offer}</p>
          <button className="mt-4 bg-black text-white font-semibold py-2 px-4 rounded-full shadow">
            {buttonText}
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default HomeBannerCard;
