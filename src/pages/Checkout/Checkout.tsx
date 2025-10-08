// // src/pages/Checkout.tsx
// import {
//   Container,
//   Grid,
//   Card,
//   Group,
//   Text,
//   Image,
//   Button,
//   ActionIcon,
//   Stack,
//   Divider,
//   Box,
//   SimpleGrid,
//   SegmentedControl,
//   Loader,
//   TextInput,
//   Badge,
//   Paper,
// } from "@mantine/core";
// import {
//   IconMinus,
//   IconPlus,
//   IconTrash,
//   IconInfoCircle,
//   IconPencil,
// } from "@tabler/icons-react";
// import { useMemo, useState, useEffect, useCallback } from "react";
// import axiosInstance from "../../api/axiosInstance";
// import SmallHeader from "../../components/SmallHeader";
// import Header from "../../components/Header";
// import Footer from "../Home/Footer";
// import MobileBottomNavbar from "../MobileBottomBar";
// import { loadRazorpay } from "../../utils/loadRazorpay";
// import { showNotification } from "@mantine/notifications";
// import { IconCheck, IconX } from "@tabler/icons-react";
// import { useNavigate } from "react-router-dom";
// import { API_GET_UPDATE, API_CART, API_GET_STATUS } from "../../api/api";
// import { useSelector, useDispatch } from "react-redux";
// import { removeFromCart, clearCart } from "../../redux/features/cartSlice";
// import * as storeModule from "../../redux/store";

// const normalizeColor = (c?: string) =>
//   (c ?? "").toString().trim().toLowerCase();

// // ✅ Fallback to null if persistor isn't exported
// let persistor: any = null;

// if ("persistor" in storeModule) {
//   persistor = (storeModule as any).persistor;
// }

// // Razorpay config
// const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;
// const CREATE_ORDER_URL = "/payments/razorpay/order";
// const VERIFY_URL = "/payments/razorpay/verify";
// const SERVER_CREATE_ORDER_URL = "/orders";
// const DELHIVERY_SHIPMENT_URL = "/delhivery/shipment";

// // GST percent (5%)
// const GST_PERCENT = 0.05;
// const COD_TOKEN = 100;
// const COD_SHIPPING = 50;

// // Colour tokens requested
// const DARK_GREEN = "#133215";
// const LIGHT_GREEN = "#92B775";

// type CartItem = {
//   id: string;
//   productId?: string;
//   title: string;
//   image?: string;
//   size?: string;
//   color?: string;
//   price?: number;
//   salePrice?: number;
//   qty: number;
//   raw?: any;
// };

// function CheckoutItemBox({
//   item,
//   onMinus,
//   onPlus,
//   onRemove,
//   promo,
//   prodId,
//   subtotal,
// }: {
//   item: CartItem;
//   onMinus: () => void;
//   onPlus: () => void;
//   onRemove: () => void;
//   promo?: {
//     threshold: number;
//     discountPercent: number;
//     applied: boolean;
//   } | null;
//   prodId?: any;
//   subtotal: number;
// }) {
//   const unitPrice = item.salePrice ?? item.price ?? 0;
//   const lineTotal = unitPrice * (item.qty ?? 1);
//   const img = item.image ?? "";
//   const showPromoHint = promo && !promo.applied && subtotal < promo.threshold;
//   const remaining = promo ? Math.max(0, promo.threshold - subtotal) : 0;
//   const navigate = useNavigate();

//   return (
//     <Card withBorder radius="md" p="sm">
//       {/* Product row */}
//       <Group align="flex-start" gap="sm" wrap="nowrap">
//         <Box
//           w={100}
//           h={100}
//           style={{
//             borderRadius: 8,
//             overflow: "hidden",
//             flexShrink: 0,
//             cursor: "pointer",
//           }}
//           onClick={() => navigate(`/product?id=${prodId}`)}
//         >
//           <Image
//             src={img}
//             alt={item.title}
//             width={100}
//             height={100}
//             fit="cover"
//             withPlaceholder
//           />
//         </Box>

//         <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
//           <Group position="apart" align="flex-start">
//             <Text fw={600} size="sm" lineClamp={2}>
//               {item.title}
//             </Text>
//             {item.raw?.isOfferAvailable ? (
//               <Badge
//                 style={{ backgroundColor: LIGHT_GREEN, color: DARK_GREEN }}
//               >
//                 OFFER APPLIED
//               </Badge>
//             ) : null}
//           </Group>

//           <Group gap="xs" wrap="wrap">
//             {item.size && (
//               <Text size="xs" c="dimmed">
//                 Size: {item.size}
//               </Text>
//             )}
//             {item.color && (
//               <Group gap={6} align="center">
//                 <Text size="xs" c="dimmed">
//                   Color:
//                 </Text>
//                 <Box
//                   w={14}
//                   h={14}
//                   style={{
//                     backgroundColor: item.color,
//                     borderRadius: "50%",
//                     border: "1px solid #ccc",
//                   }}
//                   title={item.color}
//                 />
//               </Group>
//             )}
//           </Group>

//           <Group gap="xs" align="center">
//             <Text fw={700} size="sm">
//               ₹{unitPrice}
//             </Text>
//             {item.salePrice && item.price && (
//               <Text size="xs" c="dimmed" td="line-through">
//                 ₹{item.price}
//               </Text>
//             )}
//           </Group>

//           <Group gap="xs" mt={2} wrap="nowrap">
//             <ActionIcon variant="light" size="sm" onClick={onMinus}>
//               <IconMinus size={14} />
//             </ActionIcon>
//             <Text size="sm">{item.qty}</Text>
//             <ActionIcon variant="light" size="sm" onClick={onPlus}>
//               <IconPlus size={14} />
//             </ActionIcon>
//             <ActionIcon
//               variant="subtle"
//               color="red"
//               size="sm"
//               onClick={onRemove}
//             >
//               <IconTrash size={16} />
//             </ActionIcon>
//             <Box style={{ marginLeft: "auto" }}>
//               <Text fw={600} size="sm">
//                 ₹{lineTotal}
//               </Text>
//             </Box>
//           </Group>

//           {item.raw?.buy3For999 && (
//             <Paper radius="sm" p="xs" style={{ backgroundColor: "#f3fbf4" }}>
//               <Group spacing="xs">
//                 <Text size="sm" style={{ color: DARK_GREEN }}>
//                   ✓
//                 </Text>
//                 <Text size="sm" style={{ color: DARK_GREEN }}>
//                   Buy 3 For 999
//                 </Text>
//                 <Text size="xs" c="dimmed">
//                   ({item.qty} Qty)
//                 </Text>
//               </Group>
//             </Paper>
//           )}
//         </Stack>
//       </Group>

//       {/* Promo hint full width, after product row */}
//       {showPromoHint && promo && (
//         <Paper
//           radius="sm"
//           p="xs"
//           mt="6px"
//           style={{
//             backgroundColor: "#f3fbf4",
//             borderLeft: `4px solid ${LIGHT_GREEN}`,
//             width: "100%",
//           }}
//         >
//           <Text size="xs" style={{ color: DARK_GREEN, fontWeight: 700 }}>
//             Buy above ₹{promo.threshold} — flat {promo.discountPercent}% off
//           </Text>
//           <Text size="xs" c="dimmed">
//             Add ₹{remaining} more to get the offer
//           </Text>
//         </Paper>
//       )}
//     </Card>
//   );
// }

// function mapServerCartToItems(respData: any): CartItem[] {
//   const root = respData ?? {};
//   const payload = root.data ?? root;

//   if (Array.isArray(payload)) {
//     return payload.map((it: any) => ({
//       id: it._id ?? it.id ?? String(it.product ?? it.productId ?? Date.now()),
//       productId: it.product ?? it.productId,
//       title: it.productName ?? it.productTitle ?? it.title ?? "Product",
//       image: it.image ?? it.imageUrl ?? "",
//       size: it.selectedSize ?? it.size,
//       color: it.selectedColor ?? it.color,
//       price: it.price ?? undefined,
//       salePrice: it.salePrice ?? it.price ?? undefined,
//       qty: Number(it.itemqty ?? it.quantity ?? it.qty ?? 1),
//       raw: it,
//     }));
//   }

//   if (payload && Array.isArray(payload.items)) {
//     return payload.items.map((it: any) => ({
//       id: it._id ?? it.id ?? String(it.product ?? it.productId ?? Date.now()),
//       productId: it.product ?? it.productId,
//       title: it.productTitle ?? it.title ?? it.productName ?? "Product",
//       image: it.image ?? it.imageUrl ?? "",
//       size: it.selectedSize ?? it.size,
//       color: it.selectedColor ?? it.color,
//       price: it.price ?? undefined,
//       salePrice: it.salePrice ?? it.price ?? undefined,
//       qty: Number(it.quantity ?? it.qty ?? it.itemqty ?? 1),
//       raw: it,
//     }));
//   }

//   if (
//     payload &&
//     typeof payload.product !== "undefined" &&
//     typeof payload.itemqty !== "undefined"
//   ) {
//     return [
//       {
//         id: payload.id ?? payload._id ?? payload.product,
//         productId: payload.product,
//         title: payload.productTitle ?? payload.productName ?? "Product",
//         image: payload.image ?? "",
//         size: payload.selectedSize ?? payload.size,
//         color: payload.selectedColor ?? payload.color,
//         price: payload.price ?? undefined,
//         salePrice: payload.salePrice ?? payload.price ?? undefined,
//         qty: Number(payload.itemqty ?? 1),
//         raw: payload,
//       },
//     ];
//   }

//   return [];
// }

