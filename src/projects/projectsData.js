/**
 * SAMPLE PROJECTS DATA (dùng khi không có backend - offline/fallback)
 * - Shape 1:1 với API /api/projects (App.jsx đọc trực tiếp, không map gì thêm)
 *   { id, name, slug, description, thumbnail, map, videos[], buildings[] }
 * - Building: { name, type: "single"|"group", planImage, videos, panaromas } (building đơn)
 *   hoặc { name, type: "group", planImage, floors: [{ name, planImage, videos, panaromas }] }
 * - Panaroma: { id, name, code, number, thumbnail, url, mapPosition, defaultView, label, hotspots }
 * - Tất cả ảnh đã có sẵn trong public/images, public/maps -> chạy offline được ngay
 */
import { buildingPresets } from "../buildings/presets/index.js";
import { sampleVideos } from "../buildings/presets/_shared.js";

const withPreset = (presets) =>
  presets.map((id) => JSON.parse(JSON.stringify(buildingPresets[id])));

export const projects = [
  {
    id: 1,
    db_id: 1,
    name: "Demo Hospital",
    slug: "demo-hospital",
    description: "Project mẫu: ngoại thất + tòa nhà nhiều tầng (khi chưa có backend)",
    thumbnail: "/images/pana1.jpg",
    map: "https://www.google.com/maps?q=35.681236,139.767125&z=16&output=embed",
    videos: sampleVideos,
    buildings: [
      ...withPreset(["exterior", "medical-deck", "cafe"]),
      JSON.parse(JSON.stringify(buildingPresets.new1)),
    ],
  },
  {
    id: 2,
    db_id: 2,
    name: "Demo Cafe",
    slug: "demo-cafe",
    description: "Project mẫu thứ 2 để test đổi project",
    thumbnail: "/images/pana4.jpg",
    map: "https://www.google.com/maps?q=35.658581,139.745433&z=16&output=embed",
    videos: sampleVideos,
    buildings: withPreset(["cafe", "exterior"]),
  },
];

export default projects;
