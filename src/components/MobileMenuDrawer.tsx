// MobileMenuDrawer.tsx
import { Drawer, ScrollArea, Button, Loader, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // adjust path if needed
import { API_GET_CATEGORIES } from "../api/api";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

export function UseMobileMenuDrawer() {
  const [opened, { open, close }] = useDisclosure(false);
  return { opened, open, close };
}

export function MobileMenuDrawer({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<
    Array<{ _id: string; categoryTitle: string; imageUrl?: string; active?: boolean }>
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const resp = await axiosInstance.get(API_GET_CATEGORIES);
      const payload = resp?.data ?? resp;

      let cats: any[] = [];
      if (Array.isArray(payload)) cats = payload;
      else if (payload && Array.isArray(payload.data)) cats = payload.data;
      else {
        // try to find array inside payload
        const found = Object.values(payload).find((v) => Array.isArray(v)) as any;
        if (found) cats = found;
      }

      // only active categories (safe fallback)
      setCategories(cats.filter((c) => c?.active !== false));
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      showNotification({
        title: "Error",
        message: err?.response?.data?.message || "Failed to load categories.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch when drawer mounts — you can change this to fetch only when opened if preferred
    fetchCategories();
  }, []);

  const handleNavigation = (path: string) => {
    // Ensure absolute path
    const fullPath = path.startsWith("/") ? path : `/${path}`;
    navigate(fullPath);
    onClose();
  };

  const handleCategoryNavigation = (cat: { _id: string; categoryTitle: string }) => {
    // Navigate by category name so ProductGrid's fetchProducts (which expects name) receives the name
    const encodedName = encodeURIComponent(cat.categoryTitle);
    handleNavigation(`category?name=${encodedName}`);
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      padding="md"
      size="100%"
      withCloseButton={false}
      transitionProps={{ transition: "slide-right", duration: 250 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={onClose}>
            X
          </Button>
        </div>

        <ScrollArea className="flex-grow md:hidden">
          <div className="flex flex-col gap-4 p-4 text-lg font-medium">
            {loading ? (
              <Group spacing="sm">
                <Loader size="sm" />
                <Text>Loading categories...</Text>
              </Group>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <button
                  key={cat._id}
                  className="text-left py-2"
                  onClick={() => handleCategoryNavigation(cat)}
                >
                  {cat.categoryTitle}
                </button>
              ))
            ) : (
              // fallback static menu if API returns empty
              <>
                <button onClick={() => handleNavigation("category?name=Brassiere")}>Brassiere</button>
                <button onClick={() => handleNavigation("category?name=Panties")}>Panties</button>
                <button onClick={() => handleNavigation("category?name=New%20Arrivals")}>New Arrivals</button>
                <button onClick={() => handleNavigation("category?name=Offers%20Zone")}>Offers Zone</button>
                <button onClick={() => handleNavigation("category?name=Combo")}>Combo Offer</button>
              </>
            )}

            <div className="mt-4 border-t pt-4">
              <button onClick={() => handleNavigation("/account")}>My Account</button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Drawer>
  );
}