// export default function Checkout() {
//   const [items, setItems] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [payLoading, setPayLoading] = useState(false);
//   const [paymentInProgress, setPaymentInProgress] = useState(false);
//   const [recoveringPayment, setRecoveringPayment] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(
//     "RAZORPAY"
//   );
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const checkForPendingPayments = async () => {
//       try {
//         // Check if we have a pending payment that needs recovery
//         const pendingPayment = localStorage.getItem("pendingRazorpayPayment");
//         const paymentProcessing = localStorage.getItem("paymentProcessing");

//         if (pendingPayment && !paymentProcessing) {
//           const paymentData = JSON.parse(pendingPayment);

//           // If payment was made but page reloaded, verify it
//           if (paymentData.status === "payment_made" && paymentData.paymentId) {
//             setRecoveringPayment(true);
//             showNotification({
//               title: "Verifying your payment...",
//               message: "Please wait while we confirm your payment",
//               color: "blue",
//               loading: true,
//             });

//             await verifyAndCompletePayment(paymentData);
//           }

//           // Clean up very old pending payments (older than 1 hour)
//           if (Date.now() - paymentData.timestamp > 60 * 60 * 1000) {
//             localStorage.removeItem("pendingRazorpayPayment");
//           }
//         }
//       } catch (error) {
//         console.error("Error checking pending payments:", error);
//         localStorage.removeItem("pendingRazorpayPayment");
//         localStorage.removeItem("paymentProcessing");
//       }
//     };

//     checkForPendingPayments();
//   }, []);

//   const verifyAndCompletePayment = async (paymentData: any) => {
//     try {
//       // Verify the payment with your server
//       const { data: verify } = await axiosInstance.post(VERIFY_URL, {
//         razorpay_payment_id: paymentData.paymentId,
//         razorpay_order_id: paymentData.orderId,
//         razorpay_signature: paymentData.signature,
//       });

//       if (!verify?.valid) {
//         showNotification({
//           title: "Payment verification failed",
//           message: "Please contact support with your payment ID",
//           color: "red",
//           icon: <IconX size={16} />,
//         });
//         return;
//       }

//       // Create order in database
//       let createdOrder: any = null;
//       try {
//         createdOrder = await createOrderHistory({
//           items: paymentData.items,
//           shippingAddress: paymentData.flatUserAddress,
//           billingAddress: paymentData.flatUserAddress,
//           paymentMethod: "online",
//           notes: "",
//           shippingCost: paymentData.totals.shipping,
//           tax: paymentData.totals.gst,
//           discount: paymentData.totals.totalDiscounts,
//           localOrderId: paymentData.orderId,
//           meta: {
//             razorpay: {
//               razorpay_payment_id: paymentData.paymentId,
//               razorpay_order_id: paymentData.orderId,
//               razorpay_signature: paymentData.signature,
//             },
//             savedScheme: paymentData.savedScheme?.isDiscountApplicable
//               ? paymentData.savedScheme
//               : null,
//             recovered: true,
//           },
//         });
//       } catch (orderErr) {
//         console.error("Order creation during recovery failed:", orderErr);
//       }

//       // ✅ ADD THIS: Create Delhivery shipment for recovered payment
//       if (createdOrder) {
//         try {
//           const serverOrderId =
//             createdOrder?.data?.id ||
//             createdOrder?.id ||
//             createdOrder?.orderNumber ||
//             createdOrder?.orderId ||
//             `ORDER${Date.now()}`;

//           await createDelhiveryShipment({
//             orderNumber: String(serverOrderId),
//             items: paymentData.items,
//             address: paymentData.flatUserAddress,
//             paymentMethod: "online",
//             totalsLocal: paymentData.totals,
//             meta: { createdOrder, recovered: true },
//           });

//           console.log("✅ Delhivery shipment created for recovered payment",flatUserAddress);
//         } catch (shipErr) {
//           console.error("❌ Delhivery shipment failed for recovery:", shipErr);
//         }
//       }

//       // Clear cart
//       await handleClearCart();

//       // Clean up storage
//       localStorage.removeItem("pendingRazorpayPayment");
//       localStorage.removeItem("paymentProcessing");
//       setRecoveringPayment(false);

//       // Navigate to success page
//       navigate("/order-success", {
//         state: {
//           order: createdOrder,
//           recovered: true,
//         },
//       });
//     } catch (error) {
//       console.error("Payment recovery failed:", error);
//       showNotification({
//         title: "Recovery failed",
//         message: "Please contact support with your payment details",
//         color: "red",
//         icon: <IconX size={16} />,
//       });
//       setRecoveringPayment(false);
//     }
//   };

//   // Redux selectors (adapt to your store shape if needed)
//   const reduxUser = useSelector(
//     (state: any) => state.auth?.user ?? state.user?.user ?? null
//   );
//   const reduxAddress = useSelector(
//     (state: any) =>
//       state.auth?.userAddress ??
//       state.user?.user?.address ??
//       state.address ??
//       null
//   );

//   const [user, setUser] = useState<any>(null);
//   const [storedUserAddress, setStoredUserAddress] = useState<any>(null);

//   // coupon state
//   const [couponCode, setCouponCode] = useState<string>("");
//   const [appliedCoupon, setAppliedCoupon] = useState<{
//     code: string;
//     discount: number;
//   } | null>(null);

//   // saved scheme (driven from server response)
//   const [savedScheme, setSavedScheme] = useState<any>(null);

//   const fetchCart = useCallback(async () => {
//     try {
//       setLoading(true);
//       const resp = await axiosInstance.get(API_GET_UPDATE);

//       const mapped = mapServerCartToItems(resp.data ?? resp);
//       setItems(mapped);

//       // normalize scheme
//       const root = resp?.data ?? resp;
//       if (root && typeof root.isDiscountApplicable !== "undefined") {
//         const parsed = {
//           ...root,
//           totalSalesPrice: Number(
//             root.totalSalesPrice ?? root.total_sales_price ?? 0
//           ),
//           minusValue: Number(
//             root.minusValue ?? root.minus_value ?? root.discountAmount ?? 0
//           ),
//           finalAmount: Number(root.finalAmount ?? root.final_amount ?? 0),
//           gst: Math.round(Number(root.gst ?? 0)),
//           couponAmount: Number(root.couponAmount ?? root.coupon_amount ?? 0),
//           discountvalue:
//             root.discountvalue ??
//             root.discount_value ??
//             root.couponOfferDiscount ??
//             root.discountvalue ??
//             0,
//           isDiscountApplicable: Boolean(root.isDiscountApplicable),
//         };
//         setSavedScheme(parsed);
//       } else if (
//         root &&
//         root.scheme &&
//         typeof root.scheme.isDiscountApplicable !== "undefined"
//       ) {
//         const s = root.scheme;
//         const parsed = {
//           ...s,
//           totalSalesPrice: Number(
//             s.totalSalesPrice ?? s.total_sales_price ?? 0
//           ),
//           minusValue: Number(
//             s.minusValue ?? s.minus_value ?? s.discountAmount ?? 0
//           ),
//           finalAmount: Number(s.finalAmount ?? s.final_amount ?? 0),
//           gst: Math.round(Number(s.gst ?? 0)),
//           couponAmount: Number(s.couponAmount ?? s.coupon_amount ?? 0),
//           discountvalue:
//             s.discountvalue ??
//             s.discount_value ??
//             s.couponOfferDiscount ??
//             s.discountvalue ??
//             0,
//           isDiscountApplicable: Boolean(s.isDiscountApplicable),
//         };
//         setSavedScheme(parsed);
//       } else {
//         setSavedScheme(null);
//       }
//     } catch (err: any) {
//       console.error("Fetch cart failed", err);
//       showNotification({
//         title: "Unable to load cart",
//         message: err?.response?.data?.message ?? "Please try again later",
//         color: "red",
//         icon: <IconX size={16} />,
//       });
//       setItems([]);
//       setSavedScheme(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);

//   useEffect(() => {
//     if (reduxUser) setUser(reduxUser);
//     if (reduxAddress) setStoredUserAddress(reduxAddress);
//   }, [reduxUser, reduxAddress]);

//   const updateLineQuantity = async (line: CartItem, newQuantity: number) => {
//     try {
//       const body = {
//         productId: String(line.productId ?? line.id),
//         quantity: newQuantity,
//         selectedSize: line.size,
//         selectedColor: line.color,
//       };

//       const resp = await axiosInstance.post(API_CART, body, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (resp?.status === 200 && resp?.data) {
//         showNotification({
//           title: newQuantity === 0 ? "Removed" : "Quantity updated",
//           message:
//             resp.data?.message ??
//             (newQuantity === 0
//               ? "Item removed"
//               : `Quantity updated to ${newQuantity}`),
//           color: "green",
//           icon: <IconCheck size={16} />,
//         });

//         // ✅ Only remove from Redux when qty becomes 0
//         //    and use EXACT keys the slice matches on:
//         //    id (as string) + size + *normalized* color.
//         if (newQuantity === 0) {
//           dispatch(
//             removeFromCart({
//               id: String(line.productId ?? line.id),
//               size: line.size ?? "",
//               selectedColor: normalizeColor(line.color ?? ""),
//               silent: true,
//             } as any)
//           );
//         }

//         // Server is source of truth — refresh UI
//         await fetchCart();
//       } else {
//         showNotification({
//           title: "Update failed",
//           message: "Unable to update cart. Try again.",
//           color: "red",
//           icon: <IconX size={16} />,
//         });
//       }
//     } catch (err: any) {
//       console.error("Update line failed", err);
//       showNotification({
//         title: "Update failed",
//         message:
//           err?.response?.data?.message ??
//           err?.message ??
//           "Unable to update cart",
//         color: "red",
//         icon: <IconX size={16} />,
//       });
//     }
//   };

//   const handleMinus = (item: CartItem) => {
//     const nextQty = Math.max(0, item.qty - 1);
//     updateLineQuantity(item, nextQty);
//   };
//   const handlePlus = (item: CartItem) => {
//     const nextQty = item.qty + 1;
//     updateLineQuantity(item, nextQty);
//   };
//   const handleRemove = (item: CartItem) => {
//     updateLineQuantity(item, 0);
//   };

//   const handleClearCart = async () => {
//     if (!items?.length) return;
//     const itemsToClear = [...items];

//     dispatch(clearCart());

//     try {
//       setLoading(true);

//       // 1) Server: set each item qty = 0 (best-effort)
//       await Promise.allSettled(
//         itemsToClear.map((it) =>
//           axiosInstance.post(API_CART, {
//             productId: String(it.productId ?? it.id),
//             quantity: 0,
//             selectedSize: it.size,
//             selectedColor: it.color,
//           })
//         )
//       );

//       // 2) Redux: clear slice + purge persisted storage so it doesn't rehydrate
//       try {
//         dispatch(clearCart());
//         if (persistor?.purge) {
//           await persistor.purge();
//         }
//       } catch (e) {
//         console.warn("Redux clearCart/purge failed:", e);
//       }

//       // Optional hard fallback if persistor import isn't available
//       try {
//         localStorage.removeItem("persist:root");
//         localStorage.removeItem("persist:cart");
//       } catch {
//         /* ignore */
//       }

//       // 3) Refresh from server (authoritative)
//       await fetchCart();

//       showNotification({
//         title: "Cart cleared",
//         message: "All items removed",
//         color: "green",
//         icon: <IconCheck size={16} />,
//       });
//     } catch (err: any) {
//       console.error("Clear cart failed", err);
//       showNotification({
//         title: "Clear failed",
//         message:
//           err?.response?.data?.message ??
//           err?.message ??
//           "Unable to clear cart",
//         color: "red",
//         icon: <IconX size={16} />,
//       });

//       // still attempt to clear local redux state
//       try {
//         dispatch(clearCart());
//         if (persistor?.purge) await persistor.purge();
//         localStorage.removeItem("persist:root");
//         localStorage.removeItem("persist:cart");
//       } catch {
//         /* ignore */
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Totals calculation
//    */
//   const totals = useMemo(() => {
//     const localSubtotal = (items || []).reduce((sum, i) => {
//       const p = i.salePrice ?? i.price ?? 0;
//       return sum + p * (i.qty ?? 1);
//     }, 0);

//     const totalQty = (items || []).reduce((q, i) => q + (i.qty ?? 0), 0);

//     let couponDiscount = 0;
//     if (appliedCoupon?.code === "SAVE10") {
//       couponDiscount = Math.round(Math.min(100, localSubtotal * 0.1));
//     } else if (appliedCoupon) {
//       couponDiscount = appliedCoupon.discount ?? 0;
//     }

//     const totalDiscounts = Math.min(localSubtotal, couponDiscount);
//     const discountedBase = localSubtotal - totalDiscounts;
//     const gstRaw = discountedBase * GST_PERCENT;
//     const gstComputed = Math.round(gstRaw);
//     const shipping =
//       paymentMethod === "COD" && items?.length ? COD_SHIPPING : 0;
//     let grandTotalComputed = Math.round(
//       discountedBase + gstComputed + shipping
//     );
//     let savingsPercentComputed =
//       localSubtotal > 0
//         ? Math.round((totalDiscounts / localSubtotal) * 100)
//         : 0;

//     if (savedScheme && savedScheme.isDiscountApplicable) {
//       const sTotalSales = Number(savedScheme.totalSalesPrice ?? 0);
//       const sMinus = Number(savedScheme.minusValue ?? 0);
//       const sFinal = Number(savedScheme.finalAmount ?? 0);
//       const sGst = Math.round(Number(savedScheme.gst ?? 0));
//       const effectiveFinal = Math.round(
//         sFinal + (paymentMethod === "COD" ? COD_SHIPPING : 0)
//       );

//       return {
//         subtotal: Math.round(sTotalSales),
//         totalQty,
//         couponDiscount: Number(savedScheme.couponAmount ?? couponDiscount),
//         totalDiscounts: Math.round(sMinus),
//         gst: Math.round(sGst),
//         shipping: paymentMethod === "COD" ? COD_SHIPPING : 0,
//         grandTotal: effectiveFinal,
//         savingsPercent:
//           sTotalSales > 0 ? Math.round((sMinus / sTotalSales) * 100) : 0,
//       };
//     }

//     return {
//       subtotal: Math.round(localSubtotal),
//       totalQty,
//       couponDiscount,
//       totalDiscounts,
//       gst: gstComputed,
//       shipping,
//       grandTotal: grandTotalComputed,
//       savingsPercent: savingsPercentComputed,
//     };
//   }, [items, paymentMethod, appliedCoupon, savedScheme]);

//   const promo = useMemo(() => {
//     if (
//       savedScheme &&
//       typeof savedScheme.isDiscountApplicable !== "undefined"
//     ) {
//       const threshold = Number(
//         savedScheme.couponAmount ?? savedScheme.totalSalesPrice ?? 0
//       );
//       const discountPercent = Number(
//         savedScheme.discountvalue ?? savedScheme.couponOfferDiscount ?? 0
//       );
//       const applied = Boolean(savedScheme.isDiscountApplicable);
//       if (threshold > 0 && discountPercent > 0)
//         return { threshold, discountPercent, applied };
//       return null;
//     }

//     for (const it of items) {
//       const raw = it.raw ?? {};
//       const threshold = Number(
//         raw.couponDiscount ?? raw.couponAmount ?? raw.coupon_threshold ?? 0
//       );
//       const discountPercent = Number(
//         raw.couponOfferDiscount ?? raw.discountvalue ?? raw.couponPercent ?? 0
//       );
//       const applied = Boolean(raw.isDiscountApplicable ?? false);
//       if (threshold > 0 && discountPercent > 0) {
//         return { threshold, discountPercent, applied };
//       }
//     }

//     return null;
//   }, [savedScheme, items]);

//   const flatUserAddress = storedUserAddress

//   const ensureAuthAndAddress = () => {
//     if (!flatUserAddress) {
//       showNotification({
//         title: "Address required",
//         message: "Add your address in account before checkout",
//         color: "yellow",
//         icon: <IconInfoCircle size={16} />,
//       });
//       // Navigate and scroll into view to make it obvious
//       navigate("/account");
//       return false;
//     }
//     return true;
//   };

//   const applyCoupon = () => {
//     const code = (couponCode || "").trim().toUpperCase();
//     if (!code) {
//       showNotification({
//         title: "Coupon",
//         message: "Enter a coupon code",
//         color: "yellow",
//         icon: <IconX size={16} />,
//       });
//       return;
//     }

//     if (code === "SAVE10") {
//       setAppliedCoupon({ code: "SAVE10", discount: 0 });
//       showNotification({
//         title: "Coupon applied",
//         message: "SAVE10 applied",
//         color: "green",
//         icon: <IconCheck size={16} />,
//       });
//     } else {
//       showNotification({
//         title: "Invalid coupon",
//         message: "Coupon not recognized",
//         color: "red",
//         icon: <IconX size={16} />,
//       });
//     }
//   };

//   const removeCoupon = () => {
//     setAppliedCoupon(null);
//     setCouponCode("");
//     showNotification({
//       title: "Coupon removed",
//       message: "",
//       color: "green",
//       icon: <IconCheck size={16} />,
//     });
//   };

//   async function createOrderHistory({
//     items,
//     shippingAddress,
//     billingAddress,
//     paymentMethod,
//     notes,
//     shippingCost,
//     localOrderId,
//     tax,
//     discount,
//     meta,
//     amountToChargeOnDelivery,
//   }: {
//     items: CartItem[];
//     shippingAddress?: any;
//     billingAddress?: any;
//     paymentMethod: string;
//     notes?: string;
//     shippingCost?: number;
//     localOrderId?: any;
//     tax?: number;
//     discount?: number;
//     meta?: any;
//     amountToChargeOnDelivery?: number;
//   }) {
//     const payload = {
//       items: items.map((it) => ({
//         product: it.productId ?? it.id,
//         quantity: it.qty,
//         selectedSize: it.size ?? undefined,
//         productUrl: it.image ?? "",
//       })),
//       shippingAddress: shippingAddress ?? {},
//       billingAddress: billingAddress ?? shippingAddress ?? {},
//       paymentMethod,
//       notes: notes ?? "",
//       shippingCost: shippingCost ?? 0,
//       tax: tax ?? 0,
//       discount: discount ?? 0,
//       amountToChargeOnDelivery: amountToChargeOnDelivery ?? null,
//       meta: meta ?? {},
//     };

//     const token =
//       (reduxUser &&
//         (reduxUser.token ?? reduxUser.accessToken ?? reduxUser.authToken)) ??
//       null;

//     const headers: any = { "Content-Type": "application/json" };
//     if (token) headers.authorization = `Bearer ${token}`;

//     const resp = await axiosInstance.post(SERVER_CREATE_ORDER_URL, payload, {
//       headers,
//     });
//     await loadRazorpay();
//     return resp.data ?? resp;
//   }

//   async function createDelhiveryShipment({
//     orderNumber,
//     items,
//     address,
//     paymentMethod,
//     totalsLocal,
//     meta,
//   }: {
//     orderNumber: string;
//     items: CartItem[];
//     address?: any;
//     paymentMethod: string;
//     totalsLocal?: any;
//     meta?: any;
//   }) {
//     const reduxUserData = reduxUser?.address?.[0] ?? address;
//     const name = reduxUserData?.name ?? "Customer";
//     const streetParts: string[] = [];
//     if (reduxUserData?.street) streetParts.push(reduxUserData.street);
//     if (reduxUserData?.line1) streetParts.push(reduxUserData.line1);
//     if (reduxUserData?.line2) streetParts.push(reduxUserData.line2);
//     if (reduxUserData?.city) streetParts.push(reduxUserData.city);
//     if (reduxUserData?.state) streetParts.push(reduxUserData.state);
//     const add = streetParts.join(", ") || (reduxUserData?.street ?? "");
//     const pin =
//       reduxUserData?.zip ??
//       address?.pin ??
//       address?.zipCode ??
//       address?.zipcode ??
//       address?.pincode ??
//       "";
//     const city = reduxUserData?.city ?? "";
//     const state = reduxUserData?.state ?? "";
//     const country = reduxUserData?.country ?? "India";
//     const phone =
//       reduxUserData?.phone ??
//       address?.mobile ??
//       reduxUser?.mobile ??
//       reduxUser?.phone ??
//       "0000000000";

//     const products_desc = items
//       .map((it) => `${it.title} x${it.qty}`)
//       .join(", ");
//     const quantity = items.reduce((s, it) => s + (it.qty ?? 0), 0).toString();
//     const total_amount = String(
//       totalsLocal?.grandTotal ?? totalsLocal?.subtotal ?? 0
//     );
//     const cod_amount =
//       paymentMethod === "COD" || paymentMethod === "cod_token"
//         ? String(
//             totalsLocal?.amountToChargeOnDelivery ??
//               totalsLocal?.grandTotal ??
//               0
//           )
//         : "0";
//     const order_date = new Date().toISOString().split("T")[0];

//     const shipments = [
//       {
//         name,
//         add,
//         pin: String(pin ?? ""),
//         city,
//         state,
//         country,
//         phone: String(phone),
//         orderId: orderNumber,
//         products_desc,
//         cod_amount,
//         order_date,
//         total_amount,
//         quantity,
//       },
//     ];

//     const token =
//       (reduxUser &&
//         (reduxUser.token ?? reduxUser.accessToken ?? reduxUser.authToken)) ??
//       null;

//     const headers: any = { "Content-Type": "application/json" };
//     if (token) headers.Authorization = `Bearer ${token}`;

//     const resp = await axiosInstance.post(
//       DELHIVERY_SHIPMENT_URL,
//       { shipments },
//       { headers }
//     );
//     return resp.data ?? resp;
//   }

//   // const onPayNow = async () => {
//   //   if (!ensureAuthAndAddress()) return;

//   //   setPayLoading(true);
//   //   try {
//   //     if (!items?.length) {
//   //       showNotification({
//   //         title: "Cart empty",
//   //         message: "Add items to proceed",
//   //         color: "yellow",
//   //         icon: <IconX size={16} />,
//   //       });
//   //       return;
//   //     }

//   //     // Compute amount
//   //     const baseFinal =
//   //       savedScheme && savedScheme.isDiscountApplicable
//   //         ? Number(savedScheme.finalAmount ?? totals.grandTotal)
//   //         : totals.grandTotal;

//   //     const amountToCollect = Math.max(0, Math.round(baseFinal));
//   //     const amountPaise = amountToCollect * 100;
//   //     if (amountPaise <= 0) {
//   //       showNotification({
//   //         title: "Invalid amount",
//   //         message: "Amount must be greater than 0.",
//   //         color: "red",
//   //         icon: <IconX size={16} />,
//   //       });
//   //       return;
//   //     }

//   //     // Create RZP order on server
//   //     const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
//   //       amount: amountPaise,
//   //       currency: "INR",
//   //       receipt: "rcpt_" + Date.now(),
//   //       notes: { itemCount: String(items.length), paymentType: "FULL" },
//   //     });

//   //     if (!order?.id || !order?.amount) {
//   //       console.error("Invalid Razorpay order:", order);
//   //       showNotification({
//   //         title: "Payment error",
//   //         message: "Couldn't initialize payment. Please try again.",
//   //         color: "red",
//   //         icon: <IconX size={16} />,
//   //       });
//   //       return;
//   //     }

//   //     // (Optional) check receipt status
//   //     try {
//   //       const { data: receiptCheck } = await axiosInstance.get(
//   //         `${API_GET_STATUS}${order.receipt}`
//   //       );
//   //       console.log("Receipt status:", receiptCheck);
//   //     } catch (e) {
//   //       console.warn("Receipt status check failed (non-blocking):", e);
//   //     }

//   //     // Ensure SDK is ready, then open checkout
//   //     await loadRazorpay();

//   //     const prefillName = (reduxUser?.name ?? user?.name) || "Customer";
//   //     const prefillEmail =
//   //       (reduxUser?.email ?? user?.email) || "customer@example.com";
//   //     const prefillContact =
//   //       (reduxUser?.mobile ??
//   //         reduxUser?.phone ??
//   //         user?.mobile ??
//   //         user?.phone) ||
//   //       "9000000000";

//   //     const rzp = new (window as any).Razorpay({
//   //       key: RAZORPAY_KEY_ID,
//   //       amount: order.amount,
//   //       currency: order.currency,
//   //       name: "TO IMPRESS",
//   //       description: "Order Payment",
//   //       order_id: order.id,
//   //       prefill: {
//   //         name: prefillName,
//   //         email: prefillEmail,
//   //         contact: prefillContact,
//   //       },
//   //       notes: { cartItems: String(items.length), source: "web_checkout_full" },
//   //       theme: { color: DARK_GREEN },
//   //       async: false,
//   //       handler: async (resp: any) => {
//   //         // 👉 Log the Razorpay PAYMENT RESPONSE (not the script)
//   //         console.log("Razorpay payment success:", resp);

//   //         try {
//   //           const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
//   //           if (!verify?.valid) {
//   //             alert("Payment verification failed.");
//   //             return;
//   //           }
//   //           showNotification({
//   //             title: "Processing...",
//   //             message: "Please don't close the window",
//   //             color: "blue",
//   //             loading: true,
//   //           });
//   //           let createdOrder: any = null;
//   //           try {
//   //             createdOrder = await createOrderHistory({
//   //               items,
//   //               shippingAddress: flatUserAddress,
//   //               billingAddress: flatUserAddress,
//   //               paymentMethod: "online",
//   //               notes: "",
//   //               shippingCost: totals.shipping,
//   //               tax: totals.gst,
//   //               discount: totals.totalDiscounts,
//   //               localOrderId: order.id,
//   //               meta: {
//   //                 razorpay: resp,
//   //                 savedScheme:
//   //                   savedScheme && savedScheme.isDiscountApplicable
//   //                     ? savedScheme
//   //                     : null,
//   //               },
//   //             });
//   //           } catch (orderErr) {
//   //             console.error("Order history creation failed:", orderErr);
//   //             showNotification({
//   //               title: "Order saved partially",
//   //               message:
//   //                 "Payment succeeded but we couldn't save order history. Contact support if needed.",
//   //               color: "yellow",
//   //               icon: <IconInfoCircle size={16} />,
//   //             });
//   //           }

//   //           try {
//   //             const serverOrderId =
//   //               createdOrder?.data?.id ||
//   //               createdOrder?.id ||
//   //               createdOrder?.orderNumber ||
//   //               createdOrder?.orderId ||
//   //               createdOrder?.data?.orderNumber ||
//   //               createdOrder?.data?.orderId ||
//   //               `ORDER${Date.now()}`;

//   //             if (serverOrderId) {
//   //               await createDelhiveryShipment({
//   //                 orderNumber: String(serverOrderId),
//   //                 items,
//   //                 address: flatUserAddress,
//   //                 paymentMethod: "online",
//   //                 totalsLocal: totals,
//   //                 meta: { createdOrder },
//   //               });
//   //               showNotification({
//   //                 title: "Shipment created",
//   //                 message: "Shipment created successfully with Delhivery.",
//   //                 color: "green",
//   //                 icon: <IconCheck size={16} />,
//   //               });
//   //             }
//   //           } catch (shipErr) {
//   //             console.error("Delhivery shipment creation failed:", shipErr);
//   //             showNotification({
//   //               title: "Shipment creation failed",
//   //               message:
//   //                 "Order was created but shipment creation failed. Support will assist.",
//   //               color: "yellow",
//   //               icon: <IconInfoCircle size={16} />,
//   //             });
//   //           }

//   //           await handleClearCart();
//   //           navigate("/order-success", { state: { order: createdOrder } });
//   //         } catch (e) {
//   //           console.error("Verification/create shipment error:", e);
//   //           alert(
//   //             "Payment succeeded but verification or shipment creation failed. Please contact support."
//   //           );
//   //         }
//   //         rzp.close();
//   //       },
//   //     });

//   //     rzp.on("payment.failed", (e: any) => {
//   //       console.error("Razorpay payment failed:", e?.error);
//   //       alert(e?.error?.description || "Payment failed. Please try again.");
//   //     });

//   //     rzp.close();
//   //   } catch (err) {
//   //     console.error("onPayNow error:", err);
//   //     alert("Unable to start payment. Please try again.");
//   //   } finally {
//   //     setPayLoading(false);
//   //   }
//   // };

//   const onPayNow = async () => {
//     if (!ensureAuthAndAddress() || recoveringPayment) return;

//     setPayLoading(true);
//     setPaymentInProgress(true);

//     try {
//       if (!items?.length) {
//         showNotification({
//           title: "Cart empty",
//           message: "Add items to proceed",
//           color: "yellow",
//           icon: <IconX size={16} />,
//         });
//         return;
//       }

//       // Compute amount
//       const baseFinal =
//         savedScheme && savedScheme.isDiscountApplicable
//           ? Number(savedScheme.finalAmount ?? totals.grandTotal)
//           : totals.grandTotal;

//       const amountToCollect = Math.max(0, Math.round(baseFinal));
//       const amountPaise = amountToCollect * 100;

//       if (amountPaise <= 0) {
//         showNotification({
//           title: "Invalid amount",
//           message: "Amount must be greater than 0.",
//           color: "red",
//           icon: <IconX size={16} />,
//         });
//         return;
//       }

//       const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
//         amount: amountPaise,
//         currency: "INR",
//         receipt: "rcpt_" + Date.now(),
//         notes: {
//           itemCount: String(items.length),
//           paymentType: "FULL",
//           source: "checkout_page",
//         },
//       });

//       if (!order?.id || !order?.amount) {
//         console.error("Invalid Razorpay order:", order);
//         showNotification({
//           title: "Payment error",
//           message: "Couldn't initialize payment. Please try again.",
//           color: "red",
//           icon: <IconX size={16} />,
//         });
//         return;
//       }

//       const paymentSession = {
//         orderId: order.id,
//         amount: amountToCollect,
//         items: items,
//         totals: totals,
//         flatUserAddress: flatUserAddress,
//         savedScheme: savedScheme,
//         timestamp: Date.now(),
//         status: "initiated",
//       };
//       localStorage.setItem(
//         "pendingRazorpayPayment",
//         JSON.stringify(paymentSession)
//       );

//       await loadRazorpay();

//       const prefillName = (reduxUser?.name ?? user?.name) || "Customer";
//       const prefillEmail =
//         (reduxUser?.email ?? user?.email) || "customer@example.com";
//       const prefillContact =
//         (reduxUser?.mobile ??
//           reduxUser?.phone ??
//           user?.mobile ??
//           user?.phone) ||
//         "9000000000";

//       // Create Razorpay instance with optimized settings
//       const rzp = new (window as any).Razorpay({
//         key: RAZORPAY_KEY_ID,
//         amount: order.amount,
//         currency: order.currency,
//         name: "TO IMPRESS",
//         description: "Order Payment",
//         order_id: order.id,
//         prefill: {
//           name: prefillName,
//           email: prefillEmail,
//           contact: prefillContact,
//         },
//         notes: {
//           cartItems: String(items.length),
//           source: "web_checkout_full",
//           orderId: order.id,
//         },
//         theme: { color: DARK_GREEN },
//         // Critical: These settings help with external app redirects
//         async: false,
//         modal: {
//           ondismiss: function () {
//             console.log("Razorpay modal dismissed");
//             setPaymentInProgress(false);
//             // Don't remove immediately - wait for potential redirect
//             setTimeout(() => {
//               if (!localStorage.getItem("paymentProcessing")) {
//                 localStorage.removeItem("pendingRazorpayPayment");
//               }
//             }, 5000); // 5 second grace period
//           },
//           escape: true,
//           backdropclose: true,
//         },
//         handler: function (response: any) {
//           paymentSession.paymentId = response.razorpay_payment_id;
//           paymentSession.signature = response.razorpay_signature;
//           paymentSession.status = "payment_made";
//           localStorage.setItem(
//             "pendingRazorpayPayment",
//             JSON.stringify(paymentSession)
//           );
//           localStorage.setItem("paymentProcessing", "true");

//           rzp.close();
//           processPaymentBackground(response, paymentSession);
//         },
//       });

//       // Handle payment failures
//       rzp.on("payment.failed", function (response: any) {
//         console.error("Razorpay payment failed:", response.error);
//         setPaymentInProgress(false);
//         localStorage.removeItem("pendingRazorpayPayment");
//         localStorage.removeItem("paymentProcessing");

//         showNotification({
//           title: "Payment failed",
//           message:
//             response.error.description || "Payment failed. Please try again.",
//           color: "red",
//           icon: <IconX size={16} />,
//         });
//       });

//       // Handle when modal closes without payment
//       rzp.on("modal.closed", function () {
//         console.log("Razorpay modal closed");
//         setPaymentInProgress(false);
//         // Give some time for handler to trigger before cleaning up
//         setTimeout(() => {
//           if (!localStorage.getItem("paymentProcessing")) {
//             localStorage.removeItem("pendingRazorpayPayment");
//           }
//         }, 3000);
//       });

//       // Finally open the modal
//       rzp.open();
//     } catch (err) {
//       console.error("onPayNow error:", err);
//       setPaymentInProgress(false);
//       localStorage.removeItem("pendingRazorpayPayment");
//       localStorage.removeItem("paymentProcessing");
//       alert("Unable to start payment. Please try again.");
//     } finally {
//       setPayLoading(false);
//     }
//   };

//   const processPaymentBackground = async (
//     response: any,
//     paymentSession: any
//   ) => {
//     try {
//       console.log("Processing payment in background...");

//       // Verify payment
//       const { data: verify } = await axiosInstance.post(VERIFY_URL, {
//         razorpay_payment_id: response.razorpay_payment_id,
//         razorpay_order_id: response.razorpay_order_id,
//         razorpay_signature: response.razorpay_signature,
//       });

//       if (!verify?.valid) {
//         throw new Error("Payment verification failed");
//       }

//       // Create order
//       let createdOrder: any = null;
//       try {
//         createdOrder = await createOrderHistory({
//           items: paymentSession.items,
//           shippingAddress: paymentSession.flatUserAddress,
//           billingAddress: paymentSession.flatUserAddress,
//           paymentMethod: "online",
//           notes: "",
//           shippingCost: paymentSession.totals.shipping,
//           tax: paymentSession.totals.gst,
//           discount: paymentSession.totals.totalDiscounts,
//           localOrderId: paymentSession.orderId,
//           meta: {
//             razorpay: response,
//             savedScheme: paymentSession.savedScheme?.isDiscountApplicable
//               ? paymentSession.savedScheme
//               : null,
//           },
//         });
//       } catch (orderErr) {
//         console.error("Order creation failed:", orderErr);
//       }

//       // ✅ ADD THIS: Create Delhivery shipment
//       if (createdOrder) {
//         try {
//           const serverOrderId =
//             createdOrder?.data?.id ||
//             createdOrder?.id ||
//             createdOrder?.orderNumber ||
//             createdOrder?.orderId ||
//             createdOrder?.data?.orderNumber ||
//             createdOrder?.data?.orderId ||
//             `ORDER${Date.now()}`;

//           await createDelhiveryShipment({
//             orderNumber: String(serverOrderId),
//             items: paymentSession.items,
//             address: paymentSession.flatUserAddress,
//             paymentMethod: "online",
//             totalsLocal: paymentSession.totals,
//             meta: { createdOrder },
//           });

//           console.log("✅ Delhivery shipment created successfully",flatUserAddress);
//         } catch (shipErr) {
//           console.error("❌ Delhivery shipment creation failed:", shipErr);
//           // Don't block the flow - log for manual intervention
//         }
//       }

//       // Clear cart
//       await handleClearCart();

//       // Clean up storage
//       localStorage.removeItem("pendingRazorpayPayment");
//       localStorage.removeItem("paymentProcessing");
//       setPaymentInProgress(false);

//       // Navigate to success page
//       navigate("/order-success", {
//         state: {
//           order: createdOrder,
//           paymentId: response.razorpay_payment_id,
//         },
//       });
//     } catch (error) {
//       console.error("Background payment processing failed:", error);

//       showNotification({
//         title: "Payment processing delayed",
//         message:
//           "Your payment was successful but processing is taking longer. Please wait...",
//         color: "yellow",
//         icon: <IconInfoCircle size={16} />,
//       });
//     }
//   };

//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       if (paymentInProgress || localStorage.getItem("paymentProcessing")) {
//         e.preventDefault();
//         e.returnValue =
//           "Your payment is being processed. Are you sure you want to leave?";
//         return e.returnValue;
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [paymentInProgress]);

