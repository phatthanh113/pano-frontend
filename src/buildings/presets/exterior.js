import { sampleVideos } from "./_shared.js";

const exterior = {
  id: "exterior",
  name: "外構",
  type: "single",
  planImage: "/maps/exterior.jpg",
  videos: sampleVideos,
  panaromas: [
    { id: "ext-1", name: "新1号館外観(南西面)", code: "南西面", number: 1, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 42.5, y: 76.5, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "新1号館外観(南西面)", hotspots: [{ id: "hs-ext1-2", yaw: 35, pitch: -2, tooltip: "Đến 外観2", targetPanaroma: "ext-2" }] },
    { id: "ext-2", name: "新1号館外観(南面)", code: "南面", number: 2, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 49, y: 52, angle: -20 }, defaultView: { yaw: 30, pitch: 0 }, label: "新1号館外観(南面)", hotspots: [{ id: "hs-ext2-1", yaw: 215, pitch: -2, tooltip: "Về 1", targetPanaroma: "ext-1" }] },
    { id: "ext-3", name: "メディカルデッキ外観(東面)", code: "東面", number: 3, thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg", mapPosition: { x: 38, y: 38.5, angle: 45 }, defaultView: { yaw: 90, pitch: 0 }, label: "メディカルデッキ外観(東面)", hotspots: [] },
    { id: "ext-4", name: "メディカルデッキ外観(西面)", code: "西面", number: 4, thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg", mapPosition: { x: 58.5, y: 24, angle: 135 }, defaultView: { yaw: 180, pitch: 0 }, label: "メディカルデッキ外観(西面)", hotspots: [] },
    { id: "ext-5", name: "新1号館外観(南東面)", code: "南東面", number: 5, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 74, y: 44, angle: -85 }, defaultView: { yaw: 0, pitch: 0 }, label: "新1号館外観(南東面)", hotspots: [] },
    { id: "ext-6", name: "キャンパス全体俯瞰", code: "俯瞰", number: 6, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 23, y: 75, angle: 40 }, defaultView: { yaw: 45, pitch: 0 }, label: "キャンパス全体俯瞰", hotspots: [] },
  ],
};

export default exterior;
