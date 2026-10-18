/**
 * Formatting and generation engine for Algerian CNAS DAS files
 * Regulatory basis: Arrêté interministériel & Guide CNAS de télé-déclaration
 */

import { EmployeeRecord, EmployerInfo, GeneratedCNASFiles, ValidationError } from '../types/das';

// Algerian Wilayas list (58 Wilayas)
export const ALGERIAN_WILAYAS = [
  { code: '01', name: '01 - Adrar' },
  { code: '02', name: '02 - Chlef' },
  { code: '03', name: '03 - Laghouat' },
  { code: '04', name: '04 - Oum El Bouaghi' },
  { code: '05', name: '05 - Batna' },
  { code: '06', name: '06 - Béjaïa' },
  { code: '07', name: '07 - Biskra' },
  { code: '08', name: '08 - Béchar' },
  { code: '09', name: '09 - Blida' },
  { code: '10', name: '10 - Bouira' },
  { code: '11', name: '11 - Tamanrasset' },
  { code: '12', name: '12 - Tébessa' },
  { code: '13', name: '13 - Tlemcen' },
  { code: '14', name: '14 - Tiaret' },
  { code: '15', name: '15 - Tizi Ouzou' },
  { code: '16', name: '16 - Alger' },
  { code: '17', name: '17 - Djelfa' },
  { code: '18', name: '18 - Jijel' },
  { code: '19', name: '19 - Sétif' },
  { code: '20', name: '20 - Saïda' },
  { code: '21', name: '21 - Skikda' },
  { code: '22', name: '22 - Sidi Bel Abbès' },
  { code: '23', name: '23 - Annaba' },
  { code: '24', name: '24 - Guelma' },
  { code: '25', name: '25 - Constantine' },
  { code: '26', name: '26 - Médéa' },
  { code: '27', name: '27 - Mostaganem' },
  { code: '28', name: '28 - M\'Sila' },
  { code: '29', name: '29 - Mascara' },
  { code: '30', name: '30 - Ouargla' },
  { code: '31', name: '31 - Oran' },
  { code: '32', name: '32 - El Bayadh' },
  { code: '33', name: '33 - Illizi' },
  { code: '34', name: '34 - Bordj Bou Arréridj' },
  { code: '35', name: '35 - Boumerdès' },
  { code: '36', name: '36 - El Tarf' },
  { code: '37', name: '37 - Tindouf' },
  { code: '38', name: '38 - Tissemsilt' },
  { code: '39', name: '39 - El Oued' },
  { code: '40', name: '40 - Khenchela' },
  { code: '41', name: '41 - Souk Ahras' },
  { code: '42', name: '42 - Tipaza' },
  { code: '43', name: '43 - Mila' },
  { code: '44', name: '44 - Aïn Defla' },
  { code: '45', name: '45 - Naâma' },
  { code: '46', name: '46 - Aïn Témouchent' },
  { code: '47', name: '47 - Ghardaïa' },
  { code: '48', name: '48 - Relizane' },
  { code: '49', name: '49 - Timimoun' },
  { code: '50', name: '50 - Bordj Badji Mokhtar' },
  { code: '51', name: '51 - Ouled Djellal' },
  { code: '52', name: '52 - Béni Abbès' },
  { code: '53', name: '53 - In Salah' },
  { code: '54', name: '54 - In Guezzam' },
  { code: '55', name: '55 - Touggourt' },
  { code: '56', name: '56 - Djanet' },
  { code: '57', name: '57 - El M\'Ghair' },
  { code: '58', name: '58 - El Meniaa' },
];

/**
 * Remove accents and special characters to ensure ASCII compatibility for CNAS text parsing
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_./]/g, ' ')
    .toUpperCase()
    .trim();
}

/**
 * Left-aligned text padded with spaces to the right
 */
export function padString(str: string | null | undefined, length: number): string {
  const sanitized = sanitizeText(str);
  if (sanitized.length >= length) {
    return sanitized.substring(0, length);
  }
  return sanitized.padEnd(length, ' ');
}

/**
 * Right-aligned integer/numeric padded with leading zeroes
 */
