import { useState, useEffect } from "react";

export function useSiteSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-settings", { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setSettings(data);
        // Cập nhật title theo tên công ty ở backend
        if (data.company_name) {
          document.title = data.company_name;
        }
        // Cập nhật favicon theo logo ở backend
        if (data.logo_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = data.logo_url;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
