// components/SizeSelectorDrawer.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  category?: string | any;
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

const buildOptionsFromBandTable = (): SizeOption[] =>
  BAND_TABLE.map((b) => {
    const cups = Object.keys(b.overBustByCup);
    return {
      band: b.band,
      cups,
      underband: `${b.underBust[0]}–${b.underBust[1]} cm`,
      overbust: `${Math.min(...Object.values(b.overBustByCup).map((r) => r[0]))}–${Math.max(
        ...Object.values(b.overBustByCup).map((r) => r[1])
      )} cm`,
    };
  });

const PANTY_SIZES = [
  { label: "XS", hip: "75–82 cm" },
  { label: "S", hip: "83–89 cm" },
  { label: "M", hip: "90–97 cm" },
  { label: "L", hip: "98–104 cm" },
  { label: "XL", hip: "105–112 cm" },
  { label: "2XL", hip: "113–119 cm" },
  { label: "3XL", hip: "120–127 cm" },
  { label: "4XL", hip: "128–134 cm" },
  { label: "5XL", hip: "135–142 cm" },
  { label: "6XL", hip: "143–149 cm" },
];

export default function SizeSelectorDrawer({
  opened,
  onClose,
  onConfirm,
  productTitle,
  price,
  category,
  imageUrl,
  options = buildOptionsFromBandTable(),
}: Props) {
  // internal mode union
  type Mode = "Brassiere" | "Panties" | "Both";
  const [mode, setMode] = useState<"Brassiere" | "Panties">("Brassiere");
  const [availableMode, setAvailableMode] = useState<Mode>("Both");

  const [band, setBand] = useState<number | null>(null);
  const [cup, setCup] = useState<string | null>(null);
  const [pantySize, setPantySize] = useState<string | null>(null);

  // compute cup list and band info
  const cupList = useMemo(() => {
    const found = options.find((o) => o.band === band);
    return found?.cups ?? [];
  }, [band, options]);

  const bandInfo = useMemo(() => options.find((o) => o.band === band), [band, options]);

  // determine available mode from category prop
  useEffect(() => {
    const cat = typeof category === "string" ? category.toLowerCase() : "";
    const isBra = cat.includes("bra") || cat.includes("brassiere");
    const isPant = cat.includes("pant") || cat.includes("panties") || cat.includes("panty");

    if (isBra && !isPant) {
      setAvailableMode("Brassiere");
      setMode("Brassiere");
      resetState();
      return;
    }

    if (isPant && !isBra) {
      setAvailableMode("Panties");
      setMode("Panties");
      resetState();
      return;
    }

    // default: both modes available and keep current mode (or default to Brassiere)
    setAvailableMode("Both");
    // don't forcibly change mode if parent didn't specify; keep current selection
  }, [category]);

  const confirmSize = () => {
    if (mode === "Brassiere") {
      if (!band || !cup) return;
      const label = `${band}${cup}`;
      onConfirm({ band, cup, label });
      return;
    }

    if (mode === "Panties") {
      if (!pantySize) return;
      const sizeObj = PANTY_SIZES.find((s) => s.label === pantySize)!;
      const label = `${sizeObj.label} (${sizeObj.hip})`;
      // keep payload shape: band=0 marks panty
      onConfirm({ band: 0, cup: sizeObj.label, label });
      return;
    }
  };

  const resetState = () => {
    setBand(null);
    setCup(null);
    setPantySize(null);
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
      {/* mode toggle (only when both available) */}
      {availableMode === "Both" && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setMode("Brassiere");
              resetState();
            }}
            className={`px-4 py-2 rounded-full text-sm border ${mode === "Brassiere" ? "bg-[#96BD75] text-white" : "bg-white"}`}
          >
            Brassiere
          </button>
          <button
            onClick={() => {
              setMode("Panties");
              resetState();
            }}
            className={`px-4 py-2 rounded-full text-sm border ${mode === "Panties" ? "bg-[#96BD75] text-white" : "bg-white"}`}
          >
            Panties
          </button>
        </div>
      )}

      {/* header product summary */}
      <div className="flex gap-3 mb-3">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium line-clamp-2">{productTitle}</div>
          <div className="mt-1 text-lg font-semibold">₹{price}</div>
          <div className="mt-1 text-xs text-gray-500">{mode === "Brassiere" ? "Select band & cup" : "Select panty size (hip measurement)"}</div>
        </div>
      </div>

      {/* Brassiere UI */}
      {mode === "Brassiere" && (
        <>
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

          {bandInfo?.underband && bandInfo?.overbust && (
            <div className="mt-2 text-xs text-gray-600">
              Under-bust: <span className="underline">{bandInfo.underband}</span> &nbsp;|&nbsp; Over-bust:{" "}
              <span className="underline">{bandInfo.overbust}</span>
            </div>
          )}

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
        </>
      )}

      {/* Panties UI */}
      {mode === "Panties" && (
        <>
          <div className="mt-2">
            <div className="text-sm font-semibold mb-2">PANTY SIZE (HIP)</div>
            <div className="flex flex-wrap gap-2">
              {PANTY_SIZES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setPantySize(s.label)}
                  className={`px-4 py-2 rounded-xl border text-sm transition
                    ${pantySize === s.label ? "bg-[#96BD75] text-white border-[#96BD75]" : "bg-white border-gray-300"}`}
                >
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-gray-600">{s.hip}</div>
                </button>
              ))}
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Tip: Measure around the fullest part of your hips. The size shown is the recommended hip range.
            </div>
          </div>
        </>
      )}

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
          disabled={mode === "Brassiere" ? !band || !cup : !pantySize}
        >
          Add to cart
        </Button>
      </div>
    </Drawer>
  );
}
