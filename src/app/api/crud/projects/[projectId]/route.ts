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

	const base = process.env.JSON_API_BASE_URL;
	if (base) {
		// JSON Server: PATCH /projects/:id
		const payload: any = {};
		if (typeof name === 'string') payload.name = name;
		if (body.hasOwnProperty('assignedToName')) payload.assignedToName = assignedToName || undefined;
		const res = await fetch(`${base}/projects/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!res.ok) return NextResponse.json({ error: 'error actualizando proyecto' }, { status: 500 });
		const project = await res.json();
		return NextResponse.json({ project });
	} else {
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
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
	const { projectId } = await params;
	const id = Number(projectId);
	const base = process.env.JSON_API_BASE_URL;
	if (base) {
		const res = await fetch(`${base}/projects/${id}`, { method: 'DELETE' });
		if (!res.ok) return NextResponse.json({ error: 'error eliminando proyecto' }, { status: 500 });
		// JSON Server devuelve cuerpo vacío en DELETE por defecto; devolvemos el id eliminado para consistencia
		return NextResponse.json({ project: { id } });
	} else {
		const projects = readProjects();
		const idx = projects.findIndex(p => p.id === id);
		if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
		const [removed] = projects.splice(idx, 1);
		writeProjects(projects);
		return NextResponse.json({ project: removed });
	}
}
