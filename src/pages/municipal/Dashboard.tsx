import {
  BookOpen,
  ClipboardList,
  Package,
  AlertTriangle,
  FileCheck2,
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
      action: () => navigate('/app/aulas'),
      status: 'Em desenvolvimento',
    },
    {
      title: 'Pedir vacina',
      description: 'Monte e envie uma nova solicitação.',
      icon: ClipboardList,
      action: () => navigate('/app/pedir-vacina'),
    },
    {
      title: 'Solicitações',
      description: 'Analise e autorize as solicitações das unidades.',
      icon: FileCheck2,
      action: () => navigate('/app/solicitacoes'),
      notification: 4,
    },
    {
      title: 'Estoque Central',
      description: 'Consulte as quantidades disponíveis na Central.',
      icon: Package,
      action: () => navigate('/app/estoque'),
    },
    {
      title: 'Lotes em vencimento',
      description: 'Acompanhe lotes próximos da validade.',
      icon: AlertTriangle,
      action: () => navigate('/app/lotes'),
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
          Gerencie solicitações, estoque e lotes de vacinas do município.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Acesso rápido
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
                Solicitações pendentes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Acompanhe rapidamente o que precisa de análise.
              </p>
            </div>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              4 pendentes
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => navigate('/app/solicitacoes')}
              className="rounded-xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <p className="text-2xl font-bold text-brand-600">
                2
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                Novas
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/solicitacoes')}
              className="rounded-xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <p className="text-2xl font-bold text-amber-600">
                2
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                Em análise
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/solicitacoes')}
              className="rounded-xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <p className="text-2xl font-bold text-emerald-600">
                1
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                Autorizada
              </p>
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ['SLT-2026-000001', 'UBS Fragoso', 'Em análise'],
              ['SLT-2026-000007', 'Guarani 01', 'Em análise'],
              ['SLT-2026-000006', 'UBS Suruí', 'Nova'],
            ].map(([number, unit, status]) => (
              <button
                key={number}
                type="button"
                onClick={() =>
                  navigate(`/app/solicitacoes/${number}`)
                }
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <div>
                  <p className="font-semibold">
                    {number}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {unit}
                  </p>
                </div>

                <span className="text-sm font-semibold text-slate-500">
                  {status}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/app/solicitacoes')
            }
            className="mt-5 text-sm font-bold text-brand-600 hover:underline"
          >
            Ver todas as solicitações →
          </button>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Alertas de estoque
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Situações que precisam de atenção.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
              <p className="font-bold text-red-700">
                2 lotes vencidos
              </p>

              <p className="mt-1 text-sm text-red-600">
                Verifique os lotes que não podem mais ser utilizados.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <p className="font-bold text-amber-700">
                3 lotes próximos do vencimento
              </p>

              <p className="mt-1 text-sm text-amber-600">
                Existem lotes com validade inferior a 90 dias.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
              <p className="font-bold text-blue-700">
                4 vacinas com estoque reduzido
              </p>

              <p className="mt-1 text-sm text-blue-600">
                Avalie a necessidade de reposição.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};