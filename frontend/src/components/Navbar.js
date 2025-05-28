import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

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
            <button className="drawing-navbar-button login" onClick={onLogout}>Logout</button>
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
