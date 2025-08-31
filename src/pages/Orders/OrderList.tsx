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
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance"; // ✅ your axios wrapper
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function OrderList() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 600px)");
    const { tokens } :any = useSelector((state: RootState) => state.auth);


  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = async (pageNum: number) => {
    const headers = {
      "Authorization" : `Bearer ${tokens.access.token || 's'}`
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/orders/my-orders?page=${pageNum}&limit=10`, {headers}  );

      const newOrders = Array.isArray(res.data.data) ? res.data.data : [];

      if (newOrders.length === 0) {
        setHasMore(false);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
      }

      // also check pagination if you want to disable "Load More"
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
            {/* <Tabs.List>
              <Tabs.Tab value="All">All</Tabs.Tab>
              <Tabs.Tab value="In Progress">In Progress</Tabs.Tab>
              <Tabs.Tab value="Delivered">Delivered</Tabs.Tab>
              <Tabs.Tab value="Cancelled">Cancelled</Tabs.Tab>
            </Tabs.List> */}

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
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </Group>
                  </Group>

                  {/* Show first product */}
                  {order.items?.length > 0 && (
                    <Group mt="xs">
                      <AspectRatio ratio={1} w={60}>
                        <Image
                          src={order.items[0].productImage || "/placeholder.png"}
                          radius="md"
                          alt="product"
                          fit="contain"
                        />
                      </AspectRatio>

                      <Box ml="sm">
                        <Text fw={600}>{order.items[0].productName ?? "Product"}</Text>
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
                  src={item.productImage || "/placeholder.png"}
                  radius="md"
                  maw={isMobile ? "100%" : 300}
                  mx="auto"
                  fit="contain"
                />
                <Text fw={600}>{item.productName ?? "Product"}</Text>
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
    </Box>
  );
}