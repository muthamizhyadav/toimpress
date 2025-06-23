import React from "react";
import FindYourFit from "../../assets/svg/FindYourFit.svg";

const FindYourFitt: React.FC = () => {
  return (
    <div
      className="relative w-[99%] overflow-hidden px-4 sm:px-6 py-6 mr-4"
      style={{ margin: "0 auto" }}
    >
      <img
        src={FindYourFit}
        alt="Home Banner"
        className="w-full object-contain h-auto"
        style={{
          height: "100%",
          fontFamily: "rancho",
        }}
      />
    </div>
  );
};

export default FindYourFitt;
