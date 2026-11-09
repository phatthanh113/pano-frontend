import { sampleVideos } from "./_shared.js";

const cafe = {
  id: "cafe",
  name: "カフェ・待合棟",
  type: "single",
  planImage: "/maps/floor2.jpg",
  videos: sampleVideos,
  panaromas: [
    { id: "cafe-1", name: "カフェ外観", code: "外観", number: 1, thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg", mapPosition: { x: 45, y: 45, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "カフェ外観", hotspots: [] },
    { id: "cafe-2", name: "待合ロビー", code: "ロビー", number: 2, thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg", mapPosition: { x: 55, y: 60, angle: 90 }, defaultView: { yaw: 90, pitch: 0 }, label: "待合ロビー", hotspots: [] },
  ],
};

export default cafe;
