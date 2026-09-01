import buildingsData from "./buildingsData";

export const buildings = buildingsData;

// Flatten helper: lấy floor object từ building hoặc building single
export function getBuildingById(id) {
  return buildings.find((b) => b.id === id) || buildings[0];
}

export function getFloorById(floorId) {
  for (const b of buildings) {
    if (b.type === "single" && b.id === floorId) return b;
    if (b.type === "group") {
      const f = b.floors.find((x) => x.id === floorId);
      if (f) return { ...f, buildingId: b.id, buildingName: b.name };
    }
  }
  // also check inside group
  for (const b of buildings) {
    if (b.id === floorId) return b;
  }
  return buildings[0];
}

// Tìm panorama trong toàn bộ buildings
export function findPanoramaById(panoramaId) {
  for (const b of buildings) {
    if (b.type === "single") {
      const pano = b.panoramas.find((p) => p.id === panoramaId);
      if (pano) return { building: b, floor: b, panorama: pano };
    } else {
      for (const f of b.floors) {
        const pano = f.panoramas.find((p) => p.id === panoramaId);
        if (pano) return { building: b, floor: f, panorama: pano };
      }
    }
  }
  return null;
}

// Lấy floor hiện tại đang active để render map - building tách rời nên có thể null
export function getActiveFloor(building, floorId) {
  if (!building) return null;
  if (building.type === "single") return building;
  if (!building.floors || building.floors.length === 0) return building;
  if (!floorId) return building.floors[0];
  return building.floors.find((f) => f.id === floorId) || building.floors[0];
}

export default buildings;
