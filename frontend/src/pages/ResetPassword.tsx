import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import "../styles/signup.scss";

import { API_URL } from "../api/api";

const ResetPassword: React.FC = () => {
//   const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase appends "#access_token=...&type=recovery&..." to the URL
    const hash = location.hash;               // e.g. "#access_token=XYZ&type=recovery..."
    if (!hash) {
      setError('No reset token found.');
      return;
    }
    const params = new URLSearchParams(hash.slice(1)); 
    const t = params.get('access_token') || '';
    const type = params.get('type');
    if (type !== 'recovery') {
      setError('Invalid token type.');
      return;
    }
    if (!t) {
      setError('No reset token found.');
      return;
    }
    setToken(t);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Reset failed');
      setStatus('success');
    } catch (err: unknown) {
        let errorMessage = 'Password reset failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setStatus('error');
    }
  };

  if (status === "success") {
    return (
      <div className="signup-container">
        <div className="form-section">
          <h2>Password Updated</h2>
          <p>Your password has been reset successfully.</p>
          <button onClick={() => navigate("/sign-in")} className="back-sigin-btn">
            Back to Sign-In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="gradient-section">
        <div className="inner-signup-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>
      </div>
      <div className="form-section">
        <h2 className="signup-header">New Password</h2>
        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button type="submit" disabled={status === "loading" || !token}>
            {status === "loading" ? "Updating…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
