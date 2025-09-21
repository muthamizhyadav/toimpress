import { Grid, Card, Text, rem, Image, Box } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import Bra_Logo from "../assets/images/Bra_Logo.jpg";
import Elite_Logo from "../assets/images/Elite_Logo.jpg";
import Lingerie_Logo from "../assets/images/Lingerie_Logo.jpg";
import New_Arrivals_Logo from "../assets/images/New_Arrivals.jpg";
import Panties_Logo from "../assets/images/Panties_Logo.jpg";

type Category = { label: string; icon: string; id: string };

const categories: Category[] = [
  { id: "1", label: "BRA",          icon: Bra_Logo },
  { id: "2", label: "PANTIES",      icon: Panties_Logo },
  { id: "5", label: "COMBO",        icon: Lingerie_Logo },
  { id: "3", label: "ELITE",        icon: Elite_Logo },
  { id: "4", label: "NEW ARRIVALS", icon: New_Arrivals_Logo },
];

export default function CategoriesHomeMobile() {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Grid
      grow
      gutter="sm"
      className="px-4 py-2 my-3"
      style={{ backgroundColor: "#F3E8D3" }}
    >
      {categories.map((item) => (
        <Grid.Col span={4} key={item.label}>
          <Card
            shadow="sm"
            radius="md"
            withBorder
            onClick={() => handleNavigation(`/category?id=${item.id}`)} // 👈 Navigate on card click
            style={{
              cursor: "pointer",
              textAlign: "center",
              backgroundColor: "#F0F5F0",
              color: "#122F15",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: rem(110),
              padding: rem(8),
            }}
          >
            <Box
              w={48}
              h={48}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={48}
                height={48}
                fit="contain"
                styles={{
                  image: { objectFit: "contain" },
                }}
              />
            </Box>
            <Text size="xs" mt="xs" fw={600}>
              {item.label}
            </Text>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}