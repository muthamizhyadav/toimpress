import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import {
  closeCart,
  decreaseQty,
  increaseQty,
  removeFromCart,
} from "../redux/features/CartSlice"; // <- ensure exact filename/case
import {
  Button,
  Text,
  Drawer,
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
} from "@mantine/core";
import { IconTrash, IconMinus, IconPlus } from "@tabler/icons-react";

// ------------ UI-friendly item shape (mapped from redux items) ------------
type DisplayItem = {
  id: string | number;
  imageUrl: string;
  productName: string;
  price: number;          // effective price per unit
  originalPrice?: number; // optional MRP (for strikethrough)
  quantity: number;
};

// ------------ Row component ------------
function CartItemRow({ item }: { item: DisplayItem }) {
  const dispatch = useDispatch();

  return (
    <Box w="100%">
      <Group align="flex-start" justify="center">
        <Box
          w={70}
          h={90}
          style={{ borderRadius: 8, overflow: "hidden", flexShrink: 0 }}
        >
          <img
            src={item.imageUrl}
            alt={item.productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        <Stack style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} lineClamp={2}>
            {item.productName}
          </Text>
          <Group>
            <Text size="sm" fw={600}>₹{item.price}</Text>
            {item.originalPrice ? (
              <Text size="xs" c="dimmed" td="line-through">
                ₹{item.originalPrice}
              </Text>
            ) : null}
          </Group>
        </Stack>

        <ActionIcon
          variant="subtle"
          color="gray"
          mt={4}
          onClick={() => dispatch(removeFromCart(item.id))}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      <Group mt="xs" justify="right">
        <ActionIcon
          variant="outline"
          size="sm"
          color="green"
          onClick={() => dispatch(decreaseQty(item.id))}
        >
          <IconMinus size={14} />
        </ActionIcon>
        <Button variant="light" size="sm" radius="xl" disabled>
          {item.quantity}
        </Button>
        <ActionIcon
          variant="outline"
          size="sm"
          color="green"
          onClick={() => dispatch(increaseQty(item.id))}
        >
          <IconPlus size={14} />
        </ActionIcon>
      </Group>

      <Divider mt="sm" />
    </Box>
  );
}

// ------------ Drawer ------------
export function MobileCartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);

  // Map redux items -> display props for UI
  const displayItems: DisplayItem[] = (items || []).map((it: any) => ({
    id: it.id,
    imageUrl: it.image ?? it.imageUrl ?? "",
    productName: it.title ?? it.productName ?? "Product",
    price: it.salePrice ?? it.price ?? 0,
    originalPrice: it.salePrice ? it.price : undefined,
    quantity: it.qty ?? it.quantity ?? 1,
  }));

  const goToCheckout = () => {
    dispatch(closeCart());
    navigate("/checkout");
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={() => dispatch(closeCart())}
      position="right"
      padding="md"
      // Mobile: 100%, Desktop: 40vw
      size="100%"
      transitionProps={{ transition: "slide-left", duration: 250 }}
      styles={{
        content: {
          width: "100%",
          maxWidth: "100vw",
          margin: "0 0 0 auto", // stick to right
          // desktop breakpoint
          ["@media (min-width: 1024px)"]: {
            width: "40vw",
            maxWidth: "40vw",
          },
        },
      }}
    >
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <Text className="text-center" size="lg" fw={600} mb="lg">
          Your Cart
        </Text>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto space-y-6">
          {displayItems.length === 0 ? (
            <Text className="text-center" color="dimmed">
              Your cart is empty
            </Text>
          ) : (
            displayItems.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {/* Checkout Button */}
        {displayItems.length > 0 && (
          <div className="mt-6">
            <Button fullWidth color="dark" radius="xl" onClick={goToCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}