//   useEffect(() => {
//     const checkPendingPayment = async () => {
//       try {
//         // You're using different keys in different places - standardize them
//         const pendingPayment = localStorage.getItem("pendingRazorpayPayment");
//         const paymentProcessing = localStorage.getItem("paymentProcessing");

//         if (pendingPayment && !paymentProcessing) {
//           const paymentData = JSON.parse(pendingPayment);

//           console.log("🔍 Checking pending payment:", paymentData.status);

//           if (paymentData.status === "payment_made" && paymentData.paymentId) {
//             console.log("🔄 Recovering interrupted payment...");

//             showNotification({
//               title: "Completing your order...",
//               message: "Please wait while we finalize your payment",
//               color: "blue",
//               loading: true,
//             });

//             localStorage.setItem("paymentProcessing", "true");
//             await processPaymentBackground(
//               {
//                 razorpay_payment_id: paymentData.paymentId,
//                 razorpay_order_id: paymentData.orderId,
//                 razorpay_signature: paymentData.signature,
//               },
//               paymentData
//             );
//           }
//         }
//       } catch (error) {
//         console.error("Payment recovery error:", error);
//         localStorage.removeItem("pendingRazorpayPayment");
//         localStorage.removeItem("paymentProcessing");
//       }
//     };

//     const timer = setTimeout(() => {
//       checkPendingPayment();
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [navigate]);

