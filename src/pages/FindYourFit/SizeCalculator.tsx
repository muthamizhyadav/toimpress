// src/components/SizeCalculator.tsx
import {
  Box,
  Text,
  Image,
  Card,
  Divider,
  Badge,
  Group,
  Stack,
  SegmentedControl,
  Tabs,
  NumberInput,
  Button,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import BodySize from "../../assets/svg/BodySize.svg";

// ---------------- BRA SIZE LOGIC ----------------
type CupLetter = "A" | "B" | "C" | "D" | "E" | "F";
type BandCol = {
  band: 28 | 30 | 32 | 34 | 36 | 38 | 40 | 42 | 44;
  underBust: [number, number]; // cm
  overBustByCup: Record<CupLetter, [number, number]>; // cm
};

// small epsilon tolerance to avoid edge mismatches (in cm)
const EPS_CM = 0.05;
const inRangeCm = (vCm: number, [lo, hi]: [number, number]) => vCm + EPS_CM >= lo && vCm - EPS_CM <= hi;
const inchToCm = (inch: number) => +(inch * 2.54).toFixed(1);
const cmToIn = (cm: number) => +((cm / 2.54)).toFixed(1);

// ---------------- BRA SIZE TABLE (INCH) - matches provided image ----------------
type BandColInch = {
  band: 28 | 30 | 32 | 34 | 36 | 38 | 40 | 42 | 44;
  underBustIn: [number, number]; // inches
  overBustByCupIn: Record<CupLetter, [number, number]>; // inches
};

const BAND_TABLE_INCH: BandColInch[] = [
  { band: 28, underBustIn: [23, 24], overBustByCupIn: {
      A: [28, 29], B: [29, 30], C: [30, 31], D: [31, 32], E: [32, 33], F: [33, 34]
    } },
  { band: 30, underBustIn: [25, 26], overBustByCupIn: {
      A: [30, 31], B: [31, 32], C: [32, 33], D: [33, 34], E: [34, 35], F: [35, 36]
    } },
  { band: 32, underBustIn: [27, 28], overBustByCupIn: {
      A: [32, 33], B: [33, 34], C: [34, 35], D: [35, 36], E: [36, 37], F: [37, 38]
    } },
  { band: 34, underBustIn: [29, 30], overBustByCupIn: {
      A: [34, 35], B: [35, 36], C: [36, 37], D: [37, 38], E: [38, 39], F: [39, 40]
    } },
  { band: 36, underBustIn: [31, 32], overBustByCupIn: {
      A: [36, 37], B: [37, 38], C: [38, 39], D: [39, 40], E: [40, 41], F: [41, 42]
    } },
  { band: 38, underBustIn: [33, 34], overBustByCupIn: {
      A: [38, 39], B: [39, 40], C: [40, 41], D: [41, 42], E: [42, 43], F: [43, 44]
    } },
  { band: 40, underBustIn: [35, 36], overBustByCupIn: {
      A: [40, 41], B: [41, 42], C: [42, 43], D: [43, 44], E: [44, 45], F: [45, 46]
    } },
  { band: 42, underBustIn: [37, 38], overBustByCupIn: {
      A: [42, 43], B: [43, 44], C: [44, 45], D: [45, 46], E: [46, 47], F: [47, 48]
    } },
  { band: 44, underBustIn: [39, 40], overBustByCupIn: {
      A: [44, 45], B: [45, 46], C: [46, 47], D: [47, 48], E: [48, 49], F: [49, 50]
    } },
];

const EPS_IN = 0.02;
const inRangeIn = (vIn: number, [lo, hi]: [number, number]) => vIn + EPS_IN >= lo && vIn - EPS_IN <= hi;

// ----------------- Build CM table by converting inches -> cm to keep both modes consistent ---------------
const BAND_TABLE: BandCol[] = BAND_TABLE_INCH.map((b) => ({
  band: b.band,
  underBust: [inchToCm(b.underBustIn[0]), inchToCm(b.underBustIn[1])],
  overBustByCup: {
    A: [inchToCm(b.overBustByCupIn.A[0]), inchToCm(b.overBustByCupIn.A[1])],
    B: [inchToCm(b.overBustByCupIn.B[0]), inchToCm(b.overBustByCupIn.B[1])],
    C: [inchToCm(b.overBustByCupIn.C[0]), inchToCm(b.overBustByCupIn.C[1])],
    D: [inchToCm(b.overBustByCupIn.D[0]), inchToCm(b.overBustByCupIn.D[1])],
    E: [inchToCm(b.overBustByCupIn.E[0]), inchToCm(b.overBustByCupIn.E[1])],
    F: [inchToCm(b.overBustByCupIn.F[0]), inchToCm(b.overBustByCupIn.F[1])],
  },
}));

// ---------------- PANTY SIZE LOGIC ----------------
const PANTY_SIZES = [
  { label: "XS", hip: [75, 82] },
  { label: "S", hip: [83, 89] },
  { label: "M", hip: [90, 97] },
  { label: "L", hip: [98, 104] },
  { label: "XL", hip: [105, 112] },
  { label: "2XL", hip: [113, 119] },
  { label: "3XL", hip: [120, 127] },
  { label: "4XL", hip: [128, 134] },
  { label: "5XL", hip: [135, 142] },
  { label: "6XL", hip: [143, 149] },
];

type SendPayload =
  | {
      type: "bra";
      unit: "inch" | "cm";
      underBust: number;
      overBust: number;
      result: { label: string; note?: string | null } | null;
    }
  | {
      type: "panties";
      unit: "inch" | "cm";
      hip: number;
      result: string | null;
    };

export default function SizeCalculator({ onSend }: { onSend?: (payload: SendPayload) => void }) {
  const [tab, setTab] = useState<"bra" | "panties">("bra");
  const [unit, setUnit] = useState<"cm" | "inch">("inch");
  const [underBust, setUnderBust] = useState<number | undefined>(undefined);
  const [overBust, setOverBust] = useState<number | undefined>(undefined);
  const [hip, setHip] = useState<number | undefined>(undefined);

  const isMobile = useMediaQuery("(max-width: 640px)");

  const underOptionsDisplay = useMemo(() => {
    if (unit === "inch") return `25–40 in`;
    return `58–102 cm`;
  }, [unit]);

  const overOptionsDisplay = useMemo(() => {
    if (unit === "inch") return `30–50 in`;
    return `${inchToCm(30)}–${inchToCm(50)} cm`;
  }, [unit]);

  const hipOptionsDisplay = useMemo(() => {
    if (unit === "inch") {
      return `${cmToIn(75)}–${cmToIn(149)} in (approx)`;
    }
    return `75–149 cm`;
  }, [unit]);

  // compute bra result:
 // compute bra result:
const braResult = useMemo(() => {
  if (underBust == null || overBust == null) return null;

  if (unit === "inch") {
    const underIn = underBust;
    const overIn = overBust;

    // find band matching under-bust
    let bandCol = BAND_TABLE_INCH.find((b) => inRangeIn(underIn, b.underBustIn));

    // fallback handling: if below smallest, default to 28A; if above largest, use last band
    const smallestBand = BAND_TABLE_INCH[0];
    const largestBand = BAND_TABLE_INCH[BAND_TABLE_INCH.length - 1];
    if (!bandCol) {
      const minUnder = smallestBand.underBustIn[0];
      const maxUnder = largestBand.underBustIn[1];
      if (underIn < minUnder) {
        return { label: `28A`, note: "Under-bust below chart — defaulted to 28A" };
      }
      if (underIn > maxUnder) {
        bandCol = largestBand;
      }
    }

    if (!bandCol) return { label: "—", note: "Under-bust out of chart range" };

    const cup =
      (["A", "B", "C", "D", "E", "F"] as CupLetter[]).find((c) =>
        inRangeIn(overIn, bandCol!.overBustByCupIn[c])
      ) ?? null;

    // ✅ if cup can't be determined, default to A (never return bare band)
    if (!cup) {
      return {
        label: `${bandCol.band}A`,
        note: "Over-bust out of chart range for band — defaulted to A cup",
      };
    }

    return { label: `${bandCol.band}${cup}`, note: null as string | null };
  }

  // CM mode
  const underCm = underBust;
  const overCm = overBust;

  const bandCol = BAND_TABLE.find((b) => inRangeCm(underCm, b.underBust));
  if (!bandCol) return { label: "—", note: "Under-bust out of chart range" };

  const cup =
    (["A", "B", "C", "D", "E", "F"] as CupLetter[]).find((c) =>
      inRangeCm(overCm, bandCol.overBustByCup[c])
    ) ?? null;

  // ✅ default to A cup when cup not found (never return bare band)
  if (!cup) {
    return {
      label: `${bandCol.band}A`,
      note: "Over-bust out of chart range for band — defaulted to A cup",
    };
  }

  return { label: `${bandCol.band}${cup}`, note: null as string | null };
}, [underBust, overBust, unit]);


  // panty result:
  const pantyResult = useMemo(() => {
    if (hip == null) return null;
    if (unit === "inch") {
      const hipIn = hip;
      const hipCm = inchToCm(hipIn);
      const found = PANTY_SIZES.find((s) => inRangeCm(hipCm, s.hip));
      return found ? found.label : "—";
    }
    const hipCm = hip;
    const found = PANTY_SIZES.find((s) => inRangeCm(hipCm, s.hip));
    return found ? found.label : "—";
  }, [hip, unit]);

  const handleSend = async () => {
    if (tab === "bra") {
      if (underBust == null || overBust == null) {
        alert("Please enter both under-bust and over-bust to send.");
        return;
      }
      const payload: SendPayload = { type: "bra", unit, underBust, overBust, result: braResult };
      if (typeof onSend === "function") {
        try { onSend(payload); } catch (e) { console.warn("onSend handler failed", e); }
      }
      const json = JSON.stringify(payload, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        alert("Size payload copied to clipboard — you can paste it in chat/email.");
      } catch {
        alert("Could not copy to clipboard — payload logged to console.");
      }
    } else {
      if (hip == null) {
        alert("Please enter hip measurement to send.");
        return;
      }
      const payload: SendPayload = { type: "panties", unit, hip, result: pantyResult };
      if (typeof onSend === "function") {
        try { onSend(payload); } catch (e) { console.warn("onSend handler failed", e); }
      }
      const json = JSON.stringify(payload, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        alert("Size payload copied to clipboard — you can paste it in chat/email.");
      } catch {
        alert("Could not copy to clipboard — payload logged to console.");
      }
    }
  };

  return (
    <Box w={isMobile ? "100%" : "70vw"} mx="auto" p="md">
      <Text ta="center" fw={600} size="lg" mb="xs">Size Calculator</Text>

      <Tabs
        value={tab}
        onChange={(v) => {
          setTab(v as "bra" | "panties");
          setUnderBust(undefined);
          setOverBust(undefined);
          setHip(undefined);
        }}
      >
        <Tabs.List grow mb="md">
          <Tabs.Tab value="bra" style={{ backgroundColor: tab === "bra" ? "#96BD75" : "transparent", color: tab === "bra" ? "white" : "black", fontWeight: 600, borderRadius: 8 }}>
            Bra Size
          </Tabs.Tab>
          <Tabs.Tab value="panties" style={{ backgroundColor: tab === "panties" ? "#96BD75" : "transparent", color: tab === "panties" ? "white" : "black", fontWeight: 600, borderRadius: 8 }}>
            Panty Size
          </Tabs.Tab>
        </Tabs.List>

        {/* BRA SIZE TAB */}
        <Tabs.Panel value="bra">
          <Group justify="center" mb="md" w="100%">
            <SegmentedControl
              fullWidth
              value={unit}
              onChange={(v) => {
                setUnit(v as "cm" | "inch");
                setUnderBust(undefined);
                setOverBust(undefined);
                setHip(undefined);
              }}
              data={[ { label: "INCH", value: "inch" }, { label: "CM", value: "cm" } ]}
            />
          </Group>

          <Group align="stretch" wrap={isMobile ? "wrap" : "nowrap"} gap="lg" mb="md">
            <Box w={isMobile ? "100%" : "50%"} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image src={BodySize} alt="Body Measurement Guide" w="100%" h={isMobile ? 240 : 380} fit="contain" />
            </Box>

            <Box w={isMobile ? "100%" : "50%"} style={{ display: "flex", flexDirection: "column" }}>
              <Stack gap="md">
                <Stack gap={6}>
                  <Text fw={600} size="sm">Under-Bust ({unit})</Text>
                  <NumberInput
                    placeholder={underOptionsDisplay}
                    value={underBust}
                    onChange={(v) => setUnderBust(v ?? undefined)}
                    min={0}
                    step={0.1}
                    precision={1}
                    parser={(value) => value?.replace(/[^\d.]/g, "") ?? ""}
                  />
                </Stack>

                <Stack gap={6}>
                  <Text fw={600} size="sm">Over-Bust ({unit})</Text>
                  <NumberInput
                    placeholder={overOptionsDisplay}
                    value={overBust}
                    onChange={(v) => setOverBust(v ?? undefined)}
                    min={0}
                    step={0.1}
                    precision={1}
                    parser={(value) => value?.replace(/[^\d.]/g, "") ?? ""}
                  />
                </Stack>
              </Stack>

              <Box mt="sm" ta="center">
                {underBust != null && overBust != null ? (
                  <>
                    <Text fw={700} size="sm">YOUR BRA SIZE IS</Text>
                    <Text fz={36} fw={900} c="red">{braResult?.label ?? "—"}</Text>
                    {braResult?.note && <Text size="xs" c="dimmed">{braResult.note}</Text>}
                    <Text size="xs" c="dimmed" mt="6px">
                      {unit === "inch"
                        ? `Entered: ${underBust} in under — ${overBust} in over`
                        : `Entered: ${underBust} cm under — ${overBust} cm over`}
                    </Text>
                    {/* <Button mt="md" fullWidth onClick={handleSend}>Send Size</Button> */}
                  </>
                ) : (
                  <Text size="sm" c="dimmed">Enter both values to see your size</Text>
                )}
              </Box>
            </Box>
          </Group>

          {/* Size Chart */}
          <Card withBorder radius="lg" mt="xl" p="lg">
            <Text fw={700} ta="center" mb="md" size="xl">Bra Size Chart ({unit.toUpperCase()})</Text>

            {isMobile ? (
              <Stack gap="md">
                {BAND_TABLE.map((b) => (
                  <Card key={b.band} withBorder radius="md" p="md">
                    <Text fw={700} size="md" mb="xs">Bra Size {b.band}</Text>
                    <Text size="sm" c="dimmed">
                      Under-bust: {unit === "cm" ? `${b.underBust[0]}–${b.underBust[1]} cm` : `${cmToIn(b.underBust[0])}–${cmToIn(b.underBust[1])} in`}
                    </Text>
                    <Divider my="xs" />
                    <Stack gap={4}>
                      {(["A","B","C","D","E","F"] as CupLetter[]).map((cup) => {
                        const [lo, hi] = b.overBustByCup[cup];
                        const isSelected = braResult && braResult.label.includes(String(b.band)) && braResult.label.endsWith(cup);
                        return (
                          <Group key={`${b.band}-${cup}`} justify="space-between" style={{
                            border: `2px solid ${isSelected ? "var(--mantine-color-red-6)" : "#ddd"}`,
                            borderRadius: 6,
                            padding: "4px 8px",
                          }}>
                            <Text size="sm" fw={500}>Cup {cup}</Text>
                            <Text size="sm">{unit === "cm" ? `${lo}–${hi} cm` : `${cmToIn(lo)}–${cmToIn(hi)} in`}</Text>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <>
                <Group gap="xs" wrap="nowrap" mb="xs" align="center">
                  <Box w={140}><Badge variant="light">Bra Size</Badge></Box>
                  <Group gap="xs" wrap="wrap">
                    {BAND_TABLE.map((b) => (
                      <Card key={b.band} p="xs" radius="sm" withBorder style={{ borderColor: braResult?.label.includes(String(b.band)) ? "var(--mantine-color-red-6)" : undefined }}>
                        <Text fw={700} size="sm">{b.band}</Text>
                      </Card>
                    ))}
                  </Group>
                </Group>

                <Divider my="sm" />

                <Group align="start" wrap="nowrap" gap="xs">
                  <Box w={140}>
                    <Stack gap={8}>
                      {(["A","B","C","D","E","F"] as CupLetter[]).map((cup) => (
                        <Card key={cup} p="xs" radius="sm" withBorder><Text fw={700} size="sm">{cup}</Text></Card>
                      ))}
                    </Stack>
                  </Box>

                  <Group gap="xs" align="start">
                    {BAND_TABLE.map((b) => (
                      <Stack key={b.band} gap={8}>
                        {(["A","B","C","D","E","F"] as CupLetter[]).map((cup) => {
                          const [lo, hi] = b.overBustByCup[cup];
                          const isSelected = braResult && braResult.label.includes(String(b.band)) && braResult.label.endsWith(cup);
                          return (
                            <Card key={`${b.band}-${cup}`} p="xs" radius="sm" withBorder style={{ border: `2px solid ${isSelected ? "var(--mantine-color-red-6)" : "#ddd"}` }}>
                              <Text size="sm">{unit === "cm" ? `${lo}–${hi}` : `${cmToIn(lo)}–${cmToIn(hi)}`}</Text>
                            </Card>
                          );
                        })}
                      </Stack>
                    ))}
                  </Group>
                </Group>
              </>
            )}
          </Card>
        </Tabs.Panel>

        {/* PANTY SIZE TAB */}
        <Tabs.Panel value="panties">
          <Group justify="center" mb="md" w="100%">
            <SegmentedControl
              fullWidth
              value={unit}
              onChange={(v) => {
                setUnit(v as "cm" | "inch");
                setHip(undefined);
              }}
              data={[
                { label: "INCH", value: "inch" },
                { label: "CM", value: "cm" },
              ]}
            />
          </Group>

          <Stack gap="md" align="center">
            <Text fw={600} size="sm">Hip Measurement ({unit})</Text>
            <NumberInput
              placeholder={hipOptionsDisplay}
              value={hip}
              onChange={(v) => setHip(v ?? undefined)}
              min={0}
              step={0.1}
              precision={1}
              style={{ width: isMobile ? "100%" : 200 }}
            />

            {hip != null ? (
              <>
                <Text fw={700} size="sm">YOUR PANTY SIZE IS</Text>
                <Text fz={36} fw={900} c="red">{pantyResult}</Text>
              </>
            ) : null}
          </Stack>

          <Card withBorder radius="lg" mt="xl" p="lg">
            <Text fw={700} ta="center" mb="md" size="xl">Panty Size Chart ({unit.toUpperCase()})</Text>
            <Stack gap="sm">
              {PANTY_SIZES.map((s) => (
                <Group key={s.label} justify="space-between" style={{
                  border: `2px solid ${pantyResult === s.label ? "var(--mantine-color-red-6)" : "#ddd"}`,
                  borderRadius: 6,
                  padding: "6px 12px",
                }}>
                  <Text fw={600}>{s.label}</Text>
                  <Text>{unit === "cm" ? `${s.hip[0]}–${s.hip[1]} cm` : `${cmToIn(s.hip[0])}–${cmToIn(s.hip[1])} in`}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}