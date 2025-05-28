import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function getUsers() {
  return JSON.parse(localStorage.getItem("drawingUsers") || "[]");
}
function saveUser(user) {
  localStorage.setItem("drawingUser", JSON.stringify(user));
}

export default function LoginPage({ setUser }) {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const users = getUsers();
    const found = users.find(
      (u) =>
        (u.username === loginData.username || u.email === loginData.username) &&
        u.password === loginData.password
    );
    if (found) {
      setUser(found);
      saveUser(found);
      navigate("/"); // redirect to main page
    } else {
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
          onChange={e => setLoginData({ ...loginData, username: e.target.value })}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={e => setLoginData({ ...loginData, password: e.target.value })}
        />
        {loginError && <div className="auth-error">{loginError}</div>}
        <button type="submit" className="drawing-btn" style={{ width: "100%" }}>Login</button>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span style={{ fontSize: "0.95em" }}>
            Don't have an account?{" "}
            <a href="/register" className="link-btn">Register</a>
          </span>
        </div>
      </form>
    </div>
  );
}
