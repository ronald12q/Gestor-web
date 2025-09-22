import { NextResponse } from 'next/server';
import { readProjects, writeProjects } from '@/lib/projects';
import { readUsers } from '@/lib/users';

// para actualizar o eliminar un proyecto
export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
	const { projectId } = await params;
	const id = Number(projectId);
	const body = await request.json();
	const { name, assignedToName } = body || {};
	if (typeof name !== 'string' && typeof assignedToName !== 'string' && assignedToName !== null) {
		return NextResponse.json({ error: 'nada que actualizar' }, { status: 400 });
	}

	const projects = readProjects();
	const idx = projects.findIndex(p => p.id === id);
	if (idx === -1) return NextResponse.json({ error: 'no encontrado' }, { status: 404 });
	if (typeof name === 'string') projects[idx].name = name;
	if (body.hasOwnProperty('assignedToName')) {
		if (assignedToName === null || (typeof assignedToName === 'string' && assignedToName.trim() === '')) {
			delete projects[idx].assignedToName;
		} else if (typeof assignedToName === 'string') {
			const target = assignedToName.trim().toLowerCase();
			const user = readUsers().find(u => u.name.trim().toLowerCase() === target);
			if (!user) return NextResponse.json({ error: 'usuario no encontrado' }, { status: 400 });
			projects[idx].assignedToName = user.name;
		}
	}
	writeProjects(projects);
	return NextResponse.json({ project: projects[idx] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
	const { projectId } = await params;
	const id = Number(projectId);
	const projects = readProjects();
	const idx = projects.findIndex(p => p.id === id);
	if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
	const [removed] = projects.splice(idx, 1);
	writeProjects(projects);
	return NextResponse.json({ project: removed });
}
