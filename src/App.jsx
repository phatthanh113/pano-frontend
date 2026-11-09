import React, { useState, useCallback, useEffect, useRef } from "react";
import { getActiveFloor as getActiveFloorHelper } from "./buildings";
import { useProjects } from "./hooks/useProjects";
import { useAuth } from "./hooks/useAuth";
import { useSiteSettings } from "./hooks/useSiteSettings";
import { useProjectSlug } from "./hooks/useProjectSlug";
import {
  findProjectBySlug,
  getProjectUrlSlug,
  getProjectSlugFromPath,
  navigateToProjectSlug,
} from "./utils/slugRouter";
import LoginScreen from "./components/LoginScreen/LoginScreen";
import BuildingSidebar from "./components/BuildingSidebar/BuildingSidebar";
import FloorMap from "./components/FloorMap/FloorMap";
import FooterCarousel from "./components/FooterCarousel/FooterCarousel";
import PanaromaViewer from "./components/PanaromaViewer/PanaromaViewer";
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
  // Slug trên URL: /:slug (vanilla router, giữ LoginScreen)
  const urlSlug = useProjectSlug();

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fff" }}>
        <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#6b7280", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} initialId={urlSlug || ""} />;
  }

  // Loading state khi chờ API
  if (loading || !projects || projects.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12, background: "#0f172a", color: "#fff" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #334155", borderTopColor: "#38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, opacity: 0.8 }}>Loading panaroma data...</span>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }

  return <AppContent projects={projects} isFallback={isFallback} user={user} onLogin={login} onLogout={logout} urlSlug={urlSlug} />;
}

/** Session user có thuộc về project này không (so theo slug/id/project_id). */
function doesUserMatchProject(user, project) {
  if (!user || !project) return false;
  const norm = (v) => (v == null ? null : String(v).toLowerCase());
  const uSlug = norm(user.slug);
  const uId = norm(user.id);
  const uPid = norm(user.project_id);
  const pSlug = norm(project.slug);
  const pId = norm(project.id);
  if (uSlug && (uSlug === pSlug || uSlug === pId)) return true;
  if (uId && (uId === pSlug || uId === pId)) return true;
  if (uPid && uPid === pId) return true;
  return false;
}

function resolveInitialProjectId(projects, urlSlug, user) {
  // Session login thắng: user đang thuộc project nào thì mở project đó.
  // (Mở link /:slug của project khác khi đang login -> AppContent sẽ bật màn hình login lại.)
  if (user) {
    const byUser = projects.find((p) => doesUserMatchProject(user, p));
    if (byUser) return byUser.id;
  }
  if (urlSlug) {
    const byUrl = findProjectBySlug(projects, urlSlug);
    if (byUrl) return byUrl.id;
  }
  return projects[0].id;
}

/* ===== Default building/floor: luôn ưu tiên building có panaroma =====
 - Building đầu tiên mà không có panaroma -> bỏ qua, chọn building có panaroma kế tiếp.
 - Không building nào có panaroma -> fallback về building đầu tiên. */
function buildingHasPanaroma(b) {
  if (!b) return false;
  if (b.type === "group") return (b.floors || []).some((f) => (f.panaromas || []).length > 0);
  return (b.panaromas || []).length > 0 || (b.floors || []).some((f) => (f.panaromas || []).length > 0);
}
// Building/floor có status = 0 -> ẩn (data cũ không có status => coi như hiển thị)
function isBuildingHidden(b) {
  return b?.status === 0;
}
function isFloorHidden(f) {
  return f?.status === 0;
}
function firstBuildingWithPanaroma(bs) {
  return bs.find((b) => !isBuildingHidden(b) && buildingHasPanaroma(b))
    || bs.find((b) => !isBuildingHidden(b))
    || bs[0]
    || null;
}
function firstFloorWithPanaroma(b) {
  const fs = b?.floors || [];
  return fs.find((f) => !isFloorHidden(f) && (f.panaromas || []).length > 0)
    || fs.find((f) => !isFloorHidden(f))
    || null;
}

