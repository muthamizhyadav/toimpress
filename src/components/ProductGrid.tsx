import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Card,
  Skeleton,
  Text,
} from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import ProductCard from "../pages/Home/PorductCard";

export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  isNew?: boolean;
  discount?: number;
}

interface ProductGridProps {
  fetchProducts: (
    offset: number,
    limit: number,
    categoryId: string
  ) => Promise<Product[]>;
}

const categoryMap: Record<string, string> = {
  "1": "Brassiere",
  "2": "Panties",
  "3": "Shimmer Leggings",
  "4": "New Arrivals",
  "5": "Offers Zone",
  "6": "Combo Offer",
};

const ProductGrid: React.FC<ProductGridProps> = ({ fetchProducts }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "1";
  const category = categoryMap[id] || "Unknown";

  const [items, setItems] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 16;

  useEffect(() => {
    resetAndLoad();
  }, [id]);

  const resetAndLoad = async () => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    const newItems = await fetchProducts(0, limit, id);
    setItems(newItems);
    if (newItems.length < limit) setHasMore(false);
    setOffset(limit);
  };

  const loadMore = async () => {
    const newItems = await fetchProducts(offset, limit, id);
    setItems((prev) => [...prev, ...newItems]);
    setOffset((prev) => prev + limit);
    if (newItems.length < limit) setHasMore(false);
  };

  return (
    <div style={{ padding: isMobile ? "10px 15px" : "2rem" }}>
  <Text size="40px" fw={700} mb="lg" tt="capitalize" style={{ textAlign: "center" }}>
        {category}
      </Text>

      <InfiniteScroll
        dataLength={items.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<SkeletonGrid count={limit} isMobile={isMobile} />}
        endMessage={
          <p style={{ textAlign: "center", padding: "40px" }}>
            <b>That's all folks !</b>
          </p>
        }
      >
        <div style={{ width: isMobile ? "95%" : "70%", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(4, 1fr)",
              gap: "20px",
            }}
          >
            {items.map((item) => (
              <div key={item.id}>
                <ProductCard
                  id={item.id}
                  imageUrl={item.imageUrl}
                  productName={item.title}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  isNew={item.isNew}
                  isOnSale={item.price < item.originalPrice} rating={0}                />
              </div>
            ))}
          </div>
        </div>
      </InfiniteScroll>
    </div>
  );
};

const SkeletonGrid = ({
  count,
  isMobile,
}: {
  count: number;
  isMobile: boolean;
}) => {
  return (
    <div style={{ width: isMobile ? "95%" : "70%", margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(4, 1fr)",
          gap: "20px",
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
            <Skeleton height={isMobile ? 150 : 220} />
            <Skeleton height={20} mt="md" radius="xl" />
            <Skeleton height={16} mt={10} width="60%" radius="xl" />
            <Skeleton height={36} mt="md" radius="xl" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
