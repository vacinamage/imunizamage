import { useState, type ReactNode } from 'react';
import { Activity, CalendarDays, ChevronLeft, ChevronRight, Database, Globe2, LayoutDashboard, LogOut, Package, Settings, Syringe, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, currentEnv, logout, switchEnvironment } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const municipal = [
    ['Dashboard', '/app', LayoutDashboard], ['Pacientes', '/app/pacientes', Users], ['Vacinação', '/app/vacinacao', Syringe],
    ['Estoque', '/app/estoque', Package], ['Campanhas', '/app/campanhas', CalendarDays]
  ] as const;
  const global = [
    ['Menu', '/admin', Globe2], ['Municípios', '/admin/municipios', Database], ['Monitoramento', '/admin/monitoramento', Activity], ['Configurações', '/admin/configuracoes', Settings]
  ] as const;
  const menu = currentEnv === 'GLOBAL' ? global : municipal;

  function handleLogout() { logout(); navigate('/login'); }
  function handleSwitch() {
    const next = currentEnv === 'GLOBAL' ? 'MUNICIPAL' : 'GLOBAL';
    switchEnvironment(next);
    navigate(next === 'GLOBAL' ? '/admin' : '/app');
  }

  return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <aside className={cn('sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900', collapsed ? 'w-20' : 'w-64')}>
      <div className="flex items-center gap-3 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 font-bold text-white">I+</div>{!collapsed && <strong className="text-xl">Imuniza+</strong>}</div>
      <nav className="flex-1 space-y-1 p-3">{menu.map(([label, path, Icon]) => <NavLink key={path} end={path === '/app' || path === '/admin'} to={path} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800', isActive && 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300')}><Icon size={20}/>{!collapsed && label}</NavLink>)}</nav>
      <div className="space-y-2 border-t border-slate-200 p-3 dark:border-slate-800">
        {user?.role === 'SUPER_ADMIN' && !collapsed && <Button variant="outline" className="w-full text-xs" onClick={handleSwitch}>Trocar para {currentEnv === 'GLOBAL' ? 'municipal' : 'global'}</Button>}
        <button className="flex w-full justify-center p-2 text-slate-500" onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight/> : <ChevronLeft/>}</button>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div><p className="text-xs uppercase tracking-wide text-slate-400">{currentEnv === 'GLOBAL' ? 'Administração global' : user?.tenant}</p><p className="font-semibold">{user?.name}</p></div>
        <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleLogout} aria-label="Sair"><LogOut size={20}/></button>
      </header>
      <main className="p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
