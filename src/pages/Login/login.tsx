// Login.tsx
import {
  Button,
  Paper,
  Stack,
  Text,
  Image,
  TextInput,
  Container,
  Box,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useDispatch } from "react-redux";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

import { LOGIN } from "../../api/api.ts";
import axiosInstance from "../../api/axiosInstance.ts";
// import ToImpressLogo from "../../assets/svg/ToImpressLogo.svg";
// import { login } from "../../store/authSlice"; // <-- ensure you have your login action imported

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleLogin = async () => {
    // simple front-end validation
    if (!username.trim() || !password.trim()) {
      showNotification({
        title: "Missing credentials",
        message: "Please enter both username and password.",
        color: "red",
        icon: <IconX size={18} />,
        autoClose: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      const body = { username, password };

      const response = await axiosInstance.post(LOGIN, body);

      if (response && response.status === 200) {
        const { user, token } = response.data;


        showNotification({
          title: "Login successful",
          message: `Welcome ${user?.name ?? user?.username ?? ""}`,
          color: "green",
          icon: <IconCheck size={18} />,
          autoClose: 3000,
        });

        navigate("/");
      } else {
        showNotification({
          title: "Invalid credentials",
          message: "Username or password is incorrect. Please try again.",
          color: "red",
          icon: <IconX size={18} />,
          autoClose: 4000,
        });
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ?? "Something went wrong. Please try again later.";

      showNotification({
        title: "Login failed",
        message: apiMessage,
        color: "red",
        icon: <IconX size={18} />,
        autoClose: 5000,
      });

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" px="md" py={isMobile ? 40 : 80}>
      <Stack align="center">
        {/* <Box>
          <Image src={ToImpressLogo} alt="To Impress Logo" />
        </Box> */}
        <Paper
          p="xl"
          radius="lg"
          w="100%"
          sx={{
            maxWidth: 480,
            width: "100%",
          }}
        >
          <Stack>
            <Text ta="center" fw={600} size="xl">
              Sign in
            </Text>

            <TextInput
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              radius="xl"
              size="md"
            />

            <TextInput
              placeholder="Enter Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              radius="xl"
              size="md"
            />

            <Stack w="100%" align="center">
              <Button
                w="80%"
                radius="xl"
                size="md"
                onClick={handleLogin}
                loading={loading}
                styles={{
                  root: {
                    backgroundColor: "#88B066",
                    color: "white",
                  },
                }}
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Login;