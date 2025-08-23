import { Box, Group, Divider, Text, Stack, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Exchange from '../../assets/svg/FastAndFree.tsx';
import Packaging from '../../assets/svg/Packaging.tsx';
import FastAndFree from '../../assets/svg/FastAndFree.tsx';

export default function FoodCourier() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const iconSize = isMobile ? 48 : 64;

  return (
    <Box
      bg="white"
      p="xl"
      style={{
        width: '90%',
        margin: '20px auto',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',

      }}
    >
      <Group
        justify="space-between"
        align="center"
        gap={isMobile ? 'lg' : 'xl'}
        wrap="nowrap"
      >
        <Feature icon={<FastAndFree />} label="Fast & Free Delivery" size={iconSize} isMobile={isMobile} />
        {!isMobile && <Divider orientation="vertical" />}
        {isMobile && <Divider />}
        <Feature icon={<Packaging />} label="Discreet Packaging" size={iconSize} isMobile={isMobile} />
        {!isMobile && <Divider orientation="vertical" />}
        {isMobile && <Divider />}
        <Feature icon={<Exchange />} label="Easy Exchange" size={iconSize} isMobile={isMobile} />
      </Group>
    </Box>
  );
}

function Feature({
  icon,
  label,
  size,
  isMobile,
}: {
  icon: React.ReactNode;
  label: string;
  size: number;
  isMobile: boolean;
}) {
  return (
    <Stack align="center" gap={rem(4)} w={isMobile ? '100%' : 'auto'}>
      <Box w={size} h={size} className="flex items-center justify-center">
        <Box className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block">
          {icon}
        </Box>
      </Box>
      <Text fw={500} size={isMobile ? 'xs' : 'sm'} ta="center">
        {label}
      </Text>
    </Stack>
  );
}
