import React from "react";
import "./TopHeader.css";

export default function TopHeader({
  activeBuilding,
  activeFloor,
  activePanorama,
  viewMode,
  onToggleViewMode,
  onOpenGoogleMap,
  onOpenVideo,
  onToggleFullscreen,
  onToggleSidebar,
  projects = [],
  selectedProjectId,
  onSelectProject,
  user,
  onLogout,
  showTopButtons = true,
}) {
  const handleImageClick = () => {
    onToggleViewMode(viewMode === "map" ? "panorama" : "map");
  };

  return (
    <header className="top-header-image">
      <div className="th-left">
        {projects.length > 0 && (
          <select
            className="th-project-select"
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            title="Chọn dự án"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        {viewMode === "panorama" && (
          <span className="th-breadcrumb">{activeBuilding?.name} / {activeFloor?.name} / {activePanorama?.name}</span>
        )}
      </div>

      <div className="th-right">
        {showTopButtons && (
          <>
            <button className={`th-icon-btn ${viewMode === "map" ? "active" : ""}`} onClick={() => onToggleViewMode("map")} title="Home / Mặt bằng">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </button>
            <button className="th-icon-btn" onClick={onOpenVideo} title="Video">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </button>
            <button className={`th-icon-btn ${viewMode !== "map" ? "active" : ""}`} onClick={handleImageClick} title="Image - Chuyển 2D/Panorama">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M21 19V5c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h16c.55 0 1-.45 1-1zM18 7l-4 5-3-3-4 6h12z"/></svg>
            </button>
            <button className="th-icon-btn" onClick={onOpenGoogleMap} title="Location - Bản đồ">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </button>
            <button className="th-icon-btn" title="Help" onClick={() => alert("Help: Home=Map, Video=ムービー, Image=Toggle 2D/360, Pin=Google Map, ⛶=Fullscreen, ☰=Show/hide sidebar")}>?</button>
            {user?.role === 'admin' && (
              <a className="th-icon-btn" href="/admin" title="Admin - Quản trị" style={{ textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4a3 3 0 110 6 3 3 0 010-6zm-4 8c0 1.5 1.5 3 4 3s4-1.5 4-3v-1H8v1z"/></svg>
              </a>
            )}
            <button className="th-icon-btn" onClick={onToggleFullscreen} title="Fullscreen">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
          </>
        )}
        <button className="th-icon-btn th-menu-btn" onClick={onToggleSidebar} title="Menu - Show/hide sidebar">☰</button>
        {/* Ẩn logout/account (giữ lại để sau dùng) - D:\pano\src\components\TopHeader\TopHeader.jsx:62
        {user && (
          <>
            <span style={{ fontSize: 11, color: "#374151", marginLeft: 6, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={user.email}>{user.name}</span>
            <button className="th-icon-btn" onClick={onLogout} title={`Đăng xuất (${user.name})`}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </>
        )}
        */}
      </div>
    </header>
  );
}
