import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, ActionIcon } from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../../redux/slices/cartSlice";

const normalize = (v?: string | number) =>
  v ? v.toString().trim().toLowerCase() : "";

type Props = {
  id: string | number;
  title?: string;
  price?: number;
  image?: string;
  size?: string | number;
  color?: string;
  compact?: boolean;
};

export default function CartQuantityControl({
  id,
  title,
  price,
  image,
  size,
  color,
  compact = false,
}: Props) {
  const dispatch = useDispatch();

  const qty = useSelector((state: any) => {
    const found = state.cart.items?.find((it: any) => {
      const matchId = normalize(it.id) === normalize(id);
      const matchSize = normalize(it.size) === normalize(size);

      // If color exists, include in match condition
      if (color) {
        return (
          matchId && matchSize && normalize(it.color) === normalize(color)
        );
      }

      // Otherwise match only by id + size
      return matchId && matchSize;
    });

    return found?.qty ?? 0;
  });

  console.log(id, title, price, image, size, color);

  const handleAdd = () => {
    dispatch(
      addToCart({
        id,
        title,
        price,
        image,
        size,
        color,
        qty: 1,
      })
    );
  };

  const handlePlus = () => {
    dispatch(
      updateCartItemQuantity({
        id,
        size,
        color,
        qty: qty + 1,
      })
    );
  };

  const handleMinus = () => {
    if (qty <= 1) {
      dispatch(removeFromCart({ id, size, color }));
      return;
    }

    dispatch(
      updateCartItemQuantity({
        id,
        size,
        color,
        qty: qty - 1,
      })
    );
  };

  if (qty <= 0) {
    return (
      <Button
        fullWidth={!compact}
        size={compact ? "xs" : "sm"}
        onClick={handleAdd}
        style={{
          background: "#96BD75",
          color: "#fff",
          borderRadius: 999,
        }}
      >
        Add to cart
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <ActionIcon onClick={handleMinus} variant="light">
        <IconMinus size={16} />
      </ActionIcon>

      <Text fw={700} size="xl" style={{ minWidth: 28, textAlign: "center" }}>
        {qty}
      </Text>

      <ActionIcon
        onClick={handlePlus}
        variant="filled"
        style={{ background: "#96BD75", color: "#fff" }}
      >
        <IconPlus size={16} />
      </ActionIcon>
    </div>
  );
}
