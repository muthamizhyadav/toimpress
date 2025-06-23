import { useEffect, useState } from "react";
import { Tabs, Button, Text, Container } from "@mantine/core";
import BraModel from "../../assets/svg/braModel.svg";
import ProductCard from "./PorductCard";
import { SimpleGrid } from "@mantine/core";

const categories = ["Brassiere", "Panties", "Shimmer Leggings"];

const products = new Array(4).fill({
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

  useEffect(() => {
    console.log(selectedTab);
  }, [selectedTab]);

  return (
    <Container
      size="xl"
      px="md"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <Text
        ta="center"
        size="3xl"
        fw={700}
        mb="xl"
        style={{ fontSize: "40px", marginBottom: "2rem" }}
      >
        Top Categories
      </Text>

      <Tabs
        value={selectedTab}
        onChange={setSelectedTab}
        style={{ width: "100%" }}
      >
        <Tabs.List justify="center" className="!bg-transparent mb-6">
          {categories.map((cat) => (
            <Tabs.Tab
              key={cat}
              value={cat}
              className="rounded-full font-semibold px-4 py-2 transition-all duration-300 mx-2"
            >
              <Button
                radius="xl"
                size="lg"
                styles={{
                  root: {
                    backgroundColor:
                      selectedTab === cat ? "#133215" : "#ffffff",
                    color: selectedTab === cat ? "#ffffff" : "#000000",
                    fontWeight: 700,
                    paddingLeft: 40,
                    paddingRight: 40,
                    height: 60,
                    fontSize: 20,
                    border:
                      selectedTab === cat
                        ? "2px solid #2196f3"
                        : "1px solid #ccc",
                    boxShadow: "none",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                BraModel
                {cat}
              </Button>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {categories.map((cat) => (
          <Tabs.Panel key={cat} value={cat} pt="md">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {products.map((product, i) => (
                <ProductCard
                  key={i}
                  imageUrl={BraModel}
                  productName={product.title}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  rating={product.rating}
                  isNew={product.isNew}
                  isOnSale={product.isSale}
                />
              ))}
            </SimpleGrid>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
}
