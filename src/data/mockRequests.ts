export type RequestStatus =
  | 'NOVA'
  | 'EM_ANALISE'
  | 'AUTORIZADA'
  | 'MEMORANDO_EMITIDO'
  | 'ENTREGUE'
  | 'FINALIZADA'
  | 'REJEITADA';

export interface RequestItem {
  id: string;
  vaccineId: string;
  vaccineName: string;

  localStockReported: number;

  requestedQuantity: number;

  centralStock: number;

  authorizedQuantity: number;

  reductionReason?: string;

  notes?: string;
}

export interface VaccineRequest {
  id: string;

  protocol: string;

  memorandumNumber?: string;

  municipality: string;

  unitName: string;

  requesterName: string;

  createdAt: string;

  authorizedAt?: string;

  authorizedBy?: string;

  status: RequestStatus;

  unitNotes?: string;

  items: RequestItem[];
}

export const MOCK_REQUESTS: VaccineRequest[] = [
  {
    id: 'req-001',

    protocol: 'SLT-2026-000001',

    municipality: 'Magé',

    unitName: 'UBS Fragoso',

    requesterName: 'Maria Silva',

    createdAt: '11/08/2026 09:15',

    status: 'EM_ANALISE',

    unitNotes:
      'Solicitação para reposição do estoque de rotina da unidade.',

    items: [
      {
        id: 'item-001',

        vaccineId: 'bcg',

        vaccineName: 'BCG',

        localStockReported: 20,

        requestedQuantity: 100,

        centralStock: 850,

        authorizedQuantity: 100,
      },

      {
        id: 'item-002',

        vaccineId: 'vip',

        vaccineName: 'VIP (Poliomielite Inativada)',

        localStockReported: 12,

        requestedQuantity: 50,

        centralStock: 420,

        authorizedQuantity: 50,
      },

      {
        id: 'item-003',

        vaccineId: 'hpv',

        vaccineName: 'HPV Quadrivalente',

        localStockReported: 5,

        requestedQuantity: 80,

        centralStock: 40,

        authorizedQuantity: 40,

        reductionReason: 'Estoque insuficiente',
      },
    ],
  },

  {
    id: 'req-002',

    protocol: 'SLT-2026-000002',

    memorandumNumber: 'MEM-2026-000001',

    municipality: 'Magé',

    unitName: 'UBS Suruí',

    requesterName: 'Ana Souza',

    createdAt: '11/08/2026 08:40',

    authorizedAt: '11/08/2026 10:05',

    authorizedBy: 'Coordenação Municipal',

    status: 'AUTORIZADA',

    items: [
      {
        id: 'item-004',

        vaccineId: 'influenza',

        vaccineName: 'Influenza',

        localStockReported: 40,

        requestedQuantity: 200,

        centralStock: 1200,

        authorizedQuantity: 200,
      },
    ],
  },

  {
    id: 'req-003',

    protocol: 'SLT-2026-000003',

    memorandumNumber: 'MEM-2026-000002',

    municipality: 'Magé',

    unitName: 'Hospital Piabetá',

    requesterName: 'Carlos Almeida',

    createdAt: '10/08/2026 14:10',

    authorizedAt: '10/08/2026 15:35',

    authorizedBy: 'Coordenação Municipal',

    status: 'MEMORANDO_EMITIDO',

    items: [
      {
        id: 'item-005',

        vaccineId: 'hep-b',

        vaccineName: 'Hepatite B',

        localStockReported: 10,

        requestedQuantity: 120,

        centralStock: 620,

        authorizedQuantity: 100,

        reductionReason: 'Redistribuição',
      },

      {
        id: 'item-006',

        vaccineId: 'dtpa',

        vaccineName: 'dTpa',

        localStockReported: 8,

        requestedQuantity: 60,

        centralStock: 300,

        authorizedQuantity: 60,
      },
    ],
  },

  {
    id: 'req-004',

    protocol: 'SLT-2026-000004',

    memorandumNumber: 'MEM-2026-000003',

    municipality: 'Magé',

    unitName: 'UBS Maurimárcia',

    requesterName: 'Fernanda Costa',

    createdAt: '10/08/2026 11:00',

    authorizedAt: '10/08/2026 12:20',

    authorizedBy: 'Coordenação Municipal',

    status: 'ENTREGUE',

    items: [
      {
        id: 'item-007',

        vaccineId: 'penta',

        vaccineName: 'Pentavalente',

        localStockReported: 25,

        requestedQuantity: 150,

        centralStock: 700,

        authorizedQuantity: 150,
      },
    ],
  },

  {
    id: 'req-005',

    protocol: 'SLT-2026-000005',

    memorandumNumber: 'MEM-2026-000004',

    municipality: 'Magé',

    unitName: 'UBS Fragoso',

    requesterName: 'Maria Silva',

    createdAt: '09/08/2026 16:22',

    authorizedAt: '09/08/2026 17:10',

    authorizedBy: 'Coordenação Municipal',

    status: 'FINALIZADA',

    items: [
      {
        id: 'item-008',

        vaccineId: 'triplice-viral',

        vaccineName: 'Tríplice Viral',

        localStockReported: 18,

        requestedQuantity: 100,

        centralStock: 460,

        authorizedQuantity: 100,
      },
    ],
  },

  {
    id: 'req-006',

    protocol: 'SLT-2026-000006',

    municipality: 'Magé',

    unitName: 'UBS Suruí',

    requesterName: 'Ana Souza',

    createdAt: '09/08/2026 10:12',

    status: 'NOVA',

    items: [
      {
        id: 'item-009',

        vaccineId: 'febre-amarela',

        vaccineName: 'Febre Amarela',

        localStockReported: 6,

        requestedQuantity: 50,

        centralStock: 210,

        authorizedQuantity: 50,
      },
    ],
  },

  {
    id: 'req-007',

    protocol: 'SLT-2026-000007',

    municipality: 'Magé',

    unitName: 'Guarani 01',

    requesterName: 'Juliana Martins',

    createdAt: '08/08/2026 13:45',

    status: 'EM_ANALISE',

    items: [
      {
        id: 'item-010',

        vaccineId: 'meningo-c',

        vaccineName: 'Meningocócica C',

        localStockReported: 15,

        requestedQuantity: 90,

        centralStock: 380,

        authorizedQuantity: 90,
      },
    ],
  },

  {
    id: 'req-008',

    protocol: 'SLT-2026-000008',

    municipality: 'Magé',

    unitName: '24H Fragoso',

    requesterName: 'Paulo Henrique',

    createdAt: '08/08/2026 09:25',

    status: 'NOVA',

    items: [
      {
        id: 'item-011',

        vaccineId: 'pneumo-10',

        vaccineName: 'Pneumocócica 10V',

        localStockReported: 9,

        requestedQuantity: 70,

        centralStock: 290,

        authorizedQuantity: 70,
      },
    ],
  },
];

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  NOVA: 'Nova',

  EM_ANALISE: 'Em análise',

  AUTORIZADA: 'Autorizada',

  MEMORANDO_EMITIDO: 'Memorando emitido',

  ENTREGUE: 'Entregue',

  FINALIZADA: 'Finalizada',

  REJEITADA: 'Rejeitada',
};

