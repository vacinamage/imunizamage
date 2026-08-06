import { Construction } from 'lucide-react';
import { Card } from '../components/ui';
export function Placeholder({ title }: { title: string }) { return <Card className="grid min-h-[420px] place-items-center text-center"><div><Construction className="mx-auto mb-3 text-brand-600" size={42}/><h1 className="text-2xl font-bold">{title}</h1><p className="mt-2 text-slate-500">Módulo preparado para a próxima etapa de desenvolvimento.</p></div></Card>; }
