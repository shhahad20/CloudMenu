import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cart.scss";
import { useCart } from "../context/CartContext";
import { API_URL } from "../api/api";

const CheckoutPage2: React.FC = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState(""); // For Stripe Elements (optional)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Handle payment completion after redirect from Stripe
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");

    if (sessionId) {
      // Verify payment success with backend
      verifyPayment(sessionId);
    }
  }, []);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/payments/verify?session_id=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Payment verification failed");

      clearCart();
      navigate("/dashboard", {
        replace: true,
        state: { paymentSuccess: true },
      });
    } catch (err) {
      setError("Payment verification failed. Please check your orders.");
      console.error(err);
    }
  };

  // in CheckoutPage2
  const handlePay = async () => {
    setProcessing(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/checkout/session`, {
        method: "POST", // <-- must be POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          items,
          currency: "SAR",
        }), // <-- send your cart & currency
      });
      // 2) If the status isn’t OK, parse JSON (or text) for a real error
      if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          msg = errJson.error || JSON.stringify(errJson);
        } catch {
          msg = await response.text();
        }
        throw new Error(msg);
      }

      // 3) Pull the session URL and redirect
      const { url } = await response.json();
      window.location.href = url;

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Payment initialization failed");
      } else {
        setError("Payment initialization failed");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <h1>No items to checkout</h1>
        <button className="btn primary" onClick={() => navigate("/menus")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Cart Summary */}
      <div className="cart-summary">
        <h2>Order Summary</h2>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <span>
                {item.quantity} x SAR {item.price.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="total">
          <strong>Total:</strong>
          <strong>SAR {subtotal.toFixed(2)}</strong>
        </div>
      </div>

      {/* Payment Section */}
      <div className="payment-section">
        <h2>Payment</h2>
        <p>You'll be redirected to Stripe for secure payment processing</p>

        {error && <div className="error">{error}</div>}

        <button
          className="btn primary"
          onClick={handlePay}
          disabled={processing}
        >
          {processing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage2;
