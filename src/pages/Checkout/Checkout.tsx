import {
  Container, Grid, Card, Group, Text, Image, Button, ActionIcon, Stack, Divider, Box, SimpleGrid, SegmentedControl
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { increaseQty, decreaseQty, removeFromCart, clearCart } from "../../redux/features/cartSlice";
import { useMemo, useState } from "react";
import axios from "axios";

import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { loadRazorpay } from "../../utils/loadRazorpay";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;
const CREATE_ORDER_URL = "/payments/razorpay/order";
const CREATE_PAYMENT_LINK_URL = "/api/payments/razorpay/payment-link";
const VERIFY_URL = "/payments/razorpay/verify";

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

// ✅ Shipment API call function
async function createShipment(orderId: string, amount: number, isCOD: boolean) {
  try {
    const payload = {
      shipments: [
        {
          name: "John Doe",
          add: "123 Main St, City, State 12345",
          pin: "400001",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          phone: "9876543210",
          products_desc: "Test Product",
          cod_amount: isCOD ? String(amount) : "0",
          order_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          total_amount: String(amount),
          quantity: "1",
        },

      ],
      orderId: orderId,
    };

    const { data } = await axiosInstance.post(
      "/delhivery/shipment",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Delhivery response:", data);
    return data;
  } catch (err) {
    console.error("Delhivery shipment error:", err);
    throw err;
  }
}

export default function Checkout() {
  const items = useSelector((s: any) => s.cart.items) as CartItem[];
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [payLoading, setPayLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const totals = useMemo(() => {
    const subtotal = (items || []).reduce((sum, i) => {
      const p = i.salePrice ?? i.price ?? 0;
      return sum + p * (i.qty ?? 1);
    }, 0);
    const shipping = items?.length ? 50 : 0;
    const codFee = paymentMethod === "COD" ? 100 : 0;
    const grandTotal = subtotal + shipping + codFee;
    return { subtotal, shipping, codFee, grandTotal };
  }, [items, paymentMethod]);

  const ensureAuth = () => {
    if (!isAuthenticated) {
      navigate("/account");
      return false;
    }
    return true;
  };

  const onPayNow = async () => {
    if (!ensureAuth()) return;
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
        notes: { itemCount: String(items.length) },
        // items: items
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

            // 📦 Create shipment after Razorpay success
            await createShipment(order.id, totals.grandTotal, false);
          } else {
            alert("Payment verification failed.");
          }
        },
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
    if (!ensureAuth()) return;
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
    if (!ensureAuth()) return;
    try {
      if (!items?.length) return;

      alert(`COD order placed! Total: ₹${totals.grandTotal} (incl. ₹${totals.shipping} shipping + ₹${totals.codFee} COD fee)`);
      dispatch(clearCart());

      // 📦 Create shipment for COD order
      await createShipment('null', totals.grandTotal, true);
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
            {/* LEFT: Items */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Box>
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

            {/* RIGHT: Payments */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card
                withBorder
                p="lg"
                radius="md"
                styles={{
                  root: {
                    [`@media (min-width: 1024px)`]: {
                      position: "sticky",
                      top: 16,
                      maxHeight: "calc(100vh - 32px)",
                      overflow: "hidden",
                    },
                  },
                }}
              >
                <Text fw={700} mb="md">Order Summary</Text>

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

                {paymentMethod === "RAZORPAY" ? (
                  <Stack gap="xs">
                    <Button
                      fullWidth
                      color="green"
                      onClick={onPayNow}
                      loading={payLoading}
                      disabled={!items?.length || totals.grandTotal <= 0}
                    >
                      Pay Now (Razorpay)
                    </Button>
                    <Button
                      fullWidth
                      variant="light"
                      onClick={onPayWithLink}
                      disabled={!items?.length || totals.grandTotal <= 0}
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
                  >
                    Place COD Order
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="subtle"
                  mt="sm"
                  onClick={() => dispatch(clearCart())}
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