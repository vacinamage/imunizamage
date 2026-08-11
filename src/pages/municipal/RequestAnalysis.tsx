import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  RotateCcw,
  Save,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

import { Card, Button, Badge } from '../../components/ui';

import {
  getRequestByProtocol,
  RequestItem,
  REQUEST_REDUCTION_REASONS,
} from '../../data/mockRequests';

type DraftItem = RequestItem & {
  authorizedQuantity: number;
  reductionReason?: string;
  notes?: string;
};

export const RequestAnalysis = () => {
  const navigate = useNavigate();

  const { protocol = '' } = useParams();

  const request = getRequestByProtocol(protocol);

  const [items, setItems] = useState<DraftItem[]>(
    () =>
      request?.items.map((item) => ({
        ...item,
      })) ?? []
  );

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const totals = useMemo(() => {
    const requested = items.reduce(
      (sum, item) =>
        sum + item.requestedQuantity,
      0
    );

    const authorized = items.reduce(
      (sum, item) =>
        sum + item.authorizedQuantity,
      0
    );

    const full = items.filter(
      (item) =>
        item.authorizedQuantity ===
        item.requestedQuantity
    ).length;

    const partial = items.filter(
      (item) =>
        item.authorizedQuantity > 0 &&
        item.authorizedQuantity <
          item.requestedQuantity
    ).length;

    const rejected = items.filter(
      (item) =>
        item.authorizedQuantity === 0
    ).length;

    return {
      requested,
      authorized,
      full,
      partial,
      rejected,
    };
  }, [items]);

  if (!request) {
    return (
      <Card>
        <h1 className="text-xl font-bold">
          Solicitação não encontrada
        </h1>

        <Button
          className="mt-4"
          onClick={() =>
            navigate('/app/solicitacoes')
          }
        >
          Voltar
        </Button>
      </Card>
    );
  }

  const updateAuthorized = (
    id: string,
    rawValue: number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const maxAllowed = Math.min(
          item.requestedQuantity,
          item.centralStock
        );

        const safeValue = Math.max(
          0,
          Math.min(
            rawValue || 0,
            maxAllowed
          )
        );

        return {
          ...item,

          authorizedQuantity:
            safeValue,

          reductionReason:
            safeValue ===
            item.requestedQuantity
              ? undefined
              : item.reductionReason,
        };
      })
    );
  };

  const updateReason = (
    id: string,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              reductionReason: value,
            }
          : item
      )
    );
  };

  const updateNotes = (
    id: string,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              notes: value,
            }
          : item
      )
    );
  };

  const restoreRequested = (
    id: string
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,

          authorizedQuantity:
            Math.min(
              item.requestedQuantity,
              item.centralStock
            ),

          reductionReason:
            undefined,
        };
      })
    );
  };

  const hasInvalidReduction =
    items.some(
      (item) =>
        item.authorizedQuantity <
          item.requestedQuantity &&
        !item.reductionReason?.trim()
    );

  const confirmAuthorization = () => {
    if (hasInvalidReduction) {
      return;
    }

    setShowConfirm(false);

    setSuccess(true);
  };

  if (success) {
    const generatedMemorandum =
      'MEM-2026-000005';

    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Card className="max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <ShieldCheck size={34} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Solicitação autorizada
          </h1>

          <p className="mt-2 text-slate-500">
            O memorando foi preparado automaticamente.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/50">
            <p className="text-sm text-slate-500">
              Solicitação
            </p>

            <p className="font-bold">
              {request.protocol}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Memorando
            </p>

            <p className="font-bold">
              {generatedMemorandum}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() =>
                navigate('/app/solicitacoes')
              }
            >
              Voltar às solicitações
            </Button>

            <Button
              onClick={() =>
                navigate(
                  `/app/memorando/${request.protocol}`,
                  {
                    state: {
                      memorandumNumber:
                        generatedMemorandum,

                      analyzedItems:
                        items,
                    },
                  }
                )
              }
            >
              Imprimir memorando
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <button
          type="button"
          onClick={() =>
            navigate('/app/solicitacoes')
          }
          className="mb-3 text-sm font-bold text-brand-600 hover:underline"
        >
          ← Voltar às solicitações
        </button>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Analisar solicitação
            </h1>

            <p className="mt-1 text-slate-500">
              {request.protocol}
              {' • '}
              {request.unitName}
            </p>
          </div>

          <Badge status="PROCESSING">
            Em análise
          </Badge>
        </div>
      </header>

      <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Unidade
            </p>

            <p className="mt-1 font-semibold">
              {request.unitName}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Solicitante
            </p>

            <p className="mt-1 font-semibold">
              {request.requesterName}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Data
            </p>

            <p className="mt-1 font-semibold">
              {request.createdAt}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-400">
              Itens
            </p>

            <p className="mt-1 font-semibold">
              {request.items.length} vacinas
            </p>
          </div>
        </div>

        {request.unitNotes && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            <strong>
              Observação da unidade:
            </strong>{' '}
            {request.unitNotes}
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {items.map((item) => {
          const isReduced =
            item.authorizedQuantity <
            item.requestedQuantity;

          const maxAllowed = Math.min(
            item.requestedQuantity,
            item.centralStock
          );

          return (
            <Card key={item.id}>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">
                      {item.vaccineName}
                    </h2>

                    {item.centralStock <
                      item.requestedQuantity && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <AlertTriangle
                          size={14}
                        />

                        Estoque da Central inferior ao solicitado
                      </p>
                    )}
                  </div>

                  {isReduced ? (
                    <Badge status="PENDING">
                      Autorização parcial
                    </Badge>
                  ) : (
                    <Badge status="ACTIVE">
                      Autorização total
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500">
                      Estoque da unidade
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {
                        item.localStockReported
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500">
                      Solicitado
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {
                        item.requestedQuantity
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500">
                      Estoque Central
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {item.centralStock}
                    </p>
                  </div>

                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/20">
                    <p className="text-xs font-semibold text-brand-600">
                      Diferença
                    </p>

                    <p
                      className={`mt-1 text-xl font-bold ${
                        isReduced
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {item.authorizedQuantity -
                        item.requestedQuantity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Quantidade autorizada
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        max={maxAllowed}
                        value={
                          item.authorizedQuantity
                        }
                        onChange={(event) =>
                          updateAuthorized(
                            item.id,
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                      />

                      <Button
                        variant="outline"
                        onClick={() =>
                          restoreRequested(
                            item.id
                          )
                        }
                        title="Restaurar quantidade"
                      >
                        <RotateCcw
                          size={16}
                        />
                      </Button>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Máximo permitido:{' '}
                      {maxAllowed}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Motivo da alteração
                    </label>

                    <select
                      value={
                        item.reductionReason ??
                        ''
                      }
                      onChange={(event) =>
                        updateReason(
                          item.id,
                          event.target.value
                        )
                      }
                      disabled={!isReduced}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="">
                        Selecione...
                      </option>

                      {REQUEST_REDUCTION_REASONS.map(
                        (reason) => (
                          <option
                            key={reason}
                            value={reason}
                          >
                            {reason}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Observação
                    </label>

                    <input
                      type="text"
                      value={item.notes ?? ''}
                      onChange={(event) =>
                        updateNotes(
                          item.id,
                          event.target.value
                        )
                      }
                      placeholder="Observação opcional"
                      className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="text-lg font-bold">
          Resumo da análise
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <p className="text-xs text-slate-500">
              Total solicitado
            </p>

            <p className="text-xl font-bold">
              {totals.requested}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Total autorizado
            </p>

            <p className="text-xl font-bold text-brand-600">
              {totals.authorized}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Totalmente autorizados
            </p>

            <p className="text-xl font-bold text-emerald-600">
              {totals.full}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Parciais
            </p>

            <p className="text-xl font-bold text-amber-600">
              {totals.partial}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Não autorizados
            </p>

            <p className="text-xl font-bold text-red-600">
              {totals.rejected}
            </p>
          </div>
        </div>

        {hasInvalidReduction && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            Informe o motivo para todos os itens cuja quantidade autorizada seja menor que a solicitada.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() =>
              alert(
                'Análise salva localmente para demonstração.'
              )
            }
          >
            <Save
              size={16}
              className="mr-2"
            />

            Salvar análise
          </Button>

          <Button
            variant="outline"
            className="text-red-600"
            onClick={() =>
              alert(
                'Rejeição simulada nesta versão.'
              )
            }
          >
            <XCircle
              size={16}
              className="mr-2"
            />

            Rejeitar solicitação
          </Button>

          <Button
            disabled={
              hasInvalidReduction
            }
            onClick={() =>
              setShowConfirm(true)
            }
          >
            <ShieldCheck
              size={16}
              className="mr-2"
            />

            Autorizar solicitação
          </Button>
        </div>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold">
              Confirmar autorização?
            </h3>

            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <p>
                <strong>
                  Solicitação:
                </strong>{' '}
                {request.protocol}
              </p>

              <p>
                <strong>Unidade:</strong>{' '}
                {request.unitName}
              </p>

              <p>
                <strong>
                  Total solicitado:
                </strong>{' '}
                {totals.requested}
              </p>

              <p>
                <strong>
                  Total autorizado:
                </strong>{' '}
                {totals.authorized}
              </p>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Após confirmar, o memorando de entrega será preparado automaticamente.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setShowConfirm(false)
                }
              >
                Cancelar
              </Button>

              <Button
                onClick={
                  confirmAuthorization
                }
              >
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};