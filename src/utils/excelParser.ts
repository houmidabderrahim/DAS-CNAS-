/**
 * Excel Parser and Template Generator using SheetJS (xlsx)
 * Supports multiple Algerian payroll formats: PC Paie, Sage, DLG, custom Excel
 */

import * as XLSX from 'xlsx';
import { ColumnMapping, EmployeeRecord, EmployerInfo } from '../types/das';

// Fuzzy header matcher for Algerian payroll column names (French and Arabic)
export function autoDetectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    nss: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    salaireT1: '',
    salaireT2: '',
    salaireT3: '',
    salaireT4: '',
    salaireAnnuel: '',
    dureeT1: '',
    dureeT2: '',
    dureeT3: '',
    dureeT4: '',
    dateEntree: '',
    dateSortie: '',
    observation: '',
  };

  const clean = (h: string) =>
    (h || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  headers.forEach((header) => {
    const raw = (header || '').toString().trim();
    const c = clean(raw);

    // NSS / Sécurité Sociale
    if (!mapping.nss && (c.includes('nss') || c.includes('secu') || c.includes('immat') || c.includes('social') || raw.includes('ضمان'))) {
      mapping.nss = raw;
    }
    // Nom
    else if (!mapping.nom && (c === 'nom' || c.startsWith('nom') || c.includes('nomemploye') || raw.includes('اللقب'))) {
      mapping.nom = raw;
    }
    // Prénom
    else if (!mapping.prenom && (c === 'prenom' || c.startsWith('prenom') || raw.includes('الاسم'))) {
      mapping.prenom = raw;
    }
    // Date de Naissance
    else if (!mapping.dateNaissance && (c.includes('naiss') || c.includes('birth') || c.includes('datenaiss') || raw.includes('ميلاد'))) {
      mapping.dateNaissance = raw;
    }
    // Salaire T1
    else if (!mapping.salaireT1 && ((c.includes('t1') || c.includes('trim1') || c.includes('trimestre1') || c.includes('sal1')) && (c.includes('sal') || c.includes('mont') || c.includes('brut') || c.includes('cotis') || c.length <= 4))) {
      mapping.salaireT1 = raw;
    }
    // Salaire T2
    else if (!mapping.salaireT2 && ((c.includes('t2') || c.includes('trim2') || c.includes('trimestre2') || c.includes('sal2')) && (c.includes('sal') || c.includes('mont') || c.includes('brut') || c.includes('cotis') || c.length <= 4))) {
      mapping.salaireT2 = raw;
    }
    // Salaire T3
    else if (!mapping.salaireT3 && ((c.includes('t3') || c.includes('trim3') || c.includes('trimestre3') || c.includes('sal3')) && (c.includes('sal') || c.includes('mont') || c.includes('brut') || c.includes('cotis') || c.length <= 4))) {
      mapping.salaireT3 = raw;
    }
    // Salaire T4
    else if (!mapping.salaireT4 && ((c.includes('t4') || c.includes('trim4') || c.includes('trimestre4') || c.includes('sal4')) && (c.includes('sal') || c.includes('mont') || c.includes('brut') || c.includes('cotis') || c.length <= 4))) {
      mapping.salaireT4 = raw;
    }
    // Salaire Annuel / Total
    else if (!mapping.salaireAnnuel && (c.includes('annuel') || c.includes('tot') || c.includes('total') || c.includes('cumul') || raw.includes('مجموع'))) {
      mapping.salaireAnnuel = raw;
    }
    // Durée T1
    else if (!mapping.dureeT1 && c.includes('duree') && c.includes('1')) {
      mapping.dureeT1 = raw;
    }
    // Durée T2
    else if (!mapping.dureeT2 && c.includes('duree') && c.includes('2')) {
      mapping.dureeT2 = raw;
    }
    // Durée T3
    else if (!mapping.dureeT3 && c.includes('duree') && c.includes('3')) {
      mapping.dureeT3 = raw;
    }
    // Durée T4
    else if (!mapping.dureeT4 && c.includes('duree') && c.includes('4')) {
      mapping.dureeT4 = raw;
    }
    // Date Entrée
    else if (!mapping.dateEntree && (c.includes('entree') || c.includes('recrut') || c.includes('embauche') || raw.includes('دخول'))) {
      mapping.dateEntree = raw;
    }
    // Date Sortie
    else if (!mapping.dateSortie && (c.includes('sortie') || c.includes('depart') || c.includes('fin') || raw.includes('خروج'))) {
      mapping.dateSortie = raw;
    }
    // Observation
    else if (!mapping.observation && (c.includes('obs') || c.includes('remarque') || c.includes('motif') || raw.includes('ملاحظة'))) {
      mapping.observation = raw;
    }
  });

  return mapping;
}

