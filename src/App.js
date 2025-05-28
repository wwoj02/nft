import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

// Helpers to get/set user from localStorage
function getUser() {
  const u = localStorage.getItem("drawingUser");
  return u ? JSON.parse(u) : null;
}
function clearUser() {
  localStorage.removeItem("drawingUser");
}

export default function App() {
  const [user, setUser] = useState(getUser());

  const handleLogout = () => {
    setUser(null);
    clearUser();
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CanvasDrawingApp user={user} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/my-drawings" element={<MyDrawingsPage user={user} />} />
      </Routes>
    </Router>
  );
}
