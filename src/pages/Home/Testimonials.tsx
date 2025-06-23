"use client";

import { Avatar, Badge, Card, Flex, Group, Text, Title } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import { IconStar } from "@tabler/icons-react";
import TestimonialBg from "../../assets/images/TestimonailBg.png";

const testimonials = [
  {
    name: "Dean D.",
    avatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    text: "Great quality products - Flags, programs for exceptional capacities, birthday, and occasion welcome are largely still mainstream on paper.",
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
    text: "Great quality products - Flags, programs for exceptional capacities, birthday, and occasion welcome are largely still mainstream on paper.",
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
  const isMobile = useMediaQuery("(max-width: 600px)");

  return (
    <Flex
      px="md"
      py="xl"
      style={{
        background: `url(${TestimonialBg}) center/cover no-repeat`,
        minHeight: "45vh", // allows the section to grow if content needs more space
      }}
      justify="center"
      align="center"
      direction="column"
    >
      <section
        style={{
          overflow: "hidden",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Badge
          color="dark"
          radius="md"
          size="xl"
          fz="lg"
          mb="xs"
          px="md"
          py={6}
        >
          Testimonials
        </Badge>
        <Title order={2} mb="xl">
          What People Are Saying
        </Title>

        {isMobile ? (
          <Carousel
            slideSize="70%"
            height={200}
            slideGap="lg"
            controlsOffset="sm"
            controlSize={24}
            withControls
            withIndicators
          >
            {testimonials.map((t, i) => (
              <Carousel.Slide key={i} m="10px">
                <Card
                  shadow="md"
                  radius="md"
                  withBorder
                  p="lg"
                  style={{ minHeight: 250, maxWidth: 320, width: "100%" }}
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
        ) : (
          <Group mt="md" style={{ display: "flex", justifyContent: "center" }}>
            {testimonials.map((t, i) => (
              <Card
                key={i}
                shadow="md"
                radius="md"
                withBorder
                p="lg"
                style={{ minHeight: 250, maxWidth: 300 }}
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
            ))}
          </Group>
        )}
      </section>
    </Flex>
  );
}
