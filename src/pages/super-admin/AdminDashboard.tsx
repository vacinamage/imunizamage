import {
  Building2,
  Users,
  Activity,
  FileText,
  Settings,
  ShieldCheck,
  Database,
  Server,
  AlertTriangle,
  Clock3,
} from 'lucide-react';

import { Card, Badge } from '../../components/ui';

export const AdminDashboard = () => {
  const recentEvents = [
    {
      time: '13:40',
      type: 'Sistema',
      municipality: 'Magé',
      event: 'Pedido criado',
      status: 'ACTIVE',
      label: 'Sucesso',
    },
    {
      time: '13:35',
      type: 'Login',
      municipality: 'Magé',
      event: 'Usuário autenticado',
      status: 'ACTIVE',
      label: 'Sucesso',
    },
    {
      time: '13:20',
      type: 'Banco',
      municipality: 'Plataforma',
      event: 'Consulta apresentou lentidão',
      status: 'PENDING',
      label: 'Atenção',
    },
    {
      time: '12:58',
      type: 'Deploy',
      municipality: 'Global',
      event: 'Nova versão publicada',
      status: 'ACTIVE',
      label: 'Sucesso',
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <header>
        <p className="font-semibold text-brand-600">
          Administração Global
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
          Visão geral da plataforma
        </h1>

        <p className="mt-2 text-slate-500">
          Acompanhe municípios, usuários e a saúde técnica do IMUNIZA+.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Municípios ativos
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                1
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Magé em produção
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
              <Building2 size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Usuários cadastrados
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                3
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Administradores e usuários municipais
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
              <Users size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Status da plataforma
              </p>

              <p className="mt-3 text-xl font-bold text-emerald-600">
                Operacional
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Serviços principais disponíveis
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
              <ShieldCheck size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Alertas técnicos
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                0
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Nenhum alerta crítico
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30">
              <AlertTriangle size={24} />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Monitoramento
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Situação atual dos principais serviços.
              </p>
            </div>

            <Activity className="text-brand-600" size={22} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Database size={20} className="text-emerald-600" />

                <div>
                  <p className="font-semibold">Banco de dados</p>
                  <p className="text-xs text-slate-500">
                    Supabase
                  </p>
                </div>
              </div>

              <Badge status="ACTIVE">Saudável</Badge>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Server size={20} className="text-emerald-600" />

                <div>
                  <p className="font-semibold">Aplicação web</p>
                  <p className="text-xs text-slate-500">
                    Vercel
                  </p>
                </div>
              </div>

              <Badge status="ACTIVE">Online</Badge>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Clock3 size={20} className="text-slate-500" />

                <div>
                  <p className="font-semibold">Último backup</p>
                  <p className="text-xs text-slate-500">
                    Aguardando integração real
                  </p>
                </div>
              </div>

              <Badge status="PENDING">Pendente</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Acesso rápido
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Áreas administrativas da plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800">
              <Building2 className="mb-3 text-brand-600" size={22} />
              <p className="font-bold">Municípios</p>
              <p className="mt-1 text-xs text-slate-500">
                Gerenciar municípios cadastrados.
              </p>
            </button>

            <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800">
              <Users className="mb-3 text-brand-600" size={22} />
              <p className="font-bold">Usuários</p>
              <p className="mt-1 text-xs text-slate-500">
                Administrar acessos globais.
              </p>
            </button>

            <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800">
              <Activity className="mb-3 text-brand-600" size={22} />
              <p className="font-bold">Monitoramento</p>
              <p className="mt-1 text-xs text-slate-500">
                Acompanhar a saúde técnica.
              </p>
            </button>

            <button className="rounded-xl border border-slate-200 p-4 text-left opacity-70 dark:border-slate-800">
              <FileText className="mb-3 text-slate-500" size={22} />

              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">Contratos</p>

                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                  Em manutenção
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Gestão contratual será disponibilizada futuramente.
              </p>
            </button>

            <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800 sm:col-span-2">
              <Settings className="mb-3 text-brand-600" size={22} />
              <p className="font-bold">Configurações</p>
              <p className="mt-1 text-xs text-slate-500">
                Preferências gerais da plataforma.
              </p>
            </button>
          </div>
        </Card>
      </section>

      <section>
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Eventos recentes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Atividades técnicas recentes da plataforma.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                    Horário
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                    Tipo
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                    Município
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                    Evento
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentEvents.map((item) => (
                  <tr key={`${item.time}-${item.event}`}>
                    <td className="px-5 py-4 text-sm">{item.time}</td>
                    <td className="px-5 py-4 text-sm">{item.type}</td>
                    <td className="px-5 py-4 text-sm">{item.municipality}</td>
                    <td className="px-5 py-4 text-sm">{item.event}</td>
                    <td className="px-5 py-4">
                      <Badge status={item.status}>{item.label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};