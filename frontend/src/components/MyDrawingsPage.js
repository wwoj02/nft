// src/components/MyDrawingsPage.js
import React, { useState, useEffect } from "react";
import api from "../api";

export default function MyDrawingsPage({ user }) {
  const [drawings, setDrawings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }
    api
      .get("/drawings/")
      .then(res => setDrawings(res.data))
      .catch(err => {
        console.error(err);
        setError("Nie udało się pobrać Twoich rysunków.");
      });
  }, [user]);

  if (!user) {
    return (
      <div className="drawing-card" style={{ marginTop: 40 }}>
        <h2>Please log in to view your drawings.</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="drawing-card" style={{ marginTop: 40, color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="drawing-card" style={{ marginTop: 40 }}>
      <header className="drawing-header">
        <h1>My Drawings</h1>
        <p>
          All your saved drawings in one place. Download, delete, or list them on the market anytime!
        </p>
      </header>
      {drawings.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", marginTop: 32 }}>
          <b>No drawings saved yet.</b>
          <div style={{ marginTop: 12 }}>
            <a href="/create" className="drawing-btn">Create your first NFT</a>
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 28,
          marginTop: 24,
        }}>
          {drawings.map(d => (
            <div key={d.id} className="nft-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="nft-img-wrap" style={{ marginBottom: 10 }}>
                <img
                  src={d.image_data_url}
                  alt={d.name}
                  className="nft-img"
                  style={{ maxHeight: 120, background: "#f4f4f4", borderRadius: 12, boxShadow: "0 2px 8px #0001" }}
                />
              </div>
              <div className="nft-info" style={{ width: "100%", textAlign: "center" }}>
                <h3 className="nft-title" style={{ color: "#2563eb", marginBottom: 6 }}>{d.name}</h3>
                <div className="nft-author" style={{ fontSize: "0.97rem", color: "#64748b" }}>
                  {new Date(d.created_at).toLocaleString()}
                </div>
                <div className="nft-desc" style={{ marginBottom: 10, color: "#64748b" }}>
                  {d.width}×{d.height}px
                </div>
                <div className="nft-bottom-row" style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button
                    className="drawing-btn"
                    style={{ padding: "7px 15px", fontSize: "1.01rem" }}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.download = `${d.name || "my_drawing"}.png`;
                      link.href = d.image_data_url;
                      link.click();
                    }}
                  >
                    Download
                  </button>
                  <button
                    className="drawing-btn"
                    style={{ padding: "7px 15px", fontSize: "1.01rem", background: "#10b981" }}
                    onClick={async () => {
                      const price = prompt("Price in ETH?");
                      if (!price) return;
                      await api.post("/marketplace/", {
                        drawing_id: d.id,
                        price: parseFloat(price),
                        category: "Art",
                        description: d.name,
                      });
                      alert("Listed!");
                    }}
                  >
                    List on Market
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
