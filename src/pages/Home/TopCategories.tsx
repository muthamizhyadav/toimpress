import { useEffect, useState } from "react";
import { Tabs, Button, Container } from "@mantine/core";
import BraModel from "../../assets/svg/braModel.svg";
import ProductCard from "./PorductCard";
import { useMediaQuery } from "@mantine/hooks";

const categories = ["Brassiere", "Panties", "Shimmer Leggings"];

const products = new Array(10).fill({
  title: "Susie Multicolor Secret Side...",
  price: 999,
  originalPrice: 1999,
  discount: 26,
  rating: 4.5,
  image: "/bra.jpg",
  isNew: true,
  isSale: true,
});

export default function TopCategories() {
  const [selectedTab, setSelectedTab] = useState<string | null>("Brassiere");
  const isMobile = useMediaQuery("(max-width: 760px)");

  useEffect(() => {
    console.log(selectedTab);
  }, [selectedTab]);

  return (
    <Container
      size="xl"
      px="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <p className="text-[20px] md:text-[40px] text-center font-bold mb-8">
        Top Categories
      </p>

      <Tabs value={selectedTab} onChange={setSelectedTab}>
        {/* Scrollable Category Tabs */}
        <div className="overflow-x-auto no-scrollbar mb-6">
          <Tabs.List
            className="flex-nowrap inline-flex gap-4 px-1 min-w-max no-scrollbar"
            style={{
              // Mobile view: align left
              ["--tabs-justify"]: "start",
            }}
          >
            <div className="w-full flex md:justify-around justify-start">
              {categories.map((cat) => (
                <Tabs.Tab key={cat} value={cat} className="p-0 m-0 border-none">

                { isMobile ? 

                  <Button
                    radius="xl"
                    size="lg"
                    styles={{
                      root: {
                        backgroundColor:
                          selectedTab === cat ? "#133215" : "#ffffff",
                        color: selectedTab === cat ? "#ffffff" : "#000000",
                        fontWeight: 700,
                        paddingLeft: 32,
                        paddingRight: 32,
                        height: 34,
                        fontSize: "14px", 
                        border:
                          selectedTab === cat
                            ? "2px solid #2196f3"
                            : "1px solid #ccc",
                        boxShadow: "none",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    {cat}
                  </Button>

                  :

                  <Button
                    radius="xl"
                    size="lg"
                    styles={{
                      root: {
                        backgroundColor:
                          selectedTab === cat ? "#133215" : "#ffffff",
                        color: selectedTab === cat ? "#ffffff" : "#000000",
                        fontWeight: 700,
                        paddingLeft: 32,
                        paddingRight: 32,
                        height: 52,
                        fontSize: "18px", // Desktop default
                        border:
                          selectedTab === cat
                            ? "2px solid #2196f3"
                            : "1px solid #ccc",
                        boxShadow: "none",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    {cat}
                  </Button>

                  }

                </Tabs.Tab>
              ))}
            </div>
          </Tabs.List>
        </div>

        {/* Scrollable Product List */}
        {categories.map((cat) => (
          <Tabs.Panel key={cat} value={cat} pt="md">
            <div className="overflow-x-auto no-scrollbar pb-4">
              <div className="flex gap-4 min-w-max">
                {products.map((product, i) => (
                  <div key={i} className="min-w-[250px] h-full flex flex-col">
                    <ProductCard
                      imageUrl={BraModel}
                      productName={product.title}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      rating={product.rating}
                      isNew={product.isNew}
                      isOnSale={product.isSale}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
}
