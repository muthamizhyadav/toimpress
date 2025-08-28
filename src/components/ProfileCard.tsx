import {
  Card,
  Text,
  Group,
  Button,
  Stack,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

export default function ProfileCard() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Card
      shadow="sm"
      radius="lg"
      padding="lg"
      withBorder
      className="max-w-2xl mx-auto w-full"
    >
      <Group
        spacing="lg"
        align="flex-start"
        direction={isMobile ? "column" : "row"}
      >
        {/* Common User Icon */}
        <ThemeIcon
          size={isMobile ? 100 : 120}
          radius="xl"
          variant="light"
          color="blue"
        >
          <IconUser size={isMobile ? 60 : 80} />
        </ThemeIcon>

        {/* Profile Info */}
        <Stack spacing="sm" style={{ flex: 1 }}>
          <Text size="xl" weight={600}>
            John Doe
          </Text>
          <Text size="sm" color="dimmed">
            johndoe@example.com
          </Text>
          <Text size="sm" color="dimmed">
            +91 98765 43210
          </Text>

          <Divider my="sm" />

          {/* Address Section */}
          <Stack spacing={4}>
            <Text size="sm" weight={500}>
              Shipping Address
            </Text>
            <Text size="sm" color="dimmed">
              123 MG Road, Indiranagar, Bengaluru, India - 560038
            </Text>
          </Stack>

          <Stack spacing={4} mt="sm">
            <Text size="sm" weight={500}>
              Billing Address
            </Text>
            <Text size="sm" color="dimmed">
              Same as shipping
            </Text>
          </Stack>

          <Divider my="sm" />

          {/* Actions */}
          <Group spacing="sm" wrap="wrap">
            <Button size="xs" variant="light" color="blue">
              Edit Profile
            </Button>
            <Button size="xs" variant="light" color="green">
              Manage Address
            </Button>
            <Button size="xs" variant="outline" color="red">
              Logout
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}
