export interface VaccineProduct {
  id: string;
  name: string;
  category: 'COVID' | 'Rotina' | 'Campanhas';
  stock: number;
  updatedAt: string;
}

export const VACCINE_CATALOG: VaccineProduct[] = [
  { id: '1', name: 'BCG', category: 'Rotina', stock: 24500, updatedAt: '12/07/2024' },
  { id: '2', name: 'Pentavalente', category: 'Rotina', stock: 12000, updatedAt: '13/07/2024' },
  { id: '3', name: 'VIP (Poliomielite Inativada)', category: 'Rotina', stock: 8400, updatedAt: '10/07/2024' },
  { id: '4', name: 'COVID-19 Pfizer Baby', category: 'COVID', stock: 4500, updatedAt: '14/07/2024' },
  { id: '5', name: 'Influenza (Gripe)', category: 'Campanhas', stock: 50000, updatedAt: '14/07/2024' },
  { id: '6', name: 'Hepatite B', category: 'Rotina', stock: 15000, updatedAt: '09/07/2024' },
  { id: '7', name: 'Febre Amarela', category: 'Rotina', stock: 6700, updatedAt: '11/07/2024' },
  { id: '8', name: 'Meningocócica C', category: 'Rotina', stock: 9200, updatedAt: '13/07/2024' },
  { id: '9', name: 'Tríplice Viral', category: 'Rotina', stock: 11000, updatedAt: '14/07/2024' },
  { id: '10', name: 'HPV Quadrivalente', category: 'Rotina', stock: 3200, updatedAt: '08/07/2024' },
  { id: '11', name: 'Pneumocócica 10V', category: 'Rotina', stock: 7800, updatedAt: '12/07/2024' },
  { id: '12', name: 'Rotavírus Humano', category: 'Rotina', stock: 5400, updatedAt: '10/07/2024' },
  { id: '13', name: 'DTP (Tríplice Bacteriana)', category: 'Rotina', stock: 9000, updatedAt: '13/07/2024' },
  { id: '14', name: 'COVID-19 Bivalente', category: 'COVID', stock: 25000, updatedAt: '14/07/2024' },
  { id: '15', name: 'Varicela', category: 'Rotina', stock: 4100, updatedAt: '11/07/2024' },
  { id: '16', name: 'Hepatite A', category: 'Rotina', stock: 3800, updatedAt: '09/07/2024' },
  { id: '17', name: 'Meningocócica ACWY', category: 'Campanhas', stock: 12000, updatedAt: '14/07/2024' },
  { id: '18', name: 'DTPA (Gestante)', category: 'Rotina', stock: 2900, updatedAt: '12/07/2024' },
  { id: '19', name: 'Tetra Viral', category: 'Rotina', stock: 1500, updatedAt: '10/07/2024' },
  { id: '20', name: 'Pneumocócica 23V', category: 'Campanhas', stock: 6000, updatedAt: '13/07/2024' },
];

export const MOCK_ORDERS = [
  { id: 'REQ-2024-001', date: '14/07/2024', status: 'ENTREGUE', items: 5, totalDoses: 1250 },
  { id: 'REQ-2024-002', date: '15/07/2024', status: 'TRANSPORTE', items: 2, totalDoses: 800 },
  { id: 'REQ-2024-003', date: '15/07/2024', status: 'ANALISE', items: 8, totalDoses: 4500 },
  { id: 'REQ-2024-004', date: '13/07/2024', status: 'REJEITADO', items: 1, totalDoses: 100 },
];