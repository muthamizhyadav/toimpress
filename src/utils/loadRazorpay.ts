// src/utils/loadRazorpay.ts
export function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded?
    if ((window as any).Razorpay) return resolve();

    // Script tag already present? Poll for readiness.
    const existing = document.getElementById("rzp-script");
    if (existing) {
      const checkRazorpay = setInterval(() => {
        if ((window as any).Razorpay) {
          clearInterval(checkRazorpay);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkRazorpay);
        reject(new Error("Razorpay script loading timeout"));
      }, 10000);

      return;
    }

    // Fresh script load
    const s = document.createElement("script");
    s.id = "rzp-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => {
      if ((window as any).Razorpay) resolve();
      else reject(new Error("Razorpay object not found after script load"));
    };
    s.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(s);
  });
}