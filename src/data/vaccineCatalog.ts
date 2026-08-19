export type VaccineCategory =
  | 'Rotina'
  | 'Campanhas'
  | 'COVID-19'
  | 'Imunobiológicos Especiais';

export interface VaccineCatalogItem {
  id: string;
  name: string;
  category: VaccineCategory;
  imageUrl?: string;
  stock: number;
  active: boolean;
  updatedAt: string;
}

export const vaccineCatalog: VaccineCatalogItem[] = [
  {
    id: 'antirrabica',
    name: 'ANTIRRÁBICA',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'bcg',
    name: 'BCG',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'dt',
    name: 'DT',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'dtp',
    name: 'DTP',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'dtpa',
    name: 'DTpa',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'febre-amarela-05d',
    name: 'FEBRE AMARELA 05 D',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'febre-amarela-10d',
    name: 'FEBRE AMARELA 10 D',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'hepatite-a',
    name: 'HEPATITE A',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'hepatite-b',
    name: 'HEPATITE B',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'hpv',
    name: 'HPV',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'influenza',
    name: 'INFLUENZA',
    category: 'Campanhas',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'meningococica-c',
    name: 'MENINGOCÓCICA C',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'meningococica-acwy',
    name: 'MENINGOCÓCICA ACWY',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pentavalente',
    name: 'PENTAVALENTE',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pneumococica-10',
    name: 'PNEUMOCÓCICA 10',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pneumococica-20',
    name: 'PNEUMOCÓCICA 20',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'rota-virus',
    name: 'ROTA VÍRUS',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'triplice-viral-05d',
    name: 'TRÍPLICE VIRAL 05 DOSES',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'triplice-viral-10d',
    name: 'TRÍPLICE VIRAL 10 DOSES',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'varicela',
    name: 'VARICELA',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'vip',
    name: 'VIP',
    category: 'Rotina',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'vsr',
    name: 'VSR',
    category: 'Campanhas',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'dengue',
    name: 'DENGUE',
    category: 'Campanhas',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'imunoespecial',
    name: 'IMUNOESPECIAL',
    category: 'Imunobiológicos Especiais',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'hepatite-a-crie',
    name: 'HEPATITE A (CRIE)',
    category: 'Imunobiológicos Especiais',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'hib',
    name: 'HIB',
    category: 'Imunobiológicos Especiais',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'hexavalente',
    name: 'HEXAVALENTE',
    category: 'Imunobiológicos Especiais',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pneumococica-13',
    name: 'PNEUMOCÓCICA 13',
    category: 'Imunobiológicos Especiais',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pneumococica-23',
    name: 'PNEUMOCÓCICA 23',
    category: 'Imunobiológicos Especiais',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'covid-19',
    name: 'COVID-19',
    category: 'COVID-19',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pfizer-baby',
    name: 'PFIZER BABY',
    category: 'COVID-19',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pfizer-pediatrica',
    name: 'PFIZER PEDIÁTRICA',
    category: 'COVID-19',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
  {
    id: 'pfizer-bivalente',
    name: 'PFIZER BIVALENTE',
    category: 'COVID-19',
    stock: 0,
    active: true,
    updatedAt: '19/08/2026',
  },
];

export const vaccineCategories: VaccineCategory[] = [
  'Rotina',
  'Campanhas',
  'COVID-19',
  'Imunobiológicos Especiais',
];

export function getVaccineById(id: string) {
  return vaccineCatalog.find(
    (vaccine) => vaccine.id === id
  );
}

export function searchVaccines(term: string) {
  const normalizedTerm =
    term.trim().toLowerCase();

  if (!normalizedTerm) {
    return vaccineCatalog;
  }

  return vaccineCatalog.filter(
    (vaccine) =>
      vaccine.name
        .toLowerCase()
        .includes(normalizedTerm)
  );
}