import { Box, Button, Group, Text, TextInput, rem } from "@mantine/core";
import { IconMail } from "@tabler/icons-react";

export default function SubscriptionBanner() {
  return (
    <Box
      bg="#0D2F14"
      w="90%"
      mx="auto"
      py="lg"
      mb={"100px"}
      px="xl"
      style={{
        borderRadius: rem(100),
      }}
    >
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
          }}
        >
          <TextInput
            placeholder="Enter your email"
            leftSection={<IconMail size={16} />}
            variant="unstyled"
            styles={{
              input: {
                paddingLeft: rem(30),
                paddingRight: rem(8),
                width: rem(220),
              },
            }}
          />
          <Button
            radius="xl"
            color="lime"
            px="md"
            styles={{
              root: {
                fontWeight: 600,
              },
            }}
          >
            Sign In
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
