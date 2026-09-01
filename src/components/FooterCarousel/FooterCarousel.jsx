import React, { useRef, useState } from "react";
import "./FooterCarousel.css";

export default function FooterCarousel({ panoramas, activePanorama, onSelectPanorama, floorId }) {
  const scrollRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleScrollLeft = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    if (el.scrollLeft <= 5) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: -320, behavior: "smooth" });
  };
  const handleScrollRight = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: 320, behavior: "smooth" });
  };

  // Giữ thứ tự cố định, tối đa 6, chỉ highlight - không nhảy lung tung
  const visiblePanoramas = React.useMemo(() => {
    const list = panoramas || [];
    return list.slice(0, 6);
  }, [panoramas]);

  // Chọn tầng mới thì chạy về đầu
  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }, [floorId]);

  return (
    <div className={`footer-wrap ${collapsed ? "collapsed" : ""}`}>
      {!collapsed && (
        <footer className="footer-carousel-container">
          <button className="carousel-nav-circle-btn" onClick={handleScrollLeft} aria-label="Previous">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="#4a4a4a" strokeWidth="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="carousel-track" ref={scrollRef}>
            {visiblePanoramas.map((pano) => {
              const isActive = activePanorama?.id === pano.id;
              return (
                <div key={pano.id} className={`carousel-card ${isActive ? "active" : ""}`} onClick={() => onSelectPanorama(pano)} title={`${pano.name}`}>
                  <div className="card-thumb-wrapper">
                    <img src={pano.thumbnail || pano.url} alt={pano.name} className="card-thumb-img" loading="lazy" />
                  </div>
                  <div className="card-title-bar"><span className="card-title-text">{pano.name}</span></div>
                </div>
              );
            })}
          </div>
          <button className="carousel-nav-circle-btn" onClick={handleScrollRight} aria-label="Next">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="#4a4a4a" strokeWidth="2.5" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </footer>
      )}
      <button className="footer-collapse-bar" onClick={() => setCollapsed((v) => !v)} title={collapsed ? "Mở panorama list" : "Đóng panorama list"}>
        <span className={`collapse-icon ${collapsed ? "up" : "down"}`}>{collapsed ? "︿" : "﹀"}</span>
      </button>
    </div>
  );
}
