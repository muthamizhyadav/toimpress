"use client";

import { Avatar, Card, Flex, Group, Text, Title } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import { IconStar } from "@tabler/icons-react";
import TestimonialBg from "../../assets/images/TestimonailBg.png";

const testimonials = [
  {
    name: "Dean D.",
    avatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    text: "Great quality products - Flags, programs for exceptional capacities, birthday.",
  },
  {
    name: "Cristian L.",
    avatar: "https://i.pravatar.cc/100?img=2",
    rating: 4.5,
    text: "Best services ever - Flags, programs for exceptional capacities, birthday, and are largely still mainstream on paper occasion welcome.",
  },
  {
    name: "Leonel R.",
    avatar: "https://i.pravatar.cc/100?img=3",
    rating: 4.5,
    text: "Top noth support - Flags, programs for, birthday, and occasion welcome are largely still mainstream on paper exceptional capacities.",
  },
  {
    name: "Dean D.",
    avatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    text: "Great quality products - Flags, programs for exceptional capacities, birthday, and occasion welcome are largely still mainstream.",
  },
  {
    name: "Cristian L.",
    avatar: "https://i.pravatar.cc/100?img=2",
    rating: 4.5,
    text: "Best services ever - Flags, programs for exceptional capacities, birthday, and are largely still mainstream on paper occasion welcome.",
  },
  {
    name: "Leonel R.",
    avatar: "https://i.pravatar.cc/100?img=3",
    rating: 4.5,
    text: "Top noth support - Flags, programs for, birthday, and occasion welcome are largely still mainstream on paper exceptional capacities.",
  },
];

function RatingStars({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <IconStar
        key={i}
        size={16}
        fill={i <= rating ? "#FACC15" : "none"}
        stroke={i <= rating ? "#FACC15" : "#D1D5DB"}
      />
    );
  }
  return <Group>{stars}</Group>;
}

export default function Testimonials() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Flex
      px="md"
      py="xl"
      style={{
        background: `url(${TestimonialBg}) center/cover no-repeat`,
        minHeight: "45vh",
      }}
      justify="center"
      align="center"
      direction="column"
    >
      <section
        style={{ overflow: "hidden", width: "80%", textAlign: "center" }}
      >
        <Title order={2} mb="xl">
          What People Are Saying
        </Title>

        <Carousel
          slideSize={isMobile ? "85%" : "33.3333%"} // increased slide size on mobile
          height={260}
          slideGap="md"
          align="start" // Ensures first slide aligns to the left
          controlsOffset="sm"
          controlSize={24}
          withControls={false}
          withIndicators={false}
          styles={{
            viewport: { overflow: "visible", paddingBottom: "1rem" },
          }}
        >
          {testimonials.map((t, i) => (
            <Carousel.Slide key={i}>
              <Card
                shadow="md"
                radius="md"
                withBorder
                p="lg"
                style={{
                  minHeight: 250,
                  width: "100%", // fill slide
                  margin: "0 auto",
                }}
              >
                <Group mb="xs">
                  <Avatar src={t.avatar} radius="xl" size="lg" />
                  <div>
                    <Text fw={600}>{t.name}</Text>
                    <RatingStars rating={t.rating} />
                  </div>
                </Group>
                <Text mt="sm">“ {t.text} ”</Text>
              </Card>
            </Carousel.Slide>
          ))}
        </Carousel>
      </section>
    </Flex>
  );
}
