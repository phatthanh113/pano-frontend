import React, { useState } from "react";
import { frontViewThumbFromImage } from "../../utils/thumbCrop";
import "./FooterCarousel.css";

const VISIBLE_COUNT = 6;

// Cache thumb đã crop (canvas)
const thumbCache = new Map();

export default function FooterCarousel({
  panaromas,
  activePanaroma,
  onSelectPanaroma,
  floorId,
  // Controlled collapse: dùng chung 1 nút footer-collapse-bar với các khu vực khác (pano-image-options)
  collapsed: collapsedProp,
  onCollapseChange,
}) {
  const [collapsedState, setCollapsedState] = useState(false);
  const collapsed = collapsedProp ?? collapsedState;
  const toggleCollapsed = () => {
    if (onCollapseChange) onCollapseChange(!collapsed);
    else setCollapsedState((v) => !v);
  };
  const [start, setStart] = useState(0);
  const [thumbs, setThumbs] = useState({});
  const [stateKey, setStateKey] = useState({ floorId, activeId: activePanaroma?.id ?? null });

  const list = React.useMemo(() => panaromas || [], [panaromas]);

  // Crop mặt chính diện từ ảnh 360 bằng canvas làm thumbnail (theo hướng nhìn mặc định)
  React.useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      for (const pano of list) {
        const src = pano.url || pano.thumbnail;
        if (!src) continue;
        const yaw = pano.defaultView?.yaw ?? 0;
        const key = `${pano.id}|${src}|${yaw}`;
        if (thumbCache.has(key)) {
          const cached = thumbCache.get(key);
          if (cached) setThumbs((prev) => (prev[key] === cached ? prev : { ...prev, [key]: cached }));
          continue;
        }
        const cropped = await frontViewThumbFromImage(src, yaw);
        if (cancelled) return;
        thumbCache.set(key, cropped || null);
        if (cropped) setThumbs((prev) => ({ ...prev, [key]: cropped }));
      }
    };
    generate();
    return () => {
      cancelled = true;
    };
  }, [list]);

  // Đổi tầng → về đầu danh sách; đổi pano active (chọn từ map/sidebar) → dồn cửa sổ cho thấy nó
  const activeId = activePanaroma?.id ?? null;
  if (stateKey.floorId !== floorId || stateKey.activeId !== activeId) {
    setStateKey({ floorId, activeId });
    if (stateKey.floorId !== floorId) setStart(0);
    else if (activeId) {
      const idx = list.findIndex((p) => p.id === activeId);
      if (idx >= 0) setStart(Math.min(idx, Math.max(0, list.length - VISIBLE_COUNT)));
    }
  }

  const maxStart = Math.max(0, list.length - VISIBLE_COUNT);
  const safeStart = Math.min(Math.max(start, 0), maxStart);
  const visiblePanaromas = list.slice(safeStart, safeStart + VISIBLE_COUNT);
  const canScroll = list.length > VISIBLE_COUNT;
  const canPrev = canScroll && safeStart > 0;
  const canNext = canScroll && safeStart < maxStart;

  // Trượt từng card một, đến đầu/cuối thì dừng (không wrap-around)
  const handleScrollLeft = () => setStart((v) => Math.max(0, v - 1));
  const handleScrollRight = () => setStart((v) => Math.min(maxStart, v + 1));

  return (
    <div className={`footer-wrap ${collapsed ? "collapsed" : ""}`}>
      {!collapsed && (
        <footer className="footer-carousel-container">
          {canScroll && (
            <button className="carousel-nav-circle-btn" onClick={handleScrollLeft} aria-label="Previous" disabled={!canPrev}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#4a4a4a" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}
          <div className="carousel-track">
            {visiblePanaromas.map((pano) => {
              const isActive = activePanaroma?.id === pano.id;
              const fallbackKey = `${pano.id}|${pano.url || pano.thumbnail}|${pano.defaultView?.yaw ?? 0}`;
              const thumbSrc = thumbs[fallbackKey] || pano.thumbnail || pano.url;
              return (
                <div key={pano.id} className={`carousel-card ${isActive ? "active" : ""}`} onClick={() => onSelectPanaroma(pano)} title={`${pano.name}`}>
                  <div className="card-thumb-wrapper">
                    <img src={thumbSrc} alt={pano.name} className="card-thumb-img" loading="lazy" />
                  </div>
                  <div className="card-title-bar"><span className="card-title-text">{pano.name}</span></div>
                </div>
              );
            })}
          </div>
          {canScroll && (
            <button className="carousel-nav-circle-btn" onClick={handleScrollRight} aria-label="Next" disabled={!canNext}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#4a4a4a" strokeWidth="2.5" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          )}
        </footer>
      )}
      <button className="footer-collapse-bar" onClick={toggleCollapsed} title={collapsed ? "Open panaroma list" : "Close panaroma list"}>
        <span className={`collapse-icon ${collapsed ? "up" : "down"}`}>{collapsed ? "︿" : "﹀"}</span>
      </button>
    </div>
  );
}
