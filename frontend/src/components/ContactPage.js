import React, { useState } from "react";
import "../DrawingApp.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    // Tu możesz dodać wysyłkę do backendu lub emaila
  }

  return (
    <div className="drawing-card" style={{ marginTop: 40, maxWidth: 480 }}>
      <header className="drawing-header">
        <h1>Contact Us</h1>
        <p>
          Have questions, feedback, or want to partner with us?<br />
          Fill out the form below and we’ll get back to you!
        </p>
      </header>
      <form className="contact-form" onSubmit={handleSubmit} style={{ marginTop: 22 }}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your message"
          value={form.message}
          onChange={handleChange}
          maxLength={300}
          required
          style={{ minHeight: 80, resize: "vertical" }}
        />
        <button type="submit" className="drawing-btn" style={{ width: "100%", marginTop: 8 }}>
          Send
        </button>
        {submitted && (
          <div className="auth-success" style={{ marginTop: 10 }}>
            Thank you! Your message has been sent.
          </div>
        )}
      </form>
    </div>
  );
}