export function padNumber(num: number | string | null | undefined, length: number): string {
  let valStr = '';
  if (typeof num === 'number') {
    valStr = Math.round(num).toString();
  } else if (num) {
    valStr = num.toString().replace(/[^0-9]/g, '');
  }
  if (valStr.length >= length) {
    return valStr.substring(valStr.length - length);
  }
  return valStr.padStart(length, '0');
}

/**
 * Convert DZD amount to CNAS centimes (e.g. 150000.50 -> 15000050) and zero-pad
 */
export function padAmountInCentimes(amountDZD: number, length: number): string {
  const centimes = Math.round((Number(amountDZD) || 0) * 100);
  const centimesStr = Math.max(0, centimes).toString();
  if (centimesStr.length >= length) {
    return centimesStr.substring(centimesStr.length - length);
  }
  return centimesStr.padStart(length, '0');
}

/**
 * Formats date into strict JJMMAAAA (8 digits) format
 * Supports Date objects, serial Excel numbers, DD/MM/YYYY, YYYY-MM-DD, etc.
 */
export function formatToJJMMAAAA(input: string | number | Date | null | undefined): string {
  if (!input) return '        '; // 8 spaces if not specified
  
  let d: number | undefined;
  let m: number | undefined;
  let y: number | undefined;

  if (input instanceof Date && !isNaN(input.getTime())) {
    d = input.getDate();
    m = input.getMonth() + 1;
    y = input.getFullYear();
  } else if (typeof input === 'number') {
    // Check if Excel serial date (e.g., 35000 - 55000)
    if (input > 20000 && input < 80000) {
      const utcDays = Math.floor(input - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      d = dateInfo.getUTCDate();
      m = dateInfo.getUTCMonth() + 1;
      y = dateInfo.getUTCFullYear();
    } else {
      const s = input.toString();
      if (s.length === 8) {
        return s; // already JJMMAAAA
      }
    }
  } else if (typeof input === 'string') {
    const clean = input.trim();
    if (!clean) return '        ';
    
    // Check if format is YYYY-MM-DD
    const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      y = parseInt(isoMatch[1], 10);
      m = parseInt(isoMatch[2], 10);
      d = parseInt(isoMatch[3], 10);
    } else {
      // Check if format is DD-MM-YYYY or DD/MM/YYYY
      const ddmmyyyyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (ddmmyyyyMatch) {
        d = parseInt(ddmmyyyyMatch[1], 10);
        m = parseInt(ddmmyyyyMatch[2], 10);
        y = parseInt(ddmmyyyyMatch[3], 10);
      } else {
        // Raw 8 digits
        const rawDigits = clean.replace(/[^0-9]/g, '');
        if (rawDigits.length === 8) {
          return rawDigits;
        }
      }
    }
  }

  if (d !== undefined && m !== undefined && y !== undefined) {
    const dd = d.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const yyyy = y.toString().padStart(4, '0');
    return `${dd}${mm}${yyyy}`;
  }

  return '        ';
}

/**
 * Validates NSS (Numéro de Sécurité Sociale en Algérie)
 * Typically 10 or 12 digits (Wilaya 2 digits + Annee naiss 2 digits + code 6 digits + clé 2 digits)
 */
export function cleanNSS(nss: string | number | undefined): string {
  if (!nss) return '000000000000';
  const digits = nss.toString().replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    // Sometimes provided without 2-digit key, append '00' or pad to 12
    return digits.padEnd(12, '0');
  }
  if (digits.length >= 12) {
    return digits.substring(0, 12);
  }
  return digits.padStart(12, '0');
}

/**
 * Generates the official CNAS file names
 * Header: D{YY}E{10_DIGIT_EMPLOYER}.TXT
 * Detail: D{YY}S{10_DIGIT_EMPLOYER}.TXT
 */
export function getCNASFileNames(employer: EmployerInfo) {
  const yy = (employer.anneeReference % 100).toString().padStart(2, '0');
  const empId = padNumber(employer.numeroEmployeur, 10);
  return {
    enteteFileName: `D${yy}E${empId}.TXT`,
    detailFileName: `D${yy}S${empId}.TXT`,
  };
}

