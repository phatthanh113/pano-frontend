import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import fallbackProjects from "../projects/projectsData";

/**
 * Hook fetch projects từ Laravel API
 * - Thành công => dùng data từ DB (Filament admin)
 * - Thất bại (API chưa có data / đang dev offline) => fallback về projectsData.js cứng
 * - Có loading/error để UI hiển thị
 */
export function useProjects() {
  const [projects, setProjects] = useState(null); // null = chưa load
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjects();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("API returned empty projects");
      }
      setProjects(data);
      setIsFallback(false);
    } catch (err) {
      console.warn("[useProjects] API failed, using fallback data:", err.message);
      setProjects(fallbackProjects);
      setIsFallback(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, isFallback, refetch: fetchProjects };
}