//   // Fast recovery processing
//   const processPaymentRecovery = async (paymentSession: any) => {
//     try {
//       // Verify payment
//       const { data: verify } = await axiosInstance.post(VERIFY_URL, {
//         razorpay_payment_id: paymentSession.paymentId,
//         razorpay_order_id: paymentSession.razorpayOrderId,
//         razorpay_signature: paymentSession.signature,
//       });

//       if (!verify?.valid) {
//         showNotification({
//           title: "Payment verification failed",
//           message: "Please contact support with your payment ID",
//           color: "red",
//           icon: <IconX size={16} />,
//         });
//         return;
//       }

//       // Create order if not exists
//       let createdOrder: any = null;
//       try {
//         createdOrder = await createOrderHistory({
//           items: paymentSession.items,
//           shippingAddress: paymentSession.flatUserAddress,
//           billingAddress: paymentSession.flatUserAddress,
//           paymentMethod: "online",
//           notes: "",
//           shippingCost: paymentSession.totals.shipping,
//           tax: paymentSession.totals.gst,
//           discount: paymentSession.totals.totalDiscounts,
//           localOrderId: paymentSession.razorpayOrderId,
//           meta: {
//             razorpay: {
//               razorpay_payment_id: paymentSession.paymentId,
//               razorpay_order_id: paymentSession.razorpayOrderId,
//               razorpay_signature: paymentSession.signature,
//             },
//             savedScheme: paymentSession.savedScheme?.isDiscountApplicable
//               ? paymentSession.savedScheme
//               : null,
//           },
//         });
//       } catch (orderErr) {
//         console.error("Order creation in recovery failed:", orderErr);
//       }

