import {
  Button,
  Divider,
  Paper,
  Stack,
  Text,
  Image,
  TextInput,
  Container,
  Box,
  Group,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import ToImpressLogo from "../../assets/svg/ToImpressLogo.svg";
import GoogleLogo from "../../assets/svg/GoogleLogo.tsx";
import FacebookLogo from "../../assets/svg/FacebookLogo.tsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleLogin = () => {
    login({ mobile });
    navigate("/");
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
        >
          <Stack>
            <Text ta="center" fw={600} size="xl">
              Sign in
            </Text>

            <TextInput
              placeholder="Enter Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.currentTarget.value)}
              radius="xl"
              size="md"
            />
            <Stack w="100%" align="center">
              <Button
                w="80%"
                radius="xl"
                size="md"
                onClick={handleLogin}
                styles={{
                  root: {
                    backgroundColor: "#88B066",
                    color: "white",
                  },
                }}
              >
                Get OTP
              </Button>
            </Stack>
            <Divider label="Or" labelPosition="center" />
            <Group grow>
              <Button
                leftSection={<GoogleLogo />}
                variant="default"
                radius="xl"
                size="md"
                fullWidth
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // light shadow
                  backgroundColor: "#fff", // make sure shadow is visible
                  border: "none !important"
                }}
              >
                Sign In
              </Button>
              <Button
                leftSection={<FacebookLogo />}
                variant="default"
                radius="xl"
                size="md"
                color="blue"
                fullWidth
                style={{
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#fff",
                  border: "none !important"
                }}
              >
                Sign In
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Login;
