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
  IconRefresh, // add icon for refresh button
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { saveAddress, logout } from "../redux/features/authSlice";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UPDATE_PROFILE } from "../api/api";
import { persistor } from "../redux/store"; // used to purge persisted store
import { clearCart } from "../redux/features/cartSlice";

type Address = {
  id: number;
  name?: string;
  email?: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  landmark?: string;
};

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

  const { user, userAddress } = useSelector((state: RootState) => {
    const storeUser = state.auth.user as any;
    const storedUA = state.auth.userAddress as any;
    let flatUA = null;

    if (storedUA) {
      flatUA = Array.isArray(storedUA) ? storedUA[0] : storedUA;
    } else if (storeUser && Array.isArray(storeUser.address) && storeUser.address.length > 0) {
      flatUA = storeUser.address[0];
    }

    return { user: storeUser, userAddress: flatUA as Address | null };
  });

  const dispatch = useDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
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
    name: "",
    email: "",
  });

  const [displayName, setDisplayName] = useState<string>(userAddress?.name || user?.name || "User");
  const [displayEmail, setDisplayEmail] = useState<string>(userAddress?.email || user?.email || "No email available");

  useEffect(() => {
    setDisplayName(userAddress?.name || user?.name || "User");
    setDisplayEmail(userAddress?.email || user?.email || "No email available");
  }, [user, userAddress]);

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
      name: user?.name || "",
      email: user?.email || "",
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
      name: (userAddress as any).name || user?.name || "",
      email: (userAddress as any).email || user?.email || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
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
      const userId =
        (user && ((user as any).id || (user as any)._id || (user as any).userId)) ||
        null;

      if (!userId) {
        dispatch(saveAddress(form));
        try {
          localStorage.setItem("userAddress", JSON.stringify(form));
        } catch {}
        setDisplayName(form.name || "User");
        setDisplayEmail(form.email || "No email available");
        setModalOpen(false);
        return;
      }

      const url = `${UPDATE_PROFILE}/${encodeURIComponent(userId)}/address`;
      const body: any = {
        address: {
          name: form.name,
          email: form.email,
          street: `${form.line1}${form.line2 ? " " + form.line2 : ""}`,
          city: form.city,
          state: form.state,
          zip: form.pincode,
          phone: form.phone,
          country: form.country,
          landmark: form.landmark || "",
          line1: form.line1,
          line2: form.line2,
          rawId: form.id,
        },
      };

      const response = await axiosInstance.post(url, body);

      if (response && response.status === 200) {
        const returned = response.data || {};

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
          line1: normalizedFromServer?.line1 || normalizedFromServer?.street || form.line1,
          line2: normalizedFromServer?.line2 || form.line2 || "",
          city: normalizedFromServer?.city || form.city,
          state: normalizedFromServer?.state || form.state,
          country: normalizedFromServer?.country || form.country,
          pincode: normalizedFromServer?.pincode || normalizedFromServer?.zip || form.pincode,
          phone: normalizedFromServer?.phone || form.phone,
          landmark: normalizedFromServer?.landmark || form.landmark || normalizedFromServer?.landmark_description || "",
          name: normalizedFromServer?.name || form.name,
          email: normalizedFromServer?.email || form.email,
        };

        dispatch(saveAddress(addressForStore));

        try {
          localStorage.setItem("userAddress", JSON.stringify(addressForStore));
        } catch (e) {
          console.warn("Failed to write userAddress to localStorage", e);
        }

        setDisplayName(addressForStore.name || "User");
        setDisplayEmail(addressForStore.email || "No email available");
        setForm(addressForStore);
        setModalOpen(false);
      } else {
        const msg = (response && (response as any).data?.message) || "Failed to save address. Please try again.";
        setErrors({ ...errors, general: msg });
      }
    } catch (err: any) {
      setErrors({
        ...errors,
        general: err?.response?.data?.message || err?.message || "Failed to save address. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW: GET address endpoint integration and store to Redux ---
  const fetchAddress = useCallback(async () => {
    const userId =
      (user && ((user as any).id || (user as any)._id || (user as any).userId)) ||
      null;
    if (!userId) return;

    setLoadingAddress(true);
    try {
      // Example GET endpoint - reuses same base path you used for update.
      // Adjust path if your server uses a different route for fetching addresses.
      const url = `${UPDATE_PROFILE}/${encodeURIComponent(userId)}`;
      const res = await axiosInstance.get(url);

      if (res && (res.status === 200 || res.status === 204)) {
        const returned = res.data || {};

        // server may return address in multiple shapes
        let candidate: any =
          returned.address ||
          returned.data?.address ||
          returned.savedAddress ||
          returned.savedAddresses ||
          returned.data ||
          returned;

        // If candidate is an array, pick the first
        const normalized = Array.isArray(candidate) ? candidate[0] : candidate;

        if (normalized) {
          // Map to our Address shape, tolerating various field names
          const addressFromServer: Address = {
            id: normalized.id || normalized.rawId || Date.now(),
            name: normalized.name || normalized.fullname || normalized.customerName || (user?.name || ""),
            email: normalized.email || normalized.contactEmail || user?.email || "",
            line1: normalized.line1 || normalized.street || normalized.address_line1 || "",
            line2: normalized.line2 || normalized.address_line2 || normalized.street2 || "",
            city: normalized.city || normalized.town || "",
            state: normalized.state || normalized.region || "",
            country: normalized.country || "India",
            pincode: normalized.pincode || normalized.zip || normalized.postal || "",
            phone: normalized.phone || normalized.mobile || normalized.contact || "",
            landmark: normalized.landmark || normalized.landmark_description || "",
          };

          // Dispatch to redux and persist locally as fallback
          dispatch(saveAddress(addressFromServer));
          try {
            localStorage.setItem("userAddress", JSON.stringify(addressFromServer));
          } catch (e) {
            console.warn("Failed to persist address locally", e);
          }

          // update display
          setDisplayName(addressFromServer.name || user?.name || "User");
          setDisplayEmail(addressFromServer.email || user?.email || "No email available");
        }
      }
    } catch (err) {
      console.warn("Failed to fetch address", err);
    } finally {
      setLoadingAddress(false);
    }
  }, [user, dispatch]);

  // auto-fetch when user becomes available
  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  const handleLogout = async () => {
  // 1) Clear auth and cart state in Redux
  dispatch(logout());
  dispatch(clearCart());

  // 2) Purge persisted store (fallback: remove the persisted root)
  try {
    await persistor.purge();
  } catch (e:any) {
    try {
      localStorage.removeItem("persist:root");
    } catch {}
  }

  // 3) Remove tokens/user/address + any cart keys you use locally
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userAddress");

    // common cart keys (keep ones that apply in your app)
    localStorage.removeItem("cart");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cart_count");
  } catch {}
};


  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" p={10} className="max-w-5xl mx-auto w-full">
        <Card shadow="sm" radius="lg" padding="lg" withBorder>
          <Group spacing="lg" align="center">
            <ThemeIcon size={isMobile ? 80 : 100} radius="xl" variant="light" color="blue">
              <IconUser size={isMobile ? 40 : 60} />
            </ThemeIcon>

            <Stack spacing="xs" style={{ flex: 1 }}>
              <Text size="xl" fw={600}>
                {displayName}
              </Text>
              <Text size="sm" c="dimmed">
                {displayEmail}
              </Text>

              <Group spacing="xs">
                <Button size="xs" color="gray" leftSection={<IconRefresh size={14} />} onClick={fetchAddress} loading={loadingAddress}>
                  Refresh
                </Button>

                <Button size="xs" color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                  Logout
                </Button>
              </Group>
            </Stack>
          </Group>
        </Card>

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
                  <Text fw={500}>{userAddress.name}</Text>
                  <Text size="sm" c="dimmed">
                    {userAddress.email}
                  </Text>
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

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={userAddress ? "Edit Address" : "Add Address"} centered>
        <Stack>
          <TextInput label="Name" required value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} />
          <TextInput label="Email" required value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.currentTarget.value })} />

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