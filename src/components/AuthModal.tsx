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
  Tabs,
  PinInput,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import ToImpressLogo from "../../src/assets/svg/ToImpressLogo.svg";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/authSlice"; // ✅ corrected import
import { LOGIN } from "../api/api.ts";
import { useAuth } from "../assets/hooks/useAuth";

const AuthModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // LOGIN STATES
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // SIGNUP STATES
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [profileStep, setProfileStep] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // 🔹 Handle Login
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
        const { user, tokens } = data;
        localStorage.setItem("token", tokens.access.token);
        dispatch(login({ user, tokens }));
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

  // 🔹 Handle Sign Up / OTP Flow
  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      setError("Enter a valid mobile number");
      return;
    }
    setOtpSent(true);
    setError(null);
    // TODO: call backend API to send OTP
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setError("Enter the OTP");
      return;
    }
    setProfileStep(true);
    setError(null);
    // TODO: verify OTP with backend
  };

  const handleCreateProfile = () => {
    if (!profileName || !profileEmail) {
      setError("Enter your name and email");
      return;
    }
    setError(null);

    // TODO: Call API to create user profile with mobile, profileName, profileEmail
    alert("Profile created successfully 🎉");
    navigate("/");
  };

  return (
    <Container size="xs" px="md" py={isMobile ? 40 : 80}>
      <Stack align="center" gap="lg">
        <Image src={ToImpressLogo} alt="To Impress Logo" w={160} />

        <Paper
          shadow="xl"
          p="xl"
          radius="lg"
          w="100%"
          sx={{
            maxWidth: 480,
            width: "100%",
            background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(v) => setActiveTab(v as "login" | "signup")}
            variant="pills"
            radius="xl"
            defaultValue="login"
          >
            <Tabs.List grow>
              <Tabs.Tab value="login">Login</Tabs.Tab>
              <Tabs.Tab value="signup">Sign Up</Tabs.Tab>
            </Tabs.List>

            {/* LOGIN TAB */}
            <Tabs.Panel value="login" pt="md">
              <Stack>
                <TextInput
                  placeholder="Enter Email"
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
                <Button
                  w="100%"
                  radius="xl"
                  size="md"
                  onClick={handleLogin}
                  loading={loading}
                  styles={{
                    root: {
                      background:
                        "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
                      color: "white",
                      fontWeight: 600,
                    },
                  }}
                >
                  Login
                </Button>
              </Stack>
            </Tabs.Panel>

            {/* SIGN UP TAB */}
            <Tabs.Panel value="signup" pt="md">
              {!otpSent ? (
                <Stack>
                  <TextInput
                    placeholder="Enter Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.currentTarget.value)}
                    radius="xl"
                    size="md"
                  />
                  <Button
                    radius="xl"
                    size="md"
                    onClick={handleSendOtp}
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
                        color: "white",
                        fontWeight: 600,
                      },
                    }}
                  >
                    Send OTP
                  </Button>
                </Stack>
              ) : !profileStep ? (
                <Stack align="center">
                  <Text ta="center">Enter the OTP sent to {mobile}</Text>
                  <PinInput
                    length={4}
                    value={otp}
                    onChange={setOtp}
                    radius="xl"
                    size="lg"
                  />
                  <Button
                    radius="xl"
                    size="md"
                    onClick={handleVerifyOtp}
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
                        color: "white",
                        fontWeight: 600,
                      },
                    }}
                  >
                    Verify OTP
                  </Button>
                </Stack>
              ) : (
                <Stack>
                  <TextInput
                    placeholder="Enter Full Name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.currentTarget.value)}
                    radius="xl"
                    size="md"
                  />
                  <TextInput
                    placeholder="Enter Email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.currentTarget.value)}
                    radius="xl"
                    size="md"
                  />
                  <Button
                    radius="xl"
                    size="md"
                    onClick={handleCreateProfile}
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
                        color: "white",
                        fontWeight: 600,
                      },
                    }}
                  >
                    Create Profile
                  </Button>
                </Stack>
              )}
              {error && (
                <Text c="red" size="sm" ta="center" mt="sm">
                  {error}
                </Text>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
};

export default AuthModal;