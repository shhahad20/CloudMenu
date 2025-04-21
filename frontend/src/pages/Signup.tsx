// Signup.tsx
import React, { useState } from "react";
import "../styles/signup.scss";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // your signup logic here
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
        <p className="signup-subheader">Enter your personal data to create your account</p>
        <form onSubmit={handleSubmit}>
          <div className="name-section">
            <div>
              <label htmlFor="name">First Name:</label>
              <input
                type="text"
                id="name"
                name="first-name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="name">Last Name:</label>
              <input
                type="text"
                id="name"
                name="last-name"
                value={formData.name}
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
              required
            />
            <p className="password-note">Must be at least 8 characters.</p>
          </div>

          <button type="submit">Sign Up</button>
        </form>
        <p className="sign-in-note">Already have an account? <a href="/sign-in">Sign In</a></p>
      </div>
    </div>
  );
};

export default Signup;
