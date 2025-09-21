/**
 * Lib de usuarios
 * Lectura/escritura sobre public/data/usuarios.json archivo que sirve de base de datos
 */
import fs from 'fs';
import path from 'path';

export interface User { id: number; name: string; email: string; password: string; role: 'gerente' | 'usuario' }

const filePath = path.join(process.cwd(), 'public', 'data', 'usuarios.json');

function readFile() {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return { users: [] as User[] }; }
}
function writeFile(data: any) { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); }

export function readUsers(): User[] { return readFile().users as User[]; }
export function writeUsers(users: User[]) { writeFile({ users }); }
export function nextUserId(users: User[]) { return users.length === 0 ? 1 : Math.max(...users.map(u => u.id)) + 1; }
