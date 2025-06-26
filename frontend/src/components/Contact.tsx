import React, { useState } from "react";
import "../styles/contact.scss";
// import { API_URL } from "../api/api";
import { Link } from "react-router-dom";
import { apiFetch } from "../hooks/useApiCall";

export const tags = [
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
      const res = await apiFetch(`contact`, {
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
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen pt-40 px-4 lg:px-4">
      {/* Left: Form */}
      <div className="w-full lg:w-[600px] px-4 lg:px-4 mb-16 lg:mb-0">
        {/* back to your SCSS gradient header */}
        <h1 className="get-in-touch-h">Get in touch</h1>  

        <p className="text-gray-800 max-w-[500px] mt-4 mb-8">
          Have a question or idea? Send us a message and we’ll get back to you soon.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Name */}
          <label className="flex flex-col font-medium">
            Your Name
            <input
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-base"
              name="name" type="text" required
              value={form.name} onChange={handleChange}
            />
          </label>

          {/* Email */}
          <label className="flex flex-col font-medium">
            Your Email
            <input
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-base"
              name="email" type="email" required
              value={form.email} onChange={handleChange}
            />
          </label>

          {/* Topic */}
          <label className="flex flex-col font-medium">
            Topic
            <select
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-base"
              name="tag" value={form.tag} onChange={handleChange}
            >
              {tags.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>

          {/* Message */}
          <label className="flex flex-col font-medium">
            Message
            <textarea
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-base resize-none"
              name="message" rows={6} required
              value={form.message} onChange={handleChange}
            />
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-4 w-full px-6 py-3 bg-[#1e1e1e] text-white rounded-md disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>

          {/* Feedback */}
          {status === "success" && <p className="text-green-600 mt-2">Thanks! We'll be in touch.</p>}
          {status === "error"   && <p className="text-red-600 mt-2">{errorMsg}</p>}
        </form>
      </div>

      {/* Right: Helpful Links (SCSS intact) */}
      <div className="contact-info">
        <h2 className="helpful-h">Helpful Links</h2>
        <div className="helpful-links">
          <div className="contact-btn-wrapper">
            <Link to="/faqs" className="circle-arrow-btn">
              <span className="btn-text">FAQs</span>
              <span className="icon-container">
                <span className="arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </span>
            </Link>
          </div>
          <div className="contact-btn-wrapper">
            <Link to="/how-to-start" className="circle-arrow-btn">
              <span className="btn-text">How to Start</span>
              <span className="icon-container">
                <span className="arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </span>
            </Link>
          </div>
          <div className="contact-btn-wrapper">
            <Link to="/docs" className="circle-arrow-btn">
              <span className="btn-text">Docs</span>
              <span className="icon-container">
                <span className="arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
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
