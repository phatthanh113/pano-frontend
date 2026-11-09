import React from "react";
import "./BuildingSidebar.css";

export default function BuildingSidebar({ buildings, activeBuilding, activeFloor, onSelectBuilding, onSelectFloor }) {
  if (!buildings || buildings.length === 0) {
    return (
      <aside className="building-sidebar" aria-label="Building selector">
        <div style={{ padding: 12, fontSize: 12, color: "#64748b", textAlign: "center" }}>No building yet.</div>
      </aside>
    );
  }
  return (
    <aside className="building-sidebar" aria-label="Building selector">
      {buildings.map((b) => {
        // single building button - building tách rời nên activeBuilding có thể null
        if (b.type === "single") {
          const isActive = activeBuilding?.id === b.id;
          // Building bị ẩn (status = 0) -> disabled
          const enabled = b.status !== 0;
          return (
            <button
              key={b.id}
              className={`bs-btn ${isActive ? "active" : ""}`}
              onClick={() => enabled && onSelectBuilding(b)}
              disabled={!enabled}
              title={enabled ? b.name : `${b.name} - hidden`}
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
                // Floor bị ẩn (status = 0) -> disabled
                const enabled = f.status !== 0;
                return (
                  <button
                    key={f.id}
                    className={`bs-btn bs-floor-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      if (!isGroupActive) onSelectBuilding(b);
                      onSelectFloor(f);
                    }}
                    disabled={!enabled}
                    title={enabled ? f.name : `${f.name} - hidden`}
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
