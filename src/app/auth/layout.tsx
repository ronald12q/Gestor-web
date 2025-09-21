export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-900">
      <div className="min-h-[100dvh] flex sm:items-center items-start justify-center px-4 safe-py overflow-auto">
        {children}
      </div>
    </div>
  );
}
