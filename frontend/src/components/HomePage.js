import React from "react";
import { Link } from "react-router-dom";
import "../DrawingApp.css";

export default function HomePage() {
  return (
    <div className="drawing-card" style={{ marginTop: 40 }}>
      <header className="drawing-header">
        <h1>Welcome to NFT Market!</h1>
        <p>
          Discover, create, and trade unique digital assets.<br />
          <b>Mint your own NFT art, explore the marketplace, and join the new era of digital ownership.</b>
        </p>
      </header>

      <section style={{ textAlign: "center", margin: "36px 0 24px 0" }}>
        <Link
          to="/create"
          className="drawing-btn"
          style={{
            fontSize: "1.15rem",
            padding: "14px 34px",
            margin: "0 16px 18px 0",
            display: "inline-block",
            minWidth: 220
          }}
        >
          🎨 Create your own NFT
        </Link>
        <Link
          to="/marketplace"
          className="drawing-btn marketplace-btn"
          style={{
            fontSize: "1.15rem",
            padding: "14px 34px",
            margin: "0 0 18px 0",
            display: "inline-block",
            minWidth: 220,
            background: "#10b981"
          }}
        >
          🛒 Go to Marketplace
        </Link>
      </section>

      <section style={{ margin: "38px 0 0 0" }}>
        <h2 style={{ color: "#2563eb", fontWeight: 700, marginBottom: 12 }}>Why NFT Market?</h2>
        <ul style={{ fontSize: "1.08rem", color: "#334155", lineHeight: 1.7, marginLeft: 18 }}>
          <li>🖼️ <b>Easy NFT Creation:</b> Draw your art directly in the browser and mint it as an NFT.</li>
          <li>🌐 <b>Marketplace:</b> Browse, buy, and sell NFTs from creators around the world.</li>
          <li>🔒 <b>Secure & Decentralized:</b> Your assets, your control.</li>
          <li>🚀 <b>Modern Design:</b> Fast, responsive, and beautiful UI for all devices.</li>
        </ul>
      </section>
    </div>
  );
}
