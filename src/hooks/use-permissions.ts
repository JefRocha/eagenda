import { useEffect, useState } from "react";

export function usePermissions(userId: string | null) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchPermissions = async () => {
      try {
        const res = await fetch(`/api/permissions?userId=${userId}`);
        const data = await res.json();
        setPermissions(data.permissions || []);
      } catch (err) {
        console.error("Erro ao buscar permissões", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  return { permissions, loading };
}
