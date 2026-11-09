import React from "react";

export default function MiniMap({
  floor,
  activePanaroma,
  currentYaw = 0,
  scale = 1,
  onSelectPanaroma,
  onOpenFullMap,
  onZoomChange
}) {
  // Tự động thu nhỏ trên màn hình nhỏ / mobile (< 768px)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const baseSize = isMobile ? 150 : 240;
  const mapSize = Math.round(baseSize * scale);
  // Kích thước nón radar cân đối theo kích thước bản đồ
  const coneSize = Math.round((isMobile ? 48 : 70) * Math.min(scale, 1.5));

  const handleWheel = (e) => {
    e.stopPropagation();
    if (!onZoomChange) return;
    if (e.deltaY < 0) {
      onZoomChange(Math.min(scale + 0.2, 2.2));
    } else {
      onZoomChange(Math.max(scale - 0.2, 0.8));
    }
  };

  return (
    <div
      className="pano-minimap-box"
      style={{ width: `${mapSize}px` }}
      onWheel={handleWheel}
      title="Mini-map (Scroll or use +/- to zoom in)"
    >
      <div
        className="pano-minimap-img-wrap"
        style={{ height: `${mapSize}px` }}
      >
        <img
          src={floor?.planImage}
          alt={floor?.name}
          className="pano-minimap-img"
          draggable={false}
        />

        {floor?.panaromas?.map((pano) => {
          const isActive = activePanaroma?.id === pano.id;

          return (
            /**
             * ZERO-SIZE wrapper đặt đúng tại (x%, y%) trên bản đồ.
             * Mọi con (dot, cone) đều được neo vào điểm này.
             */
            <div
              key={pano.id}
              style={{
                position: "absolute",
                left: `${pano.mapPosition.x}%`,
                top: `${pano.mapPosition.y}%`,
                width: 0,
                height: 0,
                zIndex: isActive ? 20 : 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPanaroma(pano);
              }}
              title={pano.name}
            >
              {/* Radar Cone:
                  - Đặt phía trên wrapper (top: -coneSize, left: -coneSize/2)
                    → đáy cone (tip) nằm đúng tại điểm wrapper (vị trí chấm)
                  - transformOrigin: center bottom (tính bằng px = coneSize/2, coneSize)
                    → xoay quanh đúng đỉnh cone = vị trí chấm
                  - transform: rotate(yaw) only — không cần translate thêm
              */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    width: `${coneSize}px`,
                    height: `${coneSize}px`,
                    top: `-${coneSize}px`,
                    left: `-${coneSize / 2}px`,
                    transform: `rotate(${currentYaw}deg)`,
                    transformOrigin: `${coneSize / 2}px ${coneSize}px`,
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                >
                  {/* Triangle: tip at bottom-center, fan opens UPWARD */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at 50% 100%, rgba(249,115,22,0.65) 0%, rgba(249,115,22,0.12) 75%, transparent 100%)",
                      clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
                    }}
                  />
                </div>
              )}

              {/* Red/Blue Dot: căn giữa tại wrapper origin bằng transform */}
              <div
                style={{
                  position: "absolute",
                  width: isActive ? "9px" : "8px",
                  height: isActive ? "9px" : "8px",
                  borderRadius: "50%",
                  background: isActive ? "#2563eb" : "#ef4444",
                  border: `${isActive ? 2 : 1.5}px solid #ffffff`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 15,
                  cursor: "pointer",
                  boxShadow: isActive
                    ? "0 0 0 2px rgba(37,99,235,0.4)"
                    : "none",
                }}
              />
            </div>
          );
        })}

        {/* Floor Badge */}
        <span className="pano-minimap-badge">{floor?.shortLabel || floor?.name}</span>
      </div>
    </div>
  );
}
