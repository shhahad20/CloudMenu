import React, { useState } from "react";
import "../styles/contact.scss";
import { API_URL } from "../api/api";
import { Link } from "react-router-dom";

const tags = [
  { value: "problem", label: "Report a Problem" },
  { value: "suggest", label: "Suggestion" },
  { value: "custom", label: "Custom Menu Request" },
  { value: "other", label: "Other" },
];

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    tag: "problem",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
      setForm({ name: "", email: "", tag: "problem", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Submission failed.");
      }
    }
  };

  return (
    <div className="contact-page">
      <div className="lets-talk-page">
        <h1 className="get-in-touch-h">Get in touch</h1>
        <p>
          Have a question or idea? Send us a message and we’ll get back to you
          soon.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Your Name
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Your Email
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Topic
            <select name="tag" value={form.tag} onChange={handleChange}>
              {tags.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Message
            <textarea
              name="message"
              rows={6}
              required
              value={form.message}
              onChange={handleChange}
            />
          </label>

          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>

          {status === "success" && (
            <p className="success">Thanks! We'll be in touch.</p>
          )}
          {status === "error" && <p className="error">{errorMsg}</p>}
        </form>
      </div>

      <div className="contact-info">
        <div className="helpful-links">
        <h2 className="helpful-h">Helpful Links</h2>
          <div className="contact-btn-wrapper">
            <Link to="/faqs" className="circle-arrow-btn">
              <span className="btn-text">FAQs</span>
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
            </Link>
          </div>
          <div className="contact-btn-wrapper">
            <Link
              to="/how-to-start"
              className="circle-arrow-btn"
              onClick={() => alert("Button Clicked!")}
            >
              <span className="btn-text">How to Start</span>
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
            </Link>
          </div>
          <div className="contact-btn-wrapper">
            <Link
              to="/docs"
              className="circle-arrow-btn"
              onClick={() => alert("Button Clicked!")}
            >
              <span className="btn-text">Docs</span>
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
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
