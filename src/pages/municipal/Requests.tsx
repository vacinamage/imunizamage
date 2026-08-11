import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ClipboardList,
  Eye,
  FileText,
  PackageCheck,
} from 'lucide-react';

import { Card, Button, Badge } from '../../components/ui';

import {
  MOCK_REQUESTS,
  REQUEST_STATUS_LABEL,
  RequestStatus,
} from '../../data/mockRequests';

type TabKey =
  | 'NOVAS'
  | 'ANALISE'
  | 'AUTORIZADAS'
  | 'MEMORANDOS'
  | 'ENTREGUES'
  | 'HISTORICO';

const tabStatusMap: Record<TabKey, RequestStatus[]> = {
  NOVAS: ['NOVA'],

  ANALISE: ['EM_ANALISE'],

  AUTORIZADAS: ['AUTORIZADA'],

  MEMORANDOS: ['MEMORANDO_EMITIDO'],

  ENTREGUES: ['ENTREGUE'],

  HISTORICO: ['FINALIZADA', 'REJEITADA'],
};

const getBadgeStatus = (status: RequestStatus) => {
  if (
    status === 'AUTORIZADA' ||
    status === 'ENTREGUE' ||
    status === 'FINALIZADA'
  ) {
    return 'ACTIVE';
  }

  if (status === 'REJEITADA') {
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

export const Requests = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<TabKey>('ANALISE');

  const [searchTerm, setSearchTerm] =
    useState('');

  const filteredRequests = useMemo(() => {
    const statuses = tabStatusMap[activeTab];

    const term =
      searchTerm
        .trim()
        .toLowerCase();

    return MOCK_REQUESTS.filter((request) => {
      const matchesStatus =
        statuses.includes(request.status);

      const matchesSearch =
        !term ||
        request.protocol
          .toLowerCase()
          .includes(term) ||
        request.unitName
          .toLowerCase()
          .includes(term) ||
        request.requesterName
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [activeTab, searchTerm]);

  const cards = [
    {
      title: 'Novas solicitações',

      value: MOCK_REQUESTS.filter(
        (request) =>
          request.status === 'NOVA'
      ).length,

      icon: ClipboardList,
    },

    {
      title: 'Em análise',

      value: MOCK_REQUESTS.filter(
        (request) =>
          request.status === 'EM_ANALISE'
      ).length,

      icon: Eye,
    },

    {
      title: 'Aguardando entrega',

      value: MOCK_REQUESTS.filter(
        (request) =>
          request.status === 'AUTORIZADA' ||
          request.status ===
            'MEMORANDO_EMITIDO'
      ).length,

      icon: FileText,
    },

    {
      title: 'Finalizadas',

      value: MOCK_REQUESTS.filter(
        (request) =>
          request.status === 'FINALIZADA'
      ).length,

      icon: PackageCheck,
    },
  ];

  const tabs: {
    key: TabKey;
    label: string;
  }[] = [
    {
      key: 'NOVAS',
      label: 'Novas',
    },

    {
      key: 'ANALISE',
      label: 'Em análise',
    },

    {
      key: 'AUTORIZADAS',
      label: 'Autorizadas',
    },

    {
      key: 'MEMORANDOS',
      label: 'Memorandos',
    },

    {
      key: 'ENTREGUES',
      label: 'Entregues',
    },

    {
      key: 'HISTORICO',
      label: 'Histórico',
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate('/app')
            }
            className="mb-3 text-sm font-bold text-brand-600 hover:underline"
          >
            ← Voltar ao menu
          </button>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Solicitações
          </h1>

          <p className="mt-1 text-slate-500">
            Analise, autorize e acompanhe as solicitações
            enviadas pelas unidades de saúde.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Buscar solicitação..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/30">
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden p-0">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-4 dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                setActiveTab(tab.key)
              }
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Solicitação
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Unidade
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Solicitante
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Data
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Vacinas
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Nenhuma solicitação encontrada.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(
                  (request) => (
                    <tr
                      key={request.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
                    >
                      <td className="px-5 py-4 text-sm font-bold">
                        {request.protocol}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {request.unitName}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {
                          request.requesterName
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {request.createdAt}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {request.items.length}
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          status={getBadgeStatus(
                            request.status
                          )}
                        >
                          {
                            REQUEST_STATUS_LABEL[
                              request.status
                            ]
                          }
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {request.status ===
                            'NOVA' ||
                          request.status ===
                            'EM_ANALISE' ? (
                            <Button
                              className="text-xs"
                              onClick={() =>
                                navigate(
                                  `/app/solicitacoes/${request.protocol}`
                                )
                              }
                            >
                              Analisar
                            </Button>
                          ) : request.memorandumNumber ? (
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
                          ) : (
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