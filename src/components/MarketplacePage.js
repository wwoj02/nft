import React, { useState } from "react";
import "../DrawingApp.css";

const demoNFTs = [
  {
    id: 1,
    title: "Pixel Cat",
    author: "Alice",
    image: "https://i.seadn.io/gcs/files/4c2b6c9f5f1b8b6a7e0b3e7e3c2a1b1b.png?auto=format&w=384",
    price: "0.15 ETH",
    category: "Art",
    description: "A unique pixel art cat NFT.",
  },
  {
    id: 2,
    title: "Crypto Landscape",
    author: "Bob",
    image: "https://i.seadn.io/gae/1a9c9d8e5a9b4d8e9e5b9a8e5b9a8e5b.png?auto=format&w=384",
    price: "0.25 ETH",
    category: "Art",
    description: "A beautiful crypto landscape.",
  },
  {
    id: 3,
    title: "Meta Ape #7",
    author: "Carol",
    image: "https://i.seadn.io/gcs/files/6b5c3a1d7e8f2e9b6a4c3e7e3c2a1b1b.png?auto=format&w=384",
    price: "0.8 ETH",
    category: "Collectible",
    description: "One of the rare Meta Apes.",
  },
  {
    id: 4,
    title: "Synthwave Car",
    author: "Dave",
    image: "https://i.seadn.io/gcs/files/7e8f2e9b6a4c3e7e3c2a1b1b6b5c3a1d.png?auto=format&w=384",
    price: "0.4 ETH",
    category: "Art",
    description: "A synthwave-inspired NFT car.",
  },
  {
    id: 5,
    title: "CryptoPunk #123",
    author: "Eve",
    image: "https://www.larvalabs.com/public/images/cryptopunks/punk123.png",
    price: "12 ETH",
    category: "Collectible",
    description: "A classic CryptoPunk.",
  },
  {
    id: 6,
    title: "Music NFT – Chill Vibes",
    author: "Frank",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&w=384",
    price: "0.05 ETH",
    category: "Music",
    description: "A unique chill music NFT.",
  },
];

const categories = ["All", "Art", "Collectible", "Music"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = demoNFTs.filter(
    (nft) =>
      (category === "All" || nft.category === category) &&
      (nft.title.toLowerCase().includes(search.toLowerCase()) ||
        nft.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="drawing-card" style={{ marginTop: 40, minHeight: "60vh" }}>
      <header className="drawing-header">
        <h1>Marketplace</h1>
        <p>
          Browse, search, and discover unique NFTs from our community.<br />
          <b>Buy, sell, and collect digital art, collectibles, and music NFTs.</b>
        </p>
      </header>

      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", margin: "24px 0 18px 0", gap: 12 }}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1.5px solid #cbd5e1",
            fontSize: "1.06rem",
            minWidth: 220,
            marginRight: 10
          }}
        />
        <div>
          {categories.map(cat => (
            <button
              key={cat}
              className={`drawing-btn${category === cat ? " active" : ""}`}
              style={{
                margin: "0 6px 0 0",
                background: category === cat ? "#2563eb" : "#fff",
                color: category === cat ? "#fff" : "#2563eb",
                border: "2px solid #2563eb",
                fontWeight: 600,
                padding: "7px 18px"
              }}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 28,
          marginTop: 20,
        }}
      >
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b", fontSize: "1.15rem" }}>
            No NFTs found for your criteria.
          </div>
        )}
        {filtered.map(nft => (
          <div key={nft.id} className="nft-card">
            <div className="nft-img-wrap">
              <img src={nft.image} alt={nft.title} className="nft-img" />
            </div>
            <div className="nft-info">
              <h3 className="nft-title">{nft.title}</h3>
              <div className="nft-author">by {nft.author}</div>
              <div className="nft-category">{nft.category}</div>
              <div className="nft-desc">{nft.description}</div>
              <div className="nft-bottom-row">
                <span className="nft-price">{nft.price}</span>
                <button className="drawing-btn" style={{ padding: "7px 18px", fontSize: "1.01rem" }}>Buy</button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
