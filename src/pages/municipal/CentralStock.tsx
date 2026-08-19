import {
  ChangeEvent,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Search,
  Package,
  Syringe,
  ImagePlus,
  Pencil,
  Power,
  X,
  Save,
  Plus,
  Trash2,
  CalendarDays,
  Boxes,
} from 'lucide-react';

import {
  Card,
  Button,
  Badge,
} from '../../components/ui';

import {
  vaccineCatalog,
  VaccineCatalogItem,
  VaccineCategory,
  vaccineCategories,
} from '../../data/vaccineCatalog';

/* =========================================================
   TIPOS
========================================================= */

type TabKey =
  | 'GERAL'
  | 'VACINAS'
  | 'ENTRADAS'
  | 'LOTES'
  | 'MOVIMENTACOES';

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

type LotStatus =
  | 'ATIVO'
  | 'ATENCAO'
  | 'VENCIDO';

type StockLot = {
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
   LOCAL STORAGE
========================================================= */

const VACCINE_STORAGE_KEY =
  'imuniza-vaccine-overrides';

const LOTS_STORAGE_KEY =
  'imuniza-central-lots';

const MOVEMENTS_STORAGE_KEY =
  'imuniza-central-movements';
/* =========================================================
   LOTES DEMONSTRATIVOS
========================================================= */

const DEFAULT_LOTS: StockLot[] = [
  {
    id: 'lot-001',
    vaccineId: 'bcg',
    lotNumber: '0375MA047',
    expirationDate: '2027-12-15',
    doses: 500,
  },

  {
    id: 'lot-002',
    vaccineId: 'bcg',
    lotNumber: '0375MA052',
    expirationDate: '2028-03-20',
    doses: 350,
  },

  {
    id: 'lot-003',
    vaccineId: 'influenza',
    lotNumber: '2601400',
    expirationDate: '2026-09-30',
    doses: 700,
  },

  {
    id: 'lot-004',
    vaccineId: 'pentavalente',
    lotNumber: '2855Y005D',
    expirationDate: '2027-09-20',
    doses: 700,
  },

  {
    id: 'lot-005',
    vaccineId: 'vip',
    lotNumber: 'Y3F76D1',
    expirationDate: '2027-03-10',
    doses: 420,
  },
];

/* =========================================================
   FUNÇÕES
========================================================= */

const loadVaccineOverrides =
  (): VaccineOverrides => {
    try {
      const saved =
        localStorage.getItem(
          VACCINE_STORAGE_KEY
        );

      if (!saved) {
        return {};
      }

      return JSON.parse(saved);
    } catch {
      return {};
    }
  };

const loadLots =
  (): StockLot[] => {
    try {
      const saved =
        localStorage.getItem(
          LOTS_STORAGE_KEY
        );

      if (!saved) {
        return DEFAULT_LOTS;
      }

      return JSON.parse(saved);
    } catch {
      return DEFAULT_LOTS;
    }
  };
const loadMovements = (): StockMovement[] => {
  try {
    const saved = localStorage.getItem(
      MOVEMENTS_STORAGE_KEY
    );

    if (!saved) {
      return [];
    }

    return JSON.parse(saved);
  } catch {
    return [];
  }
};

const resizeImage = (
  file: File
): Promise<string> => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        const image =
          new Image();

        image.onload = () => {
          const maxWidth = 600;

          const scale =
            image.width > maxWidth
              ? maxWidth /
                image.width
              : 1;

          const canvas =
            document.createElement(
              'canvas'
            );

          canvas.width =
            image.width * scale;

          canvas.height =
            image.height * scale;

          const context =
            canvas.getContext(
              '2d'
            );

          if (!context) {
            reject(
              new Error(
                'Erro ao processar imagem.'
              )
            );

            return;
          }

          context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          resolve(
            canvas.toDataURL(
              'image/jpeg',
              0.78
            )
          );
        };

        image.src =
          String(
            reader.result
          );
      };

      reader.onerror = () =>
        reject(
          new Error(
            'Erro ao carregar imagem.'
          )
        );

      reader.readAsDataURL(
        file
      );
    }
  );
};

const formatDate = (
  value: string
) => {
  if (!value) {
    return '-';
  }

  const [
    year,
    month,
    day,
  ] = value.split('-');

  return `${day}/${month}/${year}`;
};