/**
 * Format the single Header (Entête) line according to official CNAS teledeclaration spec
 * Structure:
 * - N° Employeur: 10 pos
 * - Type Déclaration (N, C, R): 1 pos
 * - Année de Réf (YYYY): 4 pos
 * - Centre Payeur / Agence: 4 pos
 * - Dénomination / Raison Sociale: 30 pos
 * - Adresse Employeur: 40 pos
 * - Nombre de salariés: 6 pos
 * - Total Salaires T1 (centimes): 12 pos
 * - Total Salaires T2 (centimes): 12 pos
 * - Total Salaires T3 (centimes): 12 pos
 * - Total Salaires T4 (centimes): 12 pos
 * - Total Salaires Annuel (centimes): 14 pos
 */
export function formatEnteteLine(
  employer: EmployerInfo,
  totalEmployees: number,
  sumT1: number,
  sumT2: number,
  sumT3: number,
  sumT4: number,
  sumAnnuel: number
): string {
  const numEmp = padNumber(employer.numeroEmployeur, 10);
  const typeDecl = (employer.typeDeclaration || 'N').toUpperCase().charAt(0);
  const anneeRef = padNumber(employer.anneeReference, 4);
  const centrePayeur = padString(employer.codeCentrePayeur || '001', 4);
  const raisonSociale = padString(employer.raisonSociale || 'ENTREPRISE', 30);
  const adresse = padString(employer.adresse || 'ALGER ALGERIE', 40);
  const countSalaries = padNumber(totalEmployees, 6);
  
  const t1Centimes = padAmountInCentimes(sumT1, 12);
  const t2Centimes = padAmountInCentimes(sumT2, 12);
  const t3Centimes = padAmountInCentimes(sumT3, 12);
  const t4Centimes = padAmountInCentimes(sumT4, 12);
  const totCentimes = padAmountInCentimes(sumAnnuel, 14);

  return `${numEmp}${typeDecl}${anneeRef}${centrePayeur}${raisonSociale}${adresse}${countSalaries}${t1Centimes}${t2Centimes}${t3Centimes}${t4Centimes}${totCentimes}`;
}

/**
 * Format an Employee (Détail) record line according to official CNAS teledeclaration spec
 * Fixed positions (Total 194 characters):
 * 1. N° Employeur (10 pos)
 * 2. Année Réf (4 pos)
 * 3. N° Ligne (6 pos)
 * 4. N° Immatriculation + Clé (12 pos)
 * 5. Nom (25 pos)
 * 6. Prénom (25 pos)
 * 7. Date de Naissance (8 pos, JJMMAAAA)
 * 8. Durée T1 (3 pos)
 * 9. Unité T1 (1 pos: M, J, H)
 * 10. Salaire T1 (10 pos, centimes)
 * 11. Durée T2 (3 pos)
 * 12. Unité T2 (1 pos)
 * 13. Salaire T2 (10 pos, centimes)
 * 14. Durée T3 (3 pos)
 * 15. Unité T3 (1 pos)
 * 16. Salaire T3 (10 pos, centimes)
 * 17. Durée T4 (3 pos)
 * 18. Unité T4 (1 pos)
 * 19. Salaire T4 (10 pos, centimes)
 * 20. Montant Annuel des Salaires (12 pos, centimes)
 * 21. Date d'Entrée (8 pos, JJMMAAAA or 8 spaces)
 * 22. Date de Sortie (8 pos, JJMMAAAA or 8 spaces)
 * 23. Observation (20 pos)
 */
