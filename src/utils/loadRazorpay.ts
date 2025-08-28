// utils/loadRazorpay.ts
export function loadRazorpayScript(src: string) {
  return new Promise<boolean>((resolve) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}
