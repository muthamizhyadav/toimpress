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
    // Paper,
    Center,
    rem,
  } from "@mantine/core";
  import { useDisclosure, useMediaQuery } from "@mantine/hooks";
  import { useState } from "react";
  import BraModel from "../../assets/svg/braModel.svg";
  
  // Sample bra orders data
  const orders = [
    {
      id: "BRA-20250721-001",
      date: "10 July 2025",
      status: "In progress",
      statusColor: "orange",
      productName: "Seamless T-Shirt Bra",
      size: "34B",
      color: "Nude",
      quantity: 2,
      price: "₹ 1,200",
      image: BraModel,
    },
    {
      id: "BRA-20250721-002",
      date: "08 July 2025",
      status: "Delivered",
      statusColor: "green",
      productName: "Lace Push-Up Bra",
      size: "36C",
      color: "Black",
      quantity: 1,
      price: "₹ 899",
      image: BraModel,
    },
    {
      id: "BRA-20250721-003",
      date: "01 July 2025",
      status: "Delivered",
      statusColor: "green",
      productName: "Sports Bra - Medium Support",
      size: "32D",
      color: "Pink",
      quantity: 1,
      price: "₹ 1,099",
      image: BraModel,
    },
  ];
  
  export default function OrderList() {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const theme = useMantineTheme();
    const isMobile = useMediaQuery("(max-width: 600px)");
  
    const handleClick = (order: any) => {
      setSelectedOrder(order);
      open();
    };
  
    return (
      <Box p="md">
        {/* Wrap with center & card only on desktop */}
        <Center>
          <Box
            w={isMobile ? "100%" : rem("1200px")} // 200% feel on desktop (based on default ~600px)
            bg={isMobile ? "transparent" : "white"}
            p={isMobile ? 0 : "md"}
            style={{
              borderRadius: isMobile ? 0 : theme.radius.md,
              boxShadow: isMobile ? "none" : theme.shadows.md,
            }}
          >
            <Tabs defaultValue="All">
              <Tabs.List>
                <Tabs.Tab value="All">All</Tabs.Tab>
                <Tabs.Tab value="In Progress">In Progress</Tabs.Tab>
                <Tabs.Tab value="Delivered">Delivered</Tabs.Tab>
                <Tabs.Tab value="Cancelled">Cancelled</Tabs.Tab>
              </Tabs.List>
  
              <ScrollArea h="75vh" mt="md">
                {orders.map((order, i) => (
                  <Box
                    key={i}
                    p="md"
                    my="sm"
                    bg="white"
                    style={{
                      borderRadius: 10,
                      boxShadow: theme.shadows.sm,
                      cursor: "pointer",
                    }}
                    onClick={() => handleClick(order)}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <Badge color={order.statusColor} variant="light">
                          {order.status}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {order.date}
                        </Text>
                      </Group>
                    </Group>
  
                    <Group mt="xs">
                      <AspectRatio ratio={1} w={60}>
                        <Image
                          src={order.image}
                          radius="md"
                          alt="bra product"
                          fit="contain"
                        />
                      </AspectRatio>
  
                      <Box ml="sm">
                        <Text fw={600}>{order.productName}</Text>
                        <Text size="sm" c="dimmed">
                          Size: <Text span fw={500}>{order.size}</Text> &nbsp;|&nbsp;
                          Color: <Text span fw={500}>{order.color}</Text> &nbsp;|&nbsp;
                          Qty: <Text span fw={500}>{order.quantity}</Text>
                        </Text>
                        <Text fw={700} mt={4}>
                          {order.price}
                        </Text>
                      </Box>
                    </Group>
                  </Box>
                ))}
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
            <Stack gap="md">
              <Image
                src={selectedOrder.image}
                radius="md"
                maw={isMobile ? "100%" : 300}
                mx="auto"
                fit="contain"
              />
              <Text size="sm" c="dimmed">
                Ordered on: {selectedOrder.date}
              </Text>
              <Text fw={600}>{selectedOrder.productName}</Text>
              <Text size="sm">
                <strong>Size:</strong> {selectedOrder.size}
              </Text>
              <Text size="sm">
                <strong>Color:</strong> {selectedOrder.color}
              </Text>
              <Text size="sm">
                <strong>Quantity:</strong> {selectedOrder.quantity}
              </Text>
              <Text size="lg" fw={700}>
                {selectedOrder.price}
              </Text>
              <Button fullWidth onClick={close}>
                Close
              </Button>
            </Stack>
          )}
        </Drawer>
      </Box>
    );
  }
  