import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Image,
  Select,
  Card,
  Divider,
  Badge,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import Scale from "../../assets/svg/Scale.svg";
import BodySize from "../../assets/svg/BodySize.svg";

type CupLetter = "A" | "B" | "C" | "D";
type BandCol = {
  band: 28 | 30 | 32 | 34 | 36 | 38 | 40 | 42;
  underBust: [number, number];
  overBustByCup: Record<CupLetter, [number, number]>;
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

function inRange(v: number, [lo, hi]: [number, number]) { return v >= lo && v <= hi; }
function cmToIn(cm: number) { return cm / 2.54; }
function inToCm(inch: number) { return inch * 2.54; }

export default function SizeCalculator() {
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const [underBust, setUnderBust] = useState<string>("");
  const [overBust, setOverBust] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const { underOptions, overOptions } = useMemo(() => {
    const underMin = 58, underMax = 97;
    const overMin = 72, overMax = 115;
    const toLabel = (n: number) => (unit === "cm" ? `${n}` : cmToIn(n).toFixed(1));
    const under = Array.from({ length: underMax - underMin + 1 }, (_, i) => {
      const cm = underMin + i; return { value: unit === "cm" ? `${cm}` : toLabel(cm) };
    });
    const over = Array.from({ length: overMax - overMin + 1 }, (_, i) => {
      const cm = overMin + i; return { value: unit === "cm" ? `${cm}` : toLabel(cm) };
    });
    return {
      underOptions: under.map((o) => ({ value: o.value, label: o.value })),
      overOptions: over.map((o) => ({ value: o.value, label: o.value })),
    };
  }, [unit]);

  const underBustCm = useMemo(() => {
    if (!underBust) return null;
    const num = parseFloat(underBust);
    return unit === "cm" ? num : Math.round(inToCm(num));
  }, [underBust, unit]);

  const overBustCm = useMemo(() => {
    if (!overBust) return null;
    const num = parseFloat(overBust);
    return unit === "cm" ? num : Math.round(inToCm(num));
  }, [overBust, unit]);

  const result = useMemo(() => {
    if (underBustCm == null || overBustCm == null) return null;
    const col = BAND_TABLE.find((b) => inRange(underBustCm, b.underBust));
    if (!col) return { label: "—", note: "Under-bust out of chart range" };
    const cup =
      (Object.keys(col.overBustByCup) as CupLetter[]).find((c) =>
        inRange(overBustCm, col.overBustByCup[c])
      ) || null;
    if (!cup) return { label: `${col.band}`, note: "Over-bust out of chart range" };
    return { label: `${col.band}${cup}`, note: null as string | null };
  }, [underBustCm, overBustCm]);

  const handleUnitChange = (val: "cm" | "inch") => {
    if (val === unit) return;
    const to = val, from = unit;
    const convert = (v: string) => {
      if (!v) return v;
      const n = parseFloat(v);
      if (Number.isNaN(n)) return "";
      const converted = from === "cm" ? cmToIn(n) : inToCm(n);
      return to === "cm" ? `${Math.round(converted)}` : converted.toFixed(1);
    };
    setUnit(val);
    setUnderBust((u) => convert(u));
    setOverBust((o) => convert(o));
    setShowResult(false);
  };

  const onClear = () => {
    setUnderBust("");
    setOverBust("");
    setShowResult(false);
  };

  return (
    <Box w={isMobile ? "100%" : "70vw"} mx="auto" p="md">
      <Text ta="center" fw={600} size="lg" mb="xs">Calculate your size here</Text>

      <Group justify="center" mb="lg">
        <SegmentedControl
          value={unit}
          onChange={(v) => handleUnitChange(v as "cm" | "inch")}
          data={[{ label: "CM", value: "cm" }, { label: "INCH", value: "inch" }]}
          size="xs"
        />
      </Group>

      {/* Two-column layout */}
      <Group align="stretch" wrap={isMobile ? "wrap" : "nowrap"} gap="lg" mb="md">
        {/* LEFT: image */}
        <Box w={isMobile ? "100%" : "50%"} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Image src={BodySize} alt="Body Measurement Guide" w="100%" h={isMobile ? 240 : 380} fit="contain" />
        </Box>

        {/* RIGHT: inputs + footer pinned */}
        <Box w={isMobile ? "100%" : "50%"} style={{ display: "flex", flexDirection: "column" }}>
          <Stack gap="md" style={{ flex: 1 }}>
            <Stack gap={6}>
              <Text fw={600} size="sm">Under-Bust</Text>
              <Select
                placeholder={unit === "cm" ? "Select (cm)" : "Select (in)"}
                data={underOptions}
                value={underBust}
                onChange={(v) => { setUnderBust(v || ""); setShowResult(false); }}
                searchable
                nothingFoundMessage="No values"
              />
            </Stack>

            <Stack gap={6}>
              <Text fw={600} size="sm">Over-Bust</Text>
              <Select
                placeholder={unit === "cm" ? "Select (cm)" : "Select (in)"}
                data={overOptions}
                value={overBust}
                onChange={(v) => { setOverBust(v || ""); setShowResult(false); }}
                searchable
                nothingFoundMessage="No values"
              />
            </Stack>

            {/* scale (optional) */}
            {/* <Image src={Scale} alt="Measurement Scale" fit="contain" h={40} w="100%" /> */}
            <Box style={{ flex: 1 }} />
          </Stack>

          {/* FOOTER: buttons fixed position */}
          <Box>
            <Group justify="space-between" wrap="nowrap">
              <Button
                radius="xl"
                color="green"
                size="md"
                onClick={() => setShowResult(true)}
                disabled={!underBust || !overBust}
              >
                Get my Size
              </Button>

              {showResult && (
                <Button variant="outline" radius="xl" color="gray" size="md" onClick={onClear}>
                  Clear
                </Button>
              )}
            </Group>

            {/* Reserved area for result so button doesn’t move */}
            <Box mt="sm" mih={88} /* ~space for two lines */ ta="center">
              {showResult && (
                <>
                  <Text fw={700} size="sm">YOUR BRA SIZE IS</Text>
                  <Text fz={36} fw={900} c="red">{result?.label ?? "—"}</Text>
                  {result?.note && <Text size="xs" c="dimmed">{result.note}</Text>}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Group>

      {/* Size chart (unchanged) */}
      <Card withBorder radius="lg" mt="xl" p="lg">
        <Text fw={700} ta="center" mb="md" size="xl">Bra Size Chart</Text>

        <Group gap="xs" wrap="nowrap" mb="xs" align="center">
          <Box w={140}><Badge variant="light">Bra Size</Badge></Box>
          <Group gap="xs" wrap="wrap">
            {BAND_TABLE.map((b) => (
              <Card key={b.band} padding="xs" radius="sm" withBorder>
                <Text fw={700} size="sm">{b.band}</Text>
              </Card>
            ))}
          </Group>
        </Group>

        <Group gap="xs" wrap="nowrap" mb="xs" align="center">
          <Box w={140}><Text size="sm" c="dimmed">Under-bust (cm)</Text></Box>
          <Group gap="xs" wrap="wrap">
            {BAND_TABLE.map((b) => (
              <Card key={b.band} padding="xs" radius="sm" withBorder>
                <Text size="sm">{b.underBust[0]}–{b.underBust[1]}</Text>
              </Card>
            ))}
          </Group>
        </Group>

        <Divider my="sm" />

        <Group align="start" wrap="nowrap" gap="xs">
          <Box w={140}>
            <Stack gap={8}>
              {(["A", "B", "C", "D"] as CupLetter[]).map((cup) => (
                <Card key={cup} padding="xs" radius="sm" withBorder>
                  <Text fw={700} size="sm">{cup}</Text>
                </Card>
              ))}
            </Stack>
          </Box>

          <Group gap="xs" align="start">
            {BAND_TABLE.map((b) => (
              <Stack key={b.band} gap={8}>
                {(["A", "B", "C", "D"] as CupLetter[]).map((cup) => {
                  const [lo, hi] = b.overBustByCup[cup];
                  const isSelected =
                    (showResult && result && result.label.includes(String(b.band)) && result.label.endsWith(cup)) || false;
                  return (
                    <Card
                      key={`${b.band}-${cup}`}
                      padding="xs"
                      radius="sm"
                      withBorder
                      style={{ borderColor: isSelected ? "var(--mantine-color-red-6)" : undefined }}
                    >
                      <Text size="sm">{lo}–{hi}</Text>
                    </Card>
                  );
                })}
              </Stack>
            ))}
          </Group>
        </Group>
      </Card>
    </Box>
  );
}