/**
 * buildingService.js
 * ------------------
 * Abstraction layer cho building.
 * Hiện tại đọc từ presets tĩnh (không DB).
 * Sau này khi đưa building vào admin/DB chỉ cần đổi implementation ở đây,
 * không phải sửa App.jsx hay components.
 *
 * Ví dụ sau này:
 *   export async function getAllBuildings() {
 *     return fetch('/api/buildings').then(r => r.json());
 *   }
 */
import { buildingPresets, buildingPresetList } from "./presets/index.js";

export const DEFAULT_BUILDING_ID = "exterior";

export function getBuildingById(id) {
  if (!id) return buildingPresets[DEFAULT_BUILDING_ID];
  return buildingPresets[id] || buildingPresets[DEFAULT_BUILDING_ID];
}

export function getAllBuildings() {
  return buildingPresetList;
}

export function getBuildingsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return buildingPresetList;
  return ids.map((id) => buildingPresets[id]).filter(Boolean);
}

export function getBuildingIds() {
  return Object.keys(buildingPresets);
}

export default {
  getBuildingById,
  getAllBuildings,
  getBuildingsByIds,
  getBuildingIds,
};
