import React from "react";
import "../DrawingApp.css";

export default function AboutPage() {
  return (
    <div className="drawing-card" style={{ marginTop: 40 }}>
      <header className="drawing-header">
        <h1>About NFT Market</h1>
        <p>
          <b>NFT Market</b> is a modern platform for creating, sharing, and trading unique digital assets.
        </p>
      </header>
      <section style={{ fontSize: "1.09rem", color: "#334155", lineHeight: 1.7, margin: "28px 0" }}>
        <p>
          Our mission is to empower artists and collectors by providing easy-to-use tools for minting NFTs, a vibrant marketplace, and a secure environment for digital ownership.
        </p>
        <ul style={{ marginLeft: 22 }}>
          <li>🎨 <b>Create:</b> Draw your own NFT art directly in the browser.</li>
          <li>🛒 <b>Marketplace:</b> Buy, sell, and discover unique NFTs from creators worldwide.</li>
          <li>🔐 <b>Secure:</b> Your digital assets are stored safely and only you control them.</li>
          <li>🚀 <b>Open for everyone:</b> No coding skills required, just creativity!</li>
        </ul>
        <p style={{ marginTop: 18 }}>
          Built with <b>React</b> and modern web technologies, NFT Market is fast, responsive, and user-friendly. Join our community and start your NFT journey today!
        </p>
      </section>
    </div>
  );
}
