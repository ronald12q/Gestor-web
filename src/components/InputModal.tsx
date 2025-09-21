"use client";
/**
 * Componente: una ventana modal de tipo input que usamos en las acciones
 * Propósito: Modal genérico con un único campo de texto para capturar valores (nombres, asignaciones, etc.).
 * 
 */
import React, { useState, useEffect } from 'react';

type Props = {
  open: boolean;
  title: string;
  placeholder?: string;
  confirmLabel?: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
  error?: string;
  onValueChange?: (value: string) => void;
};

export default function InputModal({ open, title, placeholder, confirmLabel = 'Aceptar', initialValue = '', onClose, onSubmit, error, onValueChange }: Props) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { if (open) setValue(initialValue || ''); }, [open, initialValue]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <input
          autoFocus
          className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
          placeholder={placeholder}
          value={value}
          onChange={e => { const v = e.target.value; setValue(v); onValueChange?.(v); }}
          onKeyDown={e => { if (e.key === 'Enter') onSubmit(value); }}
        />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-200" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400" onClick={() => onSubmit(value)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