const getLotStatus = (
  expirationDate: string
): LotStatus => {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const expiration =
    new Date(
      `${expirationDate}T00:00:00`
    );

  if (
    expiration <
    today
  ) {
    return 'VENCIDO';
  }

  const diff =
    expiration.getTime() -
    today.getTime();

  const days =
    diff /
    (
      1000 *
      60 *
      60 *
      24
    );

  if (
    days <= 90
  ) {
    return 'ATENCAO';
  }

  return 'ATIVO';
};

/* =========================================================
   COMPONENTE
========================================================= */

export const CentralStock = () => {
  const navigate =
    useNavigate();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabKey>(
      'GERAL'
    );

  /* =======================================================
     VACINAS
  ======================================================= */

  const [
    vaccineSearch,
    setVaccineSearch,
  ] =
    useState('');

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState<
      'TODAS' |
      VaccineCategory
    >('TODAS');

  const [
    overrides,
    setOverrides,
  ] =
    useState<VaccineOverrides>(
      loadVaccineOverrides
    );

  const [
    selectedVaccine,
    setSelectedVaccine,
  ] =
    useState<VaccineCatalogItem | null>(
      null
    );

  const [
    editName,
    setEditName,
  ] =
    useState('');

  const [
    editCategory,
    setEditCategory,
  ] =
    useState<VaccineCategory>(
      'Rotina'
    );

  const [
    editImage,
    setEditImage,
  ] =
    useState('');

  const [
    editActive,
    setEditActive,
  ] =
    useState(true);

  /* =======================================================
     LOTES
  ======================================================= */

  const [
    lots,
    setLots,
  ] =
    useState<StockLot[]>(
      loadLots
    );

const [
  movements,
  setMovements,
] = useState<StockMovement[]>(
  loadMovements
);

  const [
    lotSearch,
    setLotSearch,
  ] =
    useState('');

  const [
    showLotModal,
    setShowLotModal,
  ] =
    useState(false);

  const [
    editingLot,
    setEditingLot,
  ] =
    useState<StockLot | null>(
      null
    );

  const [
    lotVaccineId,
    setLotVaccineId,
  ] =
    useState('');

  const [
    lotNumber,
    setLotNumber,
  ] =
    useState('');

  const [
    lotExpirationDate,
    setLotExpirationDate,
  ] =
    useState('');

  const [
    lotDoses,
    setLotDoses,
  ] =
    useState(0);

  /* =======================================================
     VACINAS COM ALTERAÇÕES
  ======================================================= */

  const vaccines =
    useMemo(() => {
      return vaccineCatalog.map(
        (vaccine) => ({
          ...vaccine,

          ...overrides[
            vaccine.id
          ],
        })
      );
    }, [overrides]);

  /* =======================================================
     DOSES POR VACINA
  ======================================================= */

  const getVaccineDoses = (
    vaccineId: string
  ) => {
    return lots
      .filter(
        (lot) =>
          lot.vaccineId ===
            vaccineId &&
          getLotStatus(
            lot.expirationDate
          ) !== 'VENCIDO'
      )
      .reduce(
        (
          total,
          lot
        ) =>
          total +
          lot.doses,
        0
      );
  };

  /* =======================================================
     VACINAS FILTRADAS
  ======================================================= */

  const filteredVaccines =
    useMemo(() => {
      const term =
        vaccineSearch
          .trim()
          .toLowerCase();

      return vaccines.filter(
        (vaccine) => {
          const
            matchesSearch =
              !term ||
              vaccine.name
                .toLowerCase()
                .includes(term);

          const
            matchesCategory =
              categoryFilter ===
                'TODAS' ||
              vaccine.category ===
                categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      vaccines,
      vaccineSearch,
      categoryFilter,
    ]);

  /* =======================================================
     LOTES FILTRADOS
  ======================================================= */

  const filteredLots =
    useMemo(() => {
      const term =
        lotSearch
          .trim()
          .toLowerCase();

      return lots.filter(
        (lot) => {
          const vaccine =
            vaccines.find(
              (item) =>
                item.id ===
                lot.vaccineId
            );

          return (
            !term ||
            lot.lotNumber
              .toLowerCase()
              .includes(term) ||
            vaccine?.name
              .toLowerCase()
              .includes(term)
          );
        }
      );
    }, [
      lots,
      lotSearch,
      vaccines,
    ]);

  /* =======================================================
     INDICADORES
  ======================================================= */

  const totalVaccines =
    vaccines.length;

  const activeVaccines =
    vaccines.filter(
      (vaccine) =>
        vaccine.active
    ).length;

  const totalDoses =
    lots
      .filter(
        (lot) =>
          getLotStatus(
            lot.expirationDate
          ) !==
          'VENCIDO'
      )
      .reduce(
        (
          total,
          lot
        ) =>
          total +
          lot.doses,
        0
      );

  const activeLots =
    lots.filter(
      (lot) =>
        getLotStatus(
          lot.expirationDate
        ) ===
        'ATIVO'
    ).length;

  const alertLots =
    lots.filter(
      (lot) =>
        getLotStatus(
          lot.expirationDate
        ) ===
        'ATENCAO'
    ).length;

  const expiredLots =
    lots.filter(
      (lot) =>
        getLotStatus(
          lot.expirationDate
        ) ===
        'VENCIDO'
    ).length;

  /* =======================================================
     SALVAR OVERRIDES
  ======================================================= */

  const saveOverrides = (
    value:
      VaccineOverrides
  ) => {
    setOverrides(
      value
    );

    localStorage.setItem(
      VACCINE_STORAGE_KEY,
      JSON.stringify(
        value
      )
    );
  };

  /* =======================================================
     FOTO
  ======================================================= */

  const handlePhoto =
    async (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          'image/'
        )
      ) {
        alert(
          'Selecione uma imagem.'
        );

        return;
      }

      try {
        const result =
          await resizeImage(
            file
          );

        setEditImage(
          result
        );
      } catch {
        alert(
          'Não foi possível carregar a foto.'
        );
      }
    };

  /* =======================================================
     EDITAR VACINA
  ======================================================= */

  const openVaccineEdit = (
    vaccine:
      VaccineCatalogItem
  ) => {
    setSelectedVaccine(
      vaccine
    );

    setEditName(
      vaccine.name
    );

    setEditCategory(
      vaccine.category
    );

    setEditImage(
      vaccine.imageUrl ||
        ''
    );

    setEditActive(
      vaccine.active
    );
  };

  const saveVaccine = () => {
    if (
      !selectedVaccine
    ) {
      return;
    }

    if (
      !editName.trim()
    ) {
      alert(
        'Informe o nome da vacina.'
      );

      return;
    }

    const updated = {
      ...overrides,

      [
        selectedVaccine.id
      ]: {
        ...overrides[
          selectedVaccine.id
        ],

        name:
          editName.trim(),

        category:
          editCategory,

        imageUrl:
          editImage,

        active:
          editActive,
      },
    };

    saveOverrides(
      updated
    );

    setSelectedVaccine(
      null
    );
  };

  const toggleVaccine = (
    vaccine:
      VaccineCatalogItem
  ) => {
    const updated = {
      ...overrides,

      [
        vaccine.id
      ]: {
        ...overrides[
          vaccine.id
        ],

        active:
          !vaccine.active,
      },
    };

    saveOverrides(
      updated
    );
  };

  /* =======================================================
     NOVO LOTE
  ======================================================= */

  const openNewLot = () => {
    setEditingLot(
      null
    );

    setLotVaccineId(
      ''
    );

    setLotNumber(
      ''
    );

    setLotExpirationDate(
      ''
    );

    setLotDoses(
      0
    );

    setShowLotModal(
      true
    );
  };

  /* =======================================================
     EDITAR LOTE
  ======================================================= */

  const openEditLot = (
    lot: StockLot
  ) => {
    setEditingLot(
      lot
    );

    setLotVaccineId(
      lot.vaccineId
    );

    setLotNumber(
      lot.lotNumber
    );

    setLotExpirationDate(
      lot.expirationDate
    );

    setLotDoses(
      lot.doses
    );

    setShowLotModal(
      true
    );
  };

  /* =======================================================
     SALVAR LOTE
  ======================================================= */

 const saveLot = () => {
  if (!lotVaccineId) {
    alert('Selecione a vacina.');
    return;
  }

  if (!lotNumber.trim()) {
    alert('Informe o número do lote.');
    return;
  }

  if (!lotExpirationDate) {
    alert('Informe a validade.');
    return;
  }

  if (lotDoses <= 0) {
    alert('Informe um número de doses maior que zero.');
    return;
  }

  let updatedLots: StockLot[];

  if (editingLot) {
    updatedLots = lots.map((lot) =>
      lot.id === editingLot.id
        ? {
            ...lot,
            vaccineId: lotVaccineId,
            lotNumber: lotNumber.trim(),
            expirationDate: lotExpirationDate,
            doses: lotDoses,
          }
        : lot
    );
  } else {
    const existingLot = lots.find(
      (lot) =>
        lot.vaccineId === lotVaccineId &&
        lot.lotNumber.toLowerCase() ===
          lotNumber.trim().toLowerCase()
    );

    if (existingLot) {
      updatedLots = lots.map((lot) =>
        lot.id === existingLot.id
          ? {
              ...lot,
              doses: lot.doses + lotDoses,
              expirationDate: lotExpirationDate,
            }
          : lot
      );
    } else {
      const newLot: StockLot = {
        id: `lot-${Date.now()}`,
        vaccineId: lotVaccineId,
        lotNumber: lotNumber.trim(),
        expirationDate: lotExpirationDate,
        doses: lotDoses,
      };

      updatedLots = [
        ...lots,
        newLot,
      ];
    }

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      type: 'ENTRADA',
      vaccineId: lotVaccineId,
      lotNumber: lotNumber.trim(),
      doses: lotDoses,
      date: new Date().toISOString(),
      description: 'Entrada no Estoque Central',
    };

    const updatedMovements = [
      newMovement,
      ...movements,
    ];

    setMovements(updatedMovements);

    localStorage.setItem(
      MOVEMENTS_STORAGE_KEY,
      JSON.stringify(updatedMovements)
    );
  }

  setLots(updatedLots);

  localStorage.setItem(
    LOTS_STORAGE_KEY,
    JSON.stringify(updatedLots)
  );

  setShowLotModal(false);

  setEditingLot(null);
  setLotVaccineId('');
  setLotNumber('');
  setLotExpirationDate('');
  setLotDoses(0);
};

  /* =======================================================
     EXCLUIR LOTE
  ======================================================= */

  const deleteLot = (
    lotId: string
  ) => {
    const confirmed =
      window.confirm(
        'Deseja realmente excluir este lote?'
      );

    if (
      !confirmed
    ) {
      return;
    }

    const updated =
      lots.filter(
        (lot) =>
          lot.id !== lotId
      );

    setLots(
      updated
    );

    localStorage.setItem(
      LOTS_STORAGE_KEY,
      JSON.stringify(
        updated
      )
    );
  };

  /* =======================================================
     STATUS BADGE
  ======================================================= */

  const lotBadge = (
    status:
      LotStatus
  ) => {
    if (
      status ===
      'ATIVO'
    ) {
      return (
        <Badge status="ACTIVE">
          Ativo
        </Badge>
      );
    }

    if (
      status ===
      'ATENCAO'
    ) {
      return (
        <Badge status="PENDING">
          Atenção
        </Badge>
      );
    }

    return (
      <Badge status="INACTIVE">
        Vencido
      </Badge>
    );
  };

  /* =======================================================
     ABAS
  ======================================================= */

  const tabs = [
    {
      key: 'GERAL',
      label:
        'Visão geral',
    },

    {
      key: 'VACINAS',
      label:
        'Vacinas',
    },

    {
      key: 'ENTRADAS',
      label:
        'Entradas',
    },

    {
      key: 'LOTES',
      label:
        'Lotes',
    },

    {
      key:
        'MOVIMENTACOES',
      label:
        'Movimentações',
    },
  ] as const;

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* CABEÇALHO */}

      <header>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/app'
            )
          }
          className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
        >
          <ArrowLeft
            size={16}
          />

          Voltar ao menu
        </button>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Estoque Central
        </h1>

        <p className="mt-1 text-slate-500">
          Controle de vacinas, doses, lotes e movimentações da Central de Imunização.
        </p>

      </header>

      {/* ABAS */}

      <Card className="p-2">

        <div className="flex gap-2 overflow-x-auto">

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
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition ${
                  activeTab ===
                  tab.key
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {
                  tab.label
                }
              </button>
            )
          )}

        </div>

      </Card>

      {/* =====================================================
          VISÃO GERAL
      ===================================================== */}

      {activeTab ===
        'GERAL' && (
        <>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <Card>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Vacinas ativas
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {
                      activeVaccines
                    }
                  </p>

                </div>

                <Syringe
                  size={28}
                  className="text-brand-600"
                />

              </div>

            </Card>

            <Card>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Doses em estoque
                  </p>

                  <p className="mt-2 text-3xl font-bold text-brand-600">
                    {totalDoses.toLocaleString(
                      'pt-BR'
                    )}
                  </p>

                </div>

                <Package
                  size={28}
                  className="text-brand-600"
                />

              </div>

            </Card>

            <Card>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Lotes ativos
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {
                      activeLots
                    }
                  </p>

                </div>

                <Boxes
                  size={28}
                  className="text-emerald-600"
                />

              </div>

            </Card>

            <Card>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Lotes em atenção
                  </p>

                  <p className="mt-2 text-3xl font-bold text-amber-600">
                    {
                      alertLots
                    }
                  </p>

                </div>

                <CalendarDays
                  size={28}
                  className="text-amber-600"
                />

              </div>

            </Card>

          </section>

          {expiredLots >
            0 && (
            <Card>

              <p className="font-bold text-red-600">
                {expiredLots}{' '}
                lote(s) vencido(s)
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Consulte a aba Lotes para verificar os itens vencidos.
              </p>

            </Card>
          )}

        </>
      )}

      {/* =====================================================
          VACINAS
      ===================================================== */}

      {activeTab ===
        'VACINAS' && (
        <>

          <div>

            <h2 className="text-xl font-bold">
              Vacinas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Gerencie foto, nome, categoria e situação das vacinas.
            </p>

          </div>

          <Card>

            <div className="flex flex-col gap-3 md:flex-row">

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-3 top-2.5 text-slate-400"
                />

                <input
                  value={
                    vaccineSearch
                  }
                  onChange={(
                    event
                  ) =>
                    setVaccineSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Buscar vacina..."
                  className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 outline-none dark:border-slate-700"
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

          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredVaccines.map(
              (vaccine) => {

                const doses =
                  getVaccineDoses(
                    vaccine.id
                  );

                return (
                  <Card
                    key={
                      vaccine.id
                    }
                    className={
                      vaccine.active
                        ? ''
                        : 'opacity-60'
                    }
                  >

                    <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">

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
                            size={40}
                            className="mx-auto"
                          />

                          <p className="mt-2 text-xs">
                            Sem foto
                          </p>

                        </div>
                      )}

                    </div>

                    <div className="mt-4">

                      <div className="flex items-start justify-between gap-2">

                        <div>

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

                        </div>

                        <Badge
                          status={
                            vaccine.active
                              ? 'ACTIVE'
                              : 'INACTIVE'
                          }
                        >
                          {vaccine.active
                            ? 'Ativa'
                            : 'Inativa'}
                        </Badge>

                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">

                        <p className="text-xs text-slate-500">
                          Doses em estoque
                        </p>

                        <p className="mt-1 text-2xl font-bold text-brand-600">
                          {doses.toLocaleString(
                            'pt-BR'
                          )}
                        </p>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">

                        <Button
                          variant="outline"
                          onClick={() =>
                            openVaccineEdit(
                              vaccine
                            )
                          }
                        >
                          <Pencil
                            size={14}
                            className="mr-2"
                          />

                          Editar
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() =>
                            toggleVaccine(
                              vaccine
                            )
                          }
                        >
                          <Power
                            size={14}
                            className="mr-2"
                          />

                          {vaccine.active
                            ? 'Inativar'
                            : 'Ativar'}
                        </Button>

                      </div>

                    </div>

                  </Card>
                );
              }
            )}

          </div>

        </>
      )}

      {/* =====================================================
          LOTES
      ===================================================== */}

      {activeTab ===
        'LOTES' && (
        <>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <h2 className="text-xl font-bold">
                Lotes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Controle os lotes, validade e doses disponíveis.
              </p>

            </div>

            <Button
              onClick={
                openNewLot
              }
            >
              <Plus
                size={16}
                className="mr-2"
              />

              Novo lote
            </Button>

          </div>

          <Card>

            <div className="relative max-w-lg">

              <Search
                size={18}
                className="absolute left-3 top-2.5 text-slate-400"
              />

              <input
                value={
                  lotSearch
                }
                onChange={(
                  event
                ) =>
                  setLotSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Buscar vacina ou lote..."
                className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 outline-none dark:border-slate-700"
              />

            </div>

          </Card>

          <Card className="overflow-hidden p-0">

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
                      Validade
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Doses
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                      Situação
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {filteredLots.map(
                    (lot) => {

                      const vaccine =
                        vaccines.find(
                          (item) =>
                            item.id ===
                            lot.vaccineId
                        );

                      const status =
                        getLotStatus(
                          lot.expirationDate
                        );

                      return (
                        <tr
                          key={
                            lot.id
                          }
                        >

                          <td className="px-5 py-4 font-semibold">
                            {vaccine?.name ||
                              'Vacina não encontrada'}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {
                              lot.lotNumber
                            }
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatDate(
                              lot.expirationDate
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-brand-600">
                            {lot.doses.toLocaleString(
                              'pt-BR'
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {lotBadge(
                              status
                            )}
                          </td>

                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <Button
                                variant="outline"
                                onClick={() =>
                                  openEditLot(
                                    lot
                                  )
                                }
                              >
                                <Pencil
                                  size={14}
                                />
                              </Button>

                              <Button
                                variant="outline"
                                className="text-red-600"
                                onClick={() =>
                                  deleteLot(
                                    lot.id
                                  )
                                }
                              >
                                <Trash2
                                  size={14}
                                />
                              </Button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </Card>

        </>
      )}

      {/* =====================================================
          ENTRADAS
      ===================================================== */}

      {activeTab === 'ENTRADAS' && (
  <>
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-xl font-bold">
          Entradas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Registre o recebimento de vacinas na Central de Imunização.
        </p>
      </div>

      <Button
        onClick={() => {
          setEditingLot(null);
          setLotVaccineId('');
          setLotNumber('');
          setLotExpirationDate('');
          setLotDoses(0);
          setShowLotModal(true);
        }}
      >
        <Plus
          size={16}
          className="mr-2"
        />

        Nova entrada
      </Button>
    </div>

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm text-slate-500">
          Doses em estoque
        </p>

        <p className="mt-2 text-3xl font-bold text-brand-600">
          {totalDoses.toLocaleString('pt-BR')}
        </p>
      </Card>

      <Card>
        <p className="text-sm text-slate-500">
          Lotes cadastrados
        </p>

        <p className="mt-2 text-3xl font-bold">
          {lots.length}
        </p>
      </Card>

      <Card>
        <p className="text-sm text-slate-500">
          Vacinas ativas
        </p>

        <p className="mt-2 text-3xl font-bold text-emerald-600">
          {activeVaccines}
        </p>
      </Card>
    </section>

    <Card>
      <h3 className="text-lg font-bold">
        Como funciona
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Ao registrar uma nova entrada, informe a vacina, o lote,
        a validade e o número de doses recebidas.
      </p>

      <p className="mt-2 text-sm text-slate-500">
        Se o lote já existir, futuramente o sistema irá somar as doses
        ao lote existente. Se for um lote novo, ele será cadastrado
        automaticamente.
      </p>
    </Card>
  </>
)}

      {/* =====================================================
          MOVIMENTAÇÕES
      ===================================================== */}

     {activeTab === 'MOVIMENTACOES' && (
  <>
    <div>
      <h2 className="text-xl font-bold">
        Movimentações
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Histórico de entradas, saídas e ajustes do Estoque Central.
      </p>
    </div>

    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Data
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Tipo
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Vacina
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Lote
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                Doses
              </th>

              <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                Descrição
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {movements.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  Nenhuma movimentação registrada.
                </td>
              </tr>
            ) : (
              movements.map((movement) => {
                const vaccine = vaccines.find(
                  (item) => item.id === movement.vaccineId
                );

                return (
                  <tr key={movement.id}>
                    <td className="px-5 py-4 text-sm">
                      {new Date(
                        movement.date
                      ).toLocaleString('pt-BR')}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          movement.type === 'ENTRADA'
                            ? 'bg-emerald-100 text-emerald-700'
                            : movement.type === 'SAIDA'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {movement.type}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {vaccine?.name || 'Vacina não encontrada'}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {movement.lotNumber}
                    </td>

                    <td
                      className={`px-5 py-4 text-right font-bold ${
                        movement.type === 'ENTRADA'
                          ? 'text-emerald-600'
                          : movement.type === 'SAIDA'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {movement.type === 'ENTRADA'
                        ? '+'
                        : movement.type === 'SAIDA'
                        ? '-'
                        : ''}
                      {movement.doses.toLocaleString('pt-BR')}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {movement.description || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  </>
)}

      {/* =====================================================
          MODAL EDITAR VACINA
      ===================================================== */}

      {selectedVaccine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto">

            <div className="flex items-start justify-between">

              <h2 className="text-xl font-bold">
                Editar vacina
              </h2>

              <Button
                variant="ghost"
                onClick={() =>
                  setSelectedVaccine(
                    null
                  )
                }
              >
                <X
                  size={18}
                />
              </Button>

            </div>

            <div className="mt-5">

              <div className="flex h-52 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">

                {editImage ? (
                  <img
                    src={
                      editImage
                    }
                    alt=""
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <ImagePlus
                    size={42}
                    className="text-slate-400"
                  />
                )}

              </div>

              <label className="mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">

                <ImagePlus
                  size={16}
                  className="mr-2"
                />

                Trocar foto

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePhoto
                  }
                  className="hidden"
                />

              </label>

            </div>

            <div className="mt-5 space-y-4">

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Nome
                </label>

                <input
                  value={
                    editName
                  }
                  onChange={(
                    event
                  ) =>
                    setEditName(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-700"
                />

              </div>

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Categoria
                </label>

                <select
                  value={
                    editCategory
                  }
                  onChange={(
                    event
                  ) =>
                    setEditCategory(
                      event.target
                        .value as VaccineCategory
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                >

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

              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">

                <span className="font-semibold">
                  Vacina ativa
                </span>

                <input
                  type="checkbox"
                  checked={
                    editActive
                  }
                  onChange={(
                    event
                  ) =>
                    setEditActive(
                      event.target
                        .checked
                    )
                  }
                />

              </label>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  setSelectedVaccine(
                    null
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                onClick={
                  saveVaccine
                }
              >
                <Save
                  size={16}
                  className="mr-2"
                />

                Salvar
              </Button>

            </div>

          </Card>

        </div>
      )}

      {/* =====================================================
          MODAL NOVO / EDITAR LOTE
      ===================================================== */}

      {showLotModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="w-full max-w-lg">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {editingLot
                    ? 'Editar lote'
                    : 'Novo lote'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informe os dados do lote recebido.
                </p>

              </div>

              <Button
                variant="ghost"
                onClick={() =>
                  setShowLotModal(
                    false
                  )
                }
              >
                <X
                  size={18}
                />
              </Button>

            </div>

            <div className="mt-6 space-y-4">

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Vacina
                </label>

                <select
                  value={
                    lotVaccineId
                  }
                  onChange={(
                    event
                  ) =>
                    setLotVaccineId(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                >

                  <option value="">
                    Selecione...
                  </option>

                  {vaccines
                    .filter(
                      (vaccine) =>
                        vaccine.active
                    )
                    .map(
                      (
                        vaccine
                      ) => (
                        <option
                          key={
                            vaccine.id
                          }
                          value={
                            vaccine.id
                          }
                        >
                          {
                            vaccine.name
                          }
                        </option>
                      )
                    )}

                </select>

              </div>

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Número do lote
                </label>

                <input
                  value={
                    lotNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setLotNumber(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ex.: 0375MA047"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-700"
                />

              </div>

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Validade
                </label>

                <input
                  type="date"
                  value={
                    lotExpirationDate
                  }
                  onChange={(
                    event
                  ) =>
                    setLotExpirationDate(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-700"
                />

              </div>

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Doses
                </label>

                <input
                  type="number"
                  min={1}
                  value={
                    lotDoses
                  }
                  onChange={(
                    event
                  ) =>
                    setLotDoses(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-700"
                />

              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  setShowLotModal(
                    false
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                onClick={
                  saveLot
                }
              >
                <Save
                  size={16}
                  className="mr-2"
                />

                Salvar lote
              </Button>

            </div>

          </Card>

        </div>
      )}

    </div>
  );
};