const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function buildUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  return API_BASE ? `${API_BASE}${path}` : path;
}

export function getXsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getCsrfCookie() {
  const url = buildUrl("/sanctum/csrf-cookie");
  await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
}

async function request(path, options = {}) {
  const token = getXsrfToken();
  const { headers: optHeaders, ...rest } = options;
  const url = buildUrl(path);
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { "X-XSRF-TOKEN": token } : {}),
      ...optHeaders,
    },
    ...rest,
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
    return json.data || json;
  },
  getProject: async (slug) => {
    const json = await request(`/api/projects/${encodeURIComponent(slug)}`);
    return json.data || json;
  },
  getVideos: async (projectId = null) => {
    const qs = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
    const json = await request(`/api/videos${qs}`);
    return json.data || json;
  },
  getProjectVideos: async (slug) => {
    const json = await request(`/api/projects/${encodeURIComponent(slug)}/videos`);
    return json.data || json;
  },
  
  resolveImageUrl: (path) => {
    if (!path) return null;
    if (/^https?:\/\//.test(path) || path.startsWith("//")) return path;
    if (path.startsWith("/")) return buildUrl(path);
    return buildUrl(`/storage/${path}`);
  },
};
