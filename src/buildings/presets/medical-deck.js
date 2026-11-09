import { sampleVideos } from "./_shared.js";

const medicalDeck = {
  id: "medical-deck",
  name: "メディカルデッキ",
  type: "single",
  planImage: "/maps/floor1.jpg",
  videos: sampleVideos,
  panaromas: [
    { id: "med-1", name: "新1号館外観(南西面)", code: "南西面", number: 1, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 35, y: 22, angle: 90 }, defaultView: { yaw: 0, pitch: 0 }, label: "新1号館外観(南西面)", hotspots: [] },
    { id: "med-2", name: "メディカルデッキ外観(東面)", code: "東面", number: 2, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 52, y: 28, angle: 0 }, defaultView: { yaw: 45, pitch: 0 }, label: "メディカルデッキ外観(東面)", hotspots: [] },
    { id: "med-3", name: "新1号館外観(南面)", code: "南面", number: 3, thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg", mapPosition: { x: 50, y: 38, angle: -90 }, defaultView: { yaw: 90, pitch: 0 }, label: "新1号館外観(南面)", hotspots: [] },
    { id: "med-4", name: "新1号館外観(南東面)", code: "南東面", number: 4, thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg", mapPosition: { x: 68, y: 40, angle: 180 }, defaultView: { yaw: 180, pitch: 0 }, label: "新1号館外観(南東面)", hotspots: [] },
    { id: "med-5", name: "1階カフェ待合棟", code: "カフェ", number: 5, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 38, y: 62, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "1階カフェ待合棟", hotspots: [] },
    { id: "med-6", name: "メディカルデッキ エントランス", code: "エントランス", number: 6, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 50, y: 78, angle: -45 }, defaultView: { yaw: 45, pitch: 0 }, label: "メディカルデッキ エントランス", hotspots: [] },
  ],
};

export default medicalDeck;
