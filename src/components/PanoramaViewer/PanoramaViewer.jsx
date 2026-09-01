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
  const markers =
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
          backgroundImage: `url(${displayPanorama?.thumbnail || displayPanorama?.url || ""})`,
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
          key={displayPanorama?.id}
          src={displayPanorama?.url || defaultImage}
          height={"100vh"}
          width={"100%"}
          container={""}
          navbar={false}
          plugins={plugins}
          onReady={handleReady}
          defaultYaw={`${getInitialAngle(displayPanorama)}deg`}
          defaultPitch={`${displayPanorama?.defaultView?.pitch || 0}deg`}
        />
        </div>

      {showLeftToolbar && (
        <div className="pano-bottomleft-toolbar">
          <button className="bottom-tool-btn" onClick={handlePanoZoomIn} title="Phóng to 360">+</button>
          <button className="bottom-tool-btn" onClick={handlePanoZoomOut} title="Thu nhỏ 360">-</button>
          <button className="bottom-tool-btn" title="Thông tin">ℹ</button>
          <button className="bottom-tool-btn" onClick={handleToggleFullscreen} title="Toàn màn hình">⛶</button>
        </div>
      )}
    </div>
  );
}
