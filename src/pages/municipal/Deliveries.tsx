import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  PackageCheck,
  Search,
  Truck,
} from 'lucide-react';

import {
  Card,
  Button,
  Badge,
} from '../../components/ui';

type DeliveryStatus =
  | 'AGUARDANDO_ENTREGA'
  | 'ENTREGUE';

type DeliveryItem = {
  id: string;
  requestProtocol: string;
  memorandumNumber: string;
  unitName: string;
  authorizedDoses: number;
  authorizedAt: string;
  deliveredAt?: string;
  deliveredBy?: string;
  status: DeliveryStatus;
};

const STORAGE_KEY =
  'imuniza-deliveries';

const DEFAULT_DELIVERIES: DeliveryItem[] = [
  {
    id: 'delivery-001',
    requestProtocol: 'SLT-2026-000001',
    memorandumNumber: 'MEM-2026-000001',
    unitName: 'UBS Fragoso',
    authorizedDoses: 120,
    authorizedAt: '19/08/2026 10:30',
    status: 'AGUARDANDO_ENTREGA',
  },
  {
    id: 'delivery-002',
    requestProtocol: 'SLT-2026-000002',
    memorandumNumber: 'MEM-2026-000002',
    unitName: 'UBS Suruí',
    authorizedDoses: 85,
    authorizedAt: '19/08/2026 11:10',
    status: 'AGUARDANDO_ENTREGA',
  },
  {
    id: 'delivery-003',
    requestProtocol: 'SLT-2026-000003',
    memorandumNumber: 'MEM-2026-000003',
    unitName: 'UBS Maurimárcia',
    authorizedDoses: 200,
    authorizedAt: '18/08/2026 14:20',
    deliveredAt: '18/08/2026 16:40',
    deliveredBy: 'Central de Imunização',
    status: 'ENTREGUE',
  },
];

const loadDeliveries = (): DeliveryItem[] => {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {
      return DEFAULT_DELIVERIES;
    }

    return JSON.parse(saved);
  } catch {
    return DEFAULT_DELIVERIES;
  }
};

