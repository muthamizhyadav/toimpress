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

const inRange = (v: number, [lo, hi]: [number, number]) => v >= lo && v <= hi;
const cmToIn = (cm: number) => +(cm / 2.54).toFixed(1);
const inToCm = (inch: number) => inch * 2.54;

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
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const [underBust, setUnderBust] = useState<string>("");
  const [overBust, setOverBust] = useState<string>("");
  const [hip, setHip] = useState<string>("");

  const isMobile = useMediaQuery("(max-width: 640px)");

  // Dropdown values for bra calc
  const { underOptions, overOptions } = useMemo(() => {
    const underMin = 58,
      underMax = 97;
    const overMin = 72,
      overMax = 115;
    const toLabel = (n: number) => (unit === "cm" ? `${n}` : cmToIn(n).toString());

    const under = Array.from({ length: underMax - underMin + 1 }, (_, i) => {
      const cm = underMin + i;
      return { value: toLabel(cm), label: toLabel(cm) };
    });

    const over = Array.from({ length: overMax - overMin + 1 }, (_, i) => {
      const cm = overMin + i;
      return { value: toLabel(cm), label: toLabel(cm) };
    });

    return { underOptions: under, overOptions: over };
  }, [unit]);

  // convert input back to cm
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

  const hipCm = useMemo(() => {
    if (!hip) return null;
    const num = parseFloat(hip);
    return unit === "cm" ? num : Math.round(inToCm(num));
  }, [hip, unit]);

  // calculate bra result
  const braResult = useMemo(() => {
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

  // calculate panty result
  const pantyResult = useMemo(() => {
    if (hipCm == null) return null;
    const size = PANTY_SIZES.find((s) => inRange(hipCm, s.hip));
    return size ? size.label : "—";
  }, [hipCm]);

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
              }}
              data={[
                { label: "CM", value: "cm" },
                { label: "INCH", value: "inch" },
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
                  <Text fw={600} size="sm">
                    Under-Bust ({unit})
                  </Text>
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
                  <Text fw={600} size="sm">
                    Over-Bust ({unit})
                  </Text>
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
                    <Text fw={700} size="sm">
                      YOUR BRA SIZE IS
                    </Text>
                    <Text fz={36} fw={900} c="red">
                      {braResult?.label ?? "—"}
                    </Text>
                    {braResult?.note && <Text size="xs" c="dimmed">{braResult.note}</Text>}
                  </>
                ) : (
                  <Text size="sm" c="dimmed">
                    Select both values to see your size
                  </Text>
                )}
              </Box>
            </Box>
          </Group>

          {/* Size Chart */}
          <Card withBorder radius="lg" mt="xl" p="lg">
            <Text fw={700} ta="center" mb="md" size="xl">
              Bra Size Chart ({unit.toUpperCase()})
            </Text>

            {isMobile ? (
              <Stack gap="md">
                {BAND_TABLE.map((b) => (
                  <Card key={b.band} withBorder radius="md" p="md">
                    <Text fw={700} size="md" mb="xs">
                      Bra Size {b.band}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Under-bust:{" "}
                      {unit === "cm"
                        ? `${b.underBust[0]}–${b.underBust[1]} cm`
                        : `${cmToIn(b.underBust[0])}–${cmToIn(b.underBust[1])} in`}
                    </Text>
                    <Divider my="xs" />
                    <Stack gap={4}>
                      {(["A", "B", "C", "D"] as CupLetter[]).map((cup) => {
                        const [lo, hi] = b.overBustByCup[cup];

                        const isSelected =
                          braResult &&
                          braResult.label.includes(String(b.band)) &&
                          braResult.label.endsWith(cup);

                        return (
                          <Group
                            key={`${b.band}-${cup}`}
                            justify="space-between"
                            style={{
                              border: `2px solid ${isSelected ? "var(--mantine-color-red-6)" : "#ddd"}`,
                              borderRadius: 6,
                              padding: "4px 8px",
                            }}
                          >
                            <Text size="sm" fw={500}>
                              Cup {cup}
                            </Text>
                            <Text size="sm">
                              {unit === "cm" ? `${lo}–${hi} cm` : `${cmToIn(lo)}–${cmToIn(hi)} in`}
                            </Text>
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
                  <Box w={140}>
                    <Badge variant="light">Bra Size</Badge>
                  </Box>
                  <Group gap="xs" wrap="wrap">
                    {BAND_TABLE.map((b) => (
                      <Card
                        key={b.band}
                        p="xs"
                        radius="sm"
                        withBorder
                        style={{
                          borderColor: braResult?.label.includes(String(b.band)) ? "var(--mantine-color-red-6)" : undefined,
                        }}
                      >
                        <Text fw={700} size="sm">
                          {b.band}
                        </Text>
                      </Card>
                    ))}
                  </Group>
                </Group>

                <Group gap="xs" wrap="nowrap" mb="xs" align="center">
                  <Box w={140}>
                    <Text size="sm" c="dimmed">
                      Under-bust ({unit})
                    </Text>
                  </Box>
                  <Group gap="xs" wrap="wrap">
                    {BAND_TABLE.map((b) => (
                      <Card
                        key={b.band}
                        p="xs"
                        radius="sm"
                        withBorder
                        style={{
                          borderColor: braResult?.label.includes(String(b.band)) ? "var(--mantine-color-red-6)" : undefined,
                        }}
                      >
                        <Text size="sm">
                          {unit === "cm"
                            ? `${b.underBust[0]}–${b.underBust[1]}`
                            : `${cmToIn(b.underBust[0])}–${cmToIn(b.underBust[1])}`}
                        </Text>
                      </Card>
                    ))}
                  </Group>
                </Group>

                <Divider my="sm" />

                <Group align="start" wrap="nowrap" gap="xs">
                  <Box w={140}>
                    <Stack gap={8}>
                      {(["A", "B", "C", "D"] as CupLetter[]).map((cup) => (
                        <Card key={cup} p="xs" radius="sm" withBorder>
                          <Text fw={700} size="sm">
                            {cup}
                          </Text>
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
                            braResult &&
                            braResult.label.includes(String(b.band)) &&
                            braResult.label.endsWith(cup);

                          return (
                            <Card
                              key={`${b.band}-${cup}`}
                              p="xs"
                              radius="sm"
                              withBorder
                              style={{
                                border: `2px solid ${isSelected ? "var(--mantine-color-red-6)" : "#ddd"}`,
                              }}
                            >
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
                { label: "CM", value: "cm" },
                { label: "INCH", value: "inch" },
              ]}
            />
          </Group>

          <Stack gap="md" align="center">
            <Text fw={600} size="sm">
              Hip Measurement ({unit})
            </Text>
            <Select
              key={`hip-${unit}`}
              placeholder={`Select hip size (${unit})`}
              data={Array.from({ length: 149 - 75 + 1 }, (_, i) => {
                const cm = 75 + i;
                const val = unit === "cm" ? cm.toString() : cmToIn(cm).toString();
                return { value: val, label: val };
              })}
              value={hip}
              onChange={(v) => setHip(v || "")}
              searchable
            />

            {hip && (
              <>
                <Text fw={700} size="sm">
                  YOUR PANTY SIZE IS
                </Text>
                <Text fz={36} fw={900} c="red">
                  {pantyResult}
                </Text>
              </>
            )}
          </Stack>

          <Card withBorder radius="lg" mt="xl" p="lg">
            <Text fw={700} ta="center" mb="md" size="xl">
              Panty Size Chart ({unit.toUpperCase()})
            </Text>
            <Stack gap="sm">
              {PANTY_SIZES.map((s) => (
                <Group
                  key={s.label}
                  justify="space-between"
                  style={{
                    border: `2px solid ${pantyResult === s.label ? "var(--mantine-color-red-6)" : "#ddd"}`,
                    borderRadius: 6,
                    padding: "6px 12px",
                  }}
                >
                  <Text fw={600}>{s.label}</Text>
                  <Text>
                    {unit === "cm" ? `${s.hip[0]}–${s.hip[1]} cm` : `${cmToIn(s.hip[0])}–${cmToIn(s.hip[1])} in`}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Tabs.Panel>


      </Tabs>
    </Box>
  );
}
