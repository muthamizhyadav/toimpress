import { useState, useCallback } from 'react';
import { loadRazorpay } from '../utils/loadRazorpay';

type CreateOrderResponse = { id: string; amount: number; currency: string };

export function useRazorpayCheckout() {
  const [loading, setLoading] = useState(false);
  const key = import.meta.env.VITE_RZP_KEY_ID as string;

  const openCheckout = useCallback(async (opts: {
    amountInPaise: number;
    customer?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
  }) => {
    setLoading(true);
    try {
      await loadRazorpay();

      // 1) Ask backend to create an order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: opts.amountInPaise,
          currency: 'INR',
          receipt: 'rcpt_' + Date.now(),
          // you can pass any additional fields you handle server-side
        })
      });
      if (!orderRes.ok) throw new Error('Order creation failed');
      const order: CreateOrderResponse = await orderRes.json();

      // 2) Configure Checkout
      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'TO IMPRESS',
        description: 'Order Payment',
        order_id: order.id,
        prefill: {
          name: opts.customer?.name ?? '',
          email: opts.customer?.email ?? '',
          contact: opts.customer?.contact ?? ''
        },
        notes: opts.notes ?? {},
        handler: async (resp: any) => {
          // 3) Verify signature with your backend
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resp)
          });
          const verify = await verifyRes.json();
          // You can route to success page or show toast based on verify.valid
          if (verify.valid) {
            // TODO: navigate('/order/success?order_id='+order.id)
            console.log('Payment verified ✔');
          } else {
            console.error('Signature mismatch ✖');
          }
        },
        theme: { color: '#0FA958' } // To Impress green-ish
      });

      rzp.on('payment.failed', (e: any) => {
        console.error('Payment failed', e?.error);
      });

      // 4) Open widget
      rzp.open();
    } finally {
      setLoading(false);
    }
  }, [key]);

  return { openCheckout, loading };
}
