import {
  Button,
  Divider,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useState } from "react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");

  const handleLogin = () => {
    // Mock OTP logic
    login({ mobile });
    navigate("/");
  };

  return (
    <Paper maw={400} mx="auto" mt={80} p="md" radius="md" withBorder>
      <Stack align="center">
        <Text fz="xl" fw={500}>
          Sign in
        </Text>
        <TextInput
          placeholder="Enter Mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.currentTarget.value)}
        />
        <Button fullWidth color="darkGreen.6" onClick={handleLogin}>
          Get OTP
        </Button>

        <Divider label="Or" labelPosition="center" />

        <Button fullWidth variant="outline" color="gray">
          Sign in with Google
        </Button>
        <Button fullWidth variant="outline" color="blue">
          Sign in with Facebook
        </Button>
      </Stack>
    </Paper>
  );
};

export default Login;
