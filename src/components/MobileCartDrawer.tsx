import {
  Drawer,
  Box,
  Text,
  Group,
  Stack,
  Button,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash, IconMinus, IconPlus } from "@tabler/icons-react";
import BraModel from "../../src/assets/svg/braModel.svg";


export function UseMobileCartDrawer() {
  const [opened, { open, close }] = useDisclosure(false);
  return { opened, open, close };
}

function CartItem() {
  return (
    <Box w="100%">
      <Group
        align="flex-start"
        position="apart"
        spacing="md"
        noWrap
        style={{ flexWrap: "nowrap" }}
      >
        {/* Product Image */}
        <Box
          w={70}
          h={90}
          style={{
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={BraModel}
            alt="Product"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        {/* Product Info */}
        <Stack spacing={4} sx={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} lineClamp={2}>
            Susie Multicolor Secret Side Shaper Basic Moulded Bra
          </Text>
          <Text size="xs" c="dimmed">
            Size : 34C
          </Text>
          <Group spacing="xs">
            <Text size="sm" fw={600}>
              ₹999
            </Text>
            <Text size="xs" c="dimmed" td="line-through">
              ₹1999
            </Text>
          </Group>
        </Stack>

        {/* Delete Icon */}
        <ActionIcon variant="subtle" color="gray" mt={4}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      {/* Quantity Control - below the row */}
      <Group mt="xs" position="right" spacing={0}>
        <Button
          variant="light"
          color="green"
          radius="xl"
          px="xs"
          size="xs"
          leftIcon={<IconMinus size={14} />}
          rightIcon={<IconPlus size={14} />}
        >
          1
        </Button>
      </Group>

      <Divider mt="sm" />
    </Box>
  );
}



export function MobileCartDrawer({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      padding="md"
      size="100%"
      transitionProps={{ transition: "slide-left", duration: 250 }}
    >
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <Text align="center" size="lg" fw={600} mb="lg">
          Your Cart
        </Text>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto space-y-6">
          <CartItem />
          <CartItem />
        </div>

        {/* Optional: Add checkout button at bottom */}
        <div className="mt-6">
          <Button fullWidth color="dark" radius="xl">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
