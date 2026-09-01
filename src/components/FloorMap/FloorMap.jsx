import React, { useState } from "react";
import MapHotspot from "./MapHotspot";
import MapMinimap from "../MapMinimap/MapMinimap";
import "./FloorMap.css";

export default function FloorMap({ floor, building, activePanorama, onSelectPanorama }) {
  const [showMinimap, setShowMinimap] = useState(true);
  const [miniScale, setMiniScale] = useState(1);

  return (
    <div className="floor-map-container">
      {/* Minimap top-right - Ảnh 2/3 đỏ */}
      <div className="map-minimap-wrap">
        {showMinimap && <MapMinimap floor={floor} activePanorama={activePanorama} onSelectPanorama={onSelectPanorama} scale={miniScale} />}
        <div className="mm-ctrls">
          <button className="mm-ctrl-btn" onClick={() => setShowMinimap((v) => !v)} title={showMinimap ? "Ẩn minimap" : "Hiện minimap"}>
            {showMinimap ? "«" : "»"}
          </button>
          <button
            className="mm-ctrl-btn"
            onClick={() => setMiniScale((s) => (s === 1 ? 1.75 : s === 1.75 ? 2.6 : 1))}
            title="Phóng to minimap (1x → 1.75x → 2.6x)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="floor-map-stage">
        <div className="map-image-wrapper">
          <img src={floor.planImage} alt={floor.name} className="floor-plan-img" draggable={false} />
          <div className="hotspots-layer">
            {floor.panoramas.map((pano) => (
              <MapHotspot key={pano.id} panorama={pano} isActive={activePanorama?.id === pano.id} onClick={(s) => onSelectPanorama(s)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
