import React, { useState } from "react";
import MapHotspot from "./MapHotspot";
import MapMinimap from "../MapMinimap/MapMinimap";
import "./FloorMap.css";

export default function FloorMap({ floor, building, activePanaroma, onSelectPanaroma, onLogout }) {
  const [showMinimap, setShowMinimap] = useState(false);
  const [miniScale, setMiniScale] = useState(1);

  return (
    <div className="floor-map-container">
      {/* Minimap top-right - Ảnh 2/3 đỏ */}
      <div className="map-minimap-wrap">
        {showMinimap && <MapMinimap floor={floor} activePanaroma={activePanaroma} onSelectPanaroma={onSelectPanaroma} scale={miniScale} />}
        <div className="mm-ctrls">
          <button className="mm-ctrl-btn" onClick={() => setShowMinimap((v) => !v)} title={showMinimap ? "Hide minimap" : "Show minimap"}>
            {showMinimap ? "«" : "»"}
          </button>
          <button
            className="mm-ctrl-btn"
            onClick={() => setMiniScale((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
            title="Zoom in on minimap"
          >
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
          </button>
          {onLogout && (
            <button className="mm-ctrl-btn" onClick={onLogout} title="Logout">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="floor-map-stage">
        <div className="map-image-wrapper">
          <img src={floor.planImage} alt={floor.name} className="floor-plan-img" draggable={false} />
          <div className="hotspots-layer">
            {(floor.panaromas || []).map((pano) => (
              <MapHotspot key={pano.id} panaroma={pano} isActive={activePanaroma?.id === pano.id} onClick={(s) => onSelectPanaroma(s)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