export interface ParsedExcelResult {
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  detectedMapping: ColumnMapping;
  records: EmployeeRecord[];
  employerCandidate?: Partial<EmployerInfo>;
}

/**
 * Parses raw ArrayBuffer / File of an Excel or CSV file
 */
export async function parseExcelBuffer(
  buffer: ArrayBuffer,
  activeSheetName?: string,
  customMapping?: ColumnMapping
): Promise<ParsedExcelResult> {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('Le fichier Excel ne contient aucune feuille de calcul.');
  }

  const selectedSheet = activeSheetName && sheetNames.includes(activeSheetName) ? activeSheetName : sheetNames[0];
  const worksheet = workbook.Sheets[selectedSheet];

  // Convert to JSON raw rows
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  if (rawRows.length === 0) {
    throw new Error('La feuille sélectionnée est vide.');
  }

  // Find header row (usually first non-empty row)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i] as any[];
    if (row && row.filter((c) => c && c.toString().trim().length > 0).length >= 3) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = (rawRows[headerRowIndex] as any[]) || [];
  const headers = headerRow.map((h, i) => (h ? h.toString().trim() : `Col_${i + 1}`));

  const mapping = customMapping || autoDetectColumns(headers);

  // Parse data rows starting after headerRowIndex
  const records: EmployeeRecord[] = [];
  let recordCounter = 1;

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const rowValues = rawRows[r] as any[];
    if (!rowValues || rowValues.every((val) => !val || val.toString().trim() === '')) {
      continue; // Skip blank rows
    }

    // Build row object keyed by header name
    const rowObj: Record<string, any> = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = rowValues[colIdx] !== undefined ? rowValues[colIdx] : '';
    });

    const getVal = (colKey?: string): string => {
      if (!colKey || !rowObj[colKey]) return '';
      return rowObj[colKey].toString().trim();
    };

    const getNumber = (colKey?: string): number => {
      if (!colKey || !rowObj[colKey]) return 0;
      const str = rowObj[colKey].toString().replace(/\s/g, '').replace(',', '.');
      const num = parseFloat(str);
      return isNaN(num) ? 0 : num;
    };

    const nss = getVal(mapping.nss);
    const nom = getVal(mapping.nom);
    const prenom = getVal(mapping.prenom);

    // Skip total rows or summary footers in Excel
    if (nom.toUpperCase().includes('TOTAL') || nss.toUpperCase().includes('TOTAL')) {
      continue;
    }

    const t1 = getNumber(mapping.salaireT1);
    const t2 = getNumber(mapping.salaireT2);
    const t3 = getNumber(mapping.salaireT3);
    const t4 = getNumber(mapping.salaireT4);
    
    let annuel = getNumber(mapping.salaireAnnuel);
    if (!annuel || annuel === 0) {
      annuel = Math.round((t1 + t2 + t3 + t4) * 100) / 100;
    }

    const duree1 = getNumber(mapping.dureeT1) || (t1 > 0 ? 90 : 0);
    const duree2 = getNumber(mapping.dureeT2) || (t2 > 0 ? 90 : 0);
    const duree3 = getNumber(mapping.dureeT3) || (t3 > 0 ? 90 : 0);
    const duree4 = getNumber(mapping.dureeT4) || (t4 > 0 ? 90 : 0);

    records.push({
      id: `emp_${recordCounter}_${Date.now()}`,
      ligne: recordCounter,
      nss,
      nom,
      prenom,
      dateNaissance: getVal(mapping.dateNaissance),
      dureeT1: duree1,
      uniteT1: 'J',
      salaireT1: t1,
      dureeT2: duree2,
      uniteT2: 'J',
      salaireT2: t2,
      dureeT3: duree3,
      uniteT3: 'J',
      salaireT3: t3,
      dureeT4: duree4,
      uniteT4: 'J',
      salaireT4: t4,
      salaireAnnuel: annuel,
      dateEntree: getVal(mapping.dateEntree),
      dateSortie: getVal(mapping.dateSortie),
      observation: getVal(mapping.observation),
    });

    recordCounter++;
  }

  return {
    sheetNames,
    selectedSheet,
    headers,
    detectedMapping: mapping,
    records,
  };
}

