import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/api"; 

import "../styles/signup.scss";  

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Signin failed");
      }

      // Persist JWT
      localStorage.setItem("access_token", json.access_token);

      // Go to dashboard or home
      navigate("/", { replace: true });
    } catch (err: unknown) {
      let errorMessage = "An unknown error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* left image/noise panel */}
      <div className="gradient-section">
        <div className="inner-signup-header">
          <h1>Welcome Back!</h1>
          <p>Login to your account</p>
        </div>
      </div>

      {/* right form panel */}
      <div className="form-section">
        <h2 className="signup-header">Sign In</h2>
        <p className="signup-subheader">Enter your details to access your account</p>
        {error && <p className="form-error">{error}</p>}


        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}> {loading ? "Signing in…" : "Sign In"}</button>
        </form>

        <p className="sign-in-note">
          Don’t have an account? <a href="/sign-up">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
