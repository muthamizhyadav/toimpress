export function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if ((window as any).Razorpay) return resolve();
    
    // Check if script is already added
    if (document.getElementById('rzp-script')) {
      // Wait a bit for the script to load
      const checkRazorpay = setInterval(() => {
        if ((window as any).Razorpay) {
          clearInterval(checkRazorpay);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkRazorpay);
        reject(new Error('Razorpay script loading timeout'));
      }, 10000);
      
      return;
    }
    
    const s = document.createElement('script');
    s.id = 'rzp-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => {
      // Double check that Razorpay is actually available
      if ((window as any).Razorpay) {
        resolve();
      } else {
        reject(new Error('Razorpay object not found after script load'));
      }
    };
    s.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(s);
  });
}
