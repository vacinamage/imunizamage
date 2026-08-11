import { Eye, Search } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { MOCK_ORDERS } from '../../data/vaccineCatalog';

export const MyOrders = () => {
  const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ANALISE':
      return <Badge status="PENDING">Em análise</Badge>;

    case 'SEPARANDO':
      return <Badge status="PROCESSING">Separando estoque</Badge>;

    case 'TRANSPORTE':
      return <Badge status="PROCESSING">Em transporte</Badge>;

    case 'ENTREGUE':
      return <Badge status="ACTIVE">Entregue</Badge>;

    case 'REJEITADO':
      return <Badge status="INACTIVE">Rejeitado</Badge>;

     default:
      return <Badge status="PENDING">{status}</Badge>;
  }
};

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Solicitações</h1>

          <p className="text-slate-500">
            Acompanhe o status e a entrega das suas solicitações de vacinas.
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Buscar pedido..."
            className="rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
      </header>

      <Card className="overflow-hidden p-0">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Número
              </th>

              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Data
              </th>

              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Itens
              </th>

              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Total de doses
              </th>

              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {MOCK_ORDERS.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <td className="px-6 py-4 text-sm font-bold">{order.id}</td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {order.date}
                </td>

                <td className="px-6 py-4">
                  {getStatusBadge(order.status)}
                </td>

                <td className="px-6 py-4 text-sm">
                  {order.items} vacinas
                </td>

                <td className="px-6 py-4 text-sm font-bold text-brand-600">
                  {order.totalDoses.toLocaleString('pt-BR')}
                </td>

                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" className="text-xs">
                    <Eye size={14} className="mr-2" />
                    Visualizar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};