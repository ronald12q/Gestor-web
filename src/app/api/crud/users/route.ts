import { NextResponse } from 'next/server';
import { readUsers } from '@/lib/users';

// GET /api/crud/users — lista de usuarios sin contraseñas
export async function GET() {
	const users = readUsers().map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
	return NextResponse.json({ users });
}
