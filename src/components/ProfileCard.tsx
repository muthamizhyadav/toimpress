// src/components/ProfileCard.tsx
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
  IconLogout,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { saveAddress, logout } from "../redux/features/authSlice";
import { useState } from "react";
import axios from "axios";
import { UPDATE_PROFILE } from "../api/api";
import { persistor } from "../redux/store"; // used to purge persisted store

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

/**
 * axios instance with fixed baseURL and Authorization interceptor.
 */
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Could not attach auth token to request", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function ProfileCard() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // SELECTOR: read user and a flattened userAddress from either:
  //  - state.auth.userAddress (preferred, saved by saveAddress reducer)
  //  - or state.auth.user.address[0] (if API returned address inside user object)
  const { user, userAddress } = useSelector((state: RootState) => {
    const storeUser = state.auth.user as any;
    const storedUA = state.auth.userAddress as any; // may be object or null
    let flatUA = null;

    if (storedUA) {
      flatUA = Array.isArray(storedUA) ? storedUA[0] : storedUA;
    } else if (storeUser && Array.isArray(storeUser.address) && storeUser.address.length > 0) {
      flatUA = storeUser.address[0];
    }

    return { user: storeUser, userAddress: flatUA as Address | null };
  });

  console.debug("ProfileCard - user:", user, "userAddress:", userAddress);

  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    if (!userAddress) return;
    setForm({
      id: (userAddress as any).id || Date.now(),
      line1: (userAddress as any).line1 || (userAddress as any).street || "",
      line2: (userAddress as any).line2 || "",
      city: (userAddress as any).city || "",
      state: (userAddress as any).state || "",
      country: (userAddress as any).country || "India",
      pincode: (userAddress as any).pincode || (userAddress as any).zip || "",
      phone: (userAddress as any).phone || "",
      landmark: (userAddress as any).landmark || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!form.line1) newErrors.line1 = "Address Line 1 is required";
    if (!form.line2) newErrors.line2 = "Address Line 2 is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.pincode) newErrors.pincode = "Pincode is required";
    if (!form.phone) newErrors.phone = "Phone number is required";
    else if (form.phone.length !== 10) newErrors.phone = "Phone number must be 10 digits";
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      // get userId from auth user
      const userId =
        (user && ((user as any).id || (user as any)._id || (user as any).userId)) ||
        null;

      if (!userId) {
        console.warn("No user id found — saving address locally");
        // fallback: dispatch and localStorage so UI (and persistence) will reflect address
        dispatch(saveAddress(form));
        try {
          localStorage.setItem("userAddress", JSON.stringify(form));
        } catch {}
        setModalOpen(false);
        return;
      }

      const url = `${UPDATE_PROFILE}/${encodeURIComponent(userId)}/address`;
      const body = {
        address: {
          street: `${form.line1}${form.line2 ? " " + form.line2 : ""}`,
          city: form.city,
          state: form.state,
          zip: form.pincode,
          phone: form.phone,
          country: form.country,
          landmark: form.landmark || "",
          // include raw fields to help server mapping
          line1: form.line1,
          line2: form.line2,
          rawId: form.id,
        },
      };

      console.debug("Posting address:", url, body);

      const response = await axiosInstance.post(url, body);
      console.debug("Address save response:", response && response.data);

      if (response && response.status === 200) {
        const returned = response.data || {};

        // locate the returned address in common shapes
        let savedCandidate: any =
          returned.address ||
          returned.data?.address ||
          returned.savedAddress ||
          returned.savedAddresses ||
          returned.data ||
          null;

        if (!savedCandidate) {
          savedCandidate = body.address;
        }

        const normalizedFromServer = Array.isArray(savedCandidate) ? savedCandidate[0] : savedCandidate;

        const addressForStore: Address = {
          id:
            (normalizedFromServer && (normalizedFromServer.id || normalizedFromServer.rawId)) ||
            form.id ||
            Date.now(),
          line1:
            normalizedFromServer?.line1 ||
            normalizedFromServer?.street ||
            form.line1,
          line2: normalizedFromServer?.line2 || form.line2 || "",
          city: normalizedFromServer?.city || form.city,
          state: normalizedFromServer?.state || form.state,
          country: normalizedFromServer?.country || form.country,
          pincode:
            normalizedFromServer?.pincode ||
            normalizedFromServer?.zip ||
            form.pincode,
          phone: normalizedFromServer?.phone || form.phone,
          landmark:
            normalizedFromServer?.landmark ||
            form.landmark ||
            normalizedFromServer?.landmark_description ||
            "",
        };

        // Dispatch to redux (this will update state.auth.userAddress and persist via redux-persist)
        dispatch(saveAddress(addressForStore));

        // Also write to localStorage directly as a fallback
        try {
          localStorage.setItem("userAddress", JSON.stringify(addressForStore));
        } catch (e) {
          console.warn("Failed to write userAddress to localStorage directly", e);
        }

        console.info("Address saved and dispatched to store:", addressForStore);

        // update local form/UI and close modal
        setForm(addressForStore);
        setModalOpen(false);
      } else {
        const msg = (response && (response as any).data?.message) || "Failed to save address. Please try again.";
        setErrors({ ...errors, general: msg });
        console.error("Non-200 response saving address:", response);
      }
    } catch (err: any) {
      console.error("Save address error:", err);
      setErrors({
        ...errors,
        general: err?.response?.data?.message || err?.message || "Failed to save address. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    // dispatch logout to clear in-memory state + localStorage keys (user, token, etc.)
    dispatch(logout());

    // Purge persisted redux state (persist:root) to fully remove persisted auth & cart
    try {
      await persistor.purge();
      console.info("Persisted store purged.");
    } catch (e) {
      console.warn("Failed to purge persisted store", e);
      // as fallback, remove persisted key directly
      try {
        localStorage.removeItem("persist:root");
      } catch {}
    }

    // Extra safety: remove any leftover direct localStorage keys
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userAddress");
    } catch {}

    // No navigation here — your app should react to isAuthenticated === false and render AuthModal
  };

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" p={10} className="max-w-5xl mx-auto w-full">
        {/* LEFT: Profile Card */}
        <Card shadow="sm" radius="lg" padding="lg" withBorder>
          <Group spacing="lg" align="center">
            <ThemeIcon size={isMobile ? 80 : 100} radius="xl" variant="light" color="blue">
              <IconUser size={isMobile ? 40 : 60} />
            </ThemeIcon>

            <Stack spacing="xs" style={{ flex: 1 }}>
              <Text size="xl" fw={600}>
                {user?.name || "User"}
              </Text>
              <Text size="sm" c="dimmed">
                {user?.email || "No email available"}
              </Text>
              <Button size="xs" color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                Logout
              </Button>
            </Stack>
          </Group>
        </Card>

        {/* RIGHT: Address Card */}
        <Card shadow="sm" radius="lg" padding="lg" withBorder>
          <Group justify="space-between" mb="sm">
            <Text size="lg" fw={600}>
              Saved Address
            </Text>
            {userAddress ? (
              <Button size="xs" variant="subtle" leftSection={<IconPencil size={14} />} onClick={openEdit}>
                Edit
              </Button>
            ) : null}
          </Group>

          {userAddress ? (
            <Stack spacing="xs">
              <Group align="flex-start" spacing="sm">
                <ThemeIcon size={32} radius="xl" variant="light" color="green">
                  <IconMapPin size={18} />
                </ThemeIcon>
                <Stack spacing={2}>
                  <Text fw={500}>Address</Text>
                  <Text size="sm" c="dimmed">
                    {userAddress.line1}, {userAddress.line2}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {userAddress.city}, {userAddress.state}, {userAddress.country} - {userAddress.pincode}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Phone: +91 {userAddress.phone}
                  </Text>
                  {userAddress.landmark && (
                    <Text size="sm" c="dimmed">
                      Landmark: {userAddress.landmark}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Stack>
          ) : (
            <Button fullWidth radius="xl" color="green" leftSection={<IconPlus size={16} />} onClick={openAdd}>
              Add New Address
            </Button>
          )}
        </Card>
      </SimpleGrid>

      {/* Add/Edit Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={userAddress ? "Edit Address" : "Add Address"} centered>
        <Stack>
          <TextInput label="Address Line 1" required value={form.line1} error={errors.line1} onChange={(e) => setForm({ ...form, line1: e.currentTarget.value })} />
          <TextInput label="Address Line 2" required value={form.line2} error={errors.line2} onChange={(e) => setForm({ ...form, line2: e.currentTarget.value })} />
          <Group grow>
            <TextInput label="City" required value={form.city} error={errors.city} onChange={(e) => setForm({ ...form, city: e.currentTarget.value })} />
            <TextInput label="State" required value={form.state} error={errors.state} onChange={(e) => setForm({ ...form, state: e.currentTarget.value })} />
          </Group>
          <Group grow>
            <TextInput label="Country" value={form.country} disabled />
            <TextInput label="Pincode" required value={form.pincode} error={errors.pincode} onChange={(e) => setForm({ ...form, pincode: e.currentTarget.value })} />
          </Group>

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

          <TextInput label="Landmark (optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.currentTarget.value })} />

          {errors.general && (
            <Text size="sm" color="red">
              {errors.general}
            </Text>
          )}

          <Button fullWidth color="green" mt="md" onClick={handleSave} loading={submitting}>
            Save Address
          </Button>
        </Stack>
      </Modal>
    </>
  );
}