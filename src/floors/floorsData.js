/**
 * FLOORS DATA
 * -----------
 * Cấu trúc dữ liệu tập trung cho tất cả các tầng.
 * Khi tích hợp Database, thay toàn bộ mảng này bằng kết quả từ API:
 *
 *   const floors = await fetch('/api/floors').then(r => r.json());
 *
 * Mỗi floor gồm:
 *   - id, name, shortLabel, description, planImage: metadata tầng
 *   - defaultPanoramaId: panorama mặc định khi chọn tầng
 *   - videos[]: danh sách video giới thiệu của tầng / dự án (dễ dàng đổ data từ Database sau này)
 *     └─ { id, title, label, description, thumbnail, videoUrl }
 *   - panoramas[]: danh sách điểm panorama trong tầng
 */

// Video mẫu cho dự án (Dễ dàng thay đổi hoặc lấy trực tiếp từ Database)
const sampleVideos = [
  {
    id: "mov-1",
    title: "ムービー 1",
    label: "トラックヤード",
    description: "Khu vực sân xe tải và bốc dỡ hàng hóa chính",
    thumbnail: "/images/pana1.jpg",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  },
  {
    id: "mov-2",
    title: "ムービー 2",
    label: "エントランス・ロビー",
    description: "Sảnh đón tiếp chính và văn phòng lễ tân",
    thumbnail: "/images/pana2.jpg",
    videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
  },
  {
    id: "mov-3",
    title: "ムービー 4",
    label: "物流倉庫保管エリア",
    description: "Khu vực kho chứa tải trọng cao & kệ pallet",
    thumbnail: "/images/pana3.jpg",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  },
  {
    id: "mov-4",
    title: "ムービー 5",
    label: "屋上庭園・テラス",
    description: "Sân thượng Rooftop và khu vực thư giãn ngoài trời",
    thumbnail: "/images/pana4.jpg",
    videoUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
  },
];

