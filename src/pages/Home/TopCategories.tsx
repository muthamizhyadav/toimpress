import { useEffect, useRef, useState } from "react";
import { Tabs, Button, Container } from "@mantine/core";
import BraModel from "../../assets/svg/braModel.svg";
import ProductCard from "./PorductCard";
import { useMediaQuery } from "@mantine/hooks";
import axiosInstance from "../../api/axiosInstance";
import { GET_PRODUCTS } from "../../api/api";

const categories = ["Brassiere", "Panties", "Shimmer Leggings"];

const categoryIdMap: Record<string, number> = {
  Brassiere: 1,
  Panties: 2,
  "Shimmer Leggings": 3,
};

export default function TopCategories() {
  const [selectedTab, setSelectedTab] = useState<string | null>("Brassiere");
  const [products, setProducts] = useState<any[]>([]);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const getAllProducts = async (categoryName: string) => {
    const categoryId = categoryIdMap[categoryName];
    try {
      const response = await axiosInstance.get(
        `${GET_PRODUCTS}${categoryId}?page=1&limit=10`
      );
      const fetchedProducts = response.data.data;
      setProducts(fetchedProducts);
    } catch (error: any) {
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

    if (selectedTab) {
      getAllProducts(selectedTab);
    }
  }, [selectedTab]);

  return (
    <Container
      size="xl"
      px="sm"
      style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
    >
     <p className={`text-[20px] md:text-[40px] text-center font-bold ${isMobile ? "mb-4" : "mb-8"}`}>
        Top Categories
      </p>

      <Tabs value={selectedTab} onChange={setSelectedTab}>
        {/* Scrollable Category Tabs */}
       <div className="overflow-x-auto no-scrollbar">
          <Tabs.List className="flex-nowrap inline-flex gap-4 px-1 min-w-max tc-tab-list">
            <div className="w-full flex md:justify-around justify-start">
              {categories.map((cat) => (
                <Tabs.Tab
                  key={cat}
                  value={cat}
                  className="p-0 m-0"
                  styles={{
                    root: {
                      border: 'none',
                      boxShadow: 'none',
                      background: 'transparent',
                      '&[data-active]': {
                        border: 'none',
                        boxShadow: 'none',
                      }
                    }
                  }}
                >
                  <Button
                    radius="xl"
                    size="lg"
                    styles={{
                      root: {
                        backgroundColor: selectedTab === cat ? "#133215" : "#ffffff",
                        color: selectedTab === cat ? "#ffffff" : "#000000",
                        fontWeight: 700,
                        paddingLeft: 32,
                        paddingRight: 32,
                        height: isMobile ? 34 : 52,
                        fontSize: isMobile ? "14px" : "18px",
                        boxShadow: "none",
                        whiteSpace: "nowrap",
                        border: "none",
                      },
                    }}
                  >
                    {cat}
                  </Button>
                </Tabs.Tab>

              ))}
            </div>
          </Tabs.List>
        </div>

        {/* Product List or No Products Message */}
        {categories.map((cat) => (
          <Tabs.Panel key={cat} value={cat} pt="md">
            {selectedTab === cat && products.length === 0 ? (
              <div className="text-center text-gray-600 font-semibold text-lg py-10">
                No products available
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div
                  className="flex gap-4"
                  style={{
                    minWidth: isMobile ? "100%" : `${products.length * 260}px`,
                  }}
                >
                  {selectedTab === cat &&
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