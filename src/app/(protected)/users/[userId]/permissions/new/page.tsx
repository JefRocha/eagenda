"use client";

import { useState } from "react";

export default function CreatePermissionPage() {
  const [route, setRoute] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ route, description }),
    });

    if (res.ok) {
      alert("Permissão criada com sucesso!");
      setRoute("");
      setDescription("");
    } else {
      alert("Erro ao criar permissão.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Nova Permissão</h1>
      <div>
        <label className="block">Rota protegida</label>
        <input
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          placeholder="/dashboard, /admin"
        />
      </div>
      <div>
        <label className="block">Descrição</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Salvar
      </button>
    </form>
  );
}