/**
 * Creates and downloads a complete standard Excel template for Algerian employers
 */
export function generateSampleExcelWorkbook(): Uint8Array {
  const sampleHeaders = [
    'N° Sécurité Sociale (NSS)',
    'Nom',
    'Prénom',
    'Date de Naissance',
    'Salaire T1 (DA)',
    'Durée T1 (Jours)',
    'Salaire T2 (DA)',
    'Durée T2 (Jours)',
    'Salaire T3 (DA)',
    'Durée T3 (Jours)',
    'Salaire T4 (DA)',
    'Durée T4 (Jours)',
    'Total Annuel (DA)',
    'Date Entrée',
    'Date Sortie',
    'Observation',
  ];

  const sampleRows = [
    [
      '168501234512',
      'BENALI',
      'Karim',
      '15/04/1985',
      180000,
      90,
      180000,
      90,
      180000,
      90,
      180000,
      90,
      720000,
      '01/01/2020',
      '',
      '',
    ],
    [
      '169002345678',
      'MANSOURI',
      'Amina',
      '22/09/1990',
      165000,
      90,
      165000,
      90,
      165000,
      90,
      165000,
      90,
      660000,
      '01/03/2021',
      '',
      '',
    ],
    [
      '317803456789',
      'HAMIDI',
      'Rachid',
      '08/11/1978',
      240000,
      90,
      240000,
      90,
      240000,
      90,
      240000,
      90,
      960000,
      '15/05/2018',
      '',
      'CADRE DIRIGEANT',
    ],
    [
      '169504567890',
      'SAIDI',
      'Nour El Houda',
      '03/02/1995',
      120000,
      90,
      120000,
      90,
      120000,
      90,
      120000,
      90,
      480000,
      '01/01/2022',
      '',
      '',
    ],
    [
      '099205678901',
      'BOUKHELIFA',
      'Sofiane',
      '19/07/1992',
      140000,
      90,
      140000,
      90,
      140000,
      90,
      140000,
      90,
      560000,
      '10/01/2023',
      '',
      '',
    ],
    [
      '169806789012',
      'BELKACEM',
      'Yacine',
      '12/12/1998',
      95000,
      90,
      95000,
      90,
      0,
      0,
      0,
      0,
      190000,
      '01/01/2024',
      '30/06/2024',
      'DEMISSION T2',
    ],
    [
      '259307890123',
      'MEZIANI',
      'Farida',
      '28/08/1993',
      0,
      0,
      0,
      0,
      130000,
      90,
      130000,
      90,
      260000,
      '01/07/2024',
      '',
      'RECRUTEMENT T3',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, ...sampleRows]);

  // Set column widths
  ws['!cols'] = [
    { wch: 24 }, // NSS
    { wch: 18 }, // Nom
    { wch: 18 }, // Prénom
    { wch: 18 }, // Date Naiss
    { wch: 16 }, // Sal T1
    { wch: 16 }, // Durée T1
    { wch: 16 }, // Sal T2
    { wch: 16 }, // Durée T2
    { wch: 16 }, // Sal T3
    { wch: 16 }, // Durée T3
    { wch: 16 }, // Sal T4
    { wch: 16 }, // Durée T4
    { wch: 18 }, // Total
    { wch: 14 }, // Date Entree
    { wch: 14 }, // Date Sortie
    { wch: 22 }, // Observation
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Salaries_DAS');

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as Uint8Array;
}
