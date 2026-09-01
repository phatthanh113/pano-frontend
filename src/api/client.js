/**
 * API Client - Pano Frontend <-> Laravel Backend
 * - Dev: VITE_API_BASE_URL="" => fetch("/api/...") đi qua Vite proxy -> http://pano-admin.test (không CORS)
 * - Prod same-origin: cũng fetch("/api/...") vì React được serve từ Laravel public
 * - Prod tách domain: set VITE_API_BASE_URL=https://api.domain.com thì fetch cross-origin (đã có CORS config)
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  // nếu API_BASE rỗng => same-origin
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${url}: ${text.slice(0, 300)}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export const api = {
  health: () => request("/api/health"),
  getProjects: async () => {
    const json = await request("/api/projects");
    // backend trả { data: [...] }
    return json.data || json;
  },
  getProject: async (slug) => {
    const json = await request(`/api/projects/${encodeURIComponent(slug)}`);
    return json.data || json;
  },
  // helper resolve image url: nếu trả về /storage/... thì cũng đi qua proxy / cùng origin
  resolveImageUrl: (path) => {
    if (!path) return null;
    if (/^https?:\/\//.test(path) || path.startsWith("//")) return path;
    // /storage/... hoặc /images/... => same-origin
    if (path.startsWith("/")) return buildUrl(path);
    // storage relative e.g. panoramas/xxx.jpg => /storage/xxx.jpg
    return buildUrl(`/storage/${path}`);
  },
};
