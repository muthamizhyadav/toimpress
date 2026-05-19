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

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();


  const locState: any = (location && (location as any).state) || {};
  const initialOrder = locState.order ?? null;
  const initialOrderId = locState.orderId ?? null;

  const [order, setOrder] = useState<any>(initialOrder);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const details = locState?.details;

  if (!details || !details.items || !details.orderTotal) return;

  const items = details.items;
  const orderTotal = details.orderTotal;

  if ((window as any).__purchase_tracked) return;
  (window as any).__purchase_tracked = true;

  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "Purchase", {
      content_ids: items.map((item: any) => item.id),
      contents: items.map((item: any) => ({
        id: item.id,
        quantity: item.qty,
        item_price: item.price,
      })),
      value: orderTotal,
      currency: "INR",
    });

    console.log("✅ Meta Pixel Purchase event fired");
  }
}, []);

  useEffect(() => {
    if (order) return;

    const params = new URLSearchParams(window.location.search);
    const qOrderId = params.get("orderId") ?? initialOrderId;

    if (!qOrderId) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
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

  const renderOrderSummary = (o: any) => {
    const items = o?.items ?? o?.lineItems ?? [];
    const orderId = o?.id ?? o?._id ?? o?.orderId ?? o?.order_number ?? "—";
    const amount = o?.amount ?? o?.total ?? o?.grandTotal ?? null;
    const paymentMethod = o?.paymentMethod ?? o?.payment?.method ?? o?.payment_method ?? "—";
    const createdAt = o?.createdAt ?? o?.created_at ?? o?.created ?? null;

    return (
      <Stack spacing="sm">
        {createdAt && (
          <Group position="apart">
            <Text size="sm" c="dimmed">Date</Text>
            <Text size="sm">{new Date(createdAt).toLocaleString()}</Text>
          </Group>
        )}

        <Divider />
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
