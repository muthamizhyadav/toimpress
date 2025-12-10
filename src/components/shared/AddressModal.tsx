import {
  Modal,
  TextInput,
  Button,
  Stack,
  Text,
  Group,
  Textarea,
} from "@mantine/core";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveAddress } from "../../redux/features/authSlice";
import { showNotification } from "@mantine/notifications";
import { RootState } from "../../redux/store";
import { UPDATE_PROFILE } from "../../api/api";
import axiosInstance from "../../api/axiosInstance";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AddressModal({ opened, onClose }: Props) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.mobile || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");

  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    if (!name || !phone || !street || !city || !state || !zip) {
      showNotification({
        title: "Missing details",
        message: "Please fill all required fields.",
        color: "red",
      });
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateFields()) return;

    setLoading(true);

    const addressObj = {
      name,
      email,
      phone,
      street,
      city,
      state,
      zip,
      country: "India",
      landmark: "",
      line1: line1,
      line2: line2,
      rawId: Date.now(),
    };
    const url = `${UPDATE_PROFILE}/${encodeURIComponent(user.id)}/address`;
    const response = await axiosInstance.post(url, { address: addressObj });
    if (response.data) {
      dispatch(saveAddress(response.data.address));
      showNotification({
        title: "Address Saved",
        message: "Your address has been updated successfully!",
        color: "green",
      });
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title="Add Delivery Address"
      radius="sm"
      padding="md"
      size={"xl"}
    >
      <Stack spacing="sm">
        <Text size="sm" fw={600}>
          Full Name *
        </Text>
        <TextInput
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Text size="sm" fw={600}>
          Email
        </Text>
        <TextInput
          placeholder="Enter email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Text size="sm" fw={600}>
          Phone Number *
        </Text>
        <TextInput
          placeholder="10-digit phone"
          value={phone}
          maxLength={10}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
        />

        <Text size="sm" fw={600}>
          Full Address *
        </Text>
        <Textarea
          placeholder="House No / Apartment, Road Name, Locality, Landmark, City, Pincode"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          autosize
          minRows={4}
          maxRows={4}
        />

        <Group grow>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={600}>
              City *
            </Text>
            <TextInput
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <Text size="sm" fw={600}>
              State *
            </Text>
            <TextInput
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </Group>
        {/* <Group grow>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={600}>
              address line 1
            </Text>
            <TextInput
              placeholder="address line 1"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <Text size="sm" fw={600}>
              address line 2
            </Text>
            <TextInput
              placeholder="address line 2"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
            />
          </div>
        </Group> */}

        <Text size="sm" fw={600}>
          PIN / ZIP Code *
        </Text>
        <TextInput
          placeholder="6-digit PIN"
          value={zip}
          maxLength={6}
          onChange={(e) =>
            setZip(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
        />

        <Button
          radius="md"
          fullWidth
          loading={loading}
          onClick={handleSaveAddress}
          style={{
            background: "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Save Address
        </Button>
      </Stack>
    </Modal>
  );
}
