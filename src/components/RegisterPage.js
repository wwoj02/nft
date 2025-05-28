import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function getUsers() {
  return JSON.parse(localStorage.getItem("drawingUsers") || "[]");
}
function saveUsers(users) {
  localStorage.setItem("drawingUsers", JSON.stringify(users));
}

export default function RegisterPage() {
  const [regData, setRegData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const navigate = useNavigate();

  function handleRegister(e) {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
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
    const users = getUsers();
    if (
      users.find(
        (u) => u.username === regData.username || u.email === regData.email
      )
    ) {
      setRegError("User with this username or email already exists.");
      return;
    }
    const newUser = {
      username: regData.username,
      email: regData.email,
      password: regData.password,
    };
    users.push(newUser);
    saveUsers(users);
    setRegSuccess("Registration successful! Redirecting to login...");
    setTimeout(() => navigate("/login"), 1200); // redirect after success
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
          onChange={e => setRegData({ ...regData, username: e.target.value })}
          autoFocus
        />
        <input
          type="email"
          placeholder="Email"
          value={regData.email}
          onChange={e => setRegData({ ...regData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={regData.password}
          onChange={e => setRegData({ ...regData, password: e.target.value })}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={regData.confirm}
          onChange={e => setRegData({ ...regData, confirm: e.target.value })}
        />
        {regError && <div className="auth-error">{regError}</div>}
        {regSuccess && <div className="auth-success">{regSuccess}</div>}
        <button type="submit" className="drawing-btn" style={{ width: "100%" }}>Register</button>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span style={{ fontSize: "0.95em" }}>
            Already have an account?{" "}
            <a href="/login" className="link-btn">Login</a>
          </span>
        </div>
      </form>
    </div>
  );
}
