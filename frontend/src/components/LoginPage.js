// src/components/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api";

export default function LoginPage({ setUser }) {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      // 1) Logowanie
      const res = await api.post("/auth/login", {
        username: loginData.username,
        password: loginData.password,
      });
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      setAuthToken(token);

      // 2) Pobranie profilu
      const me = await api.get("/auth/me");
      setUser(me.data);

      navigate("/");
    } catch {
      setLoginError("Invalid username/email or password.");
    }
  }

  return (
    <div className="drawing-card">
      <header className="drawing-header">
        <h1>Login</h1>
      </header>
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="text"
          placeholder="Username or Email"
          value={loginData.username}
          onChange={(e) =>
            setLoginData({ ...loginData, username: e.target.value })
          }
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
        />
        {loginError && <div className="auth-error">{loginError}</div>}
        <button type="submit" className="drawing-btn" style={{ width: "100%" }}>
          Login
        </button>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span style={{ fontSize: "0.95em" }}>
            Don't have an account?{" "}
            <a href="/register" className="link-btn">
              Register
            </a>
          </span>
        </div>
      </form>
    </div>
  );
}
