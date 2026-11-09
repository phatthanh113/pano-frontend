import { sampleVideos } from "./_shared.js";

const new1 = {
  id: "new1",
  name: "新1号館",
  type: "group",
  floors: [
    {
      id: "new1-b1", name: "B1階", shortLabel: "B1", planImage: "/maps/floor1.jpg", videos: sampleVideos,
      panaromas: [
        { id: "b1-1", name: "B1 廊下", code: "B1-1", number: 1, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 42, y: 48, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "B1 廊下", hotspots: [] },
        { id: "b1-2", name: "B1 駐車場", code: "B1-2", number: 2, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 60, y: 55, angle: 90 }, defaultView: { yaw: 45, pitch: 0 }, label: "B1 駐車場", hotspots: [] },
      ],
    },
    {
      id: "new1-1f", name: "1階", shortLabel: "1F", planImage: "/maps/floor1.jpg", videos: sampleVideos,
      panaromas: [
        { id: "1f-1", name: "1階 エントランス", code: "1F-1", number: 1, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 26, y: 55, angle: 90 }, defaultView: { yaw: 0, pitch: 0 }, label: "1階 エントランス", hotspots: [] },
        { id: "1f-2", name: "1階 ロビー", code: "1F-2", number: 2, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 50, y: 55, angle: 0 }, defaultView: { yaw: 45, pitch: 0 }, label: "1階 ロビー", hotspots: [] },
      ],
    },
    {
      id: "new1-2f", name: "2階", shortLabel: "2F", planImage: "/maps/floor2.jpg", videos: sampleVideos,
      panaromas: [
        { id: "2f-1", name: "2階 病棟", code: "2F-1", number: 1, thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg", mapPosition: { x: 35, y: 45, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "2階 病棟", hotspots: [] },
      ],
    },
    {
      id: "new1-3f", name: "3階", shortLabel: "3F", planImage: "/maps/floor3.jpg", videos: sampleVideos,
      panaromas: [
        { id: "3f-1", name: "3階 病棟", code: "3F-1", number: 1, thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg", mapPosition: { x: 40, y: 50, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "3階 病棟", hotspots: [] },
      ],
    },
    {
      id: "new1-5f", name: "5階", shortLabel: "5F", planImage: "/maps/floor3.jpg", videos: sampleVideos,
      panaromas: [
        { id: "5f-1", name: "5階教授室等廊下", code: "5F-1", number: 1, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 60, y: 32, angle: 90 }, defaultView: { yaw: 0, pitch: 0 }, label: "5階教授室等廊下", hotspots: [] },
        { id: "5f-2", name: "5階教授室等", code: "5F-2", number: 2, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 64, y: 52, angle: 0 }, defaultView: { yaw: 45, pitch: 0 }, label: "5階教授室等", hotspots: [] },
        { id: "5f-3", name: "新1号館外観(南西面)", code: "南西面", number: 3, thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg", mapPosition: { x: 19, y: 92, angle: 180 }, defaultView: { yaw: 90, pitch: 0 }, label: "新1号館外観(南西面)", hotspots: [] },
        { id: "5f-4", name: "メディカルデッキ外観(南面)", code: "南面", number: 4, thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg", mapPosition: { x: 52, y: 94, angle: 0 }, defaultView: { yaw: 180, pitch: 0 }, label: "メディカルデッキ外観(南面)", hotspots: [] },
        { id: "5f-5", name: "新1号館外観(南東面)", code: "南東面", number: 5, thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg", mapPosition: { x: 73, y: 94, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "新1号館外観(南東面)", hotspots: [] },
      ],
    },
    {
      id: "new1-6f", name: "6階", shortLabel: "6F", planImage: "/maps/floor2.jpg", videos: sampleVideos,
      panaromas: [
        { id: "6f-1", name: "6階 講義室", code: "6F-1", number: 1, thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg", mapPosition: { x: 45, y: 50, angle: 0 }, defaultView: { yaw: 0, pitch: 0 }, label: "6階 講義室", hotspots: [] },
      ],
    },
  ],
};

export default new1;
