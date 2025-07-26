import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Card,
  Image,
  Text,
  Button,
  Badge,
  Skeleton,
  Group,
} from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";

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
      <Text size="40px" fw={700} align="center" mb="lg" tt="capitalize">
        {category}
      </Text>

      <InfiniteScroll
        dataLength={items.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<SkeletonGrid count={limit} isMobile={isMobile} />}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>You have seen it all!</b>
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
            {items.map((item) =>
              isMobile ? (
                <MobileProductCard key={item.id} item={item} />
              ) : (
                <DesktopProductCard key={item.id} item={item} />
              )
            )}
          </div>
        </div>
      </InfiniteScroll>
    </div>
  );
};

const DesktopProductCard = ({ item }: { item: Product }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={item.imageUrl} height={220} alt={item.title} />
      </Card.Section>

      <Group position="apart" mb="xs">
        <Text weight={500} size="sm" lineClamp={2}>
          {item.title}
        </Text>
        {item.isNew && (
          <Badge color="blue" variant="light">
            New
          </Badge>
        )}
      </Group>

      <Text size="sm">
        ₹{item.price}{" "}
        <Text span td="line-through" c="dimmed" size="xs">
          ₹{item.originalPrice}
        </Text>
      </Text>

      <Button fullWidth color="#8BB06E" radius="xl">
        Add to cart
      </Button>
    </Card>
  );
};

const MobileProductCard = ({ item }: { item: Product }) => {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Card.Section>
        <Image src={item.imageUrl} height={150} alt={item.title} />
      </Card.Section>

      <Text weight={600} size="sm" mt={8} lineClamp={2}>
        {item.title}
      </Text>

      {item.isNew && (
        <Badge color="blue" variant="light" size="xs" mt={4}>
          New
        </Badge>
      )}

      <Text size="sm" mt={4}>
        ₹{item.price}{" "}
        <Text span td="line-through" c="dimmed" size="xs">
          ₹{item.originalPrice}
        </Text>
      </Text>

      <Button fullWidth color="#8BB06E" radius="xl" size="xs">
        Add to cart
      </Button>
    </Card>
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
