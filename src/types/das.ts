/**
 * TypeScript types for Algerian CNAS Annual Wage Declaration (DAS)
 */

export interface EmployerInfo {
  numeroEmployeur: string; // 10 digits (ex: 1612345678)
  raisonSociale: string;   // Dénomination de l'entreprise
  adresse: string;
  anneeReference: number;  // e.g. 2024
  typeDeclaration: 'N' | 'C' | 'R'; // Normale, Complémentaire, Rectificative
  codeCentrePayeur: string; // e.g. 001
  wilayaCode: string;      // e.g. 16 (Alger), 31 (Oran), etc.
}

export type DureeUnite = 'M' | 'J' | 'H'; // Mois, Jours, Heures

export interface EmployeeRecord {
  id: string;
  ligne: number;
  nss: string;               // Numéro Sécurité Sociale (10 or 12 digits)
  nom: string;
  prenom: string;
  dateNaissance: string;     // YYYY-MM-DD or DD/MM/YYYY or JJMMAAAA
  
  // Trimestre 1
  dureeT1: number;
  uniteT1: DureeUnite;
  salaireT1: number;         // in DZD
  
  // Trimestre 2
  dureeT2: number;
  uniteT2: DureeUnite;
  salaireT2: number;         // in DZD
  
  // Trimestre 3
  dureeT3: number;
  uniteT3: DureeUnite;
  salaireT3: number;         // in DZD
  
  // Trimestre 4
  dureeT4: number;
  uniteT4: DureeUnite;
  salaireT4: number;         // in DZD

  // Totaux & Dates
  salaireAnnuel: number;     // in DZD
  dateEntree?: string;       // YYYY-MM-DD or DD/MM/YYYY or blank
  dateSortie?: string;       // YYYY-MM-DD or DD/MM/YYYY or blank
  observation?: string;

  // Validation
  errors?: string[];
  warnings?: string[];
}

export interface ColumnMapping {
  nss: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  salaireT1: string;
  salaireT2: string;
  salaireT3: string;
  salaireT4: string;
  salaireAnnuel?: string;
  dureeT1?: string;
  dureeT2?: string;
  dureeT3?: string;
  dureeT4?: string;
  dateEntree?: string;
  dateSortie?: string;
  observation?: string;
}

export interface GeneratedCNASFiles {
  enteteFileName: string;
  enteteContent: string;
  detailFileName: string;
  detailContent: string;
  totalEmployees: number;
  totalSalairesT1: number;
  totalSalairesT2: number;
  totalSalairesT3: number;
  totalSalairesT4: number;
  totalSalairesAnnuel: number;
  cotisationPatronale: number; // 25% CNAS + 0.5% FNAL etc (total 26% patronale or 25%)
  cotisationOuvriere: number;  // 9%
  cotisationTotal: number;     // 34.5%
}

export interface ValidationError {
  ligne: number;
  employeeNom: string;
  champ: string;
  message: string;
  gravite: 'error' | 'warning';
}
