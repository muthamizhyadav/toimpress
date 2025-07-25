import React from "react";
import FindYourFit from "../../assets/svg/FindYourFit.svg";
import { useNavigate } from "react-router-dom";

const FindYourFitt: React.FC = () => {

  const navigate = useNavigate()

  return (
    <div
      className="relative w-[99%] overflow-hidden px-4 sm:px-6 py-6 mr-4"
      style={{ margin: "0 auto" }}
      onClick={()=>{ navigate('/fit') }}
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