//       // Clear cart and navigate
//       await handleClearCart();
//       localStorage.removeItem("pendingPayment");
//       localStorage.removeItem("paymentProcessing");

//       navigate("/order-success", {
//         state: {
//           order: createdOrder,
//           recovered: true,
//         },
//       });
//     } catch (error) {
//       console.error("Payment recovery failed:", error);
//       localStorage.removeItem("pendingPayment");
//       localStorage.removeItem("paymentProcessing");
//     }
//   };

//   const onPlaceCOD = async () => {
//     if (!ensureAuthAndAddress()) return;

//     setPayLoading(true);
//     try {
//       if (!items?.length) {
//         showNotification({
//           title: "Cart empty",
//           message: "Add items to proceed",
//           color: "yellow",
//           icon: <IconX size={16} />,
//         });
//         return;
//       }

//       const baseFinal =
//         savedScheme && savedScheme.isDiscountApplicable
//           ? Number(savedScheme.finalAmount ?? totals.grandTotal)
//           : totals.grandTotal;

//       const orderTotal = Math.round(baseFinal + COD_SHIPPING);
//       const tokenToCollect = COD_TOKEN;
//       const remainingAmount = Math.max(0, orderTotal - tokenToCollect);

//       // If no token, create order directly
//       if (tokenToCollect <= 0) {
//         let createdOrder: any = null;
//         try {
//           createdOrder = await createOrderHistory({
//             items,
//             shippingAddress: flatUserAddress,
//             billingAddress: flatUserAddress,
//             paymentMethod: "cod",
//             notes: "",
//             shippingCost: COD_SHIPPING,
//             tax: totals.gst,
//             discount: totals.totalDiscounts,
//             meta: {
//               immediateCOD: true,
//               savedScheme:
//                 savedScheme && savedScheme.isDiscountApplicable
//                   ? savedScheme
//                   : null,
//             },
//             amountToChargeOnDelivery: orderTotal,
//           });
//         } catch (orderErr) {
//           console.error(
//             "Order history creation failed (COD immediate):",
//             orderErr
//           );
//           showNotification({
//             title: "Order saved partially",
//             message:
//               "COD placed but could not save order history. Contact support.",
//             color: "yellow",
//             icon: <IconInfoCircle size={16} />,
//           });
//         }

//         try {
//           const serverOrderId =
//             createdOrder?.data?.id ||
//             createdOrder?.id ||
//             createdOrder?.orderNumber ||
//             createdOrder?.orderId ||
//             createdOrder?.data?.orderNumber ||
//             createdOrder?.data?.orderId ||
//             `ORDER${Date.now()}`;

//           if (serverOrderId) {
//             await createDelhiveryShipment({
//               orderNumber: String(serverOrderId),
//               items,
//               address: flatUserAddress,
//               paymentMethod: "cod",
//               totalsLocal: {
//                 ...totals,
//                 grandTotal: orderTotal,
//                 amountToChargeOnDelivery: orderTotal,
//               },
//               meta: { createdOrder },
//             });
//             showNotification({
//               title: "Shipment created",
//               message: "Shipment created successfully with Delhivery.",
//               color: "green",
//               icon: <IconCheck size={16} />,
//             });
//           }
//         } catch (shipErr) {
//           console.error(
//             "Delhivery shipment creation failed (COD immediate):",
//             shipErr
//           );
//           showNotification({
//             title: "Shipment creation failed",
//             message:
//               "COD placed but couldn't create shipment. Contact support.",
//             color: "yellow",
//             icon: <IconInfoCircle size={16} />,
//           });
//         }

//         await handleClearCart();
//         showNotification({
//           title: "COD placed",
//           message: `Delivery agent will collect ₹${orderTotal}`,
//           color: "green",
//           icon: <IconCheck size={16} />,
//         });
//         navigate("/order-success", { state: { order: createdOrder } });
//         return;
//       }

//       // Collect COD token via Razorpay
//       const tokenPaise = tokenToCollect * 100;

//       const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
//         amount: tokenPaise,
//         currency: "INR",
//         receipt: "cod_token_rcpt_" + Date.now(),
//         notes: { itemCount: String(items.length), paymentType: "COD_TOKEN" },
//       });

//       if (!order?.id || !order?.amount) {
//         console.error("Invalid Razorpay order (COD token):", order);
//         showNotification({
//           title: "Payment error",
//           message: "Couldn't initialize token payment. Please try again.",
//           color: "red",
//           icon: <IconX size={16} />,
//         });
//         return;
//       }

