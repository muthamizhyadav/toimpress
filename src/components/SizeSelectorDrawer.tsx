// components/SizeSelectorDrawer.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Button, Text, ActionIcon, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { addToCart, increaseQty, decreaseQty } from "../redux/features/cartSlice";
import { addOrUpdateCartLine } from "../redux/features/cartThunks"; // single-line API
import axiosInstance from "../api/axiosInstance";
import { API_GET_CART_DATA } from "../api/api";

const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#4c7533";

const normalizeColor = (c?: string) => (c ?? "").toString().trim().toLowerCase();

export type SizeOption = {
  band: number;
  cups: string[];
  underband?: string;
  overbust?: string;
};

type ColorDataMap = Record<
  string,
  {
    sizes: string[];
    images: string[];
  }
>;

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    band: number;
    cup: string;
    label: string;
    quantity?: number;
    selectedColor?: string | undefined; // raw for UI/server if needed
  }) => void;
  productTitle: string;
  price: number;
  imageUrl: string;
  options?: SizeOption[];
  category?: string | any;
  productId?: string | number;
  selectedColor?: string | undefined; // initial (raw) like "#23AD7D"
  colors?: string[];
  colorData?: ColorDataMap;
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
      overbust: `${Math.min(...Object.values(b.overBustByCup).map((r: any) => r[0]))}–${Math.max(
        ...Object.values(b.overBustByCup).map((r: any) => r[1])
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

const buildSizeOptionsFromSelectedSizes = (sizesInput?: string[]): SizeOption[] | undefined => {
  if (!Array.isArray(sizesInput) || sizesInput.length === 0) return undefined;
  const map = new Map<number, Set<string>>();
  for (const s of sizesInput) {
    const str = String(s ?? "").toUpperCase().trim();
    const m = /^(\d{2})([A-Z]+)$/.exec(str);
    if (!m) continue;
    const band = Number(m[1]);
    const cup = m[2];
    if (!map.has(band)) map.set(band, new Set());
    map.get(band)!.add(cup);
  }
  const arr: SizeOption[] = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([band, cupsSet]) => ({ band, cups: Array.from(cupsSet.values()).sort() }));
  return arr.length ? arr : undefined;
};

export default function SizeSelectorDrawer(props: Props) {
  const {
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
    colorData,
  } = props;

  type Mode = "Brassiere" | "Panties" | "Both";
  const [mode, setMode] = useState<"Brassiere" | "Panties">("Brassiere");
  const [availableMode, setAvailableMode] = useState<Mode>("Both");

  const [band, setBand] = useState<number | null>(null);
  const [cup, setCup] = useState<string | null>(null);
  const [pantySize, setPantySize] = useState<string | null>(null);

  // Track BOTH raw & normalized colors (color is optional)
  const [selectedColorNorm, setSelectedColorNorm] = useState<string | undefined>(
    initialSelectedColor ? normalizeColor(initialSelectedColor) : undefined
  );
  const [selectedColorRaw, setSelectedColorRaw] = useState<string | undefined>(initialSelectedColor);

  const [addedClicked, setAddedClicked] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resetState = () => {
    setBand(null);
    setCup(null);
    setPantySize(null);
    setAddedClicked(false);
  };

  useEffect(() => {
    resetState();
  }, [selectedColorNorm]);

  useEffect(() => {
    setSelectedColorNorm(initialSelectedColor ? normalizeColor(initialSelectedColor) : undefined);
    setSelectedColorRaw(initialSelectedColor);
  }, [initialSelectedColor, colors]);

  // Build size options based on color (if provided) for Brassiere
  const effectiveOptions: SizeOption[] = useMemo(() => {
    if (mode === "Brassiere") {
      const colorSizes = selectedColorRaw ? colorData?.[selectedColorRaw]?.sizes : undefined;
      const colorOptions = buildSizeOptionsFromSelectedSizes(colorSizes);
      return colorOptions ?? options;
    }
    return [];
  }, [mode, selectedColorRaw, colorData, options]);

  const combinedSizes = useMemo(() => {
    const arr: { value: string; band: number; cup: string }[] = [];
    effectiveOptions.forEach((o) => o.cups.forEach((c) => arr.push({ value: `${o.band}${c}`, band: o.band, cup: c })));
    return arr;
  }, [effectiveOptions]);

  const bandInfo = useMemo(() => effectiveOptions.find((o) => o.band === band), [band, effectiveOptions]);

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

  const currentLabel = useMemo(() => {
    if (mode === "Brassiere" && band && cup) return `${band}${cup}`;
    if (mode === "Panties" && pantySize) return pantySize;
    return null;
  }, [mode, band, cup, pantySize]);

  // Resolve color-specific block (optional)
  const colorBlock = useMemo(() => {
    if (!colorData || (!selectedColorRaw && !selectedColorNorm)) return undefined;
    const raw = selectedColorRaw ?? "";
    const norm = selectedColorNorm ?? normalizeColor(raw);
    const rawTrim = raw?.trim?.() ?? raw;

    return (
      colorData[rawTrim] ??
      colorData[raw] ??
      colorData[norm] ??
      colorData[rawTrim.toLowerCase?.() || rawTrim] ??
      colorData[rawTrim.toUpperCase?.() || rawTrim]
    );
  }, [colorData, selectedColorRaw, selectedColorNorm]);

  const headerImageUrl = useMemo(() => {
    const img = colorBlock?.images?.[0] || imageUrl;
    return img;
  }, [colorBlock, imageUrl]);

  // Quantity in cart for the current variant (color optional)
  const currentQty: number = useSelector((state: any) => {
    if (!productId || !currentLabel) return 0;
    const items: any[] = state?.cart?.items ?? [];

    // If no color is selected/available, match by id + size only
    if (!selectedColorNorm) {
      const found = items.find((it) => {
        const sameId = String(it.id) === String(productId) || String(it.productId ?? "") === String(productId);
        const sameSize = (it.size ?? "") === String(currentLabel);
        return sameId && sameSize;
      });
      return Number(found?.qty ?? 0);
    }

    // If color exists, match it too
    const wantColor = normalizeColor(selectedColorNorm);
    const found = items.find((it) => {
      const sameId = String(it.id) === String(productId) || String(it.productId ?? "") === String(productId);
      const sameSize = (it.size ?? "") === String(currentLabel);
      const sameColor = normalizeColor(it.color) === wantColor || normalizeColor(it.selectedColor) === wantColor;
      return sameId && sameSize && sameColor;
    });
    return Number(found?.qty ?? 0);
  });

  const totalCartQty: number = useSelector((state: any) => {
    const items: any[] = state?.cart?.items ?? [];
    return items.reduce((sum, it) => sum + Number(it?.qty ?? 0), 0);
  });

  const handleClose = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    if (!opened) return;
    (async () => {
      try {
        await axiosInstance.get(API_GET_CART_DATA + productId);
      } catch (err) {
        console.error("Failed to fetch API_GET_CART_DATA:", err);
      }
    })();
  }, [opened, productId]);

  /** Send ONLY the current variant line with its ABSOLUTE qty (color optional) */
  const syncSingleVariant = (newQty: number) => {
    if (!productId || !currentLabel) return;

    const normColor = selectedColorNorm ? normalizeColor(selectedColorNorm) : undefined;

    dispatch<any>(
      addOrUpdateCartLine({
        productId: String(productId),
        size: String(currentLabel),
        color: normColor ?? "", // or null if your backend expects null
        qty: newQty,
        price,
        title: productTitle,
        image: headerImageUrl,
        imageUrl: headerImageUrl,
      })
    );
  };

  const reduxAddOne = () => {
    if (!productId || !currentLabel) return;

    const normColor = selectedColorNorm ? normalizeColor(selectedColorNorm) : undefined;

    if (currentQty > 0) {
      dispatch(
        increaseQty({
          id: String(productId),
          size: String(currentLabel),
          selectedColor: normColor ?? "",
          silent: true,
        } as any)
      );
      syncSingleVariant(currentQty + 1);
    } else {
      dispatch(
        addToCart({
          id: String(productId),
          title: productTitle,
          image: headerImageUrl,
          price,
          qty: 1,
          size: String(currentLabel),
          selectedColor: normColor ?? "", // keep consistent with slice
          displayColor: selectedColorRaw ?? "",
          silent: true,
        } as any)
      );
      syncSingleVariant(1);
    }

    setAddedClicked(true);

    const [b, c] =
      mode === "Brassiere" && band && cup ? [band, cup] : mode === "Panties" ? [0, pantySize ?? ""] : [0, ""];
    onConfirm({
      band: b as number,
      cup: String(c),
      label: String(currentLabel),
      quantity: currentQty + 1,
      selectedColor: selectedColorRaw, // may be undefined
    });
  };

  const reduxRemoveOne = () => {
    if (!productId || !currentLabel) return;
    if (currentQty <= 0) return;

    const normColor = selectedColorNorm ? normalizeColor(selectedColorNorm) : undefined;

    dispatch(
      decreaseQty({
        id: String(productId),
        size: String(currentLabel),
        selectedColor: normColor ?? "",
        silent: true,
      } as any)
    );

    const newQty = Math.max(0, currentQty - 1);
    syncSingleVariant(newQty);

    const [b, c] =
      mode === "Brassiere" && band && cup ? [band, cup] : mode === "Panties" ? [0, pantySize ?? ""] : [0, ""];
    onConfirm({
      band: b as number,
      cup: String(c),
      label: String(currentLabel),
      quantity: newQty,
      selectedColor: selectedColorRaw,
    });
  };

  const confirmSize = () => reduxAddOne();
  const reduceSize = () => {
    if (currentQty <= 0) return;
    reduxRemoveOne();
  };

  const canCheckout = totalCartQty > 0 || addedClicked;

  const handleCheckout = () => {
    if (!canCheckout) return;
    navigate("/checkout");
    handleClose();
  };

  const renderSwatch = (c: string, idx: number) => {
    const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(String(c));
    const norm = normalizeColor(c);
    const active = selectedColorNorm === norm;

    return (
      <Tooltip key={idx} label={c}>
        <button
          onClick={() => {
            setSelectedColorNorm(norm); // normalized for matching
            setSelectedColorRaw(c); // raw for images/UI
          }}
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
      {/* header */}
      <div className="flex gap-3 mb-3">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          <img src={headerImageUrl} alt={productTitle} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium line-clamp-2">{productTitle}</div>
          <div className="mt-1 text-lg font-semibold">₹{price}</div>
          <div className="mt-1 text-xs text-gray-500">
            {mode === "Brassiere" ? "Select size (e.g. 30A)" : "Select panty size (hip measurement)"}
          </div>
        </div>
      </div>

      {/* colors */}
      {Array.isArray(colors) && colors.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text size="sm" fw={600} mb={6}>
            Colors
          </Text>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
            {colors.map((c, idx) => renderSwatch(c, idx))}
          </div>
        </div>
      )}

      {/* Brassiere sizes grid */}
      {mode === "Brassiere" && (
        <div className="mt-2">
          <div className="text-sm font-semibold mb-2">SIZES</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
              gap: 8,
              maxHeight: 260,
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
                  styles={{
                    root: {
                      backgroundColor: active ? "#92b775" : "transparent",
                      color: active ? "#fff" : DARK_GREEN,
                      borderColor: DARK_GREEN,
                      "&:hover": {
                        backgroundColor: "#92b775",
                        color: "#fff",
                      },
                    },
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
          <div
            style={{ maxHeight: 220, overflowY: "auto", paddingRight: 6, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
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
            <Text size="sm" fw={600}>
              Selected
            </Text>
            <Text size="sm">
              {currentLabel} {selectedColorRaw ? <span className="text-gray-600">({selectedColorRaw})</span> : null}
            </Text>
          </div>

          <div className="mt-3 w-full">
            {currentQty <= 0 ? (
              <div style={{ width: "100%" }}>
                <Button fullWidth onClick={confirmSize} style={{ background: "#96BD75", color: "#fff", borderRadius: 999 }}>
                  Add to cart
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ActionIcon onClick={reduceSize} title="Decrease" variant="light" size="lg">
                    <IconMinus size={16} />
                  </ActionIcon>

                  <div style={{ minWidth: 52, textAlign: "center" }}>
                    <Text size="sm" fw={700}>
                      {currentQty}
                    </Text>
                    <Text size="xs" c="dimmed">
                      in cart
                    </Text>
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
                  <Text size="xs" c="dimmed">
                    Tap + to add one more of this variant
                  </Text>
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
          style={{ flex: 1, borderRadius: 999,color: LIGHT_GREEN,borderColor:LIGHT_GREEN }}
        >
          Continue shopping
        </Button>

        <Button
          onClick={handleCheckout}
          style={{ flex: 1, background: canCheckout ? "#96BD75" : "#b9cf9f", color: "#fff", borderRadius: 999 }}
          disabled={!canCheckout}
          title={!canCheckout ? "Add at least 1 item to proceed" : "Go to checkout"}
        >
          Go to checkout
        </Button>
      </div>
    </Drawer>
  );
}