import {
  Box,
  Text,
  Image,
  Select,
  Card,
  Divider,
  Badge,
  Group,
  Stack,
  SegmentedControl,
  Tabs,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import BodySize from "../../assets/svg/BodySize.svg";

// ---------------- BRA SIZE LOGIC ----------------
type CupLetter = "A" | "B" | "C" | "D";
type BandCol = {
  band: 28 | 30 | 32 | 34 | 36 | 38 | 40 | 42;
  underBust: [number, number]; // cm
  overBustByCup: Record<CupLetter, [number, number]>; // cm
};

const BAND_TABLE: BandCol[] = [
  { band: 28, underBust: [58, 62], overBustByCup: { A: [72, 74], B: [74, 76], C: [76, 78], D: [78, 80] } },
  { band: 30, underBust: [63, 67], overBustByCup: { A: [77, 79], B: [79, 81], C: [81, 83], D: [83, 85] } },
  { band: 32, underBust: [68, 72], overBustByCup: { A: [82, 84], B: [84, 86], C: [86, 88], D: [88, 90] } },
  { band: 34, underBust: [73, 77], overBustByCup: { A: [87, 89], B: [89, 91], C: [91, 93], D: [93, 95] } },
  { band: 36, underBust: [78, 82], overBustByCup: { A: [92, 94], B: [94, 96], C: [96, 98], D: [98, 100] } },
  { band: 38, underBust: [83, 87], overBustByCup: { A: [97, 99], B: [99, 101], C: [101, 103], D: [103, 105] } },
  { band: 40, underBust: [88, 92], overBustByCup: { A: [102, 104], B: [104, 106], C: [106, 108], D: [108, 110] } },
  { band: 42, underBust: [93, 97], overBustByCup: { A: [107, 109], B: [109, 111], C: [111, 113], D: [113, 115] } },
];

// small epsilon tolerance to avoid edge mismatches (in cm)
const EPS_CM = 0.05;

// helpers
const inRangeCm = (vCm: number, [lo, hi]: [number, number]) => vCm + EPS_CM >= lo && vCm - EPS_CM <= hi;
const inchToCm = (inch: number) => +(inch * 2.54).toFixed(1); // single multiplication, keep 1 decimal for clarity
const cmToIn = (cm: number) => +((cm / 2.54)).toFixed(1);

// ---------------- BRA SIZE TABLE (INCH) - from image reference ----------------
// underBust and over-bust ranges in inches (matching the screenshot table)
type BandColInch = {
  band: 28 | 30 | 32 | 34 | 36 | 38 | 40 | 42 | 44;
  underBustIn: [number, number]; // inches
  overBustByCupIn: Record<CupLetter, [number, number]>; // inches
};

const BAND_TABLE_INCH: BandColInch[] = [
  { band: 28, underBustIn: [23, 24], overBustByCupIn: { A: [28, 29], B: [29, 30], C: [30, 31], D: [31, 32] } },
  { band: 30, underBustIn: [25, 26], overBustByCupIn: { A: [30, 31], B: [31, 32], C: [32, 33], D: [33, 34] } },
  { band: 32, underBustIn: [27, 28], overBustByCupIn: { A: [32, 33], B: [33, 34], C: [34, 35], D: [35, 36] } },
  { band: 34, underBustIn: [29, 30], overBustByCupIn: { A: [34, 35], B: [35, 36], C: [36, 37], D: [37, 38] } },
  { band: 36, underBustIn: [31, 32], overBustByCupIn: { A: [36, 37], B: [37, 38], C: [38, 39], D: [39, 40] } },
  { band: 38, underBustIn: [33, 34], overBustByCupIn: { A: [38, 39], B: [39, 40], C: [40, 41], D: [41, 42] } },
  { band: 40, underBustIn: [35, 36], overBustByCupIn: { A: [40, 41], B: [41, 42], C: [42, 43], D: [43, 44] } },
  { band: 42, underBustIn: [37, 38], overBustByCupIn: { A: [42, 43], B: [43, 44], C: [44, 45], D: [45, 46] } },
  // <-- ADDED band 44 so 39-40" under-bust maps to band 44
  { band: 44, underBustIn: [39, 40], overBustByCupIn: { A: [44, 45], B: [45, 46], C: [46, 47], D: [47, 48] } },
];

// small epsilon tolerance for inches
const EPS_IN = 0.02;
const inRangeIn = (vIn: number, [lo, hi]: [number, number]) => vIn + EPS_IN >= lo && vIn - EPS_IN <= hi;

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

export default function SizeCalculator() {
  const [tab, setTab] = useState<"bra" | "panties">("bra");
  // default can be "inch" or "cm" — set "inch" if you prefer the UI to start in inches
  const [unit, setUnit] = useState<"cm" | "inch">("inch");
  const [underBust, setUnderBust] = useState<string>(""); // stores selected string (like "32" if inch mode)
  const [overBust, setOverBust] = useState<string>("");
  const [hip, setHip] = useState<string>("");

  const isMobile = useMediaQuery("(max-width: 640px)");

  // build selects depending on unit
  const { underOptions, overOptions, hipOptions } = useMemo(() => {
    if (unit === "inch") {
      // integer inch ranges (no decimals)
      const under = Array.from({ length: 40 - 25 + 1 }, (_, i) => {
        const v = 25 + i;
        return { value: `${v}`, label: `${v}` };
      });
      const over = Array.from({ length: 49 - 30 + 1 }, (_, i) => {
        const v = 30 + i;
        return { value: `${v}`, label: `${v}` };
      });
      // hip: convert 75..149 cm to inches, but present integer inches for selection (approx)
      const hipInMin = Math.floor(cmToIn(75));
      const hipInMax = Math.ceil(cmToIn(149));
      const hipArr = Array.from({ length: hipInMax - hipInMin + 1 }, (_, i) => {
        const v = hipInMin + i;
        return { value: `${v}`, label: `${v}` };
      });
      return { underOptions: under, overOptions: over, hipOptions: hipArr };
    }

    // cm mode (integer cm values as before)
    const underCmMin = 58, underCmMax = 97;
    const overCmMin = 72, overCmMax = 115;
    const under = Array.from({ length: underCmMax - underCmMin + 1 }, (_, i) => {
      const v = underCmMin + i;
      return { value: `${v}`, label: `${v}` };
    });
    const over = Array.from({ length: overCmMax - overCmMin + 1 }, (_, i) => {
      const v = overCmMin + i;
      return { value: `${v}`, label: `${v}` };
    });
    const hipArr = Array.from({ length: 149 - 75 + 1 }, (_, i) => {
      const v = 75 + i;
      return { value: `${v}`, label: `${v}` };
    });
    return { underOptions: under, overOptions: over, hipOptions: hipArr };
  }, [unit]);

  // compute bra result:
  // When unit === "inch": match directly to BAND_TABLE_INCH (inches)
  // When unit === "cm": original behavior (match BAND_TABLE in cm)
  const braResult = useMemo(() => {
    if (!underBust || !overBust) return null;

    if (unit === "inch") {
      const underIn = parseFloat(underBust); // integer inches
      const overIn = parseFloat(overBust);

      const bandCol = BAND_TABLE_INCH.find((b) => inRangeIn(underIn, b.underBustIn));
      if (!bandCol) return { label: "—", note: "Under-bust out of chart range" };

      const cup = (Object.keys(bandCol.overBustByCupIn) as CupLetter[]).find((c) =>
        inRangeIn(overIn, bandCol.overBustByCupIn[c])
      ) ?? null;

      if (!cup) return { label: `${bandCol.band}`, note: "Over-bust out of chart range" };
      return { label: `${bandCol.band}${cup}`, note: null as string | null };
    }

    // CM mode: keep existing behavior (match BAND_TABLE which is in cm)
    let underCm: number;
    let overCm: number;

    if (unit === "inch") {
      // unreachable because handled above, but keep pattern
      underCm = inchToCm(parseFloat(underBust));
      overCm = inchToCm(parseFloat(overBust));
    } else {
      underCm = parseFloat(underBust);
      overCm = parseFloat(overBust);
    }

    const bandCol = BAND_TABLE.find((b) => inRangeCm(underCm, b.underBust));
    if (!bandCol) return { label: "—", note: "Under-bust out of chart range" };

    const cup = (Object.keys(bandCol.overBustByCup) as CupLetter[]).find((c) =>
      inRangeCm(overCm, bandCol.overBustByCup[c])
    ) ?? null;

    if (!cup) return { label: `${bandCol.band}`, note: "Over-bust out of chart range" };
    return { label: `${bandCol.band}${cup}`, note: null as string | null };
  }, [underBust, overBust, unit]);

  // panty result: if inch mode we convert simple multiplication or compare approximate integer inch against converted ranges
  const pantyResult = useMemo(() => {
    if (!hip) return null;
    if (unit === "inch") {
      const hipIn = parseFloat(hip);
      const hipCm = inchToCm(hipIn);
      const found = PANTY_SIZES.find((s) => inRangeCm(hipCm, s.hip));
      return found ? found.label : "—";
    }
    const hipCm = parseFloat(hip);
    const found = PANTY_SIZES.find((s) => inRangeCm(hipCm, s.hip));
    return found ? found.label : "—";
  }, [hip, unit]);

  return (
    <Box w={isMobile ? "100%" : "70vw"} mx="auto" p="md">
      <Text ta="center" fw={600} size="lg" mb="xs">
        Size Calculator
      </Text>

      <Tabs
        value={tab}
        onChange={(v) => {
          setTab(v as "bra" | "panties");
          setUnderBust("");
          setOverBust("");
          setHip("");
        }}
      >
        <Tabs.List grow mb="md">
          <Tabs.Tab
            value="bra"
            style={{
              backgroundColor: tab === "bra" ? "#96BD75" : "transparent",
              color: tab === "bra" ? "white" : "black",
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Bra Size
          </Tabs.Tab>
          <Tabs.Tab
            value="panties"
            style={{
              backgroundColor: tab === "panties" ? "#96BD75" : "transparent",
              color: tab === "panties" ? "white" : "black",
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
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
                setUnderBust("");
                setOverBust("");
                setHip("");
              }}
              data={[
                { label: "INCH", value: "inch" },
                { label: "CM", value: "cm" },
              ]}
            />
          </Group>

          <Group align="stretch" wrap={isMobile ? "wrap" : "nowrap"} gap="lg" mb="md">
            <Box
              w={isMobile ? "100%" : "50%"}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Image src={BodySize} alt="Body Measurement Guide" w="100%" h={isMobile ? 240 : 380} fit="contain" />
            </Box>

            <Box w={isMobile ? "100%" : "50%"} style={{ display: "flex", flexDirection: "column" }}>
              <Stack gap="md">
                <Stack gap={6}>
                  <Text fw={600} size="sm">Under-Bust ({unit})</Text>
                  <Select
                    key={`under-${unit}`}
                    placeholder={`Select (${unit})`}
                    data={underOptions}
                    value={underBust}
                    onChange={(v) => setUnderBust(v || "")}
                    searchable
                  />
                </Stack>

                <Stack gap={6}>
                  <Text fw={600} size="sm">Over-Bust ({unit})</Text>
                  <Select
                    key={`over-${unit}`}
                    placeholder={`Select (${unit})`}
                    data={overOptions}
                    value={overBust}
                    onChange={(v) => setOverBust(v || "")}
                    searchable
                  />
                </Stack>
              </Stack>

              <Box mt="sm" ta="center">
                {underBust && overBust ? (
                  <>
                    <Text fw={700} size="sm">YOUR BRA SIZE IS</Text>
                    <Text fz={36} fw={900} c="red">{braResult?.label ?? "—"}</Text>
                    {braResult?.note && <Text size="xs" c="dimmed">{braResult.note}</Text>}
                    <Text size="xs" c="dimmed" mt="6px">
                      {unit === "inch"
                        ? `Selected: ${underBust} in under — ${overBust} in over`
                        : `Selected: ${underBust} cm under — ${overBust} cm over`}
                    </Text>
                  </>
                ) : (
                  <Text size="sm" c="dimmed">Select both values to see your size</Text>
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
                      {(["A", "B", "C", "D"] as CupLetter[]).map((cup) => {
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
                      {(["A", "B", "C", "D"] as CupLetter[]).map((cup) => (
                        <Card key={cup} p="xs" radius="sm" withBorder><Text fw={700} size="sm">{cup}</Text></Card>
                      ))}
                    </Stack>
                  </Box>

                  <Group gap="xs" align="start">
                    {BAND_TABLE.map((b) => (
                      <Stack key={b.band} gap={8}>
                        {(["A", "B", "C", "D"] as CupLetter[]).map((cup) => {
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
                setHip("");
              }}
              data={[
                { label: "INCH", value: "inch" },
                { label: "CM", value: "cm" },
              ]}
            />
          </Group>

          <Stack gap="md" align="center">
            <Text fw={600} size="sm">Hip Measurement ({unit})</Text>
            <Select
              key={`hip-${unit}`}
              placeholder={`Select hip size (${unit})`}
              data={hipOptions}
              value={hip}
              onChange={(v) => setHip(v || "")}
              searchable
            />

            {hip && (
              <>
                <Text fw={700} size="sm">YOUR PANTY SIZE IS</Text>
                <Text fz={36} fw={900} c="red">{pantyResult}</Text>
              </>
            )}
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