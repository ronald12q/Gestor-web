import { NextResponse } from 'next/server';
import { readProjects } from '@/lib/projects';

export async function GET() {
  const projects = readProjects();
  return NextResponse.json({ projects });
}
