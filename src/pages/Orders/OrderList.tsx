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
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconCircle, IconCheck, IconClock, IconPackage, IconRefresh, IconArrowBackUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

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

  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { tokens, isAuthenticated }: any = useSelector((state: RootState) => state.auth);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [requestMap, setRequestMap] = useState<Record<string, { type: string; status: string }>>({});

  const fetchMyRequests = async () => {
    try {
      const [exRes, retRes] = await Promise.allSettled([
        axiosInstance.get("/exchange-return/exchanges/my-requests?limit=100"),
        axiosInstance.get("/exchange-return/returns/my-requests?limit=100"),
      ]);
      const map: Record<string, { type: string; status: string }> = {};
      const build = (list: any, type: string) => {
        (list || []).forEach((r: any) => {
          const id = r.orderItemId || r.orderItem?._id || r.orderItemId?._id;
          if (id) map[id] = { type, status: r.status || "" };
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

  const getRequestForItem = (itemId: string) => requestMap[itemId] || null;

  const requestButton = (itemId: string) => {
    const req = getRequestForItem(itemId);
    if (!req) return null;
    return req.type === "exchange" ? "Track Exchange" : "Track Return";
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

  useEffect(() => {
    if (isAuthenticated || localStorage.getItem("token")) {
      fetchMyRequests();
    }
  }, [isAuthenticated]);

  const handleClick = (order: any) => {
    setSelectedOrder(order);
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
                          <SimpleGrid cols={2} mt={8} spacing="xs">
                            {getRequestForItem(item._id) ? (
                              <Button
                                variant="light"
                                size="xs"
                                color="grape"
                                leftIcon={<IconPackage size={14} />}
                                fullWidth
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/my-requests");
                                }}
                              >
                                {requestButton(item._id)}
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="light"
                                  size="xs"
                                  leftIcon={<IconRefresh size={14} />}
                                  fullWidth
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/exchange-return?type=exchange&orderId=${order._id || order.id}&itemId=${item._id}`);
                                  }}
                                >
                                  Exchange
                                </Button>
                                <Button
                                  variant="light"
                                  size="xs"
                                  color="red"
                                  leftIcon={<IconArrowBackUp size={14} />}
                                  fullWidth
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/exchange-return?type=return&orderId=${order._id || order.id}&itemId=${item._id}`);
                                  }}
                                >
                                  Return
                                </Button>
                              </>
                            )}
                          </SimpleGrid>
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
                  const orderStatus = (selectedOrder.status || "").toLowerCase();
                  const isDelivered = orderStatus.includes("delivered") || orderStatus.includes("completed") || orderStatus.includes("fulfilled") || orderStatus.includes("success") || true;
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
                        {isDelivered && (
                          <SimpleGrid cols={2} mt="sm" spacing="xs">
                            {getRequestForItem(item._id) ? (
                              <Button
                                variant="light"
                                size="xs"
                                color="grape"
                                leftIcon={<IconPackage size={14} />}
                                fullWidth
                                onClick={() => navigate("/my-requests")}
                              >
                                {requestButton(item._id)}
                              </Button>
                            ) : (
                              <>
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
                              </>
                            )}
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

            <Button fullWidth onClick={close} mt="md">
              Close
            </Button>
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}