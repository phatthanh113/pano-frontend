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
 *   - defaultPanaromaId: panaroma mặc định khi chọn tầng
 *   - videos[]: danh sách video giới thiệu của tầng / dự án (dễ dàng đổ data từ Database sau này)
 *     └─ { id, title, label, description, thumbnail, videoUrl }
 *   - panaromas[]: danh sách điểm panaroma trong tầng
 */

// Video mẫu cho dự án (Dễ dàng thay đổi hoặc lấy trực tiếp từ Database)

const floorsData = [];

export default floorsData;
