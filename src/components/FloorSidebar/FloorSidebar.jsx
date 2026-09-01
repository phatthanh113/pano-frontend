import React from "react";
import "./FloorSidebar.css";

export default function FloorSidebar({ floors, activeFloor, onSelectFloor }) {
  return (
    <aside className="floor-sidebar" aria-label="Floor selector">
      <div className="floor-list">
        {floors.map((floor) => {
          const isActive = activeFloor?.id === floor.id;
          return (
            <button
              key={floor.id}
              className={`floor-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectFloor(floor)}
              title={floor.name}
            >
              <div className="floor-thumb-wrapper">
                <img
                  src={floor.planImage}
                  alt={floor.name}
                  className="floor-thumb-img"
                  loading="lazy"
                />
                <span className="floor-badge">{floor.shortLabel || floor.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
