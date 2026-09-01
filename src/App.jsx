import React, { useState, useCallback, useEffect } from "react";
import { getActiveFloor as getActiveFloorHelper } from "./buildings";
import { useProjects } from "./hooks/useProjects";
import { useAuth } from "./hooks/useAuth";
import { useSiteSettings } from "./hooks/useSiteSettings";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import BuildingSidebar from "./components/BuildingSidebar/BuildingSidebar";
import FloorMap from "./components/FloorMap/FloorMap";
import FooterCarousel from "./components/FooterCarousel/FooterCarousel";
import PanoramaViewer from "./components/PanoramaViewer/PanoramaViewer";
import TopHeader from "./components/TopHeader/TopHeader";
import SettingsPanel from "./components/SettingsPanel";
import GoogleMapModal from "./components/GoogleMapModal/GoogleMapModal";
import VideoModal from "./components/VideoModal/VideoModal";
import RotatePrompt from "./components/RotatePrompt/RotatePrompt";
import "./styles/index.css";

function App() {
  useSiteSettings();
  const { user, loading: authLoading, login, logout } = useAuth();
  const { projects, loading, isFallback } = useProjects();

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fff" }}>
        <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#6b7280", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  // Loading state khi chờ API
  if (loading || !projects || projects.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12, background: "#0f172a", color: "#fff" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #334155", borderTopColor: "#38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, opacity: 0.8 }}>Đang tải dữ liệu panorama...</span>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }

  return <AppContent projects={projects} isFallback={isFallback} user={user} onLogout={logout} />;
}

function AppContent({ projects, isFallback, user, onLogout }) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  useEffect(() => {
    if (!projects.find((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const buildings = selectedProject.buildings || [];
  const hasBuildings = buildings.length > 0;

  const [activeBuilding, setActiveBuilding] = useState(hasBuildings ? buildings[0] : null);
  const [activeFloorId, setActiveFloorId] = useState(
    hasBuildings && buildings[0].type === "group" ? buildings[0].floors?.[0]?.id ?? null : null
  );

  // Sync khi đổi project: reset building/floor - building tách rời nên có thể rỗng
  useEffect(() => {
    const bs = selectedProject.buildings || [];
    if (!bs.length) {
      setActiveBuilding(null);
      setActiveFloorId(null);
      return;
    }
    const nb = bs.find((b) => b.id === activeBuilding?.id) || bs[0];
    if (!bs.find((b) => b.id === activeBuilding?.id)) {
      setActiveBuilding(nb);
      const fid = nb.type === "group" ? nb.floors?.[0]?.id ?? null : null;
      setActiveFloorId(fid);
    }
  }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getActiveFloor = (b, fid) => {
    if (!b) return null;
    return getActiveFloorHelper(b, fid);
  };
  const activeFloor = getActiveFloor(activeBuilding, activeFloorId);
  const [activePanorama, setActivePanorama] = useState(activeFloor?.panoramas?.[0] ?? null);

  useEffect(() => {
    if (activeFloor?.panoramas?.length && !activeFloor.panoramas.find((p) => p.id === activePanorama?.id)) {
      setActivePanorama(activeFloor.panoramas[0]);
    }
    if (!activeFloor && activePanorama) {
      setActivePanorama(null);
    }
  }, [activeFloor, activePanorama]);
  const [viewMode, setViewMode] = useState("map");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showGmap, setShowGmap] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectBuilding = (building) => {
    if (!building) return;
    setActiveBuilding(building);
    if (building.type === "single") {
      setActiveFloorId(null);
      if (building.panoramas?.length) setActivePanorama(building.panoramas[0]);
      else setActivePanorama(null);
    } else {
      const first = building.floors?.[0];
      if (first) {
        setActiveFloorId(first.id);
        if (first.panoramas?.length) setActivePanorama(first.panoramas[0]);
        else setActivePanorama(null);
      } else {
        setActiveFloorId(null);
        setActivePanorama(null);
      }
    }
  };

  const handleSelectFloor = (floor) => {
    setActiveFloorId(floor.id);
    if (floor.panoramas?.length) setActivePanorama(floor.panoramas[0]);
    else setActivePanorama(null);
  };

  const findPanoramaById = (pid) => {
    for (const b of buildings) {
      if (b.type === "single") {
        const pano = b.panoramas?.find((p) => p.id === pid);
        if (pano) return { building: b, floor: b, panorama: pano };
      } else {
        for (const f of b.floors || []) {
          const pano = f.panoramas?.find((p) => p.id === pid);
          if (pano) return { building: b, floor: f, panorama: pano };
        }
      }
    }
    return null;
  };

  const handleSelectProject = (pid) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    setSelectedProjectId(pid);
    const bs = proj.buildings || [];
    if (!bs.length) {
      setActiveBuilding(null);
      setActiveFloorId(null);
      setActivePanorama(null);
      setViewMode("map");
      return;
    }
    const nb = bs[0];
    setActiveBuilding(nb);
    const fid = nb.type === "group" ? nb.floors?.[0]?.id ?? null : null;
    setActiveFloorId(fid);
    const nf = fid ? nb.floors[0] : nb;
    setActivePanorama(nf?.panoramas?.[0] ?? null);
    setViewMode("map");
  };

  const handleHotspot3DClick = (targetPanoramaId) => {
    const found = findPanoramaById(targetPanoramaId);
    if (found) {
      setActiveBuilding(found.building);
      if (found.building.type === "group") setActiveFloorId(found.floor.id);
      else setActiveFloorId(null);
      setActivePanorama(found.panorama);
    }
  };

  const handleMapPanoramaClick = (pano) => {
    const found = findPanoramaById(pano.id);
    if (found) {
      setActiveBuilding(found.building);
      if (found.building.type === "group") setActiveFloorId(found.floor.id);
      else setActiveFloorId(null);
    }
    setActivePanorama(pano);
    setViewMode("panorama");
  };

  // Footer chỉ show thumbnail của tầng hiện tại, tối đa 6

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Building tách rời: nếu không có building vẫn chạy, hiện empty state đẹp
  if (!hasBuildings) {
    return (
      <div className="app-layout">
        <TopHeader
          activeBuilding={null}
          activeFloor={null}
          activePanorama={null}
          viewMode={viewMode}
          onToggleViewMode={(mode) => setViewMode(mode)}
          onOpenGoogleMap={() => setShowGmap(true)}
          onOpenVideo={() => setShowVideo(true)}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleSidebar={() => setShowSidebar((v) => !v)}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          user={user}
          onLogout={onLogout}
          showTopButtons={showSidebar}
        />
        <main className="main-viewport" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#f8fafc" }}>
          <div style={{ fontSize: 48, opacity: 0.2 }}>🏢</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Dự án "{selectedProject.name}" chưa có Building</div>
          <div style={{ fontSize: 12, color: "#64748b", maxWidth: 360, textAlign: "center" }}>
            Admin có thể thêm Building trong Filament, hoặc thêm Panorama trực tiếp cho Project.<br />
            Dự án vẫn hoạt động bình thường — không bị lỗi.
          </div>
        </main>
        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <GoogleMapModal isOpen={showGmap} onClose={() => setShowGmap(false)} />
        <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} videos={[]} floorName={null} />
        <RotatePrompt />
      </div>
    );
  }

  // Guard nếu building có nhưng floor/pano rỗng
  if (!activeFloor) {
    return (
      <div className="app-layout">
        <TopHeader activeBuilding={activeBuilding} activeFloor={null} activePanorama={null} viewMode={viewMode} onToggleViewMode={(mode) => setViewMode(mode)} onOpenGoogleMap={() => setShowGmap(true)} onOpenVideo={() => setShowVideo(true)} onToggleFullscreen={handleToggleFullscreen} onToggleSidebar={() => setShowSidebar((v) => !v)} projects={projects} selectedProjectId={selectedProjectId} onSelectProject={handleSelectProject} user={user} onLogout={onLogout} showTopButtons={showSidebar} />
        <main className="main-viewport" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Building "{activeBuilding.name}" chưa có Floor/Panorama</span>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {isFallback && (
        <div style={{ position: "fixed", bottom: 8, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#000", padding: "4px 12px", borderRadius: 20, fontSize: 11, zIndex: 9999, opacity: 0.9 }}>
          Đang dùng dữ liệu mẫu (API chưa có data) — hãy thêm dữ liệu trong Filament Admin
        </div>
      )}
      <TopHeader
        activeBuilding={activeBuilding}
        activeFloor={activeFloor}
        activePanorama={activePanorama}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        onOpenGoogleMap={() => setShowGmap(true)}
        onOpenVideo={() => setShowVideo(true)}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        user={user}
        showTopButtons={showSidebar}
        onLogout={onLogout}
      />

      <main className="main-viewport">
        {viewMode === "map" ? (
          activePanorama ? <FloorMap floor={activeFloor} building={activeBuilding} activePanorama={activePanorama} onSelectPanorama={handleMapPanoramaClick} /> : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 13 }}>Chưa có Panorama</div>
        ) : (
          activePanorama ? (
            <PanoramaViewer
              panorama={activePanorama}
              floor={activeFloor}
              building={activeBuilding}
              onHotspotClick={handleHotspot3DClick}
              onSelectPanorama={(pano) => setActivePanorama(pano)}
              onReturnToMap={() => setViewMode("map")}
              showLeftToolbar={showSidebar}
            />
          ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Chưa có Panorama</div>
        )}
        {showSidebar && hasBuildings && (
          <BuildingSidebar
            buildings={buildings}
            activeBuilding={activeBuilding}
            activeFloor={activeFloor}
            onSelectBuilding={handleSelectBuilding}
            onSelectFloor={handleSelectFloor}
          />
        )}
        <FooterCarousel panoramas={activeFloor?.panoramas || []} activePanorama={activePanorama} onSelectPanorama={handleMapPanoramaClick} floorId={activeFloor?.id} />
      </main>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <GoogleMapModal isOpen={showGmap} onClose={() => setShowGmap(false)} />
      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} videos={activeFloor?.videos || []} floorName={activeFloor?.name} />
      <RotatePrompt />
    </div>
  );
}

export default App;
