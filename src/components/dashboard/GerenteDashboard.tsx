"use client";
/**
 * Dashboard de Gerente
 * - Crear, renombrar y eliminar proyectos.
 * - Crear, renombrar, eliminar y completar tareas.
 * - Asignar proyectos y tareas a usuarios existentes.
 * - Solo muestra proyectos creados por el gerente actual.
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import InputModal from '@/components/InputModal';
import IconButton from '@/components/IconButton';

type Task = { id: number; title: string; completed: boolean; assignedToName?: string };
type Project = { id: number; name: string; tasks: Task[]; createdByName?: string; assignedToName?: string };

export default function GerenteDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  // nombre local usado por formularios/inputs en páginas independientes
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name:string, role:string} | null>(null);
  type Mode = 'create-project' | 'rename-project' | 'add-task' | 'rename-task' | 'assign-task';
  const [modal, setModal] = useState<{ open: boolean; mode?: Mode; projectId?: number; taskId?: number; current?: string; error?: string }>({ open: false });
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crud/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    try {
      const u = localStorage.getItem('currentUser');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}
  }, [load]);

  const createProject = async (projectName: string) => {
    const name = projectName.trim();
    if (!name) return;
  // Derivar propietario desde el estado o localStorage como respaldo
    let ownerName = currentUser?.name || '';
    if (!ownerName) {
      try {
        const raw = localStorage.getItem('currentUser');
        if (raw) ownerName = (JSON.parse(raw)?.name as string) || '';
      } catch {}
    }
    const res = await fetch('/api/crud/projects/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, createdByName: ownerName })
    });
  if (res.ok) { await load(); }
  };
  const renameProject = async (projectId: number, newName: string) => {
    const name = newName.trim();
    if (!name) return;
    await fetch(`/api/crud/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    await load();
  };
  const removeProject = useCallback(async (projectId: number) => {
    await fetch(`/api/crud/projects/${projectId}`, { method: 'DELETE' });
    await load();
  }, [load]);

  const logout = () => { try { localStorage.removeItem('currentUser'); } catch {}; router.push('/auth'); };

  return (
  <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel De Gerente</h1>
          {currentUser && <p className="text-purple-400">Bienvenido, {currentUser.name}</p>}
        </div>
        <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl">Cerrar Sesión</button>
      </div>
      <div>
        <IconButton
          variant="blue"
          className="rounded-2xl px-4 py-3"
          onClick={() => setModal({ open: true, mode: 'create-project' })}
          icon={<PlusIcon />}
          label="Agregar proyecto"
        />
      </div>
      <h2 className="text-2xl font-semibold">Proyectos</h2>
      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
  {useMemo(() => {
        const norm = (s: string) => s.trim().toLowerCase();
        const owner = currentUser?.name ? norm(currentUser.name) : '';
        const owned = (projects || []).filter(p => p.createdByName && norm(p.createdByName) === owner);
        if (owned.length === 0) {
          return (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 text-sm text-gray-300">
              Aún no tienes proyectos. Crea uno para empezar.
            </div>
          );
        }
        return (
          <ul className="space-y-5">
            {owned.map(p => (
              <li key={p.id} className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-lg">{p.name}</div>
                    {p.createdByName && <div className="text-xs text-gray-400">Creado por {p.createdByName}</div>}
                    {p.assignedToName && <div className="text-xs text-gray-400">Asignado a {p.assignedToName}</div>}
                  </div>
                  <div className="flex gap-2">
                    <IconButton variant="green" icon={<PlusIcon />} aria-label="Añadir tarea" onClick={() => setModal({ open: true, mode: 'add-task', projectId: p.id })} />
                    <IconButton variant="yellow" icon={<UserIcon />} aria-label="Asignar proyecto" onClick={() => setModal({ open: true, mode: 'assign-task', projectId: p.id })} />
                    <IconButton variant="purple" icon={<PencilIcon />} aria-label="Renombrar" onClick={() => setModal({ open: true, mode: 'rename-project', projectId: p.id, current: p.name })} />
                    <IconButton variant="red" icon={<TrashIcon />} aria-label="Eliminar" onClick={() => removeProject(p.id)} />
                  </div>
                </div>
                <ProjectTasks project={p} onChanged={load} onOpenModal={(m) => setModal({ open: true, ...m })} />
              </li>
            ))}
          </ul>
        );
      }, [projects, currentUser, load, removeProject])}
      <InputModal
        open={modal.open}
        title={modal.mode === 'create-project' ? 'Nombre del proyecto' : modal.mode === 'rename-project' ? 'Renombrar proyecto' : modal.mode === 'add-task' ? 'Nueva tarea' : modal.mode === 'rename-task' ? 'Renombrar tarea' : 'Asignar'}
        placeholder={'Nombre'}
        confirmLabel={modal.mode?.includes('assign') ? 'Asignar' : (modal.mode === 'add-task' ? 'Crear' : 'Guardar')}
        initialValue={modal.current || ''}
        error={modal.error}
        onValueChange={() => setModal(m => ({ ...m, error: undefined }))}
        onClose={() => setModal({ open: false })}
        onSubmit={async (value) => {
          const v = value.trim();
          if (!v) { setModal({ open: false }); return; }
          try {
            if (modal.mode === 'create-project') {
              await createProject(v);
            } else if (modal.mode === 'rename-project' && modal.projectId != null) {
              await renameProject(modal.projectId, v);
            } else if (modal.mode === 'add-task' && modal.projectId != null) {
              await fetch(`/api/crud/projects/${modal.projectId}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: v }) });
            } else if (modal.mode === 'rename-task' && modal.projectId != null && modal.taskId != null) {
              await fetch(`/api/crud/projects/${modal.projectId}/tasks/${modal.taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: v }) });
            } else if (modal.mode === 'assign-task' && modal.projectId != null && modal.taskId != null) {
              const res = await fetch(`/api/crud/projects/${modal.projectId}/tasks/${modal.taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignedToName: v }) });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setModal(m => ({ ...m, error: data.error || 'Error al asignar' }));
                return; // mantener modal abierto
              }
            } else if (modal.mode === 'assign-task' && modal.projectId != null && modal.taskId == null) {
              const res = await fetch(`/api/crud/projects/${modal.projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignedToName: v }) });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setModal(m => ({ ...m, error: data.error || 'Error al asignar' }));
                return; // mantener modal abierto
              }
            }
          } finally {
            // Cerrar solo si no hay mensaje de error
            setModal(m => (m.error ? m : { open: false }));
            await load();
          }
        }}
      />
    </div>
  );
}

function ProjectTasks({ project, onChanged, onOpenModal }: { project: Project; onChanged: () => void; onOpenModal: (m: { mode: 'assign-task'|'rename-task'; projectId: number; taskId: number; current?: string }) => void }) {
  const projectId = project.id;
  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [title, setTitle] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTaskId, setAssignTaskId] = useState<number | null>(null);

  const loadProject = useCallback(async () => {
    const res = await fetch('/api/crud/projects');
    const data = await res.json();
    const proj = (data.projects || []).find((p: Project) => p.id === projectId);
    setTasks(proj?.tasks || []);
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);
  // Sincronizar tareas con actualizaciones del proyecto padre para que nuevas tareas aparezcan sin recarga completa
  useEffect(() => { setTasks(project.tasks || []); }, [project.tasks]);

  const add = useCallback(async (taskTitle: string) => {
    const t = taskTitle.trim();
    if (!t) return;
    const res = await fetch(`/api/crud/projects/${projectId}/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: t })
    });
    if (res.ok) { setTitle(''); await loadProject(); onChanged(); }
  }, [projectId, loadProject, onChanged]);

  const toggle = async (tid: number, completed: boolean) => {
    await fetch(`/api/crud/projects/${projectId}/tasks/${tid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    await loadProject(); onChanged();
  };

  const remove = async (tid: number) => {
    await fetch(`/api/crud/projects/${projectId}/tasks/${tid}`, { method: 'DELETE' });
    await loadProject(); onChanged();
  };

  const assign = useCallback((tid: number) => { setAssignTaskId(tid); setAssignOpen(true); }, []);
  const onAssignSubmit = async (value: string) => {
    if (assignTaskId == null) return setAssignOpen(false);
    await fetch(`/api/crud/projects/${projectId}/tasks/${assignTaskId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToName: value })
    });
    setAssignOpen(false); setAssignTaskId(null); await loadProject(); onChanged();
  };

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mt-4">
      <div className="text-sm text-gray-400 mb-1">{completed}/{total} completadas ({percent}%)</div>
      <div className="h-2 bg-slate-700/80 rounded mb-3 overflow-hidden">
        <div className="h-2 bg-green-600" style={{ width: `${percent}%` }} />
      </div>
      <div className="h-px bg-slate-700/60 my-4" />
      <ul className="mt-3 space-y-3">
        {tasks.map(t => (
          <li key={t.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/30 p-4">
            <div>
              <div className={t.completed ? 'line-through text-gray-500' : ''}>{t.title}</div>
              <div className="text-xs text-gray-400">{t.assignedToName ? `Asignada a ${t.assignedToName}` : 'Sin asignar'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-xl border ${t.completed ? 'border-green-700 text-green-300 bg-green-700/20' : 'border-slate-600 text-slate-300 bg-slate-700/30'}`}>{t.completed ? 'Completada' : 'Pendiente'}</span>
              <IconButton variant="yellow" icon={<UserIcon />} aria-label="Asignar" onClick={() => onOpenModal({ mode: 'assign-task', projectId, taskId: t.id, current: t.assignedToName || '' })} />
              <IconButton variant="purple" icon={<PencilIcon />} aria-label="Editar" onClick={() => onOpenModal({ mode: 'rename-task', projectId, taskId: t.id, current: t.title })} />
              <IconButton variant="red" icon={<TrashIcon />} aria-label="Eliminar" onClick={() => remove(t.id)} />
              <IconButton variant={t.completed ? 'green' : 'slate'} icon={<CheckIcon />} aria-label="Toggle" onClick={() => toggle(t.id, !t.completed)} />
            </div>
          </li>
        ))}
      </ul>
      <InputModal open={assignOpen} title="Asignar tarea a..." placeholder="Nombre de usuario" onClose={() => setAssignOpen(false)} onSubmit={onAssignSubmit} />
    </div>
  );
}

// Iconos inline simples para evitar dependencias externas
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
      <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 7h12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor"/>
      <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
