import { Box, Button, Text, Title, rem } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

const braSizes = Array(20).fill("30A");

export default function ShopBySize() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <Box bg="#f3e7cf" h={isMobile ? "auto" : "50vh"}>
      <Title
        order={2}
        c="dark"
        fw={500}
        style={{
          display: "flex",
          paddingTop: "40px",
          justifyContent: "center",
          fontSize: isMobile ? "20px" : "40px",
          marginBottom: "40px",
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
          {braSizes.map((size, index) => {
            const isSelected = selectedSize === `${size}-${index}`; // unique key
            return (
              <Button
                key={`${size}-${index}`}
                onClick={() => setSelectedSize(`${size}-${index}`)}
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
                  label: {
                    fontWeight: 500,
                  },
                }}
              >
                {size}
              </Button>
            );
          })}
        </Box>

        <Text
          size="lg"
          fw={600}
          style={{
            fontFamily: "cursive",
            display: "flex",
            color: "#1b3611",
            width: "70%",
            margin: isMobile ? "20px 0 0 10px" : "0 auto",
            marginTop: isMobile ? "25px" : "50px",
            fontSize: isMobile ? "20px" : "40px",
          }}
        >
          Find Your Perfect Fit
        </Text>
      </Box>
    </Box>
  );
}
