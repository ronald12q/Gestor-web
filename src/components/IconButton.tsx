"use client";
/**
 * Componente: boton icono reutilizable 
 * 
 * Uso: Acciones en dashboards (agregar, editar, asignar, eliminar, etc.).
 */
import React from 'react';

type Variant = 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'slate';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  label?: string;
  variant?: Variant;
};

export default function IconButton({ icon, label, variant = 'slate', className = '', ...rest }: Props) {
  const palette: Record<Variant, string> = {
    slate: 'bg-slate-700 hover:bg-slate-600 text-white',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white',
    green: 'bg-green-600 hover:bg-green-500 text-white',
    yellow: 'bg-amber-500 hover:bg-amber-400 text-white',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white',
    red: 'bg-red-600 hover:bg-red-500 text-white',
  };
  return (
    <button
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${palette[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}
