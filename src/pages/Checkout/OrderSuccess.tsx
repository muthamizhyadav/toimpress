// src/pages/OrderSuccess/OrderSuccess.tsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Loader,
  Divider,
  Box,
} from "@mantine/core";
import { IconCheck, IconReceipt, IconArrowRight } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";

/**
 * OrderSuccess page
 *
 * Accepts:
 * - location.state = { order?: any, orderId?: string, paymentMeta?: any }
 * - or ?orderId=... in the URL (optional)
 *
 * If an orderId is available but full order data isn't, we attempt to fetch GET /v1/orders/:id
 */
export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // try to read commonly-used places for order info
  // location.state may be undefined
  const locState: any = (location && (location as any).state) || {};
  const initialOrder = locState.order ?? null;
  const initialOrderId = locState.orderId ?? null;

  const [order, setOrder] = useState<any>(initialOrder);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // try query param orderId if not in location.state
  useEffect(() => {
    if (order) return;

    const params = new URLSearchParams(window.location.search);
    const qOrderId = params.get("orderId") ?? initialOrderId;

    if (!qOrderId) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // tolerant: try GET /v1/orders/:id (adjust if your API path differs)
        const { data } = await axiosInstance.get(`/v1/orders/${qOrderId}`);
        if (!mounted) return;
        setOrder(data?.data ?? data ?? null);
      } catch (err: any) {
        console.error("Failed to fetch order by id", err);
        if (!mounted) return;
        setError("Could not load order details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [initialOrderId, order]);

  const handleViewOrders = () => navigate("/orders");
  const handleContinueShopping = () => navigate("/");

  // Small render helpers
  const renderOrderSummary = (o: any) => {
    const items = o?.items ?? o?.lineItems ?? [];
    const orderId = o?.id ?? o?._id ?? o?.orderId ?? o?.order_number ?? "—";
    const amount = o?.amount ?? o?.total ?? o?.grandTotal ?? null;
    const paymentMethod = o?.paymentMethod ?? o?.payment?.method ?? o?.payment_method ?? "—";
    const createdAt = o?.createdAt ?? o?.created_at ?? o?.created ?? null;

    return (
      <Stack spacing="sm">
        {/* <Group position="apart">
          <Text size="sm" c="dimmed">Order ID</Text>
          <Text fw={700}>{orderId}</Text>
        </Group>

        {amount != null && (
          <Group position="apart">
            <Text size="sm" c="dimmed">Amount</Text>
            <Text fw={700}>₹{amount}</Text>
          </Group>
        )}

        <Group position="apart">
          <Text size="sm" c="dimmed">Payment</Text>
          <Text>{String(paymentMethod).toUpperCase()}</Text>
        </Group> */}

        {createdAt && (
          <Group position="apart">
            <Text size="sm" c="dimmed">Date</Text>
            <Text size="sm">{new Date(createdAt).toLocaleString()}</Text>
          </Group>
        )}

        <Divider />

        <Text size="sm" c="dimmed">Items</Text>
        <Stack spacing="xs">
          {Array.isArray(items) && items.length ? (
            items.map((it: any, idx: number) => {
              const title = it?.title ?? it?.productName ?? it?.name ?? it?.product ?? "Product";
              const qty = it?.quantity ?? it?.qty ?? it?.itemqty ?? 1;
              const price = it?.price ?? it?.amount ?? it?.salePrice ?? null;
              return (
                <Group key={`${idx}-${title}`} position="apart" noWrap>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="sm" lineClamp={1}>{title}</Text>
                    <Text size="xs" c="dimmed">Qty: {qty}</Text>
                  </Box>
                  {price != null && <Text size="sm">₹{price}</Text>}
                </Group>
              );
            })
          ) : (
            <Text size="sm" c="dimmed">No item details available.</Text>
          )}
        </Stack>
      </Stack>
    );
  };

  return (
    <div>
      <SmallHeader />
      <Header />

      <Container size="sm" py="xl" style={{ paddingBottom: 80 }}>
        <Paper shadow="sm" radius="md" p="xl">
          <Stack align="center" spacing="lg">
            <div style={{ width: 88, height: 88, borderRadius: 88, background: "#eefbf0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconCheck size={40} stroke={1.5} color="#1f8a3e" />
            </div>

            <Title order={2} align="center">Order placed successfully</Title>
            <Text align="center" c="dimmed">
              Thank you — we received your order and will process it shortly.
            </Text>

            {loading ? (
              <Loader />
            ) : error ? (
              <Text c="red">{error}</Text>
            ) : order ? (
              <Box style={{ width: "100%" }}>{renderOrderSummary(order)}</Box>
            ) : (
              <Text size="sm" c="dimmed">If you don't see order details here, check "My Orders" or contact support with payment details.</Text>
            )}

            <Group position="apart" style={{ width: "100%" }}>
              <Button variant="outline" leftIcon={<IconReceipt size={16} />} onClick={handleViewOrders}>
                View Orders
              </Button>

              <Button onClick={handleContinueShopping} rightIcon={<IconArrowRight size={16} />}>
                Continue shopping
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>

      <Footer />
    </div>
  );
}
