import {
  BookOpen,
  ClipboardList,
  Package,
  Building2,
  FlaskConical,
  Truck,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui';

export const MunicipalDashboard = () => {
  const navigate = useNavigate();

  const shortcuts = [
    {
      title: 'Aulas',
      description: 'Treinamentos e conteúdos de apoio.',
      icon: BookOpen,
      action: () => {},
      status: 'Em manutenção',
    },
    {
      title: 'Solicitações',
      description: 'Analise e autorize solicitações das unidades.',
      icon: ClipboardList,
      action: () => navigate('/app/solicitacoes'),
      notification: 4,
    },
    {
      title: 'Estoque Central',
      description: 'Consulte e gerencie o estoque da Central.',
      icon: Package,
      action: () => navigate('/app/estoque'),
    },
    {
      title: 'Estoque das Unidades',
      description: 'Acompanhe o estoque das unidades de saúde.',
      icon: Building2,
      action: () => navigate('/app/estoque-unidades'),
    },
    {
      title: 'Lotes',
      description: 'Acompanhe validade e rastreabilidade dos lotes.',
      icon: FlaskConical,
      action: () => navigate('/app/lotes'),
    },
    {
      title: 'Entregas',
      description: 'Acompanhe separação, memorandos e entregas.',
      icon: Truck,
      action: () => navigate('/app/entregas'),
    },
    {
      title: 'Relatórios',
      description: 'Consulte relatórios operacionais da Central.',
      icon: BarChart3,
      action: () => navigate('/app/relatorios'),
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <header>
        <p className="font-semibold text-brand-600">
          Prefeitura de Magé
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
          Central de Imunização
        </h1>

        <p className="mt-2 text-slate-500">
          Painel operacional de distribuição e controle de imunobiológicos.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Acesso rápido
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <button
                key={shortcut.title}
                type="button"
                onClick={shortcut.action}
                className="text-left"
              >
                <Card className="relative h-full transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
                  {shortcut.notification !== undefined &&
                    shortcut.notification > 0 && (
                      <span className="absolute right-4 top-4 flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
                        {shortcut.notification}
                      </span>
                    )}

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
                    <Icon size={28} />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {shortcut.title}
                    </h3>

                    {shortcut.status && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                        {shortcut.status}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {shortcut.description}
                  </p>
                </Card>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Solicitações
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Situação atual das solicitações das unidades.
              </p>
            </div>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              4 pendentes
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/app/solicitacoes')}
              className="rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/50"
            >
              <p className="text-2xl font-bold text-brand-600">2</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Novas
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/solicitacoes')}
              className="rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/50"
            >
              <p className="text-2xl font-bold text-amber-600">2</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Em análise
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/solicitacoes')}
              className="rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/50"
            >
              <p className="text-2xl font-bold text-blue-600">1</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Autorizada
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/solicitacoes')}
              className="rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/50"
            >
              <p className="text-2xl font-bold text-emerald-600">18</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Entregues
              </p>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/solicitacoes')}
            className="mt-5 text-sm font-bold text-brand-600 hover:underline"
          >
            Ver todas as solicitações →
          </button>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Prioridades do dia
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Situações que precisam de atenção da Central.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
              <AlertTriangle className="mt-0.5 text-red-600" size={20} />

              <div>
                <p className="font-bold text-red-700">
                  2 lotes vencidos
                </p>

                <p className="mt-1 text-sm text-red-600">
                  Verifique os lotes que não podem mais ser utilizados.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <AlertTriangle className="mt-0.5 text-amber-600" size={20} />

              <div>
                <p className="font-bold text-amber-700">
                  3 lotes próximos do vencimento
                </p>

                <p className="mt-1 text-sm text-amber-600">
                  Existem lotes com validade inferior a 90 dias.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
              <Package className="mt-0.5 text-blue-600" size={20} />

              <div>
                <p className="font-bold text-blue-700">
                  4 vacinas com estoque reduzido
                </p>

                <p className="mt-1 text-sm text-blue-600">
                  Avalie a necessidade de reposição.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};