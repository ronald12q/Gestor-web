import { NextResponse } from 'next/server';
import { readUsers, writeUsers, nextUserId, User } from '../../../../lib/users';

//  - crear un nuevo usuario
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, role } = body || {} as Partial<User>;
  if (!name || !email || !password || !role) return NextResponse.json({ error: 'faltan campos' }, { status: 400 });
  if (role !== 'gerente' && role !== 'usuario') return NextResponse.json({ error: 'rol inválido' }, { status: 400 });

  const users = readUsers();
  if (users.some(u => u.email === email)) return NextResponse.json({ error: 'el correo ya existe' }, { status: 409 });
  const id = nextUserId(users);
  const newUser: User = { id, name, email, password, role } as User;
  writeUsers([...users, newUser]);
  const { password: _pw, ...safe } = newUser as any;
  return NextResponse.json({ user: safe }, { status: 201 });
}
