import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { MOCK_USERS, type User } from '../data/mockData';

type Environment = 'GLOBAL' | 'MUNICIPAL';

interface AuthContextValue {
  user: User | null;
  currentEnv: Environment;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchEnvironment: (environment: Environment) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentEnv, setCurrentEnv] = useState<Environment>('MUNICIPAL');

  async function login(email: string, password: string) {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    const found = MOCK_USERS.find((item) => item.email === email && item.password === password);
    if (!found) return false;
    const { password: _password, ...safeUser } = found;
    setUser(safeUser);
    setCurrentEnv(safeUser.role === 'SUPER_ADMIN' ? 'GLOBAL' : 'MUNICIPAL');
    return true;
  }

  function logout() {
    setUser(null);
    setCurrentEnv('MUNICIPAL');
  }

  function switchEnvironment(environment: Environment) {
    if (user?.role === 'SUPER_ADMIN') setCurrentEnv(environment);
  }

  const value = useMemo(() => ({ user, currentEnv, login, logout, switchEnvironment }), [user, currentEnv]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
