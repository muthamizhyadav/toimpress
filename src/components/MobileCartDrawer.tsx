import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import { closeCart, removeFromCart } from "../redux/features/cartSlice";
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
import { IconTrash } from "@tabler/icons-react";

type DisplayItem = {
  id: string | number;
  imageUrl: string;
  productName: string;
  price: number;
  originalPrice?: number;
  qty: number;
  size?: string;
  color?: string;
};

function CartItemRow({ item }: { item: DisplayItem }) {
  const dispatch = useDispatch();
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const discountPct = hasDiscount
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

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
          {(item.size || item.color) && (
            <Text size="xs" c="dimmed">
              {item.size && <span>Size: {item.size}</span>}
              {item.size && item.color && " • "}
              {item.color && <span>Color: {item.color}</span>}
            </Text>
          )}
          <Group gap="xs" mt={2}>
            <Text size="sm" fw={600}>
              ₹{item.price}
            </Text>
            {item.originalPrice && (
              <Text size="xs" c="dimmed" td="line-through">
                ₹{item.originalPrice}
              </Text>
            )}
            {hasDiscount && (
              <Text size="xs" c="green" fw={600}>
                {discountPct}% OFF
              </Text>
            )}
          </Group>
        </Stack>

        <ActionIcon
          variant="subtle"
          color="gray"
          mt={4}
          onClick={() =>
            dispatch(
              removeFromCart({
                id: item.id,
                size: item.size,
                color: item.color,
                silent: true,
              })
            )
          }
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
      <Divider mt="sm" />
    </Box>
  );
}

export function MobileCartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // get cart and auth from store; flatten userAddress safely
  const { items, isOpen } = useSelector((state: RootState) => state.cart);
  const { user, userAddress: storedUserAddress } = useSelector(
    (state: RootState) => ({
      user: state.auth.user as any,
      userAddress: state.auth.userAddress as any, // may be object or null
    })
  );

  // Flattening: prefer saved userAddress, otherwise fall back to user.address[0] from API
  const flatUserAddress: any =
    storedUserAddress ??
    (user && Array.isArray((user as any).address) && (user as any).address.length > 0
      ? (user as any).address[0]
      : null);

  const displayItems: DisplayItem[] = (items || []).map((it: any) => ({
    id: it.id,
    imageUrl: it.image ?? it.imageUrl ?? "",
    productName: it.title ?? it.productName ?? "Product",
    price: it.salePrice ?? it.price ?? 0,
    originalPrice: it.salePrice ? it.price : undefined,
    qty: it.qty ?? 1,
    size: it.size,
    color: it.color,
  }));

  const goToCheckout = () => {
    // close drawer first
    dispatch(closeCart());

    // if address exists, proceed; otherwise redirect user to account page to add address
    if (flatUserAddress) {
      navigate("/checkout");
    } else {
      // keep UX smooth: send user to account page where they can add address
      // you may want to show a toast informing why—left out for brevity
      navigate("/account");
    }
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={() => dispatch(closeCart())}
      position="right"
      padding="md"
      size="100%"
      transitionProps={{ transition: "slide-left", duration: 250 }}
      styles={{
        content: {
          width: "100%",
          maxWidth: "100vw",
          margin: "0 0 0 auto",
          [`@media (min-width: 1024px)`]: {
            width: "40vw",
            maxWidth: "40vw",
          },
        },
      }}
    >
      <div className="flex flex-col h-full p-4">
        <Text className="text-center" size="lg" fw={600} mb="lg">
          Your Cart
        </Text>

        <div className="flex-grow overflow-y-auto space-y-6">
          {displayItems.length === 0 ? (
            <Text className="text-center" c="dimmed">
              Your cart is empty
            </Text>
          ) : (
            displayItems.map((item, idx) => (
              <CartItemRow
                key={`${item.id}-${item.size ?? ""}-${item.color ?? ""}-${idx}`}
                item={item}
              />
            ))
          )}
        </div>

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