export const Deliveries = () => {
  const navigate =
    useNavigate();

  const [
    deliveries,
    setDeliveries,
  ] =
    useState<DeliveryItem[]>(
      loadDeliveries
    );

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    activeStatus,
    setActiveStatus,
  ] =
    useState<
      'TODOS' | DeliveryStatus
    >('AGUARDANDO_ENTREGA');

  const filteredDeliveries =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      return deliveries.filter(
        (delivery) => {
          const matchesSearch =
            !term ||
            delivery.requestProtocol
              .toLowerCase()
              .includes(term) ||
            delivery.memorandumNumber
              .toLowerCase()
              .includes(term) ||
            delivery.unitName
              .toLowerCase()
              .includes(term);

          const matchesStatus =
            activeStatus ===
              'TODOS' ||
            delivery.status ===
              activeStatus;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      deliveries,
      searchTerm,
      activeStatus,
    ]);

  const awaitingCount =
    deliveries.filter(
      (delivery) =>
        delivery.status ===
        'AGUARDANDO_ENTREGA'
    ).length;

  const deliveredCount =
    deliveries.filter(
      (delivery) =>
        delivery.status ===
        'ENTREGUE'
    ).length;

  const saveDeliveries = (
    updated:
      DeliveryItem[]
  ) => {
    setDeliveries(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  };

  const confirmDelivery = (
    delivery:
      DeliveryItem
  ) => {
    const confirmed =
      window.confirm(
        `Confirmar a entrega da solicitação ${delivery.requestProtocol} para ${delivery.unitName}?`
      );

    if (!confirmed) {
      return;
    }

    const updated =
      deliveries.map(
        (item) =>
          item.id ===
          delivery.id
            ? {
                ...item,
                status:
                  'ENTREGUE' as DeliveryStatus,
                deliveredAt:
                  new Date().toLocaleString(
                    'pt-BR'
                  ),
                deliveredBy:
                  'Central de Imunização',
              }
            : item
      );

    saveDeliveries(
      updated
    );
  };

  const openMemorandum = (
    delivery:
      DeliveryItem
  ) => {
    navigate(
      `/app/memorando/${delivery.requestProtocol}`,
      {
        state: {
          memorandumNumber:
            delivery.memorandumNumber,
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      <header>

        <button
          type="button"
          onClick={() =>
            navigate('/app')
          }
          className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
        >
          <ArrowLeft
            size={16}
          />

          Voltar ao menu
        </button>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Entregas
            </h1>

            <p className="mt-1 text-slate-500">
              Acompanhe as solicitações autorizadas até a confirmação da entrega.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-brand-600 dark:bg-brand-950/30">

            <Truck
              size={20}
            />

            <span className="text-sm font-bold">
              {awaitingCount}{' '}
              aguardando entrega
            </span>

          </div>

        </div>

      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <Card>
          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Aguardando entrega
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {
                  awaitingCount
                }
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
                Entregues
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {
                  deliveredCount
                }
              </p>

            </div>

            <CheckCircle2
              size={28}
              className="text-emerald-600"
            />

          </div>
        </Card>

      </section>

      <Card>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-lg">

            <Search
              size={18}
              className="absolute left-3 top-2.5 text-slate-400"
            />

            <input
              type="text"
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
              placeholder="Buscar solicitação, memorando ou unidade..."
              className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
            />

          </div>

          <div className="flex flex-wrap gap-2">

            <Button
              variant={
                activeStatus ===
                  'AGUARDANDO_ENTREGA'
                  ? undefined
                  : 'outline'
              }
              onClick={() =>
                setActiveStatus(
                  'AGUARDANDO_ENTREGA'
                )
              }
            >
              Aguardando
            </Button>

            <Button
              variant={
                activeStatus ===
                  'ENTREGUE'
                  ? undefined
                  : 'outline'
              }
              onClick={() =>
                setActiveStatus(
                  'ENTREGUE'
                )
              }
            >
              Entregues
            </Button>

            <Button
              variant={
                activeStatus ===
                  'TODOS'
                  ? undefined
                  : 'outline'
              }
              onClick={() =>
                setActiveStatus(
                  'TODOS'
                )
              }
            >
              Todos
            </Button>

          </div>

        </div>

      </Card>

      <div className="space-y-4">

        {filteredDeliveries.length ===
        0 ? (
          <Card className="py-12 text-center">

            <PackageCheck
              size={40}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-lg font-bold">
              Nenhuma entrega encontrada
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Não existem registros para os filtros selecionados.
            </p>

          </Card>
        ) : (
          filteredDeliveries.map(
            (delivery) => (
              <Card
                key={
                  delivery.id
                }
              >

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                  <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div>

                      <p className="text-xs font-bold uppercase text-slate-400">
                        Solicitação
                      </p>

                      <p className="mt-1 font-bold">
                        {
                          delivery.requestProtocol
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase text-slate-400">
                        Unidade
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          delivery.unitName
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase text-slate-400">
                        Memorando
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          delivery.memorandumNumber
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase text-slate-400">
                        Doses liberadas
                      </p>

                      <p className="mt-1 text-xl font-bold text-brand-600">
                        {
                          delivery.authorizedDoses
                        }
                      </p>

                    </div>

                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                    {delivery.status ===
                    'AGUARDANDO_ENTREGA' ? (
                      <Badge status="PENDING">
                        Aguardando entrega
                      </Badge>
                    ) : (
                      <Badge status="ACTIVE">
                        Entregue
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      onClick={() =>
                        openMemorandum(
                          delivery
                        )
                      }
                    >
                      <FileText
                        size={16}
                        className="mr-2"
                      />

                      Memorando
                    </Button>

                    {delivery.status ===
                      'AGUARDANDO_ENTREGA' && (
                      <Button
                        onClick={() =>
                          confirmDelivery(
                            delivery
                          )
                        }
                      >
                        <PackageCheck
                          size={16}
                          className="mr-2"
                        />

                        Confirmar entrega
                      </Button>
                    )}

                  </div>

                </div>

                <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">

                  {delivery.status ===
                  'AGUARDANDO_ENTREGA' ? (
                    <span>
                      Autorizada em{' '}
                      {
                        delivery.authorizedAt
                      }
                    </span>
                  ) : (
                    <span>
                      Entregue em{' '}
                      {
                        delivery.deliveredAt
                      }
                      {delivery.deliveredBy
                        ? ` • Confirmado por ${delivery.deliveredBy}`
                        : ''}
                    </span>
                  )}

                </div>

              </Card>
            )
          )
        )}

      </div>

    </div>
  );
};