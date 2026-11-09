import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import * as THREE from "three";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { EquirectangularAdapter } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/markers-plugin/index.css";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import MapMinimap from "../MapMinimap/MapMinimap";
import { frontViewThumbFromImage } from "../../utils/thumbCrop";
import "./PanaromaViewer.css";

// Cache crop canvas cho option chưa có thumbUrl từ server
const optThumbCache = new Map();

// Số phân đoạn mặt cầu của PSV (mặc định 64). Phải là luỹ thừa của 2: 128 hoặc 256.
// Đặt NGOÀI component để tham chiếu không đổi giữa các lần render.
const EQUI_ADAPTER = [EquirectangularAdapter, { resolution: 256 }];

// Bật mipmap + anisotropic filtering cho texture hiện tại của viewer
const applyTexQuality = (instance) => {
  try {
    const r = instance.renderer?.renderer;
    const tex =
      instance.state?.textureData?.texture ??
      instance.renderer?.mesh?.material?.map;
    if (!tex || !r) return;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = r.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    instance.needsUpdate();
  } catch {
    // texture patch lỗi sẽ tự fallback vào cấu hình mặc định của PSV
  }
};

// Phone/tablet: minimap mặc định ẩn khi vào panorama (PC luôn show)
const checkTouchDevice = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isTouch = navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPod|Mobile|Silk/i.test(ua) || (/iPad|Macintosh/.test(ua) && isTouch);
};

