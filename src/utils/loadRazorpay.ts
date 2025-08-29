export function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('rzp-script')) return resolve();
    const s = document.createElement('script');
    s.id = 'rzp-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}
