import { NextResponse } from 'next/server';
import { readProjects, writeProjects, nextTaskId } from '@/lib/projects';
import { readUsers } from '@/lib/users';

// tareas - agregar nueva tarea
export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const id = Number(params.projectId);
  const body = await request.json();
  const { title, assignedToName } = body || {};
  if (!title) return NextResponse.json({ error: 'título requerido' }, { status: 400 });

  const projects = readProjects();
  const project = projects.find(p => p.id === id);
  if (!project) return NextResponse.json({ error: 'proyecto no encontrado' }, { status: 404 });

  let assigned: string | undefined = undefined;
  if (typeof assignedToName === 'string' && assignedToName.trim() !== '') {
    const target = assignedToName.trim().toLowerCase();
    const user = readUsers().find(u => u.name.trim().toLowerCase() === target);
  if (!user) return NextResponse.json({ error: 'usuario no encontrado' }, { status: 400 });
    assigned = user.name;
  }

  const taskId = nextTaskId(project.tasks || []);
  const newTask: any = { id: taskId, title, completed: false };
  if (assigned) newTask.assignedToName = assigned;
  project.tasks = project.tasks || [];
  project.tasks.push(newTask);
  writeProjects(projects);
  return NextResponse.json({ task: newTask }, { status: 201 });
}
