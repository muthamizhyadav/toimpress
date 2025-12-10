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
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconCircle, IconCheck, IconClock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function OrderList() {
  const [opened, { open, close }] = useDisclosure(false);
  const [trackOpened, { open: openTrack, close: closeTrack }] =
    useDisclosure(false);

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

  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { tokens }: any = useSelector((state: RootState) => state.auth);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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
    open();
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) setPage((prev) => prev + 1);
  };

  console.log(orders, "orders");

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

  const handleTrackOrder = async (
    waybill: string | undefined,
    refnum: string | undefined
  ) => {
    try {
      setTrackingLoading(true);
      setTrackingData([]);
      // call your delhivery tracking endpoint (constructed query params as you had)
      const res = await axiosInstance.get(
        `delhivery/track?waybill=${waybill ?? ""}&ref_ids=${refnum ?? ""}`,
        {
          headers: { Authorization: `Bearer ${tokens?.access?.token}` },
        }
      );

      // Normalize response
      const normalized = parseDelhiveryResponse(res.data);
      // if normalized is empty but your API returns nested structure in res.data (like res.data.ShipmentData) handle that too:
      if (normalized.length === 0 && res.data?.ShipmentData) {
        // attempt second pass
        const alt = parseDelhiveryResponse(res.data);
        setTrackingData(alt);
      } else {
        setTrackingData(normalized);
      }

      openTrack();
    } catch (err) {
      console.error("Failed to fetch tracking", err);
    } finally {
      setTrackingLoading(false);
    }
  };

  // UI helper: render the vertical timeline
  const Timeline = ({ steps }: { steps: typeof trackingData }) => {
    if (!steps || steps.length === 0)
      return (
        <Center style={{ height: 200 }}>
          <Text c="dimmed">No tracking updates yet</Text>
        </Center>
      );

    return (
      <Stack spacing={8} style={{ position: "relative", paddingLeft: 28 }}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          // choose icon: if 'Order placed' or 'Manifest uploaded' -> check; otherwise clock
          const lower = (step.status || "").toLowerCase();
          const isDone =
            lower.includes("delivered") ||
            lower.includes("delivered") ||
            lower.includes("delivered");
          const isPlaced =
            lower.includes("order placed") || lower.includes("manifest");
          const icon = isPlaced ? (
            <IconCheck size={14} />
          ) : (
            <IconClock size={14} />
          );

          return (
            <Group key={idx} align="flex-start" spacing="sm" noWrap>
              {/* left column: icon + vertical line */}
              <Box
                style={{
                  width: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  marginTop: 2,
                }}
              >
                <ThemeIcon
                  radius="xl"
                  size={24}
                  variant="light"
                  color={isPlaced ? "green" : "gray"}
                >
                  {icon}
                </ThemeIcon>

                {/* vertical line under the icon (not for last item) */}
                {!isLast && (
                  <Box
                    style={{
                      width: 2,
                      background: theme.colors.gray[3],
                      flex: 1,
                      marginTop: 6,
                      alignSelf: "center",
                      minHeight: 24,
                    }}
                  />
                )}
              </Box>

              {/* right column: content */}
              <Box style={{ flex: 1 }}>
                <Text fw={700}>{step.status}</Text>
                <Text size="xs" c="dimmed">
                  {step.location} •{" "}
                  {step.timestamp
                    ? new Date(step.timestamp).toLocaleString()
                    : ""}
                </Text>
                {step.instructions ? (
                  <Text size="xs" mt={4}>
                    {step.instructions}
                  </Text>
                ) : null}
              </Box>
            </Group>
          );
        })}
      </Stack>
    );
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
                <Box
                  key={i}
                  p="lg"
                  my="md"
                  bg="white"
                  onClick={() => handleClick(order)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: theme.radius.xl,
                    border: `1px solid ${theme.colors.gray[3]}`,
                    cursor: "pointer",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Group position="apart" mb="xs">
                    <Group spacing="xs">
                      <Badge
                        color={
                          order.status?.toLowerCase().includes("delivered")
                            ? "green"
                            : order.status?.toLowerCase().includes("cancel")
                            ? "red"
                            : "blue"
                        }
                        variant="filled"
                        radius="sm"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {order.status ?? "Processing"}
                      </Badge>

                      <Text size="xs" c="dimmed">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : ""}
                      </Text>
                    </Group>

                    <Anchor
                      size="sm"
                      fw={600}
                      c="blue"
                      underline
                      onClick={(e) => {
                        e.stopPropagation();
                        const waybill =
                          order?.delhiveryDetails?.waybill ??
                          order?.awb ??
                          order?.items?.[0]?.awb ??
                          order?.id;
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
                      Track Order →
                    </Anchor>
                  </Group>

                  <Group noWrap align="center">
                    <AspectRatio ratio={1} w={85}>
                      <Image
                        src={
                          order.items[0].productUrl ||
                          order.items[0].productImage ||
                          "/placeholder.png"
                        }
                        radius="lg"
                        alt="product"
                        fit="cover"
                        sx={{
                          border: `1px solid ${theme.colors.gray[2]}`,
                          backgroundColor: theme.colors.gray[1],
                        }}
                      />
                    </AspectRatio>

                    <Box ml="md" style={{ flex: 1 }}>
                      <Text
                        fw={700}
                        size={isMobile ? "sm" : "md"}
                        lineClamp={1}
                      >
                        {order.items[0].productName ??
                          order.items[0].productTitle ??
                          "Product"}
                      </Text>

                      <Text size="xs" c="dimmed" mt={4}>
                        Size:{" "}
                        <Text span fw={600}>
                          {order.items[0].selectedSize}
                        </Text>{" "}
                        • Qty:{" "}
                        <Text span fw={600}>
                          {order.items[0].quantity}
                        </Text>
                      </Text>

                      <Text fw={700} mt={6} c="dark">
                        ₹{order.items[0].price}
                      </Text>
                    </Box>
                  </Group>
                  {/* <Divider mb="sm" /> */}
                </Box>
              ))}

              {loading && (
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
      {/* 💯 Unchanged Logic */}
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
          <Center style={{ height: 200 }}>
            <Loader />
          </Center>
        ) : (
          <Box>
            <Group position="apart" mb="md">
              <Text fw={700}>AWB</Text>
              <Text size="sm" c="dimmed">
                {selectedOrder?.delhiveryDetails?.waybill ??
                  selectedOrder?.awb ??
                  selectedOrder?.items?.[0]?.awb ??
                  "-"}
              </Text>
            </Group>

            <Divider mb="sm" />

            <Timeline steps={trackingData} />
          </Box>
        )}
      </Drawer>

      {/* Item Detail Drawer – unchanged */}
      <Drawer
        opened={false}
        onClose={close}
        title={`Order ID: ${selectedOrder?.id}`}
        position="right"
        size={isMobile ? "100%" : "420px"}
        overlayProps={{ opacity: 0.15 }}
      >
        {selectedOrder && (
          <Stack spacing="lg">
            {selectedOrder.items?.map((item: any, idx: number) => (
              <Box key={idx}>
                <Image
                  src={
                    item.productImage || item.productUrl || "/placeholder.png"
                  }
                  radius="md"
                  fit="cover"
                  h={180}
                />
                <Text fw={600} mt="xs">
                  {item.productName ?? item.productTitle}
                </Text>
                <Text size="sm">Size: {item.selectedSize}</Text>
                <Text size="sm">Qty: {item.quantity}</Text>
              </Box>
            ))}

            <Divider />

            <Text size="sm" c="dimmed">
              Shipping: {selectedOrder.shippingAddress?.street},{" "}
              {selectedOrder.shippingAddress?.city}
            </Text>

            <Group grow>
              <Button variant="filled" onClick={close}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}
