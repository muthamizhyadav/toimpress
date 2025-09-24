import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Button,
  Badge,
  Group,
  Text,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import {
  addToCart,
  increaseQty,
  decreaseQty,
} from "../redux/features/cartSlice"; // adjust path if needed

// axios + API constant
import axiosInstance from "../api/axiosInstance";
import { API_GET_CART_DATA } from "../api/api";

export type SizeOption = {
  band: number;
  cups: string[];
  underband?: string;
  overbust?: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    band: number;
    cup: string;
    label: string;
    quantity?: number;
    selectedColor?: string | undefined;
  }) => void;
  productTitle: string;
  price: number;
  imageUrl: string;
  options?: SizeOption[];
  category?: string | any;
  productId?: string | number;
  selectedColor?: string | undefined;
  colors?: string[];
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
  productId,
  selectedColor: initialSelectedColor,
  colors = [],
}: Props) {
  type Mode = "Brassiere" | "Panties" | "Both";
  const [mode, setMode] = useState<"Brassiere" | "Panties">("Brassiere");
  const [availableMode, setAvailableMode] = useState<Mode>("Both");

  const [band, setBand] = useState<number | null>(null);
  const [cup, setCup] = useState<string | null>(null);
  const [pantySize, setPantySize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialSelectedColor);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Combined size list: e.g. { value: '30A', band: 30, cup: 'A' }
  const combinedSizes = useMemo(() => {
    const arr: { value: string; band: number; cup: string }[] = [];
    options.forEach((o) => {
      o.cups.forEach((c) => {
        arr.push({ value: `${o.band}${c}`, band: o.band, cup: c });
      });
    });
    return arr;
  }, [options]);

  const cupList = useMemo(() => {
    const found = options.find((o) => o.band === band);
    return found?.cups ?? [];
  }, [band, options]);

  const bandInfo = useMemo(() => options.find((o) => o.band === band), [band, options]);

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

    setAvailableMode("Both");
  }, [category]);

  useEffect(() => {
    setSelectedColor(initialSelectedColor);
  }, [initialSelectedColor, colors]);

  const currentLabel = useMemo(() => {
    if (mode === "Brassiere" && band && cup) return `${band}${cup}`;
    if (mode === "Panties" && pantySize) return pantySize;
    return null;
  }, [mode, band, cup, pantySize]);

  // currentQty driven from Redux (exact variant match: id + size + color)
  const currentQty: number = useSelector((state: any) => {
    if (!productId || !currentLabel) return 0;
    const items: any[] = state?.cart?.items ?? [];
    const found = items.find((it) => {
      const sameId = String(it.id) === String(productId) || String(it.productId ?? "") === String(productId);
      const sameSize = (it.size ?? "") === (currentLabel ?? "");
      const colorToMatch = selectedColor ?? initialSelectedColor ?? undefined;
      const sameColor = (it.color ?? "") === (colorToMatch ?? "");
      return sameId && sameSize && sameColor;
    });
    return Number(found?.qty ?? 0);
  });

  const resetState = () => {
    setBand(null);
    setCup(null);
    setPantySize(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // -- API call: fetch cart data when drawer opens --
  useEffect(() => {
    if (!opened) return;
    // make the API call and log response
    (async () => {
      try {
        const resp = await axiosInstance.get(API_GET_CART_DATA + productId);
        console.log("API_GET_CART_DATA response:", resp?.data ?? resp);
      } catch (err) {
        console.error("Failed to fetch API_GET_CART_DATA:", err);
      }
    })();
  }, [opened]);

  // Redux operations
  const reduxAddOne = () => {
    if (!productId || !currentLabel) return;
    if (currentQty > 0) {
      dispatch(increaseQty({ id: productId, size: currentLabel, color: selectedColor, silent: true }));
    } else {
      dispatch(
        addToCart({
          id: productId,
          title: productTitle,
          image: imageUrl,
          price,
          qty: 1,
          size: currentLabel,
          color: selectedColor,
          silent: true,
        } as any)
      );
    }

    const [b, c] =
      mode === "Brassiere" && band && cup
        ? [band, cup]
        : mode === "Panties"
        ? [0, pantySize ?? ""]
        : [0, ""];
    onConfirm({ band: b as number, cup: String(c), label: String(currentLabel), quantity: currentQty + 1, selectedColor });
  };

  const reduxRemoveOne = () => {
    if (!productId || !currentLabel) return;
    dispatch(decreaseQty({ id: productId, size: currentLabel, color: selectedColor, silent: true }));
    const [b, c] =
      mode === "Brassiere" && band && cup
        ? [band, cup]
        : mode === "Panties"
        ? [0, pantySize ?? ""]
        : [0, ""];
    onConfirm({ band: b as number, cup: String(c), label: String(currentLabel), quantity: Math.max(0, currentQty - 1), selectedColor });
  };

  const confirmSize = () => reduxAddOne();
  const reduceSize = () => {
    if (currentQty <= 0) return;
    reduxRemoveOne();
  };

  const handleCheckout = () => {
    if (mode === "Brassiere") {
      if (!band || !cup) return;
    } else {
      if (!pantySize) return;
    }
    reduxAddOne();
    navigate("/checkout");
    handleClose();
  };

  const renderSwatch = (c: string, idx: number) => {
    const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(String(c));
    const active = selectedColor === c;
    return (
      <Tooltip key={idx} label={c}>
        <button
          onClick={() => setSelectedColor(c)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
            active ? "ring-2 ring-[#96BD75]" : "border-gray-200"
          }`}
          style={{ background: isHex ? c : undefined }}
        >
          {!isHex && <span style={{ fontSize: 12 }}>{String(c).slice(0, 2).toUpperCase()}</span>}
        </button>
      </Tooltip>
    );
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="right"
      overlayProps={{ opacity: 0.25, blur: 2 }}
      size="lg"
      withCloseButton
      padding="md"
      title="Choose size"
    >
      {/* colors */}
      {Array.isArray(colors) && colors.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text size="sm" fw={600} mb={6}>Colors</Text>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
            {colors.map((c, idx) => renderSwatch(c, idx))}
          </div>
        </div>
      )}

      {/* header */}
      <div className="flex gap-3 mb-3">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium line-clamp-2">{productTitle}</div>
          <div className="mt-1 text-lg font-semibold">₹{price}</div>
          <div className="mt-1 text-xs text-gray-500">
            {mode === "Brassiere" ? "Select size (e.g. 30A)" : "Select panty size (hip measurement)"}
          </div>
        </div>
      </div>

      {/* Brassiere sizes grid (scrollable) */}
      {mode === "Brassiere" && (
        <div className="mt-2">
          <div className="text-sm font-semibold mb-2">SIZES</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
              gap: 8,
              maxHeight: 260, // <-- scrollable area
              overflowY: "auto",
              paddingRight: 6,
              paddingBottom: 6,
            }}
          >
            {combinedSizes.map((s) => {
              const active = band === s.band && cup === s.cup;
              return (
                <Button
                  key={s.value}
                  size="xs"
                  variant={active ? "filled" : "outline"}
                  onClick={() => {
                    setBand(s.band);
                    setCup(s.cup);
                  }}
                  sx={{
                    borderRadius: 8,
                    padding: "6px 8px",
                    minHeight: 36,
                    backgroundColor: active ? "#96BD75" : undefined,
                    color: active ? "#fff" : undefined,
                    borderColor: active ? "#96BD75" : undefined,
                    "&:hover": active ? { backgroundColor: "#86ad65" } : {},
                  }}
                >
                  {s.value}
                </Button>
              );
            })}
          </div>

          {bandInfo?.underband && bandInfo?.overbust && (
            <div className="mt-2 text-xs text-gray-600">
              Under-bust: <span className="underline">{bandInfo.underband}</span> &nbsp;|&nbsp; Over-bust:{" "}
              <span className="underline">{bandInfo.overbust}</span>
            </div>
          )}
        </div>
      )}

      {/* Panties */}
      {mode === "Panties" && (
        <div className="mt-2">
          <div className="text-sm font-semibold mb-2">PANTY SIZE (HIP)</div>
          <div style={{ maxHeight: 220, overflowY: "auto", paddingRight: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
      )}

      {/* Selected variant area */}
      {currentLabel && (
        <div>
          <div>
            <Text size="sm" fw={600}>Selected</Text>
            <Text size="sm">{currentLabel}</Text>
          </div>

          <div className="mt-3 w-full">
            {/* If qty is zero, show single Add to cart button (full width) */}
            {currentQty <= 0 ? (
              <div style={{ width: "100%" }}>
                <Button
                  fullWidth
                  onClick={reduxAddOne}
                  disabled={!currentLabel}
                  style={{ background: "#96BD75", color: "#fff", borderRadius: 999 }}
                >
                  Add to cart
                </Button>
              </div>
            ) : (
              // If qty > 0, show - / qty / + controls (and they will disappear again when qty reaches 0)
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ActionIcon
                    onClick={reduceSize}
                    title="Decrease"
                    variant="light"
                    size="lg"
                  >
                    <IconMinus size={16} />
                  </ActionIcon>

                  <div style={{ minWidth: 52, textAlign: "center" }}>
                    <Text size="sm" fw={700}>{currentQty}</Text>
                    <Text size="xs" c="dimmed">in cart</Text>
                  </div>

                  <ActionIcon
                    onClick={confirmSize}
                    title="Add one more"
                    variant="filled"
                    size="lg"
                    style={{ background: "#96BD75", color: "#fff" }}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </div>

                <div>
                  <Text size="xs" c="dimmed">Tap + to add one more of this variant</Text>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* sticky footer */}
      <div
        style={{
          position: "sticky",
          bottom: 50,
          left: 0,
          right: 0,
          display: "flex",
          gap: 8,
          paddingTop: 12,
          paddingBottom: 8,
          background: "transparent",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          marginTop: "15px",
        }}
      >
        <Button
          variant="outline"
          onClick={() => {
            resetState();
            onClose();
          }}
          style={{ flex: 1, borderRadius: 999 }}
        >
          Continue shopping
        </Button>

        <Button
          onClick={handleCheckout}
          style={{ flex: 1, background: "#96BD75", color: "#fff", borderRadius: 999 }}
          disabled={mode === "Brassiere" ? !band || !cup : !pantySize}
        >
          Go to checkout
        </Button>
      </div>
    </Drawer>
  );
}