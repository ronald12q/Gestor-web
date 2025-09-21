import { NextResponse } from 'next/server';
import { readProjects, writeProjects } from '@/lib/projects';
import { readUsers } from '@/lib/users';

//  -  o actualizar
//  - eliminar tarea
export async function PATCH(request: Request, { params }: { params: { projectId: string, taskId: string } }) {
  const pid = Number(params.projectId);
  const tid = Number(params.taskId);
  const body = await request.json();
  const { title, completed, assignedToName } = body || {};

  const projects = readProjects();
  const project = projects.find(p => p.id === pid);
  if (!project) return NextResponse.json({ error: 'proyecto no encontrado' }, { status: 404 });
  const task = (project.tasks || []).find(t => t.id === tid);
  if (!task) return NextResponse.json({ error: 'tarea no encontrada' }, { status: 404 });

  if (typeof title === 'string') task.title = title;
  if (typeof completed === 'boolean') task.completed = completed;
  if (body.hasOwnProperty('assignedToName')) {
    if (assignedToName === null || (typeof assignedToName === 'string' && assignedToName.trim() === '')) {
      delete task.assignedToName;
    } else if (typeof assignedToName === 'string') {
      const target = assignedToName.trim().toLowerCase();
      const user = readUsers().find(u => u.name.trim().toLowerCase() === target);
      if (!user) {
        return NextResponse.json({ error: 'usuario no encontrado' }, { status: 400 });
      }
      task.assignedToName = user.name;
    }
  }
  writeProjects(projects);
  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, { params }: { params: { projectId: string, taskId: string } }) {
  const pid = Number(params.projectId);
  const tid = Number(params.taskId);
  const projects = readProjects();
  const project = projects.find(p => p.id === pid);
  if (!project) return NextResponse.json({ error: 'proyecto no encontrado' }, { status: 404 });
  const idx = (project.tasks || []).findIndex(t => t.id === tid);
  if (idx === -1) return NextResponse.json({ error: 'tarea no encontrada' }, { status: 404 });
  const [removed] = project.tasks.splice(idx, 1);
  writeProjects(projects);
  return NextResponse.json({ task: removed });
}
