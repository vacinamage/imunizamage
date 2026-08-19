import { useMemo, useState } from 'react';

import {
  Clock3,
  Search,
  XCircle,
} from 'lucide-react';

import {
  Badge,
  Card,
} from '../../components/ui';

/* =========================================================
   TIPOS
========================================================= */

type HistoryStatus =
  | 'REJEITADO'
  | 'ENTREGUE'
  | 'AUTORIZADO'
  | string;

type HistoryRequest = {
  protocol: string;
  unitName?: string;
  requesterName?: string;
  createdAt?: string;
  rejectedAt?: string;
  deliveredAt?: string;
  authorizedAt?: string;
  status?: HistoryStatus;
};

/* =========================================================
   STORAGE
========================================================= */

const REQUESTS_STORAGE_KEY =
  'imuniza-unit-requests';

/* =========================================================
   LOAD
========================================================= */

const loadRequests =
  (): HistoryRequest[] => {
    try {
      const saved =
        localStorage.getItem(
          REQUESTS_STORAGE_KEY
        );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  };

/* =========================================================
   DATA
========================================================= */

const formatDateTime = (
  value?: string
) => {
  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    'pt-BR'
  );
};

/* =========================================================
   COMPONENTE
========================================================= */

export const History = () => {
  const [
    search,
    setSearch,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      | 'TODOS'
      | 'REJEITADO'
      | 'ENTREGUE'
      | 'AUTORIZADO'
    >('TODOS');

  const requests =
    useMemo(
      () => loadRequests(),
      []
    );

  /* =======================================================
     HISTÓRICO
  ======================================================= */

  const historyRequests =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return requests
        .filter(
          (request) =>
            request.status ===
              'REJEITADO' ||
            request.status ===
              'ENTREGUE' ||
            request.status ===
              'AUTORIZADO'
        )
        .filter(
          (request) => {
            const matchesStatus =
              statusFilter ===
                'TODOS' ||
              request.status ===
                statusFilter;

            const matchesSearch =
              !term ||
              request.protocol
                ?.toLowerCase()
                .includes(term) ||
              request.unitName
                ?.toLowerCase()
                .includes(term) ||
              request.requesterName
                ?.toLowerCase()
                .includes(term);

            return (
              matchesStatus &&
              matchesSearch
            );
          }
        )
        .sort(
          (a, b) => {
            const dateA =
              a.rejectedAt ||
              a.deliveredAt ||
              a.authorizedAt ||
              a.createdAt ||
              '';

            const dateB =
              b.rejectedAt ||
              b.deliveredAt ||
              b.authorizedAt ||
              b.createdAt ||
              '';

            return (
              new Date(
                dateB
              ).getTime() -
              new Date(
                dateA
              ).getTime()
            );
          }
        );
    }, [
      requests,
      search,
      statusFilter,
    ]);

  const rejectedCount =
    requests.filter(
      (request) =>
        request.status ===
        'REJEITADO'
    ).length;

  const deliveredCount =
    requests.filter(
      (request) =>
        request.status ===
        'ENTREGUE'
    ).length;

  const authorizedCount =
    requests.filter(
      (request) =>
        request.status ===
        'AUTORIZADO'
    ).length;

  /* =======================================================
     BADGE
  ======================================================= */

  const statusBadge = (
    status?: string
  ) => {
    if (
      status ===
      'REJEITADO'
    ) {
      return (
        <Badge status="INACTIVE">
          Rejeitada
        </Badge>
      );
    }

    if (
      status ===
      'ENTREGUE'
    ) {
      return (
        <Badge status="ACTIVE">
          Entregue
        </Badge>
      );
    }

    return (
      <Badge status="PROCESSING">
        Autorizada
      </Badge>
    );
  };

  const getHistoryDate = (
    request:
      HistoryRequest
  ) => {
    if (
      request.status ===
      'REJEITADO'
    ) {
      return (
        request.rejectedAt ||
        request.createdAt
      );
    }

    if (
      request.status ===
      'ENTREGUE'
    ) {
      return (
        request.deliveredAt ||
        request.createdAt
      );
    }

    return (
      request.authorizedAt ||
      request.createdAt
    );
  };

  /* =========================================================
     TELA
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* CABEÇALHO */}

      <header>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

            <Clock3
              size={24}
            />

          </div>

          <div>

            <h1 className="text-3xl font-black text-slate-900">
              Histórico
            </h1>

            <p className="mt-1 text-slate-500">
              Consulte solicitações concluídas, entregues ou rejeitadas.
            </p>

          </div>

        </div>

      </header>

      {/* INDICADORES */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <Card className="rounded-2xl">

          <p className="text-sm text-slate-500">
            Autorizadas
          </p>

          <p className="mt-2 text-3xl font-black text-blue-600">
            {
              authorizedCount
            }
          </p>

        </Card>

        <Card className="rounded-2xl">

          <p className="text-sm text-slate-500">
            Entregues
          </p>

          <p className="mt-2 text-3xl font-black text-emerald-600">
            {
              deliveredCount
            }
          </p>

        </Card>

        <Card className="rounded-2xl">

          <p className="text-sm text-slate-500">
            Rejeitadas
          </p>

          <p className="mt-2 text-3xl font-black text-red-600">
            {
              rejectedCount
            }
          </p>

        </Card>

      </section>

      {/* FILTROS */}

      <Card className="rounded-2xl">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-3.5 text-slate-400"
            />

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar protocolo, unidade ou solicitante..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-blue-400"
            />

          </div>

          <div className="flex flex-wrap gap-2">

            {[
              [
                'TODOS',
                'Todos',
              ],

              [
                'AUTORIZADO',
                'Autorizadas',
              ],

              [
                'ENTREGUE',
                'Entregues',
              ],

              [
                'REJEITADO',
                'Rejeitadas',
              ],
            ].map(
              (
                [
                  value,
                  label,
                ]
              ) => (
                <button
                  key={
                    value
                  }
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      value as
                        | 'TODOS'
                        | 'REJEITADO'
                        | 'ENTREGUE'
                        | 'AUTORIZADO'
                    )
                  }
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    statusFilter ===
                    value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {
                    label
                  }
                </button>
              )
            )}

          </div>

        </div>

      </Card>

      {/* TABELA */}

      <Card className="overflow-hidden rounded-2xl p-0">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Solicitação
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Unidade
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Solicitante
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Situação
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Data
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {historyRequests.length ===
              0 ? (
                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >

                    <XCircle
                      size={36}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-bold text-slate-600">
                      Nenhum registro encontrado
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Os pedidos rejeitados aparecerão aqui automaticamente.
                    </p>

                  </td>

                </tr>
              ) : (
                historyRequests.map(
                  (
                    request
                  ) => (
                    <tr
                      key={
                        request.protocol
                      }
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4 font-black text-slate-900">
                        {
                          request.protocol
                        }
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {request.unitName ||
                          '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {request.requesterName ||
                          '-'}
                      </td>

                      <td className="px-6 py-4">
                        {statusBadge(
                          request.status
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDateTime(
                          getHistoryDate(
                            request
                          )
                        )}
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