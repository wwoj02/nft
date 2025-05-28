import React, { useRef, useState, useEffect } from "react";
import "./DrawingApp.css";

const CANVAS_DEFAULT_WIDTH = 700;
const CANVAS_DEFAULT_HEIGHT = 450;
const MAX_HISTORY = 50;

function validateDimension(value, defaultValue) {
  const num = Number(value);
  if (isNaN(num) || num < 1) {
    return defaultValue;
  }
  return num;
}

// Helpers for fake auth (localStorage)
function saveUser(user) {
  localStorage.setItem("drawingUser", JSON.stringify(user));
}
function getUser() {
  const u = localStorage.getItem("drawingUser");
  return u ? JSON.parse(u) : null;
}
function clearUser() {
  localStorage.removeItem("drawingUser");
}

export default function CanvasDrawingApp() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#3b82f6");

  // Actual canvas size
  const [width, setWidth] = useState(CANVAS_DEFAULT_WIDTH);
  const [height, setHeight] = useState(CANVAS_DEFAULT_HEIGHT);

  // Pending (input) values
  const [pendingWidth, setPendingWidth] = useState(CANVAS_DEFAULT_WIDTH);
  const [pendingHeight, setPendingHeight] = useState(CANVAS_DEFAULT_HEIGHT);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [lineWidth, setLineWidth] = useState(4);

  // Auth state
  const [user, setUser] = useState(getUser());
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Synchronize pending values with actual size
  useEffect(() => {
    setPendingWidth(width);
    setPendingHeight(height);
  }, [width, height]);

  // Save initial state on mount and when canvas size changes
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    setUndoStack([ctx.getImageData(0, 0, width, height)]);
    setRedoStack([]);
    // eslint-disable-next-line
  }, [width, height]);

  // Drawing handlers
  const handlePointerDown = (e) => {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.clientX - rect.left,
      e.nativeEvent.clientY - rect.top
    );
  };

  const handlePointerUp = () => {
    if (!drawing) return;
    setDrawing(false);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    // Save state AFTER the stroke is finished
    setUndoStack((prev) => {
      const newStack = prev.slice(-MAX_HISTORY + 1);
      return [...newStack, ctx.getImageData(0, 0, width, height)];
    });
    setRedoStack([]);
  };

  const handlePointerMove = (e) => {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineTo(
      e.nativeEvent.clientX - rect.left,
      e.nativeEvent.clientY - rect.top
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.clientX - rect.left,
      e.nativeEvent.clientY - rect.top
    );
  };

  // Canvas actions
  const handleResize = () => {
    const safeWidth = validateDimension(pendingWidth, CANVAS_DEFAULT_WIDTH);
    const safeHeight = validateDimension(pendingHeight, CANVAS_DEFAULT_HEIGHT);
    setWidth(safeWidth);
    setHeight(safeHeight);
    // zawartość canvasu zostanie skopiowana i historia zresetowana w useEffect
  };

  const handleClear = () => {
    const ctx = canvasRef.current.getContext("2d");
    setUndoStack((prev) => [...prev, ctx.getImageData(0, 0, width, height)]);
    setRedoStack([]);
    ctx.clearRect(0, 0, width, height);
  };

  const handleSave = () => {
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "my_drawing.png";
    link.href = url;
    link.click();
  };

  // Undo/Redo logic
  const handleUndo = () => {
    if (undoStack.length < 2) return; // Don't remove the initial state
    setRedoStack((prev) => [undoStack[undoStack.length - 1], ...prev]);
    const newUndoStack = undoStack.slice(0, -1);
    setUndoStack(newUndoStack);
    const ctx = canvasRef.current.getContext("2d");
    ctx.putImageData(newUndoStack[newUndoStack.length - 1], 0, 0);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const [imageData, ...rest] = redoStack;
    setUndoStack((prev) => [...prev, imageData]);
    setRedoStack(rest);
    const ctx = canvasRef.current.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
  };

  // Color palette
  const colors = [
    "#3b82f6", "#10b981", "#f59e42", "#ef4444", "#a855f7", "#64748b", "#000000", "#ffffff"
  ];

  // --- AUTH FORMS BELOW ---

  // Login form state
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regData, setRegData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Fake user db in localStorage for demo
  function getUsers() {
    return JSON.parse(localStorage.getItem("drawingUsers") || "[]");
  }
  function saveUsers(users) {
    localStorage.setItem("drawingUsers", JSON.stringify(users));
  }

  // Login logic
  function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const users = getUsers();
    const found = users.find(
      (u) =>
        (u.username === loginData.username || u.email === loginData.username) &&
        u.password === loginData.password
    );
    if (found) {
      setUser(found);
      saveUser(found);
      setShowLogin(false);
      setLoginData({ username: "", password: "" });
    } else {
      setLoginError("Invalid username/email or password.");
    }
  }

  // Register logic
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
    setRegSuccess("Registration successful! You can now log in.");
    setRegData({ username: "", email: "", password: "", confirm: "" });
  }

  function handleLogout() {
    setUser(null);
    clearUser();
  }

  // --- END AUTH FORMS ---

  return (
    <div>
      {/* NAVBAR */}
      <div className="drawing-navbar">
        <span className="drawing-navbar-title">NFT Market</span>
        <nav className="drawing-navbar-links">
          <a href="/" className="drawing-navbar-link">Home</a>
          <a href="/about" className="drawing-navbar-link">Marketplace</a>
          <a href="/" className="drawing-navbar-link">Create your own NFT</a>
          <a href="/contact" className="drawing-navbar-link">About</a>
          <a href="/contact" className="drawing-navbar-link">Contact</a>
        </nav>
        <div className="drawing-navbar-auth">
          {user ? (
            <>
              <span className="drawing-navbar-user">Hello, {user.username}!</span>
              <button className="drawing-navbar-button login" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="drawing-navbar-button login" onClick={() => { setShowLogin(true); setShowRegister(false); }}>Login</button>
              <button className="drawing-navbar-button register" onClick={() => { setShowRegister(true); setShowLogin(false); }}>Register</button>
            </>
          )}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username or Email"
                value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              />
              {loginError && <div className="auth-error">{loginError}</div>}
              <button type="submit" className="drawing-btn" style={{ width: "100%" }}>Login</button>
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <span style={{ fontSize: "0.95em" }}>
                  Don't have an account?{" "}
                  <button type="button" className="link-btn" onClick={() => { setShowRegister(true); setShowLogin(false); }}>Register</button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
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
                  <button type="button" className="link-btn" onClick={() => { setShowLogin(true); setShowRegister(false); }}>Login</button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="drawing-card">
        <header className="drawing-header">
          <h1>Drawing Creator</h1>
          <p>
            Draw, resize the canvas, pick a color, undo, redo and save your artwork!
          </p>
        </header>

        <section className="drawing-toolbar">
          <div className="drawing-colors">
            <span>Color:</span>
            {colors.map((c) => (
              <button
                key={c}
                className={
                  "drawing-palette-btn" +
                  (color === c ? " active" : "") +
                  (c === "#ffffff" ? " white" : "")
                }
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Choose color ${c}`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              style={{
                width: 36,
                height: 36,
                border: "none",
                marginLeft: 6,
                cursor: "pointer",
                background: "none"
              }}
              aria-label="Choose custom color"
            />
          </div>
          <div className="drawing-range-group">
            <span>Line width:</span>
            <input
              type="range"
              min={1}
              max={24}
              value={lineWidth}
              onChange={e => setLineWidth(Number(e.target.value))}
              style={{ width: 90, accentColor: "#2563eb" }}
            />
            <span className="drawing-range-value">{lineWidth}px</span>
          </div>
          <div className="drawing-size-group">
            <span>Canvas:</span>
            <input
              type="number"
              min={100}
              max={2000}
              value={pendingWidth}
              onChange={e => setPendingWidth(e.target.value)}
              className="drawing-size-input"
              aria-label="Canvas width"
            />
            <span style={{ color: "#64748b" }}>×</span>
            <input
              type="number"
              min={100}
              max={2000}
              value={pendingHeight}
              onChange={e => setPendingHeight(e.target.value)}
              className="drawing-size-input"
              aria-label="Canvas height"
            />
            <button
              onClick={handleResize}
              className="drawing-btn resize"
              title="Resize canvas"
            >Resize</button>
          </div>
        </section>

        <section className="drawing-actions">
          <button
            onClick={handleUndo}
            className="drawing-btn"
            disabled={undoStack.length < 2}
            title="Undo"
          >⟲ Undo</button>
          <button
            onClick={handleRedo}
            className="drawing-btn"
            disabled={redoStack.length === 0}
            title="Redo"
          >⟳ Redo</button>
          <button
            onClick={handleClear}
            className="drawing-btn"
            title="Clear canvas"
          >🧹 Clear</button>
          <button
            onClick={handleSave}
            className="drawing-btn"
            title="Save drawing"
          >💾 Save</button>
        </section>

        <main className="drawing-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="drawing-canvas"
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseOut={handlePointerUp}
            onMouseMove={handlePointerMove}
            onTouchStart={e => {
              const touch = e.touches[0];
              handlePointerDown({
                nativeEvent: {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                }
              });
            }}
            onTouchEnd={handlePointerUp}
            onTouchCancel={handlePointerUp}
            onTouchMove={e => {
              if (!drawing) return;
              const touch = e.touches[0];
              handlePointerMove({
                nativeEvent: {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                }
              });
              e.preventDefault();
            }}
          />
        </main>
      </div>
      <footer className="drawing-footer">
        &copy; {new Date().getFullYear()} Drawing App &mdash; React
      </footer>
    </div>
  );
}
