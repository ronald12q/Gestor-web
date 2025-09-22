import { NextResponse } from 'next/server';
import { readUsers, User } from '@/lib/users';

// login — autenticación simple por email/contraseña
export async function POST(request: Request) {
	const body = await request.json();
	const { email, password } = body || {};
	if (!email || !password) return NextResponse.json({ error: 'email y contraseña son requeridos' }, { status: 400 });

	const users: User[] = readUsers();
	const user = users.find((u: User) => u.email === email && u.password === password);
	if (!user) return NextResponse.json({ error: 'credenciales invalidas' }, { status: 401 });

	const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
	return NextResponse.json({ user: safe });
}
