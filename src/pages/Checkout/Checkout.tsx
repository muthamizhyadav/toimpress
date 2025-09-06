import {
  Container,
  Grid,
  Card,
  Group,
  Text,
  Image,
  Button,
  ActionIcon,
  Stack,
  Divider,
  Box,
  SimpleGrid,
  SegmentedControl,
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { increaseQty, decreaseQty, removeFromCart, clearCart } from "../../redux/features/cartSlice";
import { useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { loadRazorpay } from "../../utils/loadRazorpay";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;
const CREATE_ORDER_URL = "/payments/razorpay/order";
const CREATE_PAYMENT_LINK_URL = "/api/payments/razorpay/payment-link";
const VERIFY_URL = "/payments/razorpay/verify";

// GST percent (5%)
const GST_PERCENT = 0.05;

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

/* Checkout item UI */
function CheckoutItemBox({
  item,
  onMinus,
  onPlus,
  onRemove,
}: {
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
        <Box w={100} h={100} style={{ borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
          <Image src={img} alt={item.title} width={100} height={100} fit="cover" withPlaceholder />
        </Box>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm" lineClamp={2}>
            {item.title}
          </Text>
          <Group gap="xs" wrap="wrap">
            {item.size && <Text size="xs" c="dimmed">Size: {item.size}</Text>}
            {item.color && <Text size="xs" c="dimmed">Color: {item.color}</Text>}
          </Group>

          <Group gap="xs" align="center">
            <Text fw={700} size="sm">₹{unitPrice}</Text>
            {item.salePrice && <Text size="xs" c="dimmed" td="line-through">₹{item.price}</Text>}
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

/**
 * Create shipment using address passed in.
 * address shape expected to contain at least:
 *  - line1, line2 or street
 *  - city
 *  - state
 *  - zip or pincode
 *  - country
 *  - phone
 *
 * items: cart items to derive products_desc and quantity
 */
async function createShipment(orderId: string, amount: number, isCOD: boolean, codCollectAmount: number, address: any, items: CartItem[]) {
  try {
    // fallbacks and normalization
    const name = (address && (address.name || address.fullName || address.line1)) || "Customer";
    const line1 = (address && (address.line1 || address.street || "")) || "";
    const line2 = (address && (address.line2 || "")) || "";
    const add = `${line1}${line2 ? ", " + line2 : ""}`.trim() || "";
    const pin = (address && (address.pincode || address.zip || address.pin)) || "";
    const city = (address && (address.city || "")) || "";
    const state = (address && (address.state || "")) || "";
    const country = (address && (address.country || "India")) || "India";
    const phone = (address && (address.phone || address.mobile || "")) || "";
    const products_desc = (items || []).map((it) => it.title).join(", ") || "Products";
    const quantity = (items || []).reduce((s, it) => s + (it.qty ?? 1), 0);

    const payload = {
      shipments: [
        {
          name,
          add,
          pin,
          city,
          state,
          country,
          phone,
          products_desc,
          // cod_amount should reflect the amount to be collected by delivery agent
          cod_amount: isCOD ? String(Math.max(0, Math.round(codCollectAmount))) : "0",
          order_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          total_amount: String(Math.round(amount)),
          quantity: String(quantity || 1),
        },
      ],
      orderId: orderId,
    };

    const { data } = await axiosInstance.post("/delhivery/shipment", payload, { headers: { "Content-Type": "application/json" } });
    console.log("Delhivery response:", data);
    return data;
  } catch (err) {
    console.error("Delhivery shipment error:", err);
    throw err;
  }
}

export default function Checkout() {
  const items = useSelector((s: any) => s.cart.items) as CartItem[];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [payLoading, setPayLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");

  const COD_TOKEN = 100;

  // select user and stored userAddress (flat or null)
  const { user, storedUserAddress } = useSelector((state: RootState) => ({
    user: state.auth.user as any,
    storedUserAddress: state.auth.userAddress as any,
  }));

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // flatten address: prefer saved userAddress, otherwise fallback to user.address[0]
  const flatUserAddress: any =
    storedUserAddress ??
    (user && Array.isArray((user as any).address) && (user as any).address.length > 0
      ? (user as any).address[0]
      : null);

  // totals: includes GST (5%) and shipping only for COD
  const totals = useMemo(() => {
    const subtotal = (items || []).reduce((sum, i) => {
      const p = i.salePrice ?? i.price ?? 0;
      return sum + p * (i.qty ?? 1);
    }, 0);

    const gstRaw = subtotal * GST_PERCENT;
    const gst = Math.round(gstRaw); // round GST to nearest rupee
    // Shipping applies only for COD
    const shipping = paymentMethod === "COD" && items?.length ? 50 : 0;

    const grandTotal = Math.round(subtotal + gst + shipping);

    return { subtotal: Math.round(subtotal), gst, shipping, grandTotal };
  }, [items, paymentMethod]);

  const ensureAuthAndAddress = () => {
    if (!isAuthenticated) {
      navigate("/account");
      return false;
    }
    if (!flatUserAddress) {
      // no address saved — send to account page so user can add address
      navigate("/account");
      return false;
    }
    return true;
  };

  // RAZORPAY full payment flow (UPI/Card) — shipping free here; amount includes GST
  const onPayNow = async () => {
    if (!ensureAuthAndAddress()) return;
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
        notes: { itemCount: String(items.length), paymentType: "FULL" },
      });

      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TO IMPRESS",
        description: "Order Payment",
        order_id: order.id,
        prefill: { name: user?.name || "Customer", email: user?.email || "customer@example.com", contact: user?.mobile || user?.phone || "9000000000" },
        notes: { cartItems: String(items.length), source: "web_checkout_full" },
        theme: { color: "#0FA958" },
        handler: async (resp: any) => {
          try {
            const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
            if (verify?.valid) {
              dispatch(clearCart());
              // create shipment using user's address; non-COD so cod_amount=0
              await createShipment(order.id, totals.grandTotal, false, 0, flatUserAddress, items);
              navigate("/order-success");
            } else {
              alert("Payment verification failed.");
            }
          } catch (e) {
            console.error("Verification/create shipment error:", e);
            alert("Payment succeeded but verification or shipment creation failed. Please contact support.");
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

  // Payment link
  const onPayWithLink = async () => {
    if (!ensureAuthAndAddress()) return;
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

  // COD flow
  const onPlaceCOD = async () => {
    if (!ensureAuthAndAddress()) return;
    try {
      if (!items?.length) return;

      // Determine token & remaining
      const tokenToCollect = Math.min(COD_TOKEN, Math.round(totals.grandTotal));
      const remainingCodAmount = Math.max(0, Math.round(totals.grandTotal - tokenToCollect));

      // If tokenToCollect is zero, place COD with full collection on delivery
      if (tokenToCollect <= 0) {
        await createShipment("null", totals.grandTotal, true, totals.grandTotal, flatUserAddress, items);
        dispatch(clearCart());
        alert(`COD order placed! Delivery agent will collect ₹${totals.grandTotal}.`);
        navigate("/order-success");
        return;
      }

      // collect token via Razorpay
      setPayLoading(true);
      await loadRazorpay();

      const tokenPaise = Math.round(tokenToCollect * 100);
      const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
        amount: tokenPaise,
        currency: "INR",
        receipt: "cod_token_rcpt_" + Date.now(),
        notes: { itemCount: String(items.length), paymentType: "COD_TOKEN" },
      });

      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TO IMPRESS",
        description: `COD token - ₹${tokenToCollect}`,
        order_id: order.id,
        prefill: { name: user?.name || "Customer", email: user?.email || "customer@example.com", contact: user?.mobile || user?.phone || "9000000000" },
        notes: { cartItems: String(items.length), source: "web_cod_token" },
        theme: { color: "#0FA958" },
        handler: async (resp: any) => {
          try {
            const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
            if (verify?.valid) {
              dispatch(clearCart());
              alert(`Token payment of ₹${tokenToCollect} successful! COD order placed. Delivery agent will collect ₹${remainingCodAmount} on delivery.`);

              // create shipment using user's address; cod_amount is remainingCodAmount
              await createShipment(order.id || "null", totals.grandTotal, true, remainingCodAmount, flatUserAddress, items);

              navigate("/order-success");
            } else {
              alert("Token payment verification failed. Please contact support.");
            }
          } catch (e) {
            console.error("Verification or shipment create failed:", e);
            alert("Token payment succeeded but verification or shipment creation failed. Please contact support.");
          }
        },
      });

      rzp.on("payment.failed", (e: any) => {
        console.error("Token payment failed:", e?.error);
        alert(e?.error?.description || "Token payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Unable to place COD order. Please try again.");
    } finally {
      setPayLoading(false);
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
                      onMinus={() => dispatch(decreaseQty({ id: item.id, size: item.size, color: item.color, silent: true }))}
                      onPlus={() => dispatch(increaseQty({ id: item.id, size: item.size, color: item.color, silent: true }))}
                      onRemove={() => dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color, silent: true }))}
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
                  <Text c="dimmed">GST (5%)</Text>
                  <Text>₹{totals.gst}</Text>
                </Group>

                {paymentMethod === "COD" ? (
                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">Shipping</Text>
                    <Text>₹{totals.shipping}</Text>
                  </Group>
                ) : (
                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">Shipping</Text>
                    <Text>Free</Text>
                  </Group>
                )}

                {paymentMethod === "COD" && (
                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">COD Advance (₹100 will be collected)</Text>
                    <Text>₹{Math.min(COD_TOKEN, Math.round(totals.grandTotal))}</Text>
                  </Group>
                )}

                <Divider my="sm" />
                <Group justify="space-between" mb="md">
                  <Text fw={700}>Total</Text>
                  <Text fw={700}>₹{totals.grandTotal}</Text>
                </Group>

                {paymentMethod === "RAZORPAY" ? (
                  <Stack gap="xs">
                    <Button fullWidth color="green" onClick={onPayNow} loading={payLoading} disabled={!items?.length || totals.grandTotal <= 0}>
                      Pay Now (Online)
                    </Button>
                    <Text size="xs" c="dimmed" align="center">Shipping is free for UPI/Card orders.</Text>
                    {/* <Button fullWidth variant="light" onClick={onPayWithLink} disabled={!items?.length || totals.grandTotal <= 0}>
                      Pay via Payment Link
                    </Button> */}
                  </Stack>
                ) : (
                  <Button fullWidth color="dark" onClick={onPlaceCOD} loading={payLoading} disabled={!items?.length || totals.grandTotal <= 0}>
                    Place COD Order
                  </Button>
                )}

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