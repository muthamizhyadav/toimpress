// TopCategories.tsx
import { useEffect, useRef, useState } from "react";
import { Tabs, Button, Container } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import BraModel from "../../assets/svg/braModel.svg";
import ProductCard from "./PorductCard"; // keep your path
import { useMediaQuery } from "@mantine/hooks";
import axiosInstance from "../../api/axiosInstance";
import { API_GET_CATEGORIES, API_GET_CATEGORIES_PRODUCTS } from "../../api/api";
import { IconX } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

type Category = {
  id?: number | string;
  _id?: string;
  name?: string;
  slug?: string;
  [k: string]: any;
};

export default function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const normalizeCategory = (cat: any): Category => ({
    id: cat.id ?? cat._id ?? cat.categoryId ?? cat._id_string ?? cat.slug ?? undefined,
    _id: cat._id,
    name: cat.name ?? cat.title ?? cat.label ?? cat.categoryTitle ?? "Unknown",
    slug: cat.slug,
    ...cat,
  });

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const resp = await axiosInstance.get(API_GET_CATEGORIES);
      const payload = (resp as any)?.data ?? resp;

      let found: any[] = [];
      if (Array.isArray(payload)) found = payload;
      else if (payload && Array.isArray(payload.data)) found = payload.data;
      else {
        const firstArray = Object.values(payload).find((v) => Array.isArray(v)) as any;
        if (firstArray) found = firstArray;
      }

      const normalized = found.map((c) => normalizeCategory(c));
      setCategories(normalized);
      if (normalized.length > 0) setSelectedTab(normalized[0].name ?? null);
    } catch (error: any) {
      showNotification({
        title: "Error",
        message: error?.response?.data?.message || "Failed to fetch categories.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const buildSizeOptionsFromSelectedSizes = (sizesInput: any): any[] | undefined => {
    if (!Array.isArray(sizesInput) || sizesInput.length === 0) return undefined;
    const map = new Map<number, Set<string>>();
    for (const s of sizesInput) {
      if (!s) continue;
      const str = String(s).toUpperCase().trim();
      const m = /^(\d{2})([A-Z]+)$/.exec(str);
      if (!m) continue;
      const band = Number(m[1]);
      const cup = m[2];
      if (!map.has(band)) map.set(band, new Set());
      map.get(band)!.add(cup);
    }
    const arr = Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([band, cupsSet]) => ({
        band,
        cups: Array.from(cupsSet.values()).sort(),
      }));
    return arr.length ? arr : undefined;
  };

  const getAllProducts = async (categoryName: string | null) => {
    if (!categoryName) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    try {
      const encoded = encodeURIComponent(String(categoryName));
      const response = await axiosInstance.get(
        `${API_GET_CATEGORIES_PRODUCTS}${encoded}?page=1&limit=10`
      );
      const payload = (response as any)?.data ?? response;
      const prods =
        payload?.data?.data ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
      setProducts(prods);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTab && categories.length > 0) {
      getAllProducts(selectedTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, categories]);

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedTab && tabRefs.current[selectedTab] && scrollContainerRef.current) {
      const el = tabRefs.current[selectedTab];
      const container = scrollContainerRef.current;
      if (!el || !container) return;
      const offset = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left: offset - 40, behavior: "smooth" });
    }
  }, [selectedTab, categories]);

  return (
    <Container size="xl" px="sm" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
      <p className={`text-[20px] md:text-[40px] text-center font-bold ${isMobile ? "mb-4" : "mb-8"}`}>
        Top Categories
      </p>

      <Tabs value={selectedTab} onChange={(v) => setSelectedTab(v)}>
        <div ref={scrollContainerRef} className="overflow-x-auto no-scrollbar">
          <Tabs.List className="flex-nowrap inline-flex gap-4 px-1 min-w-max tc-tab-list">
            <div className="w-full flex md:justify-around justify-start">
              {categories.map((cat) => {
                const tabValue = cat.name ?? String(cat.id ?? cat._id ?? "unknown");
                return (
                  <Tabs.Tab
                    key={tabValue}
                    value={tabValue}
                    ref={(el) => (tabRefs.current[tabValue] = el)}
                    className="p-0 m-0"
                    styles={{
                      root: {
                        border: "none",
                        boxShadow: "none",
                        background: "transparent",
                        "&[data-active]": { border: "none", boxShadow: "none" },
                      },
                    }}
                  >
                    <Button
                      radius="xl"
                      size="lg"
                      className="border-0"
                      onClick={() => setSelectedTab(tabValue)}
                      styles={{
                        root: {
                          backgroundColor: selectedTab === tabValue ? "#133215" : "#ffffff",
                          color: selectedTab === tabValue ? "#ffffff" : "#000000",
                          fontWeight: 700,
                          paddingLeft: 32,
                          paddingRight: 32,
                          height: 34,
                          fontSize: isMobile ? "14px" : "18px",
                          boxShadow: "none",
                          whiteSpace: "nowrap",
                          border: "none",
                        },
                      }}
                    >
                      {cat.name}
                    </Button>
                  </Tabs.Tab>
                );
              })}
            </div>
          </Tabs.List>
        </div>

        {categories.map((cat) => {
          const panelValue = cat.name ?? String(cat.id ?? cat._id ?? "unknown");
          return (
            <Tabs.Panel key={panelValue} value={panelValue} pt="md">
              {selectedTab === panelValue && products.length === 0 && !loadingProducts ? (
                <div className="text-center text-gray-600 font-semibold text-lg py-10">
                  No products available
                </div>
              ) : (
                <Carousel
                  slideSize="240px"
                  slideGap="md"
                  align="start"
                  withControls
                  withIndicators={false}
                  loop
                  dragFree
                  classNames={{ control: "carousel-control" }}
                  styles={{
                    control: {
                      backgroundColor: "#133215",
                      color: "white",
                      "&:hover": { backgroundColor: "#1a4d1a" },
                      transform: "translateY(-50%)",
                      top: "50%",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    },
                  }}
                  breakpoints={[
                    { maxWidth: "sm", slideSize: "80%", slideGap: "sm" },
                    { maxWidth: "md", slideSize: "33.3333%" },
                    { maxWidth: "lg", slideSize: "25%" },
                  ]}
                >
                  {selectedTab === panelValue ? (
                    loadingProducts ? (
                      <Carousel.Slide key="loading">
                        <div style={{ height: 300 }} className="flex items-center justify-center">
                          Loading...
                        </div>
                      </Carousel.Slide>
                    ) : (
                      products.map((product: any, i: number) => {
                        const sizeOptions = buildSizeOptionsFromSelectedSizes(product.selectedSizes);
                        const colors =
                          Array.isArray(product.selectedColors) && product.selectedColors.length
                            ? product.selectedColors
                            : Object.keys(product.colorData ?? {});
                        const imageUrl =
                          product.images?.[0] ||
                          (colors?.length ? product.colorData?.[colors[0]]?.images?.[0] : null) ||
                          BraModel;

                        return (
                          <Carousel.Slide key={product._id || product.id || i}>
                            <ProductCard
                              id={product._id ?? product.id}
                              imageUrl={imageUrl}
                              productName={product.productTitle ?? product.name}
                              price={product.salePrice ?? product.price}
                              originalPrice={product.price}
                              rating={4.5}
                              isNew={false}
                              isOnSale={(product.salePrice ?? product.price) < (product.price ?? 0)}
                              category={product.category}
                              sizeOptions={sizeOptions}
                              // NEW: pass color data downstream
                              colors={colors}
                              colorData={product.colorData}
                              selectedColor={colors?.[0]}
                              sizes={product.selectedSizes}                            />
                          </Carousel.Slide>
                        );
                      })
                    )
                  ) : null}
                </Carousel>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </Container>
  );
}