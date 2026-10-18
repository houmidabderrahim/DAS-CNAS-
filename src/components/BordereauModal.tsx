import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { EmployerInfo, GeneratedCNASFiles } from '../types/das';

interface BordereauModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: EmployerInfo;
  files: GeneratedCNASFiles;
  lang: 'fr' | 'ar';
}

export const BordereauModal: React.FC<BordereauModalProps> = ({
  isOpen,
  onClose,
  employer,
  files,
  lang,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Bordereau Récapitulatif Annuel des Cotisations CNAS (DAS {employer.anneeReference})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 bg-slate-800/60 p-4 sm:p-6 overflow-y-auto flex justify-center">
          <div className="bg-white text-slate-900 w-full max-w-3xl p-8 rounded-lg shadow-xl print:shadow-none print:p-0 font-sans print:max-w-none text-xs">
            {/* Algerian Official Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                République Algérienne Démocratique et Populaire
              </h2>
              <h3 className="text-sm font-extrabold uppercase text-slate-900 mt-1">
                Caisse Nationale des Assurances Sociales des Travailleurs Salariés
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                DIRECTION GÉNÉRALE — TÉLÉ-DÉCLARATION CNAS
              </p>
              <div className="mt-3 inline-block bg-slate-100 border border-slate-300 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide text-slate-900">
                Bordereau Récapitulatif de la Déclaration Annuelle des Salaires (DAS)
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Exercice : 01/01/{employer.anneeReference} au 31/12/{employer.anneeReference}
              </p>
            </div>

            {/* Employer Block */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 mb-5 bg-slate-50">
              <div className="space-y-1">
                <div>
                  <span className="text-slate-500 font-medium">N° Cotisant / Employeur : </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {employer.numeroEmployeur || '1612345678'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Raison Sociale : </span>
                  <span className="font-bold text-slate-900">
                    {employer.raisonSociale || 'SARL EXEMPLE'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Adresse : </span>
                  <span className="text-slate-800">{employer.adresse || 'ALGER'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="text-slate-500 font-medium">Wilaya CNAS : </span>
                  <span className="font-bold text-slate-900">{employer.wilayaCode} - Agence CNAS</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Centre Payeur : </span>
                  <span className="font-mono text-slate-900">{employer.codeCentrePayeur || '001'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Type Déclaration : </span>
                  <span className="font-bold text-slate-900">
                    {employer.typeDeclaration === 'N' ? 'Normale (Initiale)' : employer.typeDeclaration === 'C' ? 'Complémentaire' : 'Rectificative'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Nombre de salariés déclarés : </span>
                  <span className="font-bold text-emerald-700 text-sm">{files.totalEmployees}</span>
                </div>
              </div>
            </div>

            {/* Quarterly Breakdown Table */}
            <div className="mb-5">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 tracking-wide">
                1. Récapitulatif trimestriel des salaires déclarés
              </h4>
              <table className="w-full border-collapse border border-slate-300 text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <th className="p-2 border border-slate-300">Période</th>
                    <th className="p-2 border border-slate-300">Désignation</th>
                    <th className="p-2 border border-slate-300 text-right">Montant Brut Cotisable (DZD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">Trimestre 1</td>
                    <td className="p-2 border border-slate-300">Janvier - Février - Mars</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-medium">
                      {files.totalSalairesT1.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">Trimestre 2</td>
                    <td className="p-2 border border-slate-300">Avril - Mai - Juin</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-medium">
                      {files.totalSalairesT2.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">Trimestre 3</td>
                    <td className="p-2 border border-slate-300">Juillet - Août - Septembre</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-medium">
                      {files.totalSalairesT3.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-mono">Trimestre 4</td>
                    <td className="p-2 border border-slate-300">Octobre - Novembre - Décembre</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-medium">
                      {files.totalSalairesT4.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                    <td colSpan={2} className="p-2 border border-slate-300 uppercase">
                      Total Annuel Cotisable Déclaré (Assiette CNAS)
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-sm text-emerald-800">
                      {files.totalSalairesAnnuel.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Social Contributions Calculation Table (Algerian Rates 34.5%) */}
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 tracking-wide">
                2. Décompte réglementaire des cotisations de Sécurité Sociale (Taux légaux algériens)
              </h4>
              <table className="w-full border-collapse border border-slate-300 text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <th className="p-2 border border-slate-300">Nature de la Cotisation</th>
                    <th className="p-2 border border-slate-300 text-center">Taux Réglementaire</th>
                    <th className="p-2 border border-slate-300 text-right">Assiette de Calcul</th>
                    <th className="p-2 border border-slate-300 text-right">Montant de la Cotisation (DZD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border border-slate-300">
                      Part Ouvrière (Retenue salariale 9%)
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-semibold">9.00 %</td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      {files.totalSalairesAnnuel.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-900">
                      {files.cotisationOuvriere.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300">
                      Part Patronale globale (Assurances, Retraite, Chômage, FNAL)
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-semibold">25.50 %</td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      {files.totalSalairesAnnuel.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-900">
                      {files.cotisationPatronale.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold text-slate-900 border-t-2 border-emerald-500">
                    <td className="p-2 border border-slate-300 uppercase text-emerald-950">
                      Total Général des Cotisations CNAS Dues
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono text-emerald-900">34.50 %</td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-emerald-900">
                      {files.totalSalairesAnnuel.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-sm text-emerald-800 font-extrabold">
                      {files.cotisationTotal.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Certification Signature Block */}
            <div className="grid grid-cols-2 gap-6 mt-8 pt-4 border-t border-slate-300 text-center">
              <div className="border border-slate-300 rounded p-4 h-32 flex flex-col justify-between">
                <span className="font-semibold text-slate-700">Cachet & Signature de l'Employeur</span>
                <span className="text-[10px] text-slate-400">Date et mention "Certifié exact et sincère"</span>
              </div>
              <div className="border border-slate-300 rounded p-4 h-32 flex flex-col justify-between bg-slate-50">
                <span className="font-semibold text-slate-700">Visa / Accusé de réception CNAS</span>
                <span className="text-[10px] text-slate-400">Généré via portail Télé-déclaration</span>
              </div>
            </div>

            {/* Footer reference */}
            <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-2 font-mono">
              Fichiers associés télétransmis : {files.enteteFileName} & {files.detailFileName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
