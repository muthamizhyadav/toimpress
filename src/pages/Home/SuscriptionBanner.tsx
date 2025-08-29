import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { IconMail } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

export default function SubscriptionBanner() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box
      bg="#0D2F14"
      w="90%"
      mx="auto"
      px={isMobile ? "md" : "xl"}
      py={isMobile ? "md" : "lg"}
      my={isMobile ? rem(60) : rem(100)}
      style={{
        borderRadius: isMobile ? rem(24) : rem(100),
      }}
    >
      {isMobile ? (
        <Stack spacing="md" align="center">
          <Text c="white" size="sm" fw={600} ta="center">
            Sign Up & Enjoy Instant Discount Of ₹199
          </Text>

          <Group
            w="100%"
            wrap="nowrap"
            bg="white"
            p="xs"
            style={{
              borderRadius: rem(999),
            }}
          >
            {/* Email input expands, button stays to the right */}
            <TextInput
              type="email"
              placeholder="Email address"
              leftSection={<IconMail size={14} />}
              variant="unstyled"
              style={{ flex: 1 }}
              styles={{
                input: {
                  paddingLeft: rem(28),
                  paddingRight: rem(8),
                  fontSize: rem(12),
                  width: "100%",
                },
              }}
            />
            <Button
              radius="xl"
              color="lime"
              size="compact-sm"
              styles={{
                root: {
                  fontSize: rem(11),
                  fontWeight: 600,
                  height: rem(30),
                },
              }}
            >
              Sign In
            </Button>
          </Group>
        </Stack>
      ) : (
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <Text c="white" size="lg" fw={600}>
            Sign Up & Enjoy Instant Discount Of ₹199
          </Text>

          <Group
            wrap="nowrap"
            bg="white"
            p={4}
            style={{
              borderRadius: rem(999),
              alignItems: "center",
            }}
          >
            <TextInput
              type="email"
              placeholder="Enter your email"
              leftSection={<IconMail size={16} />}
              variant="unstyled"
              style={{ flex: 1 }}
              styles={{
                input: {
                  paddingLeft: rem(30),
                  paddingRight: rem(8),
                  width: "100%",
                },
              }}
            />
            <Button
              radius="xl"
              color="lime"
              size="compact-sm"
              px="sm"
              styles={{
                root: {
                  fontWeight: 600,
                  fontSize: rem(13),
                  height: rem(34),
                },
              }}
            >
              Sign In
            </Button>
          </Group>
        </Group>
      )}
    </Box>
  );
}