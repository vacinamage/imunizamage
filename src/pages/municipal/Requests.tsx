import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ClipboardList,
  Eye,
  FileText,
  History,
  PackageCheck,
  Search,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  Badge,
  Button,
  Card,
} from '../../components/ui';

import {
  MOCK_REQUESTS,
} from '../../data/mockRequests';

/* =========================================================
   TIPOS
========================================================= */

type TabKey =
  | 'NOVAS'
  | 'ANALISE'
  | 'AUTORIZADAS'
  | 'MEMORANDOS';

type RequestStatus =
  | 'NOVA'
  | 'EM_ANALISE'
  | 'AUTORIZADA'
  | 'MEMORANDO_EMITIDO'
  | 'ENTREGUE'
  | 'FINALIZADA'
  | 'REJEITADA'
  | 'REJEITADO';

type StoredRequest = {
  id?: string;
  protocol: string;
  unitName?: string;
  requesterName?: string;
  createdAt?: string;
  status?: RequestStatus | string;
  memorandumNumber?: string;
  rejectedAt?: string;
  authorizedAt?: string;
  deliveredAt?: string;

  items?: {
    id?: string;
    vaccineId?: string;
    vaccineName?: string;
    requestedQuantity?: number;
    localStockReported?: number;
  }[];

  [key: string]: unknown;
};

/* =========================================================
   STORAGE
========================================================= */

const REQUESTS_STORAGE_KEY =
  'imuniza-unit-requests';

/* =========================================================
   STATUS DAS ABAS
========================================================= */

const tabStatusMap:
  Record<
    TabKey,
    string[]
  > = {
  NOVAS: [
    'NOVA',
  ],

  ANALISE: [
    'EM_ANALISE',
  ],

  AUTORIZADAS: [
    'AUTORIZADA',
  ],

  MEMORANDOS: [
    'MEMORANDO_EMITIDO',
  ],
};

/* =========================================================
   LABEL
========================================================= */

const getStatusLabel = (
  status?: string
) => {
  switch (status) {
    case 'NOVA':
      return 'Nova';

    case 'EM_ANALISE':
      return 'Em análise';

    case 'AUTORIZADA':
      return 'Autorizada';

    case 'MEMORANDO_EMITIDO':
      return 'Memorando emitido';

    case 'ENTREGUE':
      return 'Entregue';

    case 'FINALIZADA':
      return 'Finalizada';

    case 'REJEITADA':
    case 'REJEITADO':
      return 'Rejeitada';

    default:
      return status || '-';
  }
};

/* =========================================================
   BADGE
========================================================= */

const getBadgeStatus = (
  status?: string
) => {
  if (
    status === 'AUTORIZADA' ||
    status === 'ENTREGUE' ||
    status === 'FINALIZADA'
  ) {
    return 'ACTIVE';
  }

  if (
    status === 'REJEITADA' ||
    status === 'REJEITADO'
  ) {
    return 'INACTIVE';
  }

  if (
    status === 'EM_ANALISE' ||
    status === 'MEMORANDO_EMITIDO'
  ) {
    return 'PROCESSING';
  }

  return 'PENDING';
};

/* =========================================================
   CARREGAR LOCAL STORAGE
========================================================= */

