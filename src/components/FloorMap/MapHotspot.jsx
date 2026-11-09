import React, { useState, useEffect } from "react";
import { frontViewThumbFromImage } from "../../utils/thumbCrop";

// Cache thumb đã crop (canvas) — khuôn giống card-thumb-img của FooterCarousel
const previewCache = new Map();

export default function MapHotspot({ panaroma, isActive, onClick, onHover }) {
  const { mapPosition, name, label } = panaroma;
  const displayLabel = label || name;
  const [hovered, setHovered] = useState(false);

  // Crop mặt chính diện từ ảnh 360 làm preview (giống card-thumb-img)
  const [cropped, setCropped] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      const raw = panaroma.thumbnail || panaroma.url || null;
      const src = panaroma.url || raw;
      if (!raw) return;
      const yaw = panaroma.defaultView?.yaw ?? 0;
      const key = `${panaroma.id}|${src}|${yaw}`;
      const cached = previewCache.get(key);
      if (previewCache.has(key)) {
        if (cached) setCropped(cached);
        return;
      }
      const result = await frontViewThumbFromImage(src, yaw);
      previewCache.set(key, result || null);
      if (!cancelled && result) setCropped(result);
    };
    generate();
    return () => {
      cancelled = true;
    };
  }, [panaroma?.id, panaroma?.thumbnail, panaroma?.url, panaroma?.defaultView?.yaw]);

  // Chưa crop xong thì tạm dùng ảnh gốc
  const previewSrc = cropped || panaroma.thumbnail || panaroma.url || null;

  const handleEnter = () => {
    setHovered(true);
    if (onHover) onHover(panaroma);
  };
  const handleLeave = () => {
    setHovered(false);
    if (onHover) onHover(null);
  };

  // Popup lật xuống dưới khi điểm gần mép trên, căn lề khi gần mép trái/phải
  const flipBelow = (mapPosition?.y ?? 50) < 35;
  const alignClass =
    (mapPosition?.x ?? 50) < 20 ? "preview-align-left" : (mapPosition?.x ?? 50) > 80 ? "preview-align-right" : "";

  return (
    <div
      className={`map-hotspot ${isActive ? "active" : ""}`}
      style={{ left: `${mapPosition.x}%`, top: `${mapPosition.y}%` }}
      onClick={(e) => { e.stopPropagation(); onClick(panaroma); }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title={`${displayLabel} (Click to view 360°)`}
    >
      {/* Preview ảnh khi hover — như mẫu: ảnh + tên bên dưới */}
      {hovered && previewSrc && (
        <div className={`hotspot-preview ${flipBelow ? "preview-below" : ""} ${alignClass}`} aria-hidden="true">
          <img src={previewSrc} alt="" className="hotspot-preview-img" loading="lazy" draggable={false} />
          <div className="hotspot-preview-name">{displayLabel}</div>
        </div>
      )}
      {/* Black label bar + leader line wrapper */}
      <div className="hotspot-label-wrap">
      </div>

      {/* Pulse + Red dot */}
      <div className="hotspot-pulse-ring"></div>
      <div className="hotspot-dot"></div>
    </div>
  );
}
