"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isClientOnlyMode, registerUser } from '@/lib/persistence.client';
type Role = 'gerente' | 'usuario';

export default function RegisterForm() {
  const search = useSearchParams();
  const roleParam = (search.get('role') as Role) || 'usuario';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const role: Role = roleParam;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isClientOnlyMode()) {
      const res = registerUser({ name, email, password, role });
      if (!res.ok) { setError(res.error); return; }
      setSuccess(`Usuario creado: ${res.user.name}`);
      setName(''); setEmail(''); setPassword('');
      setTimeout(() => setSuccess(null), 3000);
      return;
    }
    const resp = await fetch('/api/crud/users/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role })
    });
    const data = await resp.json();
    if (!resp.ok) return setError(data.error || 'Error');
    setSuccess(`Usuario creado: ${data.user.name}`);
    setName(''); setEmail(''); setPassword('');
    setTimeout(() => setSuccess(null), 3000);
  };

  const badgeClasses = role === 'gerente' ? 'bg-purple-700/20 text-purple-300' : 'bg-blue-700/20 text-blue-300';
  const nameColor = role === 'gerente' ? 'text-purple-300' : 'text-blue-300';
  const buttonGradient = role === 'gerente'
    ? 'from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300'
    : 'from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300';
  const linkColor = role === 'gerente' ? 'text-purple-400' : 'text-blue-400';

  return (
    <div className="w-full space-y-6 max-w-md rounded-3xl border border-slate-700 bg-slate-900/60 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${badgeClasses}`}>
          Registro como <b className={`${nameColor} capitalize`}>{role}</b>
        </span>
        <Link href="/auth" className="text-sm text-slate-300 hover:text-white">← Regresar</Link>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <input className="w-full h-12 rounded-xl bg-slate-800/70 border border-slate-700 px-4 text-base leading-6 text-slate-200 placeholder-slate-400 appearance-none focus:outline-none" placeholder="Usuario aquí" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full h-12 rounded-xl bg-slate-800/70 border border-slate-700 px-4 text-base leading-6 text-slate-200 placeholder-slate-400 appearance-none focus:outline-none" placeholder="correo aquí" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full h-12 rounded-xl bg-slate-800/70 border border-slate-700 px-4 text-base leading-6 text-slate-200 placeholder-slate-400 appearance-none focus:outline-none" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <div className="mx-auto my-2 max-w-xs text-center bg-emerald-800/40 text-emerald-200 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        <button className={`w-full rounded-xl space-y-4 text-white px-4 py-3 bg-gradient-to-r ${buttonGradient} transition-colors`} type="submit">Crear Cuenta</button>
      </form>
      <p className="mt-6 text-sm text-gray-400">¿Ya tienes una cuenta? <a className={linkColor} href={`/auth/login?role=${roleParam}`}>Inicia sesión aquí</a></p>
    </div>
  );
}
