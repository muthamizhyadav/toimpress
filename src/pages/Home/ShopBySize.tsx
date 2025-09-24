import { Box, Button, Text, Title, rem } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ShopBySize() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Full static list of sizes
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
    navigate(`/category?name=Brassiere&size=${encodeURIComponent(size)}`);
  };

  return (
    <Box
      bg="#f3e7cf"
      h={isMobile ? "auto" : "55vh"}
      style={{ paddingBottom: isMobile ? "20px" : "70px" }}
    >
      <Text
        size="lg"
        fw={600}
        style={{
          fontFamily: "cursive",
          display: "flex",
          color: "#1b3611",
          width: "70%",
          margin: isMobile ? "20px 0 0 10px" : "0 auto",
          paddingTop: isMobile ? "20px" : "50px",
          marginBottom: isMobile ? "20px" : "50px",
          fontSize: isMobile ? "20px" : "40px",
        }}
      >
        Find Your Perfect Fit
      </Text>

      <Title
        order={2}
        c="dark"
        fw={500}
        style={{
          display: "flex",
          paddingTop: "5px",
          justifyContent: "center",
          fontSize: isMobile ? "20px" : "40px",
          marginBottom: "5px",
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
          marginTop: "20px",
        }}
      >
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(auto-fit, minmax(60px, 1fr))"
              : "repeat(10, 1fr)",
            gap: rem(isMobile ? 12 : 20),
            width: isMobile ? "100%" : "70%",
            maxWidth: isMobile ? "500px" : undefined,
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
                  label: { fontWeight: 500 },
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