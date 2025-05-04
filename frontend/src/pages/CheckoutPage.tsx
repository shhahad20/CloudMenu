// src/pages/CheckoutPage.tsx
import React, { useState } from 'react';
import '../styles/cart.scss';
import { useCart } from '../context/CartContext';

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      // TODO: call your backend checkout endpoint, e.g.:
      // await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ items }) })
      // assume success:
      clearCart();
      alert('Payment successful!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred.');
      }
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Payment</h1>
      <p>Total: ${total.toFixed(2)}</p>

      {/* In reality embed Stripe Elements here */}
      <div className="card-form">
        <label>
          Card Number
          <input type="text" placeholder="•••• •••• •••• ••••" disabled={processing}/>
        </label>
        <label>
          Expiry
          <input type="text" placeholder="MM/YY" disabled={processing}/>
        </label>
        <label>
          CVC
          <input type="text" placeholder="CVC" disabled={processing}/>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <button onClick={handlePay} disabled={processing}>
        {processing ? 'Processing…' : 'Pay Now'}
      </button>
    </div>
  );
};

export default CheckoutPage;
