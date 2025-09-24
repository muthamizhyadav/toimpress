// components/ProductGrid.tsx
import React, { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import InfiniteScroll from "react-infinite-scroll-component";
import { Text } from "@mantine/core";
import ProductCard from "../pages/Home/PorductCard"; // adjust path if needed

export type Product = {
  id: string | number;
  title: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  isNew?: boolean;
  discount?: number;
};

type ProductGridProps = {
  fetchProducts: (offset: number, limit: number, categoryName: string) => Promise<Product[]>;
  categoryName: string; // mandatory — grid will re-fetch when this changes
  pageSize?: number;
};

const SkeletonGrid: React.FC<{ count: number; isMobile: boolean }> = ({ count, isMobile }) => {
  const cols = isMobile ? 2 : 4;
  const rows = Math.ceil(count / cols);
  const items = new Array(rows * cols).fill(0);

  return (
    <div style={{ width: isMobile ? "95%" : "70%", margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: 20,
        }}
      >
        {items.map((_, i) => (
          <div
            key={i}
            style={{
              height: 260,
              borderRadius: 8,
              background: "#f3f4f6",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 12,
            }}
          >
            <div style={{ height: 160, background: "#e6e7e9", borderRadius: 6 }} />
            <div style={{ height: 14, background: "#e6e7e9", width: "70%", borderRadius: 4 }} />
            <div style={{ height: 12, background: "#e6e7e9", width: "40%", borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ fetchProducts, categoryName, pageSize = 16 }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [items, setItems] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = pageSize;

  // requestId prevents stale responses from overwriting newer state
  const requestIdRef = useRef(0);

  // Reset and initial load when categoryName changes
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    setItems([]);
    setOffset(0);
    setHasMore(true);

    (async () => {
      try {
        const newItems = await fetchProducts(0, limit, categoryName || "");
        if (currentRequestId !== requestIdRef.current) return; // stale
        setItems(newItems);
        setOffset(newItems.length);
        setHasMore(newItems.length >= limit);
      } catch (err) {
        console.error("resetAndLoad error:", err);
        if (currentRequestId !== requestIdRef.current) return;
        setItems([]);
        setHasMore(false);
      }
    })();

    // cleanup not needed — next effect run increments requestIdRef, ignoring earlier responses
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]);

  const loadMore = async () => {
    const baseRequestId = ++requestIdRef.current;
    try {
      const newItems = await fetchProducts(offset, limit, categoryName || "");
      if (baseRequestId !== requestIdRef.current) return; // stale
      setItems((prev) => [...prev, ...newItems]);
      setOffset((prev) => prev + newItems.length);
      if (newItems.length < limit) setHasMore(false);
    } catch (err) {
      console.error("loadMore error:", err);
      if (baseRequestId !== requestIdRef.current) return;
      setHasMore(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? "10px 15px" : "2rem" }}>
      <Text size="40px" fw={700} align="center" mb="lg" style={{ textTransform: "capitalize" }}>
        {categoryName || "All Products"}
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
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: 20,
            }}
          >
            {items.map((item) => (
              <div key={item.id}>
                <ProductCard
                  id={item.id}
                  imageUrl={item.imageUrl}
                  productName={item.title}
                  category={categoryName}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  isNew={item.isNew}
                  isOnSale={Boolean(item.originalPrice && item.price && item.price < item.originalPrice)}
                  rating={0}
                />
              </div>
            ))}
          </div>
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default ProductGrid;