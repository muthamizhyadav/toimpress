import {
  Drawer,
  Box,
  Text,
  Group,
  Stack,
  Button,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconTrash, IconMinus, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

interface CartItemType {
  id: string | number;
  imageUrl: string;
  productName: string;
  price: number;
  originalPrice: number;
  rating: number;
  quantity: number;
}

function CartItem({
  item,
  onUpdate,
}: {
  item: CartItemType;
  onUpdate: () => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);

  const updateCart = (newQty: number) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (newQty <= 0) {
      cart = cart.filter((c: any) => c.id !== item.id);
    } else {
      cart = cart.map((c: any) =>
        c.id === item.id ? { ...c, quantity: newQty } : c
      );
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setQuantity(newQty);
    onUpdate();
  };

  const removeItem = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = cart.filter((c: any) => c.id !== item.id);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    onUpdate();
  };

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
          <Group >
            <Text size="sm" fw={600}>
              ₹{item.price}
            </Text>
            <Text size="xs" c="dimmed" td="line-through">
              ₹{item.originalPrice}
            </Text>
          </Group>
        </Stack>

        <ActionIcon variant="subtle" color="gray" mt={4} onClick={removeItem}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      <Group mt="xs" justify="right" >
        <ActionIcon
          variant="outline"
          size="sm"
          color="green"
          onClick={() => updateCart(quantity - 1)}
        >
          <IconMinus size={14} />
        </ActionIcon>
        <Button variant="light" size="sm" radius="xl" disabled>
          {quantity}
        </Button>
        <ActionIcon
          variant="outline"
          size="sm"
          color="green"
          onClick={() => updateCart(quantity + 1)}
        >
          <IconPlus size={14} />
        </ActionIcon>
      </Group>

      <Divider mt="sm" />
    </Box>
  );
}


export function MobileCartDrawer({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  const fetchCartItems = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(storedCart);
  };

  useEffect(() => {
    if (opened) {
      fetchCartItems();
    }
  }, [opened]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      padding="md"
      size="100%"
      transitionProps={{ transition: "slide-left", duration: 250 }}
      styles={{
        content: {
          width: "100%",
          maxWidth: "100vw",
          margin: "0 auto",
          [`@media (min-width: 768px)`]: {
            width: "60vw",
            maxWidth: "60vw",
            margin: "0 auto",
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
          {cartItems.length === 0 ? (
            <Text className="text-center" color="dimmed">
              Your cart is empty
            </Text>
          ) : (
            cartItems.map((item, index) => (
              <CartItem key={index} item={item} onUpdate={fetchCartItems} />
            ))
          )}
        </div>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <div className="mt-6">
            <Button fullWidth color="dark" radius="xl">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export function UseMobileCartDrawer() {
  const [opened, { open, close }] = useDisclosure(false);
  return { opened, open, close };
}
