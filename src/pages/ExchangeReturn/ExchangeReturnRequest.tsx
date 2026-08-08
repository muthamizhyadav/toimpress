import {
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  FileInput,
  Group,
  Image,
  Loader,
  Radio,
  rem,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Timeline,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import axiosInstance from "../../api/axiosInstance";
import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import { useMediaQuery } from "@mantine/hooks";

const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#92B775";
const EXCHANGE_CHARGE = 150;

const EXCHANGE_REASONS = [
  "Size Too Small",
  "Size Too Large",
  "Defective Product",
  "Wrong Product Received",
  "Other",
];

const RETURN_REASONS = [
  "Damaged Product",
  "Wrong Product Received",
  "Quality Issue",
  "Other",
];

export default function ExchangeReturnRequest() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const itemId = searchParams.get("itemId");
  const type = (searchParams.get("type") as "exchange" | "return") || "exchange";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderItem, setOrderItem] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  // Form state
  const [reason, setReason] = useState<string>("");
  const [newSize, setNewSize] = useState<string>("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagesUploaded, setImagesUploaded] = useState<string[]>([]);

  // Exchange-specific
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [stockInfo, setStockInfo] = useState<Record<string, boolean>>({});
  const [requestId, setRequestId] = useState<string>("");
  const [requestStatus, setRequestStatus] = useState<string>("");

  const totalSteps = type === "exchange" ? 5 : 4;

  useEffect(() => {
    if (orderId && itemId) {
      fetchOrderItem();
    }
  }, [orderId, itemId]);

  const fetchOrderItem = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/orders/my-orders?limit=100`);
      const orders = res.data?.data || res.data || [];
      const order = orders.find(
        (o: any) => (o._id || o.id || o.orderNumber) === orderId
      );
      setOrderData(order);
      const item = order?.items?.find((i: any) => i._id === itemId);
      if (item) {
        setOrderItem(item);
        if (type === "exchange" && (item.product || item.productId)) {
          fetchProductSizes(item.product || item.productId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch order", err);
      showNotification({
        title: "Error",
        message: "Failed to load order details",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSizes = async (productId: string) => {
    try {
      const res = await axiosInstance.get(`/products/product/detail/${productId}`);
      const raw = res.data?.data || res.data;
      const product = raw?.product || raw;
      const sizes = product?.selectedSizes || product?.sizes || product?.availableSizes || [];
      setAvailableSizes(sizes);
      const stock: Record<string, boolean> = {};
      sizes.forEach((s: any) => {
        const sizeLabel = typeof s === "string" ? s : s.size || s.name;
        stock[sizeLabel] = true;
      });
      setStockInfo(stock);
    } catch (err) {
      console.error("Failed to fetch product sizes", err);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    setImages(files);
    const uploadedUrls: string[] = [];
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("folder", type);
    try {
      const res = await axiosInstance.post("/exchange-return/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data?.data || [];
      const urls = Array.isArray(data) ? data.map((d: any) => d.url || d.Location || d) : [];
      setImagesUploaded(urls);
    } catch (err) {
      console.error("Image upload failed", err);
      showNotification({ title: "Upload failed", message: "Failed to upload images", color: "red" });
    }
  };

  const handleSubmitRequest = async () => {
    if (!reason) {
      showNotification({
        title: "Required",
        message: "Please select a reason",
        color: "yellow",
      });
      return;
    }

    if (type === "exchange" && !newSize) {
      showNotification({
        title: "Required",
        message: "Please select a new size",
        color: "yellow",
      });
      return;
    }

    if (type === "return" && imagesUploaded.length === 0) {
      showNotification({
        title: "Required",
        message: "Please upload at least one image for return request",
        color: "yellow",
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        orderId,
        orderItemId: itemId,
        type,
        reason,
        description,
        images: imagesUploaded,
      };

      if (type === "exchange") {
        payload.newSize = newSize;
      }

      const res = await axiosInstance.post(
        type === "exchange" ? "/exchange-return/exchanges" : "/exchange-return/returns",
        payload
      );

      const data = res.data?.data || res.data;
      setRequestId(data._id || data.id || data.requestId || "");
      setRequestStatus(data.status || "requested");

      showNotification({
        title: "Success",
        message: `${type === "exchange" ? "Exchange" : "Return"} request submitted successfully!`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      setStep(step + 1);
    } catch (err: any) {
      showNotification({
        title: "Error",
        message: err?.response?.data?.message || "Failed to submit request",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Card withBorder radius="lg" p="xl">
            <Stack spacing="lg">
              <Group>
                <ThemeIcon size="xl" radius="xl" variant="light" color="green">
                  <IconPackage size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={4}>Select Product</Title>
                  <Text size="sm" c="dimmed">
                    Confirm the product you want to {type}
                  </Text>
                </Box>
              </Group>

              {orderItem && (
                <Card withBorder radius="md" p="md" bg={theme.colors.gray[0]}>
                  <Group align="flex-start" spacing="md">
                    <Image
                      src={orderItem.productUrl || orderItem.productImage}
                      w={100}
                      h={100}
                      radius="md"
                      fit="cover"
                    />
                    <Box>
                      <Text fw={600}>{orderItem.productTitle}</Text>
                      <Group spacing="xs" mt={4}>
                        <Text size="sm" c="dimmed">
                          Size: {orderItem.selectedSize}
                        </Text>
                        <Text size="sm" c="dimmed">
                          • Qty: {orderItem.quantity}
                        </Text>
                        <Text size="sm" c="dimmed">
                          • ₹{orderItem.price}
                        </Text>
                      </Group>
                    </Box>
                  </Group>
                </Card>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={() => setStep(2)}
                disabled={!orderItem}
                style={{ backgroundColor: DARK_GREEN }}
              >
                Continue
              </Button>
            </Stack>
          </Card>
        );

      case 2:
        return (
          <Card withBorder radius="lg" p="xl">
            <Stack spacing="lg">
              <Group>
                <ThemeIcon size="xl" radius="xl" variant="light" color="orange">
                  <IconX size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={4}>Choose Reason</Title>
                  <Text size="sm" c="dimmed">
                    Why do you want to {type} this product?
                  </Text>
                </Box>
              </Group>

              <Radio.Group value={reason} onChange={setReason}>
                <Stack spacing="sm">
                  {(type === "exchange" ? EXCHANGE_REASONS : RETURN_REASONS).map(
                    (r) => (
                      <Card
                        key={r}
                        withBorder
                        radius="md"
                        p="md"
                        style={{
                          cursor: "pointer",
                          borderColor:
                            reason === r ? DARK_GREEN : theme.colors.gray[3],
                          backgroundColor:
                            reason === r ? "#f0f5ec" : "white",
                        }}
                        onClick={() => setReason(r)}
                      >
                        <Radio value={r} label={r} />
                      </Card>
                    )
                  )}
                </Stack>
              </Radio.Group>

              <Textarea
                label="Additional Details (Optional)"
                placeholder="Provide any additional information..."
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                minRows={3}
              />

              <Group position="apart">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(type === "exchange" ? 3 : 3)}
                  disabled={!reason}
                  style={{ backgroundColor: DARK_GREEN }}
                >
                  Continue
                </Button>
              </Group>
            </Stack>
          </Card>
        );

      case 3:
        if (type === "exchange") {
          return (
            <Card withBorder radius="lg" p="xl">
              <Stack spacing="lg">
                <Group>
                  <ThemeIcon size="xl" radius="xl" variant="light" color="blue">
                    <IconPackage size={24} />
                  </ThemeIcon>
                  <Box>
                    <Title order={4}>Select New Size</Title>
                    <Text size="sm" c="dimmed">
                      Choose the replacement size
                    </Text>
                  </Box>
                </Group>

                <Text size="sm" c="dimmed">
                  Current size: <b>{orderItem?.selectedSize}</b>
                </Text>

                <SimpleGrid cols={isMobile ? 3 : 5} spacing="sm">
                  {availableSizes.map((s) => {
                    const sizeLabel =
                      typeof s === "string" ? s : s.size || s.name;
                    const inStock = stockInfo[sizeLabel] !== false;
                    const isSelected = newSize === sizeLabel;
                    return (
                      <Card
                        key={sizeLabel}
                        withBorder
                        radius="md"
                        p="sm"
                        style={{
                          cursor: inStock ? "pointer" : "not-allowed",
                          borderColor: isSelected
                            ? DARK_GREEN
                            : theme.colors.gray[3],
                          backgroundColor: isSelected
                            ? "#f0f5ec"
                            : inStock
                              ? "white"
                              : theme.colors.gray[1],
                          opacity: inStock ? 1 : 0.5,
                        }}
                        onClick={() => inStock && setNewSize(sizeLabel)}
                      >
                        <Text ta="center" fw={isSelected ? 700 : 400}>
                          {sizeLabel}
                        </Text>
                        <Text ta="center" size="xs" c={inStock ? "green" : "red"}>
                          {inStock ? "In Stock" : "Out of Stock"}
                        </Text>
                      </Card>
                    );
                  })}
                </SimpleGrid>

                <Group position="apart">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!newSize}
                    style={{ backgroundColor: DARK_GREEN }}
                  >
                    Continue
                  </Button>
                </Group>
              </Stack>
            </Card>
          );
        }

        return (
          <Card withBorder radius="lg" p="xl">
            <Stack spacing="lg">
              <Group>
                <ThemeIcon size="xl" radius="xl" variant="light" color="teal">
                  <IconPhoto size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={4}>Upload Images</Title>
                  <Text size="sm" c="dimmed">
                    Upload clear photos of the product (required for return)
                  </Text>
                </Box>
              </Group>

              <FileInput
                placeholder="Upload product images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                leftSection={<IconUpload size={16} />}
              />

              {imagesUploaded.length > 0 && (
                <SimpleGrid cols={3} spacing="sm">
                  {imagesUploaded.map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      h={100}
                      radius="md"
                      fit="cover"
                    />
                  ))}
                </SimpleGrid>
              )}

              <Group position="apart">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={imagesUploaded.length === 0}
                  loading={submitting}
                  style={{ backgroundColor: DARK_GREEN }}
                >
                  Continue
                </Button>
              </Group>
            </Stack>
          </Card>
        );

      case 4:
        if (type === "exchange") {
          return (
            <Card withBorder radius="lg" p="xl">
              <Stack spacing="lg">
                <Group>
                  <ThemeIcon size="xl" radius="xl" variant="light" color="teal">
                    <IconPhoto size={24} />
                  </ThemeIcon>
                  <Box>
                    <Title order={4}>Upload Images (Optional)</Title>
                    <Text size="sm" c="dimmed">
                      Add photos to support your request
                    </Text>
                  </Box>
                </Group>

                <FileInput
                  placeholder="Upload product images"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  leftSection={<IconUpload size={16} />}
                />

                {imagesUploaded.length > 0 && (
                  <SimpleGrid cols={3} spacing="sm">
                    {imagesUploaded.map((url, i) => (
                      <Image
                        key={i}
                        src={url}
                        h={100}
                        radius="md"
                        fit="cover"
                      />
                    ))}
                  </SimpleGrid>
                )}

                <Card withBorder radius="md" bg="#fff8e1">
                  <Text size="sm" fw={600} color="yellow">
                    Note: ₹{EXCHANGE_CHARGE} Exchange Processing Charge will be
                    charged after approval.
                  </Text>
                </Card>

                <Group position="apart">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    loading={submitting}
                    style={{ backgroundColor: DARK_GREEN }}
                  >
                    Submit Request
                  </Button>
                </Group>
              </Stack>
            </Card>
          );
        }

        return (
          <Card withBorder radius="lg" p="xl">
            <Stack spacing="lg">
              <Group>
                <ThemeIcon size="xl" radius="xl" variant="light" color="green">
                  <IconCheck size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={4}>Review & Submit</Title>
                  <Text size="sm" c="dimmed">
                    Review your return request before submitting
                  </Text>
                </Box>
              </Group>

              <Card withBorder radius="md" p="md">
                <Stack spacing="xs">
                  <Group position="apart">
                    <Text size="sm" c="dimmed">Product:</Text>
                    <Text size="sm" fw={500}>{orderItem?.productTitle}</Text>
                  </Group>
                  <Group position="apart">
                    <Text size="sm" c="dimmed">Reason:</Text>
                    <Text size="sm" fw={500}>{reason}</Text>
                  </Group>
                  <Group position="apart">
                    <Text size="sm" c="dimmed">Images:</Text>
                    <Text size="sm" fw={500}>{imagesUploaded.length} uploaded</Text>
                  </Group>
                </Stack>
              </Card>

              <Group position="apart">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  loading={submitting}
                  style={{ backgroundColor: DARK_GREEN }}
                >
                  Submit Return Request
                </Button>
              </Group>
            </Stack>
          </Card>
        );

      case 5:
        return (
          <Card withBorder radius="lg" p="xl">
            <Stack spacing="lg" align="center">
              <ThemeIcon size={80} radius="xl" variant="light" color="green">
                <IconCheck size={40} />
              </ThemeIcon>

              <Title order={3} ta="center">
                {type === "exchange" ? "Exchange" : "Return"} Request Submitted!
              </Title>

              <Text c="dimmed" ta="center">
                Your request ID: <b>{requestId}</b>
              </Text>

              <Text c="dimmed" ta="center" size="sm">
                {type === "exchange"
                  ? "Once approved, you'll need to pay ₹150 processing charge to proceed."
                  : "Once approved, reverse pickup will be scheduled and refund will be processed after quality inspection."}
              </Text>

              <Timeline active={1} mt="md" style={{ width: "100%" }}>
                <Timeline.Item
                  bullet={<IconCheck size={12} />}
                  title="Request Submitted"
                  color="green"
                >
                  <Text size="xs" c="dimmed">
                    Your request has been received
                  </Text>
                </Timeline.Item>
                <Timeline.Item
                  bullet={<IconClock size={12} />}
                  title="Under Review"
                >
                  <Text size="xs" c="dimmed">
                    Admin will review your request
                  </Text>
                </Timeline.Item>
                {type === "exchange" && (
                  <Timeline.Item
                    bullet={<IconClock size={12} />}
                    title="Payment Required"
                  >
                    <Text size="xs" c="dimmed">
                      Pay ₹{EXCHANGE_CHARGE} processing charge
                    </Text>
                  </Timeline.Item>
                )}
                <Timeline.Item
                  bullet={<IconClock size={12} />}
                  title={type === "exchange" ? "Reverse Pickup" : "Refund Initiated"}
                >
                  <Text size="xs" c="dimmed">
                    {type === "exchange"
                      ? "Pickup will be scheduled"
                      : "Refund will be processed after inspection"}
                  </Text>
                </Timeline.Item>
                <Timeline.Item
                  bullet={<IconClock size={12} />}
                  title={type === "exchange" ? "Completed" : "Refund Credited"}
                >
                  <Text size="xs" c="dimmed">
                    {type === "exchange"
                      ? "Replacement delivered"
                      : "Refund credited to your payment method"}
                  </Text>
                </Timeline.Item>
              </Timeline>

              <Group mt="md">
                <Button
                  variant="outline"
                  onClick={() => navigate("/orders")}
                >
                  View Orders
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  style={{ backgroundColor: DARK_GREEN }}
                >
                  Continue Shopping
                </Button>
              </Group>
            </Stack>
          </Card>
        );

      default:
        return null;
    }
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
          <Box w={isMobile ? "100%" : rem(700)}>
            <Title order={2} mb="lg" ta="center">
              {type === "exchange" ? "Exchange" : "Return"} Request
            </Title>

            {/* Progress indicator */}
            <Group position="center" mb="xl">
              {Array.from({ length: totalSteps }, (_, i) => (
                <Group key={i} spacing="xs" align="center">
                  <ThemeIcon
                    size={32}
                    radius="xl"
                    variant={step > i + 1 ? "filled" : step === i + 1 ? "filled" : "outline"}
                    color={step >= i + 1 ? "green" : "gray"}
                  >
                    {step > i + 1 ? <IconCheck size={14} /> : i + 1}
                  </ThemeIcon>
                  {i < totalSteps - 1 && (
                    <Box
                      w={40}
                      h={3}
                      style={{
                        backgroundColor:
                          step > i + 1
                            ? theme.colors.green[5]
                            : theme.colors.gray[3],
                        borderRadius: 2,
                      }}
                    />
                  )}
                </Group>
              ))}
            </Group>

            {renderStepContent()}
          </Box>
        </Center>
      </Box>

      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
