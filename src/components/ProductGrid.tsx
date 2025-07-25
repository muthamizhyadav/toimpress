import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Card, Image, Text, Button, Badge, Skeleton, Group } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';

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
  fetchProducts: (offset: number, limit: number, categoryId: string) => Promise<Product[]>;
}

const categoryMap: Record<string, string> = {
  '1': 'Brassiere',
  '2': 'Panties',
  '3': 'Shimmer Leggings',
  '4': 'New Arrivals',
  '5': 'Offers Zone',
  '6': 'Combo Offer',
};

const ProductGrid: React.FC<ProductGridProps> = ({ fetchProducts }) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '1';
  const category = categoryMap[id] || 'Unknown';

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
    setItems(prev => [...prev, ...newItems]);
    setOffset(prev => prev + limit);
    if (newItems.length < limit) setHasMore(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Text size="40px" fw={700} align="center" mb="lg" tt="capitalize">
        {category}
      </Text>

      <InfiniteScroll
        dataLength={items.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<SkeletonGrid count={limit} />}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>You have seen it all!</b>
          </p>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {items.map(item => (
            <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image src={item.imageUrl} height={220} alt={item.title} />
              </Card.Section>

              <Group position="apart" mt="md" mb="xs">
                <Text weight={500} size="sm" lineClamp={2}>{item.title}</Text>
                {item.isNew && <Badge color="blue" variant="light">New</Badge>}
              </Group>

              <Text size="sm">
                ₹{item.price}{' '}
                <Text span td="line-through" c="dimmed" size="xs">
                  ₹{item.originalPrice}
                </Text>
              </Text>

              <Button fullWidth mt="md" color="#8BB06E" radius={'xl'}>
                Add to cart
              </Button>
            </Card>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

const SkeletonGrid = ({ count }: { count: number }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
          <Skeleton height={220} />
          <Skeleton height={20} mt="md" radius="xl" />
          <Skeleton height={16} mt={10} width="60%" radius="xl" />
          <Skeleton height={36} mt="md" radius="xl" />
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;