import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="max-w-lg mx-auto p-4">
  <h1 className="text-4xl font-extrabold mb-6 text-center">Regístrate</h1>
  <p className="text-slate-400 mb-6 text-center text-sm">Crear Cuenta</p>
      <RegisterForm />
    </div>
  );
}
