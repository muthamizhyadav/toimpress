import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, ActionIcon, Loader } from "@mantine/core";
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
  category?: string;
};

export default function CartQuantityControl({
  id,
  title,
  price,
  image,
  size,
  color,
  compact = false,
  category,
}: Props) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const qty = useSelector((state: any) => {
    return (
      state.cart.items?.find(
        (it: any) =>
          normalize(it.id) === normalize(id) &&
          (!size || normalize(it.size) === normalize(size)) &&
          (!color || normalize(it.color) === normalize(color))
      )?.qty ?? 0
    );
  });

  const delay = () => new Promise((resolve) => setTimeout(resolve, 200)); // 👈 smooth UI

  const handleAdd = async () => {
    setLoading(true);
    dispatch(addToCart({ id, title, price, image, size, color, qty: 1, category }));
    await delay();
    setLoading(false);
  };

  const handlePlus = async () => {
    setLoading(true);
    dispatch(updateCartItemQuantity({ id, size, color, qty: qty + 1, category }));
    await delay();
    setLoading(false);
  };

  const handleMinus = async () => {
    setLoading(true);
    console.log(category, "category");

    if (qty <= 1) {
      dispatch(removeFromCart({ id, size, color }));
    } else {
      dispatch(
        updateCartItemQuantity({
          id,
          size,
          color,
          qty: qty - 1,
          category: category,
        })
      );
    }

    await delay();
    setLoading(false);
  };

  if (qty <= 0) {
    return (
      <Button
        fullWidth={!compact}
        size={compact ? "xs" : "sm"}
        onClick={handleAdd}
        disabled={loading}
        style={{
          background: "#96BD75",
          color: "#fff",
          borderRadius: 999,
        }}
      >
        {loading ? <Loader size="xs" color="white" /> : "Add to cart"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ActionIcon
        onClick={handleMinus}
        variant="light"
        loading={loading}
        disabled={loading}
      >
        {loading ? <Loader size={14} /> : <IconMinus size={16} />}
      </ActionIcon>

      <Text fw={700} size="xl" style={{ minWidth: 28, textAlign: "center" }}>
        {loading ? "..." : qty}
      </Text>

      <ActionIcon
        onClick={handlePlus}
        variant="filled"
        disabled={loading}
        style={{ background: "#96BD75", color: "#fff" }}
      >
        {loading ? <Loader size={14} color="white" /> : <IconPlus size={16} />}
      </ActionIcon>
    </div>
  );
}
