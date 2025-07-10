// form.tsx
"use client";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export type Permission = {
  id: string;
  name: string;
};

interface Props {
  userId: string;
}

export default function PermissionForm({ userId }: Props) {
  const [available, setAvailable] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const avRes = await fetch(`/api/permissions?userId=${userId}`);
      const { availablePermissions, userPermissions } = await avRes.json();
      setAvailable(availablePermissions);
      setSelected(userPermissions);
    })();
  }, [userId]);

  const toggle = (id: string) => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
    );
  };

  const save = async () => {
    setLoading(true);
    await fetch(`/api/permissions`, {
      method: "POST",
      body: JSON.stringify({ userId, permissions: selected }),
    });
    setLoading(false);
    alert("Atualizado com sucesso!");
  };

  return (
    <div>
      {available.map(p => (
        <label key={p.id} className="block">
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={() => toggle(p.id)}
          />{" "}
          {p.name}
        </label>
      ))}
      <Button onClick={save} disabled={loading} className="mt-4">
        {loading ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
