// src/components/SignIn.tsx
import React, { useState } from "react";
import "../styles/signup.scss";  // we’ll reuse the same CSS classes

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign‑in submitted:", formData);
    // your sign‑in logic here
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

          <button type="submit">Sign In</button>
        </form>

        <p className="sign-in-note">
          Don’t have an account? <a href="/sign-up">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
