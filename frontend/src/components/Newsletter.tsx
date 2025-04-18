import React, { useState } from "react";
import "../styles/newsletter.scss";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate API call or handle signup logic
      setMessage("Thank you for signing up!");
      setEmail("");
    } else {
      setMessage("Please enter a valid email address.");
    }
  };

  return (
    <div className="newsletter">
      <h2 className="newsletter-header">Ready to Go?</h2>

      <div className="btns-container">
        <div className="news-btn-wrapper">
          <button
            className="circle-arrow-btn"
            onClick={() => alert("Button Clicked!")}
          >
            <span className="btn-text">Get Started</span>
            <span className="icon-container">
              <span className="arrow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </span>
          </button>
        </div>
        <div className="news-btn-wrapper">
          <button
            className="circle-arrow-btn demo-btn"
            onClick={() => alert("Button Clicked!")}
          >
            <span className="btn-text">Book a Demo</span>
            <span className="icon-container">
              <span className="arrow">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </span>
          </button>
        </div>
      </div>
      <div className="news-text">
      <p>Subscribe to our newsletter for the latest news and happenings.</p>
      <p>We promise to keep your inbox clean. ✨</p>
      </div>
<div className="newsletter-input-container">


      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Newsletter Signup</button>
      </form>
      {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Newsletter;
