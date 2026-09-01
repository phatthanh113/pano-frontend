import React from "react";
import "./BuildingSidebar.css";

export default function BuildingSidebar({ buildings, activeBuilding, activeFloor, onSelectBuilding, onSelectFloor }) {
  if (!buildings || buildings.length === 0) {
    return (
      <aside className="building-sidebar" aria-label="Building selector">
        <div style={{ padding: 12, fontSize: 12, color: "#64748b", textAlign: "center" }}>Chưa có Building</div>
      </aside>
    );
  }
  return (
    <aside className="building-sidebar" aria-label="Building selector">
      {buildings.map((b) => {
        // single building button - building tách rời nên activeBuilding có thể null
        if (b.type === "single") {
          const isActive = activeBuilding?.id === b.id;
          return (
            <button
              key={b.id}
              className={`bs-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelectBuilding(b)}
            >
              {b.name}
            </button>
          );
        }
        // group building
        const isGroupActive = activeBuilding?.id === b.id;
        return (
          <div key={b.id} className={`bs-group ${isGroupActive ? "group-active" : ""}`}>
            <div className="bs-group-label">{b.name}</div>
            <div className="bs-group-list">
              {b.floors.map((f) => {
                const isActive = isGroupActive && activeFloor?.id === f.id;
                return (
                  <button
                    key={f.id}
                    className={`bs-btn bs-floor-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      if (!isGroupActive) onSelectBuilding(b);
                      onSelectFloor(f);
                    }}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
