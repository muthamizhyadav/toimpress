import {
  Box,
  Button,
  Drawer,
  Group,
  Image,
  Stack,
  Text,
  useMantineTheme,
  Badge,
  Tabs,
  ScrollArea,
  AspectRatio,
  Center,
  rem,
  Loader,
  Anchor,
  ThemeIcon,
  Divider,
  Card,
  SimpleGrid,
  Skeleton,
  Collapse,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconCheck, IconClock, IconPackage, IconRefresh, IconArrowBackUp, IconChevronRight, IconX, IconCash, IconShoppingCart, IconTruck, IconRoute, IconMapPin, IconPackageOff, IconPackageImport } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import axiosInstance from "../../api/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { loadRazorpay } from "../../utils/loadRazorpay";

const DARK_GREEN = "#133215";
const EXCHANGE_CHARGE = 150;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;

export default function OrderList() {
  const [opened, { open, close }] = useDisclosure(false);
  const [trackOpened, { open: openTrack, close: closeTrack }] =
    useDisclosure(false);
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<
    {
      status: string;
      location: string;
      timestamp: string;
      instructions?: string;
    }[]
  >([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [trackingMeta, setTrackingMeta] = useState<any>(null);

  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { tokens }: any = useSelector((state: RootState) => state.auth);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [requestMap, setRequestMap] = useState<Record<string, { type: string; status: string; id?: string; reason?: string }>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [deliveryStatusMap, setDeliveryStatusMap] = useState<Record<string, string>>({});
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchMyRequests = async () => {
    try {
      const [exRes, retRes] = await Promise.allSettled([
        axiosInstance.get("/exchange-return/exchanges/my-requests?limit=100"),
        axiosInstance.get("/exchange-return/returns/my-requests?limit=100"),
      ]);
      const map: Record<string, { type: string; status: string; id?: string; reason?: string }> = {};
      const build = (list: any, type: string) => {
        (list || []).forEach((r: any) => {
          const id = r.orderItemId || r.orderItem?._id || r.orderItemId?._id;
          if (id) map[id] = { type, status: r.status || "", id: r._id || r.id || "", reason: r.reason || "" };
        });
      };
      if (exRes.status === "fulfilled") {
        const d = exRes.value.data?.data || exRes.value.data || [];
        build(Array.isArray(d) ? d : d?.results || [], "exchange");
      }
      if (retRes.status === "fulfilled") {
        const d = retRes.value.data?.data || retRes.value.data || [];
        build(Array.isArray(d) ? d : d?.results || [], "return");
      }
      setRequestMap(map);
    } catch (err) {
      console.error("Failed to fetch exchange/return requests", err);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const isOrderDelivered = (order: any) => {
    // Prefer live Delhivery tracking status (fetched from the track API)
    const key = order?._id || order?.id;
    const live = key ? deliveryStatusMap[key] : undefined;
    if (live) {
      const s = String(live).toLowerCase();
      return /delivered|success/.test(s);
    }

    const status = (order?.status || "").toLowerCase();
    if (/delivered|completed|fulfilled|success/.test(status)) return true;
    const sh = order?.delhiveryDetails;
    if (sh) {
      const s = (sh.status || "").toLowerCase();
      if (/delivered|success/.test(s)) return true;
    }
    return false;
  };

  const checkDeliveryStatus = async (order: any) => {
    const key = order?._id || order?.id;
    if (!key || deliveryStatusMap[key] !== undefined) return;

    const waybill =
      order?.delhiveryDetails?.waybill ??
      order?.awb ??
      order?.items?.[0]?.awb;
    if (!waybill) return;

    try {
      const res = await axiosInstance.get(
        `delhivery/track?waybill=${waybill}`,
        {
          headers: { Authorization: `Bearer ${tokens?.access?.token}` },
        }
      );
      const shipment = res.data?.ShipmentData?.[0]?.Shipment;
      const status =
        shipment?.Status?.Status ??
        shipment?.Status?.status ??
        shipment?.Status?.State ??
        "";
      setDeliveryStatusMap((prev) => ({ ...prev, [key]: status }));
    } catch (err) {
      console.error("Failed to fetch delivery status", err);
    }
  };

  const getRequestForItem = (itemId: string) => requestMap[itemId] || null;

  const isChargeWaived = (req: any) =>
    String(req?.reason || "").trim().toLowerCase() === "defective product";

  const handlePayRequestCharge = async (req: any) => {
    try {
      setPayingId(req.id);

      const amountPaise = EXCHANGE_CHARGE * 100;
      const isExchange = req.type === "exchange";
      const reqType = isExchange ? "exchange" : "return";

      const { data: order } = await axiosInstance.post(
        "/payments/razorpay/order",
        {
          amount: amountPaise,
          currency: "INR",
          receipt: `${reqType}_rcpt_` + Date.now(),
          localOrderId: req.id,
          notes: {
            exchangeRequestId: req.id,
            type: `${reqType}_processing_charge`,
          },
        }
      );

      if (!order?.id || !order?.amount) {
        showNotification({
          title: "Payment error",
          message: "Couldn't initialize payment. Please try again.",
          color: "red",
        });
        return;
      }

      await loadRazorpay();

      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TO IMPRESS",
        description: `${isExchange ? "Exchange" : "Return"} Processing Charge`,
        order_id: order.id,
        theme: { color: DARK_GREEN },
        handler: async (response: any) => {
          try {
            try {
              await axiosInstance.post("/payments/razorpay/verify", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
            } catch (err) {
              console.warn("Signature verify failed, continuing", err);
            }

            await axiosInstance.post(
              `/exchange-return/${isExchange ? "exchanges" : "returns"}/${req.id}/pay`,
              {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              }
            );

            showNotification({
              title: "Payment Successful",
              message: `${isExchange ? "Exchange" : "Return"} processing charge paid successfully`,
              color: "green",
              icon: <IconCheck size={16} />,
            });

            fetchMyRequests();
          } catch (err) {
            showNotification({
              title: "Error",
              message: "Payment verified but status update failed. Contact support.",
              color: "yellow",
            });
          }
        },
      });

      rzp.on("payment.failed", (e: any) => {
        showNotification({
          title: "Payment Failed",
          message: e?.error?.description || "Please try again",
          color: "red",
          icon: <IconX size={16} />,
        });
      });

      rzp.open();
    } catch (err) {
      showNotification({
        title: "Error",
        message: "Failed to initiate payment",
        color: "red",
      });
    } finally {
      setPayingId(null);
    }
  };

  const fetchOrders = async (pageNum: number) => {
    const headers = {
      Authorization: `Bearer ${tokens?.access?.token || "s"}`,
    };
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/orders/my-orders?page=${pageNum}&limit=10`,
        {
          headers,
        }
      );

      const newOrders = Array.isArray(res.data.data) ? res.data.data : [];

      if (newOrders.length === 0) {
        setHasMore(false);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
      }

      if (!res.data.pagination?.hasNextPage) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleClick = (order: any) => {
    setSelectedOrder(order);
    checkDeliveryStatus(order);
    open();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) setPage((prev) => prev + 1);
  };

  const parseDelhiveryResponse = (resData: any) => {
    // 1) if old shape: res.data.tracking (array of steps)
    if (Array.isArray(resData?.tracking) && resData.tracking.length > 0) {
      return resData.tracking.map((s: any) => ({
        status: s.status ?? s.statusText ?? s.name ?? "Update",
        location: s.location ?? s.locationText ?? s.place ?? "",
        timestamp: s.timestamp ?? s.time ?? s.date ?? "",
        instructions: s.instructions ?? s.note ?? "",
      }));
    }

    // 2) Delhivery ShipmentData shape (the sample you gave)
    const shipArr = resData?.ShipmentData;
    if (Array.isArray(shipArr) && shipArr.length > 0) {
      const shipment = shipArr[0]?.Shipment ?? null;
      const scans = Array.isArray(shipment?.Scans) ? shipment.Scans : [];

      // Build steps from scans (ensure chronological order - earliest first)
      const steps = scans
        .map((s: any) => {
          const sd = s?.ScanDetail ?? {};
          const instructions = sd.Instructions ?? sd.Status ?? sd.Scan ?? "";
          // Map specific instruction -> friendly status
          let statusLabel = sd.Scan ?? sd.Status ?? instructions ?? "Update";
          // Special mapping: Manifest uploaded -> Order placed
          if (
            (sd.Instructions || "").toLowerCase().includes("manifest uploaded")
          ) {
            statusLabel = "Order placed";
          }
          if ((sd.Scan || "").toLowerCase().includes("manifested")) {
            // keep 'Manifested' but we already map Manifest uploaded above
            statusLabel = statusLabel;
          }
          return {
            status: statusLabel,
            location:
              sd.ScannedLocation ??
              shipment?.Origin ??
              shipment?.Destination ??
              "",
            timestamp: sd.ScanDateTime ?? sd.StatusDateTime ?? "",
            instructions,
          };
        })
        // filter out empty timestamps somewhat, then sort by timestamp ascending
        .filter((st) => !!st.timestamp)
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

      // If there are no scans with timestamps, try to fall back to shipment.Status
      if (steps.length === 0 && shipment?.Status) {
        const st = shipment.Status;
        return [
          {
            status: (st.Status && String(st.Status)) || "Update",
            location: st.StatusLocation || shipment.Origin || "",
            timestamp: st.StatusDateTime || shipment.PickUpDate || "",
            instructions: st.Instructions || "",
          },
        ];
      }

      return steps;
    }

    // 3) fallback: empty
    return [];
  };

  const resolveWaybill = (order: any) =>
    order?.delhiveryDetails?.waybill ??
    order?.delhiveryDetails?.awb ??
    order?.awb ??
    order?.items?.find((it: any) => it.awb)?.awb ??
    order?.items?.[0]?.awb ??
    "";

  const handleTrackOrder = async (
    waybill: string | undefined,
    refnum: string | undefined
  ) => {
    try {
      setTrackingLoading(true);
      setTrackingData([]);
      setTrackingError("");
      setTrackingMeta(null);

      if (!waybill) {
        setTrackingError("Order placed");
        openTrack();
        return;
      }

      const res = await axiosInstance.get(
        `delhivery/track?waybill=${waybill}`,
        {
          headers: { Authorization: `Bearer ${tokens?.access?.token}` },
        }
      );

      const raw = res.data;
      if (raw?.Success === false) {
        setTrackingError(raw?.Error || "No tracking information found for this order.");
        openTrack();
        return;
      }

      const normalized = parseDelhiveryResponse(raw);
      setTrackingData(normalized);

      // Extract shipment meta (origin / destination / latest status)
      const shipment = raw?.ShipmentData?.[0]?.Shipment ?? null;
      if (shipment) {
        setTrackingMeta({
          origin: shipment.Origin ?? "",
          destination: shipment.Destination ?? "",
          waybill: shipment.AWB ?? waybill,
          referenceNo: shipment.ReferenceNo ?? refnum ?? "",
          orderType: shipment.OrderType ?? "",
          status: shipment.Status?.Status ?? shipment.Status?.status ?? "",
          statusLocation: shipment.Status?.StatusLocation ?? shipment.Status?.Status ?? "",
          statusDateTime: shipment.Status?.StatusDateTime ?? "",
          scansCount: Array.isArray(shipment.Scans) ? shipment.Scans.length : 0,
        });
      }

      openTrack();
    } catch (err) {
      console.error("Failed to fetch tracking", err);
      setTrackingError(
        err?.response?.status === 401 || err?.response?.status === 403
          ? "Session expired. Please login and try again."
          : "Failed to load tracking. Please try again."
      );
      openTrack();
    } finally {
      setTrackingLoading(false);
    }
  };

  const getRequestSteps = (req: any) => {
    const status = req.status || "";
    const isExchange = req.type === "exchange";
    const done = (list: string[]) =>
      list.some((s) => s === status) || list.includes(status);

    const steps = isExchange
      ? [
          { label: "Request Submitted", done: true },
          { label: "Approved", done: done(["approved", "payment_pending", "payment_completed", "pickup_scheduled", "product_received", "replacement_dispatched", "exchange_completed"]) },
          { label: "Payment Completed", done: done(["payment_pending", "payment_completed", "pickup_scheduled", "product_received", "replacement_dispatched", "exchange_completed"]) },
          { label: "Pickup Scheduled", done: done(["pickup_scheduled", "product_received", "replacement_dispatched", "exchange_completed"]) },
          { label: "Product Received at Warehouse", done: done(["product_received", "replacement_dispatched", "exchange_completed"]) },
          { label: "Replacement Dispatched", done: done(["replacement_dispatched", "exchange_completed"]) },
          { label: "Exchange Completed", done: status === "exchange_completed" },
        ]
      : [
          { label: "Return Requested", done: true },
          { label: "Approved", done: done(["approved", "payment_pending", "payment_completed", "pickup_scheduled", "product_received", "quality_inspection", "refund_initiated", "refund_credited", "return_completed"]) },
          { label: "Payment Completed", done: done(["payment_pending", "payment_completed", "pickup_scheduled", "product_received", "quality_inspection", "refund_initiated", "refund_credited", "return_completed"]) },
          { label: "Pickup Scheduled", done: done(["pickup_scheduled", "product_received", "quality_inspection", "refund_initiated", "refund_credited", "return_completed"]) },
          { label: "Product Received", done: done(["product_received", "quality_inspection", "refund_initiated", "refund_credited", "return_completed"]) },
          { label: "Quality Inspection", done: done(["quality_inspection", "refund_initiated", "refund_credited", "return_completed"]) },
          { label: "Refund Initiated", done: done(["refund_initiated", "refund_credited", "return_completed"]) },
          { label: "Refund Credited", done: done(["refund_credited", "return_completed"]) },
          { label: "Return Completed", done: status === "return_completed" },
        ];

    if (status === "rejected") {
      steps.forEach((s, i) => {
        if (i < 2) s.done = true;
        else s.done = false;
      });
    }
    return steps;
  };

  // Build a rich "Ordered -> Delivered" journey from raw scans
  const buildJourney = (order: any, steps: typeof trackingData) => {
    const lower = (s: string) => (s || "").toLowerCase();
    const match = (re: RegExp) =>
      steps.find((s) => re.test(lower(s.status) + " " + lower(s.instructions)));

    const firstOf = (re: RegExp) => {
      const s = match(re);
      return s
        ? { timestamp: s.timestamp, location: s.location }
        : { timestamp: "", location: "" };
    };

    const milestones = [
      {
        key: "placed",
        label: "Order Placed",
        sub: "Order has been confirmed",
        icon: IconShoppingCart,
        info: firstOf(/order placed|booked|manifest/),
      },
      {
        key: "packed",
        label: "Packed & Shipped",
        sub: "Handed over to courier partner",
        icon: IconPackageImport,
        info: firstOf(/manifest|packed|shipped|dispatched|handed over/),
      },
      {
        key: "transit",
        label: "In Transit",
        sub: "Moving towards destination",
        icon: IconRoute,
        info: firstOf(/in transit|transit|reached|arrived|departed|hub/),
      },
      {
        key: "outfordelivery",
        label: "Out for Delivery",
        sub: "Courier is on the way",
        icon: IconTruck,
        info: firstOf(/out for delivery|out-for-delivery|on the way/),
      },
      {
        key: "delivered",
        label: "Delivered",
        sub: "Package delivered to you",
        icon: IconCheck,
        info: firstOf(/delivered|successful delivery|delivery completed/),
      },
    ];

    const statusText = lower(
      `${trackingMeta?.status ?? ""} ${
        steps.length ? steps[steps.length - 1].status : ""
      }`
    );
    const isDelivered =
      /delivered/.test(statusText) || order?.status === "delivered";
    const isRto = /rto|returned to origin|undelivered/.test(statusText);

    let doneCount = 0;
    if (isRto) {
      doneCount = milestones.length; // show full journey, mark delivered as skipped later
    } else if (isDelivered) {
      doneCount = milestones.length;
    } else {
      // count how many milestones have matching scans
      const keys = [
        "placed",
        "packed",
        "transit",
        "outfordelivery",
        "delivered",
      ];
      for (const k of keys) {
        if (match(
          k === "placed"
            ? /order placed|booked|manifest/
            : k === "packed"
            ? /manifest|packed|shipped|dispatched|handed over/
            : k === "transit"
            ? /in transit|transit|reached|arrived|departed|hub/
            : k === "outfordelivery"
            ? /out for delivery|out-for-delivery|on the way/
            : /delivered|successful delivery|delivery completed/
        )) {
          doneCount++;
        } else {
          break;
        }
      }
      // at minimum, order is placed
      if (doneCount === 0) doneCount = 1;
    }

    return {
      milestones: milestones.map((m, idx) => ({
        ...m,
        done: idx < doneCount,
        current: idx === doneCount - 1,
        skipped: isRto && m.key === "delivered",
      })),
      isDelivered,
      isRto,
      doneCount,
    };
  };

  // UI helper to show the rich journey + detailed scan history
  const Timeline = ({ steps }: { steps: typeof trackingData }) => {
    const isEmpty = !steps || steps.length === 0;
    const journey = buildJourney(selectedOrder, steps || []);
    const sorted = [...(steps || [])].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const latest = sorted[sorted.length - 1];

    return (
      <Stack spacing="md">
        {/* Current status banner */}
        <Box
          p="md"
          style={{
            background: journey.isDelivered
              ? "#e9f6ec"
              : journey.isRto
              ? "#fdecea"
              : "#f0f5ec",
            borderRadius: theme.radius.md,
            border: `1px solid ${
              journey.isDelivered
                ? "#b7e0c2"
                : journey.isRto
                ? "#f2c4c0"
                : "#C6D4BC"
            }`,
          }}
        >
          <Group position="apart" noWrap>
            <Box>
              <Text fw={700} style={{ color: "#133215" }}>
                {journey.isDelivered
                  ? "Delivered"
                  : journey.isRto
                  ? "Returning to origin (RTO)"
                  : isEmpty
                  ? "Ordered"
                  : latest?.status || "In Transit"}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                {isEmpty
                  ? new Date(selectedOrder?.createdAt).toLocaleString()
                  : latest?.location
                  ? `${latest.location} • ${new Date(latest.timestamp).toLocaleString()}`
                  : new Date(latest.timestamp).toLocaleString()}
              </Text>
            </Box>
            <ThemeIcon
              radius="xl"
              size={44}
              color={journey.isDelivered ? "green" : journey.isRto ? "red" : "darkGreen"}
              variant="filled"
            >
              {journey.isDelivered ? (
                <IconCheck size={22} />
              ) : journey.isRto ? (
                <IconRefresh size={22} />
              ) : isEmpty ? (
                <IconShoppingCart size={22} />
              ) : (
                <IconTruck size={22} />
              )}
            </ThemeIcon>
          </Group>
        </Box>

        {/* Journey milestones */}
        <Card withBorder radius="md" p="md">
          <Text fw={600} size="sm" mb="sm">
            Delivery Journey
          </Text>
          <Stack spacing={0}>
            {journey.milestones.map((m, idx) => {
              const isLast = idx === journey.milestones.length - 1;
              return (
                <Group key={m.key} align="flex-start" spacing="sm" noWrap>
                  <Box
                    style={{
                      width: 32,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      marginTop: 4,
                    }}
                  >
                    <ThemeIcon
                      radius="xl"
                      size={32}
                      variant={m.done ? "filled" : "light"}
                      color={
                        m.skipped
                          ? "red"
                          : m.done
                          ? m.current
                            ? "darkGreen"
                            : "lightGreen"
                          : "gray"
                      }
                      style={
                        m.current && !m.done
                          ? { boxShadow: `0 0 0 4px ${theme.colors.lightGreen[1]}` }
                          : undefined
                      }
                    >
                      <m.icon size={16} />
                    </ThemeIcon>
                    {!isLast && (
                      <Box
                        style={{
                          width: 2,
                          background: m.done
                            ? theme.colors.lightGreen[6]
                            : theme.colors.gray[3],
                          flex: 1,
                          marginTop: 6,
                          alignSelf: "center",
                          minHeight: 26,
                        }}
                      />
                    )}
                  </Box>
                  <Box style={{ flex: 1 }} pb={isLast ? 0 : "md"}>
                    <Group position="apart" noWrap>
                      <Text fw={m.done ? 700 : 500} size="sm">
                        {m.label}
                      </Text>
                      {m.current && (
                        <Badge
                          size="xs"
                          styles={(t: any) => ({
                            root: {
                              backgroundColor: "#133215",
                              color: "#ffffff",
                              textTransform: "uppercase",
                              borderRadius: t.radius.sm,
                            },
                          })}
                        >
                          Current
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {m.sub}
                    </Text>
                    {m.done && m.info.timestamp && (
                      <Text size="xs" fw={500} mt={2} style={{ color: "#5a6e55" }}>
                        {new Date(m.info.timestamp).toLocaleString()}
                        {m.info.location ? ` • ${m.info.location}` : ""}
                      </Text>
                    )}
                  </Box>
                </Group>
              );
            })}
          </Stack>
        </Card>

        {/* Tracking tree grouped by location */}
        {!isEmpty && (
          <Card withBorder radius="md" p="md">
            <Group position="apart" mb="sm">
              <Text fw={600} size="sm">
                Tracking Tree ({sorted.length})
              </Text>
            </Group>
            <TrackingTree steps={sorted} />
          </Card>
        )}
      </Stack>
    );
  };

  // Tree view of tracking events grouped by location
  const TrackingTree = ({ steps }: { steps: typeof trackingData }) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const groups: { location: string; items: typeof trackingData }[] = [];
    const groupIndex: Record<string, number> = {};
    (steps || []).forEach((s) => {
      const loc = s.location || "General";
      if (!(loc in groupIndex)) {
        groupIndex[loc] = groups.length;
        groups.push({ location: loc, items: [] });
      }
      groups[groupIndex[loc]].items.push(s);
    });

    const isOpen = (loc: string) => expanded[loc] ?? true;

    return (
      <Stack spacing={6}>
        {groups.map((g, gi) => {
          const open = isOpen(g.location);
          return (
            <Box key={gi} style={{ borderRadius: theme.radius.md }}>
              <Group
                spacing="xs"
                noWrap
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [g.location]: !isOpen(g.location),
                  }))
                }
                sx={{ cursor: "pointer" }}
              >
                <Box
                  style={{
                    transition: "transform 0.2s",
                    transform: open ? "rotate(90deg)" : "rotate(0deg)",
                    color: theme.colors.gray[6],
                    display: "flex",
                  }}
                >
                  <IconChevronRight size={16} />
                </Box>
                <ThemeIcon size={24} radius="xl" color="darkGreen" variant="filled">
                  <IconMapPin size={13} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={700} style={{ color: "#133215" }}>
                    {g.location}
                  </Text>
                </Box>
                <Badge size="xs" variant="light" color="gray">
                  {g.items.length} event{g.items.length > 1 ? "s" : ""}
                </Badge>
              </Group>
              <Collapse in={open} transitionDuration={200}>
                <Stack spacing={8} mt={6} style={{ paddingLeft: 34 }}>
                  {g.items.map((step, si) => {
                    const lower = (step.status || "").toLowerCase();
                    const isDelivered = lower.includes("delivered");
                    const color = isDelivered ? "green" : "darkGreen";
                    return (
                      <Group key={si} align="flex-start" spacing="sm" noWrap>
                        <ThemeIcon radius="xl" size={22} variant="light" color={color}>
                          {isDelivered ? (
                            <IconCheck size={12} />
                          ) : (
                            <IconClock size={12} />
                          )}
                        </ThemeIcon>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={600}>
                            {step.status}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {new Date(step.timestamp).toLocaleString()}
                          </Text>
                          {step.instructions && step.instructions !== step.status ? (
                            <Text size="xs" mt={2}>
                              {step.instructions}
                            </Text>
                          ) : null}
                        </Box>
                      </Group>
                    );
                  })}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Stack>
    );
  };

  // Helper to get order status color
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower.includes("delivered")) return "green";
    if (statusLower.includes("cancel")) return "red";
    if (statusLower.includes("shipped")) return "blue";
    if (statusLower.includes("processing")) return "yellow";
    return "gray";
  };

  return (
    <Box p={isMobile ? 0 : "xl"} bg={theme.colors.gray[1]}>
      <Center>
        <Box
          w={isMobile ? "100%" : rem("1100px")}
          bg="white"
          p="md"
          sx={{
            borderRadius: theme.radius.lg,
            boxShadow: theme.shadows.sm,
          }}
        >
          <Tabs defaultValue="All" keepMounted={false}>
            <ScrollArea h="75vh" mt="xs" offsetScrollbars>
              {orders.map((order, i) => (
                <Card
                  key={i}
                  p="lg"
                  my="md"
                  radius="lg"
                  withBorder
                  onClick={() => handleClick(order)}
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {/* Order Header */}
                  <Group position="apart" mb="md">
                    <Group spacing="xs">
                      {/* <Badge
                        color={getStatusColor(order.status)}
                        variant="filled"
                        radius="sm"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {order.status ?? "Processing"}
                      </Badge> */}
                      <Text size="sm" fw={600}>
                        Order #{order.orderNumber}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : ""}
                      </Text>
                    </Group>

                    <Group spacing="xs">
                      <Text size="sm" fw={600}>
                        Total: ₹{order.totalAmount}
                      </Text>
                      <Anchor
                        size="sm"
                        fw={600}
                        c="blue"
                        underline
                        onClick={(e) => {
                          e.stopPropagation();
                          const waybill = resolveWaybill(order);
                          const refnum =
                            order?.delhiveryDetails?.refnum ??
                            order?.referenceNo ??
                            order?.orderNumber ??
                            "";
                          handleTrackOrder(waybill, refnum);
                        }}
                        sx={{
                          "&:hover": { color: theme.colors.blue[7] },
                        }}
                      >
                        Track Order
                      </Anchor>
                    </Group>
                  </Group>

                  {/* Order Items List */}
                  <Stack spacing="md">
                    {order.items?.map((item: any, itemIndex: number) => (
                      <Group key={item._id} noWrap align="flex-start" spacing="md">
                        <AspectRatio ratio={1} w={80} miw={80}>
                          <Image
                            src={
                              item.productUrl ||
                              item.productImage ||
                              "/placeholder.png"
                            }
                            radius="md"
                            alt={item.productTitle}
                            fit="cover"
                            sx={{
                              border: `1px solid ${theme.colors.gray[2]}`,
                              backgroundColor: theme.colors.gray[1],
                            }}
                          />
                        </AspectRatio>

                        <Box style={{ flex: 1 }}>
                          <Text fw={600} size="sm" lineClamp={2}>
                            {item.productTitle}
                          </Text>
                          <Group spacing="xs" mt={4}>
                            <Text size="xs" c="dimmed">
                              Size: <Text span fw={500}>{item.selectedSize}</Text>
                            </Text>
                            <Text size="xs" c="dimmed">
                              • Qty: <Text span fw={500}>{item.quantity}</Text>
                            </Text>
                            <Text size="xs" c="dimmed">
                              • Price: <Text span fw={500}>₹{item.price}</Text>
                            </Text>
                          </Group>
                          <Group position="apart" mt={6}>
                            <Badge
                              color="gray"
                              variant="light"
                              size="xs"
                              leftSection={<IconPackage size={12} />}
                            >
                              Subtotal: ₹{item.subtotal}
                            </Badge>
                            {itemIndex === 0 && order.items.length > 1 && (
                              <Text size="xs" c="dimmed">
                                +{order.items.length - 1} more item{order.items.length - 1 > 1 ? 's' : ''}
                              </Text>
                            )}
                          </Group>
                        </Box>
                      </Group>
                    ))}
                  </Stack>

                  {/* Order Footer */}
                  <Divider my="md" />
                  <Group position="apart">
                    <Box>
                      <Text size="xs" c="dimmed">
                        Shipping to: {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Payment: {order.paymentMethod === 'online' ? 'Online' : 'Cash on Delivery'}
                      </Text>
                    </Box>
                    <Group spacing="xs">
                      {order.items.length > 1 && (
                        <Text size="sm" fw={600}>
                          {order.items.length} items
                        </Text>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))}

              {loading && orders.length === 0 && (
                <Box px="lg">
                  {[0, 1, 2].map((s) => (
                    <Card key={s} withBorder radius="md" mb="md">
                      <Group position="apart" mb="md" noWrap>
                        <Skeleton height={16} width={140} radius="sm" />
                        <Skeleton height={14} width={80} radius="sm" />
                      </Group>
                      <Group noWrap align="flex-start" spacing="md">
                        <Skeleton height={80} width={80} radius="md" />
                        <Box style={{ flex: 1 }}>
                          <Skeleton height={14} width="60%" radius="sm" />
                          <Skeleton height={12} width="40%" radius="sm" mt={8} />
                          <Skeleton height={12} width="30%" radius="sm" mt={6} />
                        </Box>
                      </Group>
                    </Card>
                  ))}
                </Box>
              )}

              {loading && orders.length !== 0 && (
                <Center my="lg">
                  <Loader size="md" />
                </Center>
              )}

              {hasMore && !loading && orders.length !== 0 && (
                <Center my="lg">
                  <Button variant="light" onClick={handleLoadMore}>
                    Load More Orders
                  </Button>
                </Center>
              )}

              {!loading && orders.length === 0 && (
                <Center my="xl">
                  <Text c="dimmed" size="sm">
                    No orders available!
                  </Text>
                </Center>
              )}
            </ScrollArea>
          </Tabs>
        </Box>
      </Center>

      {/* Tracking Drawer */}
      <Drawer
        opened={trackOpened}
        onClose={closeTrack}
        title="Order Tracking"
        position="right"
        size={isMobile ? "100%" : "480px"}
        overlayProps={{ opacity: 0.15 }}
        padding="lg"
      >
        {trackingLoading ? (
          <Box>
            <Skeleton height={14} width={160} radius="sm" mb="md" />
            <Skeleton height={40} radius="md" mb="sm" />
            <Skeleton height={40} radius="md" mb="sm" />
            <Skeleton height={40} radius="md" mb="sm" />
            <Skeleton height={40} radius="md" mb="sm" />
          </Box>
        ) : (
          <Box>
            {selectedOrder && (
              <Group position="apart" mb="md">
                <Text fw={700}>AWB</Text>
                <Text size="sm" c="dimmed">
                  {trackingMeta?.waybill ?? (resolveWaybill(selectedOrder) || "-")}
                </Text>
              </Group>
            )}

            {trackingMeta?.origin || trackingMeta?.destination ? (
              <Group position="apart" mb="md">
                <Box>
                  <Text size="xs" c="dimmed">Origin</Text>
                  <Text size="sm" fw={500} lineClamp={1}>{trackingMeta.origin || "-"}</Text>
                </Box>
                <IconChevronRight size={14} color={theme.colors.gray[5]} />
                <Box>
                  <Text size="xs" c="dimmed">Destination</Text>
                  <Text size="sm" fw={500} lineClamp={1}>{trackingMeta.destination || "-"}</Text>
                </Box>
              </Group>
            ) : null}

            {selectedOrder && <Divider mb="sm" />}

            {trackingError ? (
              <Center style={{ height: 220 }}>
                <Box ta="center">
                  <IconPackageOff size={40} color={theme.colors.gray[4]} />
                  <Text mt="sm" fw={600}>{trackingError}</Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    AWB {trackingMeta?.waybill ?? (resolveWaybill(selectedOrder) || "-")}
                  </Text>
                </Box>
              </Center>
            ) : (
              <Timeline steps={trackingData} />
            )}
          </Box>
        )}
      </Drawer>

      {/* Order Details Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title={`Order #${selectedOrder?.orderNumber}`}
        position="right"
        size={isMobile ? "100%" : "480px"}
        overlayProps={{ opacity: 0.15 }}
        padding="lg"
      >
        {selectedOrder && (
          <Stack spacing="lg">
            {/* Request Status Section (top of drawer) */}
            {selectedOrder.items?.some((it: any) => getRequestForItem(it._id)) && (
              <Card withBorder radius="md" p="md">
                <Text fw={600} mb="sm">Request Status</Text>
                <Stack spacing="sm">
                  {selectedOrder.items.map((item: any) => {
                    const req = getRequestForItem(item._id);
                    if (!req) return null;
                    const isExchange = req.type === "exchange";
                    return (
                      <Box key={item._id}>
                        <Box
                          p="sm"
                          // radius="xl"
                          style={{
                            background: "#f0f5ec",
                            border: "1px solid #C6D4BC",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            cursor: "pointer",
                            borderRadius: theme.radius.md,
                          }}
                          onClick={() =>
                            setExpandedSteps((prev) => ({ ...prev, [item._id]: !prev[item._id] }))
                          }
                        >
                          <Group spacing={8} noWrap  style={{   borderRadius: theme.radius.md,}}>
                            <ThemeIcon size={22} radius="xl" color="darkGreen" variant="filled">
                              <IconPackage size={13} />
                            </ThemeIcon>
                            <Box>
                              <Text size="sm" fw={700} style={{ color: "#133215" }}>
                                {isExchange ? "Exchange" : "Return"} in progress
                              </Text>
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {item.productTitle}
                              </Text>
                            </Box>
                          </Group>
                          <Group spacing={6} noWrap >
                            <Badge
                              size="sm"
                              styles={(theme: any) => ({
                                root: {
                                  backgroundColor: "#133215",
                                  color: "#ffffff",
                                  textTransform: "capitalize",
                                  borderRadius: theme.radius.sm,
                                },
                              })}
                            >
                              {req.status || "Requested"}
                            </Badge>
                            <Box
                              style={{
                                transition: "transform 0.2s",
                                transform: expandedSteps[item._id]
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                              }}
                            >
                              <IconChevronRight size={14} />
                            </Box>
                          </Group>
                        </Box>
                        <Collapse
                          in={expandedSteps[item._id]}
                          transitionDuration={250}
                          transitionTimingFunction="ease"
                          mt={expandedSteps[item._id] ? "sm" : 0}
                        >
                          <Box
                            p="sm"
                            radius="xl"
                            style={{
                              background: "#f0f5ec",
                              border: "1px solid #C6D4BC",
                              borderRadius: theme.radius.md,
                            }}
                          >
                            <Stack spacing={10}>
                              {getRequestSteps(req).map((step, si) => {
                                const isLastStep = si === getRequestSteps(req).length - 1;
                                return (
                                  <Group key={si} align="flex-start" spacing="sm" noWrap>
                                    <Box
                                      style={{
                                        width: 22,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        position: "relative",
                                        marginTop: 2,
                                      }}
                                    >
                                      <ThemeIcon
                                        radius="xl"
                                        size={22}
                                        variant={step.done ? "filled" : "light"}
                                        color="darkGreen"
                                      >
                                        {step.done ? (
                                          <IconCheck size={13} />
                                        ) : (
                                          <IconClock size={13} />
                                        )}
                                      </ThemeIcon>
                                      {!isLastStep && (
                                        <Box
                                          style={{
                                            width: 2,
                                            background: step.done
                                              ? "#133215"
                                              : theme.colors.gray[3],
                                            flex: 1,
                                            marginTop: 6,
                                            alignSelf: "center",
                                            minHeight: 22,
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Text
                                      size="sm"
                                      fw={step.done ? 700 : 500}
                                      style={{
                                        color: step.done ? "#133215" : theme.colors.gray[6],
                                      }}
                                    >
                                      {step.label}
                                    </Text>
                                  </Group>
                                );
                              })}
                            </Stack>
                          </Box>
                        </Collapse>
                        {(req.status === "approved" || req.status === "payment_pending") &&
                          !isChargeWaived(req) && (
                            <Button
                              fullWidth
                              size="sm"
                              mt={8}
                              loading={payingId === req.id}
                              leftSection={<IconCash size={14} />}
                              onClick={() => handlePayRequestCharge(req)}
                              style={{ backgroundColor: DARK_GREEN }}
                            >
                              Pay ₹{EXCHANGE_CHARGE} Processing Charge
                            </Button>
                          )}
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            )}

            {/* Order Summary */}
            <Card withBorder radius="md">
              <Group position="apart" mb="sm">
                <Text fw={600}>Order Summary</Text>
                {/* <Badge
                  color={getStatusColor(selectedOrder.status)}
                  variant="light"
                  size="sm"
                >
                  {selectedOrder.status}
                </Badge> */}
              </Group>
              
              <Group position="apart" mb={4}>
                <Text size="sm">Order Date:</Text>
                <Text size="sm" fw={500}>
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </Text>
              </Group>
              
              {/* <Group position="apart" mb={4}>
                <Text size="sm">Payment:</Text>
                <Text size="sm" fw={500} c={selectedOrder.paymentStatus === 'paid' ? 'green' : 'orange'}>
                  {selectedOrder.paymentMethod === 'online' ? 'Online' : 'COD'} • {selectedOrder.paymentStatus}
                </Text>
              </Group> */}
              
              <Divider my="sm" />
              
              <Group position="apart" mb={4}>
                <Text size="sm">Subtotal:</Text>
                <Text size="sm">₹{selectedOrder.totalAmount - selectedOrder.shippingCost}</Text>
              </Group>
              
              <Group position="apart" mb={4}>
                <Text size="sm">Shipping:</Text>
                <Text size="sm">₹{selectedOrder.shippingCost}</Text>
              </Group>
              
              <Group position="apart" fw={600} mt="sm">
                <Text>Total Amount:</Text>
                <Text>₹{selectedOrder.totalAmount}</Text>
              </Group>
            </Card>

            {/* Order Items */}
            <Box>
              <Text fw={600} mb="sm">Items ({selectedOrder.items.length})</Text>
              <Stack spacing="md">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  return (
                  <Card key={item._id} withBorder radius="md" p="md">
                    <Group noWrap align="flex-start">
                      <AspectRatio ratio={1} w={80} miw={80}>
                        <Image
                          src={item.productUrl || item.productImage || "/placeholder.png"}
                          radius="md"
                          alt={item.productTitle}
                          fit="cover"
                        />
                      </AspectRatio>
                      <Box style={{ flex: 1 }}>
                        <Text fw={600} size="sm">{item.productTitle}</Text>
                        <Group spacing="xs" mt={4}>
                          <Badge variant="outline" size="xs">
                            Size: {item.selectedSize}
                          </Badge>
                          <Badge variant="outline" size="xs">
                            Qty: {item.quantity}
                          </Badge>
                        </Group>
                        <Group position="apart" mt="sm">
                          <Text fw={600} size="sm">₹{item.price}</Text>
                          <Text size="sm" c="dimmed">Subtotal: ₹{item.subtotal}</Text>
                        </Group>
                        {!getRequestForItem(item._id) && isOrderDelivered(selectedOrder) && (
                          <SimpleGrid cols={2} mt="sm" spacing="xs">
                            <Button
                              variant="light"
                              size="xs"
                              leftIcon={<IconRefresh size={14} />}
                              fullWidth
                              onClick={() => navigate(`/exchange-return?type=exchange&orderId=${selectedOrder._id || selectedOrder.id}&itemId=${item._id}`)}
                            >
                              Exchange
                            </Button>
                            <Button
                              variant="light"
                              size="xs"
                              color="red"
                              leftIcon={<IconArrowBackUp size={14} />}
                              fullWidth
                              onClick={() => navigate(`/exchange-return?type=return&orderId=${selectedOrder._id || selectedOrder.id}&itemId=${item._id}`)}
                            >
                              Return
                            </Button>
                          </SimpleGrid>
                        )}
                      </Box>
                    </Group>
                  </Card>
                  );
                })}
              </Stack>
            </Box>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <Card withBorder radius="md">
                <Text fw={600} mb="sm">Shipping Address</Text>
                <Stack spacing={4}>
                  <Text size="sm">{selectedOrder.shippingAddress.line1}</Text>
                  <Text size="sm">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                  </Text>
                  <Text size="sm">{selectedOrder.shippingAddress.country}</Text>
                </Stack>
              </Card>
            )}
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}