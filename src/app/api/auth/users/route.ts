import { NextResponse } from 'next/server';
import { readUsers } from '../../../../lib/users';

// GET /api/auth/users - listar usuarios sin 
export async function GET() {
  const users = readUsers().map(({ password, ...rest }) => rest);
  return NextResponse.json({ users });
}
