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
  const [trackOpened, { open: openTrack, close: closeTrack }] = useDisclosure(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<
    { status: string; location: string; timestamp: string; instructions?: string }[]
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
      const res = await axiosInstance.get(`/orders/my-orders?page=${pageNum}&limit=10`, {
        headers,
      });

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

  /**
   * parseDelhiveryResponse
   * Accepts the raw response object from the delhivery/track endpoint and
   * returns an array of normalized tracking steps:
   * [{ status, location, timestamp, instructions }]
   */
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
          if ((sd.Instructions || "").toLowerCase().includes("manifest uploaded")) {
            statusLabel = "Order placed";
          }
          if ((sd.Scan || "").toLowerCase().includes("manifested")) {
            // keep 'Manifested' but we already map Manifest uploaded above
            statusLabel = statusLabel;
          }
          return {
            status: statusLabel,
            location: sd.ScannedLocation ?? shipment?.Origin ?? shipment?.Destination ?? "",
            timestamp: sd.ScanDateTime ?? sd.StatusDateTime ?? "",
            instructions,
          };
        })
        // filter out empty timestamps somewhat, then sort by timestamp ascending
        .filter((st) => !!st.timestamp)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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

  /**
   * handleTrackOrder
   * Calls delhivery endpoint and normalizes the response to `trackingData`.
   */
  const handleTrackOrder = async (waybill: string | undefined, refnum: string | undefined) => {
    try {
      setTrackingLoading(true);
      setTrackingData([]);
      // call your delhivery tracking endpoint (constructed query params as you had)
      const res = await axiosInstance.get(`delhivery/track?waybill=${waybill ?? ""}&ref_ids=${refnum ?? ""}`, {
        headers: { Authorization: `Bearer ${tokens?.access?.token}` },
      });

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
          const isDone = lower.includes("delivered") || lower.includes("delivered") || lower.includes("delivered");
          const isPlaced = lower.includes("order placed") || lower.includes("manifest");
          const icon = isPlaced ? <IconCheck size={14} /> : <IconClock size={14} />;

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
                <ThemeIcon radius="xl" size={24} variant="light" color={isPlaced ? "green" : "gray"}>
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
                  {step.location} • {step.timestamp ? new Date(step.timestamp).toLocaleString() : ""}
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
    <Box p="md">
      <Center>
        <Box
          w={isMobile ? "100%" : rem("1200px")}
          bg={isMobile ? "transparent" : "white"}
          p={isMobile ? 0 : "md"}
          sx={{
            borderRadius: isMobile ? 0 : theme.radius.md,
            boxShadow: isMobile ? "none" : theme.shadows.md,
          }}
        >
          <Tabs defaultValue="All">
            <ScrollArea h="75vh" mt="md">
              {orders.map((order, i) => (
                <Box
                  key={i}
                  p="md"
                  my="sm"
                  bg="white"
                  sx={{
                    borderRadius: 10,
                    boxShadow: theme.shadows.sm,
                    cursor: "pointer",
                  }}
                  onClick={() => handleClick(order)}
                >
                  <Group position="apart" align="center">
                    <Group spacing="xs">
                      <Badge color="blue" variant="light">
                        {order.status ?? "Processing"}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                      </Text>
                    </Group>
                    <Anchor
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // avoid triggering parent onClick
                        // attempt to read waybill/refnum from order object; fallback to order.id
                        const waybill = order?.delhiveryDetails?.waybill ?? order?.awb ?? order?.items?.[0]?.awb ?? order?.id;
                        const refnum = order?.delhiveryDetails?.refnum ?? order?.referenceNo ?? order?.orderNumber ?? "";
                        handleTrackOrder(waybill, refnum);
                      }}
                    >
                      <u> Track order</u>
                    </Anchor>
                  </Group>

                  {order.items?.length > 0 && (
                    <Group mt="xs">
                      <AspectRatio ratio={1} w={60}>
                        <Image
                          src={order.items[0].productUrl || order.items[0].productImage || "/placeholder.png"}
                          radius="md"
                          alt="product"
                          fit="contain"
                        />
                      </AspectRatio>

                      <Box ml="sm">
                        <Text fw={600}>{order.items[0].productName ?? order.items[0].productTitle ?? "Product"}</Text>
                        <Text size="sm" c="dimmed">
                          Size:{" "}
                          <Text span fw={500}>
                            {order.items[0].selectedSize}
                          </Text>{" "}
                          &nbsp;|&nbsp; Color:{" "}
                          <Text span fw={500}>
                            {order.items[0].selectedColor}
                          </Text>{" "}
                          &nbsp;|&nbsp; Qty:{" "}
                          <Text span fw={500}>
                            {order.items[0].quantity}
                          </Text>
                        </Text>
                      </Box>
                    </Group>
                  )}
                </Box>
              ))}

              {loading && (
                <Center my="md">
                  <Loader size="sm" />
                </Center>
              )}

              {hasMore && !loading && orders.length !== 0 && (
                <Center my="md">
                  <Button onClick={handleLoadMore}>Load More</Button>
                </Center>
              )}

              {!loading && orders.length === 0 && (
                <Center my="md">
                  <Text>No orders available!</Text>
                </Center>
              )}
            </ScrollArea>
          </Tabs>
        </Box>
      </Center>

      {/* Order Detail Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title={`Order ID: ${selectedOrder?.id}`}
        position="right"
        size={isMobile ? "100%" : "400px"}
      >
        {selectedOrder && (
          <Stack spacing="md">
            {selectedOrder.items?.map((item: any, idx: number) => (
              <Box key={idx}>
                <Image
                  src={item.productImage || item.productUrl || "/placeholder.png"}
                  radius="md"
                  maw={isMobile ? "100%" : 300}
                  mx="auto"
                  fit="contain"
                />
                <Text fw={600}>{item.productName ?? item.productTitle ?? "Product"}</Text>
                <Text size="sm">
                  <strong>Size:</strong> {item.selectedSize}
                </Text>
                <Text size="sm">
                  <strong>Color:</strong> {item.selectedColor}
                </Text>
                <Text size="sm">
                  <strong>Quantity:</strong> {item.quantity}
                </Text>
              </Box>
            ))}

            <Text size="sm" c="dimmed">
              Shipping to: {selectedOrder.shippingAddress?.street},{" "}
              {selectedOrder.shippingAddress?.city}
            </Text>
            <Text size="sm">Payment: {selectedOrder.paymentMethod}</Text>
            <Text size="sm">Notes: {selectedOrder.notes}</Text>
            <Text size="sm">Shipping Cost: ₹{selectedOrder.shippingCost}</Text>
            <Text size="sm">Tax: ₹{selectedOrder.tax}</Text>
            <Text size="sm">Discount: ₹{selectedOrder.discount}</Text>

            <Button fullWidth onClick={close}>
              Close
            </Button>
          </Stack>
        )}
      </Drawer>

      {/* Order Tracking Drawer */}
      <Drawer
        opened={trackOpened}
        onClose={closeTrack}
        title={`Order Tracking${selectedOrder?.orderNumber ? ` — ${selectedOrder.orderNumber}` : ""}`}
        position="right"
        size={isMobile ? "100%" : "480px"}
      >
        {trackingLoading ? (
          <Center style={{ height: 200 }}>
            <Loader />
          </Center>
        ) : (
          <Box>
            {/* AWB / basic info */}
            {selectedOrder && (
              <Box mb="sm">
                <Group position="apart">
                  <Text fw={700}>AWB</Text>
                  <Text size="sm" c="dimmed">
                    {selectedOrder?.delhiveryDetails?.waybill ?? selectedOrder?.awb ?? selectedOrder?.items?.[0]?.awb ?? "-"}
                  </Text>
                </Group>
                <Group position="apart" mt={6}>
                  <Text fw={700}>Destination</Text>
                  <Text size="sm" c="dimmed">
                    {selectedOrder?.shippingAddress?.city ?? selectedOrder?.destination ?? "-"}
                  </Text>
                </Group>
              </Box>
            )}

            <Divider my="sm" />

            {/* Timeline */}
            <Timeline steps={trackingData} />
          </Box>
        )}
      </Drawer>
    </Box>
  );
}