export function formatDetailLine(
  employer: EmployerInfo,
  emp: EmployeeRecord,
  index: number
): string {
  const numEmp = padNumber(employer.numeroEmployeur, 10);
  const anneeRef = padNumber(employer.anneeReference, 4);
  const numLigne = padNumber(index + 1, 6);
  const nssFormatted = cleanNSS(emp.nss);
  const nomFormatted = padString(emp.nom, 25);
  const prenomFormatted = padString(emp.prenom, 25);
  const dateNaiss = formatToJJMMAAAA(emp.dateNaissance);

  // Trimestre 1
  const dureeT1 = padNumber(emp.dureeT1 ?? 90, 3);
  const uniteT1 = (emp.uniteT1 || 'J').charAt(0).toUpperCase();
  const salT1 = padAmountInCentimes(emp.salaireT1, 10);

  // Trimestre 2
  const dureeT2 = padNumber(emp.dureeT2 ?? 90, 3);
  const uniteT2 = (emp.uniteT2 || 'J').charAt(0).toUpperCase();
  const salT2 = padAmountInCentimes(emp.salaireT2, 10);

  // Trimestre 3
  const dureeT3 = padNumber(emp.dureeT3 ?? 90, 3);
  const uniteT3 = (emp.uniteT3 || 'J').charAt(0).toUpperCase();
  const salT3 = padAmountInCentimes(emp.salaireT3, 10);

  // Trimestre 4
  const dureeT4 = padNumber(emp.dureeT4 ?? 90, 3);
  const uniteT4 = (emp.uniteT4 || 'J').charAt(0).toUpperCase();
  const salT4 = padAmountInCentimes(emp.salaireT4, 10);

  // Annuel
  const salAnnuel = padAmountInCentimes(emp.salaireAnnuel, 12);
  const dateEntree = formatToJJMMAAAA(emp.dateEntree);
  const dateSortie = formatToJJMMAAAA(emp.dateSortie);
  const observation = padString(emp.observation || '', 20);

  return `${numEmp}${anneeRef}${numLigne}${nssFormatted}${nomFormatted}${prenomFormatted}${dateNaiss}${dureeT1}${uniteT1}${salT1}${dureeT2}${uniteT2}${salT2}${dureeT3}${uniteT3}${salT3}${dureeT4}${uniteT4}${salT4}${salAnnuel}${dateEntree}${dateSortie}${observation}`;
}

/**
 * Validate all employee records according to CNAS strict rules
 */
export function validateEmployeeRecords(
  records: EmployeeRecord[],
  employer: EmployerInfo
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!employer.numeroEmployeur || employer.numeroEmployeur.trim().length !== 10) {
    errors.push({
      ligne: 0,
      employeeNom: 'Employeur',
      champ: 'N° Employeur',
      message: 'Le numéro employeur / cotisant doit comporter exactement 10 chiffres.',
      gravite: 'error',
    });
  }

  records.forEach((rec, idx) => {
    const ligneNum = idx + 1;
    const nameStr = `${rec.nom || ''} ${rec.prenom || ''}`.trim() || `Ligne ${ligneNum}`;

    // NSS check
    const cleanNum = (rec.nss || '').replace(/[^0-9]/g, '');
    if (!cleanNum || (cleanNum.length !== 10 && cleanNum.length !== 12)) {
      errors.push({
        ligne: ligneNum,
        employeeNom: nameStr,
        champ: 'N° Sécurité Sociale (NSS)',
        message: `NSS "${rec.nss || ''}" invalide. Doit comporter 10 ou 12 chiffres.`,
        gravite: 'error',
      });
    }

    // Nom / Prénom
    if (!rec.nom || rec.nom.trim().length === 0) {
      errors.push({
        ligne: ligneNum,
        employeeNom: nameStr,
        champ: 'Nom',
        message: 'Le nom du salarié est obligatoire.',
        gravite: 'error',
      });
    }
    if (!rec.prenom || rec.prenom.trim().length === 0) {
      errors.push({
        ligne: ligneNum,
        employeeNom: nameStr,
        champ: 'Prénom',
        message: 'Le prénom du salarié est obligatoire.',
        gravite: 'error',
      });
    }

    // Date de naissance
    const birthFormatted = formatToJJMMAAAA(rec.dateNaissance);
    if (birthFormatted.trim().length !== 8) {
      errors.push({
        ligne: ligneNum,
        employeeNom: nameStr,
        champ: 'Date de Naissance',
        message: 'Date de naissance manquante ou invalide (format JJMMAAAA requis).',
        gravite: 'error',
      });
    }

    // Sum check
    const sumTrimestres = Math.round(((rec.salaireT1 || 0) + (rec.salaireT2 || 0) + (rec.salaireT3 || 0) + (rec.salaireT4 || 0)) * 100) / 100;
    const annualReported = Math.round((rec.salaireAnnuel || 0) * 100) / 100;
    const diff = Math.abs(sumTrimestres - annualReported);

    if (diff > 1.0) {
      errors.push({
        ligne: ligneNum,
        employeeNom: nameStr,
        champ: 'Salaires (T1+T2+T3+T4)',
        message: `La somme des 4 trimestres (${sumTrimestres.toLocaleString('fr-DZ')} DA) ne correspond pas au total annuel déclaré (${annualReported.toLocaleString('fr-DZ')} DA). Écart de ${diff.toFixed(2)} DA.`,
        gravite: 'warning',
      });
    }

    // Negative salaries check
    if ((rec.salaireT1 || 0) < 0 || (rec.salaireT2 || 0) < 0 || (rec.salaireT3 || 0) < 0 || (rec.salaireT4 || 0) < 0) {
      errors.push({
        ligne: ligneNum,
        employeeNom: nameStr,
        champ: 'Montant Salaire',
        message: 'Un montant de salaire trimestriel ne peut pas être négatif.',
        gravite: 'error',
      });
    }
  });

  return errors;
}

