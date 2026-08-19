import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/auth/Login';
import { MunicipalDashboard } from './pages/municipal/Dashboard';
import { Placeholder } from './pages/Placeholder';
import { AdminDashboard } from './pages/super-admin/AdminDashboard';
import { OrderVaccines } from './pages/municipal/OrderVaccines';
import { MyOrders } from './pages/municipal/MyOrders';
import { Requests } from './pages/municipal/Requests';
import { RequestAnalysis } from './pages/municipal/RequestAnalysis';
import { Memorandum } from './pages/municipal/MemorandumValidation';
import { CentralStock } from './pages/municipal/CentralStock';

function Protected({ superAdmin = false }: { superAdmin?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace/>;
  if (superAdmin && user.role !== 'SUPER_ADMIN') return <Navigate to="/403" replace/>;
  return <AppShell><Outlet/></AppShell>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/app" element={<Protected/>}><Route index element={<MunicipalDashboard/>}/><Route path="pacientes" element={<Placeholder title="Pacientes"/>}/><Route path="vacinacao" element={<Placeholder title="Vacinação"/>}/><Route path="estoque" element={<Placeholder title="Estoque"/>}/><Route path="campanhas" element={<Placeholder title="Campanhas"/>}/></Route>
    <Route path="/admin" element={<Protected superAdmin/>}><Route index element={<AdminDashboard/>}/><Route path="tenants" element={<Placeholder title="Gestão de tenants"/>}/><Route path="saude" element={<Placeholder title="Saúde do sistema"/>}/><Route path="configuracoes" element={<Placeholder title="Configurações globais"/>}/></Route>
    <Route path="/403" element={<div className="grid min-h-screen place-items-center text-2xl font-bold">403 · Acesso negado</div>}/>
    <Route path="/" element={<Navigate to="/login" replace/>}/>
    <Route path="*" element={<div className="grid min-h-screen place-items-center text-2xl font-bold">404 · Página não encontrada</div>}/>
  <Route path="/app/pedir-vacina" element={<OrderVaccines />} />
  
  <Route
  path="/app/estoque"
  element={<CentralStock />}
/>
<Route
  path="/app/solicitacoes"
  element={<Requests />}
/>

<Route
  path="/app/solicitacoes/:protocol"
  element={<RequestAnalysis />}
/>

<Route
  path="/app/memorando/:protocol"
  element={<Memorandum />}
  
/>
</Routes>
}
