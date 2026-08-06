export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant?: string;
}

export const MOCK_USERS: Array<User & { password: string }> = [
  { id: '1', name: 'Carlos Oliveira', email: 'superadmin@plataforma.com.br', password: 'admin123', role: 'SUPER_ADMIN' },
  { id: '2', name: 'Ana Magalhães', email: 'admin@mage.rj.gov.br', password: 'admin123', role: 'TENANT_ADMIN', tenant: 'Prefeitura de Magé' },
  { id: '3', name: 'Roberto Souza', email: 'usuario@mage.rj.gov.br', password: 'usuario123', role: 'TENANT_USER', tenant: 'Prefeitura de Magé' }
];

export const MOCK_TENANTS = [
  { id: '1', name: 'Prefeitura de Magé', plan: 'Enterprise', status: 'ACTIVE', users: 842, storage: '45 GB', expiry: '31/12/2026' },
  { id: '2', name: 'Município Demonstração', plan: 'Básico', status: 'TRIAL', users: 5, storage: '1,2 GB', expiry: '15/08/2026' },
  { id: '3', name: 'Clínica Vida', plan: 'Profissional', status: 'SUSPENDED', users: 12, storage: '8 GB', expiry: '10/10/2026' },
  { id: '4', name: 'Secretaria Regional', plan: 'Enterprise', status: 'ACTIVE', users: 156, storage: '22 GB', expiry: '05/08/2026' }
];

export const MUNICIPAL_STATS = [
  { label: 'Vacinas aplicadas', value: '1.245', delta: '+12%' },
  { label: 'Pacientes atendidos', value: '856', delta: '+5%' },
  { label: 'Lotes em alerta', value: '3', delta: '-1' },
  { label: 'Cobertura vacinal', value: '94%', delta: '+0,5%' }
];
