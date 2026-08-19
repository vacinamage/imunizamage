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
            image.width * scale;

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
                'Não foi possível processar a imagem.'
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

        image.onerror = () =>
          reject(
            new Error(
              'Imagem inválida.'
            )
          );

        image.src =
          String(
            reader.result
          );
      };

      reader.onerror = () =>
        reject(
          new Error(
            'Não foi possível carregar a imagem.'
          )
        );

      reader.readAsDataURL(
        file
      );
    }
  );
};

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

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

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
      loadOverrides
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
  ] = useState('');

  const [
    editCategory,
    setEditCategory,
  ] =
    useState<VaccineCategory>(
      'Rotina'
    );

  const [
    editStock,
    setEditStock,
  ] = useState(0);

  const [
    editImage,
    setEditImage,
  ] = useState('');

  const [
    editActive,
    setEditActive,
  ] = useState(true);

  /*
   * Une o catálogo original
   * com as alterações feitas
   * pelo próprio site.
   */
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

  const filteredVaccines =
    useMemo(() => {
      const term =
        searchTerm
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
      searchTerm,
      categoryFilter,
    ]);

  const totalVaccines =
    vaccines.length;

  const activeVaccines =
    vaccines.filter(
      (vaccine) =>
        vaccine.active
    ).length;

  const inactiveVaccines =
    vaccines.filter(
      (vaccine) =>
        !vaccine.active
    ).length;

  const totalStock =
    vaccines.reduce(
      (total, vaccine) =>
        total +
        vaccine.stock,
      0
    );

  const saveOverrides = (
    newOverrides:
      VaccineOverrides
  ) => {
    setOverrides(
      newOverrides
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        newOverrides
      )
    );
  };

  const openEdit = (
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

    setEditStock(
      vaccine.stock
    );

    setEditImage(
      vaccine.imageUrl ||
        ''
    );

    setEditActive(
      vaccine.active
    );
  };

  const closeEdit = () => {
    setSelectedVaccine(
      null
    );
  };

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
          'Selecione um arquivo de imagem.'
        );

        return;
      }

      try {
        const image =
          await resizeImage(
            file
          );

        setEditImage(
          image
        );
      } catch {
        alert(
          'Não foi possível carregar a foto.'
        );
      }
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

    if (
      editStock < 0
    ) {
      alert(
        'A quantidade não pode ser negativa.'
      );

      return;
    }

    const
      newOverrides = {
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

          stock:
            editStock,

          imageUrl:
            editImage,

          active:
            editActive,
        },
      };

    saveOverrides(
      newOverrides
    );

    closeEdit();
  };

  const toggleActive = (
    vaccine:
      VaccineCatalogItem
  ) => {
    const
      newOverrides = {
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
      newOverrides
    );
  };

  const tabs: {
    key: TabKey;
    label: string;
  }[] = [
    {
      key: 'GERAL',
      label:
        'Visão geral',
    },
    {
      key: 'VACINAS',
      label: 'Vacinas',
    },
    {
      key: 'ENTRADAS',
      label: 'Entradas',
    },
    {
      key: 'LOTES',
      label: 'Lotes',
    },
    {
      key: 'MOVIMENTACOES',
      label:
        'Movimentações',
    },
  ];

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

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Estoque Central
        </h1>

        <p className="mt-1 text-slate-500">
          Gerencie vacinas, estoque, fotos, lotes e movimentações da Central de Imunização.
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
                {tab.label}
              </button>
            )
          )}

        </div>

      </Card>

      {/* VISÃO GERAL */}
      {activeTab ===
        'GERAL' && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <Card>
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Vacinas cadastradas
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {
                      totalVaccines
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
                    Vacinas ativas
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-600">
                    {
                      activeVaccines
                    }
                  </p>
                </div>

                <Power
                  size={28}
                  className="text-emerald-600"
                />

              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Inativas
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-500">
                    {
                      inactiveVaccines
                    }
                  </p>
                </div>

                <Power
                  size={28}
                  className="text-slate-400"
                />

              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Quantidade em estoque
                  </p>

                  <p className="mt-2 text-3xl font-bold text-brand-600">
                    {totalStock.toLocaleString(
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

          </section>

          <Card>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Catálogo de vacinas
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cadastre fotos e quantidades das vacinas utilizadas no município.
                </p>
              </div>

              <Button
                onClick={() =>
                  setActiveTab(
                    'VACINAS'
                  )
                }
              >
                Gerenciar vacinas
              </Button>

            </div>

          </Card>
        </>
      )}

      {/* ABA VACINAS */}
      {activeTab ===
        'VACINAS' && (
        <>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-xl font-bold">
                Vacinas
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Edite quantidade, categoria, foto e situação pelo próprio sistema.
              </p>

            </div>

            <Button
              onClick={() =>
                alert(
                  'O cadastro de uma vacina totalmente nova será a próxima função.'
                )
              }
            >
              <Plus
                size={16}
                className="mr-2"
              />

              Nova vacina
            </Button>

          </div>

          {/* FILTROS */}
          <Card>

            <div className="flex flex-col gap-3 md:flex-row">

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
                      event.target
                        .value
                    )
                  }
                  placeholder="Buscar vacina..."
                  className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredVaccines.map(
              (vaccine) => (
                <Card
                  key={
                    vaccine.id
                  }
                  className={`overflow-hidden ${
                    !vaccine.active
                      ? 'opacity-60'
                      : ''
                  }`}
                >

                  {/* FOTO */}
                  <div className="relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">

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
                          size={42}
                          className="mx-auto"
                        />

                        <p className="mt-2 text-xs">
                          Sem foto
                        </p>

                      </div>
                    )}

                    {!vaccine.active && (
                      <span className="absolute right-2 top-2 rounded-full bg-slate-700 px-2 py-1 text-[10px] font-bold text-white">
                        Inativa
                      </span>
                    )}

                  </div>

                  {/* DADOS */}
                  <div className="flex items-start justify-between gap-2">

                    <div>

                      <h3 className="font-bold text-slate-900 dark:text-white">
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
                      Estoque atual
                    </p>

                    <p className="mt-1 text-2xl font-bold text-brand-600">
                      {vaccine.stock.toLocaleString(
                        'pt-BR'
                      )}
                    </p>

                  </div>

                  {/* BOTÕES */}
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <Button
                      variant="outline"
                      onClick={() =>
                        openEdit(
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
                        toggleActive(
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

                </Card>
              )
            )}

          </div>

          {filteredVaccines.length ===
            0 && (
            <Card className="py-12 text-center">

              <Syringe
                size={38}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-semibold">
                Nenhuma vacina encontrada.
              </p>

            </Card>
          )}

        </>
      )}

      {/* OUTRAS ABAS */}
      {activeTab ===
        'ENTRADAS' && (
        <Card className="py-12 text-center">
          <h2 className="text-xl font-bold">
            Entradas
          </h2>

          <p className="mt-2 text-slate-500">
            Módulo de entrada de vacinas será desenvolvido na próxima etapa.
          </p>
        </Card>
      )}

      {activeTab ===
        'LOTES' && (
        <Card className="py-12 text-center">
          <h2 className="text-xl font-bold">
            Lotes
          </h2>

          <p className="mt-2 text-slate-500">
            Controle de lotes será conectado ao estoque.
          </p>
        </Card>
      )}

      {activeTab ===
        'MOVIMENTACOES' && (
        <Card className="py-12 text-center">
          <h2 className="text-xl font-bold">
            Movimentações
          </h2>

          <p className="mt-2 text-slate-500">
            Histórico de entradas e saídas será desenvolvido posteriormente.
          </p>
        </Card>
      )}

      {/* MODAL EDITAR VACINA */}
      {selectedVaccine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Editar vacina
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Altere os dados sem precisar modificar o código.
                </p>

              </div>

              <Button
                variant="ghost"
                onClick={
                  closeEdit
                }
              >
                <X size={18} />
              </Button>

            </div>

            {/* FOTO */}
            <div className="mt-6">

              <label className="mb-2 block text-xs font-bold text-slate-500">
                Foto da vacina
              </label>

              <div className="flex h-52 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">

                {editImage ? (
                  <img
                    src={
                      editImage
                    }
                    alt="Vacina"
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <div className="text-center text-slate-400">

                    <ImagePlus
                      size={42}
                      className="mx-auto"
                    />

                    <p className="mt-2 text-sm">
                      Nenhuma foto cadastrada
                    </p>

                  </div>
                )}

              </div>

              <label className="mt-3 flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">

                <ImagePlus
                  size={16}
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

              {editImage && (
                <button
                  type="button"
                  onClick={() =>
                    setEditImage(
                      ''
                    )
                  }
                  className="mt-2 w-full text-center text-xs font-bold text-red-600 hover:underline"
                >
                  Remover foto
                </button>
              )}

            </div>

            <div className="mt-5 space-y-4">

              {/* NOME */}
              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Nome
                </label>

                <input
                  type="text"
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
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                />

              </div>

              {/* CATEGORIA */}
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

              {/* QUANTIDADE */}
              <div>

                <label className="mb-1 block text-xs font-bold text-slate-500">
                  Quantidade em estoque
                </label>

                <input
                  type="number"
                  min={0}
                  value={
                    editStock
                  }
                  onChange={(
                    event
                  ) =>
                    setEditStock(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700"
                />

              </div>

              {/* STATUS */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">

                <div>

                  <p className="font-bold">
                    Vacina ativa
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Vacinas inativas não aparecerão futuramente nas solicitações.
                  </p>

                </div>

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
                  className="h-5 w-5"
                />

              </label>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={
                  closeEdit
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

    </div>
  );
};