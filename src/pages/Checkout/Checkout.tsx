// src/pages/Checkout.tsx
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
  Loader,
  Badge,
  Paper,
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash, IconInfoCircle, IconPencil } from "@tabler/icons-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { loadRazorpay } from "../../utils/loadRazorpay";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { API_GET_UPDATE, API_CART } from "../../api/api";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../../redux/features/cartSlice";

// ✅ Vite/ESM-safe persistor loader
let _persistorCache: any | undefined;
export async function getPersistor(): Promise<any | null> {
  if (_persistorCache !== undefined) return _persistorCache; // cached (can be null)
  try {
    const mod = await import("../../redux/store"); // adjust path if needed
    _persistorCache = (mod as any)?.persistor ?? null;
  } catch {
    _persistorCache = null;
  }
  return _persistorCache;
}

// Razorpay config & constants
const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;
const CREATE_ORDER_URL = "/payments/razorpay/order";
const VERIFY_URL = "/payments/razorpay/verify";
const SERVER_CREATE_ORDER_URL = "/orders";
const DELHIVERY_SHIPMENT_URL = "/delhivery/shipment";
const BASE_URL = window.location.origin; // used in callback_url

// GST percent (5%)
const GST_PERCENT = 0.05;
const COD_TOKEN = 100;
const COD_SHIPPING = 50;

// Colour tokens
const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#92B775";

// Device detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Force reliable in-modal flow: UPI 'collect' (no redirect, no intent)
const getEnhancedRazorpayOptions = (baseOptions: any) => {
  return {
    ...baseOptions,

    // ✅ Stay inside modal, do not redirect to callback_url
    redirect: false,

    // ✅ Methods allowed
    method: {
      upi: true,
      card: true,
      wallet: true,
      netbanking: true,
    },

    // ✅ Critical: force UPI 'collect' (NOT 'intent')
    upi: {
      flow: "collect",
    },

    // Optional UI blocks (show UPI first)
    config: {
      display: {
        blocks: {
          upi: {
            name: "Pay using UPI (Enter UPI ID)",
            instruments: [{ method: "upi", flows: ["collect"] }],
          },
          card: { name: "Pay using Cards", instruments: [{ method: "card" }] },
          wallet: { name: "Pay using Wallets", instruments: [{ method: "wallet" }] },
        },
        hide: [],
        sequence: ["block.upi", "block.card", "block.wallet"],
        preferences: { show_default_blocks: true },
      },
    },

    modal: {
      ondismiss() {
        console.log("Payment modal was closed by user");
      },
      escape: true,
      backdrop_close: false,
    },

    retry: {
      enabled: true,
      max_count: 3,
    },
  };
};


type CartItem = {
  id: string;
  productId?: string;
  title: string;
  image?: string;
  size?: string;
  color?: string;
  price?: number;
  salePrice?: number;
  qty: number;
  raw?: any;
};

