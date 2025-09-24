//Pagina raiz esto se renderiza primero y tambien rederigimos sirve para redirigiar 
"use client";
import Link from "next/link";

export default function RoleLanding() {
  return (
    <div className="min-h-[100dvh] grid place-items-center px-4 sm:px-8">
  <div className="w-full max-w-5xl rounded-3xl border border-slate-700/50 bg-slate-900/60 p-6 sm:p-8 shadow-2xl shadow-black/40">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 mb-2 leading-none">
          Gestor de Tareas y proyectos
        </h1>
        <p className="text-slate-400 text-lg mb-8">Selecciona tu tipo de cuenta</p>

        <div className="space-y-6">
          <RoleCard
            kind="gerente"
            title="Gerente"
            desc="En este rol podras crear proyectos y administrarlos"
            href="/auth/login?role=gerente"
          />
          <RoleCard
            kind="usuario"
            title="Usuario"
            desc="Con este rol podras completar tareas de proyectos creados por el gerente"
            href="/auth/login?role=usuario"
          />
        </div>

        <p className="mt-10 text-sm text-slate-400 text-center">
          Tu rol determinará las funcionalidades disponibles en la aplicación
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  kind,
  title,
  desc,
  href,
}: {
  kind: "gerente" | "usuario";
  title: string;
  desc: string;
  href: string;
}) {
  const gradient =
    kind === "gerente"
      ? "from-purple-500 to-blue-500"
      : "from-cyan-500 to-blue-500";

  return (
    <Link
      href={href}
      className="block rounded-2xl p-5 sm:p-6 bg-slate-800/40 hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${gradient}`}
          >
            {kind === "gerente" ? <ShieldIcon /> : <UserIcon />}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">{title}</div>
            <div className="text-sm sm:text-base text-slate-400 max-w-2xl">{desc}</div>
          </div>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-slate-400/80" />
      </div>
    </Link>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
      {...props}
    >
      <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z" />
      <path d="M9.5 12.5l1.8 1.8 3.7-3.8" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7"
      {...props}
    >
      <path d="M20 21v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
