
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  ClipboardList,
  Search,
  Send,
  Syringe,
  X,
} from 'lucide-react';

import {
  Card,
  Button,
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

type SelectedVaccine = {
  vaccineId: string;
  vaccineName: string;
  localStockDoses: number;
  requestedDoses: number;
  notes?: string;
};

type RequestDraft = {
  protocol: string;
  createdAt: string;
  unitName: string;
  requesterName: string;
  status: 'ANALISE';
  items: SelectedVaccine[];
};

/* =========================================================
   STORAGE
========================================================= */

const REQUESTS_STORAGE_KEY =
  'imuniza-unit-requests';

const VACCINE_OVERRIDES_KEY =
  'imuniza-vaccine-overrides';

/* =========================================================
   LOAD OVERRIDES
========================================================= */

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

const loadVaccineOverrides =
  (): VaccineOverrides => {
    try {
      const saved =
        localStorage.getItem(
          VACCINE_OVERRIDES_KEY
        );

      return saved
        ? JSON.parse(saved)
        : {};
    } catch {
      return {};
    }
  };

/* =========================================================
   COMPONENTE
========================================================= */

export const OrderVaccines = () => {
  const navigate = useNavigate();

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
    selectedItems,
    setSelectedItems,
  ] =
    useState<SelectedVaccine[]>(
      []
    );

  const [
    selectedVaccine,
    setSelectedVaccine,
  ] =
    useState<VaccineCatalogItem | null>(
      null
    );

  const [
    localStockDoses,
    setLocalStockDoses,
  ] = useState(0);

  const [
    requestedDoses,
    setRequestedDoses,
  ] = useState(0);

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    vaccineOverrides,
  ] =
    useState<VaccineOverrides>(
      loadVaccineOverrides
    );

  const [
    successProtocol,
    setSuccessProtocol,
  ] = useState<string | null>(
    null
  );

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
        })
      );
    }, [vaccineOverrides]);

  /* =======================================================
     FILTROS
  ======================================================= */

  const filteredVaccines =
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
     TOTAL DE DOSES
  ======================================================= */

  const totalRequestedDoses =
    useMemo(() => {
      return selectedItems.reduce(
        (total, item) =>
          total +
          item.requestedDoses,
        0
      );
    }, [selectedItems]);

  /* =======================================================
     ABRIR VACINA
  ======================================================= */

  const openVaccine = (
    vaccine:
      VaccineCatalogItem
  ) => {
    setSelectedVaccine(
      vaccine
    );

    setLocalStockDoses(0);

    setRequestedDoses(0);

    setNotes('');
  };

  /* =======================================================
     FECHAR MODAL
  ======================================================= */

  const closeVaccineModal =
    () => {
      setSelectedVaccine(
        null
      );

      setLocalStockDoses(0);

      setRequestedDoses(0);

      setNotes('');
    };

  /* =======================================================
     ADICIONAR VACINA
  ======================================================= */

  const addVaccine = () => {
    if (
      !selectedVaccine
    ) {
      return;
    }

    if (
      requestedDoses <= 0
    ) {
      alert(
        'Informe o número de doses solicitadas.'
      );

      return;
    }

    const alreadyExists =
      selectedItems.some(
        (item) =>
          item.vaccineId ===
          selectedVaccine.id
      );

    if (
      alreadyExists
    ) {
      alert(
        'Essa vacina já foi adicionada à solicitação.'
      );

      return;
    }

    const newItem:
      SelectedVaccine = {
      vaccineId:
        selectedVaccine.id,

      vaccineName:
        selectedVaccine.name,

      localStockDoses:
        Math.max(
          0,
          localStockDoses
        ),

      requestedDoses:
        requestedDoses,

      notes:
        notes.trim() ||
        undefined,
    };

    setSelectedItems(
      (previous) => [
        ...previous,
        newItem,
      ]
    );

    closeVaccineModal();
  };

  /* =======================================================
     REMOVER VACINA
  ======================================================= */

  const removeVaccine = (
    vaccineId: string
  ) => {
    setSelectedItems(
      (previous) =>
        previous.filter(
          (item) =>
            item.vaccineId !==
            vaccineId
        )
    );
  };

  /* =======================================================
     ALTERAR DOSES
  ======================================================= */

  const updateRequestedDoses = (
    vaccineId: string,
    value: number
  ) => {
    setSelectedItems(
      (previous) =>
        previous.map(
          (item) =>
            item.vaccineId ===
            vaccineId
              ? {
                  ...item,
                  requestedDoses:
                    Math.max(
                      0,
                      value
                    ),
                }
              : item
        )
    );
  };

  const updateLocalStockDoses = (
    vaccineId: string,
    value: number
  ) => {
    setSelectedItems(
      (previous) =>
        previous.map(
          (item) =>
            item.vaccineId ===
            vaccineId
              ? {
                  ...item,
                  localStockDoses:
                    Math.max(
                      0,
                      value
                    ),
                }
              : item
        )
    );
  };
    /* =======================================================
     GERAR PROTOCOLO
  ======================================================= */

  const generateProtocol = () => {
    const year =
      new Date().getFullYear();

    const randomNumber =
      Math.floor(
        Math.random() * 999999
      ) + 1;

    return `SLT-${year}-${String(
      randomNumber
    ).padStart(6, '0')}`;
  };

  /* =======================================================
     ENVIAR SOLICITAÇÃO
  ======================================================= */

  const submitRequest = () => {
    if (
      selectedItems.length ===
      0
    ) {
      alert(
        'Adicione pelo menos uma vacina à solicitação.'
      );

      return;
    }

    const invalidItem =
      selectedItems.find(
        (item) =>
          item.requestedDoses <=
          0
      );

    if (
      invalidItem
    ) {
      alert(
        `Informe as doses solicitadas para ${invalidItem.vaccineName}.`
      );

      return;
    }

    const protocol =
      generateProtocol();

    const newRequest:
      RequestDraft = {
      protocol,

      createdAt:
        new Date().toLocaleString(
          'pt-BR'
        ),

      /*
       * Esses dados são temporários.
       * Depois virão automaticamente
       * do usuário e da unidade logados.
       */
      unitName:
        'Unidade de Saúde',

      requesterName:
        'Usuário da Unidade',

      status: 'ANALISE',

      items:
        selectedItems,
    };

    try {
      const saved =
        localStorage.getItem(
          REQUESTS_STORAGE_KEY
        );

      const requests:
        RequestDraft[] =
        saved
          ? JSON.parse(saved)
          : [];

      const updatedRequests =
        [
          newRequest,
          ...requests,
        ];

      localStorage.setItem(
        REQUESTS_STORAGE_KEY,
        JSON.stringify(
          updatedRequests
        )
      );

      setSuccessProtocol(
        protocol
      );

      setSelectedItems([]);
    } catch {
      alert(
        'Não foi possível salvar a solicitação.'
      );
    }
  };

  /* =======================================================
     TELA DE SUCESSO
  ======================================================= */

  if (
    successProtocol
  ) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">

        <Card className="w-full max-w-xl text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

            <ClipboardList
              size={34}
            />

          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Solicitação enviada
          </h1>

          <p className="mt-2 text-slate-500">
            A solicitação foi encaminhada para análise da Central de Imunização.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">

            <p className="text-sm text-slate-500">
              Número da solicitação
            </p>

            <p className="mt-1 text-xl font-bold text-brand-600">
              {
                successProtocol
              }
            </p>

          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Button
              variant="outline"
              onClick={() =>
                navigate('/app')
              }
            >
              Voltar ao menu
            </Button>

            <Button
              onClick={() => {
                setSuccessProtocol(
                  null
                );
              }}
            >
              Nova solicitação
            </Button>

          </div>

        </Card>

      </div>
    );
  }

  /* =========================================================
     TELA PRINCIPAL
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* CABEÇALHO */}

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
              Solicitar vacinas
            </h1>

            <p className="mt-1 text-slate-500">
              Selecione as vacinas e informe as doses necessárias para sua unidade.
            </p>

          </div>

          <div className="rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-950/30">

            <p className="text-xs font-semibold uppercase text-slate-500">
              Total solicitado
            </p>

            <p className="mt-1 text-2xl font-bold text-brand-600">
              {totalRequestedDoses.toLocaleString(
                'pt-BR'
              )}{' '}
              doses
            </p>

          </div>

        </div>

      </header>

      {/* FILTROS DO CATÁLOGO */}

      <Card>

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

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

      {/* CATÁLOGO */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold">
              Catálogo de vacinas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Clique em uma vacina para adicioná-la à solicitação.
            </p>

          </div>

          <span className="text-sm font-semibold text-slate-500">
            {
              filteredVaccines.length
            }{' '}
            disponíveis
          </span>

        </div>

        {filteredVaccines.length ===
        0 ? (
          <Card className="py-12 text-center">

            <Syringe
              size={42}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-bold">
              Nenhuma vacina encontrada
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Tente alterar a busca ou o filtro.
            </p>

          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredVaccines.map(
              (
                vaccine
              ) => {
                const alreadySelected =
                  selectedItems.some(
                    (item) =>
                      item.vaccineId ===
                      vaccine.id
                  );

                return (
                  <Card
                    key={
                      vaccine.id
                    }
                    className={`flex h-full flex-col ${
                      alreadySelected
                        ? 'border-emerald-300'
                        : ''
                    }`}
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
                            size={40}
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

                    </div>

                    <Button
                      className="mt-4 w-full"
                      variant={
                        alreadySelected
                          ? 'outline'
                          : undefined
                      }
                      disabled={
                        alreadySelected
                      }
                      onClick={() =>
                        openVaccine(
                          vaccine
                        )
                      }
                    >
                      {alreadySelected
                        ? 'Adicionada'
                        : 'Adicionar'}
                    </Button>

                  </Card>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* VACINAS SELECIONADAS */}

      <section>

        <div className="mb-4">

          <h2 className="text-xl font-bold">
            Vacinas da solicitação
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Confira as doses antes de enviar.
          </p>

        </div>

        {selectedItems.length ===
        0 ? (
          <Card className="py-12 text-center">

            <ClipboardList
              size={42}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-bold">
              Nenhuma vacina adicionada
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Use o catálogo acima para montar sua solicitação.
            </p>

          </Card>
        ) : (
          <div className="space-y-4">

            {selectedItems.map(
              (
                item
              ) => (
                <Card
                  key={
                    item.vaccineId
                  }
                >

                  <div className="flex flex-col gap-5">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-lg font-bold">
                          {
                            item.vaccineName
                          }
                        </h3>

                        {item.notes && (
                          <p className="mt-1 text-sm text-slate-500">
                            {
                              item.notes
                            }
                          </p>
                        )}

                      </div>

                      <Button
                        variant="outline"
                        className="text-red-600"
                        onClick={() =>
                          removeVaccine(
                            item.vaccineId
                          )
                        }
                      >
                        <X
                          size={15}
                          className="mr-2"
                        />

                        Remover
                      </Button>

                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div>

                        <label className="mb-1 block text-xs font-bold text-slate-500">
                          Doses existentes na unidade
                        </label>

                        <input
                          type="number"
                          min={0}
                          value={
                            item.localStockDoses
                          }
                          onChange={(
                            event
                          ) =>
                            updateLocalStockDoses(
                              item.vaccineId,
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

                      <div>

                        <label className="mb-1 block text-xs font-bold text-slate-500">
                          Doses solicitadas
                        </label>

                        <input
                          type="number"
                          min={1}
                          value={
                            item.requestedDoses
                          }
                          onChange={(
                            event
                          ) =>
                            updateRequestedDoses(
                              item.vaccineId,
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
              )
            )}

          </div>
        )}

      </section>
          

      <Card>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-lg font-bold">
              Resumo da solicitação
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Confira os itens antes de enviar para a Central de Imunização.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">

              <p className="text-xs text-slate-500">
                Vacinas
              </p>

              <p className="mt-1 text-2xl font-bold">
                {
                  selectedItems.length
                }
              </p>

            </div>

            <div className="rounded-xl bg-brand-50 p-4 text-center dark:bg-brand-950/30">

              <p className="text-xs text-slate-500">
                Doses solicitadas
              </p>

              <p className="mt-1 text-2xl font-bold text-brand-600">
                {totalRequestedDoses.toLocaleString(
                  'pt-BR'
                )}
              </p>

            </div>

            <div className="col-span-2 rounded-xl bg-slate-50 p-4 text-center sm:col-span-1 dark:bg-slate-800/50">

              <p className="text-xs text-slate-500">
                Situação
              </p>

              <p className="mt-1 font-bold text-amber-600">
                Será enviada para análise
              </p>

            </div>

          </div>

        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

          <Button
            variant="outline"
            onClick={() =>
              navigate('/app')
            }
          >
            Cancelar
          </Button>

          <Button
            disabled={
              selectedItems.length ===
              0
            }
            onClick={
              submitRequest
            }
          >
            <Send
              size={16}
              className="mr-2"
            />

            Enviar solicitação
          </Button>

        </div>

      </Card>

      {/* =====================================================
          MODAL ADICIONAR VACINA
      ===================================================== */}

      {selectedVaccine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <Card className="max-h-[92vh] w-full max-w-xl overflow-y-auto">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-bold">
                  Adicionar vacina
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informe os dados da solicitação para esta vacina.
                </p>

              </div>

              <Button
                variant="ghost"
                onClick={
                  closeVaccineModal
                }
              >
                <X
                  size={18}
                />
              </Button>

            </div>

            {/* FOTO */}

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
                <div className="text-center text-slate-400">

                  <Syringe
                    size={44}
                    className="mx-auto"
                  />

                  <p className="mt-2 text-xs">
                    Sem foto
                  </p>

                </div>
              )}

            </div>

            {/* DADOS DA VACINA */}

            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">

              <p className="font-bold">
                {
                  selectedVaccine.name
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {
                  selectedVaccine.category
                }
              </p>

            </div>

            {/* FORMULÁRIO */}

            <div className="mt-5 space-y-4">

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Doses existentes na unidade
                </label>

                <input
                  type="number"
                  min={0}
                  value={
                    localStockDoses
                  }
                  onChange={(
                    event
                  ) =>
                    setLocalStockDoses(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  placeholder="Ex.: 25"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Informe apenas as doses que ainda existem na sua unidade.
                </p>

              </div>

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Doses solicitadas
                </label>

                <input
                  type="number"
                  min={1}
                  value={
                    requestedDoses
                  }
                  onChange={(
                    event
                  ) =>
                    setRequestedDoses(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  placeholder="Ex.: 100"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                />

              </div>

              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Observação
                </label>

                <textarea
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Observação opcional..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                />

              </div>

            </div>

            {/* BOTÕES */}

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={
                  closeVaccineModal
                }
              >
                Cancelar
              </Button>

              <Button
                onClick={
                  addVaccine
                }
              >
                <ClipboardList
                  size={16}
                  className="mr-2"
                />

                Adicionar
              </Button>

            </div>

          </Card>

        </div>
      )}

    </div>
  );
};