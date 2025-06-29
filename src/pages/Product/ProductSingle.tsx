import {
  Container,
  Grid,
  Image,
  Text,
  Title,
  Button,
  Group,
  Badge,
  Tabs,
  SimpleGrid,
  Box,
  ThemeIcon,
  Stack,
} from "@mantine/core";
import { useState } from "react";
import { IconTruck, IconPackage, IconExchange } from "@tabler/icons-react";
import BraThumbnail from "../../assets/svg/BraThumbnail.svg";
import BraThumbnail1 from "../../assets/svg/BraThumbnail1.svg";
import BraThumbnail2 from "../../assets/svg/BraThumbnail2.svg";
import BraThumbnail3 from "../../assets/svg/BraThumbnail3.svg";

import BraDescp1 from "../../assets/svg/bradescription/descp1.svg";
import BraDescp2 from "../../assets/svg/bradescription/descp2.svg";
import BraDescp3 from "../../assets/svg/bradescription/descp3.svg";
import BraDescp4 from "../../assets/svg/bradescription/descp4.svg";
import BraDescp5 from "../../assets/svg/bradescription/descp5.svg";
import BraDescp6 from "../../assets/svg/bradescription/descp6.svg";
import BraDescp7 from "../../assets/svg/bradescription/descp7.svg";
import BraDescp8 from "../../assets/svg/bradescription/descp8.svg";
import ProductCard from "../Home/PorductCard";
import { useMediaQuery } from "@mantine/hooks";

const images = [BraThumbnail, BraThumbnail1, BraThumbnail2, BraThumbnail3];
const tags = [
  "Everyday",
  "Plus Size",
  "Non-Padded",
  "Wirefree",
  "Full Coverage",
  "Seamless",
  "Full Cup",
  "Detachable",
];

const description = [
  BraDescp1,
  BraDescp2,
  BraDescp3,
  BraDescp4,
  BraDescp5,
  BraDescp6,
  BraDescp7,
  BraDescp8,
];

const items = tags.map((tag, index) => ({
  tag,
  image: description[index],
}));

const sizes = ["30A", "32B", "34C", "36D", "38DD", "40E"];

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

const colors = ["black", "green", "blue", "purple"];

export default function ProductPage() {
  const [mainImage, setMainImage] = useState(images[0]);
  const [selectedColor, setSelectedColor] = useState("black");
  const isMobile = useMediaQuery("(max-width: 768px)"); // adjust breakpoint if needed

  return (
    <Container size="xl" py="md">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Image
            src={mainImage}
            alt="Main product"
            radius="md"
            height={400}
            width="100%"
            fit="contain"
          />
          <Group mt="sm">
            {images.map((img, index) => (
              <Box
                key={index}
                onClick={() => setMainImage(img)}
                style={{
                  cursor: "pointer",
                  border:
                    mainImage === img ? "2px solid #38a169" : "1px solid #ccc",
                  borderRadius: 8,
                }}
              >
                <Image src={img} width={60} height={60} radius="sm" />
              </Box>
            ))}
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Title order={2}>
            Susie Multicolor Secret Side Shaper Basic Moulded Bra
          </Title>
          <Text size="sm" color="dimmed">
            ⭐ 4.5 (157 Reviews)
          </Text>
          <Group mt="xs">
            <Text fw={700} size="xl">
              ₹999
            </Text>
            <Text color="dimmed" td="line-through">
              ₹1999
            </Text>
            <Badge color="green">Save 50%</Badge>
          </Group>

          <Box mt="md">
            <Text fw={500}>Size</Text>
            <SimpleGrid cols={6} mt="xs">
              {sizes.map((size, i) => (
                <Button variant="outline" size="xs" radius={100} key={i}>
                  {size}
                </Button>
              ))}
            </SimpleGrid>
          </Box>

          <Box mt="md">
            <Text fw={500}>Colors</Text>
            <Group mt="xs">
              {colors.map((color) => (
                <Box
                  key={color}
                  bg={color}
                  w={20}
                  h={20}
                  style={{
                    border:
                      selectedColor === color
                        ? "2px solid #38a169"
                        : "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </Group>
          </Box>

          <Group mt="lg">
            <Button color="green">Add to cart</Button>
            <Button variant="outline">Buy Now</Button>
          </Group>

          <Group mt="md">
            <Group>
              <ThemeIcon variant="light" color="green">
                <IconTruck />
              </ThemeIcon>
              <Text>Fast & Free Delivery</Text>
            </Group>
            <Group>
              <ThemeIcon variant="light" color="green">
                <IconPackage />
              </ThemeIcon>
              <Text>Discreet Packaging</Text>
            </Group>
            <Group>
              <ThemeIcon variant="light" color="green">
                <IconExchange />
              </ThemeIcon>
              <Text>Easy Exchange</Text>
            </Group>
          </Group>

          <Box mt="sm">
            <Text size="xs">✓ Free shipping worldwide</Text>
            <Text size="xs">✓ 100% Secured Payment</Text>
            <Text size="xs">✓ Made by the Professionals</Text>
          </Box>
        </Grid.Col>
      </Grid>

      <Tabs defaultValue="description" mt="xl">
        <Tabs.List>
          <Tabs.Tab value="description">Description</Tabs.Tab>
          <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
          <Tabs.Tab value="washcare">Wash care</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="description" pt="xs">
          <Group
            mt="sm"
            wrap="nowrap"
            gap="sm"
            style={{ overflowX: isMobile ? "auto" : "unset" }}
          >
            {items.map((item, i) => (
              <Stack key={i} align="center" style={{ flexShrink: 0 }}>
                <Image
                  src={item.image}
                  alt={item.tag}
                  radius="md"
                  w={isMobile ? 30 : 100}
                  h={isMobile ? 30 : 100}
                />
                <Text size="sm">{item.tag}</Text>
              </Stack>
            ))}
          </Group>

          <Box mt="md">
            <Text fw={600}>Features:</Text>
            <ul>
              <li>Made with full cotton</li>
              <li>Slim fit for any body</li>
              <li>Quality control by JC</li>
            </ul>
            <Text mt="sm" size="sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xs">
          <Box mt="sm">
            <Text fw={600}>Customer Reviews:</Text>
            <Stack mt="sm">
              <Box>
                <Text fw={500}>Aarti R.</Text>
                <Text size="sm" c="dimmed">
                  “Very comfortable and fits perfectly. Great support too!”
                </Text>
              </Box>
              <Box>
                <Text fw={500}>Nisha K.</Text>
                <Text size="sm" c="dimmed">
                  “Soft fabric and good quality. Would recommend.”
                </Text>
              </Box>
              <Box>
                <Text fw={500}>Sana M.</Text>
                <Text size="sm" c="dimmed">
                  “Looks exactly like the pictures. Super comfy for all-day
                  wear.”
                </Text>
              </Box>
            </Stack>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="washcare" pt="xs">
          <Box mt="sm">
            <Text fw={600}>Wash Care Instructions:</Text>
            <ul>
              <li>Hand wash separately in cold water</li>
              <li>Use mild detergent</li>
              <li>Do not bleach or tumble dry</li>
              <li>Dry in shade</li>
              <li>Iron on low heat if needed</li>
            </ul>
            <Text size="sm" mt="sm">
              Following these care instructions will help maintain the quality
              and shape of the bra.
            </Text>
          </Box>
        </Tabs.Panel>
      </Tabs>

      <Title order={3} mt="xl" mb="md">
        Similar Products
      </Title>
      <SimpleGrid cols={4}>
        {products.map((product, i) => (
          <ProductCard key={i} {...product} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
