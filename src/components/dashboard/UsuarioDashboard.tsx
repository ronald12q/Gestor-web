"use client";
/**
 * Dashboard de Usuario
 * - Muestra solo proyectos asignados al usuario y sus tareas asignadas.
 * - Oculta tareas sin asignar (hasta que el gerente las asigne).
 * - Permite únicamente marcar tareas como completadas/pendientes.
 * - Muestra progreso y conteo del proyecto completo y de las tareas propias.
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isClientOnlyMode, getProjects as getLocalProjects, setTaskCompleted as setLocalTaskCompleted } from '@/lib/persistence.client';

type Task = { id: number; title: string; completed: boolean; assignedToName?: string };
type Project = { id: number; name: string; tasks: Task[]; assignedToName?: string };

export default function UsuarioDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<{name:string, role:string} | null>(null);
  const router = useRouter();

  const load = async () => {
    if (isClientOnlyMode()) {
      setProjects(getLocalProjects());
    } else {
      const res = await fetch('/api/crud/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    }
  };
  useEffect(() => {
    load();
    try {
      const u = localStorage.getItem('currentUser');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}
  }, []);

  const logout = () => { try { localStorage.removeItem('currentUser'); } catch {}; router.push('/auth'); };

  
  const filtered = useMemo(() => {
    if (!currentUser) return [] as Project[];
    const norm = (s: string) => s.trim().toLowerCase();
    const uname = norm(currentUser.name || '');
    return (projects || [])
      .map((p) => {
        const matchProject = p.assignedToName ? norm(p.assignedToName) === uname : false;
        const userTasks = (p.tasks || []).filter((t) => t.assignedToName && norm(t.assignedToName) === uname);
        if (!matchProject && userTasks.length === 0) return null;
  // Mostrar siempre solo las tareas del usuario; ocultar tareas sin asignar incluso si el proyecto está asignado
        return {
          ...p,
          tasks: userTasks,
        } as Project;
      })
      .filter(Boolean) as Project[];
  }, [projects, currentUser]);

  const total = filtered.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const completed = filtered.reduce((acc, p) => acc + (p.tasks?.filter(t => t.completed).length || 0), 0);
  const percent = total ? Math.round((completed/total)*100) : 0;

  return (
  <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel de usuario</h1>
          {currentUser && <p className="text-gray-300">Bienvenido, {currentUser.name} — Progreso: {percent}%</p>}
        </div>
  <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl">Cerrar Sesión</button>
      </div>
      <div>
        <h2 className="text-2xl font-semibold">Proyectos asignados</h2>
        <p className="text-sm text-gray-400">Tareas asignadas</p>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 text-sm text-gray-300">
          Aún no tienes proyectos asignados, espera a que el gerente asigne uno.
        </div>
      ) : (
        <ul className="space-y-5">
          {filtered.map(p => {
            const pt = p.tasks || [];
           
            const original = projects.find(op => op.id === p.id);
            const fullTasks = original?.tasks || [];
            const fullCompleted = fullTasks.filter(t => t.completed).length;
            const fullPercent = fullTasks.length ? Math.round((fullCompleted / fullTasks.length) * 100) : 0;
            return (
              <li key={p.id} className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                <div className="font-semibold text-lg">{p.name}</div>
                {currentUser && p.assignedToName && p.assignedToName.trim().toLowerCase() === currentUser.name.trim().toLowerCase() && (
                  <div className="text-xs text-gray-400">Proyecto asignado</div>
                )}
                <div className="text-xs text-gray-400">Tareas del proyecto: {fullTasks.length}</div>
                <div className="text-xs text-gray-400">Tus tareas: {pt.length}</div>
                <div className="h-2 bg-slate-700/80 rounded my-3 overflow-hidden">
                  <div className="h-2 bg-green-600" style={{ width: `${fullPercent}%` }} />
                </div>
                <div className="text-sm text-gray-400 mb-2">{fullCompleted}/{fullTasks.length} completadas ({fullPercent}%)</div>
                {pt.length === 0 ? (
                  <div className="text-sm text-gray-400 italic">Aún no tienes tareas asignadas en este proyecto.</div>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {pt.map(t => (
                      <li key={t.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/30 p-4">
                        <div>
                          <div className={t.completed ? 'line-through text-gray-500' : ''}>{t.title}</div>
                          <div className="text-xs text-gray-400">Tarea asignada</div>
                        </div>
                        <button
                          title={t.completed ? 'Marcar pendiente' : 'Marcar completada'}
                          onClick={async () => {
                            if (isClientOnlyMode()) {
                              setLocalTaskCompleted(p.id, t.id, !t.completed);
                              await load();
                            } else {
                              await fetch(`/api/crud/projects/${p.id}/tasks/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !t.completed }) });
                              await load();
                            }
                          }}
                          className={`px-3 py-2 rounded-xl ${t.completed ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-200'} hover:opacity-90`}
                        >
                          ✓
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