const floorsData = [
  {
    id: "exterior",
    name: "外観",
    shortLabel: "外観",
    description: "Tổng thể ngoại cảnh và khuôn viên dự án",
    planImage: "/maps/exterior.jpg",
    defaultPanoramaId: "exterior-1",
    videos: sampleVideos,
    panoramas: [
      {
        id: "exterior-1", name: "外観1", code: "外観1", number: 1,
        thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg",
        mapPosition: { x: 42.5, y: 76.5, angle: 0 },
        defaultView: { yaw: 0, pitch: 0 },
        hotspots: [
          { id: "hs-ext1-2", yaw: 35, pitch: -2, tooltip: "Đến 外観2", targetPanorama: "exterior-2" }
        ]
      },
      {
        id: "exterior-2", name: "外観2", code: "外観2", number: 2,
        thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg",
        mapPosition: { x: 49.0, y: 52.0, angle: -20 },
        defaultView: { yaw: 30, pitch: 0 },
        hotspots: [
          { id: "hs-ext2-1", yaw: 215, pitch: -2, tooltip: "Về 外観1", targetPanorama: "exterior-1" },
          { id: "hs-ext2-3", yaw: 75, pitch: 0, tooltip: "Đến 外観3", targetPanorama: "exterior-3" }
        ]
      },
      {
        id: "exterior-3", name: "外観3", code: "外観3", number: 3,
        thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg",
        mapPosition: { x: 38.0, y: 38.5, angle: 45 },
        defaultView: { yaw: 90, pitch: 0 },
        hotspots: [
          { id: "hs-ext3-2", yaw: 250, pitch: -2, tooltip: "Về 外観2", targetPanorama: "exterior-2" },
          { id: "hs-ext3-4", yaw: 40, pitch: 0, tooltip: "Đến 外観4", targetPanorama: "exterior-4" }
        ]
      },
      {
        id: "exterior-4", name: "外観4", code: "外観4", number: 4,
        thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg",
        mapPosition: { x: 58.5, y: 24.0, angle: 135 },
        defaultView: { yaw: 180, pitch: 0 },
        hotspots: [
          { id: "hs-ext4-3", yaw: 220, pitch: -2, tooltip: "Về 外観3", targetPanorama: "exterior-3" }
        ]
      },
      {
        id: "exterior-5", name: "外観5", code: "外観5", number: 5,
        thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg",
        mapPosition: { x: 74.0, y: 44.0, angle: -85 },
        defaultView: { yaw: 0, pitch: 0 },
        hotspots: []
      },
      {
        id: "exterior-6", name: "外観6", code: "外観6", number: 6,
        thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg",
        mapPosition: { x: 23.0, y: 75.0, angle: 40 },
        defaultView: { yaw: 45, pitch: 0 },
        hotspots: []
      }
    ]
  },

  {
    id: "floor1",
    name: "1Fl",
    shortLabel: "1Fl",
    description: "Mặt bằng Tầng 1 - Khu tiếp nhận hàng & Kho chính",
    planImage: "/maps/floor1.jpg",
    defaultPanoramaId: "1fl-1",
    videos: sampleVideos,
    panoramas: [
      {
        id: "1fl-1", name: "1Fl-1", code: "1Fl-1", number: 1,
        thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg",
        mapPosition: { x: 26.0, y: 55.0, angle: 90 },
        defaultView: { yaw: 0, pitch: 0 },
        hotspots: [
          { id: "hs-1fl1-2", yaw: 45, pitch: 0, tooltip: "Đến Khu Kệ Hàng 2", targetPanorama: "1fl-2" }
        ]
      },
      {
        id: "1fl-2", name: "1Fl-2", code: "1Fl-2", number: 2,
        thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg",
        mapPosition: { x: 50.0, y: 55.0, angle: 0 },
        defaultView: { yaw: 45, pitch: 0 },
        hotspots: [
          { id: "hs-1fl2-1", yaw: 180, pitch: 0, tooltip: "Về Điểm 1", targetPanorama: "1fl-1" },
          { id: "hs-1fl2-3", yaw: 0, pitch: 0, tooltip: "Đến Cửa Xuất Hàng", targetPanorama: "1fl-3" }
        ]
      },
      {
        id: "1fl-3", name: "1Fl-3", code: "1Fl-3", number: 3,
        thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg",
        mapPosition: { x: 45.0, y: 28.0, angle: -90 },
        defaultView: { yaw: 90, pitch: 0 },
        hotspots: [
          { id: "hs-1fl3-4", yaw: 90, pitch: 0, tooltip: "Sang Khu Văn Phòng", targetPanorama: "1fl-4" }
        ]
      },
      {
        id: "1fl-4", name: "1Fl-4", code: "1Fl-4", number: 4,
        thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg",
        mapPosition: { x: 80.0, y: 60.0, angle: 180 },
        defaultView: { yaw: 180, pitch: 0 },
        hotspots: []
      }
    ]
  },

  {
    id: "floor2",
    name: "2Fl",
    shortLabel: "2Fl",
    description: "Mặt bằng Tầng 2 - Kho lưu trữ tải trọng & Văn phòng làm việc",
    planImage: "/maps/floor2.jpg",
    defaultPanoramaId: "2fl-1",
    videos: sampleVideos,
    panoramas: [
      {
        id: "2fl-1", name: "2Fl-1", code: "2Fl-1", number: 1,
        thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg",
        mapPosition: { x: 30.0, y: 35.0, angle: 90 },
        defaultView: { yaw: 0, pitch: 0 },
        hotspots: [
          { id: "hs-2fl1-2", yaw: 90, pitch: 0, tooltip: "Đến Khu Kệ B", targetPanorama: "2fl-2" }
        ]
      },
      {
        id: "2fl-2", name: "2Fl-2", code: "2Fl-2", number: 2,
        thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg",
        mapPosition: { x: 30.0, y: 70.0, angle: 180 },
        defaultView: { yaw: 45, pitch: 0 },
        hotspots: [
          { id: "hs-2fl2-3", yaw: 0, pitch: 0, tooltip: "Đến Sảnh Thang Bộ", targetPanorama: "2fl-3" }
        ]
      },
      {
        id: "2fl-3", name: "2Fl-3", code: "2Fl-3", number: 3,
        thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg",
        mapPosition: { x: 62.0, y: 65.0, angle: -45 },
        defaultView: { yaw: 90, pitch: 0 },
        hotspots: [
          { id: "hs-2fl3-4", yaw: -45, pitch: 0, tooltip: "Đến Phòng Họp", targetPanorama: "2fl-4" }
        ]
      },
      {
        id: "2fl-4", name: "2Fl-4", code: "2Fl-4", number: 4,
        thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg",
        mapPosition: { x: 78.0, y: 35.0, angle: 0 },
        defaultView: { yaw: 180, pitch: 0 },
        hotspots: []
      }
    ]
  },

  {
    id: "floor3",
    name: "3Fl",
    shortLabel: "3Fl",
    description: "Mặt bằng Tầng 3 - Sân thượng Rooftop & Khu điều hành",
    planImage: "/maps/floor3.jpg",
    defaultPanoramaId: "3fl-1",
    videos: sampleVideos,
    panoramas: [
      {
        id: "3fl-1", name: "3Fl-1", code: "3Fl-1", number: 1,
        thumbnail: "/images/pana1.jpg", url: "/images/pana1.jpg",
        mapPosition: { x: 26.0, y: 48.0, angle: 90 },
        defaultView: { yaw: 0, pitch: 0 },
        hotspots: [
          { id: "hs-3fl1-2", yaw: 90, pitch: 0, tooltip: "Đến Sân Vườn Rooftop", targetPanorama: "3fl-2" }
        ]
      },
      {
        id: "3fl-2", name: "3Fl-2", code: "3Fl-2", number: 2,
        thumbnail: "/images/pana2.jpg", url: "/images/pana2.jpg",
        mapPosition: { x: 30.0, y: 75.0, angle: 0 },
        defaultView: { yaw: 45, pitch: 0 },
        hotspots: [
          { id: "hs-3fl2-3", yaw: 0, pitch: 0, tooltip: "Vào Sảnh Lễ Tân", targetPanorama: "3fl-3" }
        ]
      },
      {
        id: "3fl-3", name: "3Fl-3", code: "3Fl-3", number: 3,
        thumbnail: "/images/pana3.jpg", url: "/images/pana3.jpg",
        mapPosition: { x: 62.0, y: 52.0, angle: -45 },
        defaultView: { yaw: 90, pitch: 0 },
        hotspots: [
          { id: "hs-3fl3-4", yaw: 0, pitch: 0, tooltip: "Đến Phòng Hội Nghị", targetPanorama: "3fl-4" }
        ]
      },
      {
        id: "3fl-4", name: "3Fl-4", code: "3Fl-4", number: 4,
        thumbnail: "/images/pana4.jpg", url: "/images/pana4.jpg",
        mapPosition: { x: 80.0, y: 32.0, angle: 180 },
        defaultView: { yaw: 180, pitch: 0 },
        hotspots: []
      }
    ]
  }
];

export default floorsData;