function AppContent({ projects, isFallback, user, onLogin, onLogout, urlSlug }) {
  const [selectedProjectId, setSelectedProjectId] = useState(() =>
    resolveInitialProjectId(projects, urlSlug ?? getProjectSlugFromPath(), user)
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const buildings = selectedProject.buildings || [];
  const hasBuildings = buildings.length > 0;

  const [activeBuilding, setActiveBuilding] = useState(hasBuildings ? firstBuildingWithPanaroma(buildings) : null);
  const [activeFloorId, setActiveFloorId] = useState(() => {
    if (!hasBuildings) return null;
    const b = firstBuildingWithPanaroma(buildings);
    if (!b) return null;
    return b.type === "group" ? firstFloorWithPanaroma(b)?.id ?? null : null;
  });
  const [activePanaroma, setActivePanaroma] = useState(null);
  const [viewMode, setViewMode] = useState("map");
  // Collapsed của footer list: 1 nút điều khiển chung list panaroma + pano-image-options
  const [footerCollapsed, setFooterCollapsed] = useState(false);
  // Đổi project yêu cầu login lại: project chờ xác thực + lỗi khi sai tài khoản
  const [pendingProjectId, setPendingProjectId] = useState(null);
  const [switchError, setSwitchError] = useState("");
  // Guard: phân biệt lần mount đầu (đồng bộ URL) với các lần URL đổi sau đó
  const didInitUrlRef = useRef(false);

  useEffect(() => {
    if (!projects.find((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Deep-link /:slug: khi URL đổi (gõ tay, share link, Back/Forward) -> chọn đúng project
  const applyProjectSelection = useCallback(
    (pid) => {
      const proj = projects.find((p) => p.id === pid);
      if (!proj) return;
      setSelectedProjectId(pid);
      const bs = proj.buildings || [];
      if (!bs.length) {
        setActiveBuilding(null);
        setActiveFloorId(null);
        setActivePanaroma(null);
        setViewMode("map");
        return;
      }
      const nb = firstBuildingWithPanaroma(bs);
      setActiveBuilding(nb);
      const fid = nb.type === "group" ? firstFloorWithPanaroma(nb)?.id ?? null : null;
      setActiveFloorId(fid);
      const nf = fid ? nb.floors.find((f) => f.id === fid) : nb;
      setActivePanaroma(nf?.panaromas?.[0] ?? null);
      setViewMode("map");
    },
    [projects]
  );

  // Deep-link /:slug + bắt buộc login lại khi đổi project:
  // - Chế độ fallback (sample data, không có tài khoản thật): giữ hành vi cũ, tự chọn theo URL.
  // - Ngược lại: session gắn với 1 project. URL trỏ sang project khác (gõ tay, share link,
  //   Back/Forward) hoặc chọn ở dropdown -> bật màn hình login lại, URL hoàn về project hiện tại.
  //   Login đúng tài khoản -> vào project mới; Cancel -> ở lại project cũ.
  useEffect(() => {
    if (isFallback) {
      if (!urlSlug) return;
      const matched = findProjectBySlug(projects, urlSlug);
      if (matched && matched.id !== selectedProjectId) {
        applyProjectSelection(matched.id);
      }
      return;
    }
    const current = projects.find((p) => p.id === selectedProjectId);
    const curSlug = getProjectUrlSlug(current);
    if (!didInitUrlRef.current) {
      didInitUrlRef.current = true;
      if (urlSlug) {
        const matched = findProjectBySlug(projects, urlSlug);
        if (matched && matched.id !== selectedProjectId) {
          // Mở link project khác trong khi session đang thuộc project hiện tại
          setPendingProjectId(matched.id);
          setSwitchError("");
        }
      }
      if (curSlug && getProjectSlugFromPath() !== curSlug) {
        navigateToProjectSlug(curSlug, { replace: true });
      }
      return;
    }
    if (pendingProjectId || !urlSlug) return;
    const matched = findProjectBySlug(projects, urlSlug);
    if (matched && matched.id !== selectedProjectId) {
      setPendingProjectId(matched.id);
      setSwitchError("");
      if (curSlug && getProjectSlugFromPath() !== curSlug) {
        navigateToProjectSlug(curSlug, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSlug, projects]);

  // Đổi project (dropdown) -> đẩy slug lên URL để shareable / Back-Forward được
  useEffect(() => {
    const current = findProjectBySlug(projects, selectedProjectId)
      || projects.find((p) => p.id === selectedProjectId);
    const targetSlug = getProjectUrlSlug(current);
    if (!targetSlug) return;
    if (getProjectSlugFromPath() !== targetSlug) {
      navigateToProjectSlug(targetSlug);
    }
  }, [selectedProjectId, projects]);

  // Title theo project đang xem (giữ suffix company nếu có)
  useEffect(() => {
    const current = projects.find((p) => p.id === selectedProjectId);
    if (current?.name) {
      document.title = current?.name;
    }
  }, [selectedProjectId, projects]);

  // Sync khi đổi project: reset building/floor - ưu tiên building có panaroma (building tách rời nên có thể rỗng)
  useEffect(() => {
    const bs = selectedProject.buildings || [];
    if (!bs.length) {
      setActiveBuilding(null);
      setActiveFloorId(null);
      return;
    }
    if (!bs.find((b) => b.id === activeBuilding?.id)) {
      const nb = bs.find((b) => b.id === activeBuilding?.id) || firstBuildingWithPanaroma(bs);
      setActiveBuilding(nb);
      const fid = nb && nb.type === "group" ? firstFloorWithPanaroma(nb)?.id ?? null : null;
      setActiveFloorId(fid);
    }
  }, [selectedProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Floor đang active bị ẩn (status = 0, admin đổi lúc đang xem) -> chuyển sang tầng hiển thị kế tiếp
  useEffect(() => {
    if (!activeBuilding || activeBuilding.type !== "group") return;
    const fs = activeBuilding.floors || [];
    const cur = fs.find((f) => f.id === activeFloorId);
    if (cur && isFloorHidden(cur)) {
      const nf = firstFloorWithPanaroma(activeBuilding) || fs.find((f) => !isFloorHidden(f));
      if (nf && nf.id !== activeFloorId) setActiveFloorId(nf.id);
    }
  }, [activeBuilding, activeFloorId]);

  const getActiveFloor = (b, fid) => {
    if (!b) return null;
    return getActiveFloorHelper(b, fid);
  };
  const activeFloor = getActiveFloor(activeBuilding, activeFloorId);

  // Videos come from Project (DB) — backend injects into buildings as well for backward compat
  const projectVideos = selectedProject?.videos || [];
  const availableVideos = projectVideos.length > 0 ? projectVideos : (activeFloor?.videos || []);

  useEffect(() => {
    if (activeFloor?.panaromas?.length && !activeFloor.panaromas.find((p) => p.id === activePanaroma?.id)) {
      setActivePanaroma(activeFloor.panaromas[0]);
    }
    if (!activeFloor && activePanaroma) {
      setActivePanaroma(null);
    }
  }, [activeFloor, activePanaroma]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showGmap, setShowGmap] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectBuilding = (building) => {
    if (!building) return;
    // Building bị ẩn (status = 0) thì không chọn được
    if (isBuildingHidden(building)) return;
    setActiveBuilding(building);
    // Đang xem panorama mà đổi building -> quay về chế độ xem map (Building/Floor)
    setViewMode("map");
    if (building.type === "single") {
      setActiveFloorId(null);
      if (building.panaromas?.length) setActivePanaroma(building.panaromas[0]);
      else setActivePanaroma(null);
    } else {
      // Ưu tiên tầng không bị ẩn (status != 0)
      const first = firstFloorWithPanaroma(building) || building.floors?.[0];
      if (first) {
        setActiveFloorId(first.id);
        if (first.panaromas?.length) setActivePanaroma(first.panaromas[0]);
        else setActivePanaroma(null);
      } else {
        setActiveFloorId(null);
        setActivePanaroma(null);
      }
    }
  };

  const handleSelectFloor = (floor) => {
    if (isFloorHidden(floor)) return;
    setActiveFloorId(floor.id);
    // Đang xem panorama mà đổi floor -> quay về chế độ xem map (Building/Floor)
    setViewMode("map");
    if (floor.panaromas?.length) setActivePanaroma(floor.panaromas[0]);
    else setActivePanaroma(null);
  };

  const findPanaromaById = (pid) => {
    for (const b of buildings) {
      if (b.type === "single") {
        const pano = b.panaromas?.find((p) => p.id === pid);
        if (pano) return { building: b, floor: b, panaroma: pano };
      } else {
        for (const f of b.floors || []) {
          const pano = f.panaromas?.find((p) => p.id === pid);
          if (pano) return { building: b, floor: f, panaroma: pano };
        }
      }
    }
    return null;
  };

  const handleSelectProject = (pid) => {
    if (pid === selectedProjectId) return;
    const target = projects.find((p) => p.id === pid);
    if (!target) return;
    // Fallback sample data (không có tài khoản thật): đổi trực tiếp như cũ
    if (isFallback || doesUserMatchProject(user, target)) {
      // applyProjectSelection reset building/floor/pano + view; effect sync sẽ đẩy slug lên URL
      applyProjectSelection(pid);
      return;
    }
    // Mỗi lần đổi project phải login lại bằng tài khoản của project đó
    setPendingProjectId(pid);
    setSwitchError("");
  };

  const handleSwitchLogin = (newUser) => {
    const target = projects.find((p) => p.id === pendingProjectId);
    if (target && doesUserMatchProject(newUser, target)) {
      onLogin(newUser); // cập nhật session sang tài khoản project mới
      setPendingProjectId(null);
      setSwitchError("");
      applyProjectSelection(target.id);
    } else {
      setSwitchError(
        `Tài khoản không thuộc project "${target?.name || ""}". Vui lòng đăng nhập đúng tài khoản của project này.`
      );
    }
  };

  const handleCancelSwitch = () => {
    setPendingProjectId(null);
    setSwitchError("");
  };

  const handleHotspot3DClick = (targetPanaromaId) => {
    const found = findPanaromaById(targetPanaromaId);
    if (found) {
      setActiveBuilding(found.building);
      if (found.building.type === "group") setActiveFloorId(found.floor.id);
      else setActiveFloorId(null);
      setActivePanaroma(found.panaroma);
    }
  };

  const handleMapPanaromaClick = (pano) => {
    const found = findPanaromaById(pano.id);
    if (found) {
      setActiveBuilding(found.building);
      if (found.building.type === "group") setActiveFloorId(found.floor.id);
      else setActiveFloorId(null);
    }
    setActivePanaroma(pano);
    setViewMode("panaroma");
  };

  // Footer chỉ show thumbnail của tầng hiện tại, tối đa 6

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // Đang chờ login lại để đổi project -> hiện LoginScreen khóa ID theo project đích
  const pendingProject = pendingProjectId
    ? projects.find((p) => p.id === pendingProjectId)
    : null;
  if (pendingProject && !isFallback) {
    return (
      <LoginScreen
        key={pendingProject.id}
        onLogin={handleSwitchLogin}
        initialId={pendingProject.slug || String(pendingProject.id)}
        lockId
        projectName={pendingProject.name}
        onCancel={handleCancelSwitch}
        externalError={switchError}
      />
    );
  }

  // Slug trên URL không khớp project nào -> màn hình 404 nhẹ (đặt sau mọi hooks)
  const urlProject = urlSlug ? findProjectBySlug(projects, urlSlug) : null;
  if (urlSlug && !urlProject) {
    return (
      <div className="app-layout">
        <main className="main-viewport" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, background: "#f8fafc", padding: 24 }}>
          <div style={{ fontSize: 40, opacity: 0.25 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Project "{urlSlug}" not found
          </div>
          <div style={{ fontSize: 12, color: "#64748b", maxWidth: 380, textAlign: "center" }}>
            The link may be wrong or the project was renamed. You are logged in as {user?.name || "guest"}.
          </div>
          <button
            onClick={() => {
              const fallback = projects[0];
              setSelectedProjectId(fallback.id);
              navigateToProjectSlug(getProjectUrlSlug(fallback), { replace: true });
            }}
            style={{ marginTop: 6, padding: "8px 18px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontSize: 13, cursor: "pointer" }}
          >
            Back to {projects[0]?.name || "home"}
          </button>
        </main>
      </div>
    );
  }

  // Building tách rời: nếu không có building vẫn chạy, hiện empty state đẹp
  if (!hasBuildings) {
    return (
      <div className="app-layout">
        <TopHeader
          activeBuilding={null}
          activeFloor={null}
          activePanaroma={null}
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
          <div style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Project "{selectedProject.name}" has no Buildings</div>
        </main>
        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <GoogleMapModal isOpen={showGmap} onClose={() => setShowGmap(false)} mapUrl={selectedProject?.map} />
        <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} videos={projectVideos} floorName={null} />
        <RotatePrompt />
      </div>
    );
  }

  // Guard nếu building có nhưng floor/pano rỗng
  if (!activeFloor) {
    return (
      <div className="app-layout">
        <TopHeader activeBuilding={activeBuilding} activeFloor={null} activePanaroma={null} viewMode={viewMode} onToggleViewMode={(mode) => setViewMode(mode)} onOpenGoogleMap={() => setShowGmap(true)} onOpenVideo={() => setShowVideo(true)} onToggleFullscreen={handleToggleFullscreen} onToggleSidebar={() => setShowSidebar((v) => !v)} projects={projects} selectedProjectId={selectedProjectId} onSelectProject={handleSelectProject} user={user} onLogout={onLogout} showTopButtons={showSidebar} />
        <main className="main-viewport" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Building "{activeBuilding.name}" has no Floor/Panaroma</span>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {isFallback && (
        <div style={{ position: "fixed", bottom: 8, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#000", padding: "4px 12px", borderRadius: 20, fontSize: 11, zIndex: 9999, opacity: 0.9 }}>
          Loading sample data (API has no data) — please add data in Filament Admin
        </div>
      )}
      <TopHeader
        activeBuilding={activeBuilding}
        activeFloor={activeFloor}
        activePanaroma={activePanaroma}
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
          <FloorMap floor={activeFloor} building={activeBuilding} activePanaroma={activePanaroma} onSelectPanaroma={handleMapPanaromaClick} onLogout={onLogout} />
        ) : (
          activePanaroma ? (
            <PanaromaViewer
              panaroma={activePanaroma}
              floor={activeFloor}
              building={activeBuilding}
              onHotspotClick={handleHotspot3DClick}
              onSelectPanaroma={(pano) => setActivePanaroma(pano)}
              onReturnToMap={() => setViewMode("map")}
              showLeftToolbar={showSidebar}
              onLogout={onLogout}
              showImageOptions={!footerCollapsed}
            />
          ) : (
            // Chưa có panaroma -> vẫn hiện ảnh mặt bằng tổng thể của tầng
            activeFloor?.planImage ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, padding: "60px 16px", minWidth: 0 }}>
                <img src={activeFloor.planImage} alt={activeFloor.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.25)", background: "#fff" }} draggable={false} />
                <span style={{ fontSize: 12, color: "#64748b" }}>Panaroma for "{activeFloor.name}" coming soon.</span>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>No panaroma available yet.</div>
            )
          )
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
        <FooterCarousel
          panaromas={activeFloor?.panaromas || []}
          activePanaroma={activePanaroma}
          onSelectPanaroma={handleMapPanaromaClick}
          floorId={activeFloor?.id}
          collapsed={footerCollapsed}
          onCollapseChange={setFooterCollapsed}
        />
      </main>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <GoogleMapModal isOpen={showGmap} onClose={() => setShowGmap(false)} mapUrl={selectedProject?.map} />
      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} videos={availableVideos} floorName={activeFloor?.name} />
      <RotatePrompt />
    </div>
  );
}

export default App;
