import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Button, Text, Tooltip } from "@mantine/core";
import CartQuantityControl from "./shared/CartQuantityControl";

const normalizeColor = (c?: string) =>
  (c ?? "").toString().trim().toLowerCase();

type Props = {
  opened: boolean;
  onClose: () => void;
  productTitle: string;
  price: number;
  imageUrl: string;
  colors?: string[];
  colorData?: any;
  sizes?: string[];
  productId: string | number;
};

export default function SizeSelectorDrawer({
  opened,
  onClose,
  productTitle,
  price,
  imageUrl,
  colors = [],
  sizes = [],
  productId,
  colorData,
}: Props) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  useEffect(() => {
    if (!opened) return;
    if (colors.length > 0) setSelectedColor(colors[0]);
    if (sizes.length > 0) setSelectedSize(String(sizes[0]));
  }, [opened, colors, sizes]);

  const headerImage = useMemo(() => {
    if (selectedColor && colorData?.[selectedColor]?.images?.[0]) {
      return colorData[selectedColor].images[0];
    }
    return imageUrl;
  }, [selectedColor, colorData, imageUrl]);

  console.log(selectedColor, selectedSize, headerImage);

  const renderColorSwatch = (c: string, idx: number) => {
    const active = normalizeColor(selectedColor) === normalizeColor(c);
    return (
      <Tooltip key={idx} label={c}>
        <button
          onClick={() => setSelectedColor(c)}
          className={`w-10 h-10 rounded-full border transition ${
            active ? "ring-2 ring-[#96BD75]" : "border-gray-200"
          }`}
          style={{ background: c }}
        />
      </Tooltip>
    );
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      overlayProps={{ opacity: 0.25, blur: 2 }}
      size="lg"
      title="Choose size"
      withCloseButton
      padding="md"
    >
      {/* HEADER */}
      <div className="flex gap-3 mb-3">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={headerImage}
            alt={productTitle}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <Text fw={600}>{productTitle}</Text>
          <Text fw={700}>₹{price}</Text>
        </div>
      </div>

      {/* COLORS */}
      {colors.length > 0 && (
        <>
          <Text size="sm" fw={600} mb={6}>
            Colors
          </Text>
          <div className="flex gap-3 mb-4 pl-2 overflow-x-auto">
            {colors.map((c, i) => renderColorSwatch(c, i))}
          </div>
        </>
      )}

      {/* SIZES */}
      <Text size="sm" fw={600} mb={6}>
        Sizes
      </Text>

      <div className="flex gap-2 flex-wrap mb-10">
        {sizes.map((s) => {
          const active = selectedSize === s;
          return (
            <button
              key={s}
              onClick={() => setSelectedSize(String(s))}
              className={`px-4 py-2 rounded-xl border text-sm ${
                active
                  ? "bg-[#96BD75] text-white border-[#96BD75]"
                  : "bg-white border-gray-300"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* FOOTER BUTTONS */}
      <div
        className="sticky bottom-0 left-0 right-0 bg-white p-3"
        style={{
          zIndex: 10,
          boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex gap-3">
          <Button
            fullWidth
            variant="outline"
            onClick={onClose}
            style={{
              borderRadius: 999,
              borderColor: "#96BD75",
              color: "#96BD75",
            }}
          >
            Continue shopping
          </Button>

          {selectedSize && selectedColor ? (
            <CartQuantityControl
              id={productId}
              title={productTitle}
              price={price}
              image={imageUrl}
              size={selectedSize}
              color={selectedColor}
            />
          ) : (
            <Button
              fullWidth
              disabled
              style={{ background: "#ccc", borderRadius: 999 }}
            >
              Select size & color
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
