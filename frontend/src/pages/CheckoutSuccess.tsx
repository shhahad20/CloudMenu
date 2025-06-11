import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_URL } from '../api/api';
import '../styles/cart.scss';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string|null>(null);
  const [email, setEmail]     = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided.');
      setLoading(false);
      return;
    }

    // Optionally fetch your backend to confirm the session,
    // retrieve customer email or order details if you saved them.
    fetch(`${API_URL}/api/checkout/session/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to verify session');
        return res.json();
      })
      .then((data: { customer_email: string }) => {
        setEmail(data.customer_email);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="checkout-success"><p>Processing…</p></div>;
  if (error)   return <div className="checkout-success error"><p>{error}</p></div>;

  return (
    <div className="checkout-success">
      <h1>Thank you for your purchase!</h1>
      {email && <p>A receipt has been sent to <strong>{email}</strong>.</p>}
      <p>You can view your <Link to="/invoices">invoices</Link> or return to the <Link to="/dashboard">dashboard</Link>.</p>
    </div>
  );
};

export default CheckoutSuccess;
