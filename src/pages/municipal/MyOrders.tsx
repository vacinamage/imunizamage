import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Eye,
  Search,
  FileText,
  ClipboardList,
  Clock3,
  CheckCircle2,
  PackageCheck,
} from 'lucide-react';

import {
  Card,
  Badge,
  Button,
} from '../../components/ui';

/* =========================================================
   TIPOS
========================================================= */

type OrderStatus =
  | 'ANALISE'
  | 'AUTORIZADA'
  | 'AGUARDANDO_ENTREGA'
  | 'ENTREGUE'
  | 'REJEITADO';

type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  items: number;
  totalDoses: number;
  memorandumNumber?: string;
};

/* =========================================================
   DADOS TEMPORÁRIOS
   Depois vamos ligar às solicitações reais.
========================================================= */

const MOCK_ORDERS: Order[] = [
  {
    id: 'SLT-2026-000001',
    date: '19/08/2026',
    status: 'ANALISE',
    items: 3,
    totalDoses: 120,
  },
  {
    id: 'SLT-2026-000002',
    date: '19/08/2026',
    status: 'AUTORIZADA',
    items: 5,
    totalDoses: 240,
    memorandumNumber: 'MEM-2026-000002',
  },
  {
    id: 'SLT-2026-000003',
    date: '18/08/2026',
    status: 'AGUARDANDO_ENTREGA',
    items: 2,
    totalDoses: 80,
    memorandumNumber: 'MEM-2026-000003',
  },
  {
    id: 'SLT-2026-000004',
    date: '18/08/2026',
    status: 'ENTREGUE',
    items: 4,
    totalDoses: 160,
    memorandumNumber: 'MEM-2026-000004',
  },
  {
    id: 'SLT-2026-000005',
    date: '17/08/2026',
    status: 'REJEITADO',
    items: 1,
    totalDoses: 20,
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

export const MyOrders = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<'TODOS' | OrderStatus>(
      'TODOS'
    );

  /* =======================================================
     BADGE
  ======================================================= */

  const getStatusBadge = (
    status: OrderStatus
  ) => {
    switch (status) {
      case 'ANALISE':
        return (
          <Badge status="PENDING">
            Em análise
          </Badge>
        );

      case 'AUTORIZADA':
        return (
          <Badge status="ACTIVE">
            Autorizada
          </Badge>
        );

      case 'AGUARDANDO_ENTREGA':
        return (
          <Badge status="PROCESSING">
            Aguardando entrega
          </Badge>
        );

      case 'ENTREGUE':
        return (
          <Badge status="ACTIVE">
            Entregue
          </Badge>
        );

      case 'REJEITADO':
        return (
          <Badge status="INACTIVE">
            Rejeitada
          </Badge>
        );

      default:
        return null;
    }
  };

  /* =======================================================
     FILTRO
  ======================================================= */

  const filteredOrders =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      return MOCK_ORDERS.filter(
        (order) => {
          const matchesSearch =
            !term ||
            order.id
              .toLowerCase()
              .includes(term) ||
            order.memorandumNumber
              ?.toLowerCase()
              .includes(term);

          const matchesStatus =
            statusFilter ===
              'TODOS' ||
            order.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      searchTerm,
      statusFilter,
    ]);

  /* =======================================================
     CONTADORES
  ======================================================= */

  const analysisCount =
    MOCK_ORDERS.filter(
      (order) =>
        order.status ===
        'ANALISE'
    ).length;

  const authorizedCount =
    MOCK_ORDERS.filter(
      (order) =>
        order.status ===
        'AUTORIZADA' ||
        order.status ===
        'AGUARDANDO_ENTREGA'
    ).length;

  const deliveredCount =
    MOCK_ORDERS.filter(
      (order) =>
        order.status ===
        'ENTREGUE'
    ).length;

  /* =======================================================
     ABRIR SOLICITAÇÃO
  ======================================================= */

  const openOrder = (
    order: Order
  ) => {
    navigate(
      `/app/solicitacoes/${order.id}`
    );
  };

  /* =======================================================
     MEMORANDO
  ======================================================= */

  const openMemorandum = (
    order: Order
  ) => {
    if (
      !order.memorandumNumber
    ) {
      return;
    }

    navigate(
      `/app/memorando/${order.id}`,
      {
        state: {
          memorandumNumber:
            order.memorandumNumber,
        },
      }
    );
  };

  /* =========================================================
     TELA
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Minhas solicitações
        </h1>

        <p className="mt-1 text-slate-500">
          Acompanhe as solicitações enviadas à Central de Imunização.
        </p>
      </header>

      {/* RESUMO */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Em análise
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {analysisCount}
              </p>
            </div>

            <Clock3
              size={28}
              className="text-amber-600"
            />

          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Autorizadas
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {authorizedCount}
              </p>
            </div>

            <PackageCheck
              size={28}
              className="text-blue-600"
            />

          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Entregues
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {deliveredCount}
              </p>
            </div>

            <CheckCircle2
              size={28}
              className="text-emerald-600"
            />

          </div>
        </Card>

      </section>

      {/* FILTROS */}

      <Card>

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-2.5 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Buscar solicitação ou memorando..."
              className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  | 'TODOS'
                  | OrderStatus
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="TODOS">
              Todos os status
            </option>

            <option value="ANALISE">
              Em análise
            </option>

            <option value="AUTORIZADA">
              Autorizada
            </option>

            <option value="AGUARDANDO_ENTREGA">
              Aguardando entrega
            </option>

            <option value="ENTREGUE">
              Entregue
            </option>

            <option value="REJEITADO">
              Rejeitada
            </option>
          </select>

        </div>

      </Card>

      {/* TABELA */}

      <Card className="overflow-hidden p-0">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50 dark:bg-slate-800/50">

              <tr>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Solicitação
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Data
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Vacinas
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Doses
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ações
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

              {filteredOrders.length ===
              0 ? (
                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center"
                  >
                    <ClipboardList
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-bold">
                      Nenhuma solicitação encontrada
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Tente alterar os filtros da pesquisa.
                    </p>

                  </td>

                </tr>
              ) : (
                filteredOrders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >

                      <td className="px-6 py-4">

                        <p className="font-bold">
                          {order.id}
                        </p>

                        {order.memorandumNumber && (
                          <p className="mt-1 text-xs text-slate-500">
                            {
                              order.memorandumNumber
                            }
                          </p>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {order.date}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(
                          order.status
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {order.items}{' '}
                        {order.items === 1
                          ? 'vacina'
                          : 'vacinas'}
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-brand-600">
                        {order.totalDoses.toLocaleString(
                          'pt-BR'
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <Button
                            variant="outline"
                            onClick={() =>
                              openOrder(
                                order
                              )
                            }
                          >
                            <Eye
                              size={15}
                              className="mr-2"
                            />

                            Visualizar
                          </Button>

                          {order.memorandumNumber && (
                            <Button
                              variant="outline"
                              onClick={() =>
                                openMemorandum(
                                  order
                                )
                              }
                            >
                              <FileText
                                size={15}
                                className="mr-2"
                              />

                              Memorando
                            </Button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
};
