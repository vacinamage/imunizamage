import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';


export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>{children}</section>;
}

export function Button({ children, className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    outline: 'border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800'
  };
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)} {...props}>{children}</button>;
}

export function Badge({ children, status }: { children: ReactNode; status: string }) {
  const style = status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : status === 'TRIAL' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', style)}>{children}</span>;
}
