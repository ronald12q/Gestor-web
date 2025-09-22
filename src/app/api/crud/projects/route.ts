import { NextResponse } from 'next/server';
import { readProjects } from '@/lib/projects';

// GET /api/crud/projects
export async function GET() {
	const projects = readProjects();
	return NextResponse.json({ projects });
}
