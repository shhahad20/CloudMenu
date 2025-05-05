import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/cart.scss';                // reuse cart styles
import { useCart } from '../context/CartContext';
import { cloneTemplate } from '../api/templates'; 

const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      // TODO: call your backend checkout endpoint
      // await fetch('/api/checkout', { ... })
      
      alert('Payment successful!');
      await Promise.all(
        items.map(i =>
          // if your cloneTemplate expects a string ID:
          cloneTemplate(i.id.toString())
        )
      );
      clearCart();
      navigate('/success',{replace:true});

      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Payment failed.');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <h1>No items to checkout</h1>
        <button className="btn primary" onClick={() => navigate('/menus')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page checkout-page">
      {/* Header */}
      <div className="cart-header">
        <h1>Checkout</h1>
        <button className="btn secondary" onClick={() => navigate('/cart')}>
          ← Back to Cart
        </button>
      </div>

      {/* Main Content: Items + Payment Form & Summary */}
      <div className="checkout-content">
        {/* Left: review items */}
        <table className="cart-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>PRICE</th>
              <th>QTY</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td className="product-cell">
                  <div className="product-img-placeholder" />
                  <div className="product-info">
                    <div className="product-name">{i.name}</div>
                    <div className="product-meta">#{i.id}</div>
                  </div>
                </td>
                <td>{i.price.toFixed(2)} SAR</td>
                <td>{i.quantity}</td>
                <td>{(i.price * i.quantity).toFixed(2)} SAR</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Right: payment form & summary */}
        <div className="order-summary checkout-summary">
          <h2>Payment Details</h2>

          <div className="card-form">
            <label>
              Card Number
              <input
                type="text"
                placeholder="•••• •••• •••• ••••"
                disabled={processing}
              />
            </label>
            <label>
              Expiry
              <input type="text" placeholder="MM/YY" disabled={processing} />
            </label>
            <label>
              CVC
              <input type="text" placeholder="CVC" disabled={processing} />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} SAR</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{subtotal.toFixed(2)} SAR</span>
          </div>

          <button
            className="btn checkout-btn"
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? 'Processing…' : 'Pay Now '}
            <span className="btn-price">{subtotal.toFixed(2)} SAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
