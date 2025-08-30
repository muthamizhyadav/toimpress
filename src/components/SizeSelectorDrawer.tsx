// components/SizeSelectorDrawer.tsx
import React, { useMemo, useState } from "react";
import { Drawer, Button, Badge } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export type SizeOption = {
  band: number;
  cups: ("A" | "B" | "C" | "D" | "DD" | "E")[];
  underband?: string;
  overbust?: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: (payload: { band: number; cup: string; label: string }) => void;
  productTitle: string;
  price: number;
  imageUrl: string;
  options?: SizeOption[];
};

const fallbackOptions: SizeOption[] = [
  { band: 32, cups: ["B", "C", "D"], underband: "68-72 cm", overbust: "83-86 cm" },
  { band: 34, cups: ["B", "C", "D"], underband: "73-77 cm", overbust: "88-91 cm" },
  { band: 36, cups: ["B", "C", "D"], underband: "78-82 cm", overbust: "93-96 cm" },
  { band: 38, cups: ["B", "C", "D"], underband: "83-87 cm", overbust: "98-101 cm" },
  { band: 40, cups: ["B", "C", "D"], underband: "88-92 cm", overbust: "103-106 cm" },
  { band: 42, cups: ["B", "C", "D"], underband: "93-97 cm", overbust: "108-111 cm" },
];

export default function SizeSelectorDrawer({
  opened,
  onClose,
  onConfirm,
  productTitle,
  price,
  imageUrl,
  options = fallbackOptions,
}: Props) {
  const [band, setBand] = useState<number | null>(null);
  const [cup, setCup] = useState<string | null>(null);
  const [sizeConfirmed, setSizeConfirmed] = useState(false);
  const navigate = useNavigate();

  const cupList = useMemo(() => {
    const found = options.find((o) => o.band === band);
    return found?.cups ?? [];
  }, [band, options]);

  const bandInfo = useMemo(() => options.find((o) => o.band === band), [band, options]);

  const confirmSize = () => {
    if (!band || !cup) return;
    const label = `${band}${cup}`;
    onConfirm({ band, cup, label });
    setSizeConfirmed(true); // now show Proceed / Keep Shopping
  };

  const resetState = () => {
    setBand(null);
    setCup(null);
    setSizeConfirmed(false);
  };

  const handleKeepShopping = () => {
    resetState();
    onClose();
  };

  const handleProceedToCart = () => {
    resetState();
    onClose();
    navigate("/cart"); // 👈 or "/checkout"
  };

  return (
    <Drawer
      opened={opened}
      onClose={() => {
        resetState();
        onClose();
      }}
      position="right"
      overlayProps={{ opacity: 0.25, blur: 2 }}
      size="lg"
      withCloseButton
      padding="md"
      title="Choose size"
    >
      {/* header product summary */}
      <div className="flex gap-3 mb-3">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium line-clamp-2">{productTitle}</div>
          <div className="mt-1 text-lg font-semibold">₹{price}</div>
        </div>
      </div>

      {!sizeConfirmed ? (
        <>
          {/* BAND */}
          <div className="mt-2">
            <div className="text-sm font-semibold mb-2">BAND</div>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => (
                <button
                  key={o.band}
                  onClick={() => {
                    setBand(o.band);
                    setCup(null);
                  }}
                  className={`px-4 py-2 rounded-xl border text-sm transition
                ${band === o.band ? "bg-[#96BD75] text-white border-[#96BD75]" : "bg-white border-gray-300"}`}
                >
                  {o.band}
                </button>
              ))}
            </div>
          </div>

          {/* helper */}
          {bandInfo?.underband && bandInfo?.overbust && (
            <div className="mt-2 text-xs text-gray-600">
              Underband: <span className="underline">{bandInfo.underband}</span> &nbsp;|&nbsp; Over Bust:{" "}
              <span className="underline">{bandInfo.overbust}</span>
            </div>
          )}

          {/* SIZE (cup) */}
          <div className="mt-5">
            <div className="text-sm font-semibold mb-2">SIZE</div>
            <div className="flex flex-wrap gap-2">
              {(band ? cupList : []).map((c) => (
                <button
                  key={c}
                  onClick={() => setCup(c)}
                  disabled={!band}
                  className={`px-4 py-2 rounded-xl border text-sm transition
                ${cup === c ? "bg-[#96BD75] text-white border-[#96BD75]" : "bg-white border-gray-300"}
                ${!band ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {band}
                  {c}
                </button>
              ))}
              {!band && <Badge variant="light" size="lg">Select a band first</Badge>}
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex gap-2">
            <Button variant="default" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
            <Button
              className="flex-1 bg-[#96BD75] hover:bg-[#86ad65] rounded-full"
              onClick={confirmSize}
              disabled={!band || !cup}
            >
              Add to cart
            </Button>
          </div>
        </>
      ) : (
        // ✅ Show after Add to cart
        <div className="mt-6 flex flex-col gap-3">
          <Button
            fullWidth
            radius="xl"
            color="green"
            onClick={handleProceedToCart}
          >
            Proceed to Cart
          </Button>
          <Button
            fullWidth
            radius="xl"
            variant="outline"
            color="gray"
            onClick={handleKeepShopping}
          >
            Keep Shopping
          </Button>
        </div>
      )}
    </Drawer>
  );
}