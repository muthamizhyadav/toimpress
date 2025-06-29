// BannerSlider.tsx
import { Box } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const dummyImages = [
  {
    title: "Everyday Basics",
    subtitle: "Designed for comfort!",
    offer: "BUY 3 @ RS.999",
    imageUrl: "https://example.com/image1.jpg",
  },
  {
    title: "Nursing Bras",
    subtitle: "Perfect for New Moms",
    offer: "BUY 2 @ RS.1299",
    imageUrl: "https://example.com/image2.jpg",
  },
  {
    title: "Everyday Basics",
    subtitle: "Designed for comfort!",
    offer: "BUY 3 @ RS.999",
    imageUrl: "https://example.com/image3.jpg",
  },
];

import { Card, Image, Text, Button, Stack } from "@mantine/core";

interface ImageCardProps {
  title: string;
  subtitle: string;
  offer: string;
  imageUrl: string;
}

const ImageCard = ({ title, subtitle, offer, imageUrl }: ImageCardProps) => {
  return (
    <Card radius="md" shadow="sm" withBorder p="lg">
      <Card.Section>
        <Image src={imageUrl} height={300} alt={title} />
      </Card.Section>
      <Stack mt="md" gap={4}>
        <Text fw={700} size="lg">
          {title}
        </Text>
        <Text c="dimmed">{subtitle}</Text>
        <Text fw={600} size="md" c="red">
          {offer}
        </Text>
        <Button color="dark" radius="xl" mt="sm">
          Shop Now
        </Button>
      </Stack>
    </Card>
  );
};

const BannerSlider = () => {
  return (
    <Box bg="#fefefe" px="lg" py="xl">
      <Carousel
        slideSize="33.333%"
        slideGap="md"
        withIndicators={dummyImages.length > 3}
        withControls={dummyImages.length > 3}
        controlSize={40}
        previousControlIcon={<IconChevronLeft />}
        nextControlIcon={<IconChevronRight />}
        height={450}
        styles={{
          control: {
            backgroundColor: "white",
            color: "black",
            borderRadius: "50%",
          },
        }}
      >
        {dummyImages.map((item, index) => (
          <Carousel.Slide key={index}>
            <ImageCard {...item} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
};

export default BannerSlider;
