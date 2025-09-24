import { Button, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import FindYourFit from "../../assets/images/FindYourFitRevamp.png";

export default function FindYourFitt() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  return (
    <section
      aria-label="Find your fit hero"
      className="relative w-full flex items-center"
      style={{
        backgroundImage: `url(${FindYourFit})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: isMobile ? "clamp(320px, 45vh, 520px)" : "clamp(420px, 60vh, 740px)",
        margin: "15px 0",
      }}
    >
      {/* overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 40%, rgba(0,0,0,0.08) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* content */}
      <div
        className="relative z-10"
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "1.25rem" : "3rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
          transform: "translateY(-20px)", // move up slightly
        }}
      >
        <Text
          fw={700}
          style={{
            fontFamily: "cursive, system-ui, -apple-system, 'Segoe UI', Roboto",
            color: "#133215",
            fontSize: isMobile
              ? "clamp(20px, 6.5vw, 28px)"
              : "clamp(30px, 4.5vw, 48px)",
            lineHeight: 1.05,
            marginBottom: isMobile ? "12px" : "18px",
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          Find Your Perfect Fit
        </Text>

        <Button
          radius="xl"
          onClick={() => navigate("/fit")}
          size={isMobile ? "md" : "lg"}
          styles={{
            root: {
              backgroundColor: "#88B066",
              color: "#fff",
              fontWeight: 600,
              fontSize: isMobile
                ? "clamp(14px, 4.5vw, 18px)"
                : "clamp(16px, 2.6vw, 28px)",
              padding: isMobile ? "10px 20px" : "14px 36px",
              minHeight: isMobile ? 40 : 72,
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            },
            inner: {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            },
          }}
        >
          Calculate Your Size
        </Button>
      </div>
    </section>
  );
}