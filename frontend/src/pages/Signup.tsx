import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.scss";

// const API = import.meta.env.REACT_APP_API_URL;

import { API_URL } from "../api/api"; 

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // build payload
    const { firstName, lastName, email, password } = formData;
    const username = `${firstName} ${lastName}`;

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Signup failed");
      }

      // success → navigate to sign-in
      navigate("/sign-in", { replace: true });
      navigate(`/confirm-email?email=${encodeURIComponent(formData.email)}`, { replace: true });
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
      <div className="gradient-section">
        <div className="inner-signup-header">
          <h1>Get Started with Us</h1>
          <p>Complete these easy steps to register your account.</p>
        </div>
      </div>
      <div className="form-section">
        <h2 className="signup-header">Sign Up Account</h2>
        <p className="signup-subheader">
          Enter your personal data to create your account
        </p>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="name-section">
            <div>
              <label htmlFor="name">First Name:</label>
              <input
                type="text"
                id="fname"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="name">Last Name:</label>
              <input
                type="text"
                id="lname"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
              minLength={8}
              required
            />
            <p className="password-note">Must be at least 8 characters.</p>
          </div>

          <button type="submit" disabled={loading}>
            {" "}
            {loading ? "Signing up…" : "Sign Up"}
          </button>
        </form>
        <p className="sign-in-note">
          Already have an account? <a href="/sign-in">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
