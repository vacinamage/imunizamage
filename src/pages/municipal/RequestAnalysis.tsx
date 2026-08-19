import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  RotateCcw,
  Save,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  Syringe,
  ArrowLeft,
  Package,
} from 'lucide-react';

import {
  Card,
  Button,
  Badge,
} from '../../components/ui';

import {
  getRequestByProtocol,
  RequestItem,
} from '../../data/mockRequests';

import {
  vaccineCatalog,
  vaccineCategories,
  VaccineCatalogItem,
  VaccineCategory,
} from '../../data/vaccineCatalog';

type DraftItem = RequestItem & {
  authorizedQuantity: number;
  notes?: string;
  addedByCentral?: boolean;
};

type VaccineOverride = {
  name?: string;
  category?: VaccineCategory;
  imageUrl?: string;
  stock?: number;
  active?: boolean;
};

type VaccineOverrides = Record<
  string,
  VaccineOverride
>;

const STORAGE_KEY =
  'imuniza-vaccine-overrides';

const loadOverrides =
  (): VaccineOverrides => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return {};
      }

      return JSON.parse(saved);
    } catch {
      return {};
    }
  };

export const RequestAnalysis = () => {
  const navigate = useNavigate();

  const { protocol = '' } =
    useParams();

  const request =
    getRequestByProtocol(protocol);

  const [items, setItems] =
    useState<DraftItem[]>(
      () =>
        request?.items.map(
          (item) => ({
            ...item,
          })
        ) ?? []
    );

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    showCatalog,
    setShowCatalog,
  ] = useState(false);

  const [
    showQuantityModal,
    setShowQuantityModal,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    selectedVaccine,
    setSelectedVaccine,
  ] =
    useState<VaccineCatalogItem | null>(
      null
    );

  const [
    selectedLot,
    setSelectedLot,
  ] = useState('');

  const [
    extraQuantity,
    setExtraQuantity,
  ] = useState(1);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState<
      'TODAS' | VaccineCategory
    >('TODAS');

  const [
    vaccineOverrides,
  ] =
    useState<VaccineOverrides>(
      loadOverrides
    );

  const vaccines =
    useMemo(() => {
      return vaccineCatalog.map(
        (vaccine) => ({
          ...vaccine,
          ...vaccineOverrides[
            vaccine.id
          ],
        })
      );
    }, [vaccineOverrides]);

  const visibleVaccines =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      return vaccines.filter(
        (vaccine) => {
          const matchesSearch =
            !term ||
            vaccine.name
              .toLowerCase()
              .includes(term);

          const matchesCategory =
            categoryFilter ===
              'TODAS' ||
            vaccine.category ===
              categoryFilter;

          return (
            vaccine.active &&
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      vaccines,
      searchTerm,
      categoryFilter,
    ]);

  const totals =
    useMemo(() => {
      const requestedItems =
        items.filter(
          (item) =>
            !item.addedByCentral
        );

      const extraItems =
        items.filter(
          (item) =>
            item.addedByCentral
        );

      const requested =
        requestedItems.reduce(
          (sum, item) =>
            sum +
            item.requestedQuantity,
          0
        );

      const authorized =
        items.reduce(
          (sum, item) =>
            sum +
            item.authorizedQuantity,
          0
        );

      const full =
        requestedItems.filter(
          (item) =>
            item.authorizedQuantity ===
            item.requestedQuantity
        ).length;

      const partial =
        requestedItems.filter(
          (item) =>
            item.authorizedQuantity >
              0 &&
            item.authorizedQuantity <
              item.requestedQuantity
        ).length;

      const rejected =
        requestedItems.filter(
          (item) =>
            item.authorizedQuantity ===
            0
        ).length;

      return {
        requested,
        authorized,
        full,
        partial,
        rejected,
        extra:
          extraItems.length,
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
            navigate(
              '/app/solicitacoes'
            )
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

        if (
          item.addedByCentral
        ) {
          return {
            ...item,

            authorizedQuantity:
              Math.max(
                0,
                rawValue || 0
              ),
          };
        }

        const maxAllowed =
          Math.min(
            item.requestedQuantity,
            item.centralStock
          );

        const safeValue =
          Math.max(
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
        };
      })
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
        if (
          item.id !== id
        ) {
          return item;
        }

        if (
          item.addedByCentral
        ) {
          return item;
        }

        return {
          ...item,

          authorizedQuantity:
            Math.min(
              item.requestedQuantity,
              item.centralStock
            ),
        };
      })
    );
  };

  const removeExtraVaccine = (
    id: string
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  const openVaccine = (
    vaccine: VaccineCatalogItem
  ) => {
    setSelectedVaccine(
      vaccine
    );

    setSelectedLot('');

    setExtraQuantity(1);

    setShowCatalog(false);

    setShowQuantityModal(
      true
    );
  };

  const confirmAddVaccine =
    () => {
      if (
        !selectedVaccine
      ) {
        return;
      }

      if (
        !selectedLot
      ) {
        alert(
          'Selecione o lote.'
        );

        return;
      }

      if (
        extraQuantity <= 0
      ) {
        alert(
          'Informe uma quantidade maior que zero.'
        );

        return;
      }

      if (
        extraQuantity >
        selectedVaccine.stock
      ) {
        alert(
          'A quantidade não pode ser maior que o estoque disponível.'
        );

        return;
      }

      const newItem: DraftItem =
        {
          id: `extra-${Date.now()}`,

          /*
           * Temporariamente guardamos
           * o lote no vaccineId para
           * o memorando imprimir.
           */
          vaccineId:
            selectedLot,

          vaccineName:
            selectedVaccine.name,

          localStockReported: 0,

          requestedQuantity: 0,

          centralStock:
            selectedVaccine.stock,

          authorizedQuantity:
            extraQuantity,

          addedByCentral: true,
        };

      setItems((prev) => [
        ...prev,
        newItem,
      ]);

      setShowQuantityModal(
        false
      );

      setSelectedVaccine(
        null
      );

      setSelectedLot('');

      setExtraQuantity(1);
    };

  const confirmAuthorization = () => {
  try {
    const LOTS_STORAGE_KEY =
      'imuniza-central-lots';

    const MOVEMENTS_STORAGE_KEY =
      'imuniza-central-movements';

    const savedLots =
      localStorage.getItem(
        LOTS_STORAGE_KEY
      );

    const savedMovements =
      localStorage.getItem(
        MOVEMENTS_STORAGE_KEY
      );

    const lots = savedLots
      ? JSON.parse(savedLots)
      : [];

    const movements =
      savedMovements
        ? JSON.parse(
            savedMovements
          )
        : [];

    const updatedLots = [
      ...lots,
    ];

    const newMovements = [
      ...movements,
    ];

    for (const item of items) {
      if (
        item.authorizedQuantity <= 0
      ) {
        continue;
      }

      const lotIndex =
        updatedLots.findIndex(
          (lot) =>
            lot.lotNumber ===
              item.vaccineId
        );

      if (lotIndex < 0) {
        alert(
          `Lote não encontrado para ${item.vaccineName}.`
        );

        return;
      }

      const lot =
        updatedLots[
          lotIndex
        ];

      if (
        lot.doses <
        item.authorizedQuantity
      ) {
        alert(
          `Estoque insuficiente para ${item.vaccineName}. Disponível: ${lot.doses} doses.`
        );

        return;
      }

      updatedLots[
        lotIndex
      ] = {
        ...lot,

        doses:
          lot.doses -
          item.authorizedQuantity,
      };

      newMovements.unshift({
        id: `mov-${Date.now()}-${item.id}`,
        type: 'SAIDA',
        vaccineId:
          lot.vaccineId,
        lotNumber:
          lot.lotNumber,
        doses:
          item.authorizedQuantity,
        date:
          new Date().toISOString(),
        description:
          `Saída referente à solicitação ${request.protocol} - ${request.unitName}`,
      });
    }

    localStorage.setItem(
      LOTS_STORAGE_KEY,
      JSON.stringify(
        updatedLots
      )
    );

    localStorage.setItem(
      MOVEMENTS_STORAGE_KEY,
      JSON.stringify(
        newMovements
      )
    );

    setShowConfirm(false);

    setSuccess(true);
  } catch {
    alert(
      'Não foi possível concluir a autorização.'
    );
  }
};

  if (success) {
    const
      generatedMemorandum =
        'MEM-2026-000005';

    return (
      <div className="flex min-h-[65vh] items-center justify-center">

        <Card className="max-w-xl text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

            <ShieldCheck
              size={34}
            />

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
              {
                generatedMemorandum
              }
            </p>

            {totals.extra >
              0 && (
              <>
                <p className="mt-3 text-sm text-slate-500">
                  Vacinas adicionadas pela Central
                </p>

                <p className="font-bold text-blue-600">
                  {
                    totals.extra
                  }
                </p>
              </>
            )}

          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  '/app/solicitacoes'
                )
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

      {/* CABEÇALHO */}
      <header>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/app/solicitacoes'
            )
          }
          className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
        >
          <ArrowLeft
            size={16}
          />

          Voltar às solicitações
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

      {/* DADOS */}
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
              {
                request.requesterName
              }
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
              {
                request.items.length
              }{' '}
              vacinas
            </p>

          </div>

        </div>

      </Card>

      {/* TÍTULO + BOTÃO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="text-xl font-bold">
            Vacinas da liberação
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Confira as quantidades autorizadas e adicione outros itens quando necessário.
          </p>

        </div>

        <Button
          onClick={() =>
            setShowCatalog(true)
          }
        >
          <Plus
            size={16}
            className="mr-2"
          />

          Adicionar vacina
        </Button>

      </div>

      {/* ITENS */}
      <div className="space-y-4">

        {items.map(
          (item) => {
            if (
              item.addedByCentral
            ) {
              return (
                <Card
                  key={item.id}
                  className="border-blue-200"
                >

                  <div className="flex flex-col gap-5">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-lg font-bold">
                            {
                              item.vaccineName
                            }
                          </h2>

                          <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                            Adicionada pela Central
                          </span>

                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Lote:{' '}
                          <strong>
                            {
                              item.vaccineId
                            }
                          </strong>
                        </p>

                      </div>

                      <Button
                        variant="outline"
                        className="text-red-600"
                        onClick={() =>
                          removeExtraVaccine(
                            item.id
                          )
                        }
                      >
                        <Trash2
                          size={15}
                          className="mr-2"
                        />

                        Remover
                      </Button>

                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">

                        <p className="text-xs text-slate-500">
                          Quantidade liberada
                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-600">
                          {
                            item.authorizedQuantity
                          }
                        </p>

                      </div>

                      <div>

                        <label className="mb-1 block text-xs font-bold text-slate-500">
                          Alterar quantidade
                        </label>

                        <input
                          type="number"
                          min={1}
                          max={
                            item.centralStock
                          }
                          value={
                            item.authorizedQuantity
                          }
                          onChange={(
                            event
                          ) =>
                            updateAuthorized(
                              item.id,
                              Number(
                                event
                                  .target
                                  .value
                              )
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                        />

                      </div>

                    </div>

                  </div>

                </Card>
              );
            }

            const isReduced =
              item.authorizedQuantity <
              item.requestedQuantity;

            const maxAllowed =
              Math.min(
                item.requestedQuantity,
                item.centralStock
              );

            return (
              <Card
                key={item.id}
              >

                <div className="flex flex-col gap-5">

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <h2 className="text-lg font-bold">
                        {
                          item.vaccineName
                        }
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
                        {
                          item.centralStock
                        }
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <div>

                      <label className="mb-1 block text-xs font-bold text-slate-500">
                        Quantidade autorizada
                      </label>

                      <div className="flex gap-2">

                        <input
                          type="number"
                          min={0}
                          max={
                            maxAllowed
                          }
                          value={
                            item.authorizedQuantity
                          }
                          onChange={(
                            event
                          ) =>
                            updateAuthorized(
                              item.id,
                              Number(
                                event
                                  .target
                                  .value
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
                        >
                          <RotateCcw
                            size={16}
                          />
                        </Button>

                      </div>

                    </div>

                    <div>

                      <label className="mb-1 block text-xs font-bold text-slate-500">
                        Observação
                      </label>

                      <input
                        type="text"
                        value={
                          item.notes ??
                          ''
                        }
                        onChange={(
                          event
                        ) =>
                          updateNotes(
                            item.id,
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Observação opcional"
                        className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                      />

                    </div>

                  </div>

                </div>

              </Card>
            );
          }
        )}

      </div>

      {/* RESUMO */}
      <Card>

        <h2 className="text-lg font-bold">
          Resumo da análise
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

          <div>
            <p className="text-xs text-slate-500">
              Solicitado
            </p>

            <p className="text-xl font-bold">
              {
                totals.requested
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Liberado
            </p>

            <p className="text-xl font-bold text-brand-600">
              {
                totals.authorized
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Totais
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
              {
                totals.partial
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Não autorizados
            </p>

            <p className="text-xl font-bold text-red-600">
              {
                totals.rejected
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Extras da Central
            </p>

            <p className="text-xl font-bold text-blue-600">
              {
                totals.extra
              }
            </p>
          </div>

        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

          <Button
            variant="outline"
            onClick={() =>
              alert(
                'Análise salva localmente.'
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

      {/* CATÁLOGO */}
      {showCatalog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <Card className="max-h-[92vh] w-full max-w-6xl overflow-y-auto">

            <div className="sticky top-0 z-10 bg-white pb-4 dark:bg-slate-900">

              <div className="flex items-start justify-between gap-3">

                <div>

                  <h2 className="text-2xl font-bold">
                    Catálogo de vacinas
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecione uma vacina disponível no Estoque Central.
                  </p>

                </div>

                <Button
                  variant="ghost"
                  onClick={() =>
                    setShowCatalog(
                      false
                    )
                  }
                >
                  ✕
                </Button>

              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">

                <div className="relative flex-1">

                  <Search
                    size={18}
                    className="absolute left-3 top-2.5 text-slate-400"
                  />

                  <input
                    value={
                      searchTerm
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchTerm(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Buscar vacina..."
                    className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                  />

                </div>

                <select
                  value={
                    categoryFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setCategoryFilter(
                      event
                        .target
                        .value as
                        | 'TODAS'
                        | VaccineCategory
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="TODAS">
                    Todas as categorias
                  </option>

                  {vaccineCategories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {
                          category
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {visibleVaccines.map(
                (vaccine) => (
                  <Card
                    key={
                      vaccine.id
                    }
                    className="flex h-full flex-col"
                  >

                    <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">

                      {vaccine.imageUrl ? (
                        <img
                          src={
                            vaccine.imageUrl
                          }
                          alt={
                            vaccine.name
                          }
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center text-slate-400">

                          <Syringe
                            size={38}
                            className="mx-auto"
                          />

                          <p className="mt-2 text-xs">
                            Sem foto
                          </p>

                        </div>
                      )}

                    </div>

                    <div className="mt-4 flex-1">

                      <h3 className="font-bold">
                        {
                          vaccine.name
                        }
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          vaccine.category
                        }
                      </p>

                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">

                        <Package
                          size={17}
                          className="text-brand-600"
                        />

                        <div>

                          <p className="text-[10px] uppercase text-slate-400">
                            Estoque
                          </p>

                          <p className="font-bold text-brand-600">
                            {vaccine.stock.toLocaleString(
                              'pt-BR'
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                    <Button
                      className="mt-4 w-full"
                      disabled={
                        vaccine.stock <=
                        0
                      }
                      onClick={() =>
                        openVaccine(
                          vaccine
                        )
                      }
                    >
                      {vaccine.stock >
                      0
                        ? 'Selecionar'
                        : 'Sem estoque'}
                    </Button>

                  </Card>
                )
              )}

            </div>

            {visibleVaccines.length ===
              0 && (
              <div className="py-12 text-center text-slate-500">
                Nenhuma vacina encontrada.
              </div>
            )}

          </Card>

        </div>
      )}

      {/* QUANTIDADE / LOTE */}
      {showQuantityModal &&
        selectedVaccine && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <Card className="w-full max-w-lg">

            <h2 className="text-xl font-bold">
              Adicionar à liberação
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {
                selectedVaccine.name
              }
            </p>

            <div className="mt-5 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">

              {selectedVaccine.imageUrl ? (
                <img
                  src={
                    selectedVaccine.imageUrl
                  }
                  alt={
                    selectedVaccine.name
                  }
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <Syringe
                  size={46}
                  className="text-slate-400"
                />
              )}

            </div>

            <div className="mt-5 space-y-4">

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Lote
                </label>

                <input
                  type="text"
                  value={
                    selectedLot
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedLot(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Informe o lote"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                />

              </div>

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Quantidade
                </label>

                <input
                  type="number"
                  min={1}
                  max={
                    selectedVaccine.stock
                  }
                  value={
                    extraQuantity
                  }
                  onChange={(
                    event
                  ) =>
                    setExtraQuantity(
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Disponível:{' '}
                  {
                    selectedVaccine.stock
                  }
                </p>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() => {
                  setShowQuantityModal(
                    false
                  );

                  setShowCatalog(
                    true
                  );
                }}
              >
                Voltar
              </Button>

              <Button
                onClick={
                  confirmAddVaccine
                }
              >
                <Plus
                  size={16}
                  className="mr-2"
                />

                Adicionar
              </Button>

            </div>

          </Card>

        </div>
      )}

      {/* CONFIRMAR AUTORIZAÇÃO */}
      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

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
                <strong>
                  Unidade:
                </strong>{' '}
                {request.unitName}
              </p>

              <p>
                <strong>
                  Total solicitado:
                </strong>{' '}
                {
                  totals.requested
                }
              </p>

              <p>
                <strong>
                  Total liberado:
                </strong>{' '}
                {
                  totals.authorized
                }
              </p>

              <p>
                <strong>
                  Vacinas extras:
                </strong>{' '}
                {totals.extra}
              </p>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  setShowConfirm(
                    false
                  )
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