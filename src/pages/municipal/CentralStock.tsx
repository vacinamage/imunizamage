import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Package,
  Boxes,
  AlertTriangle,
  CalendarClock,
  FileDown,
  Printer,
} from 'lucide-react';

import { Card, Button, Badge } from '../../components/ui';

import {
  CENTRAL_STOCK,
  STOCK_STATUS_LABEL,
  StockStatus,
} from '../../data/mockStock';

const getBadgeStatus = (status: StockStatus) => {
  if (status === 'NORMAL') {
    return 'ACTIVE';
  }

  if (status === 'ATENCAO') {
    return 'PENDING';
  }

  if (
    status === 'CRITICO' ||
    status === 'VENCIDO'
  ) {
    return 'INACTIVE';
  }

  return 'PENDING';
};

export const CentralStock = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('TODOS');

  const filteredStock = useMemo(() => {
    const term =
      searchTerm
        .trim()
        .toLowerCase();

    return CENTRAL_STOCK.filter(
      (item) => {
        const matchesSearch =
          !term ||
          item.vaccineName
            .toLowerCase()
            .includes(term) ||
          item.lotNumber
            .toLowerCase()
            .includes(term) ||
          item.manufacturer
            .toLowerCase()
            .includes(term);

        const matchesStatus =
          statusFilter === 'TODOS' ||
          item.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [searchTerm, statusFilter]);

  const totalQuantity =
    CENTRAL_STOCK.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  const activeLots =
    CENTRAL_STOCK.filter(
      (item) =>
        item.status !== 'VENCIDO'
    ).length;

  const expiringLots =
    CENTRAL_STOCK.filter(
      (item) =>
        item.status === 'ATENCAO'
    ).length;

  const criticalItems =
    CENTRAL_STOCK.filter(
      (item) =>
        item.status === 'CRITICO'
    ).length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <button
            type="button"
            onClick={() =>
              navigate('/app')
            }
            className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
          >
            <ArrowLeft size={16} />

            Voltar ao menu
          </button>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Estoque Central
          </h1>

          <p className="mt-1 text-slate-500">
            Controle de vacinas, lotes e quantidades disponíveis na Central de Imunização.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <Button
            variant="outline"
            onClick={() =>
              window.print()
            }
          >
            <Printer
              size={16}
              className="mr-2"
            />

            Imprimir
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              alert(
                'Exportação será implementada posteriormente.'
              )
            }
          >
            <FileDown
              size={16}
              className="mr-2"
            />

            Exportar
          </Button>

          <Button
            onClick={() =>
              navigate(
                '/app/estoque/nova-entrada'
              )
            }
          >
            <Plus
              size={16}
              className="mr-2"
            />

            Nova Entrada
          </Button>

        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Quantidade disponível
              </p>

              <p className="mt-2 text-3xl font-bold">
                {totalQuantity.toLocaleString(
                  'pt-BR'
                )}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/30">
              <Package size={24} />
            </div>

          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Lotes ativos
              </p>

              <p className="mt-2 text-3xl font-bold">
                {activeLots}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30">
              <Boxes size={24} />
            </div>

          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Próximos do vencimento
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {expiringLots}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30">
              <CalendarClock size={24} />
            </div>

          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Estoque crítico
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {criticalItems}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30">
              <AlertTriangle size={24} />
            </div>

          </div>
        </Card>

      </section>

      <Card className="p-0 overflow-hidden">

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-2.5 text-slate-400"
            />

            <input
              type="text"
              placeholder="Pesquisar vacina, lote ou fabricante..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="TODOS">
              Todas as situações
            </option>

            <option value="NORMAL">
              Normal
            </option>

            <option value="ATENCAO">
              Atenção
            </option>

            <option value="CRITICO">
              Crítico
            </option>

            <option value="VENCIDO">
              Vencido
            </option>
          </select>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50 dark:bg-slate-800/50">

              <tr>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Vacina
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Lote
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Fabricante
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Validade
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                  Quantidade
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                  Situação
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

              {filteredStock.map(
                (item) => (

                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >

                    <td className="px-5 py-4">

                      <p className="text-sm font-bold">
                        {
                          item.vaccineName
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Entrada:{' '}
                        {item.receivedAt}
                      </p>

                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {item.lotNumber}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {
                        item.manufacturer
                      }
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {
                        item.expirationDate
                      }
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-bold text-brand-600">
                      {item.quantity.toLocaleString(
                        'pt-BR'
                      )}
                    </td>

                    <td className="px-5 py-4">

                      <Badge
                        status={getBadgeStatus(
                          item.status
                        )}
                      >
                        {
                          STOCK_STATUS_LABEL[
                            item.status
                          ]
                        }
                      </Badge>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
};