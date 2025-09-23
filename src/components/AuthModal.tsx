// src/components/AuthModal.tsx
import {
  Button,
  Paper,
  Stack,
  Text,
  Image,
  TextInput,
  Container,
  Tabs,
  PinInput,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import ToImpressLogo from "../../src/assets/svg/ToImpressLogo.svg";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/authSlice";
import axios from "axios";
import { GET_OTP, VERIFY_OTP } from "../api/api.ts";
import { useAuth } from "../assets/hooks/useAuth";

const RESEND_DELAY_SECONDS = 30;

const AuthModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  // allow switching between login & signup panels if you want
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // OTP / Mobile states (used for both login & signup)
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [profileStep, setProfileStep] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [resendTimer, setResendTimer] = useState<number>(0);
  const resendIntervalRef = useRef<number | null>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // helper: sanitize numeric input and optionally limit length
  const onlyDigits = (value: string, maxLen?: number) => {
    const digits = value.replace(/\D/g, "");
    return typeof maxLen === "number" ? digits.slice(0, maxLen) : digits;
  };

  // starts or restarts the resend countdown
  const startResendCountdown = (seconds = RESEND_DELAY_SECONDS) => {
    // clear any existing interval
    if (resendIntervalRef.current) {
      window.clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }
    setResendTimer(seconds);
    resendIntervalRef.current = window.setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          // clear interval when reach 0
          if (resendIntervalRef.current) {
            window.clearInterval(resendIntervalRef.current);
            resendIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (resendIntervalRef.current) {
        window.clearInterval(resendIntervalRef.current);
        resendIntervalRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async () => {
    setError(null);
    const sanitized = onlyDigits(mobile);
    // require exactly 10 digits for mobile
    if (!sanitized || sanitized.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      showNotification({
        title: "Invalid mobile",
        message: "Please enter a valid 10-digit mobile number.",
        color: "red",
      });
      return;
    }

    try {
      setSendingOtp(true);
      // payload: { mobile: "8124732811" } as requested
      const resp = await axios.post(GET_OTP, { mobile: sanitized });

      // If response is 200 treat as success; check for autogent and otp in resp.data
      if (resp.status === 200) {
        const data = resp.data || {};
        setOtpSent(true);
        setError(null);
        setMobile(sanitized);

        // start 30s resend countdown
        startResendCountdown(RESEND_DELAY_SECONDS);

        showNotification({
          title: "OTP sent",
          message: `OTP has been sent to ${sanitized}`,
          color: "green",
        });

        if (
          data.autogent === true &&
          (typeof data.otp === "string" || typeof data.otp === "number") &&
          String(data.otp).trim() !== ""
        ) {
          // sanitize OTP just in case and limit to 6 digits
          setOtp(onlyDigits(String(data.otp), 6));
          showNotification({
            title: "OTP auto-filled",
            message: "OTP was provided by server and auto-filled.",
            color: "green",
          });
        } else {
          // clear previous OTP if any (ensures fresh entry)
          setOtp("");
        }
      } else {
        setError("Failed to send OTP. Please try again.");
        showNotification({
          title: "Failed to send OTP",
          message: "Please try again later.",
          color: "red",
        });
      }
    } catch (err: any) {
      console.error("Send OTP error:", err);
      const msg =
        err?.response?.data?.message ||
        "Unable to send OTP. Please try again later.";
      setError(msg);
      showNotification({
        title: "Send OTP error",
        message: msg,
        color: "red",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    const sanitizedOtp = onlyDigits(otp);
    if (!sanitizedOtp || sanitizedOtp.length !== 6) {
      setError("Enter the 6-digit numeric OTP");
      showNotification({
        title: "Invalid OTP",
        message: "Please enter the 6-digit numeric OTP.",
        color: "red",
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      // payload: { mobile: "8124732811", otp: "799048" } as requested
      const resp = await axios.post(VERIFY_OTP, {
        mobile: onlyDigits(mobile),
        otp: sanitizedOtp,
      });

      if (resp.status === 200) {
        const data = resp.data;
        // If this is sign-up flow, show profile step instead of auto-login (based on activeTab)
        if (activeTab === "signup" && !profileStep) {
          // Move to profile creation step (you might want to use server response to prefill)
          setProfileStep(true);
          setError(null);
          showNotification({
            title: "OTP verified",
            message: "OTP verified. Please complete your profile.",
            color: "green",
          });
          return;
        }

        // For login flow (or after signup verify + profile created), log the user in if server returns tokens
        const { user, tokens } = data || {};
        if (tokens?.access?.token) {
          localStorage.setItem("token", tokens.access.token);
          dispatch(login({ user, tokens }));
          showNotification({
            title: "Logged in",
            message: "You have been logged in successfully.",
            color: "green",
          });
          navigate("/");
        } else {
          // If server doesn't return tokens, still consider OTP verified and let user proceed
          showNotification({
            title: "OTP verified",
            message: "OTP verified successfully.",
            color: "green",
          });
          navigate("/");
        }
      } else {
        setError("OTP verification failed. Please try again.");
        showNotification({
          title: "Verification failed",
          message: "OTP verification failed. Please try again.",
          color: "red",
        });
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      const msg =
        err?.response?.data?.message || "OTP verification failed. Please try again.";
      setError(msg);
      showNotification({
        title: "Verify OTP error",
        message: msg,
        color: "red",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!profileName || !profileEmail) {
      setError("Enter your name and email");
      showNotification({
        title: "Missing details",
        message: "Please enter both name and email to continue.",
        color: "red",
      });
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // TODO: call your backend endpoint to create/update profile.
      // Example (uncomment & replace PROFILE_CREATE_ENDPOINT):
      // const resp = await axios.post(PROFILE_CREATE_ENDPOINT, {
      //   mobile: onlyDigits(mobile), name: profileName, email: profileEmail
      // });
      // const { user, tokens } = resp.data;
      // localStorage.setItem("token", tokens.access.token);
      // dispatch(login({ user, tokens }));

      showNotification({
        title: "Profile created",
        message: "Profile created successfully 🎉",
        color: "green",
      });
      // navigate after success
      navigate("/");
    } catch (err: any) {
      console.error("Create profile error:", err);
      const msg = err?.response?.data?.message || "Failed to create profile. Please try again.";
      setError(msg);
      showNotification({
        title: "Profile creation failed",
        message: msg,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const renderSendOtpBlock = () => (
    <Stack>
      <TextInput
        placeholder="Enter Mobile Number"
        value={mobile}
        onChange={(e) => {
          // allow only digits and limit to 10 chars
          setMobile(onlyDigits(e.currentTarget.value, 10));
        }}
        radius="xl"
        size="md"
        inputMode="numeric"
        maxLength={10}
      />
      <Button
        radius="xl"
        size="md"
        onClick={handleSendOtp}
        loading={sendingOtp}
        styles={{
          root: {
            background: "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
            color: "white",
            fontWeight: 600,
          },
        }}
      >
        Send OTP
      </Button>
    </Stack>
  );

  const renderOtpEntryBlock = () => (
    <Stack align="center" spacing="md" style={{ width: "100%" }}>
      <Text ta="center">Enter the 6-digit OTP sent to {mobile}</Text>

      <PinInput
        length={6}
        value={otp}
        onChange={(val) => {
          // ensure numeric only and max length 6
          setOtp(onlyDigits(val, 6));
        }}
        radius="xl"
        size="lg"
        inputMode="numeric"
      />

      <Group position="apart" style={{ width: "100%" }}>
        <Button
          radius="xl"
          size="md"
          onClick={handleVerifyOtp}
          loading={verifyingOtp}
          styles={{
            root: {
              background: "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
              color: "white",
              fontWeight: 600,
            },
          }}
        >
          Verify OTP
        </Button>

        {/* Resend button + timer */}
        <Button
          radius="xl"
          size="md"
          variant="subtle"
          onClick={handleSendOtp}
          disabled={sendingOtp || resendTimer > 0}
        >
          {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
        </Button>
      </Group>
    </Stack>
  );

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
            onChange={(val) => {
              // val can be string; cast to allowed union
              if (val === "login" || val === "signup") setActiveTab(val);
            }}
            variant="pills"
            radius="xl"
            defaultValue="login"
          >
            {/* Custom header instead of Tabs.List */}
            <Text
              ta="center"
              size="xl"
              fw={700}
              mb="md"
              sx={{
                background: "linear-gradient(135deg, #96BD75 0%, #659D50 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {activeTab === "signup" ? "Sign up with OTP" : "Login with OTP"}
            </Text>

            {/* LOGIN TAB - OTP based */}
            <Tabs.Panel value="login" pt="md">
              {!otpSent ? renderSendOtpBlock() : renderOtpEntryBlock()}

              {error && (
                <Text c="red" size="sm" ta="center" mt="sm">
                  {error}
                </Text>
              )}
            </Tabs.Panel>

            {/* SIGN UP TAB */}
            <Tabs.Panel value="signup" pt="md">
              {!otpSent ? (
                renderSendOtpBlock()
              ) : !profileStep ? (
                renderOtpEntryBlock()
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