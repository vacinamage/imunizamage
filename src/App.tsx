import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';

import { Login } from './pages/auth/Login';

import { MunicipalDashboard } from './pages/municipal/Dashboard';
import { OrderVaccines } from './pages/municipal/OrderVaccines';
import { MyOrders } from './pages/municipal/MyOrders';

import { Requests } from './pages/municipal/Requests';
import { RequestAnalysis } from './pages/municipal/RequestAnalysis';
import { Memorandum } from './pages/municipal/Memorandum';

import { CentralStock } from './pages/municipal/CentralStock';

import { AdminDashboard } from './pages/super-admin/AdminDashboard';

const Protected = ({
  superAdmin = false,
}: {
  superAdmin?: boolean;
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * Por enquanto mantemos esta validação
   * simples.
   *
   * Depois, quando implementarmos as
   * permissões definitivas, vamos substituir
   * essa lógica.
   */
  if (
    superAdmin &&
    user.role !== 'SUPER_ADMIN'
  ) {
    return (
      <Navigate
        to="/403"
        replace
      />
    );
  }

  return <Outlet />;
};

export default function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* ==================================================
          ÁREA MUNICIPAL / CENTRAL
      ================================================== */}

      <Route
        element={<Protected />}
      >

        {/* MENU CENTRAL */}
        <Route
          path="/app"
          element={<MunicipalDashboard />}
        />

        {/* NOVA SOLICITAÇÃO */}
        <Route
          path="/app/pedir-vacina"
          element={<OrderVaccines />}
        />

        {/* MINHAS SOLICITAÇÕES */}
        <Route
          path="/app/meus-pedidos"
          element={<MyOrders />}
        />

        {/* SOLICITAÇÕES DA CENTRAL */}
        <Route
          path="/app/solicitacoes"
          element={<Requests />}
        />

        {/* ANÁLISE / AUTORIZAÇÃO */}
        <Route
          path="/app/solicitacoes/:protocol"
          element={<RequestAnalysis />}
        />

        {/* MEMORANDO */}
        <Route
          path="/app/memorando/:protocol"
          element={<Memorandum />}
        />

        {/* ===============================
            ESTOQUE CENTRAL
        =============================== */}

        <Route
          path="/app/estoque"
          element={<CentralStock />}
        />

      </Route>

      {/* ==================================================
          ADMINISTRADOR GLOBAL
      ================================================== */}

      <Route
        element={
          <Protected superAdmin />
        }
      >

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Route>

      {/* ACESSO NEGADO */}
      <Route
        path="/403"
        element={
          <div className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                403
              </h1>

              <p className="mt-2 text-lg font-semibold">
                Acesso negado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Você não possui permissão para acessar esta área.
              </p>
            </div>
          </div>
        }
      />

      {/* REDIRECIONAMENTO INICIAL */}
      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* PÁGINA NÃO ENCONTRADA */}
      <Route
        path="*"
        element={
          <div className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                404
              </h1>

              <p className="mt-2 text-lg font-semibold">
                Página não encontrada
              </p>
            </div>
          </div>
        }
      />

    </Routes>
  );
}