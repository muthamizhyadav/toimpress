// src/components/AuthModal.tsx
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
import ToImpressLogo from "../../src/assets/svg/ToImpressLogo.svg";
import { useDispatch } from "react-redux";
import { login } from "../redux/store.ts";
import { LOGIN } from "../api/api.ts";
import { useAuth } from "../assets/hooks/useAuth";


const AuthModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();


  const isMobile = useMediaQuery("(max-width: 768px)");

const handleLogin = async () => {
  setError(null);
  setLoading(true);

  try {
    const response = await fetch(LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const { user, tokens } = data; // <- adjust based on backend response

      // ⚠️ if your backend returns `tokens.access` or `token`, extract it
      const token = tokens?.access || tokens?.token || tokens;

      dispatch(login({ user, token })); // match slice
      navigate("/");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  } catch (err) {
    setError("Something went wrong. Please try again later.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <Container size="xs" px="md" py={isMobile ? 40 : 80}>
      <Stack align="center">
        <Box>
          <Image src={ToImpressLogo} alt="To Impress Logo" />
        </Box>
        <Paper
          p="xl"
          radius="lg"
          w="100%"
          sx={{
            maxWidth: 480,
            width: "100%",
          }}
          style={{ marginTop: "-20px" }}
        >
          <Stack   >

            <TextInput
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              radius="xl"
              size="md"
              style={{ margin: "-30px 0px 10px 0px"  }}
            />

            <TextInput
              placeholder="Enter Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              radius="xl"
              size="md"
              style={{ margin: "10px 0px"  }}
            />

            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}

            <Stack w="100%" align="center" style={{ marginTop: "20px"  }} >
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

export default AuthModal;