const loadStoredRequests =
  (): StoredRequest[] => {
    try {
      const saved =
        localStorage.getItem(
          REQUESTS_STORAGE_KEY
        );

      if (!saved) {
        return [];
      }

      const parsed =
        JSON.parse(saved);

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch {
      return [];
    }
  };

/* =========================================================
   COMPONENTE
========================================================= */

export const Requests = () => {
  const navigate =
    useNavigate();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabKey>(
      'ANALISE'
    );

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState('');

  const [
    storedRequests,
    setStoredRequests,
  ] =
    useState<
      StoredRequest[]
    >(
      loadStoredRequests
    );

  /* =======================================================
     ATUALIZAR QUANDO VOLTAR PARA A TELA
  ======================================================= */

  useEffect(() => {
    const reload =
      () => {
        setStoredRequests(
          loadStoredRequests()
        );
      };

    window.addEventListener(
      'focus',
      reload
    );

    window.addEventListener(
      'storage',
      reload
    );

    return () => {
      window.removeEventListener(
        'focus',
        reload
      );

      window.removeEventListener(
        'storage',
        reload
      );
    };
  }, []);

  /* =======================================================
     UNIR MOCK + LOCAL STORAGE
  ======================================================= */

  const allRequests =
    useMemo(() => {
      const base =
        MOCK_REQUESTS.map(
          (request) => ({
            ...request,
          })
        ) as StoredRequest[];

      /*
       * Cada registro do localStorage
       * substitui os dados do mesmo protocolo.
       */
      const merged =
        base.map(
          (request) => {
            const stored =
              storedRequests.find(
                (item) =>
                  item.protocol ===
                  request.protocol
              );

            if (!stored) {
              return request;
            }

            return {
              ...request,
              ...stored,

              items:
                stored.items &&
                stored.items.length >
                  0
                  ? stored.items
                  : request.items,
            };
          }
        );

      /*
       * Também inclui solicitações
       * existentes apenas no localStorage.
       */
      storedRequests.forEach(
        (stored) => {
          const exists =
            merged.some(
              (request) =>
                request.protocol ===
                stored.protocol
            );

          if (!exists) {
            merged.push(
              stored
            );
          }
        }
      );

      return merged;
    }, [
      storedRequests,
    ]);

  /* =======================================================
     PEDIDOS ATIVOS
  ======================================================= */

  const activeRequests =
    useMemo(() => {
      return allRequests.filter(
        (request) => {
          /*
           * Rejeitados ficam somente
           * no Histórico.
           */
          if (
            request.status ===
              'REJEITADO' ||
            request.status ===
              'REJEITADA'
          ) {
            return false;
          }

          /*
           * Entregues e finalizados
           * também pertencem ao Histórico.
           */
          if (
            request.status ===
              'ENTREGUE' ||
            request.status ===
              'FINALIZADA'
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      allRequests,
    ]);

  /* =======================================================
     FILTRAR POR ABA + PESQUISA
  ======================================================= */

  const filteredRequests =
    useMemo(() => {
      const statuses =
        tabStatusMap[
          activeTab
        ];

      const term =
        searchTerm
          .trim()
          .toLowerCase();

      return activeRequests.filter(
        (request) => {
          const matchesStatus =
            statuses.includes(
              String(
                request.status
              )
            );

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
      );
    }, [
      activeRequests,
      activeTab,
      searchTerm,
    ]);

  /* =======================================================
     CONTADORES
  ======================================================= */

  const newCount =
    activeRequests.filter(
      (request) =>
        request.status ===
        'NOVA'
    ).length;

  const analysisCount =
    activeRequests.filter(
      (request) =>
        request.status ===
        'EM_ANALISE'
    ).length;

  const authorizedCount =
    activeRequests.filter(
      (request) =>
        request.status ===
        'AUTORIZADA'
    ).length;

  const memorandumCount =
    activeRequests.filter(
      (request) =>
        request.status ===
        'MEMORANDO_EMITIDO'
    ).length;

  const rejectedCount =
    allRequests.filter(
      (request) =>
        request.status ===
          'REJEITADO' ||
        request.status ===
          'REJEITADA'
    ).length;

  /* =======================================================
     CARDS
  ======================================================= */

  const cards = [
    {
      title:
        'Novas solicitações',

      value:
        newCount,

      icon:
        ClipboardList,

      action:
        () =>
          setActiveTab(
            'NOVAS'
          ),
    },

    {
      title:
        'Em análise',

      value:
        analysisCount,

      icon:
        Eye,

      action:
        () =>
          setActiveTab(
            'ANALISE'
          ),
    },

    {
      title:
        'Autorizadas',

      value:
        authorizedCount +
        memorandumCount,

      icon:
        PackageCheck,

      action:
        () =>
          setActiveTab(
            'AUTORIZADAS'
          ),
    },

    {
      title:
        'Histórico',

      value:
        rejectedCount,

      icon:
        History,

      action:
        () =>
          navigate(
            '/app/historico'
          ),
    },
  ];

  /* =======================================================
     ABAS
  ======================================================= */

  const tabs: {
    key: TabKey;
    label: string;
    count: number;
  }[] = [
    {
      key:
        'NOVAS',

      label:
        'Novas',

      count:
        newCount,
    },

    {
      key:
        'ANALISE',

      label:
        'Em análise',

      count:
        analysisCount,
    },

    {
      key:
        'AUTORIZADAS',

      label:
        'Autorizadas',

      count:
        authorizedCount,
    },

    {
      key:
        'MEMORANDOS',

      label:
        'Memorandos',

      count:
        memorandumCount,
    },
  ];

  /* =======================================================
     AÇÃO DO PEDIDO
  ======================================================= */

  const renderAction = (
    request:
      StoredRequest
  ) => {
    const status =
      String(
        request.status ||
        ''
      );

    if (
      status === 'NOVA' ||
      status ===
        'EM_ANALISE'
    ) {
      return (
        <Button
          className="text-xs"
          onClick={() =>
            navigate(
              `/app/solicitacoes/${request.protocol}`
            )
          }
        >
          <Eye
            size={14}
            className="mr-1"
          />

          Analisar
        </Button>
      );
    }

    if (
      status ===
        'MEMORANDO_EMITIDO' ||
      request.memorandumNumber
    ) {
      return (
        <Button
          variant="outline"
          className="text-xs"
          onClick={() =>
            navigate(
              `/app/memorando/${request.protocol}`
            )
          }
        >
          <FileText
            size={14}
            className="mr-1"
          />

          Memorando
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        className="text-xs"
        onClick={() =>
          navigate(
            `/app/solicitacoes/${request.protocol}`
          )
        }
      >
        Visualizar
      </Button>
    );
  };

  /* =========================================================
     TELA
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* CABEÇALHO */}

      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Solicitações
          </h1>

          <p className="mt-2 text-slate-500">
            Analise e acompanhe as solicitações pendentes das unidades de saúde.
          </p>

        </div>

        <div className="relative w-full lg:w-[380px]">

          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Buscar protocolo, unidade ou solicitante..."
            value={
              searchTerm
            }
            onChange={(
              event
            ) =>
              setSearchTerm(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </header>

      {/* INDICADORES */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <button
                key={
                  card.title
                }
                type="button"
                onClick={
                  card.action
                }
                className="text-left"
              >

                <Card className="h-full rounded-2xl transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-semibold text-slate-500">
                        {
                          card.title
                        }
                      </p>

                      <p className="mt-2 text-3xl font-black text-slate-900">
                        {
                          card.value
                        }
                      </p>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                      <Icon
                        size={24}
                      />

                    </div>

                  </div>

                </Card>

              </button>
            );
          }
        )}

      </section>

      {/* LISTAGEM */}

      <Card className="overflow-hidden rounded-2xl p-0">

        {/* ABAS */}

        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-4">

          {tabs.map(
            (tab) => (
              <button
                key={
                  tab.key
                }
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.key
                  )
                }
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  activeTab ===
                  tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >

                {
                  tab.label
                }

                <span
                  className={`flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] ${
                    activeTab ===
                    tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-slate-500'
                  }`}
                >
                  {
                    tab.count
                  }
                </span>

              </button>
            )
          )}

          <button
            type="button"
            onClick={() =>
              navigate(
                '/app/historico'
              )
            }
            className="ml-auto flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100"
          >
            <History
              size={16}
            />

            Abrir Histórico
          </button>

        </div>

        {/* TABELA */}

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Solicitação
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Unidade
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Solicitante
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Data
                </th>

                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  Vacinas
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Ações
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredRequests.length ===
              0 ? (
                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <ClipboardList
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-bold text-slate-600">
                      Nenhuma solicitação encontrada
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Não existem solicitações nesta situação.
                    </p>

                  </td>

                </tr>
              ) : (
                filteredRequests.map(
                  (
                    request
                  ) => (
                    <tr
                      key={
                        request.protocol
                      }
                      className="transition hover:bg-slate-50"
                    >

                      {/* PROTOCOLO */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-black text-slate-900">
                          {
                            request.protocol
                          }
                        </p>

                      </td>

                      {/* UNIDADE */}

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {request.unitName ||
                          '-'}
                      </td>

                      {/* SOLICITANTE */}

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {request.requesterName ||
                          '-'}
                      </td>

                      {/* DATA */}

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {request.createdAt ||
                          '-'}
                      </td>

                      {/* VACINAS */}

                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                          {
                            request.items
                              ?.length ??
                            0
                          }
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <Badge
                          status={
                            getBadgeStatus(
                              request.status
                            )
                          }
                        >
                          {getStatusLabel(
                            request.status
                          )}
                        </Badge>

                      </td>

                      {/* AÇÕES */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          {renderAction(
                            request
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