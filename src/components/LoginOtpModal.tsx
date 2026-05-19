import { Modal, Button, Stack, TextInput, Text } from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import axiosInstance from "../api/axiosInstance";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/authSlice";
import { useAuth } from "../pages/AuthContext";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const SEND_OTP = "/users/login/request-otp";
const VERIFY_OTP = "/users/login/verify-otp";
const DARK_GREEN = "#133215";

type SendOtpRequest = { mobile: string };
type VerifyOtpRequest = { mobile: string; otp: string };

export default function LoginOtpModal({ opened, onClose }: Props) {
  const dispatch = useDispatch();
  const { login: authLogin } = useAuth();

  const [mobile, setMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const otpRefs = useRef<HTMLInputElement[]>([]);

  const otp = otpDigits.join("");

  // Timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const onlyDigits = (val: string, len = 10) =>
    val.replace(/\D/g, "").slice(0, len);

  const resetState = () => {
    setMobile("");
    setOtpDigits(["", "", "", "", "", ""]);
    setStep("mobile");
    setTimer(0);
  };

  const startTimer = () => setTimer(60);

  const sendOtp = async () => {
    const sanitized = onlyDigits(mobile);
    if (sanitized.length !== 10) {
      showNotification({
        title: "Invalid Mobile",
        message: "Enter valid 10-digit mobile number",
        color: "red",
        icon: <IconX size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const body: SendOtpRequest = { mobile: sanitized };
      const res = await axiosInstance.post(SEND_OTP, body);

      setMobile(sanitized);
      setStep("otp");
      startTimer();

      showNotification({
        title: "OTP Sent",
        message: "Check your mobile",
        color: "green",
        icon: <IconCheck size={18} />,
      });

      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (error: any) {
      showNotification({
        title: "Error",
        message: error?.response?.data?.message ?? "Try again",
        color: "red",
        icon: <IconX size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;

    setResendLoading(true);
    try {
      const res = await axiosInstance.post(SEND_OTP, { mobile });

      startTimer();
      showNotification({
        title: "OTP Resent",
        message: "New OTP sent to your mobile",
        color: "green",
        icon: <IconCheck size={18} />,
      });
    } catch {
      showNotification({
        title: "Error",
        message: "Try again",
        color: "red",
        icon: <IconX size={18} />,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      showNotification({
        title: "Invalid OTP",
        message: "Enter 6-digit OTP",
        color: "red",
        icon: <IconX size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const body: VerifyOtpRequest = { mobile, otp };
      const res = await axiosInstance.post(VERIFY_OTP, body);

      const { user, tokens } = res.data;
      const accessToken = tokens.access.token;

      console.log(accessToken, "accessToken otp login");

      localStorage.setItem("tokens", tokens.access.token);
      localStorage.setItem("token", tokens.access.token);
      localStorage.setItem("refreshToken", tokens.refresh.token);

      dispatch(login({ user, token: tokens.access.token }));
      authLogin(user, tokens);

      showNotification({
        title: "Login Successful",
        message: `Welcome ${user.name ?? ""}`,
        color: "green",
        icon: <IconCheck size={18} />,
      });

      resetState();
      onClose();
    } catch (error: any) {
      showNotification({
        title: "OTP Error",
        message: error?.response?.data?.message ?? "Try again",
        color: "red",
        icon: <IconX size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Modal opened={opened} onClose={onClose} centered radius="md" padding="lg">
      <Stack spacing="lg" className="items-center">
        <img src="/logo.png" alt="App Logo" width={140} className="mb-2" />

        {step === "mobile" && (
          <TextInput
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(onlyDigits(e.currentTarget.value))}
            radius="md"
            maxLength={10}
            type="tel"
            className="w-full"
          />
        )}

        {step === "otp" && (
          <>
            <div className="flex justify-center gap-3 w-full">
              {otpDigits.map((char, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el!)}
                  value={char}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  maxLength={1}
                  type="text"
                  inputMode="numeric"
                  className="w-11 h-12 sm:w-12 sm:h-14 border border-gray-400 rounded-lg text-center font-bold text-xl focus:border-green-700 outline-none"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              {timer > 0 ? (
                <Text size="sm" color="dimmed">
                  Resend OTP in {formatTime(timer)}
                </Text>
              ) : (
                <Button
                  variant="subtle"
                  size="sm"
                  loading={resendLoading}
                  onClick={resendOtp}
                  style={{ color: DARK_GREEN, background: "transparent" }}
                >
                  Resend OTP
                </Button>
              )}
            </div>
          </>
        )}

        <Button
          fullWidth
          radius="md"
          loading={loading}
          onClick={step === "mobile" ? sendOtp : verifyOtp}
          style={{ backgroundColor: DARK_GREEN }}
        >
          {step === "mobile" ? "Send OTP" : "Verify OTP"}
        </Button>
      </Stack>
    </Modal>
  );
}
