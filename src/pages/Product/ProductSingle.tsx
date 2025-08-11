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
import { useEffect, useState } from "react";
import { IconTruck, IconPackage, IconExchange } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import { GET_PRODUCTS_DETAILS } from "../../api/api";
import axiosInstance from "../../api/axiosInstance";
import ProductCard from "../Home/PorductCard";

// Static description tags
import BraDescp1 from "../../assets/svg/bradescription/descp1.svg";
import BraDescp2 from "../../assets/svg/bradescription/descp2.svg";
import BraDescp3 from "../../assets/svg/bradescription/descp3.svg";
import BraDescp4 from "../../assets/svg/bradescription/descp4.svg";
import BraDescp5 from "../../assets/svg/bradescription/descp5.svg";
import BraDescp6 from "../../assets/svg/bradescription/descp6.svg";
import BraDescp7 from "../../assets/svg/bradescription/descp7.svg";
import BraDescp8 from "../../assets/svg/bradescription/descp8.svg";
import SimilarProductCard from "../Home/SimilarProductCard";

const tags = [
  "Everyday", "Plus Size", "Non-Padded", "Wirefree",
  "Full Coverage", "Seamless", "Full Cup", "Detachable",
];
const description = [
  BraDescp1, BraDescp2, BraDescp3, BraDescp4,
  BraDescp5, BraDescp6, BraDescp7, BraDescp8,
];
const items = tags.map((tag, i) => ({ tag, image: description[i] }));

const ProductPage = () => {
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await axiosInstance.get(`${GET_PRODUCTS_DETAILS}${productId}`);
        const detail = resp?.data?.detail;
        const sims = resp?.data?.similerProducts;
        setProductDetails(detail);
        setSimilarProducts(sims || []);
        setMainImage(detail?.images?.[0] || "");
        setSelectedColor(detail?.selectedColors?.[0] || "");
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchData();
  }, [productId]);

  if (!productDetails) return null;

  const {
    productTitle,
    productDescription,
    images = [],
    selectedSizes = [],
    selectedColors = [],
    price,
    salePrice,
  } = productDetails;

  const discount = price && salePrice
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

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
          <Group mt="sm" wrap="wrap">
            {images.map((img: string, idx: number) => (
              <Box
                key={idx}
                onClick={() => setMainImage(img)}
                style={{
                  cursor: "pointer",
                  border: mainImage === img ? "2px solid #38a169" : "1px solid #ccc",
                  borderRadius: 8,
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src={img} width={60} height={60} radius="sm" />
              </Box>
            ))}
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Title order={2}>{productTitle}</Title>
          <Text>{productDescription}</Text>
          <Text size="sm" color="dimmed">⭐ 4.5 (157 Reviews)</Text>

          <Group mt="xs">
            <Text fw={700} size="xl">₹{salePrice}</Text>
            <Text color="dimmed" td="line-through">₹{price}</Text>
            <Badge color="green">Save {discount}%</Badge>
          </Group>

          <Box mt="md">
            <Text fw={500}>Size</Text>
            <SimpleGrid cols={6} mt="xs">
              {selectedSizes.map((sz: string, i: number) => (
                <Button variant="outline" size="xs" radius={100} key={i}>
                  {sz}
                </Button>
              ))}
            </SimpleGrid>
          </Box>

          <Box mt="md">
            <Text fw={500}>Colors</Text>
            <Group mt="xs">
              {selectedColors.map((clr: string, i: number) => (
                <Box
                  key={i}
                  bg={clr}
                  w={20} h={20}
                  style={{
                    border: selectedColor === clr ? "2px solid #38a169" : "1px solid #ccc",
                    borderRadius: "50%", cursor: "pointer",
                  }}
                  onClick={() => setSelectedColor(clr)}
                />
              ))}
            </Group>
          </Box>

          <Group mt="lg">
            <Button color="green">Add to cart</Button>
            <Button variant="outline">Buy Now</Button>
          </Group>

          <Group mt="md" spacing="lg">
            <Group>
              <ThemeIcon variant="light" color="green"><IconTruck /></ThemeIcon>
              <Text>Fast & Free Delivery</Text>
            </Group>
            <Group>
              <ThemeIcon variant="light" color="green"><IconPackage /></ThemeIcon>
              <Text>Discreet Packaging</Text>
            </Group>
            <Group>
              <ThemeIcon variant="light" color="green"><IconExchange /></ThemeIcon>
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
            mt="sm" wrap="nowrap" gap="sm"
            style={{ overflowX: isMobile ? "auto" : "unset" }}
          >
            {items.map((item, idx) => (
              <Stack key={idx} align="center" style={{ flexShrink: 0 }}>
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xs">
          <Stack mt="sm">
            <Box>
              <Text fw={500}>Aarti R.</Text>
              <Text size="sm" c="dimmed">“Very comfortable and fits perfectly…”</Text>
            </Box>
            <Box>
              <Text fw={500}>Nisha K.</Text>
              <Text size="sm" c="dimmed">“Soft fabric and good quality…”</Text>
            </Box>
            <Box>
              <Text fw={500}>Sana M.</Text>
              <Text size="sm" c="dimmed">“Looks exactly like the pictures…”</Text>
            </Box>
          </Stack>
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
            <Text size="sm" mt="sm">Following these care instructions will help maintain product quality.</Text>
          </Box>
        </Tabs.Panel>
      </Tabs>

      <Title order={3} mt="xl" mb="md">Similar Products</Title>
      <SimpleGrid cols={4}>
        {similarProducts.map((prod, i) => (
          <SimilarProductCard key={i} {...prod} />
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default ProductPage;