//       await loadRazorpay();

//       const prefillName = (reduxUser?.name ?? user?.name) || "Customer";
//       const prefillEmail =
//         (reduxUser?.email ?? user?.email) || "customer@example.com";
//       const prefillContact =
//         (reduxUser?.mobile ??
//           reduxUser?.phone ??
//           user?.mobile ??
//           user?.phone) ||
//         "9000000000";

//       const rzp = new (window as any).Razorpay({
//         key: RAZORPAY_KEY_ID,
//         amount: order.amount,
//         currency: order.currency,
//         name: "TO IMPRESS",
//         description: `COD token - ₹${tokenToCollect}`,
//         order_id: order.id,
//         prefill: {
//           name: prefillName,
//           email: prefillEmail,
//           contact: prefillContact,
//         },
//         notes: { cartItems: String(items.length), source: "web_cod_token" },
//         theme: { color: DARK_GREEN },
//         handler: async (resp: any) => {
//           // 👉 Log the Razorpay PAYMENT RESPONSE for COD token
//           console.log("Razorpay COD token success:", resp);

//           try {
//             const { data: verify } = await axiosInstance.post(VERIFY_URL, resp);
//             if (!verify?.valid) {
//               alert(
//                 "Token payment verification failed. Please contact support."
//               );
//               return;
//             }

//             let createdOrder: any = null;
//             try {
//               createdOrder = await createOrderHistory({
//                 items,
//                 shippingAddress: flatUserAddress,
//                 billingAddress: flatUserAddress,
//                 paymentMethod: "cod_token",
//                 notes: "",
//                 shippingCost: COD_SHIPPING,
//                 tax: totals.gst,
//                 discount: totals.totalDiscounts,
//                 localOrderId: order.id,
//                 meta: {
//                   razorpay: resp,
//                   savedScheme:
//                     savedScheme && savedScheme.isDiscountApplicable
//                       ? savedScheme
//                       : null,
//                 },
//                 amountToChargeOnDelivery: remainingAmount,
//               });
//             } catch (orderErr) {
//               console.error(
//                 "Order history creation failed (COD token):",
//                 orderErr
//               );
//               showNotification({
//                 title: "Order saved partially",
//                 message:
//                   "Token paid but could not save order history. Contact support.",
//                 color: "yellow",
//                 icon: <IconInfoCircle size={16} />,
//               });
//             }

//             try {
//               const serverOrderId =
//                 createdOrder?.data?.id ||
//                 createdOrder?.id ||
//                 createdOrder?.orderNumber ||
//                 createdOrder?.orderId ||
//                 createdOrder?.data?.orderNumber ||
//                 createdOrder?.data?.orderId ||
//                 `ORDER${Date.now()}`;

//               if (serverOrderId) {
//                 await createDelhiveryShipment({
//                   orderNumber: String(serverOrderId),
//                   items,
//                   address: flatUserAddress,
//                   paymentMethod: "cod_token",
//                   totalsLocal: {
//                     ...totals,
//                     grandTotal: orderTotal,
//                     amountToChargeOnDelivery: remainingAmount,
//                   },
//                   meta: { createdOrder },
//                 });
//                 showNotification({
//                   title: "Shipment created",
//                   message: "Shipment created successfully with Delhivery.",
//                   color: "green",
//                   icon: <IconCheck size={16} />,
//                 });
//               }
//             } catch (shipErr) {
//               console.error(
//                 "Delhivery shipment creation failed (COD token):",
//                 shipErr
//               );
//               showNotification({
//                 title: "Shipment creation failed",
//                 message:
//                   "Token paid but couldn't create shipment. Contact support.",
//                 color: "yellow",
//                 icon: <IconInfoCircle size={16} />,
//               });
//             }

//             await handleClearCart();
//             showNotification({
//               title: "COD placed",
//               message: `Token ₹${tokenToCollect} paid. Remaining ₹${remainingAmount} on delivery.`,
//               color: "green",
//               icon: <IconCheck size={16} />,
//             });
//             navigate("/order-success", { state: { order: createdOrder } });
//           } catch (e) {
//             console.error("Verification or shipment create failed:", e);
//             alert(
//               "Token payment succeeded but verification or shipment creation failed. Please contact support."
//             );
//           }
//         },
//       });

//       rzp.on("payment.failed", (e: any) => {
//         // 👉 Log the failure response
//         console.error("Razorpay COD token failed:", e?.error);
//         alert(
//           e?.error?.description || "Token payment failed. Please try again."
//         );
//       });

//       rzp.open();
//     } catch (err) {
//       console.error("onPlaceCOD error:", err);
//       alert("Unable to place COD order. Please try again.");
//     } finally {
//       setPayLoading(false);
//     }
//   };

//   // Fallback to localStorage if Redux hasn't hydrated on mobile
//   useEffect(() => {
//     if (!reduxAddress && !storedUserAddress) {
//       try {
//         const raw = localStorage.getItem("userAddress");
//         if (raw) setStoredUserAddress(JSON.parse(raw));
//       } catch {
//         /* ignore */
//       }
//     }
//   }, [reduxAddress, storedUserAddress]);

//   useEffect(() => {
//     if (!reduxUser && !user) {
//       try {
//         const raw = localStorage.getItem("user");
//         if (raw) setUser(JSON.parse(raw));
//       } catch {
//         /* ignore */
//       }
//     }
//   }, [reduxUser, user]);

//   return (
//     <div>
//       <SmallHeader />
//       <Header />

//       {loading ? (
//         <Container size="lg" py="xl">
//           <Box className="flex items-center justify-center py-24">
//             <Loader />
//           </Box>
//         </Container>
//       ) : !items?.length ? (
//         <Container size="lg" py="xl">
//           <Card p="lg" withBorder>
//             <Text fw={600} size="lg">
//               Your cart is empty
//             </Text>
//             <Text c="dimmed" size="sm" mt="xs">
//               Add some products to proceed to checkout.
//             </Text>
//             <Button
//               mt="md"
//               onClick={async () => {
//                 await handleClearCart();
//                 navigate("/");
//               }}
//             >
//               Continue shopping
//             </Button>
//           </Card>
//         </Container>
//       ) : (
//         <>
//           <Container size="lg" py="xl" style={{ paddingBottom: 290 }}>
//             <Grid gutter="lg">
//               <Grid.Col span={{ base: 12, md: 7 }}>
//                 <Box>
//                   <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
//                     {items.map((item, idx) => {
//                       if ((item.qty ?? 0) > 0) {
//                         return (
//                           <CheckoutItemBox
//                             key={`${item.id}-${item.size ?? ""}-${
//                               item.color ?? ""
//                             }-${idx}`}
//                             prodId={item.productId}
//                             item={item}
//                             onMinus={() => handleMinus(item)}
//                             onPlus={() => handlePlus(item)}
//                             onRemove={() => handleRemove(item)}
//                             promo={
//                               promo
//                                 ? {
//                                     threshold: promo.threshold,
//                                     discountPercent: promo.discountPercent,
//                                     applied: promo.applied,
//                                   }
//                                 : null
//                             }
//                             subtotal={totals.subtotal}
//                           />
//                         );
//                       }
//                       return null;
//                     })}
//                   </SimpleGrid>
//                 </Box>
//               </Grid.Col>

//               <Grid.Col span={{ base: 12, md: 5 }} mb={120}>
//                 <Card
//                   withBorder
//                   p="lg"
//                   radius="md"
//                   styles={{
//                     root: {
//                       [`@media (min-width: 1024px)`]: {
//                         position: "sticky",
//                         top: 16,
//                         maxHeight: "calc(100vh - 32px)",
//                         overflow: "auto",
//                       },
//                     },
//                   }}
//                 >
//                   <Text fw={700} mb="md">
//                     Order Summary
//                   </Text>

//                   <Stack gap="xs" mb="md">
//                     <Group justify="space-between" align="flex-start">
//                       <Text size="sm" fw={600}>
//                         Shipping to
//                       </Text>
//                       <Button
//                         size="xs"
//                         variant="subtle"
//                         leftSection={<IconPencil size={14} />}
//                         onClick={() => navigate("/account")}
//                       >
//                         Change
//                       </Button>
//                     </Group>

//                     {flatUserAddress ? (
//                       <Paper radius="md" p="sm" withBorder>
//                         <Stack gap={2}>
//                           <Text size="sm" fw={600}>
//                             {flatUserAddress.name || "Customer"}
//                           </Text>
//                           {flatUserAddress.email ? (
//                             <Text size="xs" c="dimmed">
//                               {flatUserAddress.email}
//                             </Text>
//                           ) : null}
//                           <Text size="xs" c="dimmed">
//                             {[
//                               flatUserAddress.line1,
//                               flatUserAddress.line2,
//                               flatUserAddress.city,
//                               flatUserAddress.state,
//                               flatUserAddress.country,
//                             ]
//                               .filter(Boolean)
//                               .join(", ")}
//                             {flatUserAddress.pincode
//                               ? ` - ${flatUserAddress.pincode}`
//                               : ""}
//                           </Text>
//                           {flatUserAddress.phone ? (
//                             <Text size="xs" c="dimmed">
//                               Phone: +91 {flatUserAddress.phone}
//                             </Text>
//                           ) : null}
//                           {flatUserAddress.landmark ? (
//                             <Text size="xs" c="dimmed">
//                               Landmark: {flatUserAddress.landmark}
//                             </Text>
//                           ) : null}
//                         </Stack>
//                       </Paper>
//                     ) : (
//                       <Paper radius="md" p="sm" withBorder>
//                         <Stack gap={6}>
//                           <Text size="sm" c="dimmed">
//                             No address found.
//                           </Text>
//                           <Button
//                             size="xs"
//                             onClick={() => navigate("/account")}
//                             sx={{
//                               backgroundColor: DARK_GREEN,
//                               color: "#fff",
//                               "&:hover": { backgroundColor: "#0f2a12" },
//                               alignSelf: "flex-start",
//                             }}
//                           >
//                             Add Address
//                           </Button>
//                         </Stack>
//                       </Paper>
//                     )}
//                   </Stack>

//                   <Stack gap="xs" mb="sm">
//                     <Text fw={600} size="sm">
//                       Payment Method
//                     </Text>
//                     <SegmentedControl
//                       value={paymentMethod}
//                       onChange={(v) => setPaymentMethod(v as any)}
//                       data={[
//                         { label: "Razorpay (UPI/Card)", value: "RAZORPAY" },
//                         { label: "Cash on Delivery (COD)", value: "COD" },
//                       ]}
//                     />
//                   </Stack>

