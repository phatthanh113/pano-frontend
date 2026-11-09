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

// Tìm panaroma trong toàn bộ buildings
export function findPanaromaById(panaromaId) {
  for (const b of buildings) {
    if (b.type === "single") {
      const pano = b.panaromas.find((p) => p.id === panaromaId);
      if (pano) return { building: b, floor: b, panaroma: pano };
    } else {
      for (const f of b.floors) {
        const pano = f.panaromas.find((p) => p.id === panaromaId);
        if (pano) return { building: b, floor: f, panaroma: pano };
      }
    }
  }
  return null;
}

// Lấy floor hiện tại đang active để render map - building tách rời nên có thể null
// Floor bị ẩn (status = 0) bị loại khỏi pool fallback, ưu tiên tầng hiển thị
export function getActiveFloor(building, floorId) {
  if (!building) return null;
  if (building.type === "single") return building;
  if (!building.floors || building.floors.length === 0) return building;
  const visible = building.floors.filter((f) => f.status !== 0);
  const pool = visible.length ? visible : building.floors;
  if (!floorId) return pool[0];
  return pool.find((f) => f.id === floorId) || pool[0];
}

export default buildings;
