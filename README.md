# Pano Frontend - React + Vite + Photo Sphere Viewer

> Frontend panorama 360° cho hệ thống `pano-admin` (Laravel). Build ra `dist/` rồi copy vào `pano-admin/public/pano` để chạy same-origin, không CORS.

---

## 🇻🇳 Tiếng Việt

### 1. Yêu cầu
- Node 20+, npm/pnpm

### 2. Cài đặt khi clone

```bash
git clone <repo-pano>  # hoặc copy folder D:\pano
cd D:\pano
npm install
```

### 3. Chạy dev
```bash
npm run dev          # http://localhost:5173 (Vite proxy /api -> http://pano-admin.test)
# hoặc
npm run deploy       # build + copy sang D:\laragon\www\pano-admin\public\pano (xem deploy.ps1:8)
```

`vite.config.js:13-24` proxy `/api` và `/storage` về `http://pano-admin.test` để dev không bị CORS. Đổi `VITE_PROXY_TARGET` nếu `pano-admin` ở host khác.

### 4. Build & Deploy
```bash
npm run build        # ra dist/
npm run deploy       # powershell -ExecutionPolicy Bypass -File ./deploy.ps1
                     # 1. vite build
                     # 2. xóa D:\laragon\www\pano-admin\public\pano cũ
                     # 3. copy dist/* -> public/pano + public/assets
```

Nếu dời `pano-admin` sang folder khác, sửa `deploy.ps1:8`:
```ps
$LaravelPublicPano = "D:\duong\dan\moi\pano-admin\public\pano"
```
Rồi chạy lại `npm run deploy`.

Sau đó trong `pano-admin`:
```bash
cd D:\laragon\www\pano-admin
git add public/pano public/assets
git commit -m "update pano viewer"
git push  # Actions sẽ FTP lên InfinityFree
```

### 5. Cấu trúc
```
src/
  App.jsx                 # useSiteSettings (đổi title/favicon theo /api/site-settings)
  components/
    TopHeader/            # th-menu-btn ẩn/hiện toàn bộ UI, Admin button theo role
    PanoramaViewer/       # preload + backdrop blur, zoom 2s vào hotspot rồi sang pano đích
    BuildingSidebar/      # scrollable, responsive
    FloorMap/ FloorSidebar/ FooterCarousel/ LoginScreen/
  hooks/
    useSiteSettings.jsx   # fetch /api/site-settings -> document.title
    useAuth.jsx           # /api/auth/me, session 10p
  styles/
    index.css + responsive.css (100dvh + safe-area)
```

### 6. Hiệu ứng chuyển cảnh
- Click hotspot -> `viewer.animate({ yaw, pitch, zoom:75, speed:2000 })` 2s -> preload ảnh đích -> switch ngay kích thước thật, không đen (backdrop blur).

---

## 🇬🇧 English

### 1. Requirements
- Node 20+

### 2. Setup after clone
```bash
git clone <pano-repo>
cd pano
npm install
```

### 3. Run dev
```bash
npm run dev     # Vite dev with proxy /api -> http://pano-admin.test
npm run deploy  # build + copy to pano-admin/public/pano
```

Edit `vite.config.js` `VITE_PROXY_TARGET` if `pano-admin` is elsewhere.

### 4. Build & Deploy
```bash
npm run build
npm run deploy  # see deploy.ps1 for steps
```
If you move `pano-admin` folder, update `deploy.ps1:8` `$LaravelPublicPano` then re-run `npm run deploy`. Then commit `public/pano` in `pano-admin` and `git push`.

### 5. Features
- TopHeader with role-based Admin link, fullscreen, help modal
- PanoramaViewer with 2s zoom-to-hotspot, preloaded, blurred backdrop (no black flash)
- Responsive (iPhone 13 fixed, BuildingSidebar scrollable)

---

## License
MIT
