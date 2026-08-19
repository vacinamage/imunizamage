import {
  ArrowLeft,
  Bell,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Moon,
  Package,
  Plus,
  Truck,
  UserCircle,
} from 'lucide-react';

import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

const menuItems = [
  {
    label: 'Painel',
    icon: LayoutDashboard,
    path: '/app',
  },
  {
    label: 'Solicitações',
    icon: ClipboardList,
    path: '/app/solicitacoes',
  },
  {
    label: 'Estoque Central',
    icon: Package,
    path: '/app/estoque',
  },
  {
    label: 'Entregas',
    icon: Truck,
    path: '/app/entregas',
  },
];

export const MunicipalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard =
    location.pathname === '/app';

  const isActive = (
    path: string
  ) => {
    if (path === '/app') {
      return (
        location.pathname ===
        '/app'
      );
    }

    return location.pathname.startsWith(
      path
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[270px] flex-col border-r border-slate-200 bg-white">

        {/* LOGO */}

        <div className="flex h-[92px] items-center border-b border-slate-100 px-7">

          <button
            type="button"
            onClick={() =>
              navigate('/app')
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">

              <Plus
                size={27}
                strokeWidth={3}
              />

            </div>

            <div className="text-left leading-none">

              <p className="text-[23px] font-black tracking-tight text-blue-600">
                IMUNIZA
              </p>

              <p className="mt-1 text-[18px] font-extrabold tracking-[0.15em] text-sky-400">
                PLUS
              </p>

            </div>

          </button>

        </div>

        {/* MENU */}

        <div className="flex-1 px-4 py-6">

          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          <nav className="space-y-2">

            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.path
                  );

                return (
                  <button
                    key={
                      item.path
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        item.path
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >

                    <Icon
                      size={21}
                      strokeWidth={
                        active
                          ? 2.4
                          : 2
                      }
                    />

                    {
                      item.label
                    }

                  </button>
                );
              }
            )}

            {/* AULAS */}

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-slate-400"
            >

              <div className="flex items-center gap-3">

                <BookOpen
                  size={21}
                />

                Aulas

              </div>

              <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700">
                Em manutenção
              </span>

            </button>

          </nav>

        </div>

        {/* USUÁRIO */}

        <div className="border-t border-slate-100 p-4">

          <div className="flex items-center gap-3 rounded-xl p-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">

              <UserCircle
                size={27}
              />

            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-bold text-slate-800">
                Imunização
              </p>

              <p className="text-xs text-slate-500">
                Coordenador
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* =====================================================
          ÁREA PRINCIPAL
      ===================================================== */}

      <div className="pl-[270px]">

        {/* TOPBAR */}

        <header className="sticky top-0 z-30 flex h-[92px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-10">

          <div>

            {!isDashboard ? (
              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-base font-bold text-blue-600 transition hover:bg-blue-50"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                  <ArrowLeft
                    size={22}
                  />

                </div>

                Voltar

              </button>
            ) : (
              <div className="flex items-center gap-3 lg:hidden">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">

                  <Plus
                    size={23}
                  />

                </div>

                <span className="font-black text-blue-600">
                  IMUNIZA PLUS
                </span>

              </div>
            )}

          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
            >
              <Moon
                size={20}
              />
            </button>

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
            >
              <Bell
                size={21}
              />

              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                4
              </span>
            </button>

            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                IC
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Imunização
                </p>

                <p className="text-[11px] text-slate-400">
                  Central
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* CONTEÚDO */}

        <main className="min-h-[calc(100vh-92px)] p-5 lg:p-8 xl:p-10">

          <Outlet />

        </main>

      </div>

    </div>
  );
};