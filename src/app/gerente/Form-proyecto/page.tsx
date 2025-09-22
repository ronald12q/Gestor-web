"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormProyectoPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
  const res = await fetch('/api/crud/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      router.push('/gerente');
    } catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nuevo Proyecto</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Nombre del proyecto" value={name} onChange={e => setName(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Crear</button>
      </form>
    </div>
  );
}
