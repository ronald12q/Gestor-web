"use client";
/**
 * Formulario de Login
 * es el mismo para gerente o usuario solo cambiamos colores en backend se maneja 
 */
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isClientOnlyMode, loginUser, setCurrentUser } from '@/lib/persistence.client';

type Role = 'gerente' | 'usuario';

export default function LoginForm() {
  const search = useSearchParams();
  const role = (search.get('role') as Role) || 'gerente';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isClientOnlyMode()) {
      const res = loginUser({ email, password });
      if (!res.ok) return setError(res.error);
      try { setCurrentUser(res.user as any); } catch {}
      window.location.href = res.user.role === 'gerente' ? '/gerente' : '/usuario';
      return;
    }
    const resp = await fetch('/api/crud/users/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) return setError(data.error || 'Error');
    try { localStorage.setItem('currentUser', JSON.stringify(data.user)); } catch {}
    window.location.href = data.user.role === 'gerente' ? '/gerente' : '/usuario';
  };

  const badgeClasses = role === 'gerente'
    ? 'bg-purple-700/20 text-purple-300'
    : 'bg-blue-700/20 text-blue-300';

  const nameColor = role === 'gerente' ? 'text-purple-300' : 'text-blue-300';

  const buttonGradient = role === 'gerente'
    ? 'from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300'
    : 'from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300';

  const linkColor = role === 'gerente' ? 'text-purple-400' : 'text-blue-400';

  return (
    <div className="w-full space-y-8 max-w-md rounded-3xl border border-slate-700 bg-slate-900/60 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${badgeClasses}`}>
          Acceso como <b className={`${nameColor} capitalize`}>{role}</b>
        </span>
        <Link href="/auth" className="text-sm text-slate-300 hover:text-white">← Regresar</Link>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <input className="w-full h-12 rounded-xl bg-slate-800/70 border border-slate-700 px-4 text-base leading-6 text-slate-200 placeholder-slate-400 appearance-none focus:outline-none" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full h-12 rounded-xl bg-slate-800/70 border border-slate-700 px-4 text-base leading-6 text-slate-200 placeholder-slate-400 appearance-none focus:outline-none" placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className={`w-full rounded-xl text-white px-4 py-3 bg-gradient-to-r ${buttonGradient} transition-colors`} type="submit">Iniciar Sesión</button>
      </form>
      <p className="mt-6 text-sm text-gray-400">¿No tienes una cuenta? <a className={linkColor} href={`/auth/register?role=${role}`}>Regístrate aquí</a></p>
    </div>
  );
}