//                   {savedScheme && savedScheme.isDiscountApplicable && (
//                     <Paper
//                       radius="md"
//                       p="12px"
//                       mb="12px"
//                       style={{
//                         backgroundColor: "#f3fbf4",
//                         border: `1px solid ${LIGHT_GREEN}`,
//                       }}
//                     >
//                       <Text size="sm" fw={700} style={{ color: DARK_GREEN }}>
//                         Buy above ₹
//                         {Math.round(Number(savedScheme.couponAmount ?? 0))} and
//                         get flat {savedScheme.discountvalue}% off
//                       </Text>
//                       <Text size="xs" c="dimmed" mt={6}>
//                         Scheme applied:{" "}
//                         <span style={{ color: DARK_GREEN, fontWeight: 700 }}>
//                           Yes
//                         </span>
//                       </Text>
//                     </Paper>
//                   )}

//                   {!savedScheme && promo && !promo.applied && (
//                     <Paper
//                       radius="md"
//                       p="12px"
//                       mb="12px"
//                       style={{
//                         backgroundColor: "#f3fbf4",
//                         border: `1px solid ${LIGHT_GREEN}`,
//                       }}
//                     >
//                       <Text size="sm" fw={700} style={{ color: DARK_GREEN }}>
//                         Buy above ₹{Math.round(Number(promo.threshold))} and get
//                         flat {promo.discountPercent}% off
//                       </Text>
//                       <Text size="xs" c="dimmed" mt={6}>
//                         Add ₹{Math.max(0, promo.threshold - totals.subtotal)}{" "}
//                         more to get the offer
//                       </Text>
//                     </Paper>
//                   )}

//                   <Group justify="space-between" mb="xs">
//                     <Text c="dimmed">Total MRP</Text>
//                     <Text>₹{totals.subtotal}</Text>
//                   </Group>

//                   {savedScheme && savedScheme.isDiscountApplicable ? (
//                     <Group justify="space-between" mb="xs">
//                       <Text c="dimmed">
//                         Scheme Discount ({savedScheme.discountvalue}% off)
//                       </Text>
//                       <Text style={{ color: LIGHT_GREEN, fontWeight: 700 }}>
//                         -₹{Math.round(Number(savedScheme.minusValue ?? 0))}
//                       </Text>
//                     </Group>
//                   ) : (
//                     <Group justify="space-between" mb="xs">
//                       <Text c="dimmed">Discount</Text>
//                       <Text style={{ color: LIGHT_GREEN, fontWeight: 700 }}>
//                         -₹{totals.totalDiscounts ?? 0}
//                       </Text>
//                     </Group>
//                   )}

//                   <Group justify="space-between" mb="xs">
//                     <Text c="dimmed">Cart Subtotal</Text>
//                     <Text>
//                       ₹
//                       {Math.max(
//                         0,
//                         totals.subtotal -
//                           (savedScheme && savedScheme.isDiscountApplicable
//                             ? Math.round(Number(savedScheme.minusValue ?? 0))
//                             : totals.totalDiscounts ?? 0)
//                       )}
//                     </Text>
//                   </Group>

//                   <Group justify="space-between" mb="xs">
//                     <Text c="dimmed">Shipping Fee</Text>
//                     <Text>
//                       {totals.shipping === 0 ? "Free" : `₹${totals.shipping}`}
//                     </Text>
//                   </Group>

//                   <Group justify="space-between" mb="xs">
//                     <Text c="dimmed">GST (5%)</Text>
//                     <Text>₹{totals.gst}</Text>
//                   </Group>

//                   <Divider my="sm" />
//                   <Group justify="space-between" mb="md">
//                     <Text fw={700}>You Pay</Text>
//                     <Text fw={700}>
//                       ₹
//                       {savedScheme && savedScheme.isDiscountApplicable
//                         ? Math.round(
//                             Number(savedScheme.finalAmount) +
//                               (paymentMethod === "COD" ? COD_SHIPPING : 0)
//                           )
//                         : totals.grandTotal}
//                     </Text>
//                   </Group>

//                   {/* ✅ COD advance note */}
//                   {paymentMethod === "COD" && (
//                     <Paper
//                       radius="sm"
//                       p="xs"
//                       mb="sm"
//                       style={{ backgroundColor: "#f3fbf4" }}
//                     >
//                       <Text size="sm" fw={500} style={{ color: DARK_GREEN }}>
//                         Note: For COD orders, ₹100 is collected in advance
//                         online. The remaining amount is paid on delivery.
//                       </Text>
//                     </Paper>
//                   )}

//                   <Paper
//                     radius="sm"
//                     p="md"
//                     style={{ backgroundColor: "#f7fff6" }}
//                   >
//                     <Group position="apart" align="center">
//                       <div>
//                         <Text size="sm" style={{ color: DARK_GREEN }}>
//                           Your Savings ₹
//                           {savedScheme && savedScheme.isDiscountApplicable
//                             ? Math.round(savedScheme.minusValue)
//                             : totals.totalDiscounts}
//                         </Text>
//                         <Text size="xs" c="dimmed">
//                           {savedScheme && savedScheme.isDiscountApplicable
//                             ? `${Math.round(
//                                 (Number(savedScheme.minusValue) /
//                                   Number(savedScheme.totalSalesPrice)) *
//                                   100
//                               )}%`
//                             : `${totals.savingsPercent ?? 0}%`}
//                         </Text>
//                       </div>
//                       <div>🎁</div>
//                     </Group>
//                   </Paper>

//                   <Divider my="sm" />
//                 </Card>
//               </Grid.Col>
//             </Grid>
//           </Container>

//           <Box
//             style={{
//               position: "fixed",
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 2000, // was 999
//               pointerEvents: "auto", // make sure it gets the tap
//               borderTop: "1px solid #eee",
//               background: "#fff",
//               padding: "10px 0px",
//               boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
//             }}
//           >
//             <Container
//               size="lg"
//               style={{ display: "flex", flexDirection: "column", gap: 8 }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   gap: 12,
//                 }}
//               >
//                 <div>
//                   <Text fw={700} size="lg" style={{ lineHeight: 1 }}>
//                     ₹
//                     {savedScheme && savedScheme.isDiscountApplicable
//                       ? Math.round(
//                           Number(savedScheme.finalAmount) +
//                             (paymentMethod === "COD" ? COD_SHIPPING : 0)
//                         )
//                       : totals.grandTotal}
//                   </Text>
//                   <Text size="xs" c="dimmed">
//                     View Price Details
//                   </Text>

//                   {savedScheme && savedScheme.isDiscountApplicable ? (
//                     <Text size="xs" style={{ color: DARK_GREEN, marginTop: 4 }}>
//                       Buy above ₹
//                       {Math.round(Number(savedScheme.couponAmount ?? 0))} — flat{" "}
//                       {savedScheme.discountvalue}% off applied
//                     </Text>
//                   ) : promo && !promo.applied ? (
//                     <Text size="xs" style={{ color: DARK_GREEN, marginTop: 4 }}>
//                       Buy above ₹{Math.round(Number(promo.threshold))} — flat{" "}
//                       {promo.discountPercent}% off available
//                     </Text>
//                   ) : null}
//                 </div>

//                 <div style={{ textAlign: "right" }}>
//                   <Text size="sm">Your Savings</Text>
//                   <Text fw={700} style={{ color: LIGHT_GREEN }}>
//                     ₹
//                     {savedScheme && savedScheme.isDiscountApplicable
//                       ? Math.round(savedScheme.minusValue)
//                       : totals.totalDiscounts}
//                   </Text>
//                 </div>
//               </div>

//               <div style={{ display: "flex", gap: 8 }}>
//                 <Button
//                   radius="md"
//                   size="md"
//                   fullWidth
//                   onClick={() => {
//                     if (flatUserAddress.length == 0) {
//                       navigate("/account");
//                       return;
//                     }
//                     if (paymentMethod === "RAZORPAY") onPayNow();
//                     else onPlaceCOD();
//                   }}
//                   loading={payLoading}
//                   sx={{
//                     backgroundColor: DARK_GREEN,
//                     color: "#fff",
//                     "&:hover": { backgroundColor: "#0f2a12" },
//                   }}
//                 >
//                   PLACE ORDER
//                 </Button>
//               </div>
//             </Container>
//           </Box>
//         </>
//       )}
//     </div>
//   );
// }

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
  TextInput,
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
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { loadRazorpay } from "../../utils/loadRazorpay";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { API_GET_UPDATE, API_CART, API_GET_STATUS } from "../../api/api";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../../redux/features/cartSlice";
import * as storeModule from "../../redux/store";
import { notifications } from "@mantine/notifications";

const normalizeColor = (c?: string) =>
  (c ?? "").toString().trim().toLowerCase();

// ✅ Fallback to null if persistor isn't exported
let persistor: any = null;

if ("persistor" in storeModule) {
  persistor = (storeModule as any).persistor;
}