/**
 * Generate full CNAS Files payload
 */
export function generateCNASFiles(
  records: EmployeeRecord[],
  employer: EmployerInfo
): GeneratedCNASFiles {
  const { enteteFileName, detailFileName } = getCNASFileNames(employer);

  let sumT1 = 0;
  let sumT2 = 0;
  let sumT3 = 0;
  let sumT4 = 0;
  let sumAnnuel = 0;

  const detailLines: string[] = [];

  records.forEach((rec, idx) => {
    // If annual wage is 0 or not matching, recompute or use reported
    const s1 = rec.salaireT1 || 0;
    const s2 = rec.salaireT2 || 0;
    const s3 = rec.salaireT3 || 0;
    const s4 = rec.salaireT4 || 0;
    const sAnnuel = rec.salaireAnnuel > 0 ? rec.salaireAnnuel : (s1 + s2 + s3 + s4);

    sumT1 += s1;
    sumT2 += s2;
    sumT3 += s3;
    sumT4 += s4;
    sumAnnuel += sAnnuel;

    const line = formatDetailLine(employer, { ...rec, salaireAnnuel: sAnnuel }, idx);
    detailLines.push(line);
  });

  const enteteLine = formatEnteteLine(
    employer,
    records.length,
    sumT1,
    sumT2,
    sumT3,
    sumT4,
    sumAnnuel
  );

  // CNAS lines typically terminate with standard Windows CRLF (\r\n) as standard for Algerian state portals
  const enteteContent = enteteLine + '\r\n';
  const detailContent = detailLines.join('\r\n') + '\r\n';

  // Algerian CNAS Contribution Rates:
  // Part Patronale: 25.0% (Assurance sociale, accident du travail, retraite, chômage, etc.) + 0.5% FNAL = 25.5% or 25% base
  // Part Ouvrière (retenue à la source): 9.0%
  // Total cotisations CNAS: 34.5% or 34.0%
  const cotisationPatronale = Math.round(sumAnnuel * 0.255 * 100) / 100;
  const cotisationOuvriere = Math.round(sumAnnuel * 0.09 * 100) / 100;
  const cotisationTotal = Math.round((cotisationPatronale + cotisationOuvriere) * 100) / 100;

  return {
    enteteFileName,
    enteteContent,
    detailFileName,
    detailContent,
    totalEmployees: records.length,
    totalSalairesT1: sumT1,
    totalSalairesT2: sumT2,
    totalSalairesT3: sumT3,
    totalSalairesT4: sumT4,
    totalSalairesAnnuel: sumAnnuel,
    cotisationPatronale,
    cotisationOuvriere,
    cotisationTotal,
  };
}
