import { useEffect, useRef, useState } from "react";
import { Tabs, Button, Container } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
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

  
  const [selectedTab, setSelectedTab] = useState<string | null>(
    categoryList[0].name
  );
  const [products, setProducts] = useState<any[]>([]);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const getAllProducts = async (categoryName: string) => {
    const categoryId = categoryList.find(
      (cat) => cat.name === categoryName
    )?.id;
    if (!categoryId) return;
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
    if (selectedTab) getAllProducts(selectedTab);
  }, [selectedTab]);

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
const scrollContainerRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (selectedTab && tabRefs.current[selectedTab] && scrollContainerRef.current) {
    const el = tabRefs.current[selectedTab];
    const container = scrollContainerRef.current;

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Distance to scroll so the selected tab is centered
    const offset =
      el.offsetLeft -
      container.clientWidth / 2 +
      el.clientWidth / 2;

    // Add a small padding (scroll slightly more left/right)
    container.scrollTo({
      left: offset - 40, // 👈 adjust this number for how much extra space you want
      behavior: "smooth",
    });
  }
}, [selectedTab]);


  return (
    <Container
      size="xl"
      px="sm"
      style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
    >
      <p
        className={`text-[20px] md:text-[40px] text-center font-bold ${
          isMobile ? "mb-4" : "mb-8"
        }`}
      >
        Top Categories
      </p>

      <Tabs value={selectedTab} onChange={setSelectedTab}>
        {/* Category Tabs */}
       <div
  ref={scrollContainerRef}
  className="overflow-x-auto no-scrollbar"
>
  <Tabs.List className="flex-nowrap inline-flex gap-4 px-1 min-w-max tc-tab-list">
    <div className="w-full flex md:justify-around justify-start">
      {categoryList.map((cat) => (
        <Tabs.Tab
          key={cat.name}
          value={cat.name}
          ref={(el) => (tabRefs.current[cat.name] = el)}
          className="p-0 m-0"
          styles={{
            root: {
              border: "none",
              boxShadow: "none",
              background: "transparent",
              "&[data-active]": {
                border: "none",
                boxShadow: "none",
              },
            },
          }}
        >
          <Button
            radius="xl"
            size="lg"
            className="border-0"
            styles={{
              root: {
                backgroundColor:
                  selectedTab === cat.name ? "#133215" : "#ffffff",
                color: selectedTab === cat.name ? "#ffffff" : "#000000",
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
      ))}
    </div>
  </Tabs.List>
</div>


        {/* Product List with Carousel */}
        {categoryList.map((cat) => (
          <Tabs.Panel key={cat.name} value={cat.name} pt="md">
            {selectedTab === cat.name && products.length === 0 ? (
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
                classNames={{
                  control: "carousel-control", // 👈 custom class applied to both arrows
                }}
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
                {selectedTab === cat.name &&
                  products.map((product, i) => (
                    <Carousel.Slide key={product._id || i}>
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
                    </Carousel.Slide>
                  ))}
              </Carousel>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
}
