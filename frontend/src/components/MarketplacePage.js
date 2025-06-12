import React, { useState, useEffect } from "react";
import "../DrawingApp.css";
import api from "../api";

export default function MarketplacePage({ user }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get("/marketplace/")
      .then(res => setItems(res.data))
      .catch(console.error);
  }, []);

  const handleBuy = async (id) => {
    try {
      await api.post(`/marketplace/buy/${id}`);
      alert("Purchase successful!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.detail || "Purchase failed");
    }
  };

  const handleUnlist = async (id) => {
    if (!window.confirm("Are you sure you want to unlist this item?")) return;
    try {
      await api.delete(`/marketplace/${id}`);
      alert("Unlisted successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.detail || "Unlisting failed");
    }
  };

  return (
    <div className="drawing-card" style={{ marginTop: 40, minHeight: "60vh" }}>
      <header className="drawing-header">
        <h1>Marketplace</h1>
        <p>
          Browse, search, and discover unique NFTs from our community.<br />
          <b>Buy, sell, and collect digital art, collectibles, and music NFTs.</b>
        </p>
      </header>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", marginTop: 32 }}>
          <b>No items listed yet.</b>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 28,
          marginTop: 24,
        }}>
          {items.map(it => (
            <div key={it.id} className="nft-card">
              <div className="nft-info">
                <h3 className="nft-title">Drawing #{it.drawing_id}</h3>
                <div className="nft-desc">{it.description}</div>
                <div className="nft-author">Category: {it.category}</div>
                <div className="nft-price">{it.price} ETH</div>
                <div className="nft-author" style={{ marginTop: 4, fontSize: "0.9rem" }}>
                  Listed: {new Date(it.created_at).toLocaleDateString()}
                </div>

                {user && user.id === it.seller_id ? (
                  <button
                    className="drawing-btn"
                    style={{ marginTop: 8, background: "#ef4444" }}
                    onClick={() => handleUnlist(it.id)}
                  >
                    Unlist
                  </button>
                ) : (
                  <button
                    className="drawing-btn"
                    style={{ marginTop: 8 }}
                    onClick={() => handleBuy(it.id)}
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
