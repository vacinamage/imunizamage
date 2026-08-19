import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ClipboardList,
  Package,
  Truck,
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
      maintenance: true,
    },
    {
      title: 'Solicitações',
      description: 'Analise e autorize as solicitações das unidades.',
      icon: ClipboardList,
      action: () => navigate('/app/solicitacoes'),
      notification: 4,
    },
    {
      title: 'Estoque Central',
      description: 'Gerencie vacinas, lotes e entradas.',
      icon: Package,
      action: () => navigate('/app/estoque'),
    },
    {
      title: 'Entregas',
      description: 'Acompanhe as entregas realizadas.',
      icon: Truck,
      action: () => navigate('/app/entregas'),
    },
    {
      title: 'Relatórios',
      description: 'Relatórios gerais do sistema.',
      icon: BarChart3,
      action: () => {},
      maintenance: true,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">

      {/* CABEÇALHO */}

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
          Central de Imunização
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
          Olá, Imunização!
        </h1>

        <p className="mt-3 max-w-3xl text-lg text-slate-500">
          Bem-vindo ao IMUNIZA PLUS. Gerencie solicitações,
          estoque central, entregas e distribuição de
          imunobiológicos em um único painel.
        </p>

      </section>

      {/* ACESSO RÁPIDO */}

      <section>

        <h2 className="mb-5 text-xl font-bold text-slate-900">
          Acesso rápido
        </h2>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">

          {shortcuts.map((shortcut) => {

            const Icon = shortcut.icon;

            return (

              <button
                key={shortcut.title}
                type="button"
                onClick={shortcut.action}
                className="text-left"
              >

                <Card className="group relative rounded-3xl border-slate-200 p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">

                  {shortcut.notification && (

                    <span className="absolute right-5 top-5 flex h-7 min-w-7 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">

                      {shortcut.notification}

                    </span>

                  )}

                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 transition group-hover:bg-blue-600 group-hover:text-white">

                    <Icon size={30} />

                  </div>

                  <div className="mt-5">

                    <div className="flex items-center gap-2">

                      <h3 className="text-lg font-bold text-slate-900">

                        {shortcut.title}

                      </h3>

                      {shortcut.maintenance && (

                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700">

                          Em manutenção

                        </span>

                      )}

                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-500">

                      {shortcut.description}

                    </p>

                  </div>

                </Card>

              </button>

            );

          })}

        </div>

      </section>
            {/* PAINEL */}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* RESUMO OPERACIONAL */}

        <Card className="rounded-3xl border-slate-200 p-7">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Resumo Operacional
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Situação atual da Central de Imunização.
              </p>

            </div>

            <Package
              size={28}
              className="text-blue-600"
            />

          </div>

          <div className="mt-7 space-y-4">

            <button
              onClick={() => navigate('/app/estoque')}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
            >

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Estoque Central
                </p>

                <p className="mt-1 text-2xl font-black">
                  128.540 doses
                </p>

              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                OK
              </span>

            </button>

            <button
              onClick={() => navigate('/app/solicitacoes')}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
            >

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Solicitações Pendentes
                </p>

                <p className="mt-1 text-2xl font-black">
                  4 aguardando
                </p>

              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                4
              </span>

            </button>

            <button
              onClick={() => navigate('/app/entregas')}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100"
            >

              <div>

                <p className="text-sm font-semibold text-slate-500">
                  Entregas
                </p>

                <p className="mt-1 text-2xl font-black">
                  1 aguardando saída
                </p>

              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                1
              </span>

            </button>

          </div>

        </Card>

        {/* ALERTAS */}

        <Card className="rounded-3xl border-slate-200 p-7">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Alertas
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Situações que exigem atenção.
              </p>

            </div>

            <AlertTriangle
              size={28}
              className="text-amber-600"
            />

          </div>

          <div className="mt-7 space-y-4">

            <div className="flex gap-4 rounded-2xl bg-red-50 p-5">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">

                <AlertTriangle
                  size={22}
                  className="text-red-600"
                />

              </div>

              <div>

                <p className="font-bold text-red-700">
                  Lotes vencidos
                </p>

                <p className="mt-1 text-sm text-red-600">
                  Existem lotes que precisam ser descartados.
                </p>

              </div>

            </div>

            <div className="flex gap-4 rounded-2xl bg-amber-50 p-5">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">

                <AlertTriangle
                  size={22}
                  className="text-amber-600"
                />

              </div>

              <div>

                <p className="font-bold text-amber-700">
                  Próximos do vencimento
                </p>

                <p className="mt-1 text-sm text-amber-600">
                  Esses lotes serão priorizados automaticamente nas liberações.
                </p>

              </div>

            </div>

            <div className="flex gap-4 rounded-2xl bg-blue-50 p-5">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">

                <ClipboardList
                  size={22}
                  className="text-blue-600"
                />

              </div>

              <div>

                <p className="font-bold text-blue-700">
                  Solicitações aguardando análise
                </p>

                <p className="mt-1 text-sm text-blue-600">
                  Existem unidades aguardando autorização.
                </p>

              </div>

            </div>

          </div>

        </Card>

      </section>

    </div>
  );
};