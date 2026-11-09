/**
 * floors/index.js
 * ---------------
 * - Import dữ liệu từ floorsData.js (thay bằng API call khi có backend).
 * - Cung cấp helper: getFloorById, findPanaromaById.
 *
 * === Khi tích hợp Database / API ===
 * Thay dòng import dưới bằng:
 *
 *   export let floors = [];
 *   export async function loadFloors() {
 *     floors = await fetch('/api/floors').then(r => r.json());
 *   }
 */

import floorsData from "./floorsData";
import { buildings, findPanaromaById as findPanaromaByIdNew } from "../buildings";

export const floors = floorsData;

/** Lấy tầng theo id */
export const getFloorById = (floorId) =>
  floors.find((f) => f.id === floorId) || floors[0];

/** Tìm panaroma trong toàn bộ các tầng, trả về { floor, panaroma } */
export const findPanaromaById = (panaromaId) => {
  // ưu tiên buildings mới (đúng Ảnh 1)
  const foundNew = findPanaromaByIdNew(panaromaId);
  if (foundNew) return { floor: foundNew.floor, panaroma: foundNew.panaroma, building: foundNew.building };
  for (const floor of floors) {
    const panaroma = floor.panaromas.find((p) => p.id === panaromaId);
    if (panaroma) return { floor, panaroma };
  }
  return null;
};

export default floors;
