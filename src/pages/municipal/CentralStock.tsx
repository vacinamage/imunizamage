import {
  ChangeEvent,
  useMemo,
  useState,
} from 'react';

import {
  Boxes,
  CalendarDays,
  Camera,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Syringe,
  Trash2,
  X,
} from 'lucide-react';

import {
  Badge,
  Button,
  Card,
} from '../../components/ui';

import {
  vaccineCatalog,
  VaccineCategory,
  vaccineCategories,
} from '../../data/vaccineCatalog';

/* =========================================================
   TIPOS
========================================================= */

type TabKey =
  | 'VACINAS'
  | 'MOVIMENTACOES';

type LotStatus =
  | 'ATIVO'
  | 'ATENCAO'
  | 'VENCIDO';

type AppVaccine = {
  id: string;
  name: string;
  category: VaccineCategory;
  imageUrl?: string;
  active: boolean;
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

type StockLot = {
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
  documentNumber?: string;
  doses: number;
  date: string;
  description?: string;
};

/* =========================================================
   STORAGE
========================================================= */

const VACCINE_STORAGE_KEY =
  'imuniza-vaccine-overrides';

const CUSTOM_VACCINES_STORAGE_KEY =
  'imuniza-custom-vaccines';

const LOTS_STORAGE_KEY =
  'imuniza-central-lots';

const MOVEMENTS_STORAGE_KEY =
  'imuniza-central-movements';

/* =========================================================
   LOTES INICIAIS
========================================================= */

const DEFAULT_LOTS: StockLot[] = [
  {
    id: 'lot-001',
    vaccineId: 'bcg',
    lotNumber: '0375MA047',
    documentNumber:
      'DOC-2026-001',
    expirationDate:
      '2027-12-15',
    doses: 500,
  },

  {
    id: 'lot-002',
    vaccineId: 'bcg',
    lotNumber: '0375MA052',
    documentNumber:
      'DOC-2026-002',
    expirationDate:
      '2028-03-20',
    doses: 350,
  },

  {
    id: 'lot-003',
    vaccineId: 'influenza',
    lotNumber: '2601400',
    documentNumber:
      'DOC-2026-003',
    expirationDate:
      '2026-09-30',
    doses: 700,
  },

  {
    id: 'lot-004',
    vaccineId: 'pentavalente',
    lotNumber: '2855Y005D',
    documentNumber:
      'DOC-2026-004',
    expirationDate:
      '2027-09-20',
    doses: 700,
  },

  {
    id: 'lot-005',
    vaccineId: 'vip',
    lotNumber: 'Y3F76D1',
    documentNumber:
      'DOC-2026-005',
    expirationDate:
      '2027-03-10',
    doses: 420,
  },
];

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

const loadCustomVaccines =
  (): AppVaccine[] => {
    try {
      const saved =
        localStorage.getItem(
          CUSTOM_VACCINES_STORAGE_KEY
        );

      if (!saved) {
        return [];
      }

      const parsed =
        JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  };

const loadLots =
  (): StockLot[] => {
    try {
      const saved =
        localStorage.getItem(
          LOTS_STORAGE_KEY
        );

      return saved
        ? JSON.parse(saved)
        : DEFAULT_LOTS;
    } catch {
      return DEFAULT_LOTS;
    }
  };

const loadMovements =
  (): StockMovement[] => {
    try {
      const saved =
        localStorage.getItem(
          MOVEMENTS_STORAGE_KEY
        );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  };

/* =========================================================
   IMAGEM
========================================================= */

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
          const maxWidth = 700;

          const scale =
            image.width >
            maxWidth
              ? maxWidth /
                image.width
              : 1;

          const canvas =
            document.createElement(
              'canvas'
            );

          canvas.width =
            image.width *
            scale;

          canvas.height =
            image.height *
            scale;

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
              0.8
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

/* =========================================================
   DATA / STATUS
========================================================= */

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

  const difference =
    expiration.getTime() -
    today.getTime();

  const days =
    difference /
    (
      1000 *
      60 *
      60 *
      24
    );

  if (days <= 90) {
    return 'ATENCAO';
  }

  return 'ATIVO';
};

/* =========================================================
   COMPONENTE
========================================================= */

export const CentralStock = () => {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabKey>(
      'VACINAS'
    );

  const [
    overrides,
    setOverrides,
  ] =
    useState<VaccineOverrides>(
      loadOverrides
    );

  const [
    customVaccines,
    setCustomVaccines,
  ] =
    useState<AppVaccine[]>(
      loadCustomVaccines
    );

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
  ] =
    useState<StockMovement[]>(
      loadMovements
    );

  /* =======================================================
     BUSCA
  ======================================================= */

  const [
    search,
    setSearch,
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

  /* =======================================================
     MODAL DE ENTRADA
  ======================================================= */

  const [
    showEntryModal,
    setShowEntryModal,
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
    documentNumber,
    setDocumentNumber,
  ] =
    useState('');

  const [
    expirationDate,
    setExpirationDate,
  ] =
    useState('');

  const [
    lotDoses,
    setLotDoses,
  ] =
    useState(0);

  /* =======================================================
     NOVA VACINA
  ======================================================= */

  const [
    isNewVaccine,
    setIsNewVaccine,
  ] =
    useState(false);

  const [
    newVaccineName,
    setNewVaccineName,
  ] =
    useState('');

  const [
    newVaccineCategory,
    setNewVaccineCategory,
  ] =
    useState<VaccineCategory>(
      'Rotina'
    );

  /* =======================================================
     EDITAR VACINA
  ======================================================= */

  const [
    selectedVaccine,
    setSelectedVaccine,
  ] =
    useState<AppVaccine | null>(
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
     CATÁLOGO COMPLETO
  ======================================================= */

  const vaccines =
    useMemo<AppVaccine[]>(
      () => {
        const originalVaccines:
          AppVaccine[] =
          vaccineCatalog.map(
            (vaccine) => ({
              id:
                vaccine.id,

              name:
                overrides[
                  vaccine.id
                ]?.name ??
                vaccine.name,

              category:
                overrides[
                  vaccine.id
                ]?.category ??
                vaccine.category,

              imageUrl:
                overrides[
                  vaccine.id
                ]?.imageUrl ??
                vaccine.imageUrl,

              active:
                overrides[
                  vaccine.id
                ]?.active ??
                vaccine.active,
            })
          );

        return [
          ...originalVaccines,
          ...customVaccines,
        ];
      },
      [
        overrides,
        customVaccines,
      ]
    );

  const activeVaccines =
    vaccines.filter(
      (vaccine) =>
        vaccine.active
    );

  /* =======================================================
     ESTOQUE
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
  };

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
     FILTRO
  ======================================================= */

  const filteredLots =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return lots
        .filter(
          (lot) => {
            const vaccine =
              vaccines.find(
                (item) =>
                  item.id ===
                  lot.vaccineId
              );

            const matchesSearch =
              !term ||
              lot.lotNumber
                .toLowerCase()
                .includes(term) ||
              lot.documentNumber
                ?.toLowerCase()
                .includes(term) ||
              vaccine?.name
                .toLowerCase()
                .includes(term);

            const matchesCategory =
              categoryFilter ===
                'TODAS' ||
              vaccine?.category ===
                categoryFilter;

            return (
              matchesSearch &&
              matchesCategory
            );
          }
        )
        .sort(
          (a, b) =>
            a.expirationDate.localeCompare(
              b.expirationDate
            )
        );
    }, [
      lots,
      search,
      vaccines,
      categoryFilter,
    ]);

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
        const resized =
          await resizeImage(
            file
          );

        setEditImage(
          resized
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
      AppVaccine
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

  /* =======================================================
     SALVAR VACINA
  ======================================================= */

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

    const isCustom =
      customVaccines.some(
        (vaccine) =>
          vaccine.id ===
          selectedVaccine.id
      );

    /* VACINA CRIADA MANUALMENTE */

    if (isCustom) {
      const updatedCustom =
        customVaccines.map(
          (vaccine) =>
            vaccine.id ===
              selectedVaccine.id
              ? {
                  ...vaccine,

                  name:
                    editName.trim(),

                  category:
                    editCategory,

                  imageUrl:
                    editImage,

                  active:
                    editActive,
                }
              : vaccine
        );

      setCustomVaccines(
        updatedCustom
      );

      localStorage.setItem(
        CUSTOM_VACCINES_STORAGE_KEY,
        JSON.stringify(
          updatedCustom
        )
      );
    }

    /* VACINA ORIGINAL DO CATÁLOGO */

    else {
      const updatedOverrides = {
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

      setOverrides(
        updatedOverrides
      );

      localStorage.setItem(
        VACCINE_STORAGE_KEY,
        JSON.stringify(
          updatedOverrides
        )
      );
    }

    setSelectedVaccine(
      null
    );
  };

  /* =======================================================
     NOVA ENTRADA
  ======================================================= */

  const openNewEntry = (
    vaccineId = ''
  ) => {
    setEditingLot(
      null
    );

    setLotVaccineId(
      vaccineId
    );

    setLotNumber(
      ''
    );

    setDocumentNumber(
      ''
    );

    setExpirationDate(
      ''
    );

    setLotDoses(
      0
    );

    setIsNewVaccine(
      false
    );

    setNewVaccineName(
      ''
    );

    setNewVaccineCategory(
      'Rotina'
    );

    setShowEntryModal(
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

    setDocumentNumber(
      lot.documentNumber ||
      ''
    );

    setExpirationDate(
      lot.expirationDate
    );

    setLotDoses(
      lot.doses
    );

    setIsNewVaccine(
      false
    );

    setNewVaccineName(
      ''
    );

    setShowEntryModal(
      true
    );
  };

  /* =======================================================
     SALVAR ENTRADA
  ======================================================= */

  const saveEntry = () => {
    let effectiveVaccineId =
      lotVaccineId;

    /* =====================================================
       CRIAR NOVA VACINA
    ===================================================== */

    if (isNewVaccine) {
      if (
        !newVaccineName.trim()
      ) {
        alert(
          'Informe o nome da nova vacina.'
        );

        return;
      }

      /*
       * Impede criar outra vacina
       * com o mesmo nome.
       */
      const alreadyExists =
        vaccines.some(
          (vaccine) =>
            vaccine.name
              .trim()
              .toLowerCase() ===
            newVaccineName
              .trim()
              .toLowerCase()
        );

      if (alreadyExists) {
        alert(
          'Já existe uma vacina com esse nome. Selecione a vacina existente.'
        );

        return;
      }

      effectiveVaccineId =
        `custom-${Date.now()}`;

      const newVaccine:
        AppVaccine = {
        id:
          effectiveVaccineId,

        name:
          newVaccineName.trim(),

        category:
          newVaccineCategory,

        imageUrl:
          '',

        active:
          true,
      };

      const updatedCustomVaccines =
        [
          ...customVaccines,
          newVaccine,
        ];

      setCustomVaccines(
        updatedCustomVaccines
      );

      localStorage.setItem(
        CUSTOM_VACCINES_STORAGE_KEY,
        JSON.stringify(
          updatedCustomVaccines
        )
      );
    }

    /* =====================================================
       VALIDAÇÕES
    ===================================================== */

    if (
      !effectiveVaccineId
    ) {
      alert(
        'Selecione a vacina.'
      );

      return;
    }

    if (
      !lotNumber.trim()
    ) {
      alert(
        'Informe o número do lote.'
      );

      return;
    }

    if (
      !expirationDate
    ) {
      alert(
        'Informe a validade.'
      );

      return;
    }

    if (
      lotDoses <= 0
    ) {
      alert(
        'Informe um número de doses maior que zero.'
      );

      return;
    }

    let updatedLots:
      StockLot[];

    /* =====================================================
       EDITAR LOTE EXISTENTE
    ===================================================== */

    if (editingLot) {
      updatedLots =
        lots.map(
          (lot) =>
            lot.id ===
              editingLot.id
              ? {
                  ...lot,

                  vaccineId:
                    effectiveVaccineId,

                  lotNumber:
                    lotNumber.trim(),

                  documentNumber:
                    documentNumber
                      .trim() ||
                    undefined,

                  expirationDate,

                  doses:
                    lotDoses,
                }
              : lot
        );

      const adjustment:
        StockMovement = {
        id:
          `mov-${Date.now()}`,

        type:
          'AJUSTE',

        vaccineId:
          effectiveVaccineId,

        lotNumber:
          lotNumber.trim(),

        documentNumber:
          documentNumber
            .trim() ||
          undefined,

        doses:
          lotDoses,

        date:
          new Date()
            .toISOString(),

        description:
          'Alteração manual do lote',
      };

      const updatedMovements =
        [
          adjustment,
          ...movements,
        ];

      setMovements(
        updatedMovements
      );

      localStorage.setItem(
        MOVEMENTS_STORAGE_KEY,
        JSON.stringify(
          updatedMovements
        )
      );
    }

    /* =====================================================
       NOVA ENTRADA
    ===================================================== */

    else {
      const existingLot =
        lots.find(
          (lot) =>
            lot.vaccineId ===
              effectiveVaccineId &&
            lot.lotNumber
              .trim()
              .toLowerCase() ===
              lotNumber
                .trim()
                .toLowerCase()
        );

      if (existingLot) {
        updatedLots =
          lots.map(
            (lot) =>
              lot.id ===
                existingLot.id
                ? {
                    ...lot,

                    doses:
                      lot.doses +
                      lotDoses,

                    expirationDate,

                    documentNumber:
                      documentNumber
                        .trim() ||
                      lot.documentNumber,
                  }
                : lot
          );
      } else {
        const newLot:
          StockLot = {
          id:
            `lot-${Date.now()}`,

          vaccineId:
            effectiveVaccineId,

          lotNumber:
            lotNumber.trim(),

          documentNumber:
            documentNumber
              .trim() ||
            undefined,

          expirationDate,

          doses:
            lotDoses,
        };

        updatedLots = [
          ...lots,
          newLot,
        ];
      }

      const movement:
        StockMovement = {
        id:
          `mov-${Date.now()}`,

        type:
          'ENTRADA',

        vaccineId:
          effectiveVaccineId,

        lotNumber:
          lotNumber.trim(),

        documentNumber:
          documentNumber
            .trim() ||
          undefined,

        doses:
          lotDoses,

        date:
          new Date()
            .toISOString(),

        description:
          isNewVaccine
            ? `Entrada inicial da nova vacina ${newVaccineName.trim()}`
            : documentNumber.trim()
            ? `Entrada • Documento ${documentNumber.trim()}`
            : 'Entrada no Estoque Central',
      };

      const updatedMovements =
        [
          movement,
          ...movements,
        ];

      setMovements(
        updatedMovements
      );

      localStorage.setItem(
        MOVEMENTS_STORAGE_KEY,
        JSON.stringify(
          updatedMovements
        )
      );
    }

    setLots(
      updatedLots
    );

    localStorage.setItem(
      LOTS_STORAGE_KEY,
      JSON.stringify(
        updatedLots
      )
    );

    setShowEntryModal(
      false
    );

    setEditingLot(
      null
    );

    setIsNewVaccine(
      false
    );

    setNewVaccineName(
      ''
    );
  };
    /* =======================================================
     EXCLUIR LOTE
  ======================================================= */

  const deleteLot = (
    lotId: string
  ) => {
    const confirmed =
      window.confirm(
        'Deseja excluir este lote?'
      );

    if (!confirmed) {
      return;
    }

    const updated =
      lots.filter(
        (lot) =>
          lot.id !==
          lotId
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
     BADGE
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

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* CABEÇALHO */}

      <header>

        <h1 className="text-3xl font-black text-slate-900">
          Estoque Central
        </h1>

        <p className="mt-1 text-slate-500">
          Gestão de vacinas, lotes, documentos, validade e doses disponíveis.
        </p>

      </header>

      {/* ABAS */}

      <Card className="rounded-2xl p-2">

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                'VACINAS'
              )
            }
            className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
              activeTab ===
              'VACINAS'
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Vacinas
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                'MOVIMENTACOES'
              )
            }
            className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
              activeTab ===
              'MOVIMENTACOES'
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Movimentações
          </button>

        </div>

      </Card>

      {/* =====================================================
          VACINAS
      ===================================================== */}

      {activeTab ===
        'VACINAS' && (
        <>

          {/* INDICADORES */}

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <Card className="rounded-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Vacinas ativas
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {
                      activeVaccines.length
                    }
                  </p>

                </div>

                <Syringe
                  size={28}
                  className="text-blue-600"
                />

              </div>

            </Card>

            <Card className="rounded-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Doses em estoque
                  </p>

                  <p className="mt-2 text-3xl font-black text-blue-600">
                    {totalDoses.toLocaleString(
                      'pt-BR'
                    )}
                  </p>

                </div>

                <Package
                  size={28}
                  className="text-blue-600"
                />

              </div>

            </Card>

            <Card className="rounded-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Próximos do vencimento
                  </p>

                  <p className="mt-2 text-3xl font-black text-amber-600">
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

            <Card className="rounded-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Lotes vencidos
                  </p>

                  <p className="mt-2 text-3xl font-black text-red-600">
                    {
                      expiredLots
                    }
                  </p>

                </div>

                <Boxes
                  size={28}
                  className="text-red-600"
                />

              </div>

            </Card>

          </section>

          {/* PESQUISA */}

          <Card className="rounded-2xl">

            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={19}
                  className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Buscar vacina, lote ou documento..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-blue-400"
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

              <Button
                onClick={() =>
                  openNewEntry()
                }
              >
                <Plus
                  size={17}
                  className="mr-2"
                />

                Adicionar
              </Button>

            </div>

          </Card>

          {/* TABELA */}

          <Card className="overflow-hidden rounded-2xl p-0">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                      Vacina
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                      Lote
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                      Documento
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

                <tbody className="divide-y divide-slate-100">

                  {filteredLots.length ===
                  0 ? (
                    <tr>

                      <td
                        colSpan={7}
                        className="px-6 py-14 text-center text-slate-500"
                      >
                        Nenhum lote encontrado.
                      </td>

                    </tr>
                  ) : (
                    filteredLots.map(
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
                            className="hover:bg-slate-50"
                          >

                            {/* VACINA */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">

                                  {vaccine?.imageUrl ? (
                                    <img
                                      src={
                                        vaccine.imageUrl
                                      }
                                      alt={
                                        vaccine.name
                                      }
                                      className="h-full w-full object-contain p-1"
                                    />
                                  ) : (
                                    <Syringe
                                      size={25}
                                      className="text-slate-400"
                                    />
                                  )}

                                </div>

                                <div>

                                  <p className="font-black text-slate-900">
                                    {vaccine?.name ||
                                      'Vacina não encontrada'}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {
                                      vaccine?.category
                                    }
                                  </p>

                                  {vaccine && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openVaccineEdit(
                                          vaccine
                                        )
                                      }
                                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                                    >
                                      Editar vacina / foto
                                    </button>
                                  )}

                                </div>

                              </div>

                            </td>

                            <td className="px-5 py-4 text-sm font-bold">
                              {
                                lot.lotNumber
                              }
                            </td>

                            <td className="px-5 py-4 text-sm">
                              {lot.documentNumber ||
                                '-'}
                            </td>

                            <td className="px-5 py-4 text-sm">
                              {formatDate(
                                lot.expirationDate
                              )}
                            </td>

                            <td className="px-5 py-4 text-right text-lg font-black text-blue-600">
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
                                    size={15}
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
                                    size={15}
                                  />
                                </Button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )
                  )}

                </tbody>

              </table>

            </div>

          </Card>

        </>
      )}

      {/* =====================================================
          MOVIMENTAÇÕES
      ===================================================== */}

      {activeTab ===
        'MOVIMENTACOES' && (
        <>

          <div>

            <h2 className="text-xl font-black">
              Movimentações
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Histórico de entradas, saídas e ajustes do Estoque Central.
            </p>

          </div>

          <Card className="overflow-hidden rounded-2xl p-0">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50">

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

                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                      Documento
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">
                      Doses
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">
                      Descrição
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {movements.length ===
                  0 ? (
                    <tr>

                      <td
                        colSpan={7}
                        className="px-6 py-14 text-center text-slate-500"
                      >
                        Nenhuma movimentação registrada.
                      </td>

                    </tr>
                  ) : (
                    movements.map(
                      (
                        movement
                      ) => {
                        const vaccine =
                          vaccines.find(
                            (item) =>
                              item.id ===
                              movement.vaccineId
                          );

                        return (
                          <tr
                            key={
                              movement.id
                            }
                          >

                            <td className="px-5 py-4 text-sm">
                              {new Date(
                                movement.date
                              ).toLocaleString(
                                'pt-BR'
                              )}
                            </td>

                            <td className="px-5 py-4">

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-bold ${
                                  movement.type ===
                                  'ENTRADA'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : movement.type ===
                                      'SAIDA'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {
                                  movement.type
                                }
                              </span>

                            </td>

                            <td className="px-5 py-4 font-semibold">
                              {vaccine?.name ||
                                'Vacina não encontrada'}
                            </td>

                            <td className="px-5 py-4 text-sm">
                              {
                                movement.lotNumber
                              }
                            </td>

                            <td className="px-5 py-4 text-sm">
                              {movement.documentNumber ||
                                '-'}
                            </td>

                            <td className="px-5 py-4 text-right font-black">
                              {
                                movement.doses
                              }
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {movement.description ||
                                '-'}
                            </td>

                          </tr>
                        );
                      }
                    )
                  )}

                </tbody>

              </table>

            </div>

          </Card>

        </>
      )}
            {/* =====================================================
          MODAL EDITAR VACINA / FOTO
      ===================================================== */}

      {selectedVaccine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-black">
                  Editar vacina
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Altere o nome, categoria ou foto da vacina.
                </p>

              </div>

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

            {/* FOTO */}

            <div className="mt-6">

              <div className="flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">

                {editImage ? (
                  <img
                    src={
                      editImage
                    }
                    alt=""
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <div className="text-center text-slate-400">

                    <ImagePlus
                      size={46}
                      className="mx-auto"
                    />

                    <p className="mt-2 text-sm">
                      Nenhuma foto cadastrada
                    </p>

                  </div>
                )}

              </div>

              <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-100">

                <Camera
                  size={17}
                  className="mr-2"
                />

                {editImage
                  ? 'Trocar foto'
                  : 'Adicionar foto'}

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

            <div className="mt-6 space-y-4">

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Nome da vacina
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
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

              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">

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

                Salvar vacina
              </Button>

            </div>

          </Card>

        </div>
      )}

      {/* =====================================================
          MODAL ADICIONAR / EDITAR
      ===================================================== */}

      {showEntryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4">

          <Card className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-black">
                  {editingLot
                    ? 'Editar lote'
                    : 'Adicionar vacina / entrada'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Selecione uma vacina existente ou cadastre uma nova.
                </p>

              </div>

              <Button
                variant="ghost"
                onClick={() =>
                  setShowEntryModal(
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

              {/* VACINA */}

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Vacina
                </label>

                <select
                  value={
                    isNewVaccine
                      ? '__NEW_VACCINE__'
                      : lotVaccineId
                  }
                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target
                        .value;

                    if (
                      value ===
                      '__NEW_VACCINE__'
                    ) {
                      setIsNewVaccine(
                        true
                      );

                      setLotVaccineId(
                        ''
                      );

                      setNewVaccineName(
                        ''
                      );

                      return;
                    }

                    setIsNewVaccine(
                      false
                    );

                    setNewVaccineName(
                      ''
                    );

                    setLotVaccineId(
                      value
                    );
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                >

                  <option value="">
                    Selecione...
                  </option>

                  {activeVaccines.map(
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

                  {!editingLot && (
                    <option value="__NEW_VACCINE__">
                      + Nova vacina
                    </option>
                  )}

                </select>

              </div>

              {/* NOVA VACINA */}

              {isNewVaccine && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">

                  <div>

                    <label className="mb-1 block text-xs font-bold text-blue-700">
                      Nome da nova vacina
                    </label>

                    <input
                      autoFocus
                      value={
                        newVaccineName
                      }
                      onChange={(
                        event
                      ) =>
                        setNewVaccineName(
                          event.target
                            .value
                        )
                      }
                      placeholder="Ex.: Dengue"
                      className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
                    />

                  </div>

                  <div className="mt-4">

                    <label className="mb-1 block text-xs font-bold text-blue-700">
                      Categoria
                    </label>

                    <select
                      value={
                        newVaccineCategory
                      }
                      onChange={(
                        event
                      ) =>
                        setNewVaccineCategory(
                          event.target
                            .value as VaccineCategory
                        )
                      }
                      className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3"
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

                  <p className="mt-3 text-xs text-blue-600">
                    A vacina será criada automaticamente quando você salvar esta entrada. Depois você poderá adicionar a foto em “Editar vacina / foto”.
                  </p>

                </div>
              )}

              {/* LOTE */}

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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />

              </div>

              {/* DOCUMENTO */}

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Número do documento
                </label>

                <input
                  value={
                    documentNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setDocumentNumber(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ex.: 1254/2026"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />

              </div>

              {/* VALIDADE E DOSES */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    Validade
                  </label>

                  <input
                    type="date"
                    value={
                      expirationDate
                    }
                    onChange={(
                      event
                    ) =>
                      setExpirationDate(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />

                </div>

              </div>

            </div>

            {/* BOTÕES */}

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  setShowEntryModal(
                    false
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                onClick={
                  saveEntry
                }
              >
                <Save
                  size={16}
                  className="mr-2"
                />

                {editingLot
                  ? 'Salvar alterações'
                  : isNewVaccine
                  ? 'Criar vacina e salvar'
                  : 'Salvar entrada'}
              </Button>

            </div>

          </Card>

        </div>
      )}

    </div>
  );
};