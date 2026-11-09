import { useState, useEffect } from "react";
import { getProjectSlugFromPath, NAV_EVENT } from "../utils/slugRouter";

/**
 * Theo dõi project slug trên URL (vanilla, không cần react-router).
 * - Đọc segment đầu của pathname, VD: /du-an-a -> "du-an-a"
 * - Tự cập nhật khi user bấm Back/Forward hoặc khi navigateToProjectSlug() được gọi
 * - Giữ LoginScreen: slug chỉ dùng để chọn project sau khi login
 */
export function useProjectSlug() {
  const [slug, setSlug] = useState(() => getProjectSlugFromPath());

  useEffect(() => {
    const sync = () => setSlug(getProjectSlugFromPath());
    window.addEventListener("popstate", sync);
    window.addEventListener(NAV_EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(NAV_EVENT, sync);
    };
  }, []);

  return slug;
}
