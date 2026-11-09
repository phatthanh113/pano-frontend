import React from "react";
import "./TopHeader.css";

export default function TopHeader({
  activeBuilding,
  activeFloor,
  viewMode,
  onToggleViewMode,
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
    onToggleViewMode(viewMode === "map" ? "panaroma" : "map");
  };

  // Nút Link Box: mở link 1; nút Location: mở link 2 — đều lấy từ project đang chọn
  const project = projects.find((p) => p.id === selectedProjectId) || null;
  const panaromaLink = project?.link1 || null;
  const mapLink = project?.link2 || null;
  const openExternalLink = (link) => {
    if (!link) return;
    const url = /^https?:\/\//i.test(link) || link.startsWith("/")
      ? link
      : `https://${link}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const handleLinkBoxClick = () => openExternalLink(panaromaLink);
  const handleLocationClick = () => openExternalLink(mapLink);

  return (
    <header className="top-header-image">
      <div className="th-left">
        {projects.length > 0 && (
          <select
            className="th-project-select"
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            title="Select project"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="th-right">
        {showTopButtons && (
          <>
            <button className={`th-icon-btn ${viewMode === "map" ? "active" : ""}`} onClick={() => onToggleViewMode("map")} title="Home">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </button>
            <button className="th-icon-btn" onClick={onOpenVideo} title="Video">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </button>
            <button className={`th-icon-btn ${viewMode !== "map" ? "active" : ""}`} onClick={handleImageClick} title="Image">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M21 19V5c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h16c.55 0 1-.45 1-1zM18 7l-4 5-3-3-4 6h12z"/></svg>
            </button>
            <button
              className="th-icon-btn"
              onClick={handleLinkBoxClick}
              title={panaromaLink ? `Open link: ${panaromaLink}` : "Link 1"}
              disabled={!panaromaLink}
            >
              <svg viewBox="0 0 24 24" width="30" height="30"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                    <path d="M3 21h18"/>
                    <path d="M5 21V9h6v12"/>
                    <path d="M11 21V3h8v18"/>
                    <path d="M8 12h0M8 15h0M8 18h0"/>
                    <path d="M14 7h2M14 11h2M14 15h2"/>
              </svg>
            </button>
            <button
              className="th-icon-btn"
              onClick={handleLocationClick}
              title={mapLink ? `Open link: ${mapLink}` : "Link 2"}
              disabled={!mapLink}
            >
              <svg viewBox="0 0 24 24" width="30" height="30"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
              </svg>
            </button>
            <button className="th-icon-btn" onClick={onToggleFullscreen} title="Fullscreen">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
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
