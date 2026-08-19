export type StockStatus =
  | 'NORMAL'
  | 'ATENCAO'
  | 'CRITICO'
  | 'VENCIDO';

export interface CentralStockItem {
  id: string;
  vaccineName: string;
  lotNumber: string;
  manufacturer: string;
  expirationDate: string;
  quantity: number;
  status: StockStatus;
  receivedAt: string;
}

export const CENTRAL_STOCK: CentralStockItem[] = [
  {
    id: '1',
    vaccineName: 'BCG',
    lotNumber: 'BCG-26001',
    manufacturer: 'Fundação Ataulpho de Paiva',
    expirationDate: '15/12/2027',
    quantity: 2450,
    status: 'NORMAL',
    receivedAt: '05/08/2026',
  },
  {
    id: '2',
    vaccineName: 'Pentavalente',
    lotNumber: 'PENTA-26015',
    manufacturer: 'Bio-Manguinhos',
    expirationDate: '20/09/2027',
    quantity: 1200,
    status: 'NORMAL',
    receivedAt: '03/08/2026',
  },
  {
    id: '3',
    vaccineName: 'VIP (Poliomielite Inativada)',
    lotNumber: 'VIP-26008',
    manufacturer: 'Bio-Manguinhos',
    expirationDate: '10/03/2027',
    quantity: 320,
    status: 'ATENCAO',
    receivedAt: '28/07/2026',
  },
  {
    id: '4',
    vaccineName: 'Influenza',
    lotNumber: 'INF-26022',
    manufacturer: 'Instituto Butantan',
    expirationDate: '30/09/2026',
    quantity: 850,
    status: 'ATENCAO',
    receivedAt: '18/07/2026',
  },
  {
    id: '5',
    vaccineName: 'Tríplice Viral',
    lotNumber: 'TV-26011',
    manufacturer: 'Bio-Manguinhos',
    expirationDate: '14/11/2027',
    quantity: 1500,
    status: 'NORMAL',
    receivedAt: '01/08/2026',
  },
  {
    id: '6',
    vaccineName: 'HPV Quadrivalente',
    lotNumber: 'HPV-26007',
    manufacturer: 'MSD',
    expirationDate: '22/06/2027',
    quantity: 80,
    status: 'CRITICO',
    receivedAt: '21/07/2026',
  },
];

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  NORMAL: 'Normal',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico',
  VENCIDO: 'Vencido',
};