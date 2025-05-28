// src/components/RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api";

export default function RegisterPage({ setUser }) {
  const [regData, setRegData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [regError, setRegError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setRegError("");
    // walidacja
    if (
      !regData.username ||
      !regData.email ||
      !regData.password ||
      !regData.confirm
    ) {
      setRegError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(regData.email)) {
      setRegError("Invalid email address.");
      return;
    }
    if (regData.password.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    if (regData.password !== regData.confirm) {
      setRegError("Passwords do not match.");
      return;
    }

    try {
      // 1) Rejestracja
      await api.post("/auth/register", {
        username: regData.username,
        email: regData.email,
        password: regData.password,
      });

      // 2) Logowanie i zapis tokena
      const loginRes = await api.post("/auth/login", {
        username: regData.username,
        password: regData.password,
      });
      const token = loginRes.data.access_token;
      localStorage.setItem("token", token);
      setAuthToken(token);

      // 3) Pobranie profilu
      const me = await api.get("/auth/me");
      setUser(me.data);

      navigate("/");
    } catch (err) {
      setRegError(err.response?.data?.detail || "Registration failed");
    }
  }

  return (
    <div className="drawing-card">
      <header className="drawing-header">
        <h1>Register</h1>
      </header>
      <form onSubmit={handleRegister} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={regData.username}
          onChange={(e) =>
            setRegData({ ...regData, username: e.target.value })
          }
          autoFocus
        />
        <input
          type="email"
          placeholder="Email"
          value={regData.email}
          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={regData.password}
          onChange={(e) =>
            setRegData({ ...regData, password: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={regData.confirm}
          onChange={(e) =>
            setRegData({ ...regData, confirm: e.target.value })
          }
        />
        {regError && <div className="auth-error">{regError}</div>}
        <button type="submit" className="drawing-btn" style={{ width: "100%" }}>
          Register
        </button>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span style={{ fontSize: "0.95em" }}>
            Already have an account?{" "}
            <a href="/login" className="link-btn">
              Login
            </a>
          </span>
        </div>
      </form>
    </div>
  );
}
