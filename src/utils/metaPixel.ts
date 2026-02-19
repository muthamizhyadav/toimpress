export const trackPixel = (
  event: string,
  payload?: Record<string, any>
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, payload);
  }
};
