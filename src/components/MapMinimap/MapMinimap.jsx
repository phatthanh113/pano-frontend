import React from "react";
import "./MapMinimap.css";

export default function MapMinimap({ floor, activePanorama, onSelectPanorama, scale = 1, currentYaw }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const baseW = isMobile ? 140 : 190;
  const baseH = isMobile ? 100 : 140;
  const coneSize = Math.round(56 * Math.min(scale, 2.2));
  const hasYaw = typeof currentYaw === "number";

  return (
    <div className="map-minimap-box" style={{ width: `${Math.round(baseW * scale)}px`, height: `${Math.round(baseH * scale)}px` }}>
      <div className="map-minimap-inner">
        <img src={floor?.planImage} alt={floor?.name} className="map-minimap-img" draggable={false} />
        {floor?.panoramas?.map((p) => {
          const isActive = activePanorama?.id === p.id;
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.mapPosition.x}%`,
                top: `${p.mapPosition.y}%`,
                width: 0,
                height: 0,
                zIndex: isActive ? 20 : 10,
              }}
              onClick={(e) => { e.stopPropagation(); onSelectPanorama(p); }}
              title={p.label || p.name}
            >
              {isActive && hasYaw && (
                <div
                  className="mm-cone"
                  style={{
                    width: `${coneSize}px`,
                    height: `${coneSize}px`,
                    top: `-${coneSize}px`,
                    left: `-${coneSize / 2}px`,
                    // backend map_angle 0°=Đông (sang phải), 90°=Nam, 180°=Tây - cone fan gốc chỉ Bắc, nên +90° để khớp Ảnh 1
                    transform: `rotate(${(currentYaw + 90) % 360}deg)`,
                    transformOrigin: `${coneSize / 2}px ${coneSize}px`,
                  }}
                >
                  <div className="mm-cone-fan" />
                </div>
              )}
              <button
                className={`mm-dot ${isActive ? "active" : ""}`}
                style={{ transform: "translate(-50%, -50%)" }}
                tabIndex={-1}
                aria-label={p.label || p.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
