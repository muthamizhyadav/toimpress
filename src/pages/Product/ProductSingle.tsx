// pages/Product/ProductPage.tsx
import {
  Container, Grid, Image, Text, Title, Button, Group, Badge,
  Tabs, SimpleGrid, Box, ThemeIcon, Stack, ActionIcon
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { IconTruck, IconPackage, IconExchange, IconMinus, IconPlus } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GET_PRODUCTS_DETAILS } from "../../api/api";
import axiosInstance from "../../api/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, increaseQty, decreaseQty, removeFromCart } from "../../redux/features/cartSlice";
import type { RootState } from "../../redux/store";

import SizeSelectorDrawer, { type SizeOption } from "../../components/SizeSelectorDrawer";

import BraDescp1 from "../../assets/svg/bradescription/descp1.svg";
import BraDescp2 from "../../assets/svg/bradescription/descp2.svg";
import BraDescp3 from "../../assets/svg/bradescription/descp3.svg";
import BraDescp4 from "../../assets/svg/bradescription/descp4.svg";
import BraDescp5 from "../../assets/svg/bradescription/descp5.svg";
import BraDescp6 from "../../assets/svg/bradescription/descp6.svg";
import BraDescp7 from "../../assets/svg/bradescription/descp7.svg";
import BraDescp8 from "../../assets/svg/bradescription/descp8.svg";

const tags = [
  "Everyday", "Plus Size", "Non-Padded", "Wirefree",
  "Full Coverage", "Seamless", "Full Cup", "Detachable",
];
const description = [
  BraDescp1, BraDescp2, BraDescp3, BraDescp4,
  BraDescp5, BraDescp6, BraDescp7, BraDescp8,
];
const items = tags.map((tag, i) => ({ tag, image: description[i] }));

