// PromoBanners.tsx
import { SimpleGrid, Box, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom"; // 👈 import navigate

type Banner = {
  headline: string;
  percent: string;
  tail: string;
  label: string;
};

const DARK = "#133215";
const LIGHT = "#92B775";

const cards: Banner[] = [
  { headline: "FLAT @", percent: "₹ 399", tail: "", label: "Combo" },
  { headline: "FLAT @", percent: "₹ 699", tail: "", label: "Combo" },
  { headline: "FLAT @", percent: "₹ 799", tail: "", label: "Combo" },
  { headline: "FLAT @", percent: "₹ 999", tail: "", label: "Combo" },
];

function BannerCard({ headline, percent, tail, label }: Banner) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/category?name=${label}`)} // 👈 navigate on click
      style={{
        background: DARK,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        transition: "transform .15s ease, box-shadow .15s ease",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        minHeight: 260,
        cursor: "pointer", // 👈 cursor pointer
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 10px 24px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "none";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 6px 18px rgba(0,0,0,0.15)";
      }}
    >
      {/* Top content */}
      <Stack
        gap={4}
        style={{
          padding: "32px 24px 24px",
          flex: 1,
          alignItems: "flex-start",
        }}
      >
        <Text fw={600} size="lg" style={{ color: LIGHT, letterSpacing: 1.2 }}>
          {headline}
        </Text>
        <Text
          fw={900}
          style={{
            color: "#fff",
            fontSize: 64,
            lineHeight: "56px",
          }}
        >
          {percent}
        </Text>
        <Text fw={700} size="xl" style={{ color: "#fff", letterSpacing: 1 }}>
          {tail}
        </Text>
      </Stack>

      {/* Bottom band */}
      <Box
        style={{
          background:
            "repeating-linear-gradient(135deg, rgba(146,183,117,.18) 0 12px, rgba(146,183,117,.26) 12px 24px)",
          padding: "16px 20px",
        }}
      >
        <Text
          fw={800}
          size="lg"
          style={{
            color: LIGHT,
            letterSpacing: 1.2,
          }}
        >
          {label}
        </Text>
      </Box>
    </Box>
  );
}

export default function PromoBanners() {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Box
      style={{
        width: isMobile ? "100vw" : "85vw",
        margin: "0 auto",
        padding: "15px 15px 35px 15px ",
        height: "100%"
      }}
    >
      <Text
        ta="center"
        fw={700}
        size="xl"
        style={{
          marginBottom: 28,
          letterSpacing: 1,
          color: DARK,
        }}
      >
        FALL FOR THESE FABULOUS DEALS!
      </Text>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing={{ base: 14, md: 18 }}>
        {cards.map((c) => (
          <BannerCard key={c.label} {...c} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
