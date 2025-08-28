import {
  Container, Grid, Card, Group, Text, Image, Button, ActionIcon, Stack, Divider, Box, SimpleGrid
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { increaseQty, decreaseQty, removeFromCart, clearCart } from "../../redux/features/cartSlice";
import { useMemo } from "react";

import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { loadRazorpayScript } from "../../utils/loadRazorpay";
import axiosInstance from "../../api/axiosInstance";
const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string; // set in .env
const CREATE_ORDER_URL = "/api/payments/razorpay/order"; // your backend endpoint
const CREATE_PAYMENT_LINK_URL = "/api/payments/razorpay/payment-link";

type CartItem = {
  id: string | number;
  title: string;
  image?: string;
  imageUrl?: string;
  size?: string;
  color?: string;
  price?: number;
  salePrice?: number;
  qty: number;
};

function CheckoutItemBox({ item, onMinus, onPlus, onRemove }: {
  item: CartItem;
  onMinus: () => void;
  onPlus: () => void;
  onRemove: () => void;
}) {
  const unitPrice = item.salePrice ?? item.price ?? 0;
  const lineTotal = unitPrice * (item.qty ?? 1);
  const img = item.image ?? item.imageUrl ?? "";


  


  return (
    <Card withBorder radius="md" p="sm">
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Image
          src={img}
          alt={item.title}
          width={64}
          height={64}
          fit="contain"
          radius="sm"
          withPlaceholder
        />
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm" lineClamp={2}>{item.title}</Text>
          <Group gap="xs" wrap="wrap">
            {item.size && <Text size="xs" c="dimmed">Size: {item.size}</Text>}
            {item.color && <Text size="xs" c="dimmed">Color: {item.color}</Text>}
          </Group>

          <Group gap="xs" align="center">
            <Text fw={700} size="sm">₹{unitPrice}</Text>
            {item.salePrice && (
              <Text size="xs" c="dimmed" td="line-through">₹{item.price}</Text>
            )}
          </Group>

          <Group gap="xs" mt={2}>
            <ActionIcon variant="light" size="sm" onClick={onMinus}><IconMinus size={14} /></ActionIcon>
            <Text size="sm">{item.qty}</Text>
            <ActionIcon variant="light" size="sm" onClick={onPlus}><IconPlus size={14} /></ActionIcon>
            <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove}><IconTrash size={16} /></ActionIcon>
            <Box style={{ marginLeft: "auto" }}>
              <Text fw={600} size="sm">₹{lineTotal}</Text>
            </Box>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

export default function Checkout() {
  
  const items = useSelector((s: any) => s.cart.items) as CartItem[];
  const dispatch = useDispatch();

  const totals = useMemo(() => {
    const subtotal = (items || []).reduce((sum, i) => {
      const p = i.salePrice ?? i.price ?? 0;
      return sum + p * (i.qty ?? 1);
    }, 0);
    return { subtotal, shipping: 0, grandTotal: subtotal };
  }, [items]);

  const onPlaceOrder = async () => {
    try {
      const amountPaise = Math.round(totals.grandTotal * 100); // INR paise

      // Call backend to create a Payment Link
      const { data } = await axiosInstance.post(CREATE_PAYMENT_LINK_URL, {
        amount: amountPaise,
        currency: "INR",
        items, // optional: pass items for your records
      });

      const paymentUrl =
        data?.short_url ||
        data?.payment_link?.short_url ||
        data?.url;

      if (!paymentUrl) {
        throw new Error("Payment link URL not returned");
      }

      // Hard redirect to Razorpay hosted URL
      window.location.assign(paymentUrl);
    } catch (err) {
      console.error(err);
      alert("Unable to start payment. Please try again.");
    }
  };

  return (
    <div>
      <SmallHeader />
      <Header />

      {!items?.length ? (
        <Container size="lg" py="xl">
          <Card p="lg" withBorder>
            <Text fw={600} size="lg">Your cart is empty</Text>
            <Text c="dimmed" size="sm" mt="xs">Add some products to proceed to checkout.</Text>
          </Card>
        </Container>
      ) : (
        <Container size="lg" py="xl">
          <Grid gutter="lg">
            {/* Items grid (compact boxes) */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <SimpleGrid
                cols={{ base: 1, sm: 2, lg: 2 }}
                spacing="md"
              >
                {items.map((item, idx) => (
                  <CheckoutItemBox
                    key={`${item.id}-${idx}`}
                    item={item}
                    onMinus={() => dispatch(decreaseQty({ id: item.id, size: item.size, color: item.color }))}
                    onPlus={() => dispatch(increaseQty({ id: item.id, size: item.size, color: item.color }))}
                    onRemove={() => dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color }))}
                  />
                ))}
              </SimpleGrid>
            </Grid.Col>

            {/* Summary */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder p="lg" radius="md">
                <Text fw={700} mb="md">Order Summary</Text>
                <Group justify="space-between" mb="xs">
                  <Text c="dimmed">Subtotal</Text>
                  <Text>₹{totals.subtotal}</Text>
                </Group>
                <Group justify="space-between" mb="xs">
                  <Text c="dimmed">Shipping</Text>
                  <Text>₹{totals.shipping}</Text>
                </Group>
                <Divider my="sm" />
                <Group justify="space-between" mb="md">
                  <Text fw={700}>Total</Text>
                  <Text fw={700}>₹{totals.grandTotal}</Text>
                </Group>
                <Button fullWidth color="green" onClick={onPlaceOrder}>
                  Place Order
                </Button>
                <Button fullWidth variant="subtle" mt="sm" onClick={() => dispatch(clearCart())}>
                  Clear Cart
                </Button>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      )}

      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