export default function ProductPage() {
  // 🔹 Hooks must be unconditional
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((s: RootState) => s.cart);

  const productId = searchParams.get("id");

  const [mainImage, setMainImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>(""); // "32B"
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [, setSimilarProducts] = useState<any[]>([]);
  const [openSizeDrawer, setOpenSizeDrawer] = useState(false);

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
        setSelectedSize(detail?.selectedSizes?.[0] || "");
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  // ✅ Prepare safe inputs for hooks even before data loads
  const sizesInput: string[] = productDetails?.selectedSizes ?? [];
  const colorsInput: string[] = productDetails?.selectedColors ?? [];
  const imagesInput: string[] = productDetails?.images ?? [];
  const priceInput: number | undefined = productDetails?.price;
  const salePriceInput: number | undefined = productDetails?.salePrice;
  const titleInput: string = productDetails?.productTitle ?? "";
  const descInput: string = productDetails?.productDescription ?? "";

  // ✅ useMemo must run every render
  const sizeOptions: SizeOption[] = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const s of sizesInput) {
      const m = /^(\d{2})([A-Z]+)$/.exec(String(s).toUpperCase().trim());
      if (!m) continue;
      const band = Number(m[1]);
      const cup = m[2];
      if (!map.has(band)) map.set(band, new Set());
      map.get(band)!.add(cup);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([band, cupsSet]) => ({
        band,
        cups: Array.from(cupsSet.values()).sort(),
      }));
  }, [sizesInput]);

  // Early return AFTER all hooks are declared
  if (!productDetails) return null;

  const discount =
    priceInput && salePriceInput
      ? Math.round(((priceInput - salePriceInput) / priceInput) * 100)
      : 0;

  const currentCartItem = cartItems?.find(
    (it: any) =>
      it.id === productId &&
      (it.size ?? "") === (selectedSize || "") &&
      (it.color ?? "") === (selectedColor || "")
  );
  const currentQty: number = currentCartItem?.qty ?? 0;

  const requiresSize = sizeOptions.length > 0;
  const requiresColor = colorsInput.length > 0;

  const makeCartPayload = (sizeLabel?: string) => ({
    id: productId as string,
    imageUrl: mainImage || imagesInput?.[0] || "",
    title: titleInput,
    productName: titleInput,
    price: salePriceInput ?? priceInput,
    originalPrice: priceInput,
    rating: 0,
    qty: 1,
    size: requiresSize ? (sizeLabel ?? selectedSize) : undefined, // "32B"
    color: requiresColor ? selectedColor : undefined,
    silent: true,
  });

  const handleAddToCart = () => setOpenSizeDrawer(true);
  const handleBuyNow = () => setOpenSizeDrawer(true);

  const handleConfirmSize = (sel: { band: number; cup: string; label: string }) => {
    const chosen = sel.label; // "32B"
    setSelectedSize(chosen);
    dispatch(addToCart(makeCartPayload(chosen)));
    setOpenSizeDrawer(false);
    // If buy-now flow needed, navigate here.
    // navigate("/checkout");
  };

  return (
    <Container size="xl" py="md">
      <Grid>
        {/* Left: images */}
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
            {imagesInput.map((img: string, idx: number) => (
              <Box
                key={idx}
                onClick={() => setMainImage(img)}
                style={{
                  cursor: "pointer",
                  border: mainImage === img ? "2px solid #38a169" : "1px solid #ccc",
                  borderRadius: 8,
                  width: 80,
                  height: 80,
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

        {/* Right: details */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Title order={2}>{titleInput}</Title>
          <Text>{descInput}</Text>
          <Text size="sm" c="dimmed">⭐ 4.5 (157 Reviews)</Text>

          <Group mt="xs">
            <Text fw={700} size="xl">₹{salePriceInput ?? priceInput}</Text>
            {salePriceInput ? <Text c="dimmed" td="line-through">₹{priceInput}</Text> : null}
            {salePriceInput ? <Badge color="green">Save {discount}%</Badge> : null}
          </Group>

          {/* Colors */}
          <Box mt="md">
            <Text fw={500}>Colors</Text>
            <Group mt="xs">
              {colorsInput.map((clr: string, i: number) => (
                <Box
                  key={i}
                  bg={clr}
                  w={24} h={24}
                  style={{
                    border: selectedColor === clr ? "2px solid #38a169" : "1px solid #ccc",
                    borderRadius: "50%", cursor: "pointer",
                  }}
                  title={clr}
                  onClick={() => setSelectedColor(clr)}
                />
              ))}
              {colorsInput.length === 0 && <Text size="xs" c="dimmed">Single Color</Text>}
            </Group>
          </Box>

          {/* Actions */}
          <Group mt="lg" gap="sm">
            {currentQty > 0 ? (
              <Group
                gap="xs"
                style={{
                  background: "#96BD75",
                  borderRadius: 999,
                  padding: "6px 8px",
                }}
              >
                <ActionIcon
                  variant="transparent"
                  onClick={() => {
                    if (currentQty <= 1) {
                      dispatch(removeFromCart({
                        id: productId as string,
                        size: requiresSize ? selectedSize : undefined,
                        color: requiresColor ? selectedColor : undefined,
                        silent: true,
                      }));
                    } else {
                      dispatch(decreaseQty({
                        id: productId as string,
                        size: requiresSize ? selectedSize : undefined,
                        color: requiresColor ? selectedColor : undefined,
                        silent: true,
                      }));
                    }
                  }}
                  aria-label="Decrease quantity"
                >
                  <IconMinus size={16} color="white" />
                </ActionIcon>

                <Button
                  variant="subtle"
                  size="compact-sm"
                  radius="xl"
                  styles={{ root: { color: "white", pointerEvents: "none" } }}
                >
                  {currentQty}
                </Button>

                <ActionIcon
                  variant="transparent"
                  onClick={() =>
                    dispatch(increaseQty({
                      id: productId as string,
                      size: requiresSize ? selectedSize : undefined,
                      color: requiresColor ? selectedColor : undefined,
                      silent: true,
                    }))
                  }
                  aria-label="Increase quantity"
                >
                  <IconPlus size={16} color="white" />
                </ActionIcon>
              </Group>
            ) : (
              <>
                <Button color="green" onClick={handleAddToCart}>
                  Add to cart
                </Button>
                <Button variant="outline" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </>
            )}
          </Group>

          {/* Trust badges */}
          <Group mt="md" gap="lg">
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

      {/* Tabs */}
      <Tabs defaultValue="description" mt="xl">
        <Tabs.List>
          <Tabs.Tab value="description">Description</Tabs.Tab>
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
          </Box>
        </Tabs.Panel>
      </Tabs>

      {/* Size drawer (same component) */}
      <SizeSelectorDrawer
        opened={openSizeDrawer}
        onClose={() => setOpenSizeDrawer(false)}
        onConfirm={handleConfirmSize}
        productTitle={titleInput}
        price={salePriceInput ?? priceInput}
        imageUrl={mainImage || imagesInput?.[0] || ""}
        options={sizeOptions.length ? sizeOptions : undefined}
      />
    </Container>
  );
}
