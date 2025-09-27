import { Box, Button, Text, Title, rem } from "@mantine/core";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

export default function ShopBySize() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const allSizes: string[] = [
    "30B","30C","30D",
    "32A","32B","32C","32D",
    "34A","34B","34C","34D",
    "36A","36B","36C","36D",
    "38A","38B","38C","38D",
    "40A","40B","40C","40D",
    "42A","42B","42C","42D",
    "44A","44B","44C","44D",
    "S","M","L","XL","XXL",
  ];

  const handleNavigation = (size: string) => {
    navigate(`/category?size=${encodeURIComponent(size)}`);
  };

  return (
    <Box
      component="section"
      bg="#f3e7cf"
      // spacing fixed with padding-block, no negative margins
      style={{
        position: "relative",
        padding: "clamp(24px, 4vw, 60px) 16px clamp(28px, 6vw, 90px)",
        // in case previous/next sections use odd floats, prevent overlap:
        clear: "both",
      }}
    >
      <Text
        ta="center"
        fw={600}
        // friendly script-like heading without negative margins
        style={{
          fontFamily: "cursive",
          color: "#1b3611",
          fontSize: "clamp(18px, 4.5vw, 40px)",
          margin: "0 auto clamp(12px, 3vw, 24px)",
          maxWidth: "min(90vw, 900px)",
        }}
      >
        Find Your Perfect Fit
      </Text>

      <Title
        order={2}
        ta="center"
        c="dark"
        fw={600}
        style={{
          fontSize: "clamp(18px, 4.5vw, 40px)",
          margin: "0 0 clamp(8px, 2vw, 12px)",
        }}
      >
        SHOP BY BRA SIZE
      </Title>

      <Box
        px="md"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginTop: "clamp(10px, 2vw, 20px)",
        }}
      >
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(auto-fit, minmax(56px, 1fr))"
              : "repeat(10, 1fr)",
            gap: rem(isMobile ? 12 : 20),
            width: isMobile ? "100%" : "70%",
            maxWidth: isMobile ? "560px" : "1000px",
            margin: "0 auto",
          }}
        >
          {allSizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <Button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  handleNavigation(size);
                }}
                variant="filled"
                radius="70px"
                size={isMobile ? "xs" : "md"}
                styles={{
                  root: {
                    height: isMobile ? "50px" : "70px",
                    width: isMobile ? "50px" : "70px",
                    padding: 0,
                    borderRadius: "100px",
                    borderWidth: "3px",
                    borderColor: isSelected ? "#133215" : "white",
                    backgroundColor: isSelected ? "#133215" : "transparent",
                    color: isSelected ? "#ffffff" : "#000000",
                  },
                  label: { fontWeight: 600 },
                }}
              >
                {size}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
