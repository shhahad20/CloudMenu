import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.scss"; // reuse form styles

import { API_URL } from "../api/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setStatus("sent");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setStatus("error");
    }
  };

  return (
    <div className="signup-container">
      <div className="gradient-section">
        <div className="inner-signup-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link.</p>
        </div>
      </div>
      <div className="form-section">
        <h2 className="signup-header">Reset Your Password</h2>

        {status === "sent" ? (
          <p>
            A reset link has been sent to <strong>{email}</strong>.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}
            <div>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        {status === "sent" && (
          <button onClick={() => navigate("/sign-in")} className="back-sigin-btn">
            Back to Sign-In
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
