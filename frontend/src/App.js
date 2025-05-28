// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import api, { setAuthToken } from "./api";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import CanvasDrawingApp from "./components/CanvasDrawingApp";
import HomePage from "./components/HomePage";
import MarketplacePage from "./components/MarketplacePage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import MyDrawingsPage from "./components/MyDrawingsPage";
import "./DrawingApp.css";

export default function App() {
  const [user, setUser] = useState(null);

  // Przy starcie wczytujemy tokęn i profil
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      api.get("/auth/me")
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setAuthToken(null);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CanvasDrawingApp user={user} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/my-drawings" element={<MyDrawingsPage user={user} />} />
      </Routes>
    </Router>
  );
}
