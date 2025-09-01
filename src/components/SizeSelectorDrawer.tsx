import React, { useMemo, useState } from "react";
import { Drawer, Button, Badge } from "@mantine/core";

export type SizeOption = {
  band: number;
  cups: string[];
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

const BAND_TABLE: any[] = [
  { band: 28, underBust: [58, 62], overBustByCup: { A: [72, 74], B: [74, 76], C: [76, 78], D: [78, 80] } },
  { band: 30, underBust: [63, 67], overBustByCup: { A: [77, 79], B: [79, 81], C: [81, 83], D: [83, 85] } },
  { band: 32, underBust: [68, 72], overBustByCup: { A: [82, 84], B: [84, 86], C: [86, 88], D: [88, 90] } },
  { band: 34, underBust: [73, 77], overBustByCup: { A: [87, 89], B: [89, 91], C: [91, 93], D: [93, 95] } },
  { band: 36, underBust: [78, 82], overBustByCup: { A: [92, 94], B: [94, 96], C: [96, 98], D: [98, 100] } },
  { band: 38, underBust: [83, 87], overBustByCup: { A: [97, 99], B: [99, 101], C: [101, 103], D: [103, 105] } },
  { band: 40, underBust: [88, 92], overBustByCup: { A: [102, 104], B: [104, 106], C: [106, 108], D: [108, 110] } },
  { band: 42, underBust: [93, 97], overBustByCup: { A: [107, 109], B: [109, 111], C: [111, 113], D: [113, 115] } },
];

// ✅ build SizeOptions dynamically from BAND_TABLE
const buildOptionsFromBandTable = (): SizeOption[] =>
  BAND_TABLE.map((b) => {
    const cups = Object.keys(b.overBustByCup); // ["A","B","C","D"]
    return {
      band: b.band,
      cups,
      underband: `${b.underBust[0]}–${b.underBust[1]} cm`,
      overbust: `${Math.min(...Object.values(b.overBustByCup).map((r) => r[0]))}–${Math.max(
        ...Object.values(b.overBustByCup).map((r) => r[1])
      )} cm`,
    };
  });

export default function SizeSelectorDrawer({
  opened,
  onClose,
  onConfirm,
  productTitle,
  price,
  imageUrl,
  options = buildOptionsFromBandTable(),
}: Props) {
  const [band, setBand] = useState<number | null>(null);
  const [cup, setCup] = useState<string | null>(null);

  const cupList = useMemo(() => {
    const found = options.find((o) => o.band === band);
    return found?.cups ?? [];
  }, [band, options]);

  const bandInfo = useMemo(() => options.find((o) => o.band === band), [band, options]);

  const confirmSize = () => {
    if (!band || !cup) return;
    const label = `${band}${cup}`;
    onConfirm({ band, cup, label });
    resetState();
    onClose(); // ✅ close immediately after adding
  };

  const resetState = () => {
    setBand(null);
    setCup(null);
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
          Under-bust: <span className="underline">{bandInfo.underband}</span> &nbsp;|&nbsp; Over-bust:{" "}
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
        <Button
          variant="default"
          onClick={() => {
            resetState();
            onClose();
          }}
          className="flex-1 rounded-full"
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-[#96BD75] hover:bg-[#86ad65] rounded-full"
          onClick={confirmSize}
          disabled={!band || !cup}
        >
          Add to cart
        </Button>
      </div>
    </Drawer>
  );
}