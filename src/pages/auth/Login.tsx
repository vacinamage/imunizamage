import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('superadmin@plataforma.com.br');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) { setError('E-mail ou senha inválidos.'); return; }
    navigate(email.includes('superadmin') ? '/admin' : '/app');
  }

  return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 dark:from-slate-950 dark:to-slate-900">
    <Card className="w-full max-w-md p-8">
      <div className="mb-8 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white"><ShieldCheck/></div><h1 className="text-2xl font-bold">Imuniza+ Enterprise</h1><p className="mt-1 text-sm text-slate-500">Acesse a plataforma demonstrativa</p></div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold">E-mail<input className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/></label>
        <label className="block text-sm font-semibold">Senha<div className="relative mt-1"><input className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 pr-11 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required/><button type="button" className="absolute right-3 top-2.5 text-slate-400" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button></div></label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Button className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
      </form>
      <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800"><p className="mb-3 text-center text-xs font-semibold uppercase text-slate-400">Acessos de demonstração</p><div className="grid grid-cols-2 gap-2"><button className="rounded-lg bg-slate-100 p-2 text-xs dark:bg-slate-800" onClick={() => { setEmail('superadmin@plataforma.com.br'); setPassword('admin123'); }}>Super Admin</button><button className="rounded-lg bg-slate-100 p-2 text-xs dark:bg-slate-800" onClick={() => { setEmail('admin@mage.rj.gov.br'); setPassword('admin123'); }}>Magé</button></div></div>
    </Card>
  </main>;
}
