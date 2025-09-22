/**
 * Lib de proyectos
 * Lectura/escritura sobre public/data/proyectos.json archivo que sirve de BD para proyectos/tareas
 */
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'proyectos.json');

interface Task { id: number; title: string; completed: boolean; assignedToName?: string }
interface Project { id: number; name: string; assignedTo?: number; assignedToName?: string; createdByName?: string; tasks: Task[] }

function readFile() {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return { projects: [] }; }
}
function writeFile(data: unknown) { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); }

export function readProjects(): Project[] { return readFile().projects; }
export function writeProjects(projects: Project[]) { writeFile({ projects }); }
export function nextProjectId(projects: Project[]) { return projects.length === 0 ? 1 : Math.max(...projects.map(p => p.id)) + 1; }
export function nextTaskId(tasks: Task[]) { return tasks.length === 0 ? 1 : Math.max(...tasks.map(t => t.id)) + 1; }
