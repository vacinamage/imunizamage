import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Syringe,
  Trash2,
  XCircle,
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

/* =========================================================
   TIPOS
========================================================= */

type LotAllocation = {
  lotId: string;
  lotNumber: string;
  expirationDate: string;
  doses: number;
};

type DraftItem = RequestItem & {
  authorizedQuantity: number;
  notes?: string;
  addedByCentral?: boolean;
  lotAllocations?: LotAllocation[];
};

type VaccineOverride = {
  name?: string;
  category?: VaccineCategory;
  imageUrl?: string;
  active?: boolean;
};

type VaccineOverrides = Record<
  string,
  VaccineOverride
>;

type CentralLot = {
  id: string;
  vaccineId: string;
  lotNumber: string;
  expirationDate: string;
  doses: number;
};

type StockMovement = {
  id: string;
  type: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  vaccineId: string;
  lotNumber: string;
  doses: number;
  date: string;
  description?: string;
};

/* =========================================================
   STORAGE
========================================================= */

const VACCINE_STORAGE_KEY =
  'imuniza-vaccine-overrides';

const LOTS_STORAGE_KEY =
  'imuniza-central-lots';

const MOVEMENTS_STORAGE_KEY =
  'imuniza-central-movements';

/* =========================================================
   LOAD
========================================================= */

