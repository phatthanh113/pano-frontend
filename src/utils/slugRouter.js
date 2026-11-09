/**
 * Vanilla slug router cho frontend — không cần react-router-dom.
 *
 * Quy ước URL: /:slug trực tiếp, VD: domain.com/du-an-a
 * - Slug = segment đầu tiên của pathname
 * - Bỏ qua các prefix/reserved: admin, api, storage, assets, pano (base deploy), file tĩnh
 */

// Những segment đầu KHÔNG phải project slug
const RESERVED_SEGMENTS = new Set([
  "admin",
  "api",
  "storage",
  "assets",
  "sanctum",
  "pano",
  "favicon.ico",
  "robots.txt",
]);

// Base prefix khi frontend được serve từ subfolder public/pano (VD: /pano/du-an-a)
// Nếu deploy ở root "/" thì prefix này đơn giản là không xuất hiện.
const BASE_PREFIX = "pano";

function isStaticFile(segment) {
  // vite.svg, *.js, *.css, *.png... có dấu chấm + extension
  return /\.[a-z0-9]+$/i.test(segment);
}

/**
 * Lấy project slug từ pathname hiện tại.
 * @param {string} [pathname] - mặc định window.location.pathname
 * @returns {string|null} slug đã decode, hoặc null nếu đang ở "/" / route reserved
 */
export function getProjectSlugFromPath(pathname) {
  const path =
    typeof pathname === "string"
      ? pathname
      : typeof window !== "undefined"
        ? window.location.pathname
        : "/";
  const segments = path.split("/").filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  if (segments.length === 0) return null;

  let first = segments[0];
  // /pano đơn lẻ (không slug) -> coi như "/" để React tự redirect về project đầu tiên
  if (first.toLowerCase() === BASE_PREFIX) {
    if (segments.length < 2) return null;
    first = segments[1];
  }
  if (!first) return null;
  const lowered = first.toLowerCase();
  if (RESERVED_SEGMENTS.has(lowered)) return null;
  if (isStaticFile(first)) return null;
  return first;
}

/** Tìm project khớp slug (ưu tiên field `slug`, fallback `id`). */
export function findProjectBySlug(projects, slug) {
  if (!Array.isArray(projects) || !slug) return null;
  const needle = String(slug).toLowerCase();
  return (
    projects.find(
      (p) =>
        (p.slug && String(p.slug).toLowerCase() === needle) ||
        String(p.id ?? "").toLowerCase() === needle
    ) || null
  );
}

/** Slug dùng để hiển thị trên URL (ưu tiên `slug`, fallback `id`). */
export function getProjectUrlSlug(project) {
  if (!project) return null;
  return project.slug || String(project.id);
}

/** Build path "/:slug" (giữ nguyên base /pano nếu đang ở subfolder). */
export function buildProjectPath(slug) {
  const clean = encodeURIComponent(String(slug));
  if (
    typeof window !== "undefined" &&
    window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase() === BASE_PREFIX
  ) {
    return `/${BASE_PREFIX}/${clean}`;
  }
  return `/${clean}`;
}

const NAV_EVENT = "pano:navigate";

/** Điều hướng tới project slug bằng History API (push hoặc replace). */
export function navigateToProjectSlug(slug, { replace = false } = {}) {
  if (typeof window === "undefined") return;
  const target = slug ? buildProjectPath(slug) : "/";
  const current = window.location.pathname;
  if (current === target) return;
  if (replace) {
    window.history.replaceState(null, "", target);
  } else {
    window.history.pushState(null, "", target);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: { path: target } }));
}

export { NAV_EVENT };
