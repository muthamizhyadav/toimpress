import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Loader, Modal, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconSparkles, IconTicket, IconX } from "@tabler/icons-react";
import axiosInstance from "../api/axiosInstance";
import { API_LIVE_SPINNERS, API_SPINNERS } from "../api/api";
import { useAuth } from "../assets/hooks/useAuth";
import LoginOtpModal from "./LoginOtpModal";

const DARK_GREEN = "#122F15";
const MID_GREEN = "#1F6B33";
const LIGHT_GREEN = "#92B775";
const CREAM = "#F3E8D3";
const GOLD = "#FFD700";

type Segment = {
  label: string;
  rewardType: string;
  value?: string;
  minOrderAmount?: number;
  color?: string;
};

type Spinner = {
  id: string;
  name: string;
  description?: string;
  eventName?: string;
  maxSpinsPerUser?: number;
  segments: Segment[];
};

type SpinStatus = {
  spinner: Spinner;
  usedSpins: number;
  remainingSpins: number;
  canSpin: boolean;
  reason?: string;
  lastSpin: {
    segmentIndex: number;
    segmentLabel: string;
    rewardType: string;
    rewardValue: string;
    spunAt: string;
  } | null;
};

type SpinResult = {
  segment: Segment;
  segmentIndex: number;
  remainingSpins: number;
};

const SEGMENT_COLORS = [DARK_GREEN, LIGHT_GREEN, CREAM, MID_GREEN, GOLD, "#2E9E4F"];

const readableText = (hex?: string) => {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#FFFFFF";
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 155 ? DARK_GREEN : "#FFFFFF";
};

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const slicePath = (cx: number, cy: number, r: number, start: number, end: number) => {
  const p0 = polar(cx, cy, r, start);
  const p1 = polar(cx, cy, r, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`;
};

const wrapLabel = (label: string, maxChars = 15) => {
  const words = String(label || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    if (!line) {
      line = word;
    } else if (`${line} ${word}`.length <= maxChars) {
      line = `${line} ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 3);
};

const rewardDisplay = (segment?: Segment | null) => {
  if (!segment) return "";
  switch (segment.rewardType) {
    case "percent_discount":
      return `${segment.value || 0}% OFF`;
    case "flat_discount":
      return `₹${segment.value || 0} OFF`;
    case "free_shipping":
      return "FREE SHIPPING";
    case "coupon":
      return segment.value ? `COUPON ${segment.value}` : "COUPON";
    case "points":
      return `${segment.value || 0} POINTS`;
    case "threshold_discount":
      return `₹${segment.value || 0} OFF`;
    default:
      return segment.label;
  }
};

const offerHint = (segment?: Segment | null) => {
  if (segment?.minOrderAmount && segment.minOrderAmount > 0) {
    return `On orders above ₹${segment.minOrderAmount}`;
  }
  return "On your next order";
};

