import {
  Burger,
  ScrollArea,
  Text,
  Group,
  Divider,
  ActionIcon,
  TextInput,
  Box,
  Loader,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { MobileMenuDrawer, UseMobileMenuDrawer } from "./MobileMenuDrawer";
import { useAuth } from "../assets/hooks/useAuth";
import { IconUserFilled, IconX, IconSearch } from "@tabler/icons-react";
import axiosInstance from "../api/axiosInstance";
import { API_GET_CATEGORIES, API_SEARCH_PRODUCTS } from "../api/api";
import { showNotification } from "@mantine/notifications";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const menu = UseMobileMenuDrawer();

  // ✅ Redux cart count
  const cartItems = useSelector((state: any) => state.cart.items);
  const cartCount = cartItems.reduce(
    (sum: any, item: { qty: any }) => sum + item.qty,
    0
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [categories, setCategories] = useState<
    Array<{
      _id: string;
      categoryTitle: string;
      imageUrl?: string;
      active?: boolean;
    }>
  >([]);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<any>(null);

  const isSelected = (id: string | null) =>
    selectedId === id ? "font-bold underline text-[#122F15]" : "text-[#252C32]";

  const handleNavigation = (str?: string) => {
    navigate(`/${str ?? ""}`);
    menu.close();
    setSearchPanelOpen(false);
  };

  // ---------------- FETCH CATEGORIES ----------------
  const getCategories = async () => {
    try {
      const resp = await axiosInstance.get(API_GET_CATEGORIES);
      const payload = resp?.data ?? resp;
      if (Array.isArray(payload)) setCategories(payload);
      else if (payload && Array.isArray(payload.data))
        setCategories(payload.data);
      else {
        const foundArray = Object.values(payload).find((v) =>
          Array.isArray(v)
        ) as any;
        if (foundArray) setCategories(foundArray);
      }
    } catch (error: any) {
      showNotification({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to fetch categories.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  // ---------------- SEARCH PANEL LOGIC ----------------
  useEffect(() => {
    if (
      !searchPanelOpen ||
      !searchTerm ||
      String(searchTerm).trim().length < 2
    ) {
      setSearchResults([]);
      setSearchLoading(false);
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (controllerRef.current) controllerRef.current.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        setSearchLoading(true);
        const q = encodeURIComponent(String(searchTerm).trim());
        const url = `${API_SEARCH_PRODUCTS}${q}`;
        const resp = await axiosInstance.get(url, {
          signal: controller.signal,
        });
        const data = resp?.data ?? resp;

        let results: any[] = [];
        if (Array.isArray(data)) results = data;
        else if (Array.isArray(data.data)) results = data.data;
        else if (Array.isArray(data.items)) results = data.items;

        setSearchResults(results);
      } catch (err: any) {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          console.error("Search failed:", err);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [searchTerm, searchPanelOpen]);

  const handleProductClick = (p: any) => {
    const pid = p._id ?? p.id ?? String(p.product ?? "");
    setSearchPanelOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    navigate(`/product?id=${pid}`);
  };

  // ---------------- RENDER ----------------
  return (
    <>
      <header className="bg-sandle w-full h-[80px] md:h-[112px] flex items-center px-10 sm:px-12 md:px-14 lg:px-14 relative z-50">
        <img
          src="/logo.png"
          alt="Logo"
          className="md:w-[106px] md:h-[65px] w-[80px] h-[50px] cursor-pointer"
          onClick={() => handleNavigation("")}
        />

        {/* ------------ MOBILE VIEW ------------ */}
        {isMobile && (
          <div className="ml-auto flex items-center">
            {/* Search Icon */}
            <div style={{ marginRight: 12 }}>
              <ActionIcon
                variant="transparent"
                size="lg"
                color="black"
                onClick={() => {
                  setSearchPanelOpen((s) => !s);
                  if (searchPanelOpen) {
                    setSearchTerm("");
                    setSearchResults([]);
                  }
                }}
              >
                <IconSearch size={22} />
              </ActionIcon>
            </div>

            {/* CART ICON (mobile) */}
            <div
              className="relative mr-4 cursor-pointer"
              onClick={() => navigate("/checkout")}
            >
              <ShoppingCart size={24} color="#122F15" />
              {cartCount > 0 && (
                <span className="absolute -top-5 -right-1 bg-[#8BB06E] text-white text-[10px] px-1.5 py-[2px] rounded-full pt-1.5">
                  {cartCount}
                </span>
              )}
            </div>

            <Burger
              opened={menu.opened}
              onClick={menu.open}
              aria-label="Open menu"
            />
          </div>
        )}

        {/* ------------ DESKTOP VIEW ------------ */}
        <div className="hidden lg:flex ml-5 flex-col gap-5 w-full md:flex">
          <div className="hidden lg:flex md:flex w-full">
            {/* Search Bar */}
            <div className="hidden md:flex w-full">
              <input
                type="search"
                placeholder="Search products here"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!searchPanelOpen) setSearchPanelOpen(true);
                }}
                className="lg:w-[100%] h-[40px] rounded-full bg-white pl-3"
              />
              <button className="bg-lightgreen h-[40px] ml-[-30px] cursor-pointer rounded-3xl px-5 z-50">
                <IconSearch size={18} color="white" />
              </button>
            </div>

            {/* Right Section (Orders, Cart, Account) */}
            <div className="hidden md:flex w-full justify-end">
              <div className="hidden lg:flex lg:w-[75%] justify-around items-center">
                <div
                  className="flex cursor-pointer"
                  onClick={() => handleNavigation("orders")}
                >
                  <span className="ml-2 text-[#252C32]">Orders</span>
                </div>

                {/* DESKTOP CART ICON */}
                <div
                  className="relative flex cursor-pointer"
                  onClick={() => navigate("/checkout")}
                >
                  <ShoppingCart size={24} className="text-[#252C32] ml-2" />

                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#8BB06E] text-white text-[10px] px-1.5 py-[1px] rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>

                {isAuthenticated ? (
                  <div onClick={() => handleNavigation("account")}>
                    <IconUserFilled />
                  </div>
                ) : (
                  <button
                    className="bg-lightgreen h-[40px] cursor-pointer text-white ml-[-30px] rounded-3xl px-5 z-50"
                    onClick={() => handleNavigation("account")}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories Menu */}
          <div className="hidden md:flex gap-5 w-full">
            <ul className="flex justify-center gap-10">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li
                    key={cat._id}
                    className={`text-sm cursor-pointer ${isSelected(cat._id)}`}
                    onClick={() =>
                      handleNavigation(`category?name=${cat.categoryTitle}`)
                    }
                  >
                    {cat.categoryTitle}
                  </li>
                ))
              ) : (
                <>loading</>
              )}
            </ul>
          </div>
        </div>
      </header>

      {/* ------------ SEARCH PANEL ------------ */}
      {searchPanelOpen && (
        <Box
          // @ts-ignore
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: isMobile ? "80px" : "100px",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          <Box
            // @ts-ignore
            sx={{
              width: isMobile
                ? "min(640px, calc(100% - 32px))"
                : "min(900px, calc(100% - 32px))",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <TextInput
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                radius="md"
                style={{ flex: 1 }}
                rightSection={searchLoading ? <Loader size="xs" /> : null}
                autoFocus={isMobile}
              />

              <ActionIcon
                onClick={() => {
                  setSearchPanelOpen(false);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
              >
                <IconX />
              </ActionIcon>
            </div>

            <Divider />

            <div
              style={{
                position: "absolute",
                zIndex: 100,
                left: 0,
                right: 0,
                top: "160px",
                display: "flex",
                justifyContent: "center",
                pointerEvents: "auto",
                width: "100vw",
              }}
            >
              <div
                style={{
                  width: "100vw",
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Text fw={700}>Search results</Text>
                </div>

                <ScrollArea style={{ height: 400 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: 8,
                    }}
                  >
                    {searchLoading ? (
                      <Group style={{ padding: 12 }}>
                        <Loader size="sm" />
                        <Text>Searching...</Text>
                      </Group>
                    ) : searchResults.length === 0 ? (
                      <Text c="dimmed" style={{ padding: 12 }}>
                        No results
                      </Text>
                    ) : (
                      searchResults.map((p: any) => {
                        const pid = p._id ?? p.id ?? String(p.product ?? "");
                        const title =
                          p.productTitle ??
                          p.title ??
                          p.productName ??
                          "Product";
                        const img =
                          (p.images && p.images[0]) || p.image || undefined;

                        return (
                          <div
                            key={pid}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleProductClick(p)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                handleProductClick(p);
                            }}
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                              padding: 10,
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                            className="hover:bg-gray-50"
                          >
                            <div
                              style={{
                                width: 96,
                                height: 96,
                                flexShrink: 0,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#f6f6f6",
                              }}
                            >
                              {img ? (
                                <img
                                  src={img}
                                  alt={title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#999",
                                  }}
                                >
                                  No image
                                </div>
                              )}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <Text fw={700} lineClamp={2}>
                                {title}
                              </Text>

                              {p.salePrice ?? p.price ? (
                                <Text size="sm" c="dimmed">
                                  ₹{p.salePrice ?? p.price}
                                </Text>
                              ) : null}

                              {p.category && (
                                <Text size="xs" c="dimmed">
                                  {p.category}
                                </Text>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </Box>
        </Box>
      )}

      <MobileMenuDrawer opened={menu.opened} onClose={menu.close} />
    </>
  );
}
