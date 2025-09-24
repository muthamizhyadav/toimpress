// components/MobileCartDrawer.tsx
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import { closeCart } from "../redux/features/cartSlice";
import {
  Button,
  Text,
  Drawer,
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
  Loader,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { API_GET_UPDATE, API_CART } from "../api/api";
import axiosInstance from "../api/axiosInstance";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import React, { useEffect, useState, useCallback } from "react";

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

function CartItemRow({ item, onRemove }: { item: DisplayItem; onRemove: () => void }) {
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
          onClick={onRemove}
          title="Remove item"
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

  // only keep isOpen in redux — actual items come from API now
  const { isOpen } = useSelector((state: RootState) => state.cart);
  const { user, userAddress: storedUserAddress } = useSelector(
    (state: RootState) => ({
      user: state.auth.user as any,
      userAddress: state.auth.userAddress as any,
    })
  );

  const flatUserAddress: any =
    storedUserAddress ??
    (user && Array.isArray((user as any).address) && (user as any).address.length > 0
      ? (user as any).address[0]
      : null);

  // Local cart state fetched from API
  const [loading, setLoading] = useState<boolean>(false);
  const [cartData, setCartData] = useState<any | null>(null); // keep raw response for flexibility
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await axiosInstance.get(API_GET_UPDATE);
      // set raw response data so mapper can handle multiple shapes
      if (resp?.status === 200 && resp?.data) {
        setCartData(resp.data);
      } else {
        setCartData(null);
        setError("Unable to fetch cart");
      }
    } catch (err: any) {
      console.error("Fetch cart error:", err);
      setCartData(null);
      setError(err?.response?.data?.message ?? "Unable to fetch cart");
    } finally {
      setLoading(false);
    }
  }, []);

  // refetch whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, fetchCart]);

  // Build display items from cartData (robust mapping depending on API shape)
  const displayItems: DisplayItem[] = React.useMemo(() => {
    // payload could be:
    // 1) { data: [ ...items ] }  <-- your latest response
    // 2) { data: { items: [...] } } <-- older shape
    // 3) array at root (cartData is array)
    // 4) single-item payload { product, itemqty, ... }
    const root = cartData ?? {};
    const payload = (root && root.data) ? root.data : root;

    // Case A: payload is an array (your provided response: { success:true, data: [ ... ] })
    if (Array.isArray(payload)) {
      return payload.map((it: any) => ({
        id: it.product ?? it.product ?? it._id,
        imageUrl: it.image ?? it.imageUrl ?? "",
        productName: it.productName ?? it.productTitle ?? it.title ?? "Product",
        price: it.salePrice ?? it.price ?? 0,
        originalPrice:
          (typeof it.price !== "undefined" && typeof it.salePrice !== "undefined")
            ? it.price
            : undefined,
        qty: it.itemqty ?? it.quantity ?? it.qty ?? 1,
        size: it.selectedSize ?? it.size,
        color: it.selectedColor ?? it.color,
      }));
    }

    // Case B: payload has items array (older payload: data.items)
    if (payload && Array.isArray(payload.items)) {
      return payload.items.map((it: any) => ({
        id: it._id ?? it.id ?? it.product,
        imageUrl: it.image ?? it.imageUrl ?? "",
        productName: it.productTitle ?? it.title ?? it.productName ?? "Product",
        price: it.salePrice ?? it.price ?? 0,
        originalPrice:
          (typeof it.price !== "undefined" && typeof it.salePrice !== "undefined")
            ? it.price
            : undefined,
        qty: it.quantity ?? it.qty ?? it.itemqty ?? 1,
        size: it.selectedSize ?? it.size,
        color: it.selectedColor ?? it.color,
      }));
    }

    // Case C: single-item response (e.g., after add)
    if (payload && typeof payload.product !== "undefined" && typeof payload.itemqty !== "undefined") {
      return [
        {
          id: payload.id ?? payload.product,
          imageUrl: payload.image ?? "",
          productName: payload.productTitle ?? payload.productName ?? "Product",
          price: payload.salePrice ?? payload.price ?? 0,
          originalPrice:
            (typeof payload.price !== "undefined" && typeof payload.salePrice !== "undefined")
              ? payload.price
              : undefined,
          qty: payload.itemqty ?? 1,
          size: payload.selectedSize ?? payload.size,
          color: payload.selectedColor ?? payload.color,
        },
      ];
    }

    // Case D: cartData itself is an array (rare)
    if (Array.isArray(cartData)) {
      return cartData.map((it: any) => ({
        id: it._id ?? it.id ?? it.product,
        imageUrl: it.image ?? it.imageUrl ?? "",
        productName: it.productTitle ?? it.title ?? it.productName ?? "Product",
        price: it.salePrice ?? it.price ?? 0,
        originalPrice:
          (typeof it.price !== "undefined" && typeof it.salePrice !== "undefined")
            ? it.price
            : undefined,
        qty: it.quantity ?? it.qty ?? it.itemqty ?? 1,
        size: it.selectedSize ?? it.size,
        color: it.selectedColor ?? it.color,
      }));
    }

    // fallback empty
    return [];
  }, [cartData]);

  // remove item handler (calls cart update endpoint with quantity: 0)
  const handleRemove = async (item: DisplayItem) => {
    try {
      const body = {
        productId: String(item.id),
        quantity: 0,
        selectedSize: item.size,
      };

      const resp = await axiosInstance.post(API_CART, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (resp?.status === 200 && resp?.data?.success) {
        showNotification({
          title: "Removed",
          message: resp.data?.message ?? "Item removed from cart",
          color: "green",
          icon: <IconCheck size={16} />,
          autoClose: 2000,
        });
        await fetchCart();
      } else {
        showNotification({
          title: "Remove failed",
          message: resp?.data?.message ?? "Unable to remove item",
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (err: any) {
      console.error("Remove cart item error:", err);
      showNotification({
        title: "Remove failed",
        message: err?.response?.data?.message ?? err?.message ?? "Unable to remove item",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 3000,
      });
    }
  };

  const goToCheckout = () => {
    dispatch(closeCart());
    if (flatUserAddress) {
      navigate("/checkout");
    } else {
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : displayItems.length === 0 ? (
            <Text className="text-center" c="dimmed">
              {error ? `Error: ${error}` : "Your cart is empty"}
            </Text>
          ) : (
            displayItems.map((item, idx) => (
              <CartItemRow
                key={`${item.product}-${item.size ?? ""}-${item.color ?? ""}-${idx}`}
                item={item}
                onRemove={() => handleRemove(item)}
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