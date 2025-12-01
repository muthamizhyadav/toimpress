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
  Modal,
} from "@mantine/core";
import {
  IconMinus,
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconPencil,
} from "@tabler/icons-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import { loadRazorpay } from "../../utils/loadRazorpay";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { API_GET_UPDATE, API_CART } from "../../api/api";
import { useSelector, useDispatch } from "react-redux";

import * as storeModule from "../../redux/store";
import { notifications } from "@mantine/notifications";
import {
  clearCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../../redux/slices/cartSlice";
import { useAuth } from "../../assets/hooks/useAuth";
import { useDisclosure } from "@mantine/hooks";
import LoginOtpModal from "../../components/LoginOtpModal";
import AddressModal from "../../components/shared/AddressModal";

const normalizeColor = (c?: string) =>
  (c ?? "").toString().trim().toLowerCase();

let persistor: any = null;

if ("persistor" in storeModule) {
  persistor = (storeModule as any).persistor;
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;
const CREATE_ORDER_URL = "/payments/razorpay/order";
const VERIFY_URL = "/payments/razorpay/verify";
const SERVER_CREATE_ORDER_URL = "/orders";
const DELHIVERY_SHIPMENT_URL = "/delhivery/shipment";

// GST percent (5%)
const GST_PERCENT = 0.05;
const COD_TOKEN = 100;
const COD_SHIPPING = 50;

// Colour tokens requested
const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#92B775";

type CartItem = {
  selectedSize: any;
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
  promo?: {
    threshold: number;
    discountPercent: number;
    applied: boolean;
  } | null;
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
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Box
          w={100}
          h={100}
          style={{
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/product?id=${prodId}`)}
        >
          <Image
            src={img}
            alt={item.title}
            width={100}
            height={100}
            fit="cover"
          />
        </Box>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="flex-start">
            <Text fw={600} size="sm" lineClamp={2}>
              {item.title}
            </Text>
            {item.raw?.isOfferAvailable ? (
              <Badge
                style={{ backgroundColor: LIGHT_GREEN, color: DARK_GREEN }}
              >
                OFFER APPLIED
              </Badge>
            ) : null}
          </Group>

          <Group gap="xs" wrap="wrap">
            {item.size && (
              <Text size="xs" c="dimmed">
                Size: {item.size}
              </Text>
            )}
            {item.color && (
              <Group gap={6} align="center">
                <Text size="xs" c="dimmed">
                  Color:
                </Text>
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
            <Text fw={700} size="sm">
              ₹{unitPrice}
            </Text>
            {item.salePrice && item.price && (
              <Text size="xs" c="dimmed" td="line-through">
                ₹{item.price}
              </Text>
            )}
          </Group>

          <Group gap="xs" mt={2} wrap="nowrap">
            <ActionIcon variant="light" size="sm" onClick={onMinus}>
              <IconMinus size={14} />
            </ActionIcon>
            <Text size="sm">{item.qty}</Text>
            <ActionIcon variant="light" size="sm" onClick={onPlus}>
              <IconPlus size={14} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={onRemove}
            >
              <IconTrash size={16} />
            </ActionIcon>
            <Box style={{ marginLeft: "auto" }}>
              <Text fw={600} size="sm">
                ₹{lineTotal}
              </Text>
            </Box>
          </Group>

          {item.raw?.buy3For999 && (
            <Paper radius="sm" p="xs" style={{ backgroundColor: "#f3fbf4" }}>
              <Group gap="xs">
                <Text size="sm" style={{ color: DARK_GREEN }}>
                  ✓
                </Text>
                <Text size="sm" style={{ color: DARK_GREEN }}>
                  Buy 3 For 999
                </Text>
                <Text size="xs" c="dimmed">
                  ({item.qty} Qty)
                </Text>
              </Group>
            </Paper>
          )}
        </Stack>
      </Group>

      {showPromoHint && promo && (
        <Paper
          radius="sm"
          p="xs"
          mt="6px"
          style={{
            backgroundColor: "#f3fbf4",
            borderLeft: `4px solid ${LIGHT_GREEN}`,
            width: "100%",
          }}
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

export default function Checkout() {
  const [loading, setLoading] = useState<boolean>(true);
  const [payLoading, setPayLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [recoveringPayment, setRecoveringPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(
    "RAZORPAY"
  );
  const { isAuthenticated } = useAuth();
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const [loginModalOpened, { open: openLoginModal, close: closeLoginModal }] =
    useDisclosure(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [apiErrorModal, setApiErrorModal] = useState({
    opened: false,
    title: "",
    message: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkForPendingPayments = async () => {
      try {
        const pendingPayment = localStorage.getItem("pendingRazorpayPayment");
        const paymentProcessing = localStorage.getItem("paymentProcessing");

        if (pendingPayment && !paymentProcessing) {
          const paymentData = JSON.parse(pendingPayment);

          if (paymentData.status === "payment_made" && paymentData.paymentId) {
            setRecoveringPayment(true);
            showNotification({
              title: "Verifying your payment...",
              message: "Please wait while we confirm your payment",
              color: "blue",
              loading: true,
            });

            await verifyAndCompletePayment(paymentData);
          }

          if (Date.now() - paymentData.timestamp > 60 * 60 * 1000) {
            localStorage.removeItem("pendingRazorpayPayment");
          }
        }
      } catch (error) {
        console.error("Error checking pending payments:", error);
        localStorage.removeItem("pendingRazorpayPayment");
        localStorage.removeItem("paymentProcessing");
      }
    };

    checkForPendingPayments();
  }, []);

  const reduxUser = useSelector(
    (state: any) => state.auth?.user ?? state.user?.user ?? null
  );
  const reduxAddress = useSelector(
    (state: any) =>
      state.auth?.userAddress ??
      state.user?.user?.address ??
      state.address ??
      null
  );

  // ✅ Cart items come from Redux only
  const reduxCartItems = useSelector(
    (state: any) => state.cart?.items ?? []
  ) as CartItem[];

  const items = reduxCartItems;

  const [user, setUser] = useState<any>(null);
  const [storedUserAddress, setStoredUserAddress] = useState<any>(null);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const [savedScheme, setSavedScheme] = useState<any>(null);

  const getCouponDetails = async (data: any) => {
    const resp = await axiosInstance.post(
      "coupons/by-product-and-amount",
      data
    );
    if (resp.data) {
      console.log(resp.data, "finalResult");
      setOfferAmount(resp.data.totalDiscount);
    }
  };

  useEffect(() => {
  if (!items.length) return;

  // If saved scheme from server is already providing discount 
  // we do NOT call coupon discount API
  if (savedScheme && savedScheme.isDiscountApplicable) {
    setOfferAmount(Math.round(savedScheme.minusValue || 0));
    return;
  }

  const grouped = items.reduce((acc: any, item: any) => {
    if (!acc[item.id]) acc[item.id] = { id: item.id, amount: 0 };
    const price = item.salePrice ?? item.price ?? 0;
    acc[item.id].amount += price * item.qty;
    return acc;
  }, {});

  getCouponDetails(grouped);
}, [items, savedScheme]);


  const verifyAndCompletePayment = async (paymentData: any) => {
    try {
      const { data: verify } = await axiosInstance.post(VERIFY_URL, {
        razorpay_payment_id: paymentData.paymentId,
        razorpay_order_id: paymentData.orderId,
        razorpay_signature: paymentData.signature,
      });

      if (!verify?.valid) {
        showNotification({
          title: "Payment verification failed",
          message: "Please contact support with your payment ID",
          color: "red",
          icon: <IconX size={16} />,
        });
        return;
      }

      let createdOrder: any = null;
      try {
        createdOrder = await createOrderHistory({
          items: paymentData.items,
          shippingAddress: paymentData.flatUserAddress,
          billingAddress: paymentData.flatUserAddress,
          paymentMethod: "online",
          notes: "",
          shippingCost: paymentData.totals.shipping,
          tax: paymentData.totals.gst,
          discount: paymentData.totals.totalDiscounts,
          localOrderId: paymentData.orderId,
          meta: {
            razorpay: {
              razorpay_payment_id: paymentData.paymentId,
              razorpay_order_id: paymentData.orderId,
              razorpay_signature: paymentData.signature,
            },
            savedScheme: paymentData.savedScheme?.isDiscountApplicable
              ? paymentData.savedScheme
              : null,
            recovered: true,
          },
        });
      } catch (orderErr) {
        console.error("Order creation during recovery failed:", orderErr);
      }

      await handleClearCart();

      localStorage.removeItem("pendingRazorpayPayment");
      localStorage.removeItem("paymentProcessing");
      setRecoveringPayment(false);

      navigate("/order-success", {
        state: {
          order: createdOrder,
          recovered: true,
        },
      });
    } catch (error) {
      console.error("Payment recovery failed:", error);
      showNotification({
        title: "Recovery failed",
        message: "Please contact support with your payment details",
        color: "red",
        icon: <IconX size={16} />,
      });
      setRecoveringPayment(false);
    }
  };

  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
      setStoredUserAddress(reduxAddress);
    }

    console.log(reduxAddress, "reduxAddress checkout");
  }, [reduxUser, reduxAddress]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axiosInstance.get(API_GET_UPDATE);

      const root = resp?.data ?? resp;
      if (root && typeof root.isDiscountApplicable !== "undefined") {
        const parsed = {
          ...root,
          totalSalesPrice: Number(
            root.totalSalesPrice ?? root.total_sales_price ?? 0
          ),
          minusValue: Number(
            root.minusValue ?? root.minus_value ?? root.discountAmount ?? 0
          ),
          finalAmount: Number(root.finalAmount ?? root.final_amount ?? 0),
          gst: Math.round(Number(root.gst ?? 0)),
          couponAmount: Number(root.couponAmount ?? root.coupon_amount ?? 0),
          discountvalue:
            root.discountvalue ??
            root.discount_value ??
            root.couponOfferDiscount ??
            root.discountvalue ??
            0,
          isDiscountApplicable: Boolean(root.isDiscountApplicable),
        };
        console.log(parsed, "parsed");

        setSavedScheme(parsed);
      } else if (
        root &&
        root.scheme &&
        typeof root.scheme.isDiscountApplicable !== "undefined"
      ) {
        const s = root.scheme;
        const parsed = {
          ...s,
          totalSalesPrice: Number(
            s.totalSalesPrice ?? s.total_sales_price ?? 0
          ),
          minusValue: Number(
            s.minusValue ?? s.minus_value ?? s.discountAmount ?? 0
          ),
          finalAmount: Number(s.finalAmount ?? s.final_amount ?? 0),
          gst: Math.round(Number(s.gst ?? 0)),
          couponAmount: Number(s.couponAmount ?? s.coupon_amount ?? 0),
          discountvalue:
            s.discountvalue ??
            s.discount_value ??
            s.couponOfferDiscount ??
            s.discountvalue ??
            0,
          isDiscountApplicable: Boolean(s.isDiscountApplicable),
        };
        setSavedScheme(parsed);
      } else {
        setSavedScheme(null);
      }
    } catch (err: any) {
      console.error("Fetch cart failed", err);
      // showNotification({
      //   title: "Unable to load cart",
      //   message: err?.response?.data?.message ?? "Please try again later",
      //   color: "red",
      //   icon: <IconX size={16} />,
      // });
      setSavedScheme(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateLineQuantity = async (line: CartItem, newQuantity: number) => {
    try {
      // Instantly update Redux UI for smooth UX
      if (newQuantity === 0) {
        dispatch(
          removeFromCart({
            id: String(line.productId ?? line.id),
            size: line.size ?? "",
            selectedColor: normalizeColor(line.color ?? ""),
            // silent: true,
          }) as any
        );
      } else {
        dispatch(
          updateCartItemQuantity({
            id: String(line.productId ?? line.id),
            size: line.size ?? "",
            selectedColor: normalizeColor(line.color ?? ""),
            qty: newQuantity,
          }) as any
        );
      }

      // Then sync with backend
      const body = {
        productId: String(line.productId ?? line.id),
        quantity: newQuantity,
        selectedSize: line.size,
        selectedColor: line.color,
      };

      const resp = await axiosInstance.post(API_CART, body, {
        headers: { "Content-Type": "application/json" },
      });

      // Show feedback
      showNotification({
        title: newQuantity === 0 ? "Removed" : "Updated",
        message:
          resp?.data?.message ??
          (newQuantity === 0
            ? "Item removed"
            : `Quantity updated to ${newQuantity}`),
        color: "green",
        icon: <IconCheck size={16} />,
      });

      // refresh discount scheme
      await fetchCart();
    } catch (err: any) {
      // console.error("Qty update failed:", err);
      // showNotification({
      //   title: "Update failed",
      //   message: err?.response?.data?.message ?? "Unable to update cart",
      //   color: "red",
      //   icon: <IconX size={16} />,
      // });
    }
  };

  const handleMinus = (item: CartItem) => {
    const nextQty = item.qty - 1;
    updateLineQuantity(item, Math.max(0, nextQty));
  };

  const handlePlus = (item: CartItem) => {
    updateLineQuantity(item, item.qty + 1);
  };

  const handleRemove = (item: CartItem) => {
    updateLineQuantity(item, 0);
  };

  const handleClearCart = async () => {
    if (!items?.length) return;
    const itemsToClear = [...items];

    dispatch(clearCart());

    try {
      setLoading(true);

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

      try {
        dispatch(clearCart());
        if (persistor?.purge) {
          await persistor.purge();
        }
      } catch (e) {
        console.warn("Redux clearCart/purge failed:", e);
      }

      try {
        localStorage.removeItem("persist:root");
        localStorage.removeItem("persist:cart");
      } catch {
        /* ignore */
      }

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
        message:
          err?.response?.data?.message ??
          err?.message ??
          "Unable to clear cart",
        color: "red",
        icon: <IconX size={16} />,
      });

      try {
        dispatch(clearCart());
        if (persistor?.purge) await persistor.purge();
        localStorage.removeItem("persist:root");
        localStorage.removeItem("persist:cart");
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // const totals = useMemo(() => {
  //   const localSubtotal = (items || []).reduce((sum, i) => {
  //     const p = i.salePrice ?? i.price ?? 0;
  //     return sum + p * (i.qty ?? 1);
  //   }, 0);

  //   const totalQty = (items || []).reduce((q, i) => q + (i.qty ?? 0), 0);

  //   let couponDiscount = 0;
  //   if (appliedCoupon?.code === "SAVE10") {
  //     couponDiscount = Math.round(Math.min(100, localSubtotal * 0.1));
  //   } else if (appliedCoupon) {
  //     couponDiscount = appliedCoupon.discount ?? 0;
  //   }

  //   const totalDiscounts = Math.min(localSubtotal, couponDiscount);
  //   const discountedBase = localSubtotal - totalDiscounts;
  //   const gstRaw = discountedBase * GST_PERCENT;
  //   const gstComputed = Math.round(gstRaw);
  //   const shipping =
  //     paymentMethod === "COD" && items?.length ? COD_SHIPPING : 0;
  //   let grandTotalComputed = Math.round(
  //     discountedBase + gstComputed + shipping
  //   );
  //   let savingsPercentComputed =
  //     localSubtotal > 0
  //       ? Math.round((totalDiscounts / localSubtotal) * 100)
  //       : 0;

  //   if (savedScheme && savedScheme.isDiscountApplicable) {
  //     const sTotalSales = Number(savedScheme.totalSalesPrice ?? 0);
  //     const sMinus = Number(savedScheme.minusValue ?? 0);
  //     const sFinal = Number(savedScheme.finalAmount ?? 0);
  //     const sGst = Math.round(Number(savedScheme.gst ?? 0));
  //     const effectiveFinal = Math.round(
  //       sFinal + (paymentMethod === "COD" ? COD_SHIPPING : 0)
  //     );
      
  //     return {
  //       subtotal: Math.round(sTotalSales) - (offerAmount),
  //       totalQty,
  //       couponDiscount: Number(offerAmount),
  //       totalDiscounts: Math.round(offerAmount),
  //       gst: Math.round(sGst),
  //       shipping: paymentMethod === "COD" ? COD_SHIPPING : 0,
  //       grandTotal: effectiveFinal,
  //       savingsPercent:
  //         sTotalSales > 0 ? Math.round((sMinus / sTotalSales) * 100) : 0,
  //     };
  //   }

  //   return {
  //     subtotal: Math.round(localSubtotal),
  //     totalQty,
  //     couponDiscount,
  //     totalDiscounts: Math.round(offerAmount),
  //     gst: gstComputed,
  //     shipping,
  //     grandTotal: grandTotalComputed,
  //     savingsPercent: savingsPercentComputed,
  //   };
  // }, [items, paymentMethod, appliedCoupon]);

  const totals = useMemo(() => {
  const localSubtotal = items.reduce(
    (sum, i) => sum + (i.salePrice ?? i.price ?? 0) * (i.qty ?? 1),
    0
  );

  // If scheme discount is active → use scheme values
  if (savedScheme?.isDiscountApplicable) {
    const schemeDiscount = Math.round(Number(savedScheme.minusValue ?? 0));
    const shipping = paymentMethod === "COD" ? COD_SHIPPING : 0;
    const grand = Math.round(
      (savedScheme.finalAmount ?? 0) + shipping
    );

    return {
      subtotal: localSubtotal,
      totalDiscounts: schemeDiscount,
      shipping,
      grandTotal: grand,
    };
  }

  const shipping = paymentMethod === "COD" ? COD_SHIPPING : 0;
  const totalDiscounts = Math.round(offerAmount);
  const grandTotal = Math.round(localSubtotal - totalDiscounts + shipping);

  return {
    subtotal: localSubtotal,
    totalDiscounts,
    shipping,
    grandTotal,
  };
}, [items, savedScheme, paymentMethod, offerAmount]);


  const promo = useMemo(() => {
    if (
      savedScheme &&
      typeof savedScheme.isDiscountApplicable !== "undefined"
    ) {
      const threshold = Number(
        savedScheme.couponAmount ?? savedScheme.totalSalesPrice ?? 0
      );
      const discountPercent = Number(
        savedScheme.discountvalue ?? savedScheme.couponOfferDiscount ?? 0
      );
      const applied = Boolean(savedScheme.isDiscountApplicable);
      if (threshold > 0 && discountPercent > 0)
        return { threshold, discountPercent, applied };
      return null;
    }

    for (const it of items) {
      const raw = it.raw ?? {};
      const threshold = Number(
        raw.couponDiscount ?? raw.couponAmount ?? raw.coupon_threshold ?? 0
      );
      const discountPercent = Number(
        raw.couponOfferDiscount ?? raw.discountvalue ?? raw.couponPercent ?? 0
      );
      const applied = Boolean(raw.isDiscountApplicable ?? false);
      if (threshold > 0 && discountPercent > 0) {
        return { threshold, discountPercent, applied };
      }
    }

    return null;
  }, [savedScheme, items]);

  const flatUserAddress = storedUserAddress;

  const ensureAuthAndAddress = () => {
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

  const showApiError = (title: string, message: string) => {
    setApiErrorModal({
      opened: true,
      title,
      message,
    });
  };

  async function createOrderHistory({
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    notes,
    shippingCost,
    localOrderId,
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
    localOrderId?: any;
    tax?: number;
    discount?: number;
    meta?: any;
    amountToChargeOnDelivery?: number;
  }) {
    try {
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

      let token =
        (reduxUser &&
          (reduxUser.token ?? reduxUser.accessToken ?? reduxUser.authToken)) ??
        null;

      const headers: any = { "Content-Type": "application/json" };
      if (token || localStorage.getItem("token"))
        headers.authorization = `Bearer ${token}`;
      const resp = await axiosInstance.post(SERVER_CREATE_ORDER_URL, payload, {
        headers,
      });

      if (resp.status !== 200 && resp.status !== 201) {
        throw new Error(`Order creation failed with status: ${resp.status}`);
      }

      return resp.data ?? resp;
    } catch (error: any) {
      console.error("Order history creation failed:", error);
      throw new Error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to create order. Please try again."
      );
    }
  }

  const validateOrderApis = async (): Promise<{
    success: boolean;
    orderData?: any;
    orderId?: string;
  }> => {
    try {
      let createdOrder;
      try {
        createdOrder = await createOrderHistory({
          items,
          shippingAddress: flatUserAddress,
          billingAddress: flatUserAddress,
          paymentMethod: paymentMethod === "RAZORPAY" ? "online" : "cod_token",
          notes: "",
          shippingCost: totals.shipping,
          tax: totals.gst,
          discount: totals.totalDiscounts,
          meta: {
            savedScheme:
              savedScheme && savedScheme.isDiscountApplicable
                ? savedScheme
                : null,
            prePayment: true,
          },
          amountToChargeOnDelivery:
            paymentMethod === "COD" ? totals.grandTotal - COD_TOKEN : undefined,
        });
        console.log("✅ Order created successfully:", createdOrder);

        const serverOrderId =
          createdOrder?.data?.id ||
          createdOrder?.id ||
          createdOrder?.orderNumber ||
          createdOrder?.orderId ||
          createdOrder?.data?.orderNumber ||
          createdOrder?.data?.orderId ||
          `ORDER${Date.now()}`;

        setCreatedOrderId(serverOrderId);
      } catch (orderError: any) {
        showApiError(
          "Order Creation Failed",
          orderError.message || "Unable to create order. Please try again."
        );
        return { success: false };
      }

      try {
        const serverOrderId =
          createdOrder?.data?.id ||
          createdOrder?.id ||
          createdOrder?.orderNumber ||
          createdOrder?.orderId ||
          createdOrder?.data?.orderNumber ||
          createdOrder?.data?.orderId ||
          `ORDER${Date.now()}`;
      } catch (shipmentError: any) {
        showApiError(
          "Shipment Creation Failed",
          "Something went wrong while creating your shipment. Don't worry, please try again in a moment."
        );
        return { success: false };
      }

      const finalOrderId =
        createdOrder?.data?.id ||
        createdOrder?.id ||
        createdOrder?.orderNumber ||
        createdOrder?.orderId ||
        createdOrder?.data?.orderNumber ||
        createdOrder?.data?.orderId ||
        `ORDER${Date.now()}`;

      return {
        success: true,
        orderData: createdOrder,
        orderId: finalOrderId,
      };
    } catch (error: any) {
      console.error("API validation failed:", error);
      showApiError(
        "System Error",
        "Unable to process your order. Please try again later."
      );
      return { success: false };
    }
  };

  const onPayNow = async () => {
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: savedScheme?.finalAmount ?? totals.grandTotal,
        currency: "INR",
        contents: items.map((item) => ({
          id: item.id,
          quantity: item.qty,
          item_price: item.price,
        })),
        content_type: "product",
      });
    }
    if (!ensureAuthAndAddress() || recoveringPayment) return;

    setPayLoading(true);

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

      const apiValidation = await validateOrderApis();
      if (!apiValidation.success) {
        setPayLoading(false);
        return;
      }
      const localOrderId = apiValidation.orderId;
      const amountToCollect = Math.max(
        0,
        Math.round(savedScheme?.finalAmount ?? totals.grandTotal)
      );
      const amountPaise = (totals.subtotal - offerAmount) * 100;

      if (amountPaise <= 0) {
        showNotification({
          title: "Invalid amount",
          message: "Amount must be greater than 0.",
          color: "red",
          icon: <IconX size={16} />,
        });
        return;
      }

      const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
        amount: amountPaise,
        currency: "INR",
        receipt: "rcpt_" + Date.now(),
        notes: {
          itemCount: String(items.length),
          paymentType: "FULL",
          source: "checkout_page",
        },
        localOrderId: localOrderId,
      });

      if (!order?.id || !order?.amount) {
        console.error("Invalid Razorpay order:", order);
        showNotification({
          title: "Payment error",
          message: "Couldn't initialize payment. Please try again.",
          color: "red",
          icon: <IconX size={16} />,
        });
        return;
      }

      const paymentSession = {
        orderId: order.id,
        amount: amountToCollect,
        items: items,
        totals: totals,
        flatUserAddress: flatUserAddress,
        savedScheme: savedScheme,
        timestamp: Date.now(),
        status: "initiated",
        localOrderId: localOrderId,
      };
      localStorage.setItem(
        "pendingRazorpayPayment",
        JSON.stringify(paymentSession)
      );

      await loadRazorpay();

      const prefillName = (reduxUser?.name ?? user?.name) || "Customer";
      const prefillEmail =
        (reduxUser?.email ?? user?.email) || "customer@example.com";
      const prefillContact =
        (reduxUser?.mobile ??
          reduxUser?.phone ??
          user?.mobile ??
          user?.phone) ||
        "9000000000";

      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount ,
        currency: order.currency,
        name: "TO IMPRESS",
        description: "Order Payment",
        order_id: order.id,
        prefill: {
          name: prefillName,
          email: prefillEmail,
          contact: prefillContact,
        },
        notes: {
          cartItems: String(items.length),
          source: "web_checkout_full",
          orderId: order.id,
          localOrderId: localOrderId,
        },
        theme: { color: DARK_GREEN },
        async: false,
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal dismissed");
            setPaymentInProgress(false);
            setTimeout(() => {
              if (!localStorage.getItem("paymentProcessing")) {
                localStorage.removeItem("pendingRazorpayPayment");
              }
            }, 5000);
          },
          escape: true,
          backdropclose: true,
        },
        handler: function (response: any) {
          paymentSession.paymentId = response.razorpay_payment_id;
          paymentSession.signature = response.razorpay_signature;
          paymentSession.status = "payment_made";
          paymentSession.localOrderId = localOrderId;
          localStorage.setItem(
            "pendingRazorpayPayment",
            JSON.stringify(paymentSession)
          );
          localStorage.setItem("paymentProcessing", "true");

          rzp.close();
          processPaymentBackground(response, paymentSession);
        },
      });

      rzp.on("payment.failed", function (response: any) {
        console.error("Razorpay payment failed:", response.error);
        setPaymentInProgress(false);
        localStorage.removeItem("pendingRazorpayPayment");
        localStorage.removeItem("paymentProcessing");

        showNotification({
          title: "Payment failed",
          message:
            response.error.description || "Payment failed. Please try again.",
          color: "red",
          icon: <IconX size={16} />,
        });
      });

      rzp.on("modal.closed", function () {
        console.log("Razorpay modal closed");
        setPaymentInProgress(false);
        setTimeout(() => {
          if (!localStorage.getItem("paymentProcessing")) {
            localStorage.removeItem("pendingRazorpayPayment");
          }
        }, 3000);
      });
      rzp.open();
      setPaymentInProgress(true);
    } catch (err) {
      console.error("onPayNow error:", err);
      setPaymentInProgress(false);
      localStorage.removeItem("pendingRazorpayPayment");
      localStorage.removeItem("paymentProcessing");

      showApiError(
        "Payment Error",
        "Unable to start payment. Please try again."
      );
    } finally {
      setPayLoading(false);
    }
  };

  const processPaymentBackground = async (
    response: any,
    paymentSession: any
  ) => {
    try {
      console.log("Processing payment in background...");

      const { data: verify } = await axiosInstance.post(VERIFY_URL, {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (!verify?.valid) {
        throw new Error("Payment verification failed");
      }

      try {
        await createOrderHistory({
          items: paymentSession.items,
          shippingAddress: paymentSession.flatUserAddress,
          billingAddress: paymentSession.flatUserAddress,
          paymentMethod: "online",
          notes: "",
          shippingCost: paymentSession.totals.shipping,
          tax: paymentSession.totals.gst,
          discount: paymentSession.totals.totalDiscounts,
          localOrderId: paymentSession.localOrderId || paymentSession.orderId,
          meta: {
            razorpay: response,
            savedScheme: paymentSession.savedScheme?.isDiscountApplicable
              ? paymentSession.savedScheme
              : null,
            paymentConfirmed: true,
          },
        });
      } catch (orderErr) {
        console.error("Order confirmation failed:", orderErr);
      }

      // Clear cart
      await handleClearCart();

      // Clean up storage
      localStorage.removeItem("pendingRazorpayPayment");
      localStorage.removeItem("paymentProcessing");
      setPaymentInProgress(false);

      // Navigate to success page
      navigate("/order-success", {
        state: {
          order: {
            id: paymentSession.localOrderId || paymentSession.orderId,
          },
          paymentId: response.razorpay_payment_id,
        },
      });
    } catch (error) {
      console.error("Background payment processing failed:", error);

      showNotification({
        title: "Payment processing delayed",
        message:
          "Your payment was successful but processing is taking longer. Please wait...",
        color: "yellow",
        icon: <IconInfoCircle size={16} />,
      });
    }
  };

  // Similar validation for COD flow
  const onPlaceCOD = async () => {
    if (!ensureAuthAndAddress()) return;
    console.log("COD selected");

    setPayLoading(true);
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

      // ✅ STEP 1: Validate APIs before COD token payment
      const apiValidation = await validateOrderApis();
      if (!apiValidation.success) {
        setPayLoading(false);
        return; // Stop here if API validation fails
      }

      // ✅ Get the orderId from validation
      const localOrderId = apiValidation.orderId;
      console.log("Using orderId for COD:", localOrderId);

      const baseFinal =
        savedScheme && savedScheme.isDiscountApplicable
          ? Number(savedScheme.finalAmount ?? totals.grandTotal)
          : totals.grandTotal;

      const orderTotal = Math.round(baseFinal + COD_SHIPPING);
      const tokenToCollect = COD_TOKEN;
      const remainingAmount = Math.max(0, orderTotal - tokenToCollect);

      // If no token, create order directly
      if (tokenToCollect <= 0) {
        // Order already created in validation step, just update status
        try {
          await createOrderHistory({
            items,
            shippingAddress: flatUserAddress,
            billingAddress: flatUserAddress,
            paymentMethod: "cod",
            notes: "",
            shippingCost: COD_SHIPPING,
            tax: totals.gst,
            discount: totals.totalDiscounts,
            // ✅ Use the localOrderId from validation
            localOrderId: localOrderId,
            meta: {
              immediateCOD: true,
              savedScheme:
                savedScheme && savedScheme.isDiscountApplicable
                  ? savedScheme
                  : null,
              orderConfirmed: true,
            },
            amountToChargeOnDelivery: orderTotal,
          });
        } catch (orderErr) {
          console.error("Order confirmation failed (COD immediate):", orderErr);
        }

        await handleClearCart();
        showNotification({
          title: "COD placed",
          message: `Delivery agent will collect ₹${orderTotal}`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
        navigate("/order-success", {
          state: { order: { paymentMethod: "cod" } },
        });
        return;
      }

      // Collect COD token via Razorpay
      const tokenPaise = tokenToCollect * 100; // Convert to paise

      const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
        amount: tokenPaise,
        currency: "INR",
        receipt: "cod_token_rcpt_" + Date.now(),
        notes: {
          itemCount: String(items.length),
          paymentType: "COD_TOKEN",
          // ✅ Include local order ID in notes
          localOrderId: localOrderId,
        },
        // ✅ Pass the localOrderId to Razorpay order creation
        localOrderId: localOrderId,
      });

      if (!order?.id || !order?.amount) {
        console.error("Invalid Razorpay order (COD token):", order);
        showNotification({
          title: "Payment error",
          message: "Couldn't initialize token payment. Please try again.",
          color: "red",
          icon: <IconX size={16} />,
        });
        return;
      }

      await loadRazorpay();

      const prefillName = (reduxUser?.name ?? user?.name) || "Customer";
      const prefillEmail =
        (reduxUser?.email ?? user?.email) || "customer@example.com";
      const prefillContact =
        (reduxUser?.mobile ??
          reduxUser?.phone ??
          user?.mobile ??
          user?.phone) ||
        "9000000000";

      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TO IMPRESS",
        description: `COD token - ₹${tokenToCollect}`,
        order_id: order.id,
        prefill: {
          name: prefillName,
          email: prefillEmail,
          contact: prefillContact,
        },
        notes: {
          cartItems: String(items.length),
          source: "web_cod_token",
          // ✅ Include local order ID in Razorpay notes
          localOrderId: localOrderId,
        },
        theme: { color: DARK_GREEN },
        handler: async (resp: any) => {
          try {
            const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
            if (!verify?.valid) {
              alert(
                "Token payment verification failed. Please contact support."
              );
              return;
            }

            // Update order status to confirmed
            try {
              await createOrderHistory({
                items,
                shippingAddress: flatUserAddress,
                billingAddress: flatUserAddress,
                paymentMethod: "cod_token",
                notes: "",
                shippingCost: COD_SHIPPING,
                tax: totals.gst,
                discount: totals.totalDiscounts,
                // ✅ Use the localOrderId from validation
                localOrderId: localOrderId,
                meta: {
                  razorpay: resp,
                  savedScheme:
                    savedScheme && savedScheme.isDiscountApplicable
                      ? savedScheme
                      : null,
                  orderConfirmed: true,
                },
                amountToChargeOnDelivery: remainingAmount,
              });
            } catch (orderErr) {
              console.error("Order confirmation failed (COD token):", orderErr);
            }

            await handleClearCart();
            showNotification({
              title: "COD placed",
              message: `Token ₹${tokenToCollect} paid. Remaining ₹${remainingAmount} on delivery.`,
              color: "green",
              icon: <IconCheck size={16} />,
            });
            navigate("/order-success", {
              state: {
                order: {
                  paymentMethod: "cod_token",
                  id: localOrderId,
                },
              },
            });
          } catch (e) {
            console.error("Verification failed:", e);
            alert(
              "Token payment succeeded but verification failed. Please contact support."
            );
          }
        },
      });

      rzp.on("payment.failed", (e: any) => {
        console.error("Razorpay COD token failed:", e?.error);
        alert(
          e?.error?.description || "Token payment failed. Please try again."
        );
      });

      rzp.open();
    } catch (err) {
      console.error("onPlaceCOD error:", err);
      showApiError("COD Error", "Unable to place COD order. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (paymentInProgress || localStorage.getItem("paymentProcessing")) {
        e.preventDefault();
        e.returnValue =
          "Your payment is being processed. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [paymentInProgress]);

  useEffect(() => {
    const checkPendingPayment = async () => {
      try {
        const pendingPayment = localStorage.getItem("pendingRazorpayPayment");
        const paymentProcessing = localStorage.getItem("paymentProcessing");

        if (pendingPayment && !paymentProcessing) {
          const paymentData = JSON.parse(pendingPayment);

          console.log("🔍 Checking pending payment:", paymentData.status);

          if (paymentData.status === "payment_made" && paymentData.paymentId) {
            console.log("🔄 Recovering interrupted payment...");

            showNotification({
              title: "Completing your order...",
              message: "Please wait while we finalize your payment",
              color: "blue",
              loading: true,
            });

            localStorage.setItem("paymentProcessing", "true");
            await processPaymentBackground(
              {
                razorpay_payment_id: paymentData.paymentId,
                razorpay_order_id: paymentData.orderId,
                razorpay_signature: paymentData.signature,
              },
              paymentData
            );
          }
        }
      } catch (error) {
        console.error("Payment recovery error:", error);
        localStorage.removeItem("pendingRazorpayPayment");
        localStorage.removeItem("paymentProcessing");
      }
    };

    const timer = setTimeout(() => {
      checkPendingPayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Fast recovery processing
  const processPaymentRecovery = async (paymentSession: any) => {
    try {
      // Verify payment
      const { data: verify } = await axiosInstance.post(VERIFY_URL, {
        razorpay_payment_id: paymentSession.paymentId,
        razorpay_order_id: paymentSession.razorpayOrderId,
        razorpay_signature: paymentSession.signature,
      });

      if (!verify?.valid) {
        showNotification({
          title: "Payment verification failed",
          message: "Please contact support with your payment ID",
          color: "red",
          icon: <IconX size={16} />,
        });
        return;
      }

      // Create order if not exists
      let createdOrder: any = null;
      try {
        createdOrder = await createOrderHistory({
          items: paymentSession.items,
          shippingAddress: paymentSession.flatUserAddress,
          billingAddress: paymentSession.flatUserAddress,
          paymentMethod: "online",
          notes: "",
          shippingCost: paymentSession.totals.shipping,
          tax: paymentSession.totals.gst,
          discount: paymentSession.totals.totalDiscounts,
          localOrderId: paymentSession.razorpayOrderId,
          meta: {
            razorpay: {
              razorpay_payment_id: paymentSession.paymentId,
              razorpay_order_id: paymentSession.razorpayOrderId,
              razorpay_signature: paymentSession.signature,
            },
            savedScheme: paymentSession.savedScheme?.isDiscountApplicable
              ? paymentSession.savedScheme
              : null,
          },
        });
      } catch (orderErr) {
        console.error("Order creation in recovery failed:", orderErr);
      }

      // Clear cart and navigate
      await handleClearCart();
      localStorage.removeItem("pendingPayment");
      localStorage.removeItem("paymentProcessing");

      navigate("/order-success", {
        state: {
          order: createdOrder,
          recovered: true,
        },
      });
    } catch (error) {
      console.error("Payment recovery failed:", error);
      localStorage.removeItem("pendingPayment");
      localStorage.removeItem("paymentProcessing");
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

      {/* API Error Modal */}
      <Modal
        opened={apiErrorModal.opened}
        onClose={() =>
          setApiErrorModal({ opened: false, title: "", message: "" })
        }
        title={apiErrorModal.title}
        centered
      >
        <Text>{apiErrorModal.message}</Text>
        <Group justify="flex-end" mt="md">
          <Button
            onClick={() =>
              setApiErrorModal({ opened: false, title: "", message: "" })
            }
            sx={{
              backgroundColor: DARK_GREEN,
              "&:hover": { backgroundColor: "#0f2a12" },
            }}
          >
            OK
          </Button>
        </Group>
      </Modal>

      {loading ? (
        <Container size="lg" py="xl">
          <Box className="flex items-center justify-center py-24">
            <Loader />
          </Box>
        </Container>
      ) : !items?.length ? (
        <Container size="lg" py="xl">
          <Card p="lg" withBorder>
            <Text fw={600} size="lg">
              Your cart is empty
            </Text>
            <Text c="dimmed" size="sm" mt="xs">
              Add some products to proceed to checkout.
            </Text>
            <Button
              mt="md"
              onClick={async () => {
                await handleClearCart();
                navigate("/");
              }}
              style={{ backgroundColor: DARK_GREEN, color: "#fff" }}
            >
              Continue shopping
            </Button>
          </Card>
        </Container>
      ) : (
        <>
          <Container size="lg" py="xl" style={{ paddingBottom: 290 }}>
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <div
                  style={{
                    maxHeight: "65vh",
                    overflowY: "auto",
                    paddingRight: "6px",
                    scrollbarWidth: "none",
                  }}
                  className="cart-scroll"
                >
                  <Box>
                    <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
                      {items.map((item, idx) => {
                        if ((item.qty ?? 0) > 0) {
                          return (
                            <CheckoutItemBox
                              key={`${item.id}-${item.size ?? ""}-${
                                item.color ?? ""
                              }-${idx}`}
                              prodId={item.id}
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
                </div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }} mb={120}>
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
                        overflow: "auto",
                      },
                    },
                  }}
                >
                  <Text fw={700} mb="md">
                    Order Summary
                  </Text>

                  <Stack gap="xs" mb="md">
                    <Group justify="space-between" align="flex-start">
                      <Text size="sm" fw={600}>
                        Shipping to
                      </Text>
                      <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<IconPencil size={14} />}
                        onClick={() => setAddressModalOpen(true)}
                      >
                        {flatUserAddress ? "Change" : "Add"} Address
                      </Button>
                    </Group>

                    {flatUserAddress ? (
                      <Paper radius="md" p="sm" withBorder>
                        <Stack gap={2}>
                          <Text size="sm" fw={600}>
                            {flatUserAddress.name || "Customer"}
                          </Text>
                          {flatUserAddress.email ? (
                            <Text size="xs" c="dimmed">
                              {flatUserAddress.email}
                            </Text>
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
                            {flatUserAddress.pincode
                              ? ` - ${flatUserAddress.pincode}`
                              : ""}
                          </Text>
                          {flatUserAddress.phone ? (
                            <Text size="xs" c="dimmed">
                              Phone: +91 {flatUserAddress.phone}
                            </Text>
                          ) : null}
                          {flatUserAddress.landmark ? (
                            <Text size="xs" c="dimmed">
                              Landmark: {flatUserAddress.landmark}
                            </Text>
                          ) : null}
                        </Stack>
                      </Paper>
                    ) : (
                      <Paper radius="md" p="sm" withBorder>
                        <Stack gap={6}>
                          <Text size="sm" c="dimmed">
                            No address found.
                          </Text>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>

                  <Stack gap="xs" mb="sm">
                    <Text fw={600} size="sm">
                      Payment Method
                    </Text>
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
                    <Paper
                      radius="md"
                      p="12px"
                      mb="12px"
                      style={{
                        backgroundColor: "#f3fbf4",
                        border: `1px solid ${LIGHT_GREEN}`,
                      }}
                    >
                      <Text size="sm" fw={700} style={{ color: DARK_GREEN }}>
                        Buy above ₹
                        {Math.round(Number(savedScheme.couponAmount ?? 0))} and
                        get flat {savedScheme.discountvalue}% off
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        Scheme applied:{" "}
                        <span style={{ color: DARK_GREEN, fontWeight: 700 }}>
                          Yes
                        </span>
                      </Text>
                    </Paper>
                  )}

                  {!savedScheme && promo && !promo.applied && (
                    <Paper
                      radius="md"
                      p="12px"
                      mb="12px"
                      style={{
                        backgroundColor: "#f3fbf4",
                        border: `1px solid ${LIGHT_GREEN}`,
                      }}
                    >
                      <Text size="sm" fw={700} style={{ color: DARK_GREEN }}>
                        Buy above ₹{Math.round(Number(promo.threshold))} and get
                        flat {promo.discountPercent}% off
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        Add ₹{Math.max(0, promo.threshold - totals.subtotal)}{" "}
                        more to get the offer
                      </Text>
                    </Paper>
                  )}

                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">Total MRP</Text>
                    <Text>₹{totals.subtotal}</Text>
                  </Group>

                  {savedScheme && savedScheme.isDiscountApplicable ? (
                    <Group justify="space-between" mb="xs">
                      <Text c="dimmed">
                        Scheme Discount ({savedScheme.discountvalue}% off)
                      </Text>
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
                        totals.subtotal - offerAmount
                          
                      )}
                    </Text>
                  </Group>

                  <Group justify="space-between" mb="xs">
                    <Text c="dimmed">Shipping Fee</Text>
                    <Text>
                      {totals.shipping === 0 ? "Free" : `₹${totals.shipping}`}
                    </Text>
                  </Group>

                  <Group justify="space-cen" mb="xs">
                    <Text style={{ color: DARK_GREEN, fontWeight: "bold" }}>
                      Total MRP is inclusive of 5% GST
                    </Text>
                  </Group>

                  <Divider my="sm" />
                  <Group justify="space-between" mb="md">
                    <Text fw={700}>You Pay</Text>
                    <Text fw={700}>
                      ₹
                      {totals.subtotal +
                        (paymentMethod === "COD" ? COD_SHIPPING : 0) - offerAmount}
                    </Text>
                  </Group>

                  {paymentMethod === "COD" && (
                    <Paper
                      radius="sm"
                      p="xs"
                      mb="sm"
                      style={{ backgroundColor: "#f3fbf4" }}
                    >
                      <Text size="sm" fw={500} style={{ color: DARK_GREEN }}>
                        Note: For COD orders, ₹100 is collected in advance
                        online. The remaining amount is paid on delivery.
                      </Text>
                    </Paper>
                  )}

                  <Paper
                    radius="sm"
                    p="md"
                    style={{ backgroundColor: "#f7fff6" }}
                  >
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="sm" style={{ color: DARK_GREEN }}>
                          Your Savings ₹
                          {savedScheme && savedScheme.isDiscountApplicable
                            ? Math.round(savedScheme.minusValue)
                            : totals.totalDiscounts}
                        </Text>
                        {/* <Text size="xs" c="dimmed">
                          {savedScheme && savedScheme.isDiscountApplicable
                            ? `${Math.round(
                                (Number(savedScheme.minusValue) /
                                  Number(savedScheme.totalSalesPrice)) *
                                  100
                              )}%`
                            : `${totals.savingsPercent ?? 0}%`}
                        </Text> */}
                      </div>
                      <div>🎁</div>
                    </Group>
                  </Paper>

                  <Divider my="sm" />
                </Card>
              </Grid.Col>
            </Grid>
            <AddressModal
              opened={addressModalOpen}
              onClose={() => {
                setAddressModalOpen(false);
              }}
            />
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
            <Container
              size="lg"
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <Text fw={700} size="lg" style={{ lineHeight: 1 }}>
                    ₹
                    {Math.round(
                      totals.subtotal +
                        (paymentMethod === "COD" ? COD_SHIPPING : 0) - offerAmount
                    )}
                  </Text>
                  <Text size="xs" c="dimmed">
                    View Price Details
                  </Text>

                  {savedScheme && savedScheme.isDiscountApplicable ? (
                    <Text size="xs" style={{ color: DARK_GREEN, marginTop: 4 }}>
                      Buy above ₹
                      {Math.round(Number(savedScheme.couponAmount ?? 0))} — flat{" "}
                      {savedScheme.discountvalue}% off applied
                    </Text>
                  ) : promo && !promo.applied ? (
                    <Text size="xs" style={{ color: DARK_GREEN, marginTop: 4 }}>
                      Buy above ₹{Math.round(Number(promo.threshold))} — flat{" "}
                      {promo.discountPercent}% off available
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
                  style={{ backgroundColor: DARK_GREEN }}
                  radius="md"
                  size="md"
                  fullWidth
                  onClick={() => {
                    if (!isAuthenticated) {
                      openLoginModal();
                      return;
                    }
                    if (isAuthenticated && flatUserAddress === null) {
                      setAddressModalOpen(true);
                      return;
                    }
                    if (paymentMethod === "RAZORPAY") onPayNow();
                    else onPlaceCOD();
                  }}
                  loading={payLoading}
                  sx={{
                    backgroundColor: "red",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#0f2a12" },
                  }}
                >
                  PLACE ORDER
                </Button>
              </div>
            </Container>
          </Box>
          <LoginOtpModal opened={loginModalOpened} onClose={closeLoginModal} />
        </>
      )}
    </div>
  );
}
