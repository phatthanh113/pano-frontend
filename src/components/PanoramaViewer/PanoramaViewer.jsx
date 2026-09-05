import React, { useRef, useState, useCallback, useEffect } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/markers-plugin/index.css";
import MapMinimap from "../MapMinimap/MapMinimap";
import "./PanoramaViewer.css";

export default function PanoramaViewer({ panorama, floor, onHotspotClick, onSelectPanorama, showLeftToolbar = true }) {
  const viewerRef = useRef(null);
  // map_angle chính là hướng default khi nhảy vào panorama (theo yêu cầu) -> ưu tiên mapPosition.angle
  const getInitialAngle = (p) => {
    if (typeof p?.mapPosition?.angle === "number") return p.mapPosition.angle;
    return p?.defaultView?.yaw ?? 0;
  };
  const [currentYaw, setCurrentYaw] = useState(getInitialAngle(panorama));
  const [showMinimap, setShowMinimap] = useState(true);
  const [miniScale, setMiniScale] = useState(1);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [visiblePanorama, setVisiblePanorama] = useState(panorama);
  const extraImages = panorama?.extraImages || panorama?.extra_images || [];
  const [activeExtra, setActiveExtra] = useState(null);
  const [footerCollapsed, setFooterCollapsed] = useState(false);
  useEffect(() => { setActiveExtra(null); }, [panorama?.id]);
  useEffect(() => {
    const footer = document.querySelector('.footer-wrap');
    if (!footer) return;
    const update = () => setFooterCollapsed(footer.classList.contains('collapsed'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(footer, { attributes: true, attributeFilter: ['class'] });
    // click on collapse bar also triggers
    const btn = footer.querySelector('.footer-collapse-bar');
    if (btn) btn.addEventListener('click', () => setTimeout(update, 60));
    return () => obs.disconnect();
  }, []);
  const defaultImage = "https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg";

  // Preload panorama đích rồi switch ngay với kích thước thật, không hiệu ứng nhảy
  useEffect(() => {
    if (!panorama || panorama.id === visiblePanorama?.id) return;
    let cancelled = false;
    const url = panorama.url || defaultImage;
    const img = new window.Image();
    img.src = url;
    const done = () => {
      if (cancelled) return;
      setVisiblePanorama(panorama);
      setCurrentYaw(getInitialAngle(panorama));
      setTransitionPhase("idle");
    };
    if (img.complete) {
      done();
    } else {
      img.onload = done;
      img.onerror = done;
    }
    return () => { cancelled = true; };
  }, [panorama, visiblePanorama?.id]);

  const withFadeTransition = useCallback((cb) => {
    // Hotspot click: preload target trước khi fade (cb sẽ đổi panorama -> useEffect trên sẽ lo preload)
    // Giữ fade cũ để tương thích, nhưng giờ chuyển cảnh chính do useEffect preload
    setTransitionPhase("out");
    setTimeout(() => {
      cb();
    }, 150);
  }, []);

  const displayPanorama = visiblePanorama || panorama;
  const isExtraView = activeExtra !== null;
  const viewerSrc = isExtraView ? extraImages[activeExtra] : (displayPanorama?.url || defaultImage);
  const viewerKey = isExtraView ? `extra-${activeExtra}` : displayPanorama?.id;
  const markers = isExtraView ? [] :
    displayPanorama?.hotspots?.map((hotspot) => ({
      id: hotspot.id,
      position: { yaw: `${hotspot.yaw}deg`, pitch: `${hotspot.pitch}deg` },
      html: `
        <div class="scene-hotspot-pin">
          <div class="scene-hotspot-badge">${hotspot.tooltip || hotspot.targetPanorama || "Đi tiếp"}</div>
          <div class="scene-hotspot-pointer">▼</div>
          <div class="scene-hotspot-ring-wrap">
            <div class="scene-hotspot-ring"></div>
            <div class="scene-hotspot-pulse"></div>
            <div class="scene-hotspot-pulse scene-hotspot-pulse--delay"></div>
          </div>
        </div>
      `,
      anchor: "bottom center",
      data: { targetPanorama: hotspot.targetPanorama },
    })) || [];

  const handleReady = (instance) => {
    viewerRef.current = instance;
    instance.addEventListener("position-updated", (e) => {
      if (e.position) setCurrentYaw((e.position.yaw * (180 / Math.PI)) % 360);
    });
    const markersPlugin = instance.getPlugin(MarkersPlugin);
    if (markersPlugin) {
      markersPlugin.addEventListener("select-marker", (e) => {
        const targetId = e.marker.data?.targetPanorama;
        if (!targetId || !onHotspotClick) return;
        // Lấy hotspot để zoom đúng điểm click
        const markerId = e.marker.id;
        const hotspot = displayPanorama?.hotspots?.find((h) => h.id === markerId || h.targetPanorama === targetId);
        if (hotspot && viewerRef.current) {
          try {
            // Zoom vào đúng điểm hotspot trong 2s như trang T-TOKAI
            viewerRef.current.animate({
              yaw: `${hotspot.yaw}deg`,
              pitch: `${hotspot.pitch}deg`,
              zoom: 75,
              speed: 2000,
            });
          } catch {}
          // Sau 2s mới chuyển sang panorama đích với kích thước thật
          setTimeout(() => {
            onHotspotClick(targetId);
          }, 2000);
        } else {
          withFadeTransition(() => onHotspotClick(targetId));
        }
      });
    }
  };

  const handlePanoZoomIn = () => viewerRef.current?.zoom(viewerRef.current.getZoomLevel() + 15);
  const handlePanoZoomOut = () => viewerRef.current?.zoom(viewerRef.current.getZoomLevel() - 15);
  const handleToggleFullscreen = () => viewerRef.current?.toggleFullscreen();

  const plugins = [[MarkersPlugin, { markers }]];

  return (
    <div className="panorama-viewer-container">
      {/* Backdrop mờ để không bao giờ hiện màn hình đen khi chuyển cảnh */}
      <div
        className="pano-backdrop"
        style={{
          backgroundImage: `url(${isExtraView ? viewerSrc : (displayPanorama?.thumbnail || displayPanorama?.url || "")})`,
        }}
      />
      {/* Unified minimap - ẩn hiện theo th-menu-btn */}
      {showLeftToolbar && (
        <div className="pano-unified-minimap-wrap">
        {showMinimap && (
          <MapMinimap
            floor={floor}
            activePanorama={panorama}
            onSelectPanorama={onSelectPanorama}
            scale={miniScale}
            currentYaw={currentYaw}
          />
        )}
        <div className="mm-ctrls">
          <button className="mm-ctrl-btn" onClick={() => setShowMinimap((v) => !v)} title={showMinimap ? "Ẩn minimap" : "Hiện minimap"}>
            {showMinimap ? "«" : "»"}
          </button>
          <button
            className="mm-ctrl-btn"
            onClick={() => setMiniScale((s) => (s === 1 ? 1.75 : s === 1.75 ? 2.6 : 1))}
            title="Phóng to minimap (1x → 1.75x → 2.6x)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
          </button>
        </div>
      </div>
      )}

      <div className={`pano-scene-wrapper pano-scene-${transitionPhase}`}>
        <ReactPhotoSphereViewer
          key={viewerKey}
          src={viewerSrc}
          height={"100vh"}
          width={"100%"}
          container={""}
          navbar={false}
          plugins={plugins}
          onReady={handleReady}
          defaultYaw={isExtraView ? "0deg" : `${getInitialAngle(displayPanorama)}deg`}
          defaultPitch={isExtraView ? "0deg" : `${displayPanorama?.defaultView?.pitch || 0}deg`}
        />
        </div>



      {/* Gallery thumbnails - hiện khi có extraImages (if exist) - tự động lên/xuống theo footer collapse */}
      {extraImages.length > 0 && (
        <div className={`extra-gallery-bar ${isExtraView ? "extra-gallery-bar--active" : ""} ${footerCollapsed ? "extra-gallery-bar--footer-collapsed" : ""}`}>
          {extraImages.map((src, idx) => (
            <button key={idx} className={`extra-thumb-btn ${activeExtra === idx ? "active" : ""}`} onClick={() => setActiveExtra(idx)} title={`Xem panorama ${idx + 1}`}>
              <img src={src} alt={`thumb ${idx + 1}`} />
            </button>
          ))}
          {isExtraView && (
            <button className="extra-thumb-btn extra-thumb-back" onClick={() => setActiveExtra(null)} title="Back to main panorama" aria-label="Back">
              <svg viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path><path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path></svg>
            </button>
          )}
        </div>
      )}

      {showLeftToolbar && (
        <div className="pano-bottomleft-toolbar">
          <button className="bottom-tool-btn" onClick={handlePanoZoomIn} title="Phóng to 360">+</button>
          <button className="bottom-tool-btn" onClick={handlePanoZoomOut} title="Thu nhỏ 360">-</button>
          {extraImages.length > 0 && (
            <button className="bottom-tool-btn extra-gallery-btn" onClick={() => setActiveExtra(0)} title={`Ảnh chi tiết (${extraImages.length})`}>
              <span style={{ fontSize: 12 }}>🖼</span>
              <span className="extra-badge">{extraImages.length}</span>
            </button>
          )}
          <button className="bottom-tool-btn" title="Thông tin">ℹ</button>
          <button className="bottom-tool-btn" onClick={handleToggleFullscreen} title="Toàn màn hình">⛶</button>
        </div>
      )}
    </div>
  );
}