const loadOverrides = (): VaccineOverrides => {
  try {
    const saved =
      localStorage.getItem(
        VACCINE_STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : {};
  } catch {
    return {};
  }
};

const loadCentralLots = (): CentralLot[] => {
  try {
    const saved =
      localStorage.getItem(
        LOTS_STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : [];
  } catch {
    return [];
  }
};

/* =========================================================
   COMPONENTE
========================================================= */

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
    showExtraModal,
    setShowExtraModal,
  ] = useState(false);

  const [
    selectedVaccine,
    setSelectedVaccine,
  ] =
    useState<VaccineCatalogItem | null>(
      null
    );

  const [
    extraDoses,
    setExtraDoses,
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

  const [
    centralLots,
    setCentralLots,
  ] =
    useState<CentralLot[]>(
      loadCentralLots
    );

  const [
    success,
    setSuccess,
  ] = useState(false);

  /* =======================================================
     CATÁLOGO
  ======================================================= */

  const vaccines =
    useMemo(() => {
      return vaccineCatalog.map(
        (vaccine) => {
          const stock =
            centralLots
              .filter(
                (lot) =>
                  lot.vaccineId ===
                    vaccine.id &&
                  lot.doses > 0
              )
              .reduce(
                (total, lot) =>
                  total +
                  lot.doses,
                0
              );

          return {
            ...vaccine,
            ...vaccineOverrides[
              vaccine.id
            ],
            stock,
          };
        }
      );
    }, [
      vaccineOverrides,
      centralLots,
    ]);

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

  /* =======================================================
     VACINA DO ITEM
  ======================================================= */

  const findCatalogVaccine = (
    item: DraftItem
  ) => {
    const byId =
      vaccines.find(
        (vaccine) =>
          vaccine.id ===
          item.vaccineId
      );

    if (byId) {
      return byId;
    }

    return vaccines.find(
      (vaccine) =>
        vaccine.name
          .trim()
          .toLowerCase() ===
        item.vaccineName
          .trim()
          .toLowerCase()
    );
  };

  /* =======================================================
     LOTES VÁLIDOS - FEFO
  ======================================================= */

  const getValidLotsByVaccine = (
    vaccineId: string
  ) => {
    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    return centralLots
      .filter((lot) => {
        const expiration =
          new Date(
            `${lot.expirationDate}T00:00:00`
          );

        return (
          lot.vaccineId ===
            vaccineId &&
          lot.doses > 0 &&
          expiration >= today
        );
      })
      .sort(
        (a, b) =>
          new Date(
            `${a.expirationDate}T00:00:00`
          ).getTime() -
          new Date(
            `${b.expirationDate}T00:00:00`
          ).getTime()
      );
  };

  const getAvailableDoses = (
    item: DraftItem
  ) => {
    const vaccine =
      findCatalogVaccine(
        item
      );

    if (!vaccine) {
      return 0;
    }

    return getValidLotsByVaccine(
      vaccine.id
    ).reduce(
      (total, lot) =>
        total + lot.doses,
      0
    );
  };

  /* =======================================================
     ALTERAR DOSES
  ======================================================= */

  const updateAuthorized = (
    id: string,
    rawValue: number
  ) => {
    setItems((previous) =>
      previous.map(
        (item) => {
          if (
            item.id !== id
          ) {
            return item;
          }

          const available =
            getAvailableDoses(
              item
            );

          const maxAllowed =
            item.addedByCentral
              ? available
              : Math.min(
                  item.requestedQuantity,
                  available
                );

          return {
            ...item,

            authorizedQuantity:
              Math.max(
                0,
                Math.min(
                  rawValue || 0,
                  maxAllowed
                )
              ),
          };
        }
      )
    );
  };

  const restoreRequested = (
    id: string
  ) => {
    setItems((previous) =>
      previous.map(
        (item) => {
          if (
            item.id !== id ||
            item.addedByCentral
          ) {
            return item;
          }

          return {
            ...item,

            authorizedQuantity:
              Math.min(
                item.requestedQuantity,
                getAvailableDoses(
                  item
                )
              ),
          };
        }
      )
    );
  };

  const updateNotes = (
    id: string,
    value: string
  ) => {
    setItems((previous) =>
      previous.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                notes: value,
              }
            : item
      )
    );
  };

  const removeExtraVaccine = (
    id: string
  ) => {
    setItems((previous) =>
      previous.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  const openVaccine = (
    vaccine:
      VaccineCatalogItem
  ) => {
    setSelectedVaccine(
      vaccine
    );

    setExtraDoses(1);

    setShowCatalog(false);

    setShowExtraModal(true);
  };

  const confirmAddVaccine = () => {
    if (
      !selectedVaccine
    ) {
      return;
    }

    const available =
      getValidLotsByVaccine(
        selectedVaccine.id
      ).reduce(
        (total, lot) =>
          total +
          lot.doses,
        0
      );

    if (
      extraDoses <= 0
    ) {
      alert(
        'Informe o número de doses.'
      );

      return;
    }

    if (
      extraDoses >
      available
    ) {
      alert(
        `Estoque insuficiente. Disponível: ${available} doses.`
      );

      return;
    }

    const newItem:
      DraftItem = {
      id: `extra-${Date.now()}`,

      vaccineId:
        selectedVaccine.id,

      vaccineName:
        selectedVaccine.name,

      localStockReported: 0,

      requestedQuantity: 0,

      centralStock:
        available,

      authorizedQuantity:
        extraDoses,

      addedByCentral:
        true,
    };

    setItems(
      (previous) => [
        ...previous,
        newItem,
      ]
    );

    setSelectedVaccine(
      null
    );

    setExtraDoses(1);

    setShowExtraModal(false);
  };
    /* =======================================================
     RESUMO
  ======================================================= */

  const totals =
    useMemo(() => {
      const originals =
        items.filter(
          (item) =>
            !item.addedByCentral
        );

      const extras =
        items.filter(
          (item) =>
            item.addedByCentral
        );

      return {
        requested:
          originals.reduce(
            (total, item) =>
              total +
              item.requestedQuantity,
            0
          ),

        authorized:
          items.reduce(
            (total, item) =>
              total +
              item.authorizedQuantity,
            0
          ),

        full:
          originals.filter(
            (item) =>
              item.authorizedQuantity ===
              item.requestedQuantity
          ).length,

        partial:
          originals.filter(
            (item) =>
              item.authorizedQuantity >
                0 &&
              item.authorizedQuantity <
                item.requestedQuantity
          ).length,

        rejected:
          originals.filter(
            (item) =>
              item.authorizedQuantity ===
              0
          ).length,

        extra:
          extras.length,
      };
    }, [items]);

  const validateAuthorization = () => {
    const authorizedItems =
      items.filter(
        (item) =>
          item.authorizedQuantity >
          0
      );

    if (
      authorizedItems.length ===
      0
    ) {
      alert(
        'Nenhuma dose foi autorizada.'
      );

      return false;
    }

    for (
      const item of
      authorizedItems
    ) {
      const available =
        getAvailableDoses(
          item
        );

      if (
        available <
        item.authorizedQuantity
      ) {
        alert(
          `Estoque insuficiente para ${item.vaccineName}. Disponível: ${available} doses.`
        );

        return false;
      }
    }

    return true;
  };

  const openAuthorizationConfirm =
    () => {
      if (
        !validateAuthorization()
      ) {
        return;
      }

      setShowConfirm(true);
    };

  /* =======================================================
     AUTORIZAÇÃO FEFO
  ======================================================= */

  const confirmAuthorization =
    () => {
      if (
        !validateAuthorization()
      ) {
        setShowConfirm(false);
        return;
      }

      try {
        const updatedLots =
          centralLots.map(
            (lot) => ({
              ...lot,
            })
          );

        const savedMovements =
          localStorage.getItem(
            MOVEMENTS_STORAGE_KEY
          );

        const movements:
          StockMovement[] =
          savedMovements
            ? JSON.parse(
                savedMovements
              )
            : [];

        const newMovements =
          [...movements];

        const updatedItems:
          DraftItem[] =
          items.map(
            (item) => ({
              ...item,
              lotAllocations:
                [] as LotAllocation[],
            })
          );

        for (
          let itemIndex = 0;
          itemIndex <
          updatedItems.length;
          itemIndex++
        ) {
          const item =
            updatedItems[
              itemIndex
            ];

          if (
            item.authorizedQuantity <=
            0
          ) {
            continue;
          }

          const vaccine =
            findCatalogVaccine(
              item
            );

          const vaccineId =
            vaccine?.id ||
            item.vaccineId;

          const today =
            new Date();

          today.setHours(
            0,
            0,
            0,
            0
          );

          const validLots =
            updatedLots
              .filter(
                (lot) => {
                  const expiration =
                    new Date(
                      `${lot.expirationDate}T00:00:00`
                    );

                  return (
                    lot.vaccineId ===
                      vaccineId &&
                    lot.doses > 0 &&
                    expiration >=
                      today
                  );
                }
              )
              .sort(
                (a, b) =>
                  new Date(
                    `${a.expirationDate}T00:00:00`
                  ).getTime() -
                  new Date(
                    `${b.expirationDate}T00:00:00`
                  ).getTime()
              );

          let remaining =
            item.authorizedQuantity;

          const allocations:
            LotAllocation[] =
            [];

          for (
            const availableLot of
            validLots
          ) {
            if (
              remaining <= 0
            ) {
              break;
            }

            const lotIndex =
              updatedLots.findIndex(
                (lot) =>
                  lot.id ===
                  availableLot.id
              );

            if (
              lotIndex < 0
            ) {
              continue;
            }

            const currentLot =
              updatedLots[
                lotIndex
              ];

            const dosesFromLot =
              Math.min(
                currentLot.doses,
                remaining
              );

            updatedLots[
              lotIndex
            ] = {
              ...currentLot,

              doses:
                currentLot.doses -
                dosesFromLot,
            };

            allocations.push({
              lotId:
                currentLot.id,

              lotNumber:
                currentLot.lotNumber,

              expirationDate:
                currentLot.expirationDate,

              doses:
                dosesFromLot,
            });

            newMovements.unshift({
              id: `mov-${Date.now()}-${item.id}-${currentLot.id}`,

              type: 'SAIDA',

              vaccineId,

              lotNumber:
                currentLot.lotNumber,

              doses:
                dosesFromLot,

              date:
                new Date()
                  .toISOString(),

              description:
                `Solicitação ${request?.protocol ?? protocol}`,
            });

            remaining -=
              dosesFromLot;
          }

          updatedItems[
            itemIndex
          ] = {
            ...item,
            lotAllocations:
              allocations,
          };
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

        setCentralLots(
          updatedLots
        );

        setItems(
          updatedItems
        );

        setShowConfirm(false);

        setSuccess(true);
      } catch {
        alert(
          'Não foi possível concluir a autorização.'
        );
      }
    };

  /* =======================================================
     NÃO ENCONTRADA
  ======================================================= */

  if (!request) {
    return (
      <Card className="mx-auto max-w-2xl rounded-3xl p-8">

        <h1 className="text-2xl font-black">
          Solicitação não encontrada
        </h1>

        <p className="mt-2 text-slate-500">
          Não foi possível localizar esta solicitação.
        </p>

        <Button
          className="mt-6"
          onClick={() =>
            navigate(
              '/app/solicitacoes'
            )
          }
        >
          Voltar às solicitações
        </Button>

      </Card>
    );
  }

  /* =======================================================
     SUCESSO
  ======================================================= */

  if (success) {
    const generatedMemorandum =
      `MEM-${new Date().getFullYear()}-${String(
        Date.now()
      ).slice(-6)}`;

    return (
      <Card className="mx-auto max-w-3xl rounded-3xl p-8">

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">

            <CheckCircle2
              size={40}
            />

          </div>

          <h1 className="mt-5 text-3xl font-black">
            Solicitação autorizada
          </h1>

          <p className="mt-2 text-slate-500">
            As doses foram retiradas automaticamente dos lotes com vencimento mais próximo.
          </p>

        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-xs font-bold uppercase text-slate-400">
              Solicitação
            </p>

            <p className="mt-2 font-black">
              {
                request.protocol
              }
            </p>

          </div>

          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-xs font-bold uppercase text-slate-400">
              Memorando
            </p>

            <p className="mt-2 font-black">
              {
                generatedMemorandum
              }
            </p>

          </div>

          <div className="rounded-2xl bg-blue-50 p-5">

            <p className="text-xs font-bold uppercase text-blue-400">
              Doses liberadas
            </p>

            <p className="mt-2 text-2xl font-black text-blue-600">
              {
                totals.authorized
              }
            </p>

          </div>

        </div>

        <div className="mt-8 space-y-3">

          {items
            .filter(
              (item) =>
                item.authorizedQuantity >
                0
            )
            .map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="rounded-2xl border border-slate-200 p-5"
                >

                  <p className="font-black">
                    {
                      item.vaccineName
                    }
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      item.authorizedQuantity
                    }{' '}
                    doses liberadas
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {item.lotAllocations?.map(
                      (
                        allocation
                      ) => (
                        <span
                          key={
                            allocation.lotId
                          }
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold"
                        >
                          Lote{' '}
                          {
                            allocation.lotNumber
                          }{' '}
                          •{' '}
                          {
                            allocation.doses
                          }{' '}
                          doses
                        </span>
                      )
                    )}

                  </div>

                </div>
              )
            )}

        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Button
            variant="outline"
            onClick={() =>
              navigate(
                '/app/solicitacoes'
              )
            }
          >
            Solicitações
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
    );
  }
    return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* CABEÇALHO */}

      <Card className="rounded-3xl border-slate-200 p-7">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Analisar solicitação
              </h1>

              <Badge status="PROCESSING">
                Em análise
              </Badge>

            </div>

            <p className="mt-2 text-slate-500">
              Avalie as doses solicitadas e autorize a distribuição.
            </p>

          </div>

          <Button
            onClick={() =>
              setShowCatalog(
                true
              )
            }
          >
            <Plus
              size={17}
              className="mr-2"
            />

            Adicionar vacina
          </Button>

        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-xs font-bold uppercase text-slate-400">
              Solicitação
            </p>

            <p className="mt-2 font-black">
              {
                request.protocol
              }
            </p>

          </div>

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-xs font-bold uppercase text-slate-400">
              Unidade
            </p>

            <p className="mt-2 font-black">
              {
                request.unitName
              }
            </p>

          </div>

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-xs font-bold uppercase text-slate-400">
              Solicitante
            </p>

            <p className="mt-2 font-black">
              {
                request.requesterName
              }
            </p>

          </div>

          <div className="rounded-2xl bg-slate-50 p-4">

            <p className="text-xs font-bold uppercase text-slate-400">
              Data
            </p>

            <p className="mt-2 font-black">
              {
                request.createdAt
              }
            </p>

          </div>

        </div>

      </Card>

      {/* FEFO */}

      <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">

          <Package
            size={21}
          />

        </div>

        <div>

          <p className="font-bold text-blue-800">
            Seleção automática de lotes
          </p>

          <p className="mt-1 text-sm text-blue-600">
            O IMUNIZA PLUS utiliza primeiro os lotes válidos com vencimento mais próximo.
          </p>

        </div>

      </div>

      {/* VACINAS */}

      <section>

        <div className="mb-4">

          <h2 className="text-xl font-black text-slate-900">
            Vacinas da solicitação
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Defina somente as doses que serão autorizadas.
          </p>

        </div>

        <div className="space-y-5">

          {items.map(
            (item) => {
              const available =
                getAvailableDoses(
                  item
                );

              const vaccine =
                findCatalogVaccine(
                  item
                );

              const nextLot =
                vaccine
                  ? getValidLotsByVaccine(
                      vaccine.id
                    )[0]
                  : undefined;

              const isReduced =
                !item.addedByCentral &&
                item.authorizedQuantity <
                  item.requestedQuantity;

              return (
                <Card
                  key={
                    item.id
                  }
                  className={`rounded-3xl p-6 ${
                    item.addedByCentral
                      ? 'border-blue-200'
                      : 'border-slate-200'
                  }`}
                >

                  <div className="flex flex-col gap-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                          <Syringe
                            size={27}
                          />

                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-xl font-black">
                              {
                                item.vaccineName
                              }
                            </h3>

                            {item.addedByCentral && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">
                                Central
                              </span>
                            )}

                          </div>

                          {!item.addedByCentral && (
                            <div className="mt-2">

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
                          )}

                        </div>

                      </div>

                      {item.addedByCentral && (
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
                      )}

                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                      <div className="rounded-2xl bg-slate-50 p-4">

                        <p className="text-xs font-bold uppercase text-slate-400">
                          Estoque unidade
                        </p>

                        <p className="mt-2 text-2xl font-black">
                          {
                            item.localStockReported
                          }
                        </p>

                        <p className="text-xs text-slate-400">
                          doses
                        </p>

                      </div>

                      <div className="rounded-2xl bg-amber-50 p-4">

                        <p className="text-xs font-bold uppercase text-amber-500">
                          Solicitado
                        </p>

                        <p className="mt-2 text-2xl font-black text-amber-700">
                          {
                            item.requestedQuantity
                          }
                        </p>

                        <p className="text-xs text-amber-500">
                          doses
                        </p>

                      </div>

                      <div className="rounded-2xl bg-blue-50 p-4">

                        <p className="text-xs font-bold uppercase text-blue-400">
                          Estoque Central
                        </p>

                        <p className="mt-2 text-2xl font-black text-blue-600">
                          {
                            available
                          }
                        </p>

                        <p className="text-xs text-blue-400">
                          doses
                        </p>

                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-4">

                        <p className="text-xs font-bold uppercase text-emerald-500">
                          Próximo lote
                        </p>

                        {nextLot ? (
                          <>
                            <p className="mt-2 font-black text-emerald-700">
                              {
                                nextLot.lotNumber
                              }
                            </p>

                            <p className="text-xs text-emerald-500">
                              {
                                nextLot.doses
                              }{' '}
                              doses
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 font-black text-red-600">
                            Sem lote
                          </p>
                        )}

                      </div>

                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Doses autorizadas
                        </label>

                        <div className="flex gap-2">

                          <input
                            type="number"
                            min={0}
                            max={
                              item.addedByCentral
                                ? available
                                : Math.min(
                                    item.requestedQuantity,
                                    available
                                  )
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
                                  event.target.value
                                )
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />

                          {!item.addedByCentral && (
                            <Button
                              variant="outline"
                              onClick={() =>
                                restoreRequested(
                                  item.id
                                )
                              }
                            >
                              <RotateCcw
                                size={17}
                              />
                            </Button>
                          )}

                        </div>

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-bold text-slate-700">
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
                              event.target.value
                            )
                          }
                          placeholder="Observação opcional"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />

                      </div>

                    </div>

                  </div>

                </Card>
              );
            }
          )}

        </div>

      </section>

      {/* RESUMO FINAL */}

      <Card className="rounded-3xl p-7">

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <h2 className="text-xl font-black">
              Resumo da análise
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Confira os totais antes de confirmar.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

            {[
              [
                'Solicitadas',
                totals.requested,
              ],

              [
                'Liberadas',
                totals.authorized,
              ],

              [
                'Totais',
                totals.full,
              ],

              [
                'Parciais',
                totals.partial,
              ],

              [
                'Não autorizadas',
                totals.rejected,
              ],

              [
                'Extras',
                totals.extra,
              ],
            ].map(
              ([label, value]) => (
                <div
                  key={
                    String(label)
                  }
                  className="rounded-2xl bg-slate-50 p-4 text-center"
                >

                  <p className="text-2xl font-black text-slate-900">
                    {
                      value
                    }
                  </p>

                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    {
                      label
                    }
                  </p>

                </div>
              )
            )}

          </div>

        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">

          <Button
            variant="outline"
            className="text-red-600"
            onClick={() =>
              alert(
                'Rejeição será integrada ao histórico.'
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
            onClick={
              openAuthorizationConfirm
            }
          >
            <ShieldCheck
              size={17}
              className="mr-2"
            />

            Autorizar solicitação
          </Button>

        </div>

      </Card>

      {/* CATÁLOGO */}

      {showCatalog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <Card className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl p-6">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-2xl font-black">
                  Adicionar vacina
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Escolha uma vacina disponível no Estoque Central.
                </p>

              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setShowCatalog(
                    false
                  )
                }
              >
                Fechar
              </Button>

            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <input
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
                  placeholder="Buscar vacina..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none"
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
                    event.target
                      .value as
                      | 'TODAS'
                      | VaccineCategory
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
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
                    >
                      {
                        category
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {visibleVaccines.map(
                (
                  vaccine
                ) => (
                  <Card
                    key={
                      vaccine.id
                    }
                    className="rounded-2xl p-4"
                  >

                    <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-slate-50">

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
                        <Syringe
                          size={36}
                          className="text-slate-300"
                        />
                      )}

                    </div>

                    <h3 className="mt-4 font-black">
                      {
                        vaccine.name
                      }
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        vaccine.category
                      }
                    </p>

                    <div className="mt-4 rounded-xl bg-blue-50 p-3">

                      <p className="text-xs text-blue-400">
                        Estoque Central
                      </p>

                      <p className="mt-1 text-xl font-black text-blue-600">
                        {
                          vaccine.stock
                        }{' '}
                        doses
                      </p>

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

          </Card>

        </div>
      )}

      {/* EXTRA */}

      {showExtraModal &&
        selectedVaccine && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="w-full max-w-lg rounded-3xl p-7">

            <h2 className="text-2xl font-black">
              Adicionar à liberação
            </h2>

            <p className="mt-1 text-slate-500">
              {
                selectedVaccine.name
              }
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50 p-5">

              <p className="text-xs font-bold uppercase text-blue-400">
                Disponível
              </p>

              <p className="mt-1 text-3xl font-black text-blue-600">
                {
                  selectedVaccine.stock
                }
              </p>

              <p className="text-xs text-blue-400">
                doses
              </p>

            </div>

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold">
                Doses a liberar
              </label>

              <input
                type="number"
                min={1}
                max={
                  selectedVaccine.stock
                }
                value={
                  extraDoses
                }
                onChange={(
                  event
                ) =>
                  setExtraDoses(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() => {
                  setShowExtraModal(
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
                Adicionar
              </Button>

            </div>

          </Card>

        </div>
      )}

      {/* CONFIRMAÇÃO */}

      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="w-full max-w-md rounded-3xl p-7">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

              <ShieldCheck
                size={27}
              />

            </div>

            <h2 className="mt-5 text-2xl font-black">
              Confirmar autorização?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              O estoque será atualizado automaticamente.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">

              <p className="text-sm">
                <strong>
                  Solicitação:
                </strong>{' '}
                {
                  request.protocol
                }
              </p>

              <p className="mt-2 text-sm">
                <strong>
                  Doses solicitadas:
                </strong>{' '}
                {
                  totals.requested
                }
              </p>

              <p className="mt-2 text-sm">
                <strong>
                  Doses liberadas:
                </strong>{' '}
                {
                  totals.authorized
                }
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