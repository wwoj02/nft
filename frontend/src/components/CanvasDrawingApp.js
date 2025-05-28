// src/components/CanvasDrawingApp.js
import React, { useRef, useState, useEffect } from "react";
import "../DrawingApp.css";
import api from "../api";

const CANVAS_DEFAULT_WIDTH = 700;
const CANVAS_DEFAULT_HEIGHT = 450;
const DEFAULT_COLS = 32;

export default function CanvasDrawingApp({ user }) {
  const canvasRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#3b82f6");
  const [width, setWidth] = useState(CANVAS_DEFAULT_WIDTH);
  const [height, setHeight] = useState(CANVAS_DEFAULT_HEIGHT);
  const [pendingWidth, setPendingWidth] = useState(CANVAS_DEFAULT_WIDTH);
  const [pendingHeight, setPendingHeight] = useState(CANVAS_DEFAULT_HEIGHT);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [lineWidth, setLineWidth] = useState(4);

  // Pixel Art mode
  const [isPixelMode, setIsPixelMode] = useState(false);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [pendingCols, setPendingCols] = useState(DEFAULT_COLS.toString());
  const [pixelSize, setPixelSize] = useState(
    Math.floor(width / DEFAULT_COLS)
  );
  const [rows, setRows] = useState(
    Math.floor(height / Math.floor(width / DEFAULT_COLS))
  );

  // Toast notification
  const [toast, setToast] = useState(null);
  function showToast(message, type = "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  }

  // Modal for drawing name
  const [showNameModal, setShowNameModal] = useState(false);
  const [drawingName, setDrawingName] = useState("");

  // Update pixelSize and rows when canvas or cols change
  useEffect(() => {
    const px = Math.floor(width / cols);
    setPixelSize(px);
    setRows(Math.floor(height / px));
  }, [width, height, cols]);

  // Draw grid for pixel art mode
  useEffect(() => {
    if (!gridCanvasRef.current) return;
    const ctx = gridCanvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    if (!isPixelMode) return;
    ctx.save();
    ctx.strokeStyle = "#e0e0e0";
    for (let x = 0; x <= width; x += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }, [isPixelMode, width, height, pixelSize]);

  // Initialize undo stack
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    setUndoStack([ctx.getImageData(0, 0, width, height)]);
    setRedoStack([]);
  }, [width, height]);

  // Toggle modes
  const handleModeChange = (newMode) => {
    if (isPixelMode !== newMode) {
      setIsPixelMode(newMode);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        setUndoStack([ctx.getImageData(0, 0, width, height)]);
        setRedoStack([]);
      }
    }
  };

  // Drawing handlers
  const handlePointerDown = (e) => {
    if (!canvasRef.current) return;
    setDrawing(true);
    setRedoStack([]);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (isPixelMode) {
      const x = Math.floor((e.clientX - rect.left) / pixelSize) * pixelSize;
      const y = Math.floor((e.clientY - rect.top) / pixelSize) * pixelSize;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    } else {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handlePointerMove = (e) => {
    if (!drawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (isPixelMode) {
      const x = Math.floor((e.clientX - rect.left) / pixelSize) * pixelSize;
      const y = Math.floor((e.clientY - rect.top) / pixelSize) * pixelSize;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    } else {
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handlePointerUp = () => {
    if (!drawing || !canvasRef.current) return;
    setDrawing(false);
    const ctx = canvasRef.current.getContext("2d");
    setUndoStack((prev) => [...prev, ctx.getImageData(0, 0, width, height)]);
  };

  // Resize handlers
  const handleResize = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setWidth(Number(pendingWidth));
    setHeight(Number(pendingHeight));
    canvasRef.current.width = Number(pendingWidth);
    canvasRef.current.height = Number(pendingHeight);
    ctx.putImageData(imageData, 0, 0);
  };

  const handlePixelGridResize = () => {
    const parsedCols = parseInt(pendingCols);
    if (!isNaN(parsedCols) && parsedCols > 0 && parsedCols <= 200) {
      setCols(parsedCols);
    } else {
      setPendingCols(cols.toString());
    }
  };

  // Save drawing to backend
  const handleSave = () => {
    if (!user) {
      showToast("You must be logged in to save your drawing!", "error");
      return;
    }
    setDrawingName(`Drawing ${new Date().toLocaleString()}`);
    setShowNameModal(true);
  };

  const handleConfirmSave = async () => {
    if (!drawingName.trim() || !canvasRef.current) {
      setShowNameModal(false);
      return;
    }
    try {
      await api.post("/drawings/", {
        name: drawingName,
        image_data_url: canvasRef.current.toDataURL("image/png"),
        width,
        height,
      });
      showToast("Drawing saved to your gallery!", "success");
    } catch {
      showToast("Error saving drawing.", "error");
    }
    setShowNameModal(false);
  };

  // Undo/Redo/Clear
  const handleUndo = () => {
    if (undoStack.length < 2 || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const newUndo = [...undoStack];
    const last = newUndo.pop();
    ctx.putImageData(newUndo[newUndo.length - 1], 0, 0);
    setUndoStack(newUndo);
    setRedoStack((prev) => [last, ...prev]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const [next, ...rest] = redoStack;
    ctx.putImageData(next, 0, 0);
    setUndoStack((prev) => [...prev, next]);
    setRedoStack(rest);
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    setUndoStack([ctx.getImageData(0, 0, width, height)]);
    setRedoStack([]);
  };

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e42",
    "#ef4444",
    "#a855f7",
    "#64748b",
    "#000000",
    "#ffffff",
  ];

  return (
    <div className="drawing-card">
      <header className="drawing-header" style={{ textAlign: "center" }}>
        <h1 style={{ color: "#2563eb", fontWeight: 800, fontSize: "2.5rem", marginBottom: 6 }}>NFT Creator</h1>
        <p style={{ color: "#64748b", fontSize: "1.18rem", marginBottom: 28 }}>
          Draw your masterpiece and save it to your gallery!
        </p>
      </header>
      <section className="drawing-toolbar" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 16 }}>
        <div className="drawing-colors" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 500, marginRight: 4 }}>Color:</span>
          {colors.map((c) => (
            <button
              key={c}
              className={
                "drawing-palette-btn" +
                (color === c ? " active" : "") +
                (c === "#ffffff" ? " white" : "")
              }
              style={{ background: c, width: 28, height: 28, borderRadius: "50%" }}
              onClick={() => setColor(c)}
              aria-label={`Choose color ${c}`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{
              width: 32,
              height: 32,
              border: "none",
              marginLeft: 6,
              cursor: "pointer",
              background: "none"
            }}
            aria-label="Choose custom color"
          />
        </div>

        <div className="drawing-range-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 500 }}>Line width:</span>
          <input
            type="range"
            min="1"
            max="24"
            value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
            disabled={isPixelMode}
            style={{ accentColor: "#2563eb" }}
          />
          <span style={{ minWidth: 32 }}>{lineWidth}px</span>
        </div>

        <div className="drawing-size-group" style={{ display: "flex", alignItems: "center", gap: 8, minWidth: "240px" }}>
          {!isPixelMode ? (
            <>
              <span style={{ fontWeight: 500 }}>Canvas:</span>
              <input
                type="number"
                value={pendingWidth}
                onChange={e => setPendingWidth(e.target.value)}
                min="100"
                max="2000"
                style={{ width: "60px" }}
              />
              <span>x</span>
              <input
                type="number"
                value={pendingHeight}
                onChange={e => setPendingHeight(e.target.value)}
                min="100"
                max="2000"
                style={{ width: "60px" }}
              />
              <button onClick={handleResize} className="drawing-btn" style={{ marginLeft: 6 }}>
                Resize
              </button>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 500 }}>Grid width:</span>
              <input
                type="number"
                min="1"
                max="200"
                value={pendingCols}
                onChange={e => setPendingCols(e.target.value)}
                style={{ width: "50px" }}
              />
              <span>pixels</span>
              <button 
                onClick={handlePixelGridResize}
                className="drawing-btn"
                style={{ marginLeft: 8 }}
              >
                Apply
              </button>
              <span style={{ marginLeft: 12, color: "#64748b" }}>
                {cols} x {rows}
              </span>
            </>
          )}
        </div>

        <div className="drawing-mode-toggle" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 500 }}>Normal</span>
          <span
            className={`switch-slider${isPixelMode ? " on" : ""}`}
            onClick={() => handleModeChange(!isPixelMode)}
            tabIndex={0}
            role="button"
            aria-pressed={isPixelMode}
            style={{ margin: "0 10px", cursor: "pointer" }}
            onKeyDown={e => {
              if (e.key === " " || e.key === "Enter") handleModeChange(!isPixelMode);
            }}
          >
            <span className="switch-knob" />
          </span>
          <span style={{ fontWeight: 500 }}>Pixel Art</span>
        </div>
      </section>

      <section
        className="drawing-actions"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "18px",
          marginTop: "18px",
          marginBottom: "18px",
          flexWrap: "wrap"
        }}
      >
        <button
          onClick={handleUndo}
          className="drawing-btn"
          disabled={undoStack.length < 2}
        >
          ↺ Undo
        </button>
        <button
          onClick={handleRedo}
          className="drawing-btn"
          disabled={redoStack.length === 0}
        >
          ↻ Redo
        </button>
        <button onClick={handleClear} className="drawing-btn">
          🧹 Clear
        </button>
        <button onClick={handleSave} className="drawing-btn">
          💾 Save
        </button>
      </section>

      <main className="drawing-canvas-outer">
        <div className="drawing-canvas-wrap">
          <canvas
            ref={gridCanvasRef}
            width={width}
            height={height}
            style={{
              position: "absolute",
              pointerEvents: "none",
              opacity: isPixelMode ? 1 : 0,
              zIndex: 1,
              left: 0,
              top: 0
            }}
          />
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseOut={handlePointerUp}
            onMouseMove={handlePointerMove}
            style={{
              border: "3px solid #2563eb",
              borderRadius: 12,
              background: "#fff",
              position: "relative",
              zIndex: 2,
              left: 0,
              top: 0
            }}
          />
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Modal for drawing name */}
      {showNameModal && (
        <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Name your drawing</h2>
            <input
              type="text"
              value={drawingName}
              onChange={e => setDrawingName(e.target.value)}
              autoFocus
              maxLength={50}
              placeholder="Enter drawing name"
              className="modal-input"
              onKeyDown={e => {
                if (e.key === "Enter") handleConfirmSave();
                if (e.key === "Escape") setShowNameModal(false);
              }}
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowNameModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleConfirmSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
