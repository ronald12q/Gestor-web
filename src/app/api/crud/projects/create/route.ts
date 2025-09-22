import { NextResponse } from 'next/server';
import { readProjects, writeProjects, nextProjectId } from '@/lib/projects';
import { readUsers } from '@/lib/users';

// - aqui creamos un nuevo proyecto 
export async function POST(request: Request) {
	const body = await request.json();
	const { name, createdByName } = body || {};
	if (!name) return NextResponse.json({ error: 'nombre requerido' }, { status: 400 });

	let owner: string | undefined = undefined;
	if (typeof createdByName === 'string' && createdByName.trim() !== '') {
		const target = createdByName.trim().toLowerCase();
		const user = readUsers().find(u => u.name.trim().toLowerCase() === target && u.role === 'gerente');
		if (user) owner = user.name;
	}

	const projects = readProjects();
	const id = nextProjectId(projects);
	const newProject: { id: number; name: string; tasks: { id: number; title: string; completed: boolean; assignedToName?: string }[]; createdByName?: string } = { id, name, tasks: [], ...(owner ? { createdByName: owner } : {}) };
	writeProjects([...projects, newProject]);
	return NextResponse.json({ project: newProject }, { status: 201 });
}
