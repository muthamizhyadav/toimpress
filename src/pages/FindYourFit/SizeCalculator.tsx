import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Image,
} from "@mantine/core";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import Scale from "../../assets/svg/Scale.svg";
import BodySize from "../../assets/svg/BodySize.svg";

export default function SizeCalculator() {
  const [userType, setUserType] = useState("Adults");
  const [braBand, setBraBand] = useState("");
  const [braBust, setBraBust] = useState("");
  const [othersBand, setOthersBand] = useState("");
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Box w={isMobile ? "100%" : "50vw"} mx="auto" p="md">
      <Text align="center" fw={500} size="lg" mb="md">
        Calculate your size here
      </Text>

      <SegmentedControl
        fullWidth
        size="md"
        value={userType}
        onChange={setUserType}
        data={[
          { label: "Adults", value: "Adults" },
          { label: "Teens (<16 years)", value: "Teens" },
        ]}
        mb="xl"
      />

      <Stack gap="xs">
        <Text fw={600} size="sm">
          FOR BRAS
        </Text>
        <Group grow>
          <TextInput
            placeholder="Enter band size eg: 80 (cm)"
            value={braBand}
            onChange={(e) => setBraBand(e.currentTarget.value)}
          />
          <TextInput
            placeholder="Enter bust size eg: 95 (cm)"
            value={braBust}
            onChange={(e) => setBraBust(e.currentTarget.value)}
          />
        </Group>

        <Text fw={600} size="sm" mt="lg">
          FOR PANTY, NIGHTWEAR AND ALL OTHERS
        </Text>
        <TextInput
          placeholder="Enter band size eg: 80 (cm)"
          value={othersBand}
          onChange={(e) => setOthersBand(e.currentTarget.value)}
        />

        <Button fullWidth mt="md" radius="xl" color="green" size="md">
          Get my Size
        </Button>
      </Stack>

      <Box mt="xl" mb="xl">
        <Image
          src={Scale}
          alt="Measurement Scale"
          fit="contain"
          w="100%"
          h={40}
        />
      </Box>

      <Group
        align="start"
        wrap="nowrap"
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? "md" : "lg"}
      >
        <Image
          src={BodySize}
          alt="Body Measurement Guide"
          width={100}
          height={160}
          fit="contain"
          mr={isMobile ? 0 : "md"}
        />

        <Stack gap="xs" mt={isMobile ? "sm" : 0}>
          <Text size="sm">• Stand upright and breathe naturally.</Text>
          <Text size="sm">
            • Wrap the measuring tape around your torso, just below your bust.
          </Text>
          <Text size="sm">
            • Make sure the tape is snug—not too tight and not too loose.
          </Text>
          <Text size="sm">
            • Wrap the tape around the fullest part of your hips and buttocks.
          </Text>
          <Text size="sm">
            • Ensure the tape is level with the floor and fits comfortably.
          </Text>
          <Text size="sm">
            • Note the measurements in centimeters and enter them above.
          </Text>
        </Stack>
      </Group>
    </Box>
  );
}
