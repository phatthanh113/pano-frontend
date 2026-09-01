/**
 * floors/index.js
 * ---------------
 * - Import dữ liệu từ floorsData.js (thay bằng API call khi có backend).
 * - Cung cấp helper: getFloorById, findPanoramaById.
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
import { buildings, findPanoramaById as findPanoramaByIdNew } from "../buildings";

export const floors = floorsData;

/** Lấy tầng theo id */
export const getFloorById = (floorId) =>
  floors.find((f) => f.id === floorId) || floors[0];

/** Tìm panorama trong toàn bộ các tầng, trả về { floor, panorama } */
export const findPanoramaById = (panoramaId) => {
  // ưu tiên buildings mới (đúng Ảnh 1)
  const foundNew = findPanoramaByIdNew(panoramaId);
  if (foundNew) return { floor: foundNew.floor, panorama: foundNew.panorama, building: foundNew.building };
  for (const floor of floors) {
    const panorama = floor.panoramas.find((p) => p.id === panoramaId);
    if (panorama) return { floor, panorama };
  }
  return null;
};

export default floors;