// Razorpay config
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
      {/* Product row */}
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
            withPlaceholder
          />
        </Box>

        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group position="apart" align="flex-start">
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
              <Group spacing="xs">
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

      {/* Promo hint full width, after product row */}
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

  if (
    payload &&
    typeof payload.product !== "undefined" &&
    typeof payload.itemqty !== "undefined"
  ) {
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
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [recoveringPayment, setRecoveringPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(
    "RAZORPAY"
  );
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
        // Check if we have a pending payment that needs recovery
        const pendingPayment = localStorage.getItem("pendingRazorpayPayment");
        const paymentProcessing = localStorage.getItem("paymentProcessing");

        if (pendingPayment && !paymentProcessing) {
          const paymentData = JSON.parse(pendingPayment);

          // If payment was made but page reloaded, verify it
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

          // Clean up very old pending payments (older than 1 hour)
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

  const verifyAndCompletePayment = async (paymentData: any) => {
    try {
      // Verify the payment with your server
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

      // Create order in database
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

      // ✅ ADD THIS: Create Delhivery shipment for recovered payment
      // if (createdOrder) {
      //   try {
      //     const serverOrderId =
      //       createdOrder?.data?.id ||
      //       createdOrder?.id ||
      //       createdOrder?.orderNumber ||
      //       createdOrder?.orderId ||
      //       `ORDER${Date.now()}`;

      //     await createDelhiveryShipment({
      //       orderNumber: String(serverOrderId),
      //       items: paymentData.items,
      //       address: paymentData.flatUserAddress,
      //       paymentMethod: "online",
      //       totalsLocal: paymentData.totals,
      //       meta: { createdOrder, recovered: true },
      //     });

      //     console.log("✅ Delhivery shipment created for recovered payment");
      //   } catch (shipErr) {
      //     console.error("❌ Delhivery shipment failed for recovery:", shipErr);
      //   }
      // }

      // Clear cart
      await handleClearCart();

      // Clean up storage
      localStorage.removeItem("pendingRazorpayPayment");
      localStorage.removeItem("paymentProcessing");
      setRecoveringPayment(false);

      // Navigate to success page
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

  // Redux selectors (adapt to your store shape if needed)
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

  const [user, setUser] = useState<any>(null);
  const [storedUserAddress, setStoredUserAddress] = useState<any>(null);

  // coupon state
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

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
            (newQuantity === 0
              ? "Item removed"
              : `Quantity updated to ${newQuantity}`),
          color: "green",
          icon: <IconCheck size={16} />,
        });

        // ✅ Only remove from Redux when qty becomes 0
        //    and use EXACT keys the slice matches on:
        //    id (as string) + size + *normalized* color.
        if (newQuantity === 0) {
          dispatch(
            removeFromCart({
              id: String(line.productId ?? line.id),
              size: line.size ?? "",
              selectedColor: normalizeColor(line.color ?? ""),
              silent: true,
            } as any)
          );
        }

        // Server is source of truth — refresh UI
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
        message:
          err?.response?.data?.message ??
          err?.message ??
          "Unable to update cart",
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
        dispatch(clearCart());
        if (persistor?.purge) {
          await persistor.purge();
        }
      } catch (e) {
        console.warn("Redux clearCart/purge failed:", e);
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
        message:
          err?.response?.data?.message ??
          err?.message ??
          "Unable to clear cart",
        color: "red",
        icon: <IconX size={16} />,
      });

      // still attempt to clear local redux state
      try {
        dispatch(clearCart());
        if (persistor?.purge) await persistor.purge();
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
    const shipping =
      paymentMethod === "COD" && items?.length ? COD_SHIPPING : 0;
    let grandTotalComputed = Math.round(
      discountedBase + gstComputed + shipping
    );
    let savingsPercentComputed =
      localSubtotal > 0
        ? Math.round((totalDiscounts / localSubtotal) * 100)
        : 0;

    if (savedScheme && savedScheme.isDiscountApplicable) {
      const sTotalSales = Number(savedScheme.totalSalesPrice ?? 0);
      const sMinus = Number(savedScheme.minusValue ?? 0);
      const sFinal = Number(savedScheme.finalAmount ?? 0);
      const sGst = Math.round(Number(savedScheme.gst ?? 0));
      const effectiveFinal = Math.round(
        sFinal + (paymentMethod === "COD" ? COD_SHIPPING : 0)
      );

      return {
        subtotal: Math.round(sTotalSales),
        totalQty,
        couponDiscount: Number(savedScheme.couponAmount ?? couponDiscount),
        totalDiscounts: Math.round(sMinus),
        gst: Math.round(sGst),
        shipping: paymentMethod === "COD" ? COD_SHIPPING : 0,
        grandTotal: effectiveFinal,
        savingsPercent:
          sTotalSales > 0 ? Math.round((sMinus / sTotalSales) * 100) : 0,
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
      // Navigate and scroll into view to make it obvious
      navigate("/account");
      return false;
    }
    return true;
  };

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

  // ✅ NEW: Show API error modal
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

      const token =
        (reduxUser &&
          (reduxUser.token ?? reduxUser.accessToken ?? reduxUser.authToken)) ??
        null;

      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.authorization = `Bearer ${token}`;

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
    try {
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
        reduxUserData?.zip ??
        address?.pin ??
        address?.zipCode ??
        address?.zipcode ??
        address?.pincode ??
        "";
      const city = reduxUserData?.city ?? "";
      const state = reduxUserData?.state ?? "";
      const country = reduxUserData?.country ?? "India";
      const phone =
        reduxUserData?.phone ??
        address?.mobile ??
        reduxUser?.mobile ??
        reduxUser?.phone ??
        "0000000000";

      const products_desc = items
        .map((it) => `${it.title} x${it.qty}`)
        .join(", ");
      const quantity = items.reduce((s, it) => s + (it.qty ?? 0), 0).toString();
      const total_amount = String(
        totalsLocal?.grandTotal ?? totalsLocal?.subtotal ?? 0
      );
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
        (reduxUser &&
          (reduxUser.token ?? reduxUser.accessToken ?? reduxUser.authToken)) ??
        null;

      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await axiosInstance.post(
        DELHIVERY_SHIPMENT_URL,
        { shipments },
        { headers }
      );

      if (resp.status !== 200 && resp.status !== 201) {
        throw new Error(`Shipment creation failed with status: ${resp.status}`);
      }

      return resp.data ?? resp;
    } catch (error: any) {
      console.error("Delhivery shipment creation failed:", error);
      throw new Error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to create shipment. Please try again."
      );
    }
  }

  // ✅ NEW: Validate APIs before proceeding to payment
  const validateOrderApis = async (): Promise<{
    success: boolean;
    orderData?: any;
    orderId?: string;
  }> => {
    try {
      // Step 1: Create order in database
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
            prePayment: true, // Mark as pre-payment validation
          },
          amountToChargeOnDelivery:
            paymentMethod === "COD" ? totals.grandTotal - COD_TOKEN : undefined,
        });
        console.log("✅ Order created successfully:", createdOrder);

        // ✅ Extract order ID immediately
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

      // Step 2: Create Delhivery shipment
      try {
        const serverOrderId =
          createdOrder?.data?.id ||
          createdOrder?.id ||
          createdOrder?.orderNumber ||
          createdOrder?.orderId ||
          createdOrder?.data?.orderNumber ||
          createdOrder?.data?.orderId ||
          `ORDER${Date.now()}`;

        // await createDelhiveryShipment({
        //   orderNumber: String(serverOrderId),
        //   items,
        //   address: flatUserAddress,
        //   paymentMethod: paymentMethod === "RAZORPAY" ? "online" : "cod_token",
        //   totalsLocal: {
        //     ...totals,
        //     amountToChargeOnDelivery:
        //       paymentMethod === "COD"
        //         ? totals.grandTotal - COD_TOKEN
        //         : undefined,
        //   },
        //   meta: { createdOrder, prePayment: true },
        // });
      } catch (shipmentError: any) {
        showApiError(
          "Shipment Creation Failed",
          "Something went wrong while creating your shipment. Don't worry, please try again in a moment."
        );
        return { success: false };
      }

      // ✅ Return the order ID along with success status
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

    // ✅ STEP 1: Validate APIs before payment and get orderId
    const apiValidation = await validateOrderApis();
    if (!apiValidation.success) {
      setPayLoading(false);
      return; // Stop here if API validation fails
    }

    // ✅ Use the orderId returned from validation
    const localOrderId = apiValidation.orderId;
    console.log("Using orderId:", localOrderId);

    // Compute amount
    const baseFinal =
      savedScheme && savedScheme.isDiscountApplicable
        ? Number(savedScheme.finalAmount ?? totals.grandTotal)
        : totals.grandTotal;

    const amountToCollect = Math.max(0, Math.round(baseFinal));
    const amountPaise = amountToCollect * 100;

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
      // ✅ Pass the actual orderId instead of null
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
      // ✅ Store the local order ID for recovery
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

    // Create Razorpay instance with optimized settings
    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
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
        // ✅ Include local order ID in notes
        localOrderId: localOrderId,
      },
      theme: { color: DARK_GREEN },
      // Critical: These settings help with external app redirects
      async: false,
      modal: {
        ondismiss: function () {
          console.log("Razorpay modal dismissed");
          setPaymentInProgress(false);
          // Don't remove immediately - wait for potential redirect
          setTimeout(() => {
            if (!localStorage.getItem("paymentProcessing")) {
              localStorage.removeItem("pendingRazorpayPayment");
            }
          }, 5000); // 5 second grace period
        },
        escape: true,
        backdropclose: true,
      },
      handler: function (response: any) {
        paymentSession.paymentId = response.razorpay_payment_id;
        paymentSession.signature = response.razorpay_signature;
        paymentSession.status = "payment_made";
        // ✅ Ensure localOrderId is preserved
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

    // Handle payment failures
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

    // Handle when modal closes without payment
    rzp.on("modal.closed", function () {
      console.log("Razorpay modal closed");
      setPaymentInProgress(false);
      // Give some time for handler to trigger before cleaning up
      setTimeout(() => {
        if (!localStorage.getItem("paymentProcessing")) {
          localStorage.removeItem("pendingRazorpayPayment");
        }
      }, 3000);
    });

    // Finally open the modal
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

    // Verify payment
    const { data: verify } = await axiosInstance.post(VERIFY_URL, {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
    });

    if (!verify?.valid) {
      throw new Error("Payment verification failed");
    }

    // Update order status to confirmed (post-payment)
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
        // ✅ Use the stored localOrderId
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
      // Don't block success flow - log for manual intervention
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
          id: paymentSession.localOrderId || paymentSession.orderId 
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
      const tokenPaise = tokenToCollect * 100;

      const { data: order } = await axiosInstance.post(CREATE_ORDER_URL, {
        amount: tokenPaise,
        currency: "INR",
        receipt: "cod_token_rcpt_" + Date.now(),
        notes: { itemCount: String(items.length), paymentType: "COD_TOKEN" },
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
        notes: { cartItems: String(items.length), source: "web_cod_token" },
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
                localOrderId: order.id,
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
              state: { order: { paymentMethod: "cod_token" } },
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

  // Rest of the component remains the same...
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
                <Box>
                  <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md">
                    {items.map((item, idx) => {
                      if ((item.qty ?? 0) > 0) {
                        return (
                          <CheckoutItemBox
                            key={`${item.id}-${item.size ?? ""}-${
                              item.color ?? ""
                            }-${idx}`}
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
                        onClick={() => navigate("/account")}
                      >
                        Change
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
                          <Button
                            size="xs"
                            onClick={() => navigate("/account")}
                            style={{
                              backgroundColor: DARK_GREEN,
                              color: "#fff",
                            }}
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
                        totals.subtotal -
                          (savedScheme && savedScheme.isDiscountApplicable
                            ? Math.round(Number(savedScheme.minusValue ?? 0))
                            : totals.totalDiscounts ?? 0)
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
                    {/* <Text c="dimmed">GST (5%)</Text> */}
                    <Text style={{color:DARK_GREEN, fontWeight:'bold'}}>Total MRP is inclusive of 5% GST</Text>
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
                    <Group position="apart" align="center">
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
              zIndex: 2000, // was 999
              pointerEvents: "auto", // make sure it gets the tap
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
                    {savedScheme && savedScheme.isDiscountApplicable
                      ? Math.round(
                          Number(savedScheme.finalAmount) +
                            (paymentMethod === "COD" ? COD_SHIPPING : 0)
                        )
                      : totals.grandTotal}
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
                    if (flatUserAddress === null) {
                      notifications.show({
                        title: "Address Missing",
                        message: "Please add a shipping address to proceed",
                        color: `${LIGHT_GREEN}`,
                      });
                      navigate("/account");
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
        </>
      )}
    </div>
  );
}
