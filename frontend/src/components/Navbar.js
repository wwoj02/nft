// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleDeposit = async () => {
    const amount = prompt("Amount to deposit (ETH):");
    if (!amount) return;
    try {
      const res = await api.post("/wallet/deposit", null, {
        params: { amount: parseFloat(amount) },
      });
      alert(`Deposit successful! New balance: ${res.data.cash.toFixed(2)} ETH`);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.detail || "Deposit failed");
    }
  };

  return (
    <div className="drawing-navbar">
      <span className="drawing-navbar-title">NFT Market</span>
      <nav className="drawing-navbar-links">
        <Link to="/" className="drawing-navbar-link">Home</Link>
        <Link to="/marketplace" className="drawing-navbar-link">Marketplace</Link>
        <Link to="/create" className="drawing-navbar-link">Create NFT</Link>
        <Link to="/my-drawings" className="drawing-navbar-link">My Drawings</Link>
        <Link to="/about" className="drawing-navbar-link">About</Link>
        <Link to="/contact" className="drawing-navbar-link">Contact</Link>
      </nav>
      <div className="drawing-navbar-auth">
        {user ? (
          <>
            <span className="drawing-navbar-user">Hello, {user.username}!</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
              <span style={{ fontWeight: 500, color: "#2563eb" }}>
                💸 {parseFloat(user.cash || 0).toFixed(2)} ETH
              </span>
              <button
                className="drawing-navbar-button"
                style={{
                  background: "#fbbf24",
                  fontSize: "0.93rem",
                  padding: "6px 14px",
                }}
                onClick={handleDeposit}
              >
                Deposit
              </button>
            </div>
            <button className="drawing-navbar-button login" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="drawing-navbar-button login" onClick={() => navigate("/login")}>Login</button>
            <button className="drawing-navbar-button register" onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </div>
  );
}