function Wheel({
  segments,
  size,
  rotation,
  animate,
}: {
  segments: Segment[];
  size: number;
  rotation: number;
  animate: boolean;
}) {
  const count = Math.max(segments.length, 1);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const step = 360 / count;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${GOLD}, ${DARK_GREEN}, ${GOLD}, ${DARK_GREEN}, ${GOLD})`,
          boxShadow: "0 18px 40px rgba(18,47,21,0.28)",
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${rotation}deg)`,
          transition: animate ? "transform 4.6s cubic-bezier(0.17, 0.85, 0.3, 1)" : "none",
        }}
      >
        <circle cx={cx} cy={cy} r={r + 8} fill={CREAM} />
        {segments.map((segment, index) => {
          const start = index * step;
          const end = (index + 1) * step;
          const mid = start + step / 2;
          const flipped = mid > 90 && mid < 270;
          const pos = polar(cx, cy, r * 0.65, mid);
          const color = segment.color || SEGMENT_COLORS[index % SEGMENT_COLORS.length];
          const lines = wrapLabel(segment.label);
          const lineHeight = Math.max(10, size * 0.036);
          const startY = pos.y - ((lines.length - 1) * lineHeight) / 2;

          return (
            <g key={`${segment.label}-${index}`}>
              <path
                d={slicePath(cx, cy, r, start, end)}
                fill={color}
                stroke={CREAM}
                strokeWidth="2.5"
              />
              <text
                x={pos.x}
                y={startY}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${flipped ? mid + 180 : mid} ${pos.x} ${startY})`}
                fill={readableText(color)}
                fontSize={size * 0.042}
                fontWeight={800}
                letterSpacing="0.2"
                style={{ pointerEvents: "none" }}
              >
                {lines.map((line, lineIndex) => (
                  <tspan key={line} x={pos.x} dy={lineIndex === 0 ? 0 : lineHeight}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
        {Array.from({ length: count * 2 }).map((_, index) => {
          const point = polar(cx, cy, r + 1, (index * 360) / (count * 2));
          return <circle key={index} cx={point.x} cy={point.y} r={size * 0.011} fill="#FFFFFF" opacity={0.9} />;
        })}
      </svg>

      {/* pointer */}
      <div
        className="absolute left-1/2 z-20 -translate-x-1/2"
        style={{
          top: -11,
          width: 0,
          height: 0,
          borderLeft: `${size * 0.038}px solid transparent`,
          borderRight: `${size * 0.038}px solid transparent`,
          borderTop: `${size * 0.07}px solid ${DARK_GREEN}`,
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.3))",
        }}
      />

      {/* center hub */}
      <div
        className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
        style={{
          width: size * 0.23,
          height: size * 0.23,
          background: CREAM,
          border: `4px solid ${DARK_GREEN}`,
          boxShadow: `0 0 0 4px ${GOLD}`,
        }}
      >
        <IconSparkles size={size * 0.055} color={DARK_GREEN} />
        <span
          className="font-black leading-none tracking-wide"
          style={{ color: DARK_GREEN, fontSize: Math.max(9, size * 0.045) }}
        >
          SPIN
        </span>
      </div>
    </div>
  );
}

const SpinWheelLauncher = () => {
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const wheelSize = isMobile ? 250 : 300;

  const [spinner, setSpinner] = useState<Spinner | null>(null);
  const [opened, setOpened] = useState(false);
  const [loginOpened, setLoginOpened] = useState(false);
  const [status, setStatus] = useState<SpinStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [confetti, setConfetti] = useState(false);

  const resultTimer = useRef<number | null>(null);
  const confettiTimer = useRef<number | null>(null);

  const segments = useMemo(() => spinner?.segments ?? [], [spinner]);

  const targetRotation = (index: number, current: number) => {
    const count = Math.max(segments.length, 1);
    const step = 360 / count;
    const mid = index * step + step / 2;
    const targetMod = (((360 - mid) % 360) + 360) % 360;
    const currentMod = ((current % 360) + 360) % 360;
    const delta = (((targetMod - currentMod) % 360) + 360) % 360;
    return current + 360 * 5 + delta;
  };

  // Load the live campaign from the backend. The launcher only appears when
  // the store actually has an active wheel.
  useEffect(() => {
    let alive = true;

    const loadSpinner = async () => {
      try {
        const response = await axiosInstance.get(API_LIVE_SPINNERS);
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
            ? response.data.results
            : [];
        if (!alive || !list.length) return;

        setSpinner(list[0]);
      } catch {
        // The wheel is a bonus feature - never break the page if it is offline.
      }
    };

    loadSpinner();

    return () => {
      alive = false;
    };
  }, []);

  // Load this customer's spin state whenever the modal opens or they log in.
  useEffect(() => {
    if (!opened || !spinner) return undefined;

    if (!isAuthenticated) {
      setStatus(null);
      return undefined;
    }

    let alive = true;
    setStatusLoading(true);

    axiosInstance
      .get(`${API_SPINNERS}/${spinner.id}/status`)
      .then((response) => {
        if (!alive) return;
        const data: SpinStatus = response.data;
        setStatus(data);

        if (data.lastSpin && Array.isArray(data.spinner?.segments) && data.spinner.segments.length) {
          setResult({
            segment: data.spinner.segments[data.lastSpin.segmentIndex] ?? {
              label: data.lastSpin.segmentLabel,
              rewardType: data.lastSpin.rewardType,
              value: data.lastSpin.rewardValue,
            },
            segmentIndex: data.lastSpin.segmentIndex,
            remainingSpins: data.remainingSpins,
          });
          setRotation(targetRotation(data.lastSpin.segmentIndex, 0));
        } else {
          setResult(null);
          setRotation(0);
        }
      })
      .catch(() => {
        // Leave the spin button enabled - the server still enforces the limit.
      })
      .finally(() => {
        if (alive) setStatusLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, spinner?.id, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (resultTimer.current) window.clearTimeout(resultTimer.current);
      if (confettiTimer.current) window.clearTimeout(confettiTimer.current);
    };
  }, []);

  const handleSpin = async () => {
    if (!spinner || spinning) return;

    if (!isAuthenticated) {
      setLoginOpened(true);
      return;
    }

    if (status && !status.canSpin) {
      showNotification({
        title: "Spin already used",
        message: status.reason || "You have already used your spin.",
        color: "orange",
      });
      return;
    }

    try {
      setSpinning(true);
      setResult(null);

      const response = await axiosInstance.post(`${API_SPINNERS}/${spinner.id}/spin`, {});
      const data = response.data || {};
      const index = Number.isInteger(data.segmentIndex)
        ? data.segmentIndex
        : Math.max(
            segments.findIndex((segment) => segment.label === data.segment?.label),
            0
          );

      setRotation((current) => targetRotation(index, current));

      resultTimer.current = window.setTimeout(() => {
        setSpinning(false);
        setResult({
          segment: data.segment,
          segmentIndex: index,
          remainingSpins: data.remainingSpins ?? 0,
        });
        setStatus((current) =>
          current
            ? {
                ...current,
                canSpin: false,
                usedSpins: data.usedSpins ?? current.usedSpins + 1,
                remainingSpins: data.remainingSpins ?? 0,
                lastSpin: {
                  segmentIndex: index,
                  segmentLabel: data.segment?.label || "",
                  rewardType: data.segment?.rewardType || "",
                  rewardValue: data.segment?.value || "",
                  spunAt: new Date().toISOString(),
                },
              }
            : current
        );

        setConfetti(true);
        confettiTimer.current = window.setTimeout(() => setConfetti(false), 3200);
      }, 4800);
    } catch (error: unknown) {
      setSpinning(false);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Unable to spin right now. Please try again.";
      showNotification({ title: "Spin failed", message, color: "red" });

      if (/already used/i.test(message)) {
        setStatus((current) =>
          current ? { ...current, canSpin: false, remainingSpins: 0 } : current
        );
      }
    }
  };

  const closeModal = () => {
    setOpened(false);
    setLoginOpened(false);
  };

  const wonSegment =
    result?.segment ??
    (status?.lastSpin && segments[status.lastSpin.segmentIndex]) ??
    null;

  const hasAlreadyPlayed = !!status && !status.canSpin && !!status.lastSpin;

  if (!spinner) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpened(true)}
        aria-label="Open Spin and Win"
        className="fixed right-4 z-[60] flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-xl transition-transform hover:scale-105 md:right-6"
        style={{
          bottom: isMobile ? 84 : 28,
          background: `linear-gradient(135deg, ${DARK_GREEN}, ${MID_GREEN})`,
          border: `2px solid ${GOLD}`,
          boxShadow: `0 10px 28px rgba(18,47,21,0.4), 0 0 0 3px rgba(255,215,0,0.18)`,
        }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: GOLD, color: DARK_GREEN }}
        >
          <IconSparkles size={18} />
        </span>
        <span className="pr-1 text-left leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F3E8D3]">
            {hasAlreadyPlayed ? "Your reward" : "Lucky wheel"}
          </span>
          <span className="block text-[13px] font-extrabold uppercase tracking-wide">
            {hasAlreadyPlayed ? "View offer" : "Spin & Win"}
          </span>
        </span>
      </button>

      <Modal
        opened={opened}
        onClose={closeModal}
        centered
        withCloseButton={false}
        size={isMobile ? "100%" : 520}
        radius="lg"
        padding={0}
        styles={{
          body: { padding: 0 },
          content: { overflow: "hidden", background: "#FFFBF3" },
          inner: { padding: isMobile ? 10 : 24 },
        }}
      >
        <div style={{ background: `linear-gradient(160deg, ${DARK_GREEN} 0%, #0B1D0D 100%)` }}>
          <div className="relative px-5 pb-4 pt-5 text-center">
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close spinner"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", color: CREAM }}
            >
              <IconX size={16} />
            </button>

            <div className="mb-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFD700]">
              <IconSparkles size={12} /> One spin. One reward.
            </div>
            <h2 className="text-2xl font-black uppercase leading-tight tracking-wide text-white">
              Spin & Win
            </h2>
            <p className="mx-auto mt-1 max-w-[330px] text-[12px] leading-relaxed text-[#D9E7D2]">
              {spinner.description || "Spin the wheel and unlock an exclusive offer on your order."}
            </p>
          </div>

          <div
            className="relative flex justify-center px-4 pb-6"
            style={{ background: `radial-gradient(circle at 50% 0%, rgba(146,183,117,0.3), transparent 68%)` }}
          >
            <div className="relative">
              <Wheel
                segments={segments}
                size={wheelSize}
                rotation={rotation}
                animate={spinning}
              />
              {confetti && (
                <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                  {Array.from({ length: 28 }).map((_, index) => (
                    <span
                      key={index}
                      className="absolute top-0 block rounded-[2px]"
                      style={{
                        left: `${(index * 37) % 100}%`,
                        width: 5 + (index % 4) * 2,
                        height: 9 + (index % 3) * 3,
                        background: [GOLD, LIGHT_GREEN, "#FFFFFF", "#E11D48", "#2563EB"][index % 5],
                        animation: `spin-confetti-fall ${2.1 + (index % 5) * 0.22}s ease-in forwards`,
                        animationDelay: `${(index % 7) * 0.06}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {!isAuthenticated ? (
            <div className="text-center">
              <div
                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: CREAM, color: DARK_GREEN }}
              >
                <IconTicket size={21} />
              </div>
              <Text fw={700} size="sm" style={{ color: DARK_GREEN }}>
                Login to spin the wheel
              </Text>
              <Text size="xs" c="dimmed" mt={4} mb="md">
                Your reward is saved to your account so you can use it on your next order.
              </Text>
              <Button
                fullWidth
                radius="xl"
                size="md"
                onClick={() => setLoginOpened(true)}
                styles={{
                  root: {
                    background: `linear-gradient(135deg, ${DARK_GREEN}, ${MID_GREEN})`,
                    border: `1px solid ${GOLD}`,
                    color: "#fff",
                    fontWeight: 800,
                  },
                }}
              >
                Login to continue
              </Button>
            </div>
          ) : statusLoading ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader size="sm" color="darkGreen" />
              <Text size="xs" c="dimmed">
                Checking your spin...
              </Text>
            </div>
          ) : hasAlreadyPlayed ? (
            <div className="text-center">
              <div
                className="mx-auto mb-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em]"
                style={{ background: CREAM, color: DARK_GREEN }}
              >
                <IconTicket size={12} /> Your reward
              </div>
              <h3 className="text-xl font-black uppercase" style={{ color: DARK_GREEN }}>
                {wonSegment ? rewardDisplay(wonSegment) : status?.lastSpin?.segmentLabel}
              </h3>
              <p className="mt-1 text-[12px] text-gray-600">
                {wonSegment ? offerHint(wonSegment) : "Your offer is saved to your account."}
              </p>
              <p className="mt-2 text-[11px] text-gray-500">
                You have already used your spin. Come back for the next campaign!
              </p>
            </div>
          ) : status && !status.canSpin ? (
            <div className="text-center">
              <Text fw={700} size="sm" style={{ color: DARK_GREEN }}>
                {status.reason || "This wheel is not accepting spins right now."}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Please check back later.
              </Text>
            </div>
          ) : (
            <div className="text-center">
              <Button
                fullWidth
                radius="xl"
                size="lg"
                loading={spinning}
                loaderProps={{ type: "dots" }}
                onClick={handleSpin}
                styles={{
                  root: {
                    background: `linear-gradient(135deg, ${GOLD}, #FFB800)`,
                    color: DARK_GREEN,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    border: `2px solid ${DARK_GREEN}`,
                    boxShadow: "0 8px 20px rgba(18,47,21,0.2)",
                  },
                }}
              >
                {spinning ? "SPINNING..." : "SPIN NOW"}
              </Button>
              <Text size="xs" c="dimmed" mt={8}>
                One spin per customer. Offer cannot be clubbed with other coupons.
              </Text>
            </div>
          )}

          {result && !spinning && !hasAlreadyPlayed && (
            <div
              className="mt-4 rounded-xl px-4 py-3 text-center"
              style={{ background: CREAM, border: `1.5px dashed ${DARK_GREEN}` }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C6B57]">
                You won
              </div>
              <div className="text-lg font-black uppercase" style={{ color: DARK_GREEN }}>
                {rewardDisplay(result.segment)}
              </div>
              <div className="text-[11px] text-[#5C6B57]">{offerHint(result.segment)}</div>
            </div>
          )}
        </div>
      </Modal>

      <LoginOtpModal opened={loginOpened} onClose={() => setLoginOpened(false)} />
    </>
  );
};

export default SpinWheelLauncher;
