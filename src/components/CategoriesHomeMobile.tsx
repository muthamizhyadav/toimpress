// CategoriesHomeMobile.tsx
import { Grid, Card, Text, rem, Image, Box } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { API_GET_CATEGORIES } from "../api/api";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

// local icons
import Bra_Logo from "../assets/images/Bra_thumbnail.jpeg";
import Combo_Logo from "../assets/images/Combo_thumbnail.jpeg";
import Offerzone_Logo from "../assets/images/Offerzone_thumbnail.jpeg";
import New_Arrivals_Logo from "../assets/images/New_Arrivals_thumbnail.jpeg";
import Panties_Logo from "../assets/images/Panties_thumbnail.jpeg";

// default/fallback icon
const Default_Logo = Bra_Logo;

type CategoryFromApi = {
  id?: string | number;
  _id?: string;
  name?: string;
  title?: string;
  label?: string;
  categoryTitle?: string;
  [k: string]: any;
};

type Category = { id: string; label: string; icon: string; name: string };

// keep a local mapping for icons — keys are normalized to lowercase
const ICON_MAP: Record<string, string> = {
  brassiere: Bra_Logo,
  panties: Panties_Logo,
  combo: Combo_Logo,
  "new arrivals": New_Arrivals_Logo,
  "offers zone": Offerzone_Logo,
};

const hardcodedCategories: Category[] = [
  { id: "1", label: "bra", icon: Bra_Logo, name: "Bra" },
  { id: "5", label: "combo", icon: Combo_Logo, name: "Combo" },
  { id: "2", label: "panties", icon: Panties_Logo, name: "Panties" },
  { id: "4", label: "new arrivals", icon: New_Arrivals_Logo, name: "New Arrivals" },
  { id: "3", label: "offers zone", icon: Offerzone_Logo, name: "Offer Zone" },
];

function normalizeLabel(raw?: string) {
  if (!raw) return "";
  return String(raw).trim().toLowerCase();
}

function pickIconForLabel(label?: string) {
  console.log(label)
  const key = normalizeLabel(label);
  return ICON_MAP[key] ?? Default_Logo;
}

export default function CategoriesHomeMobile() {
  const navigate = useNavigate();
  const [loadedCategories, setLoadedCategories] =
    useState<Category[]>(hardcodedCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const resp = await axiosInstance.get(API_GET_CATEGORIES);
        const payload = (resp as any)?.data ?? resp;

        let found: any[] = [];

        if (Array.isArray(payload)) {
          found = payload;
        } else if (payload && Array.isArray((payload as any).data)) {
          found = payload.data;
        } else {
          const arr = Object.values(payload).find((v) => Array.isArray(v)) as any;
          if (arr) found = arr;
        }

        if (!found || found.length === 0) {
          setLoading(false);
          return;
        }

        const mapped: Category[] = found.map((c: CategoryFromApi) => {
          const rawLabel =
            c.name ?? c.title ?? c.label ?? (c._id ? String(c._id) : "");
          const label = normalizeLabel(rawLabel) || "unknown";
          const id = String(c.id ?? c._id ?? c.categoryId ?? label);
          const icon = pickIconForLabel(c.categoryTitle);
          const name = c.categoryTitle ?? rawLabel ?? "Unknown";
          return { id, label, icon, name };
        });

        if (mounted && mapped.length > 0) {
          setLoadedCategories(mapped);
        }
      } catch (error: any) {
        console.error("Failed to fetch categories", error);
        showNotification({
          title: "Error",
          message: error?.response?.data?.message || "Failed to fetch categories.",
          color: "red",
          icon: <IconX size={16} />,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const handleNavigation = (category: Category) => {
    navigate(`/category?name=${encodeURIComponent(category.name)}`);
  };

  return (
    <Grid
      grow
      gutter="sm"
      className="px-4 py-2 my-3"
      style={{ backgroundColor: "#F3E8D3" }}
    >
      {loadedCategories.map((item) => (
        <Grid.Col span={4} key={item.id}>
          <Card
            shadow="sm"
            radius="md"
            withBorder
            onClick={() => handleNavigation(item)}
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
                alt={item.name}
                width={48}
                height={48}
                fit="contain"
                loading="lazy"        // 👈 native lazy-load
                decoding="async"      // 👈 decode off main thread when possible
                styles={{
                  image: { objectFit: "contain" },
                }}
              />
              </Box>
            <Text size="xs" mt="xs" fw={600}>
              {item.name}
            </Text>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}