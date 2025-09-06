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
// import ToImpressLogo from "../../assets/svg/ToImpressLogo.svg";
import { useDispatch } from "react-redux";
import { LOGIN } from "../../api/api.ts";
import axiosInstance from "../../api/axiosInstance.ts";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const body = { username, password };

      const response = await axiosInstance.post(LOGIN, body);

      if (response && response.status === 200) {
        // Assuming API returns { user, token }
        const { user, token } = response.data;

        dispatch(login({ user, token }));
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

            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}

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