export const REQUEST_REDUCTION_REASONS = [
  'Estoque insuficiente',
  'Redistribuição',
  'Campanha',
  'Critério técnico',
  'Outro',
];

export function getRequestByProtocol(protocol: string) {
  return MOCK_REQUESTS.find(
    (request) => request.protocol === protocol
  );
}

export function getRequestByMemorandum(
  memorandumNumber: string
) {
  return MOCK_REQUESTS.find(
    (request) =>
      request.memorandumNumber === memorandumNumber
  );
}

export function getNextRequestProtocol() {
  const year = new Date().getFullYear();

  const lastNumber = MOCK_REQUESTS.reduce((highest, request) => {
    const parts = request.protocol.split('-');

    const number = Number(parts[2]);

    return Number.isNaN(number)
      ? highest
      : Math.max(highest, number);
  }, 0);

  return `SLT-${year}-${String(lastNumber + 1).padStart(6, '0')}`;
}

export function getNextMemorandumNumber() {
  const year = new Date().getFullYear();

  const lastNumber = MOCK_REQUESTS.reduce((highest, request) => {
    if (!request.memorandumNumber) return highest;

    const parts = request.memorandumNumber.split('-');

    const number = Number(parts[2]);

    return Number.isNaN(number)
      ? highest
      : Math.max(highest, number);
  }, 0);

  return `MEM-${year}-${String(lastNumber + 1).padStart(6, '0')}`;
}