export default function PanaromaViewer({ panaroma, floor, onHotspotClick, onSelectPanaroma, showLeftToolbar = true, onReturnToMap, onLogout, showImageOptions = true }) {
  const viewerRef = useRef(null);
  const getInitialAngle = (p) => {
    if (typeof p?.mapPosition?.angle === "number") return p.mapPosition.angle;
    return p?.defaultView?.yaw ?? 0;
  };
  const [currentYaw, setCurrentYaw] = useState(((getInitialAngle(panaroma) % 360) + 360) % 360);
  const [showMinimap, setShowMinimap] = useState(!checkTouchDevice());
  const [miniScale, setMiniScale] = useState(1);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [visiblePanaroma, setVisiblePanaroma] = useState(panaroma);
  const defaultImage = "https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg";

  // ---- Cảm biến xoay (Gyroscope) - chỉ hiện trên smartphone/tablet ----
  const [gyroSupported, setGyroSupported] = useState(false);
  const [gyroOn, setGyroOn] = useState(false);
  const gyroWantedRef = useRef(false);

  // Đẩy scale minimap ra CSS var --mm-scale để building-sidebar tự dịch xuống tương ứng
  // Hide minimap («) -> giá trị 1 để building-sidebar trở lại vị trí default
  useEffect(() => {
    const value = showMinimap ? String(miniScale) : "1";
    document.documentElement.style.setProperty("--mm-scale", value);
    return () => {
      document.documentElement.style.setProperty("--mm-scale", "1");
    };
  }, [miniScale, showMinimap]);
  const isMobileDevice = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const isTouch = navigator.maxTouchPoints > 1;
    // smartphone + tablet (iPad desktop-mode: Macintosh + multi-touch)
    return /Android|iPhone|iPod|Mobile|Silk/i.test(ua) || (/iPad|Macintosh/.test(ua) && isTouch);
  }, []);

  // ---- Đa option ảnh cho 1 vị trí ----
  const imageOptions = useMemo(() => {
    if (!panaroma) return [];
    const extras = panaroma.images || panaroma.panaromaImages || [];
    const main = {
      id: `${panaroma.id}__main`,
      title: panaroma.name || "Ảnh chính",
      thumbnail: panaroma.thumbnail || panaroma.url,
      url: panaroma.url || panaroma.thumbnail,
      isMain: true,
    };
    const extraOpts = (Array.isArray(extras) ? extras : []).map((img, idx) => ({
      id: String(img.id ?? `${panaroma.id}__opt_${idx}`),
      title: img.title || `Option ${idx + 1}`,
      thumbnail: img.thumbnail || img.url,
      url: img.url || img.thumbnail,
      isMain: false,
    }));
    return [main, ...extraOpts];
  }, [panaroma]);

  // Chỉ các option con (không kèm ảnh gốc) đã lọc ra
  const extraOptions = useMemo(() => imageOptions.filter((opt) => !opt.isMain), [imageOptions]);

  const hasMultipleOptions = extraOptions.length > 0;
  const [activeOptionIdx, setActiveOptionIdx] = useState(0);

  // Reset option khi đổi vị trí panaroma
  useEffect(() => {
    setActiveOptionIdx(0);
  }, [panaroma?.id]);

  const activeOption = imageOptions[activeOptionIdx] || imageOptions[0] || null;
  const currentUrl = activeOption?.url || panaroma?.url || defaultImage;
  const currentThumb = activeOption?.thumbnail || panaroma?.thumbnail || panaroma?.url;

  // Crop mặt chính diện bằng canvas làm thumbnail (theo hướng nhìn mặc định của panaroma)
  const [optThumbs, setOptThumbs] = useState({});
  // Hướng nhìn mặc định của panaroma, dùng chung cho main + các option
  const optYaw = panaroma?.defaultView?.yaw ?? 0;
  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      for (const opt of imageOptions) {
        const src = opt.thumbnail || opt.url;
        if (!src) continue;
        const key = `${opt.id}|${src}|${optYaw}`;
        if (optThumbCache.has(key)) {
          const cached = optThumbCache.get(key);
          if (cached) setOptThumbs((prev) => (prev[key] === cached ? prev : { ...prev, [key]: cached }));
          continue;
        }
        const cropped = await frontViewThumbFromImage(src, optYaw);
        if (cancelled) return;
        optThumbCache.set(key, cropped || null);
        if (cropped) setOptThumbs((prev) => ({ ...prev, [key]: cropped }));
      }
    };
    generate();
    return () => {
      cancelled = true;
    };
  }, [imageOptions, optYaw]);

  const optThumbSrc = (opt) => {
    const src = opt.thumbnail || opt.url;
    return optThumbs[`${opt.id}|${src}|${optYaw}`] || opt.thumbnail || opt.url;
  };

  // Preload khi đổi panaroma (theo id) — giữ logic cũ nhưng dùng currentUrl khi cần
  useEffect(() => {
    if (!panaroma || panaroma.id === visiblePanaroma?.id) return;
    let cancelled = false;
    // luôn preload ảnh main của panaroma mới; option sẽ reset về 0
    const url = panaroma.url || defaultImage;
    const img = new window.Image();
    img.src = url;
    const done = () => {
      if (cancelled) return;
      setVisiblePanaroma(panaroma);
      setCurrentYaw(getInitialAngle(panaroma));
      setTransitionPhase("idle");
    };
    if (img.complete) done();
    else {
      img.onload = done;
      img.onerror = done;
    }
    return () => { cancelled = true; };
  }, [panaroma, visiblePanaroma?.id]);

  // Preload khi đổi option trong cùng vị trí
  const [preloadedUrl, setPreloadedUrl] = useState(currentUrl);
  useEffect(() => {
    if (currentUrl === preloadedUrl) return;
    const img = new window.Image();
    img.src = currentUrl;
    const done = () => setPreloadedUrl(currentUrl);
    if (img.complete) done();
    else {
      img.onload = done;
      img.onerror = done;
    }
  }, [currentUrl, preloadedUrl]);

  const withFadeTransition = useCallback((cb) => {
    setTransitionPhase("out");
    setTimeout(() => cb(), 220);
  }, []);

  const displayPanaroma = visiblePanaroma || panaroma;
  const markers =
    displayPanaroma?.hotspots?.map((hotspot) => ({
      id: hotspot.id,
      position: { yaw: `${hotspot.yaw}deg`, pitch: `${hotspot.pitch}deg` },
      html: `
        <div class="scene-hotspot-pin">
          <div class="scene-hotspot-badge">${hotspot.tooltip || hotspot.targetPanaroma || "Go to next"}</div>
          <div class="scene-hotspot-pointer">▼</div>
          <div class="scene-hotspot-ring-wrap">
            <div class="scene-hotspot-ring"></div>
            <div class="scene-hotspot-pulse"></div>
            <div class="scene-hotspot-pulse scene-hotspot-pulse--delay"></div>
          </div>
        </div>
      `,
      anchor: "bottom center",
      data: { targetPanaroma: hotspot.targetPanaroma },
    })) || [];

  const handleReady = (instance) => {
    viewerRef.current = instance;

    // Chống nhiễu/răng cưa: cap devicePixelRatio <= 2
    const threeRenderer = instance.renderer?.renderer;
    if (threeRenderer) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      threeRenderer.setPixelRatio(dpr);
      threeRenderer.setSize(
        threeRenderer.domElement.clientWidth || 1,
        threeRenderer.domElement.clientHeight || 1,
        false
      );
    }

    // Chống shimmering khi minify texture: bật mipmap + anisotropic filtering.
    // Áp dụng NGAY cho ảnh vừa load (sự kiện "ready" bắn sau "panorama-loaded" của ảnh đầu tiên,
    // nên listener đăng ký ở đây sẽ bỏ lỡ ảnh đó), và giữ listener cho các ảnh load sau.
    applyTexQuality(instance);
    instance.addEventListener("panorama-loaded", () => applyTexQuality(instance));

    // Cập nhật yaw: lọc bước nhảy <2° để tránh re-render liên tục khi gyro chạy
    let lastYaw = null;
    instance.addEventListener("position-updated", (e) => {
      if (!e.position) return;
      const deg = (((e.position.yaw * 180) / Math.PI) % 360 + 360) % 360;
      if (lastYaw !== null && Math.abs(deg - lastYaw) < 2) return;
      lastYaw = deg;
      setCurrentYaw(deg);
    });

    // Gyroscope plugin: kiểm tra hỗ trợ + đồng bộ state bật/tắt cảm biến
    const gyro = instance.getPlugin(GyroscopePlugin);
    if (gyro) {
      gyro.isSupported().then(setGyroSupported).catch(() => setGyroSupported(false));
      gyro.addEventListener("gyroscope-updated", (e) => setGyroOn(e.gyroscopeEnabled));
      setGyroOn(false);
      // Tuỳ chọn: tự bật lại sau khi chuyển vị trí. iOS có thể từ chối, lúc đó người dùng bấm lại nút.
      if (gyroWantedRef.current) gyro.start().catch(() => (gyroWantedRef.current = false));
    }

    const markersPlugin = instance.getPlugin(MarkersPlugin);
    if (markersPlugin) {
      markersPlugin.addEventListener("select-marker", (e) => {
        const targetId = e.marker.data?.targetPanaroma;
        if (!targetId || !onHotspotClick) return;
        // Gyro đang bật sẽ ghi đè animate() mỗi khung hình -> tắt tạm trước khi chuyển vị trí
        const gyroNow = viewerRef.current?.getPlugin(GyroscopePlugin);
        if (gyroNow?.isEnabled()) gyroNow.stop();
        const markerId = e.marker.id;
        const hotspot = displayPanaroma?.hotspots?.find((h) => h.id === markerId || h.targetPanaroma === targetId);
        if (hotspot && viewerRef.current) {
          try {
            viewerRef.current.animate({
              yaw: `${hotspot.yaw}deg`,
              pitch: `${hotspot.pitch}deg`,
              zoom: 75,
              speed: 300,
            });
          } catch {}
          setTimeout(() => onHotspotClick(targetId), 500);
        } else {
          withFadeTransition(() => onHotspotClick(targetId));
        }
      });
    }
  };

  const handlePanoZoomIn = () => viewerRef.current?.zoom(viewerRef.current.getZoomLevel() + 15);
  const handlePanoZoomOut = () => viewerRef.current?.zoom(viewerRef.current.getZoomLevel() - 15);
  const handleToggleFullscreen = () => viewerRef.current?.toggleFullscreen();

  // Bật/tắt cảm biến xoay: gọi start() ngay trong onClick (không await gì trước),
  // iPhone chỉ hiện hộp xin quyền khi nó nằm trực tiếp trong lần bấm của người dùng.
  const handleToggleGyro = () => {
    const gyro = viewerRef.current?.getPlugin(GyroscopePlugin);
    if (!gyro) return;
    if (gyro.isEnabled()) {
      gyroWantedRef.current = false;
      gyro.stop();
    } else {
      gyroWantedRef.current = true;
      gyro.start().catch(() => {
        gyroWantedRef.current = false;
        alert("Không bật được cảm biến. Hãy cho phép truy cập chuyển động/hướng của thiết bị.");
      });
    }
  };

  const plugins = [
    [MarkersPlugin, { markers }],
    [GyroscopePlugin, { touchmove: true, moveMode: "smooth" }],
  ];

  return (
    <div className="panaroma-viewer-container">
      <div
        className="pano-backdrop"
        style={{ backgroundImage: `url(${currentThumb || displayPanaroma?.thumbnail || displayPanaroma?.url || ""})` }}
      />
      {showLeftToolbar && (
        <div className="pano-unified-minimap-wrap">
          {showMinimap && (
            <MapMinimap
              floor={floor}
              activePanaroma={panaroma}
              onSelectPanaroma={onSelectPanaroma}
              scale={miniScale}
              currentYaw={currentYaw}
            />
          )}
          <div className="mm-ctrls">
            <button className="mm-ctrl-btn" onClick={() => setShowMinimap((v) => !v)} title={showMinimap ? "Hide minimap" : "Show minimap"}>
              {showMinimap ? "«" : "»"}
            </button>
            <button
              className="mm-ctrl-btn"
              onClick={() => setMiniScale((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
              title="Zoom in on minimap"
            >
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </button>
            {gyroSupported && isMobileDevice && (
              <button
                className={`mm-ctrl-btn gyro-btn ${gyroOn ? "active" : ""}`}
                onClick={handleToggleGyro}
                title="Xoay theo điện thoại"
              >
                🧭
              </button>
            )}
            {onLogout && (
              <button className="mm-ctrl-btn" onClick={onLogout} title="Logout">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Đa option ảnh cho 1 vị trí - hiển thị khi có >1 ảnh; ẩn/hiện theo nút footer-collapse-bar */}
      {hasMultipleOptions && (
        <div className="pano-image-options">
          {showImageOptions && (
            <div className="pano-image-options-track">
              {extraOptions.map((opt) => {
                const idx = imageOptions.findIndex((o) => o.id === opt.id);
                const isActive = idx === activeOptionIdx;
                return (
                  <button
                    key={opt.id}
                    className={`pano-image-opt ${isActive ? "active" : ""}`}
                    onClick={() => setActiveOptionIdx(idx)}
                    title={opt.title}
                  >
                    <img src={optThumbSrc(opt)} alt={opt.title} className="pano-image-opt-thumb" loading="lazy" />
                    <div className="pano-image-opt-title">
                      <span>{opt.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className={`pano-scene-wrapper pano-scene-${transitionPhase}`}>
        <ReactPhotoSphereViewer
          key={`${displayPanaroma?.id}__opt_${activeOptionIdx}__${preloadedUrl}`}
          src={preloadedUrl || currentUrl || defaultImage}
          adapter={EQUI_ADAPTER}
          height={"100%"}
          width={"100%"}
          container={""}
          navbar={false}
          plugins={plugins}
          onReady={handleReady}
          defaultYaw={`${getInitialAngle(displayPanaroma)}deg`}
          defaultPitch={`0deg`}
          rendererParameters={{ antialias: true, powerPreference: "high-performance" }}
        />
      </div>

      {showLeftToolbar && (
        <div className="pano-bottomleft-toolbar">
          <button className="bottom-tool-btn" onClick={handlePanoZoomIn} title="Zoom in 360">+</button>
          <button className="bottom-tool-btn" onClick={handlePanoZoomOut} title="Zoom out 360">-</button>
          <button className="bottom-tool-btn" onClick={handleToggleFullscreen} title="Full screen">⛶</button>
        </div>
      )}
    </div>
  );
}
