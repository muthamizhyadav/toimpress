import { Box, Button, Text, Title, rem } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export default function ShopBySize() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Get sizes from Fit Calculator slice (adjust selector if your path is different)
  const calculatorSizes = useSelector(
    (s: RootState) => (s as any)?.fit?.availableSizes as string[] | undefined
  );

  // Optional fallback sizes if calculator is empty
  const fallbackSizes = ["30A","32A","34A","36A","38A","30B","32B","34B","36B","38B","30C","32C","34C","36C","38C"];
  const sizes = useMemo(
    () => (calculatorSizes && calculatorSizes.length ? calculatorSizes : fallbackSizes),
    [calculatorSizes]
  );

  const handleNavigation = (size: string) => {
    // pass the size along so listing can pre-filter
    navigate(`/category?id=1&size=${encodeURIComponent(size)}`);
  };

  return (
    <Box
      bg="#f3e7cf"
      h={isMobile ? "auto" : "55vh"}
      style={{ paddingBottom: isMobile ? "20px" : "50px" }}
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
          {sizes.map((size) => {
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

        {/* Hint when calculator is empty */}
        {(!calculatorSizes || calculatorSizes.length === 0) && (
          <Text ta="center" c="dimmed" size="sm" mt="md">
            Tip: Use the Fit Calculator to get personalized sizes.
          </Text>
        )}
      </Box>
    </Box>
  );
}