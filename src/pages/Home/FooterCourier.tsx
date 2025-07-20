import { Box, Group, Divider, Text, Stack, rem } from '@mantine/core';
import Exchange from '../../assets/svg/FastAndFree.tsx';
import Packaging from '../../assets/svg/Packaging.tsx'
import FastAndFree from '../../assets/svg/FastAndFree.tsx'


export default function FoodCourier() {
  return (
    <Box
      bg="white"
      p="xl"
      style={{
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Feature icon={<FastAndFree />} label="Fast & Free Delivery" />
        <Divider orientation="vertical" />
        <Feature icon={<Packaging />} label="Discreet Packaging" />
        <Divider orientation="vertical" />
        <Feature icon={<Exchange />} label="Easy Exchange" />
      </Group>
    </Box>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Stack align="center" gap={rem(4)}>
      {icon}
      <Text fw={500} size="sm" ta="center">
        {label}
      </Text>
    </Stack>
  );
}
