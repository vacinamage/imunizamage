import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Check,
  CheckCircle2,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Syringe,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';

import {
  Badge,
  Button,
  Card,
} from '../../components/ui';

import {
  getRequestByProtocol,
  RequestItem,
} from '../../data/mockRequests';

import {
  vaccineCatalog,
  VaccineCategory,
  vaccineCategories,
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
  documentNumber?: string;
  expirationDate: string;
  doses: number;
};

type StockMovement = {
  id: string;
  type:
    | 'ENTRADA'
    | 'SAIDA'
    | 'AJUSTE';

  vaccineId: string;
  lotNumber: string;
  doses: number;
  date: string;
  description?: string;
};

type ExtraSelection = {
  vaccineId: string;
  vaccineName: string;
  doses: number;
};

type StockFilter =
  | 'TODAS'
  | 'DISPONIVEIS'
  | 'SEM_ESTOQUE'
  | 'SELECIONADAS';

type StoredRequest = {
  protocol: string;
  status?: string;
  rejectedAt?: string;
  authorizedAt?: string;
  [key: string]: unknown;
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

const REQUESTS_STORAGE_KEY =
  'imuniza-unit-requests';

/* =========================================================
   LOAD
========================================================= */

const loadOverrides =
  (): VaccineOverrides => {
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

const loadCentralLots =
  (): CentralLot[] => {
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
  const navigate =
    useNavigate();

  const {
    protocol = '',
  } = useParams();

  const request =
    getRequestByProtocol(
      protocol
    );

  const [
    items,
    setItems,
  ] = useState<DraftItem[]>(
    () =>
      request?.items.map(
        (item) => ({
          ...item,

          authorizedQuantity:
            item.requestedQuantity,
        })
      ) ?? []
  );

  const [
    centralLots,
    setCentralLots,
  ] =
    useState<CentralLot[]>(
      loadCentralLots
    );

  const [
    vaccineOverrides,
  ] =
    useState<VaccineOverrides>(
      loadOverrides
    );

  const [
    showCatalog,
    setShowCatalog,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    showRejectConfirm,
    setShowRejectConfirm,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  /* =======================================================
     FILTROS DO CATÁLOGO
  ======================================================= */

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
    stockFilter,
    setStockFilter,
  ] =
    useState<StockFilter>(
      'DISPONIVEIS'
    );

  const [
    extraSelections,
    setExtraSelections,
  ] =
    useState<ExtraSelection[]>(
      []
    );

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

  const getStockByVaccine = (
    vaccineId: string
  ) => {
    return getValidLotsByVaccine(
      vaccineId
    ).reduce(
      (total, lot) =>
        total + lot.doses,
      0
    );
  };

  /* =======================================================
     CATÁLOGO
  ======================================================= */

  const vaccines =
    useMemo(() => {
      return vaccineCatalog.map(
        (vaccine) => ({
          ...vaccine,

          ...vaccineOverrides[
            vaccine.id
          ],

          stock:
            getStockByVaccine(
              vaccine.id
            ),
        })
      );
    }, [
      vaccineOverrides,
      centralLots,
    ]);

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

    return getStockByVaccine(
      vaccine.id
    );
  };

  /* =======================================================
     FILTRO DE VACINAS
  ======================================================= */

  const visibleVaccines =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      return vaccines.filter(
        (vaccine) => {
          const selected =
            extraSelections.some(
              (item) =>
                item.vaccineId ===
                vaccine.id
            );

          const alreadyOnRequest =
            items.some(
              (item) =>
                item.vaccineId ===
                vaccine.id
            );

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

          const matchesStock =
            stockFilter ===
              'TODAS' ||
            (
              stockFilter ===
                'DISPONIVEIS' &&
              vaccine.stock > 0
            ) ||
            (
              stockFilter ===
                'SEM_ESTOQUE' &&
              vaccine.stock <= 0
            ) ||
            (
              stockFilter ===
                'SELECIONADAS' &&
              selected
            );

          return (
            vaccine.active &&
            !alreadyOnRequest &&
            matchesSearch &&
            matchesCategory &&
            matchesStock
          );
        }
      );
    }, [
      vaccines,
      searchTerm,
      categoryFilter,
      stockFilter,
      extraSelections,
      items,
    ]);

  /* =======================================================
     DOSES AUTORIZADAS
  ======================================================= */

  const updateAuthorized = (
    id: string,
    value: number
  ) => {
    setItems(
      (previous) =>
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

            const maximum =
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
                    value || 0,
                    maximum
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
    setItems(
      (previous) =>
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
    setItems(
      (previous) =>
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
    setItems(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  /* =======================================================
     SELEÇÃO DE VÁRIAS VACINAS
  ======================================================= */

  const toggleExtraVaccine = (
    vaccineId: string,
    vaccineName: string
  ) => {
    const exists =
      extraSelections.some(
        (item) =>
          item.vaccineId ===
          vaccineId
      );

    if (exists) {
      setExtraSelections(
        (previous) =>
          previous.filter(
            (item) =>
              item.vaccineId !==
              vaccineId
          )
      );

      return;
    }

    setExtraSelections(
      (previous) => [
        ...previous,
        {
          vaccineId,
          vaccineName,
          doses: 1,
        },
      ]
    );
  };

  const updateExtraDose = (
    vaccineId: string,
    value: number
  ) => {
    const stock =
      getStockByVaccine(
        vaccineId
      );

    setExtraSelections(
      (previous) =>
        previous.map(
          (item) =>
            item.vaccineId ===
              vaccineId
              ? {
                  ...item,

                  doses:
                    Math.max(
                      1,
                      Math.min(
                        value || 1,
                        stock
                      )
                    ),
                }
              : item
        )
    );
  };

  const removeExtraSelection = (
    vaccineId: string
  ) => {
    setExtraSelections(
      (previous) =>
        previous.filter(
          (item) =>
            item.vaccineId !==
            vaccineId
        )
    );
  };

  const openCatalog = () => {
    setSearchTerm('');
    setCategoryFilter('TODAS');
    setStockFilter('DISPONIVEIS');
    setExtraSelections([]);
    setShowCatalog(true);
  };

  const closeCatalog = () => {
    setExtraSelections([]);
    setShowCatalog(false);
  };
    /* =======================================================
     ADICIONAR VACINAS EXTRAS
  ======================================================= */

  const confirmExtraVaccines = () => {
    if (
      extraSelections.length ===
      0
    ) {
      alert(
        'Selecione pelo menos uma vacina.'
      );

      return;
    }

    for (
      const selection of
      extraSelections
    ) {
      const available =
        getStockByVaccine(
          selection.vaccineId
        );

      if (
        selection.doses >
        available
      ) {
        alert(
          `Estoque insuficiente para ${selection.vaccineName}.`
        );

        return;
      }
    }

    const timestamp =
      Date.now();

    const newItems:
      DraftItem[] =
      extraSelections.map(
        (
          selection,
          index
        ) => ({
          id:
            `extra-${timestamp}-${index}`,

          vaccineId:
            selection.vaccineId,

          vaccineName:
            selection.vaccineName,

          localStockReported:
            0,

          requestedQuantity:
            0,

          centralStock:
            getStockByVaccine(
              selection.vaccineId
            ),

          authorizedQuantity:
            selection.doses,

          addedByCentral:
            true,
        })
      );

    setItems(
      (previous) => [
        ...previous,
        ...newItems,
      ]
    );

    setExtraSelections([]);
    setShowCatalog(false);
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

  /* =======================================================
     REJEITAR SOLICITAÇÃO
  ======================================================= */

  const rejectRequest = () => {
    if (!request) {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          REQUESTS_STORAGE_KEY
        );

      const storedRequests:
        StoredRequest[] =
        saved
          ? JSON.parse(saved)
          : [];

      const exists =
        storedRequests.some(
          (item) =>
            item.protocol ===
            request.protocol
        );

      let updatedRequests:
        StoredRequest[];

      if (exists) {
        updatedRequests =
          storedRequests.map(
            (item) =>
              item.protocol ===
                request.protocol
                ? {
                    ...item,

                    status:
                      'REJEITADO',

                    rejectedAt:
                      new Date()
                        .toISOString(),
                  }
                : item
          );
      } else {
        updatedRequests = [
          {
            ...request,

            status:
              'REJEITADO',

            rejectedAt:
              new Date()
                .toISOString(),
          },

          ...storedRequests,
        ];
      }

      localStorage.setItem(
        REQUESTS_STORAGE_KEY,
        JSON.stringify(
          updatedRequests
        )
      );

      setShowRejectConfirm(
        false
      );

      /*
       * Depois de rejeitar não volta
       * para a solicitação.
       *
       * Vai direto para o Histórico.
       */
      navigate(
        '/app/historico'
      );
    } catch {
      alert(
        'Não foi possível rejeitar a solicitação.'
      );
    }
  };

  /* =======================================================
     VALIDAÇÃO DA AUTORIZAÇÃO
  ======================================================= */

  const validateAuthorization =
    () => {
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
          item.authorizedQuantity >
          available
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
     AUTORIZAR - FEFO
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
              id:
                `mov-${Date.now()}-${item.id}-${currentLot.id}`,

              type:
                'SAIDA',

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
     SOLICITAÇÃO NÃO ENCONTRADA
  ======================================================= */

  if (!request) {
    return (
      <Card className="mx-auto max-w-2xl rounded-3xl p-8">

        <h1 className="text-2xl font-black">
          Solicitação não encontrada
        </h1>

        <Button
          className="mt-6"
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

          <CheckCircle2
            size={48}
            className="mx-auto text-emerald-600"
          />

          <h1 className="mt-5 text-3xl font-black">
            Solicitação autorizada
          </h1>

          <p className="mt-2 text-slate-500">
            As doses foram retiradas automaticamente do estoque.
          </p>

        </div>

        <div className="mt-8 flex justify-center gap-3">

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

      <Card className="rounded-3xl p-7">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-black">
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
            onClick={
              openCatalog
            }
          >
            <Plus
              size={17}
              className="mr-2"
            />

            Adicionar vacinas
          </Button>

        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">
              Solicitação
            </p>

            <p className="mt-2 font-black">
              {request.protocol}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">
              Unidade
            </p>

            <p className="mt-2 font-black">
              {request.unitName}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">
              Solicitante
            </p>

            <p className="mt-2 font-black">
              {request.requesterName}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-400">
              Data
            </p>

            <p className="mt-2 font-black">
              {request.createdAt}
            </p>
          </div>

        </div>

      </Card>

      {/* FEFO */}

      <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <Package
          size={22}
          className="shrink-0 text-blue-600"
        />

        <div>

          <p className="font-bold text-blue-800">
            Seleção automática de lotes
          </p>

          <p className="mt-1 text-sm text-blue-600">
            O sistema utiliza primeiro o lote válido com vencimento mais próximo.
          </p>

        </div>

      </div>

      {/* ITENS */}

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

            return (
              <Card
                key={item.id}
                className="rounded-3xl p-6"
              >

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                      <Syringe
                        size={27}
                      />

                    </div>

                    <div>

                      <h2 className="text-xl font-black">
                        {item.vaccineName}
                      </h2>

                      {item.addedByCentral && (
                        <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          Adicionada pela Central
                        </span>
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
                      />
                    </Button>
                  )}

                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Estoque unidade
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {item.localStockReported}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs text-amber-500">
                      Solicitado
                    </p>

                    <p className="mt-2 text-2xl font-black text-amber-700">
                      {item.requestedQuantity}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs text-blue-500">
                      Estoque Central
                    </p>

                    <p className="mt-2 text-2xl font-black text-blue-700">
                      {available}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-500">
                      Próximo lote
                    </p>

                    <p className="mt-2 font-black text-emerald-700">
                      {nextLot
                        ? nextLot.lotNumber
                        : 'Sem lote'}
                    </p>
                  </div>

                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-bold">
                      Doses autorizadas
                    </label>

                    <div className="flex gap-2">

                      <input
                        type="number"
                        min={0}
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
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold"
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

                    <label className="mb-2 block text-sm font-bold">
                      Observação
                    </label>

                    <input
                      value={
                        item.notes ?? ''
                      }
                      onChange={(event) =>
                        updateNotes(
                          item.id,
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    />

                  </div>

                </div>

              </Card>
            );
          }
        )}

      </div>

      {/* BOTÕES */}

      <Card className="rounded-3xl p-7">

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() =>
              setShowRejectConfirm(
                true
              )
            }
          >
            <XCircle
              size={17}
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

      {/* REJEITAR */}

      {showRejectConfirm && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="w-full max-w-md rounded-3xl p-7">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">

              <XCircle
                size={28}
              />

            </div>

            <h2 className="mt-5 text-2xl font-black">
              Rejeitar solicitação?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              A solicitação será retirada da lista ativa e ficará disponível somente no Histórico.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">

              <p className="text-sm">
                <strong>Solicitação:</strong>{' '}
                {request.protocol}
              </p>

              <p className="mt-2 text-sm">
                <strong>Unidade:</strong>{' '}
                {request.unitName}
              </p>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  setShowRejectConfirm(
                    false
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={
                  rejectRequest
                }
              >
                Confirmar rejeição
              </Button>

            </div>

          </Card>

        </div>
      )}

      {/* CATÁLOGO */}

      {showCatalog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl p-0">

            <div className="border-b border-slate-200 p-6">

              <div className="flex justify-between">

                <div>

                  <h2 className="text-2xl font-black">
                    Adicionar vacinas
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecione todas, informe as doses e confirme no final.
                  </p>

                </div>

                <Button
                  variant="outline"
                  onClick={
                    closeCatalog
                  }
                >
                  <X size={17} />
                </Button>

              </div>

              <div className="mt-5 flex gap-3">

                <div className="relative flex-1">

                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />

                  <input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Buscar vacina..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4"
                  />

                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target
                        .value as
                        | 'TODAS'
                        | VaccineCategory
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4"
                >

                  <option value="TODAS">
                    Todas as categorias
                  </option>

                  {vaccineCategories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                {[
                  ['TODAS', 'Todas'],
                  ['DISPONIVEIS', 'Disponíveis'],
                  ['SEM_ESTOQUE', 'Sem estoque'],
                  [
                    'SELECIONADAS',
                    `Selecionadas (${extraSelections.length})`,
                  ],
                ].map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setStockFilter(
                          value as StockFilter
                        )
                      }
                      className={`rounded-full px-4 py-2 text-sm font-bold ${
                        stockFilter ===
                        value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}

              </div>

            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_380px]">

              <div className="overflow-y-auto p-6">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {visibleVaccines.map(
                    (vaccine) => {
                      const selected =
                        extraSelections.some(
                          (item) =>
                            item.vaccineId ===
                            vaccine.id
                        );

                      return (
                        <button
                          key={vaccine.id}
                          type="button"
                          disabled={
                            vaccine.stock <= 0
                          }
                          onClick={() =>
                            toggleExtraVaccine(
                              vaccine.id,
                              vaccine.name
                            )
                          }
                          className={`relative rounded-2xl border p-4 text-left ${
                            selected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200'
                          }`}
                        >

                          {selected && (
                            <Check className="absolute right-4 top-4 text-blue-600" />
                          )}

                          <h3 className="font-black">
                            {vaccine.name}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            Estoque: {vaccine.stock} doses
                          </p>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              <div className="overflow-y-auto border-l border-slate-200 bg-slate-50 p-5">

                <h3 className="font-black">
                  Selecionadas
                </h3>

                <div className="mt-4 space-y-3">

                  {extraSelections.map(
                    (selection) => (
                      <div
                        key={
                          selection.vaccineId
                        }
                        className="rounded-2xl bg-white p-4"
                      >

                        <div className="flex justify-between">

                          <strong>
                            {selection.vaccineName}
                          </strong>

                          <button
                            onClick={() =>
                              removeExtraSelection(
                                selection.vaccineId
                              )
                            }
                          >
                            <Trash2
                              size={16}
                              className="text-red-500"
                            />
                          </button>

                        </div>

                        <input
                          type="number"
                          min={1}
                          value={
                            selection.doses
                          }
                          onChange={(event) =>
                            updateExtraDose(
                              selection.vaccineId,
                              Number(
                                event.target.value
                              )
                            )
                          }
                          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2"
                        />

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t p-5">

              <Button
                variant="outline"
                onClick={
                  closeCatalog
                }
              >
                Cancelar
              </Button>

              <Button
                disabled={
                  extraSelections.length ===
                  0
                }
                onClick={
                  confirmExtraVaccines
                }
              >
                Adicionar {
                  extraSelections.length
                } vacinas
              </Button>

            </div>

          </Card>

        </div>
      )}

      {/* CONFIRMAR AUTORIZAÇÃO */}

      {showConfirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="w-full max-w-md rounded-3xl p-7">

            <h2 className="text-2xl font-black">
              Confirmar autorização?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              O estoque será atualizado automaticamente.
            </p>

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