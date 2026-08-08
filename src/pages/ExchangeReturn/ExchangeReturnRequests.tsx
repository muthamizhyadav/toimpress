import {
  Box,
  Button,
  Card,
  Center,
  Group,
  Image,
  Loader,
  rem,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Badge,
  Timeline,
  useMantineTheme,
  Drawer,
  Divider,
} from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconRefresh,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import axiosInstance from "../../api/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { loadRazorpay } from "../../utils/loadRazorpay";

const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#92B775";
const EXCHANGE_CHARGE = 150;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RZP_KEY_ID as string;

const STATUS_COLORS: Record<string, string> = {
  requested: "yellow",
  under_review: "orange",
  approved: "blue",
  payment_pending: "yellow",
  payment_completed: "green",
  pickup_scheduled: "teal",
  product_received: "indigo",
  replacement_dispatched: "violet",
  exchange_completed: "green",
  return_requested: "yellow",
  return_approved: "blue",
  refund_initiated: "teal",
  refund_credited: "green",
  return_completed: "green",
  rejected: "red",
};

const STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  under_review: "Under Review",
  approved: "Approved",
  payment_pending: "Payment Pending",
  payment_completed: "Payment Done",
  pickup_scheduled: "Pickup Scheduled",
  product_received: "Product Received",
  replacement_dispatched: "Replacement Dispatched",
  exchange_completed: "Exchange Completed",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  refund_initiated: "Refund Initiated",
  refund_credited: "Refund Credited",
  return_completed: "Return Completed",
  rejected: "Rejected",
};

