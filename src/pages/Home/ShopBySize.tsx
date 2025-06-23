import { Box, Button, Text, Title, rem } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

const braSizes = Array(20).fill("30A");

export default function ShopBySize() {
  // Use media query to detect screen width
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box bg="#f3e7cf" h={"50vh"}>
      <Title
        order={2}
        c="dark"
        fw={500}
        style={{
          display: "flex",
          paddingTop: "40px",
          justifyContent: "center",
          fontSize: "40px",
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
        {!isMobile ? (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(auto-fit, minmax(60px, 1fr))"
                : "repeat(10, 1fr)",
              gap: rem(20),
              width: "70%",
              margin: "0 auto",
            }}
          >
            {braSizes.map((size, index) => (
              <Button
                key={index}
                variant="outline"
                radius="70px"
                size="md"
                color="dark"
                styles={{
                  root: {
                    height: "70px",
                    width: "70px",
                    padding: 0,
                    borderRadius: "100px",
                    borderColor: "white",
                    borderWidth: "3px",
                  },
                  label: {
                    fontWeight: 500,
                  },
                }}
              >
                {size}
              </Button>
            ))}
          </Box>
        ) : (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))", // was 70px
              gap: rem(12), // reduce gap
              width: "100%", // make it full width
              maxWidth: "500px", // optional cap
              margin: "0 auto",
            }}
          >
            {braSizes.map((size, index) => (
              <Button
                key={index}
                variant="outline"
                radius="70px"
                size={isMobile ? "xs" : "md"}
                color="dark"
                styles={{
                  root: {
                    height: isMobile ? "50px" : "70px",
                    width: isMobile ? "50px" : "70px",
                    padding: 0,
                    borderRadius: "100px",
                    borderColor: "white",
                    borderWidth: "3px",
                  },
                  label: {
                    fontWeight: 500,
                  },
                }}
              >
                {size}
              </Button>
            ))}
          </Box>
        )}

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
