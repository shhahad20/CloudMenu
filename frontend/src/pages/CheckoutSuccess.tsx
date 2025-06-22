import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_URL } from '../api/api';
import '../styles/cart.scss';
import { useCart } from '../context/CartContext';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string|null>(null);
  const [email, setEmail]     = useState<string>('');
  const { clearCart }        = useCart();

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
        clearCart();
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [sessionId, clearCart]);

   if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-600 text-lg animate-pulse">Processing…</div>
    </div>
  );

 if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg border border-black-300 text-red-600 max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-4">Oops!</h2>
        <p>{error}</p>
        <Link to="/" className="mt-6 inline-block text-red-500 hover:underline">
          Go back home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg text-center">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-green-500"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 13l4 4L19 7" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Thank you for your purchase!
        </h1>
        {email && (
          <p className="text-gray-600 mb-6">
            A receipt has been sent to <span className="font-medium">{email}</span>.
          </p>
        )}
        <div className="space-x-4">
            <Link
            to="/invoices"
            className="inline-block px-6 py-2"
            style={{ backgroundColor: '#1e1e1e', color: '#fff', borderRadius: '0.375rem', transition: 'background 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#111')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
            >
            View Invoices
            </Link>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