export default function ExchangeReturnRequests() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const navigate = useNavigate();
  const {} = useSelector((state: RootState) => state.auth);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const [exchangeRes, returnRes] = await Promise.allSettled([
        axiosInstance.get("/exchange-return/exchanges/my-requests"),
        axiosInstance.get("/exchange-return/returns/my-requests"),
      ]);

      const exchangeData =
        exchangeRes.status === "fulfilled"
          ? exchangeRes.value.data?.data || exchangeRes.value.data || []
          : [];
      const returnData =
        returnRes.status === "fulfilled"
          ? returnRes.value.data?.data || returnRes.value.data || []
          : [];

      const allRequests = [
        ...exchangeData.map((r: any) => ({ ...r, _type: "exchange" })),
        ...returnData.map((r: any) => ({ ...r, _type: "return" })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRequests(allRequests);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayExchangeCharge = async (request: any) => {
    try {
      setPaying(true);

      const amountPaise = EXCHANGE_CHARGE * 100;

      const { data: order } = await axiosInstance.post(
        "/payments/razorpay/order",
        {
          amount: amountPaise,
          currency: "INR",
          receipt: "exchange_rcpt_" + Date.now(),
          notes: {
            exchangeRequestId: request._id,
            type: "exchange_processing_charge",
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
        description: "Exchange Processing Charge",
        order_id: order.id,
        theme: { color: DARK_GREEN },
        handler: async (response: any) => {
          try {
            await axiosInstance.post(
              "/payments/razorpay/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            await axiosInstance.post(
              `/exchange-return/exchanges/${request._id}/pay`,
              {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              }
            );

            showNotification({
              title: "Payment Successful",
              message: "Exchange processing charge paid successfully",
              color: "green",
              icon: <IconCheck size={16} />,
            });

            fetchRequests();
            closeDetail();
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
      setPaying(false);
    }
  };

  const getTimelineSteps = (request: any) => {
    const status = request.status;
    const isExchange = request._type === "exchange";

    const steps = isExchange
      ? [
          { label: "Request Submitted", done: true },
          { label: "Under Review", done: ["under_review", "approved", "payment_pending", "payment_completed", "pickup_scheduled", "product_received", "replacement_dispatched", "exchange_completed"].includes(status) },
          { label: "Approved", done: ["approved", "payment_pending", "payment_completed", "pickup_scheduled", "product_received", "replacement_dispatched", "exchange_completed"].includes(status) },
          { label: "Payment Completed", done: ["payment_completed", "pickup_scheduled", "product_received", "replacement_dispatched", "exchange_completed"].includes(status) },
          { label: "Pickup Scheduled", done: ["pickup_scheduled", "product_received", "replacement_dispatched", "exchange_completed"].includes(status) },
          { label: "Replacement Dispatched", done: ["replacement_dispatched", "exchange_completed"].includes(status) },
          { label: "Exchange Completed", done: status === "exchange_completed" },
        ]
      : [
          { label: "Return Requested", done: true },
          { label: "Under Review", done: ["under_review", "return_approved", "pickup_scheduled", "product_received", "refund_initiated", "refund_credited", "return_completed"].includes(status) },
          { label: "Approved", done: ["return_approved", "pickup_scheduled", "product_received", "refund_initiated", "refund_credited", "return_completed"].includes(status) },
          { label: "Pickup Scheduled", done: ["pickup_scheduled", "product_received", "refund_initiated", "refund_credited", "return_completed"].includes(status) },
          { label: "Product Received", done: ["product_received", "refund_initiated", "refund_credited", "return_completed"].includes(status) },
          { label: "Refund Initiated", done: ["refund_initiated", "refund_credited", "return_completed"].includes(status) },
          { label: "Refund Credited", done: ["refund_credited", "return_completed"].includes(status) },
        ];

    return steps;
  };

  if (loading) {
    return (
      <div>
        <SmallHeader />
        <Header />
        <Center style={{ height: "50vh" }}>
          <Loader />
        </Center>
        <Footer />
        <MobileBottomNavbar />
      </div>
    );
  }

  return (
    <div>
      <SmallHeader />
      <Header />

      <Box bg={theme.colors.gray[1]} p={isMobile ? "md" : "xl"}>
        <Center>
          <Box w={isMobile ? "100%" : rem(800)}>
            <Group position="apart" mb="lg">
              <Title order={2}>My Requests</Title>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/orders")}
                style={{ borderColor: DARK_GREEN, color: DARK_GREEN }}
              >
                View Orders
              </Button>
            </Group>

            {requests.length === 0 ? (
              <Card withBorder radius="lg" p="xl" ta="center">
                <IconPackage size={48} color="gray" />
                <Text mt="md" c="dimmed">
                  No exchange or return requests found
                </Text>
                <Button
                  mt="md"
                  onClick={() => navigate("/orders")}
                  style={{ backgroundColor: DARK_GREEN }}
                >
                  Go to Orders
                </Button>
              </Card>
            ) : (
              <Stack spacing="md">
                {requests.map((req) => (
                  <Card
                    key={req._id}
                    withBorder
                    radius="lg"
                    p="lg"
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                      },
                    }}
                    onClick={() => {
                      setSelectedRequest(req);
                      openDetail();
                    }}
                  >
                    <Group position="apart" mb="md">
                      <Group spacing="sm">
                        <Badge
                          color={req._type === "exchange" ? "blue" : "orange"}
                          variant="filled"
                          size="lg"
                        >
                          {req._type === "exchange" ? "Exchange" : "Return"}
                        </Badge>
                        <Badge
                          color={STATUS_COLORS[req.status] || "gray"}
                          variant="light"
                        >
                          {STATUS_LABELS[req.status] || req.status}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </Text>
                    </Group>

                    <Group align="flex-start" spacing="md">
                      <Image
                        src={req.orderItem?.productUrl || req.productImage}
                        w={80}
                        h={80}
                        radius="md"
                        fit="cover"
                      />
                      <Box style={{ flex: 1 }}>
                        <Text fw={600} size="sm" lineClamp={2}>
                          {req.orderItem?.productTitle || "Product"}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          Reason: {req.reason}
                        </Text>
                        {req._type === "exchange" && req.newSize && (
                          <Text size="xs" c="dimmed">
                            New Size: {req.newSize}
                          </Text>
                        )}
                      </Box>
                    </Group>

                    {(req.status === "approved" || req.status === "payment_pending") &&
                      req._type === "exchange" && (
                        <Button
                          mt="md"
                          fullWidth
                          size="lg"
                          loading={paying}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayExchangeCharge(req);
                          }}
                          style={{ backgroundColor: DARK_GREEN }}
                        >
                          Pay ₹{EXCHANGE_CHARGE} Now
                        </Button>
                      )}
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </Center>
      </Box>

      {/* Detail Drawer */}
      <Drawer
        opened={detailOpened}
        onClose={closeDetail}
        title={`${selectedRequest?._type === "exchange" ? "Exchange" : "Return"} Details`}
        position="right"
        size={isMobile ? "100%" : "480px"}
        padding="lg"
      >
        {selectedRequest && (
          <Stack spacing="lg">
            <Group position="apart">
              <Badge
                color={selectedRequest._type === "exchange" ? "blue" : "orange"}
                variant="filled"
                size="lg"
              >
                {selectedRequest._type === "exchange" ? "Exchange" : "Return"}
              </Badge>
              <Badge
                color={STATUS_COLORS[selectedRequest.status] || "gray"}
                variant="light"
              >
                {STATUS_LABELS[selectedRequest.status] || selectedRequest.status}
              </Badge>
            </Group>

            <Card withBorder radius="md" p="md">
              <Group align="flex-start" spacing="md">
                <Image
                  src={
                    selectedRequest.orderItem?.productUrl ||
                    selectedRequest.productImage
                  }
                  w={80}
                  h={80}
                  radius="md"
                  fit="cover"
                />
                <Box>
                  <Text fw={600} size="sm">
                    {selectedRequest.orderItem?.productTitle || "Product"}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    Reason: {selectedRequest.reason}
                  </Text>
                  {selectedRequest._type === "exchange" &&
                    selectedRequest.newSize && (
                      <Text size="xs" c="dimmed">
                        New Size: {selectedRequest.newSize}
                      </Text>
                    )}
                </Box>
              </Group>
            </Card>

            {selectedRequest.description && (
              <Card withBorder radius="md" p="md">
                <Text size="sm" fw={600} mb={4}>
                  Description
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedRequest.description}
                </Text>
              </Card>
            )}

            {selectedRequest.images?.length > 0 && (
              <Card withBorder radius="md" p="md">
                <Text size="sm" fw={600} mb={4}>
                  Images
                </Text>
                <SimpleGrid cols={3} spacing="sm">
                  {selectedRequest.images.map((url: string, i: number) => (
                    <Image
                      key={i}
                      src={url}
                      h={80}
                      radius="md"
                      fit="cover"
                    />
                  ))}
                </SimpleGrid>
              </Card>
            )}

            <Divider />

            <Text fw={600}>Status Timeline</Text>
            <Timeline
              active={
                getTimelineSteps(selectedRequest).filter((s) => s.done).length -
                1
              }
            >
              {getTimelineSteps(selectedRequest).map((s, i) => (
                <Timeline.Item
                  key={i}
                  bullet={
                    s.done ? (
                      <IconCheck size={12} />
                    ) : (
                      <IconClock size={12} />
                    )
                  }
                  color={s.done ? "green" : "gray"}
                  title={s.label}
                />
              ))}
            </Timeline>

            {(selectedRequest.status === "approved" || selectedRequest.status === "payment_pending") &&
              selectedRequest._type === "exchange" && (
                <Button
                  fullWidth
                  size="lg"
                  loading={paying}
                  onClick={() => handlePayExchangeCharge(selectedRequest)}
                  style={{ backgroundColor: DARK_GREEN }}
                >
                  Pay ₹{EXCHANGE_CHARGE} Now
                </Button>
              )}
          </Stack>
        )}
      </Drawer>

      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
