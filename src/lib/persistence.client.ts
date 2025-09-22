"use client";
// Capa de persistencia en el cliente usando localStorage.
// Se usa cuando NEXT_PUBLIC_CLIENT_ONLY_STORAGE === 'true'

export type Role = 'gerente' | 'usuario';
export type User = { id: number; name: string; email: string; password: string; role: Role };
export type Task = { id: number; title: string; completed: boolean; assignedToName?: string };
export type Project = { id: number; name: string; tasks: Task[]; createdByName?: string; assignedToName?: string };

const USERS_KEY = 'users';
const PROJECTS_KEY = 'projects';
const CURRENT_USER_KEY = 'currentUser';

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

const save = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

export const getUsers = (): User[] => safeParse<User[]>(typeof window !== 'undefined' ? localStorage.getItem(USERS_KEY) : null, []);
export const saveUsers = (users: User[]) => save(USERS_KEY, users);
export const getProjects = (): Project[] => safeParse<Project[]>(typeof window !== 'undefined' ? localStorage.getItem(PROJECTS_KEY) : null, []);
export const saveProjects = (projects: Project[]) => save(PROJECTS_KEY, projects);

export const getCurrentUser = (): Pick<User, 'name' | 'role' | 'email'> | null => safeParse(localStorage.getItem(CURRENT_USER_KEY), null);
export const setCurrentUser = (user: Pick<User, 'name' | 'role' | 'email'> | null) => {
  if (user) save(CURRENT_USER_KEY, user); else try { localStorage.removeItem(CURRENT_USER_KEY); } catch {}
};

const nextId = (items: { id: number }[]) => items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;

// Usuarios
export function registerUser(input: { name: string; email: string; password: string; role: Role }): { ok: true; user: Omit<User, 'password'> } | { ok: false; error: string } {
  const users = getUsers();
  const exists = users.some(u => u.email.trim().toLowerCase() === input.email.trim().toLowerCase());
  if (exists) return { ok: false, error: 'El correo ya está registrado' };
  const user: User = { id: nextId(users), name: input.name.trim(), email: input.email.trim(), password: input.password, role: input.role };
  users.push(user);
  saveUsers(users);
  const { password, ...safeUser } = user;
  return { ok: true, user: safeUser };
}

export function loginUser(input: { email: string; password: string }): { ok: true; user: Omit<User, 'password'> } | { ok: false; error: string } {
  const users = getUsers();
  const user = users.find(u => u.email.trim().toLowerCase() === input.email.trim().toLowerCase() && u.password === input.password);
  if (!user) return { ok: false, error: 'Credenciales inválidas' };
  const { password, ...safeUser } = user;
  return { ok: true, user: safeUser };
}

// Proyectos
export function createProject(name: string, createdByName?: string): Project {
  const projects = getProjects();
  const project: Project = { id: nextId(projects), name: name.trim(), tasks: [], createdByName };
  projects.push(project);
  saveProjects(projects);
  return project;
}

export function renameProject(projectId: number, name: string) {
  const projects = getProjects();
  const p = projects.find(p => p.id === projectId);
  if (!p) return;
  p.name = name.trim();
  saveProjects(projects);
}

export function deleteProject(projectId: number) {
  const projects = getProjects().filter(p => p.id !== projectId);
  saveProjects(projects);
}

export function addTask(projectId: number, title: string) {
  const projects = getProjects();
  const p = projects.find(p => p.id === projectId);
  if (!p) return;
  const t: Task = { id: nextId(p.tasks || []), title: title.trim(), completed: false };
  p.tasks = [...(p.tasks || []), t];
  saveProjects(projects);
}

export function renameTask(projectId: number, taskId: number, title: string) {
  const projects = getProjects();
  const p = projects.find(p => p.id === projectId);
  const t = p?.tasks?.find(t => t.id === taskId);
  if (!p || !t) return;
  t.title = title.trim();
  saveProjects(projects);
}

export function deleteTask(projectId: number, taskId: number) {
  const projects = getProjects();
  const p = projects.find(p => p.id === projectId);
  if (!p) return;
  p.tasks = (p.tasks || []).filter(t => t.id !== taskId);
  saveProjects(projects);
}

export function setTaskCompleted(projectId: number, taskId: number, completed: boolean) {
  const projects = getProjects();
  const p = projects.find(p => p.id === projectId);
  const t = p?.tasks?.find(t => t.id === taskId);
  if (!p || !t) return;
  t.completed = completed;
  saveProjects(projects);
}

export function assignTask(projectId: number, taskId: number, assignedToName: string): { ok: true } | { ok: false; error: string } {
  const name = assignedToName.trim();
  const users = getUsers();
  const exists = users.some(u => u.name.trim().toLowerCase() === name.toLowerCase());
  if (!exists) return { ok: false, error: 'Usuario no encontrado' };
  const projects = getProjects();
  const p = projects.find(p => p.id === projectId);
  const t = p?.tasks?.find(t => t.id === taskId);
  if (!p || !t) return { ok: false, error: 'Proyecto o tarea no encontrado' };
  t.assignedToName = name;
  saveProjects(projects);
  return { ok: true };
}

export function assignProject(projectId: number, assignedToName: string): { ok: true } | { ok: false; error: string } {
  const name = assignedToName.trim();
  const users = getUsers();
  const exists = users.some(u => u.name.trim().toLowerCase() === name.toLowerCase());
  if (!exists) return { ok: false, error: 'Usuario no encontrado' };
  const projects = getProjects();
  const p = projects.find(p => p.id === projectId);
  if (!p) return { ok: false, error: 'Proyecto no encontrado' };
  p.assignedToName = name;
  saveProjects(projects);
  return { ok: true };
}

export function isClientOnlyMode(): boolean {
  return typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CLIENT_ONLY_STORAGE === 'true';
}
