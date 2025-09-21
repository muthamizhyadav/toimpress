// pages/Product/ProductPage.tsx
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
  ActionIcon,
  Paper,
  Card,
  Divider,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { IconTruck, IconPackage, IconMinus, IconPlus, IconX, IconCheck } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GET_PRODUCTS_DETAILS, API_CART } from "../../api/api";
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

import { showNotification } from "@mantine/notifications";

/* small data used in the description area */
const tags = [
  "Everyday", "Plus Size", "Non-Padded", "Wirefree",
  "Full Coverage", "Seamless", "Full Cup", "Detachable",
];
const description = [
  BraDescp1, BraDescp2, BraDescp3, BraDescp4,
  BraDescp5, BraDescp6, BraDescp7, BraDescp8,
];
const items = tags.map((tag, i) => ({ tag, image: description[i] }));

// color tokens
const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#92B775";

export default function ProductPage() {
  // -----------------------
  // Hooks (must be unconditional)
  // -----------------------
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((s: RootState) => s.cart);

  const productId = searchParams.get("id");

  // UI state for main product
  const [mainImage, setMainImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>(""); // e.g. "32B"
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [openSizeDrawer, setOpenSizeDrawer] = useState(false);

  // which product the drawer is open for (null = main product)
  const [drawerProduct, setDrawerProduct] = useState<any | null>(null);

  // loading state per-product to prevent double clicks
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await axiosInstance.get(`${GET_PRODUCTS_DETAILS}${productId}`);
        const detail = resp?.data?.product;
        const sims = resp?.data?.similerProducts || resp?.data?.similarProducts;
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

  // safe inputs even before productDetails loads
  const sizesInput: string[] = productDetails?.selectedSizes ?? [];
  const colorsInput: string[] = productDetails?.selectedColors ?? [];
  const imagesInput: string[] = productDetails?.images ?? [];
  const priceInput: number | undefined = productDetails?.price;
  const salePriceInput: number | undefined = productDetails?.salePrice;
  const titleInput: string = productDetails?.productTitle ?? "";
  const descInput: string = productDetails?.productDescription ?? "";

  // grouped sizeOptions (band -> cups) for main product
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

  // ---- size-by-color detection logic (not a hook)
  const getSizesForColor = (color: string, prod: any = productDetails): string[] => {
    const sizesFlat: string[] = prod?.selectedSizes ?? [];
    if (!color) return sizesFlat;

    const mapCandidate =
      prod?.sizeByColor ??
      prod?.sizesByColor ??
      prod?.colorSizeMap ??
      prod?.colorData ??
      null;

    if (mapCandidate && typeof mapCandidate === "object" && !Array.isArray(mapCandidate)) {
      const sizes = mapCandidate[color] ?? mapCandidate[color?.toLowerCase?.()] ?? mapCandidate[color?.toUpperCase?.()];
      if (Array.isArray(sizes) && sizes.length) return sizes;
    }

    if (Array.isArray(mapCandidate)) {
      const found = (mapCandidate as any[]).find((m) => String(m.color).toLowerCase() === String(color).toLowerCase());
      if (found) {
        const xs = found.sizes ?? found.selectedSizes ?? found.availableSizes;
        if (Array.isArray(xs)) return xs;
      }
    }

    if (Array.isArray(prod?.colors)) {
      const c = prod?.colors.find((c: any) => String(c.name).toLowerCase() === String(color).toLowerCase());
      if (c && Array.isArray(c.sizes)) return c.sizes;
    }

    return sizesFlat;
  };

  // derived data for the selected color (main product)
  const availableSizesForSelectedColor = getSizesForColor(selectedColor, productDetails);
  const availableSizesSet = useMemo(
    () => new Set((availableSizesForSelectedColor || []).map((s: string) => String(s).toUpperCase())),
    [availableSizesForSelectedColor]
  );

  // Early return only after ALL hooks are declared
  if (!productDetails) return null;

  // -------------
  // Rest of logic (no hooks below)
  // -------------
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

  // main product API payload maker
  const makeCartPayload = (sizeLabel?: string, qty = 1) => ({
    productId: productId as string,
    quantity: qty,
    selectedSize: requiresSize ? (sizeLabel ?? selectedSize) : undefined,
    selectedColor: requiresColor ? selectedColor : undefined,
  });

  // helper to set adding map
  const setAdding = (key: string, v: boolean) => {
    setAddingMap((prev) => {
      if (prev[key] === v) return prev;
      return { ...prev, [key]: v };
    });
  };

  // API integration for add-to-cart (shared)
  const addToCartApi = async (
    payload: { productId: string; quantity: number; selectedSize?: string; selectedColor?: string },
    reduxPayload?: any,
    mapKey = "current"
  ) => {
    try {
      setAdding(mapKey, true);

      const body = {
        productId: String(payload.productId),
        quantity: payload.quantity,
        selectedSize: payload.selectedSize,
        selectedColor: payload.selectedColor,
      };

      const resp = await axiosInstance.post(API_CART, body, { headers: { "Content-Type": "application/json" } });

      if (resp?.status === 200 || resp?.status === 201) {
        const reduxItem = reduxPayload ?? {
          id: payload.productId,
          productId: payload.productId,
          imageUrl: mainImage || imagesInput?.[0] || "",
          title: titleInput,
          productName: titleInput,
          price: salePriceInput ?? priceInput,
          originalPrice: priceInput,
          rating: 0,
          qty: payload.quantity,
          size: payload.selectedSize,
          color: payload.selectedColor,
          silent: true,
        };
        dispatch(addToCart(reduxItem));
        showNotification({ title: "Added to cart", message: "Item added to cart", color: "green", icon: <IconCheck size={16} /> });
      } else {
        showNotification({ title: "Unable to add", message: resp?.data?.message ?? "Try again", color: "red", icon: <IconX size={16} /> });
      }
    } catch (err: any) {
      console.error("Add to cart API error:", err);
      showNotification({
        title: "Add failed",
        message: err?.response?.data?.message ?? err?.message ?? "Unable to add to cart",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setAdding(mapKey, false);
    }
  };

  // main product handlers
  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      showNotification({ title: "Select size", message: "Please select a size before adding to cart", color: "yellow", icon: <IconX size={14} /> });
      return;
    }
    const payload = makeCartPayload(selectedSize, 1);
    addToCartApi(payload, undefined, "current");
  };

  const handleBuyNow = async () => {
    if (requiresSize && !selectedSize) {
      showNotification({ title: "Select size", message: "Please select a size before proceeding", color: "yellow", icon: <IconX size={14} /> });
      return;
    }
    const payload = makeCartPayload(selectedSize, 1);
    await addToCartApi(payload, undefined, "current");
    navigate("/checkout");
  };

  const onColorSelect = (c: string) => {
    setSelectedColor(c);
    const sizesForC = getSizesForColor(c, productDetails);
    if (!sizesForC || sizesForC.length === 0) {
      setSelectedSize("");
      return;
    }
    if (!selectedSize || !new Set(sizesForC.map(s => String(s).toUpperCase())).has(String(selectedSize).toUpperCase())) {
      setSelectedSize(sizesForC[0]);
    }
  };

  // helper: build grouped SizeOption[] from a product's selectedSizes array
  const buildSizeOptionsForProduct = (prod: any): SizeOption[] => {
    const sizesArr: string[] = prod?.selectedSizes ?? [];
    const map = new Map<number, Set<string>>();
    for (const s of sizesArr) {
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
  };

  // similar product add — if it needs size, open drawer; otherwise call API directly
  const handleAddSimilarClicked = (p: any) => {
    const pid = p._id ?? p.id ?? String(p.product ?? Date.now());
    const sizes = p?.selectedSizes ?? p?.sizes ?? [];
    const needsSize = Array.isArray(sizes) && sizes.length > 0;

    if (!needsSize) {
      // direct add
      const payload = {
        productId: pid,
        quantity: 1,
        selectedSize: undefined,
        selectedColor: (p.selectedColors && p.selectedColors[0]) || undefined,
      };
      const reduxItem = {
        id: pid,
        productId: pid,
        imageUrl: (p.images && p.images[0]) || p.image || "",
        title: p.productTitle ?? p.title ?? p.productName ?? "",
        productName: p.productTitle ?? p.title ?? p.productName ?? "",
        price: p.salePrice ?? p.price,
        originalPrice: p.price,
        rating: 0,
        qty: 1,
        size: undefined,
        color: (p.selectedColors && p.selectedColors[0]) || undefined,
        silent: true,
      };
      addToCartApi(payload, reduxItem, pid);
      return;
    }

    // open drawer for this product
    setDrawerProduct(p);
    setOpenSizeDrawer(true);
  };

  // when drawer confirms for a similar product
  const onDrawerConfirm = async (sel: { band: number; cup: string; label: string }) => {
    const chosen = sel.label;
    // if drawerProduct is null => it was main product (we still support)
    if (!drawerProduct) {
      // main product flow
      const payload = makeCartPayload(chosen, 1);
      await addToCartApi(payload, undefined, "current");
      setOpenSizeDrawer(false);
      return;
    }

    // similar product flow
    const p = drawerProduct;
    const pid = p._id ?? p.id ?? String(p.product ?? Date.now());
    const payload = {
      productId: pid,
      quantity: 1,
      selectedSize: chosen,
      selectedColor: (p.selectedColors && p.selectedColors[0]) || undefined,
    };
    const reduxItem = {
      id: pid,
      productId: pid,
      imageUrl: (p.images && p.images[0]) || p.image || "",
      title: p.productTitle ?? p.title ?? p.productName ?? "",
      productName: p.productTitle ?? p.title ?? p.productName ?? "",
      price: p.salePrice ?? p.price,
      originalPrice: p.price,
      rating: 0,
      qty: 1,
      size: chosen,
      color: (p.selectedColors && p.selectedColors[0]) || undefined,
      silent: true,
    };

    await addToCartApi(payload, reduxItem, pid);
    setOpenSizeDrawer(false);
    setDrawerProduct(null);
  };

  // cancel drawer
  const onDrawerClose = () => {
    setOpenSizeDrawer(false);
    setDrawerProduct(null);
  };

  // -------------------
  // JSX
  // -------------------
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
                  border: mainImage === img ? `2px solid ${DARK_GREEN}` : "1px solid #ccc",
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
                  onClick={() => onColorSelect(clr)}
                  title={clr}
                  style={{
                    cursor: "pointer",
                    border: selectedColor === clr ? `2px solid ${DARK_GREEN}` : "1px solid #ccc",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: /^#/.test(String(clr)) ? clr : "transparent",
                  }}
                >
                  {!/^#/.test(String(clr)) && <div style={{ width: 14, height: 14, borderRadius: 7, background: LIGHT_GREEN }} />}
                </Box>
              ))}
              {colorsInput.length === 0 && <Text size="xs" c="dimmed">Single Color</Text>}
            </Group>
          </Box>

          {/* Size breakdown */}
          <Box mt="md">
            <Text fw={500}>Sizes</Text>
            <Box mt="xs">
              {sizeOptions.length === 0 ? (
                <Text size="sm" c="dimmed">Single size — no selection required</Text>
              ) : (
                <Stack spacing="xs">
                  {sizeOptions.map((opt) => {
                    const availableCups = opt.cups.filter((cup) => {
                      const label = `${String(opt.band)}${cup}`.toUpperCase();
                      return availableSizesSet.size ? availableSizesSet.has(label) : true;
                    });
                    if (!availableCups.length) return null;
                    return (
                      <Box key={opt.band}>
                        <Text size="xs" c="dimmed" mb={6}>Band {opt.band}</Text>
                        <Group spacing="xs" wrap="wrap">
                          {availableCups.map((cup) => {
                            const label = `${opt.band}${cup}`;
                            const active = (selectedSize || "").toUpperCase() === label.toUpperCase();
                            return (
                              <Button
                                key={label}
                                size="xs"
                                variant={active ? "filled" : "outline"}
                                onClick={() => setSelectedSize(label)}
                                sx={{
                                  backgroundColor: active ? DARK_GREEN : undefined,
                                  color: active ? "#fff" : DARK_GREEN,
                                  borderColor: DARK_GREEN,
                                  "&:hover": active ? { backgroundColor: "#0f2a12" } : { backgroundColor: "#f2fbf2" },
                                }}
                              >
                                {label}
                              </Button>
                            );
                          })}
                        </Group>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
            {selectedSize ? <Text size="sm" mt="8px">Selected: <b>{selectedSize}</b></Text> : null}
          </Box>

          {/* Actions */}
          <Group mt="lg" gap="sm">
            {currentQty > 0 ? (
              <Group
                gap="xs"
                style={{
                  background: LIGHT_GREEN,
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
                  <IconMinus size={16} color="#fff" />
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
                  <IconPlus size={16} color="#fff" />
                </ActionIcon>
              </Group>
            ) : (
              <>
                <Button
                  loading={!!addingMap["current"]}
                  sx={{
                    backgroundColor: DARK_GREEN,
                    color: "#fff",
                    "&:hover": { backgroundColor: "#0f2a12" },
                  }}
                  onClick={handleAddToCart}
                >
                  Add to cart
                </Button>
                <Button
                  loading={!!addingMap["current"]}
                  variant="outline"
                  onClick={handleBuyNow}
                  sx={{
                    borderColor: DARK_GREEN,
                    color: DARK_GREEN,
                    "&:hover": { backgroundColor: "#f2fbf2" },
                  }}
                >
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
          </Group>

          <Box mt="sm">
            <Text size="xs">✓ Free shipping for UPI/Card holders</Text>
            <Text size="xs">✓ 100% Secured Payment</Text>
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
                  w={isMobile ? 120 : 150}
                  h={isMobile ? 120 : 150}
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
            </ul>
          </Box>
        </Tabs.Panel>
      </Tabs>

      <Divider my="lg" />

      {/* Similar products grid */}
      <Box mt="md">
        <Title order={4}>Similar Products</Title>
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mt="md">
          {similarProducts.length === 0 ? (
            <Text c="dimmed">No similar products found</Text>
          ) : similarProducts.map((p: any) => {
            const pid = p._id ?? p.id ?? String(p.product ?? Date.now());
            const img = (p.images && p.images[0]) || p.image || "";
            const pPrice = p.salePrice ?? p.price;
            const pOrig = p.price;
            const savePct = pOrig && pPrice ? Math.round(((pOrig - pPrice) / pOrig) * 100) : 0;
            return (
              <Card key={pid} shadow="sm" radius="md" withBorder>
                <Box style={{ cursor: "pointer" }} onClick={() => navigate(`/product?id=${pid}`)}>
                  <Image src={img} alt={p.productTitle ?? p.title} height={180} fit="contain" />
                </Box>
                <Stack spacing={6} mt="sm">
                  <Text lineClamp={2} fw={600} size="sm">{p.productTitle ?? p.title}</Text>
                  <Group position="apart" align="center">
                    <div>
                      <Text fw={700}>₹{pPrice}</Text>
                      {pOrig && <Text size="xs" c="dimmed" td="line-through">₹{pOrig}</Text>}
                    </div>
                    {savePct ? <Badge color="green">Save {savePct}%</Badge> : null}
                  </Group>
                  <Group position="apart" mt="xs">
                    <Button
                      size="xs"
                      loading={!!addingMap[pid]}
                      onClick={() => handleAddSimilarClicked(p)}
                      sx={{
                        backgroundColor: DARK_GREEN,
                        color: "#fff",
                        "&:hover": { backgroundColor: "#0f2a12" },
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => navigate(`/product?id=${pid}`)}
                      sx={{
                        borderColor: DARK_GREEN,
                        color: DARK_GREEN,
                        "&:hover": { backgroundColor: "#f2fbf2" },
                      }}
                    >
                      View
                    </Button>
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* SizeSelectorDrawer: used for main product (drawerProduct === null) or similar product (drawerProduct set) */}
      <SizeSelectorDrawer
        opened={openSizeDrawer}
        onClose={onDrawerClose}
        onConfirm={onDrawerConfirm}
        productTitle={drawerProduct ? (drawerProduct.productTitle ?? drawerProduct.title ?? "Product") : titleInput}
        price={drawerProduct ? (drawerProduct.salePrice ?? drawerProduct.price) : (salePriceInput ?? priceInput)}
        imageUrl={drawerProduct ? ((drawerProduct.images && drawerProduct.images[0]) || drawerProduct.image || "") : (mainImage || imagesInput?.[0] || "")}
        options={drawerProduct ? buildSizeOptionsForProduct(drawerProduct) : (sizeOptions.length ? sizeOptions : undefined)}
      />
    </Container>
  );
}