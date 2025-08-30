import {
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  SimpleGrid,
  Button,
  Modal,
  TextInput,
} from "@mantine/core";
import {
  IconUser,
  IconMapPin,
  IconPencil,
  IconPlus,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useState } from "react";

type Address = {
  id: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  landmark?: string;
};

export default function ProfileCard() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useSelector((state: RootState) => state.auth);

  const [address, setAddress] = useState<Address | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState<Address>({
    id: Date.now(),
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    phone: "",
    landmark: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAdd = () => {
    setForm({
      id: Date.now(),
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      phone: "",
      landmark: "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!address) return;
    setForm(address);
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!form.line1) newErrors.line1 = "Address Line 1 is required";
    if (!form.line2) newErrors.line2 = "Address Line 2 is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.pincode) newErrors.pincode = "Pincode is required";
    if (!form.phone) newErrors.phone = "Phone number is required";
    else if (form.phone.length !== 10)
      newErrors.phone = "Phone number must be 10 digits";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setAddress(form);
    setModalOpen(false);
  };

  return (
    <>
      <SimpleGrid
        cols={{ base: 1, sm: 2 }} // 👈 base = mobile, sm = ≥640px
        spacing="lg"
        p={10}
        className="max-w-5xl mx-auto w-full"
      >
        {/* LEFT: Profile Card */}
        <Card shadow="sm" radius="lg" padding="lg" withBorder>
          <Group spacing="lg" align="center">
            <ThemeIcon
              size={isMobile ? 80 : 100}
              radius="xl"
              variant="light"
              color="blue"
            >
              <IconUser size={isMobile ? 40 : 60} />
            </ThemeIcon>

            <Stack spacing="xs" style={{ flex: 1 }}>
              <Text size="xl" fw={600}>
                {user?.name || "User"}
              </Text>
              <Text size="sm" c="dimmed">
                {user?.email || "No email available"}
              </Text>
            </Stack>
          </Group>
        </Card>

        {/* RIGHT: Address Card */}
        <Card shadow="sm" radius="lg" padding="lg" withBorder>
          <Group justify="space-between" mb="sm">
            <Text size="lg" fw={600}>
              Saved Address
            </Text>
            {address ? (
              <Button
                size="xs"
                variant="subtle"
                leftSection={<IconPencil size={14} />}
                onClick={openEdit}
              >
                Edit
              </Button>
            ) : null}
          </Group>

          {address ? (
            <Stack spacing="xs">
              <Group align="flex-start" spacing="sm">
                <ThemeIcon size={32} radius="xl" variant="light" color="green">
                  <IconMapPin size={18} />
                </ThemeIcon>
                <Stack spacing={2}>
                  <Text fw={500}>Address</Text>
                  <Text size="sm" c="dimmed">
                    {address.line1}, {address.line2}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {address.city}, {address.state}, {address.country} -{" "}
                    {address.pincode}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Phone: +91 {address.phone}
                  </Text>
                  {address.landmark && (
                    <Text size="sm" c="dimmed">
                      Landmark: {address.landmark}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Stack>
          ) : (
            <Button
              fullWidth
              radius="xl"
              color="green"
              leftSection={<IconPlus size={16} />}
              onClick={openAdd}
            >
              + Add New Address
            </Button>
          )}
        </Card>
      </SimpleGrid>

      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={address ? "Edit Address" : "Add Address"}
        centered
      >
        <Stack>
          <TextInput
            label="Address Line 1"
            required
            value={form.line1}
            error={errors.line1}
            onChange={(e) => setForm({ ...form, line1: e.currentTarget.value })}
          />
          <TextInput
            label="Address Line 2"
            required
            value={form.line2}
            error={errors.line2}
            onChange={(e) => setForm({ ...form, line2: e.currentTarget.value })}
          />
          <Group grow>
            <TextInput
              label="City"
              required
              value={form.city}
              error={errors.city}
              onChange={(e) => setForm({ ...form, city: e.currentTarget.value })}
            />
            <TextInput
              label="State"
              required
              value={form.state}
              error={errors.state}
              onChange={(e) => setForm({ ...form, state: e.currentTarget.value })}
            />
          </Group>
          <Group grow>
            <TextInput label="Country" value={form.country} disabled />
            <TextInput
              label="Pincode"
              required
              value={form.pincode}
              error={errors.pincode}
              onChange={(e) =>
                setForm({ ...form, pincode: e.currentTarget.value })
              }
            />
          </Group>

          {/* Phone field with +91 prefix */}
          <Group>
            <TextInput value="+91" disabled style={{ width: 70 }} />
            <TextInput
              label="Phone Number"
              required
              type="number"
              value={form.phone}
              error={errors.phone}
              onChange={(e) => {
                let val = e.currentTarget.value.replace(/\D/g, "");
                if (val.length > 10) val = val.slice(0, 10);
                setForm({ ...form, phone: val });
              }}
              style={{ flex: 1 }}
            />
          </Group>

          <TextInput
            label="Landmark (optional)"
            value={form.landmark}
            onChange={(e) =>
              setForm({ ...form, landmark: e.currentTarget.value })
            }
          />

          <Button fullWidth color="green" mt="md" onClick={handleSave}>
            Save Address
          </Button>
        </Stack>
      </Modal>
    </>
  );
}