function CheckoutItemBox({
  item,
  onMinus,
  onPlus,
  onRemove,
  promo,
  prodId,
  subtotal,
}: {
  item: CartItem;
  onMinus: () => void;
  onPlus: () => void;
  onRemove: () => void;
  promo?: { threshold: number; discountPercent: number; applied: boolean } | null;
  prodId?: any;
  subtotal: number;
}) {
  const unitPrice = item.salePrice ?? item.price ?? 0;
  const lineTotal = unitPrice * (item.qty ?? 1);
  const img = item.image ?? "";
  const showPromoHint = promo && !promo.applied && subtotal < promo.threshold;
  const remaining = promo ? Math.max(0, promo.threshold - subtotal) : 0;
  const navigate = useNavigate();

  return (
    <Card withBorder radius="md" p="sm">
      {/* Product row */}
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Box
          w={100}
          h={100}
          style={{ borderRadius: 8, overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
          onClick={() => navigate(`/product?id=${prodId}`)}
        >
          <Image src={img} alt={item.title} width={100} height={100} fit="cover" withPlaceholder />
        </Box>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="flex-start">
            <Text fw={600} size="sm" lineClamp={2}>
              {item.title}
            </Text>
            {item.raw?.isOfferAvailable ? (
              <Badge style={{ backgroundColor: LIGHT_GREEN, color: DARK_GREEN }}>OFFER APPLIED</Badge>
            ) : null}
          </Group>

          <Group gap="xs" wrap="wrap">
            {item.size && <Text size="xs" c="dimmed">Size: {item.size}</Text>}
            {item.color && (
              <Group gap={6} align="center">
                <Text size="xs" c="dimmed">Color:</Text>
                <Box
                  w={14}
                  h={14}
                  style={{
                    backgroundColor: item.color,
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                  }}
                  title={item.color}
                />
              </Group>
            )}
          </Group>

          <Group gap="xs" align="center">
            <Text fw={700} size="sm">₹{unitPrice}</Text>
            {item.salePrice && item.price && (
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

          {item.raw?.buy3For999 && (
            <Paper radius="sm" p="xs" style={{ backgroundColor: "#f3fbf4" }}>
              <Group gap={6}>
                <Text size="sm" style={{ color: DARK_GREEN }}>✓</Text>
                <Text size="sm" style={{ color: DARK_GREEN }}>Buy 3 For 999</Text>
                <Text size="xs" c="dimmed">({item.qty} Qty)</Text>
              </Group>
            </Paper>
          )}
        </Stack>
      </Group>

      {/* Promo hint */}
      {showPromoHint && promo && (
        <Paper
          radius="sm"
          p="xs"
          mt="6px"
          style={{ backgroundColor: "#f3fbf4", borderLeft: `4px solid ${LIGHT_GREEN}`, width: "100%" }}
        >
          <Text size="xs" style={{ color: DARK_GREEN, fontWeight: 700 }}>
            Buy above ₹{promo.threshold} — flat {promo.discountPercent}% off
          </Text>
          <Text size="xs" c="dimmed">
            Add ₹{remaining} more to get the offer
          </Text>
        </Paper>
      )}
    </Card>
  );
}

function mapServerCartToItems(respData: any): CartItem[] {
  const root = respData ?? {};
  const payload = root.data ?? root;

  if (Array.isArray(payload)) {
    return payload.map((it: any) => ({
      id: it._id ?? it.id ?? String(it.product ?? it.productId ?? Date.now()),
      productId: it.product ?? it.productId,
      title: it.productName ?? it.productTitle ?? it.title ?? "Product",
      image: it.image ?? it.imageUrl ?? "",
      size: it.selectedSize ?? it.size,
      color: it.selectedColor ?? it.color,
      price: it.price ?? undefined,
      salePrice: it.salePrice ?? it.price ?? undefined,
      qty: Number(it.itemqty ?? it.quantity ?? it.qty ?? 1),
      raw: it,
    }));
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items.map((it: any) => ({
      id: it._id ?? it.id ?? String(it.product ?? it.productId ?? Date.now()),
      productId: it.product ?? it.productId,
      title: it.productTitle ?? it.title ?? it.productName ?? "Product",
      image: it.image ?? it.imageUrl ?? "",
      size: it.selectedSize ?? it.size,
      color: it.selectedColor ?? it.color,
      price: it.price ?? undefined,
      salePrice: it.salePrice ?? it.price ?? undefined,
      qty: Number(it.quantity ?? it.qty ?? it.itemqty ?? 1),
      raw: it,
    }));
  }

  if (payload && typeof payload.product !== "undefined" && typeof payload.itemqty !== "undefined") {
    return [
      {
        id: payload.id ?? payload._id ?? payload.product,
        productId: payload.product,
        title: payload.productTitle ?? payload.productName ?? "Product",
        image: payload.image ?? "",
        size: payload.selectedSize ?? payload.size,
        color: payload.selectedColor ?? payload.color,
        price: payload.price ?? undefined,
        salePrice: payload.salePrice ?? payload.price ?? undefined,
        qty: Number(payload.itemqty ?? 1),
        raw: payload,
      },
    ];
  }

  return [];
}

export default function Checkout() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [payLoading, setPayLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors (adapt to your store shape if needed)
  const reduxUser = useSelector((state: any) => state.auth?.user ?? state.user?.user ?? null);
  const reduxAddress = useSelector((state: any) => state.auth?.user?.address ?? state.user?.user?.address ?? state.address ?? null);

  const [user, setUser] = useState<any>(null);
  const [storedUserAddress, setStoredUserAddress] = useState<any>(null);

  // coupon state
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // saved scheme (driven from server response)
  const [savedScheme, setSavedScheme] = useState<any>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axiosInstance.get(API_GET_UPDATE);

      const mapped = mapServerCartToItems(resp.data ?? resp);
      setItems(mapped);

      // normalize scheme
      const root = resp?.data ?? resp;
      if (root && typeof root.isDiscountApplicable !== "undefined") {
        const parsed = {
          ...root,
          totalSalesPrice: Number(root.totalSalesPrice ?? root.total_sales_price ?? 0),
          minusValue: Number(root.minusValue ?? root.minus_value ?? root.discountAmount ?? 0),
          finalAmount: Number(root.finalAmount ?? root.final_amount ?? 0),
          gst: Math.round(Number(root.gst ?? 0)),
          couponAmount: Number(root.couponAmount ?? root.coupon_amount ?? 0),
          discountvalue:
            root.discountvalue ?? root.discount_value ?? root.couponOfferDiscount ?? root.discountvalue ?? 0,
          isDiscountApplicable: Boolean(root.isDiscountApplicable),
        };
        setSavedScheme(parsed);
      } else if (root && root.scheme && typeof root.scheme.isDiscountApplicable !== "undefined") {
        const s = root.scheme;
        const parsed = {
          ...s,
          totalSalesPrice: Number(s.totalSalesPrice ?? s.total_sales_price ?? 0),
          minusValue: Number(s.minusValue ?? s.minus_value ?? s.discountAmount ?? 0),
          finalAmount: Number(s.finalAmount ?? s.final_amount ?? 0),
          gst: Math.round(Number(s.gst ?? 0)),
          couponAmount: Number(s.couponAmount ?? s.coupon_amount ?? 0),
          discountvalue:
            s.discountvalue ?? s.discount_value ?? s.couponOfferDiscount ?? s.discountvalue ?? 0,
          isDiscountApplicable: Boolean(s.isDiscountApplicable),
        };
        setSavedScheme(parsed);
      } else {
        setSavedScheme(null);
      }
    } catch (err: any) {
      console.error("Fetch cart failed", err);
      showNotification({
        title: "Unable to load cart",
        message: err?.response?.data?.message ?? "Please try again later",
        color: "red",
        icon: <IconX size={16} />,
      });
      setItems([]);
      setSavedScheme(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (reduxUser) setUser(reduxUser);
    if (reduxAddress) setStoredUserAddress(reduxAddress);
  }, [reduxUser, reduxAddress]);

  const updateLineQuantity = async (line: CartItem, newQuantity: number) => {
    try {
      const body = {
        productId: String(line.productId ?? line.id),
        quantity: newQuantity,
        selectedSize: line.size,
        selectedColor: line.color,
      };
      const resp = await axiosInstance.post(API_CART, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (resp?.status === 200 && resp?.data) {
        showNotification({
          title: newQuantity === 0 ? "Removed" : "Quantity updated",
          message:
            resp.data?.message ??
            (newQuantity === 0 ? "Item removed" : `Quantity updated to ${newQuantity}`),
          color: "green",
          icon: <IconCheck size={16} />,
        });

        // keep local store in sync for this variant
        try {
          await dispatch(
            removeFromCart({
              id: String(line.productId ?? line.id),
              size: line.size ?? "",
              color: line.color ?? "",
              selectedColor: line.color ?? "",
              silent: true,
            })
          );
        } catch (e) {
          console.warn("Redux removeFromCart failed:", e);
        }

        await fetchCart();
      } else {
        showNotification({
          title: "Update failed",
          message: "Unable to update cart. Try again.",
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (err: any) {
      console.error("Update line failed", err);
      showNotification({
        title: "Update failed",
        message: err?.response?.data?.message ?? err?.message ?? "Unable to update cart",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleMinus = (item: CartItem) => {
    const nextQty = Math.max(0, item.qty - 1);
    updateLineQuantity(item, nextQty);
  };
  const handlePlus = (item: CartItem) => {
    const nextQty = item.qty + 1;
    updateLineQuantity(item, nextQty);
  };
  const handleRemove = (item: CartItem) => {
    updateLineQuantity(item, 0);
  };

  const ensureAuthAndAddress = () => {
    const flatUserAddress = reduxAddress ?? storedUserAddress ?? null;
    if (!flatUserAddress) {
      showNotification({
        title: "Address required",
        message: "Add your address in account before checkout",
        color: "yellow",
        icon: <IconInfoCircle size={16} />,
      });
      navigate("/account");
      return false;
    }
    return true;
  };

  const handleClearCart = async () => {
    if (!items?.length) return;
    const itemsToClear = [...items];

    dispatch(clearCart());

    try {
      setLoading(true);

      // 1) Server: set each item qty = 0 (best-effort)
      await Promise.allSettled(
        itemsToClear.map((it) =>
          axiosInstance.post(API_CART, {
            productId: String(it.productId ?? it.id),
            quantity: 0,
            selectedSize: it.size,
            selectedColor: it.color,
          })
        )
      );

      // 2) Redux: clear slice + purge persisted storage so it doesn't rehydrate
      try {
        const p = await getPersistor();
        if (p?.purge) {
          await p.purge();
        }
      } catch (e) {
        console.warn("Persistor purge failed:", e);
      }

      // Optional hard fallback if persistor import isn't available
      try {
        localStorage.removeItem("persist:root");
        localStorage.removeItem("persist:cart");
      } catch {
        /* ignore */
      }

      // 3) Refresh from server (authoritative)
      await fetchCart();

      showNotification({
        title: "Cart cleared",
        message: "All items removed",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (err: any) {
      console.error("Clear cart failed", err);
      showNotification({
        title: "Clear failed",
        message: err?.response?.data?.message ?? err?.message ?? "Unable to clear cart",
        color: "red",
        icon: <IconX size={16} />,
      });

      // still attempt to clear local redux state (✅ fix: use getPersistor here, not undefined persistor)
      try {
        dispatch(clearCart());
        const p = await getPersistor();
        if (p?.purge) await p.purge();
        localStorage.removeItem("persist:root");
        localStorage.removeItem("persist:cart");
      } catch {
        /* ignore */
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Totals calculation
   */
  const totals = useMemo(() => {
    const localSubtotal = (items || []).reduce((sum, i) => {
      const p = i.salePrice ?? i.price ?? 0;
      return sum + p * (i.qty ?? 1);
    }, 0);

    const totalQty = (items || []).reduce((q, i) => q + (i.qty ?? 0), 0);

    let couponDiscount = 0;
    if (appliedCoupon?.code === "SAVE10") {
      couponDiscount = Math.round(Math.min(100, localSubtotal * 0.1));
    } else if (appliedCoupon) {
      couponDiscount = appliedCoupon.discount ?? 0;
    }

    const totalDiscounts = Math.min(localSubtotal, couponDiscount);
    const discountedBase = localSubtotal - totalDiscounts;
    const gstRaw = discountedBase * GST_PERCENT;
    const gstComputed = Math.round(gstRaw);
    const shipping = paymentMethod === "COD" && items?.length ? COD_SHIPPING : 0;
    const grandTotalComputed = Math.round(discountedBase + gstComputed + shipping);
    const savingsPercentComputed =
      localSubtotal > 0 ? Math.round((totalDiscounts / localSubtotal) * 100) : 0;

    if (savedScheme && savedScheme.isDiscountApplicable) {
      const sTotalSales = Number(savedScheme.totalSalesPrice ?? 0);
      const sMinus = Number(savedScheme.minusValue ?? 0);
      const sFinal = Number(savedScheme.finalAmount ?? 0);
      const sGst = Math.round(Number(savedScheme.gst ?? 0));
      const effectiveFinal = Math.round(sFinal + (paymentMethod === "COD" ? COD_SHIPPING : 0));

      return {
        subtotal: Math.round(sTotalSales),
        totalQty,
        couponDiscount: Number(savedScheme.couponAmount ?? couponDiscount),
        totalDiscounts: Math.round(sMinus),
        gst: Math.round(sGst),
        shipping: paymentMethod === "COD" ? COD_SHIPPING : 0,
        grandTotal: effectiveFinal,
        savingsPercent: sTotalSales > 0 ? Math.round((sMinus / sTotalSales) * 100) : 0,
      };
    }

    return {
      subtotal: Math.round(localSubtotal),
      totalQty,
      couponDiscount,
      totalDiscounts,
      gst: gstComputed,
      shipping,
      grandTotal: grandTotalComputed,
      savingsPercent: savingsPercentComputed,
    };
  }, [items, paymentMethod, appliedCoupon, savedScheme]);

  const promo = useMemo(() => {
    if (savedScheme && typeof savedScheme.isDiscountApplicable !== "undefined") {
      const threshold = Number(savedScheme.couponAmount ?? savedScheme.totalSalesPrice ?? 0);
      const discountPercent = Number(savedScheme.discountvalue ?? savedScheme.couponOfferDiscount ?? 0);
      const applied = Boolean(savedScheme.isDiscountApplicable);
      if (threshold > 0 && discountPercent > 0) return { threshold, discountPercent, applied };
      return null;
    }

    for (const it of items) {
      const raw = it.raw ?? {};
      const threshold = Number(raw.couponDiscount ?? raw.couponAmount ?? raw.coupon_threshold ?? 0);
      const discountPercent = Number(raw.couponOfferDiscount ?? raw.discountvalue ?? raw.couponPercent ?? 0);
      const applied = Boolean(raw.isDiscountApplicable ?? false);
      if (threshold > 0 && discountPercent > 0) {
        return { threshold, discountPercent, applied };
      }
    }

    return null;
  }, [savedScheme, items]);

  const flatUserAddress = reduxAddress ?? storedUserAddress ?? null;

  const applyCoupon = () => {
    const code = (couponCode || "").trim().toUpperCase();
    if (!code) {
      showNotification({
        title: "Coupon",
        message: "Enter a coupon code",
        color: "yellow",
        icon: <IconX size={16} />,
      });
      return;
    }

    if (code === "SAVE10") {
      setAppliedCoupon({ code: "SAVE10", discount: 0 });
      showNotification({
        title: "Coupon applied",
        message: "SAVE10 applied",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } else {
      showNotification({
        title: "Invalid coupon",
        message: "Coupon not recognized",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    showNotification({
      title: "Coupon removed",
      message: "",
      color: "green",
      icon: <IconCheck size={16} />,
    });
  };

  async function createOrderHistory({
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    notes,
    shippingCost,
    tax,
    discount,
    meta,
    amountToChargeOnDelivery,
  }: {
    items: CartItem[];
    shippingAddress?: any;
    billingAddress?: any;
    paymentMethod: string;
    notes?: string;
    shippingCost?: number;
    tax?: number;
    discount?: number;
    meta?: any;
    amountToChargeOnDelivery?: number;
  }) {
    const payload = {
      items: items.map((it) => ({
        product: it.productId ?? it.id,
        quantity: it.qty,
        selectedSize: it.size ?? undefined,
        productUrl: it.image ?? "",
      })),
      shippingAddress: shippingAddress ?? {},
      billingAddress: billingAddress ?? shippingAddress ?? {},
      paymentMethod,
      notes: notes ?? "",
      shippingCost: shippingCost ?? 0,
      tax: tax ?? 0,
      discount: discount ?? 0,
      amountToChargeOnDelivery: amountToChargeOnDelivery ?? null,
      meta: meta ?? {},
    };

    const token =
      (reduxUser && (reduxUser.token ?? reduxUser.accessToken ?? reduxUser.authToken)) ?? null;

    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.authorization = `Bearer ${token}`;

    const resp = await axiosInstance.post(SERVER_CREATE_ORDER_URL, payload, { headers });
    return resp.data ?? resp;
  }

  async function createDelhiveryShipment({
    orderNumber,
    items,
    address,
    paymentMethod,
    totalsLocal,
    meta,
  }: {
    orderNumber: string;
    items: CartItem[];
    address?: any;
    paymentMethod: string;
    totalsLocal?: any;
    meta?: any;
  }) {
    const reduxUserData = reduxUser?.address?.[0] ?? address;
    const name = reduxUserData?.name ?? "Customer";
    const streetParts: string[] = [];
    if (reduxUserData?.street) streetParts.push(reduxUserData.street);
    if (reduxUserData?.line1) streetParts.push(reduxUserData.line1);
    if (reduxUserData?.line2) streetParts.push(reduxUserData.line2);
    if (reduxUserData?.city) streetParts.push(reduxUserData.city);
    if (reduxUserData?.state) streetParts.push(reduxUserData.state);
    const add = streetParts.join(", ") || (reduxUserData?.street ?? "");
    const pin =
      reduxUserData?.zip ?? address?.pin ?? address?.zipCode ?? address?.zipcode ?? "";
    const city = reduxUserData?.city ?? "";
    const state = reduxUserData?.state ?? "";
    const country = reduxUserData?.country ?? "India";
    const phone =
      reduxUserData?.phone ??
      address?.mobile ??
      reduxUser?.mobile ??
      reduxUser?.phone ??
      "0000000000";

    const products_desc = items.map((it) => `${it.title} x${it.qty}`).join(", ");
    const quantity = items.reduce((s, it) => s + (it.qty ?? 0), 0).toString();
    const total_amount = String(totalsLocal?.grandTotal ?? totalsLocal?.subtotal ?? 0);
    const cod_amount =
      paymentMethod === "COD" || paymentMethod === "cod_token"
        ? String(
            totalsLocal?.amountToChargeOnDelivery ??
              totalsLocal?.grandTotal ??
              0
          )
        : "0";
    const order_date = new Date().toISOString().split("T")[0];

    const shipments = [
      {
        name,
        add,
        pin: String(pin ?? ""),
        city,
        state,
        country,
        phone: String(phone),
        orderId: orderNumber,
        products_desc,
        cod_amount,
        order_date,
        total_amount,
        quantity,
      },
    ];

    const token =
      (reduxUser && (reduxUser.token ?? reduxUser.accessToken ?? reduxUser.authToken)) ?? null;

    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await axiosInstance.post(DELHIVERY_SHIPMENT_URL, { shipments }, { headers });
    return resp.data ?? resp;
  }

  const onPayNow = async () => {
    if (!ensureAuthAndAddress()) return;
    try {
      if (!items?.length) {
        showNotification({
          title: "Cart empty",
          message: "Add items to proceed",
          color: "yellow",
          icon: <IconX size={16} />,
        });
        return;
      }

      const baseFinal =
        savedScheme && savedScheme.isDiscountApplicable
          ? Number(savedScheme.finalAmount ?? totals.grandTotal)
          : totals.grandTotal;
      const amountToCollect = Math.round(baseFinal);

      const amountPaise = Math.round(amountToCollect * 100);
      if (amountPaise <= 0) return;

      setPayLoading(true);

      const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
        amount: amountPaise,
        currency: "INR",
        receipt: "rcpt_" + Date.now(),
        notes: { itemCount: String(items.length), paymentType: "FULL" },
      });

      await loadRazorpay();

      const prefillName = (reduxUser?.name ?? user?.name) || "Customer";
      const prefillEmail = (reduxUser?.email ?? user?.email) || "customer@example.com";
      const prefillContact =
        (reduxUser?.mobile ?? reduxUser?.phone ?? user?.mobile ?? user?.phone) ||
        "9000000000";

      const rzpOptions = getEnhancedRazorpayOptions({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TO IMPRESS",
        description: "Order Payment",
        order_id: order.id,
        prefill: { name: prefillName, email: prefillEmail, contact: prefillContact },
        notes: { cartItems: String(items.length), source: "web_checkout_full" },
        theme: { color: DARK_GREEN },
      });


      const rzp = new (window as any).Razorpay({
        ...rzpOptions,

        // Note: for UPI intent, Razorpay will redirect via callback_url (handler won't run).
        // For card/netbanking or collect flow, handler still works.
        handler: async (resp: any) => {
          try {
            const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
            if (verify?.valid) {
              let createdOrder: any = null;
              try {
                createdOrder = await createOrderHistory({
                  items,
                  shippingAddress: flatUserAddress,
                  billingAddress: flatUserAddress,
                  paymentMethod: "online",
                  notes: "",
                  shippingCost: totals.shipping,
                  tax: totals.gst,
                  discount: totals.totalDiscounts,
                  meta: {
                    razorpay: resp,
                    savedScheme:
                      savedScheme && savedScheme.isDiscountApplicable ? savedScheme : null,
                  },
                });
              } catch (orderErr) {
                console.error("Order history creation failed:", orderErr);
                showNotification({
                  title: "Order saved partially",
                  message:
                    "Payment succeeded but we couldn't save order history. Contact support if needed.",
                  color: "yellow",
                  icon: <IconInfoCircle size={16} />,
                });
              }

              try {
                const serverOrderId =
                  createdOrder?.data?.id ||
                  createdOrder?.id ||
                  createdOrder?.orderNumber ||
                  createdOrder?.orderId ||
                  (createdOrder &&
                    (createdOrder.data?.orderNumber || createdOrder.data?.orderId)) ||
                  `ORDER${Date.now()}`;

                if (serverOrderId) {
                  await createDelhiveryShipment({
                    orderNumber: String(serverOrderId),
                    items,
                    address: flatUserAddress,
                    paymentMethod: "online",
                    totalsLocal: totals,
                    meta: { createdOrder },
                  });
                  showNotification({
                    title: "Shipment created",
                    message: "Shipment created successfully with Delhivery.",
                    color: "green",
                    icon: <IconCheck size={16} />,
                  });
                }
              } catch (shipErr) {
                console.error("Delhivery shipment creation failed:", shipErr);
                showNotification({
                  title: "Shipment creation failed",
                  message:
                    "Order was created but shipment creation failed. Support will assist.",
                  color: "yellow",
                  icon: <IconInfoCircle size={16} />,
                });
              }

              await handleClearCart();
              setTimeout(() => {
                navigate("/order-success", { state: { order: createdOrder } });
              }, 2000);
            } else {
              alert("Payment verification failed.");
            }
          } catch (e) {
            console.error("Verification/create shipment error:", e);
            alert(
              "Payment succeeded but verification or shipment creation failed. Please contact support."
            );
          }
        },
      });

      rzp.on("payment.failed", (e: any) => {
        console.error("Payment failed:", e?.error);
        const errorCode = e?.error?.code;
        const errorDescription = e?.error?.description;
        const errorReason = e?.error?.reason;

        let userFriendlyMessage = "Payment failed. Please try again.";

        if (errorCode === "BAD_REQUEST_ERROR") {
          if (errorDescription?.toLowerCase().includes("upi")) {
            userFriendlyMessage =
              "UPI payment failed. Please try with a different UPI app or use Card/Wallet payment.";
          }
        } else if (errorCode === "GATEWAY_ERROR") {
          userFriendlyMessage = "Payment gateway error. Please try again or use a different payment method.";
        } else if (errorCode === "NETWORK_ERROR") {
          userFriendlyMessage = "Network error. Please check your connection and try again.";
        } else if (errorReason === "payment_cancelled") {
          userFriendlyMessage = "Payment was cancelled. You can try again when ready.";
        } else if (errorDescription?.toLowerCase().includes("timeout")) {
          userFriendlyMessage = "Payment timed out. Please check your UPI app and try again.";
        } else if (errorDescription?.toLowerCase().includes("insufficient")) {
          userFriendlyMessage = "Insufficient balance. Please check your account balance and try again.";
        }

        showNotification({
          title: "Payment Failed",
          message: userFriendlyMessage,
          color: "red",
          icon: <IconX size={16} />,
        });

        console.error("Detailed payment error:", {
          code: errorCode,
          description: errorDescription,
          reason: errorReason,
          fullError: e,
        });
      });

      showNotification({
        title: "Opening your UPI app",
        message: "If Google Pay / PhonePe opens, complete the payment and you'll be redirected back.",
        color: "green",
        icon: <IconCheck size={16} />,
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Unable to start payment. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  const onPlaceCOD = async () => {
    if (!ensureAuthAndAddress()) return;
    try {
      if (!items?.length) {
        showNotification({
          title: "Cart empty",
          message: "Add items to proceed",
          color: "yellow",
          icon: <IconX size={16} />,
        });
        return;
      }

      const baseFinal =
        savedScheme && savedScheme.isDiscountApplicable
          ? Number(savedScheme.finalAmount ?? totals.grandTotal)
          : totals.grandTotal;
      const orderTotal = Math.round(baseFinal + COD_SHIPPING);

      const tokenToCollect = COD_TOKEN;
      const remainingAmount = Math.max(0, orderTotal - tokenToCollect);

      if (tokenToCollect <= 0) {
        let createdOrder: any = null;
        try {
          createdOrder = await createOrderHistory({
            items,
            shippingAddress: flatUserAddress,
            billingAddress: flatUserAddress,
            paymentMethod: "cod",
            notes: "",
            shippingCost: COD_SHIPPING,
            tax: totals.gst,
            discount: totals.totalDiscounts,
            meta: {
              immediateCOD: true,
              savedScheme:
                savedScheme && savedScheme.isDiscountApplicable ? savedScheme : null,
            },
            amountToChargeOnDelivery: orderTotal,
          });
        } catch (orderErr) {
          console.error("Order history creation failed (COD immediate):", orderErr);
          showNotification({
            title: "Order saved partially",
            message: "COD placed but could not save order history. Contact support.",
            color: "yellow",
            icon: <IconInfoCircle size={16} />,
          });
        }

        try {
          const serverOrderId =
            createdOrder?.data?.id ||
            createdOrder?.id ||
            createdOrder?.orderNumber ||
            createdOrder?.orderId ||
            (createdOrder &&
              (createdOrder.data?.orderNumber || createdOrder.data?.orderId)) ||
            `ORDER${Date.now()}`;

          if (serverOrderId) {
            await createDelhiveryShipment({
              orderNumber: String(serverOrderId),
              items,
              address: flatUserAddress,
              paymentMethod: "cod",
              totalsLocal: {
                ...totals,
                grandTotal: orderTotal,
                amountToChargeOnDelivery: orderTotal,
              },
              meta: { createdOrder },
            });
            showNotification({
              title: "Shipment created",
              message: "Shipment created successfully with Delhivery.",
              color: "green",
              icon: <IconCheck size={16} />,
            });
          }
        } catch (shipErr) {
          console.error("Delhivery shipment creation failed (COD immediate):", shipErr);
          showNotification({
            title: "Shipment creation failed",
            message: "COD placed but couldn't create shipment. Contact support.",
            color: "yellow",
            icon: <IconInfoCircle size={16} />,
          });
        }

        await handleClearCart();
        showNotification({
          title: "COD placed",
          message: `Delivery agent will collect ₹${orderTotal}`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
        setTimeout(() => {
          navigate("/order-success", { state: { order: createdOrder } });
        }, 2000);
        return;
      }

      setPayLoading(true);

      const tokenPaise = Math.round(tokenToCollect * 100);
      const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
        amount: tokenPaise,
        currency: "INR",
        receipt: "cod_token_rcpt_" + Date.now(),
        notes: { itemCount: String(items.length), paymentType: "COD_TOKEN" },
      });

      await loadRazorpay();

      const prefillName = (reduxUser?.name ?? user?.name) || "Customer";
      const prefillEmail = (reduxUser?.email ?? user?.email) || "customer@example.com";
      const prefillContact =
        (reduxUser?.mobile ?? reduxUser?.phone ?? user?.mobile ?? user?.phone) ||
        "9000000000";

      const rzpOptions = getEnhancedRazorpayOptions({
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "TO IMPRESS",
          description: `COD token - ₹${tokenToCollect}`,
          order_id: order.id,
          prefill: { name: prefillName, email: prefillEmail, contact: prefillContact },
          notes: { cartItems: String(items.length), source: "web_cod_token" },
          theme: { color: DARK_GREEN },
        });


      const rzp = new (window as any).Razorpay({
        ...rzpOptions,

        // For UPI intent this will be bypassed via callback_url.
        handler: async (resp: any) => {
          try {
            const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
            if (verify?.valid) {
              let createdOrder: any = null;
              try {
                createdOrder = await createOrderHistory({
                  items,
                  shippingAddress: flatUserAddress,
                  billingAddress: flatUserAddress,
                  paymentMethod: "cod_token",
                  notes: "",
                  shippingCost: COD_SHIPPING,
                  tax: totals.gst,
                  discount: totals.totalDiscounts,
                  meta: {
                    razorpay: resp,
                    savedScheme:
                      savedScheme && savedScheme.isDiscountApplicable ? savedScheme : null,
                  },
                  amountToChargeOnDelivery: remainingAmount,
                });
              } catch (orderErr) {
                console.error("Order history creation failed (COD token):", orderErr);
                showNotification({
                  title: "Order saved partially",
                  message: "Token paid but could not save order history. Contact support.",
                  color: "yellow",
                  icon: <IconInfoCircle size={16} />,
                });
              }

              try {
                const serverOrderId =
                  createdOrder?.data?.id ||
                  createdOrder?.id ||
                  createdOrder?.orderNumber ||
                  createdOrder?.orderId ||
                  (createdOrder &&
                    (createdOrder.data?.orderNumber || createdOrder.data?.orderId)) ||
                  `ORDER${Date.now()}`;

                if (serverOrderId) {
                  await createDelhiveryShipment({
                    orderNumber: String(serverOrderId),
                    items,
                    address: flatUserAddress,
                    paymentMethod: "cod_token",
                    totalsLocal: {
                      ...totals,
                      grandTotal: orderTotal,
                      amountToChargeOnDelivery: remainingAmount,
                    },
                    meta: { createdOrder },
                  });
                  showNotification({
                    title: "Shipment created",
                    message: "Shipment created successfully with Delhivery.",
                    color: "green",
                    icon: <IconCheck size={16} />,
                  });
                }
              } catch (shipErr) {
                console.error("Delhivery shipment creation failed (COD token):", shipErr);
                showNotification({
                  title: "Shipment creation failed",
                  message: "Token paid but couldn't create shipment. Contact support.",
                  color: "yellow",
                  icon: <IconInfoCircle size={16} />,
                });
              }

              await handleClearCart();
              showNotification({
                title: "COD placed",
                message: `Token ₹${tokenToCollect} paid. Remaining ₹${remainingAmount} on delivery.`,
                color: "green",
                icon: <IconCheck size={16} />,
              });
              navigate("/order-success", { state: { order: createdOrder } });
            } else {
              alert("Token payment verification failed. Please contact support.");
            }
          } catch (e) {
            console.error("Verification or shipment create failed:", e);
            alert(
              "Token payment succeeded but verification or shipment creation failed. Please contact support."
            );
          }
        },
      });

      rzp.on("payment.failed", (e: any) => {
        console.error("Token payment failed:", e?.error);
        const errorCode = e?.error?.code;
        const errorDescription = e?.error?.description;
        const errorReason = e?.error?.reason;

        let userFriendlyMessage = "Token payment failed. Please try again.";

        if (errorCode === "BAD_REQUEST_ERROR") {
          if (errorDescription?.toLowerCase().includes("upi")) {
            userFriendlyMessage =
              "UPI payment failed. Please try with a different UPI app or use Card/Wallet payment.";
          }
        } else if (errorCode === "GATEWAY_ERROR") {
          userFriendlyMessage = "Payment gateway error. Please try again or use a different payment method.";
        } else if (errorCode === "NETWORK_ERROR") {
          userFriendlyMessage = "Network error. Please check your connection and try again.";
        } else if (errorReason === "payment_cancelled") {
          userFriendlyMessage = "Token payment was cancelled. You can try again when ready.";
        } else if (errorDescription?.toLowerCase().includes("timeout")) {
          userFriendlyMessage = "Payment timed out. Please check your UPI app and try again.";
        } else if (errorDescription?.toLowerCase().includes("insufficient")) {
          userFriendlyMessage = "Insufficient balance. Please check your account balance and try again.";
        }

        showNotification({
          title: "Token Payment Failed",
          message: userFriendlyMessage,
          color: "red",
          icon: <IconX size={16} />,
        });

        console.error("Detailed token payment error:", {
          code: errorCode,
          description: errorDescription,
          reason: errorReason,
          fullError: e,
        });
      });

      showNotification({
        title: "Opening your UPI app",
        message: "If Google Pay / PhonePe opens, complete the token payment and you'll be redirected back.",
        color: "green",
        icon: <IconCheck size={16} />,
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Unable to place COD order. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  // Fallback to localStorage if Redux hasn't hydrated on mobile
  useEffect(() => {
    if (!reduxAddress && !storedUserAddress) {
      try {
        const raw = localStorage.getItem("userAddress");
        if (raw) setStoredUserAddress(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, [reduxAddress, storedUserAddress]);

  useEffect(() => {
    if (!reduxUser && !user) {
      try {
        const raw = localStorage.getItem("user");
        if (raw) setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, [reduxUser, user]);

  return (
    <div>
      <SmallHeader />
      <Header />

      {loading ? (
        <Container size="lg" py="xl">
          <Box className="flex items-center justify-center py-24">
            <Loader />
          </Box>
        </Container>
      ) : !items?.length ? (
        <Container size="lg" py="xl">
          <Card p="lg" withBorder>
            <Text fw={600} size="lg">Your cart is empty</Text>
            <Text c="dimmed" size="sm" mt="xs">Add some products to proceed to checkout.</Text>
            <Button mt="md" onClick={async () => { await handleClearCart(); navigate("/"); }}>
              Continue shopping
            </Button>
          </Card>
        </Container>
      ) : (
        <>
          <Container size="lg" py="xl" style={{ paddingBottom: 290 }}>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Box>
                  <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
                    {items.map((item, idx) => {
                      if ((item.qty ?? 0) > 0) {
                        return (
                          <CheckoutItemBox
                            key={`${item.id}-${item.size ?? ""}-${item.color ?? ""}-${idx}`}
                            prodId={item.productId}
                            item={item}
                            onMinus={() => handleMinus(item)}
                            onPlus={() => handlePlus(item)}
                            onRemove={() => handleRemove(item)}
                            promo={
                              promo
                                ? {
                                    threshold: promo.threshold,
                                    discountPercent: promo.discountPercent,
                                    applied: promo.applied,
                                  }
                                : null
                            }
                            subtotal={totals.subtotal}
                          />
                        );
                      }
                      return null;
                    })}
                  </SimpleGrid>
                </Box>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }} mb={120}>
                <Card
                  withBorder
                  p="lg"
                  radius="md"
                  styles={{
                    root: {
                      ["@media (min-width: 1024px)"]: {
                        position: "sticky",
                        top: 16,
                        maxHeight: "calc(100vh - 32px)",
                        overflow: "auto",
                      },
                    },
                  }}
                >
                  <Text fw={700} mb="md">Order Summary</Text>

                  <Stack gap="xs" mb="md">
                    <Group justify="space-between" align="flex-start">
                      <Text size="sm" fw={600}>Shipping to</Text>
                      <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<IconPencil size={14} />}
                        onClick={() => navigate("/account")}
                      >
                        Change
                      </Button>
                    </Group>

                    {flatUserAddress ? (
                      <Paper radius="md" p="sm" withBorder>
                        <Stack gap={2}>
                          <Text size="sm" fw={600}>{flatUserAddress.name || "Customer"}</Text>
                          {flatUserAddress.email ? (
                            <Text size="xs" c="dimmed">{flatUserAddress.email}</Text>
                          ) : null}
                          <Text size="xs" c="dimmed">
                            {[
                              flatUserAddress.line1,
                              flatUserAddress.line2,
                              flatUserAddress.city,
                              flatUserAddress.state,
                              flatUserAddress.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                            {flatUserAddress.pincode ? ` - ${flatUserAddress.pincode}` : ""}
                          </Text>
                          {flatUserAddress.phone ? (
                            <Text size="xs" c="dimmed">Phone: +91 {flatUserAddress.phone}</Text>
                          ) : null}
                          {flatUserAddress.landmark ? (
                            <Text size="xs" c="dimmed">Landmark: {flatUserAddress.landmark}</Text>
                          ) : null}
                        </Stack>
                      </Paper>
                    ) : (
                      <Paper radius="md" p="sm" withBorder>
                        <Stack gap={6}>
                          <Text size="sm" c="dimmed">No address found.</Text>
                          <Button
                            size="xs"
                            onClick={() => navigate("/account")}
                            sx={{
                              backgroundColor: DARK_GREEN,
                              color: "#fff",
                              "&:hover": { backgroundColor: "#0f2a12" },
                              alignSelf: "flex-start",
                            }}
                          >
                            Add Address
                          </Button>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>

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

                  {savedScheme && savedScheme.isDiscountApplicable && (
                    <Paper radius="md" p="12px" mb="12px" style={{ backgroundColor: "#f3fbf4", border: `1px solid ${LIGHT_GREEN}` }}>
                      <Text size="sm" fw={700} style={{ color: DARK_GREEN }}>
                        Buy above ₹{Math.round(Number(savedScheme.couponAmount ?? 0))} and get flat {savedScheme.discountvalue}% off
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        Scheme applied: <span style={{ color: DARK_GREEN, fontWeight: 700 }}>Yes</span>
                      </Text>
                    </Paper>
                  )}

                  {!savedScheme && promo && !promo.applied && (
                    <Paper radius="md" p="12px" mb="12px" style={{ backgroundColor: "#f3fbf4", border: `1px solid ${LIGHT_GREEN}` }}>
                      <Text size="sm" fw={700} style={{ color: DARK_GREEN }}>
                        Buy above ₹{Math.round(Number(promo.threshold))} and get flat {promo.discountPercent}% off
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        Add ₹{Math.max(0, promo.threshold - totals.subtotal)} more to get the offer
                      </Text>
                    </Paper>
                  )}

                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">Total MRP</Text>
                    <Text>₹{totals.subtotal}</Text>
                  </Group>

                  {savedScheme && savedScheme.isDiscountApplicable ? (
                    <Group justify="space-between" mb="xs">
                      <Text c="dimmed">Scheme Discount ({savedScheme.discountvalue}% off)</Text>
                      <Text style={{ color: LIGHT_GREEN, fontWeight: 700 }}>
                        -₹{Math.round(Number(savedScheme.minusValue ?? 0))}
                      </Text>
                    </Group>
                  ) : (
                    <Group justify="space-between" mb="xs">
                      <Text c="dimmed">Discount</Text>
                      <Text style={{ color: LIGHT_GREEN, fontWeight: 700 }}>
                        -₹{totals.totalDiscounts ?? 0}
                      </Text>
                    </Group>
                  )}

                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">Cart Subtotal</Text>
                    <Text>
                      ₹
                      {Math.max(
                        0,
                        totals.subtotal -
                          (savedScheme && savedScheme.isDiscountApplicable
                            ? Math.round(Number(savedScheme.minusValue ?? 0))
                            : totals.totalDiscounts ?? 0)
                      )}
                    </Text>
                  </Group>

                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">Shipping Fee</Text>
                    <Text>{totals.shipping === 0 ? "Free" : `₹${totals.shipping}`}</Text>
                  </Group>

                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">GST (5%)</Text>
                    <Text>₹{totals.gst}</Text>
                  </Group>

                  <Divider my="sm" />
                  <Group justify="space-between" mb="md">
                    <Text fw={700}>You Pay</Text>
                    <Text fw={700}>
                      ₹
                      {savedScheme && savedScheme.isDiscountApplicable
                        ? Math.round(
                            Number(savedScheme.finalAmount) +
                              (paymentMethod === "COD" ? COD_SHIPPING : 0)
                          )
                        : totals.grandTotal}
                    </Text>
                  </Group>

                  {/* ✅ COD advance note */}
                  {paymentMethod === "COD" && (
                    <Paper radius="sm" p="xs" mb="sm" style={{ backgroundColor: "#f3fbf4" }}>
                      <Text size="sm" fw={500} style={{ color: DARK_GREEN }}>
                        Note: For COD orders, ₹100 is collected in advance online. The remaining amount is paid on delivery.
                      </Text>
                    </Paper>
                  )}

                  <Paper radius="sm" p="md" style={{ backgroundColor: "#f7fff6" }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="sm" style={{ color: DARK_GREEN }}>
                          Your Savings ₹
                          {savedScheme && savedScheme.isDiscountApplicable
                            ? Math.round(savedScheme.minusValue)
                            : totals.totalDiscounts}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {savedScheme && savedScheme.isDiscountApplicable
                            ? `${Math.round(
                                (Number(savedScheme.minusValue) /
                                  Number(savedScheme.totalSalesPrice)) *
                                  100
                              )}%`
                            : `${totals.savingsPercent ?? 0}%`}
                        </Text>
                      </div>
                      <div>🎁</div>
                    </Group>
                  </Paper>

                  <Divider my="sm" />
                </Card>
              </Grid.Col>
            </Grid>
          </Container>

          <Box
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2000,
              pointerEvents: "auto",
              borderTop: "1px solid #eee",
              background: "#fff",
              padding: "10px 0px",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
            }}
          >
            <Container size="lg" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <Text fw={700} size="lg" style={{ lineHeight: 1 }}>
                    ₹
                    {savedScheme && savedScheme.isDiscountApplicable
                      ? Math.round(
                          Number(savedScheme.finalAmount) +
                            (paymentMethod === "COD" ? COD_SHIPPING : 0)
                        )
                      : totals.grandTotal}
                  </Text>
                  <Text size="xs" c="dimmed">View Price Details</Text>

                  {savedScheme && savedScheme.isDiscountApplicable ? (
                    <Text size="xs" style={{ color: DARK_GREEN, marginTop: 4 }}>
                      Buy above ₹{Math.round(Number(savedScheme.couponAmount ?? 0))} — flat {savedScheme.discountvalue}% off applied
                    </Text>
                  ) : promo && !promo.applied ? (
                    <Text size="xs" style={{ color: DARK_GREEN, marginTop: 4 }}>
                      Buy above ₹{Math.round(Number(promo.threshold))} — flat {promo.discountPercent}% off available
                    </Text>
                  ) : null}
                </div>

                <div style={{ textAlign: "right" }}>
                  <Text size="sm">Your Savings</Text>
                  <Text fw={700} style={{ color: LIGHT_GREEN }}>
                    ₹
                    {savedScheme && savedScheme.isDiscountApplicable
                      ? Math.round(savedScheme.minusValue)
                      : totals.totalDiscounts}
                  </Text>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  radius="md"
                  size="md"
                  fullWidth
                  onClick={() => {
                    if (paymentMethod === "RAZORPAY") onPayNow();
                    else onPlaceCOD();
                  }}
                  loading={payLoading}
                  sx={{
                    backgroundColor: DARK_GREEN,
                    color: "#fff",
                    "&:hover": { backgroundColor: "#0f2a12" },
                  }}
                >
                  PLACE ORDER
                </Button>
              </div>
            </Container>
          </Box>
        </>
      )}
    </div>
  );
}