import { Button, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import FindYourFit from "../../assets/images/FindYourFitRevamp.png";

export default function FindYourFitt() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  return (
    <div
      className="relative w-full bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: `url(${FindYourFit})`,
        backgroundSize: isMobile ? "contain" : "cover", // contain for mobile, cover desktop
        height: isMobile ? "auto" : "740px",            // auto for mobile, fixed for desktop
        minHeight: isMobile ? "300px" : undefined,     // fallback so it’s not too small
        margin: "15px 0px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center mx-auto"
        style={{
          padding: isMobile ? "2rem 1rem" : "3rem",
        }}
      >
        {/* Heading */}
        <Text
          fw={700}
          style={{
            fontFamily: "cursive",
            color: "#133215",
            fontSize: isMobile ? "28px" : "42px",
            marginBottom: "16px",
          }}
        >
          Find Your Perfect Fit
        </Text>

        {/* Button */}
        <Button
          size={isMobile ? "lg" : "xl"}
          radius="xl"
          onClick={() => navigate("/fit")}
          styles={{
            root: {
              backgroundColor: "#88B066",
              color: "#fff",
              fontWeight: 600,
              fontSize: isMobile ? "16px" : "22px",
              padding: isMobile ? "14px 28px" : "18px 40px",
            },
          }}
        >
          Calculate Your Size
        </Button>
      </div>
    </div>
  );
}