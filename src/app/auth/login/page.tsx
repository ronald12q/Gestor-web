import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-2">Gestor de Tareas</h1>
      <p className="text-slate-400 mb-4">Accede a tu cuenta</p>
      <LoginForm />
    </div>
  );
}
