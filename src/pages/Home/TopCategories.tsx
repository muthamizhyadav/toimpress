import { useEffect, useRef, useState } from "react";
import { Tabs, Button, Container } from "@mantine/core";
import BraModel from "../../assets/svg/braModel.svg";
import ProductCard from "./PorductCard";
import { useMediaQuery } from "@mantine/hooks";
import axiosInstance from "../../api/axiosInstance";
import { GET_PRODUCTS } from "../../api/api";

// ✅ Single source of truth for categories and IDs
const categoryList = [
  { name: "Bra", id: 1 },
  { name: "Elite", id: 2 },
  { name: "Panty", id: 3 },
  { name: "Combo", id: 4 },
  { name: "New Arrivals", id: 5 },
];

export default function TopCategories() {
  const [selectedTab, setSelectedTab] = useState<string | null>(categoryList[0].name); // ✅ default matches first tab
  const [products, setProducts] = useState<any[]>([]);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const getAllProducts = async (categoryName: string) => {
    const categoryId = categoryList.find((cat) => cat.name === categoryName)?.id;
    if (!categoryId) return; // prevent errors if no match found
    try {
      const response = await axiosInstance.get(
        `${GET_PRODUCTS}${categoryId}?page=1&limit=10`
      );
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (selectedTab && isMobile && tabRefs.current[selectedTab]) {
      tabRefs.current[selectedTab]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    if (selectedTab) getAllProducts(selectedTab);
  }, [selectedTab, isMobile]);

  return (
    <Container size="xl" px="sm" style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
      <p
        className={`text-[20px] md:text-[40px] text-center font-bold ${
          isMobile ? "mb-4" : "mb-8"
        }`}
      >
        Top Categories
      </p>

      <Tabs value={selectedTab} onChange={setSelectedTab}>
        {/* Scrollable Category Tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <Tabs.List className="flex-nowrap inline-flex gap-4 px-1 min-w-max tc-tab-list"  >
            <div className="w-full flex md:justify-around justify-start">
              {categoryList.map((cat) => (
                <Tabs.Tab
                  key={cat.name}
                  value={cat.name}
                  ref={(el) => (tabRefs.current[cat.name] = el)}
                  className="p-0 m-0 d-none"
                  styles={{
                    root: {
                      border: "none",
                      boxShadow: "none",
                      background: "transparent",
                      "&[data-active]": {
                        border: "none", // ensures tab itself has no border
                        boxShadow: "none",
                      },
                    },
                  }}
                >
                  {/* <Button
                    radius="xl"
                    size="lg"
                    className="border-0  "
                    styles={{
                      root: {
                        backgroundColor:
                          selectedTab === cat.name ? "#133215" : "#ffffff",
                        color:
                          selectedTab === cat.name ? "#ffffff" : "#000000",
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
                  </Button> */}
                </Tabs.Tab>
              ))}
            </div>
          </Tabs.List>
        </div>

        {/* Product List or No Products Message */}
        {categoryList.map((cat) => (
          <Tabs.Panel key={cat.name} value={cat.name} pt="md">
            {selectedTab === cat.name && products.length === 0 ? (
              <div className="text-center text-gray-600 font-semibold text-lg py-10">
                No products available
              </div>
            ) : (
              <div className="overflow-x-auto pb-4 no-scrollbar">
                <div
                  className="flex gap-4"
                  style={{
                    minWidth: isMobile ? "100%" : `${products.length * 260}px`,
                  }}
                >
                  {selectedTab === cat.name &&
                    products.map((product, i) => (
                      <div
                        key={product._id || i}
                        className="min-w-[240px] max-w-[240px] flex-shrink-0"
                      >
                        <ProductCard
                          id={product._id}
                          imageUrl={product.images?.[0] || BraModel}
                          productName={product.productTitle}
                          price={product.salePrice}
                          originalPrice={product.price}
                          rating={4.5}
                          isNew={false}
                          isOnSale={product.salePrice < product.price}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
}