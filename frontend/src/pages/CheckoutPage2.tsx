import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import "../styles/cart.scss";
import { useCart } from "../context/CartContext";
// import { API_URL } from "../api/api";
import { apiFetch } from "../hooks/useApiCall";

const CheckoutPage2: React.FC = () => {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

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
      const response = await apiFetch(
        `api/payments/verify?session_id=${sessionId}`,
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
      const response = await apiFetch(`api/checkout/session`, {
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
        <h1 className="text-2xl font-semibold">No items to checkout</h1>
        <button
          className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
          onClick={() => navigate("/menus")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <button
          className="px-4 py-2"
          style={{
            background: "#f5f5f5",
            color: "#333",
            border: "1px solid #ccc",
            borderRadius: "4px",
            transition: "background 0.2s",
          }}
          onClick={() => navigate("/cart")}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e5e5e5")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#f5f5f5")}
        >
          ← Back to Cart
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-white shadow rounded p-6 space-y-4">
        <h2 className="text-xl font-semibold">Order Summary</h2>

        {/* Items List */}
        <div className="space-y-4">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between bg-gray-50 rounded p-4"
            >
              {/* Product info */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded" />
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-gray-500">#{i.id}</div>
                </div>
              </div>

              {/* Qty & Total */}
              <div className="mt-3 sm:mt-0 flex items-center space-x-6">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Qty:</span>
                  <span>{i.quantity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Total:</span>
                  <span>{(i.price * i.quantity).toFixed(2)} SAR</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="flex justify-between text-lg font-semibold border-t pt-4">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)} SAR</span>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white shadow rounded p-6 space-y-4">
        <h2 className="text-xl font-semibold">Payment</h2>
        <p className="text-gray-600">
          You&apos;ll be redirected to Stripe for secure payment processing.
        </p>

        {error && (
          <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
        )}

        <button
          className="w-full py-3 bg-[#1e1e1e] text-white rounded hover:bg-green-700 transition flex items-center justify-center"
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
