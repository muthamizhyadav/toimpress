import { Button } from '@mantine/core';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout';

export default function PayNowButton() {
  const { openCheckout, loading } = useRazorpayCheckout();

  const { items } = useSelector((s: RootState) => s.cart);
  // Adjust field names if your slice differs
  const totalInPaise = useMemo(() => {
    const subtotal = items.reduce((sum:any, it:any) => sum + it.price * it.qty, 0);
    // add shipping/tax/discount calculations here if any
    return Math.round(subtotal * 100); // rupees → paise
  }, [items]);

  const handlePay = () => {
    if (totalInPaise <= 0) return;

    // Pull user info from your auth/profile slice if available
    openCheckout({
      amountInPaise: totalInPaise,
      customer: {
        name: 'To Impress Customer',
        email: 'customer@example.com',
        contact: '9000000000'
      },
      notes: {
        cartItems: items.length.toString(),
        source: 'web_checkout'
      }
    });
  };

  return (
    <Button
      size="md"
      radius="xl"
      onClick={handlePay}
      loading={loading}
      disabled={totalInPaise <= 0}
    >
      Pay ₹{(totalInPaise / 100).toFixed(2)}
    </Button>
  );
}
