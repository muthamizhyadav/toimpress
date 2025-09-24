// MobileMenuDrawer.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  Drawer,
  ScrollArea,
  Button,
  Loader,
  Group,
  Text,
  TextInput,
  Image,
  Stack,
  Divider,
  Box,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance"; // adjust path if needed
import { API_GET_CATEGORIES, API_SEARCH_PRODUCTS } from "../api/api";
import { showNotification } from "@mantine/notifications";
import { IconX, IconSearch } from "@tabler/icons-react";

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

  // SEARCH state
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<any>(null);

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
    // fetch categories when the component mounts
    fetchCategories();
  }, []);

  const handleNavigation = (path: string) => {
    // Ensure absolute path
    const fullPath = path.startsWith("/") ? path : `/${path}`;
    navigate(fullPath);
    onClose();
  };

  const handleCategoryNavigation = (cat: { _id: string; categoryTitle: string }) => {
    const encodedName = encodeURIComponent(cat.categoryTitle);
    handleNavigation(`category?name=${encodedName}`);
  };

  // --- Search logic: debounced, abort previous ---
  useEffect(() => {
    // Clear old debounce if searchTerm emptied
    if (!searchTerm || String(searchTerm).trim().length < 2) {
      // Cancel any in-flight request
      if (searchControllerRef.current) {
        searchControllerRef.current.abort();
        searchControllerRef.current = null;
      }
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Cancel previous
      if (searchControllerRef.current) {
        try {
          searchControllerRef.current.abort();
        } catch (e) {
          // ignore
        }
        searchControllerRef.current = null;
      }

      const controller = new AbortController();
      searchControllerRef.current = controller;

      try {
        setSearchLoading(true);
        const q = encodeURIComponent(String(searchTerm).trim());
        const url = `${API_SEARCH_PRODUCTS}${q}`; // API_SEARCH_PRODUCTS expected to be base like "/products/search?q="
        const resp = await axiosInstance.get(url, { signal: controller.signal });
        const data = resp?.data ?? resp;

        // Normalise results array
        const results = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : [];

        setSearchResults(results);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          // ignore
          return;
        }
        console.error("Search request failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // do not abort here immediately (we abort before starting next request)
    };
  }, [searchTerm]);

  const handleProductClick = (p: any) => {
    const pid = p._id ?? p.id ?? String(p.product ?? "");
    setSearchResults([]);
    setSearchTerm("");
    setShowSearch(false);
    navigate(`/product?id=${pid}`);
    onClose();
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
        {/* Header row: close button + search toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Search icon toggles search input */}
            <ActionIcon
              onClick={() => {
                setShowSearch((s) => !s);
                setSearchResults([]);
                setSearchTerm("");
              }}
              aria-label="Search"
              size="lg"
              variant="light"
            >
              <IconSearch />
            </ActionIcon>

            <Button variant="outline" onClick={onClose}>
              <IconX />
            </Button>
          </div>
        </div>

        {/* Search input (full width) */}
        {showSearch && (
          <div style={{ marginBottom: 12 }}>
            <TextInput
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              size="md"
              radius="md"
              rightSection={searchLoading ? <Loader size="xs" /> : null}
            />

            {/* results list - absolutely positioned inside drawer area (keeps flow inside drawer) */}
            <Box style={{ position: "relative", marginTop: 8 }}>
              <div
                style={{
                  position: "relative",
                  background: "#fff",
                  width: "100%",
                  zIndex: 100,
                  borderRadius: 8,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                }}
              >
                <ScrollArea style={{ maxHeight: 300 }}>
                  <Stack spacing="xs" px="sm" py="xs">
                    {searchResults.length === 0 ? (
                      searchLoading ? (
                        <Group spacing="sm" style={{ padding: 12 }}>
                          <Loader size="sm" />
                          <Text>Searching...</Text>
                        </Group>
                      ) : (
                        <Text c="dimmed" size="sm" style={{ padding: 12 }}>
                          No results
                        </Text>
                      )
                    ) : (
                      searchResults.map((p: any) => {
                        const pid = p._id ?? p.id ?? String(p.product ?? "");
                        const title = p.productTitle ?? p.title ?? p.productName ?? "Product";
                        const img = (p.images && p.images[0]) || p.image || undefined;
                        return (
                          <Group
                            key={pid}
                            onClick={() => handleProductClick(p)}
                            style={{ cursor: "pointer", width: "100%", padding: "8px 4px", borderRadius: 6 }}
                            spacing="sm"
                          >
                            <Image src={img} width={56} height={56} radius="sm" alt={title} fit="cover" />
                            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                              <Text fw={700} lineClamp={1}>
                                {title}
                              </Text>
                              {p.salePrice ?? p.price ? (
                                <Text size="sm" c="dimmed">
                                  ₹{p.salePrice ?? p.price}
                                </Text>
                              ) : null}
                            </div>
                          </Group>
                        );
                      })
                    )}
                  </Stack>
                </ScrollArea>
              </div>
            </Box>
          </div>
        )}

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