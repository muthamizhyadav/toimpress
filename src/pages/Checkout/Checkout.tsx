import {
  Container, Grid, Card, Group, Text, Image, Button, ActionIcon, Stack, Divider, Box, SimpleGrid, SegmentedControl
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { increaseQty, decreaseQty, removeFromCart, clearCart } from "../../redux/features/cartSlice";
import { useMemo, useState } from "react";

import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { loadRazorpay } from "../../utils/loadRazorpay";
import axiosInstance from "../../api/axiosInstance";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;
const CREATE_ORDER_URL = "/api/payments/razorpay/order";
const CREATE_PAYMENT_LINK_URL = "/api/payments/razorpay/payment-link";
const VERIFY_URL = "/api/payments/razorpay/verify";

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
        <Box
          w={100}
          h={100}
          style={{ borderRadius: 8, overflow: "hidden", flexShrink: 0 }}
        >
          <Image
            src={img}
            alt={item.title}
            width={100}
            height={100}
            fit="cover"
            styles={{ image: { objectFit: "cover" } }}
            withPlaceholder
          />
        </Box>

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

          <Group gap="xs" mt={2} wrap="nowrap">
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
  const [payLoading, setPayLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");

  const totals = useMemo(() => {
    const subtotal = (items || []).reduce((sum, i) => {
      const p = i.salePrice ?? i.price ?? 0;
      return sum + p * (i.qty ?? 1);
    }, 0);
    const shipping = items?.length ? 50 : 0; // default shipping
    const codFee = paymentMethod === "COD" ? 100 : 0;
    const grandTotal = subtotal + shipping + codFee;
    return { subtotal, shipping, codFee, grandTotal };
  }, [items, paymentMethod]);

  const onPayNow = async () => {
    try {
      if (!items?.length) return;
      const amountPaise = Math.round(totals.grandTotal * 100);
      if (amountPaise <= 0) return;

      setPayLoading(true);
      await loadRazorpay();

      const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
        amount: amountPaise,
        currency: "INR",
        receipt: "rcpt_" + Date.now(),
        notes: { itemCount: String(items.length) }
      });

      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TO IMPRESS",
        description: "Order Payment",
        order_id: order.id,
        prefill: { name: "To Impress Customer", email: "customer@example.com", contact: "9000000000" },
        notes: { cartItems: String(items.length), source: "web_checkout" },
        theme: { color: "#0FA958" },
        handler: async (resp: any) => {
          const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
          if (verify?.valid) {
            dispatch(clearCart());
            alert("Payment successful!");
          } else {
            alert("Payment verification failed.");
          }
        }
      });

      rzp.on("payment.failed", (e: any) => {
        console.error("Payment failed:", e?.error);
        alert(e?.error?.description || "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Unable to start payment. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  const onPayWithLink = async () => {
    try {
      const amountPaise = Math.round(totals.grandTotal * 100);
      const { data } = await axiosInstance.post(CREATE_PAYMENT_LINK_URL, {
        amount: amountPaise,
        currency: "INR",
        items,
      });
      const paymentUrl = data?.short_url || data?.payment_link?.short_url || data?.url;
      if (!paymentUrl) throw new Error("Payment link URL not returned");
      window.location.assign(paymentUrl);
    } catch (err) {
      console.error(err);
      alert("Unable to start payment. Please try again.");
    }
  };

  const onPlaceCOD = async () => {
    try {
      if (!items?.length) return;
      // await axiosInstance.post('/api/orders/cod', { items, totals });
      alert(`COD order placed! Total: ₹${totals.grandTotal} (incl. ₹${totals.shipping} shipping + ₹${totals.codFee} COD fee)`);
      dispatch(clearCart());
    } catch (err) {
      console.error(err);
      alert("Unable to place COD order. Please try again.");
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
            {/* LEFT: Items (scrollable on desktop) */}
            <Grid.Col span={{ base: 12, md: 7 }}> {/* wider right: 7/5 split */}
              <Box
                style={{
                  // only scrollable on desktop
                  maxHeight: "unset",
                  overflowY: "visible",
                }}
              >
               <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
                  {items.map((item, idx) => (
                    <CheckoutItemBox
                      key={`${item.id}-${item.size ?? ""}-${item.color ?? ""}-${idx}`}
                      item={item}
                      onMinus={() =>
                        dispatch(decreaseQty({ id: item.id, size: item.size, color: item.color, silent: true }))
                      }
                      onPlus={() =>
                        dispatch(increaseQty({ id: item.id, size: item.size, color: item.color, silent: true }))
                      }
                      onRemove={() =>
                        dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color, silent: true }))
                      }
                    />
                  ))}
                </SimpleGrid>
              </Box>
            </Grid.Col>

            {/* RIGHT: Sticky payments/summary */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card
                withBorder
                p="lg"
                radius="md"
                style={{
                  position: "static",
                }}
                styles={{
                  root: {
                    // sticky only on desktops
                    [`@media (min-width: 1024px)`]: {
                      position: "sticky",
                      top: 16,
                      maxHeight: "calc(100vh - 32px)",
                      overflow: "hidden",
                    },
                  },
                }}
              >
                <Text fw={700} mb="md" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Order Summary
                </Text>

                {/* Payment method selector */}
                <Stack gap="xs" mb="sm">
                  <Text fw={600} size="sm">Payment Method</Text>
                  <SegmentedControl
                    value={paymentMethod}
                    onChange={(v) => setPaymentMethod(v as any)}
                    data={[
                      { label: "Razorpay (UPI/Card)", value: "RAZORPAY" },
                      { label: "Cash on Delivery (COD)", value: "COD" },
                    ]}
                  />
                </Stack>

                <Group justify="space-between" mb="xs">
                  <Text c="dimmed">Subtotal</Text>
                  <Text>₹{totals.subtotal}</Text>
                </Group>
                <Group justify="space-between" mb="xs">
                  <Text c="dimmed">Shipping</Text>
                  <Text>₹{totals.shipping}</Text>
                </Group>
                {paymentMethod === "COD" && (
                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">COD Fee</Text>
                    <Text>₹{totals.codFee}</Text>
                  </Group>
                )}
                <Divider my="sm" />
                <Group justify="space-between" mb="md">
                  <Text fw={700}>Total</Text>
                  <Text fw={700}>₹{totals.grandTotal}</Text>
                </Group>

                {/* Actions: text truncation so nothing spills outside */}
                {paymentMethod === "RAZORPAY" ? (
                  <Stack gap="xs">
                    <Button
                      fullWidth
                      color="green"
                      onClick={onPayNow}
                      loading={payLoading}
                      disabled={!items?.length || totals.grandTotal <= 0}
                      styles={{ root: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }}
                    >
                      Pay Now (Razorpay)
                    </Button>
                    <Button
                      fullWidth
                      variant="light"
                      onClick={onPayWithLink}
                      disabled={!items?.length || totals.grandTotal <= 0}
                      styles={{ root: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }}
                    >
                      Pay via Payment Link
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    fullWidth
                    color="dark"
                    onClick={onPlaceCOD}
                    disabled={!items?.length || totals.grandTotal <= 0}
                    styles={{ root: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }}
                  >
                    Place COD Order
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="subtle"
                  mt="sm"
                  onClick={() => dispatch(clearCart())}
                  styles={{ root: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }}
                >
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