import React, { useState } from 'react';
import { X, Check, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import { ColumnMapping } from '../types/das';
import { autoDetectColumns } from '../utils/excelParser';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableHeaders: string[];
  currentMapping: ColumnMapping;
  onApplyMapping: (mapping: ColumnMapping) => void;
  lang: 'fr' | 'ar';
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  availableHeaders,
  currentMapping,
  onApplyMapping,
  lang,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...currentMapping });

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const resetAuto = () => {
    setMapping(autoDetectColumns(availableHeaders));
  };

  const handleSave = () => {
    onApplyMapping(mapping);
    onClose();
  };

  const requiredFields: Array<{ key: keyof ColumnMapping; label: string; desc: string }> = [
    { key: 'nss', label: 'N° Sécurité Sociale (NSS)', desc: '10 ou 12 chiffres obligatoires' },
    { key: 'nom', label: 'Nom du salarié', desc: 'Nom de famille' },
    { key: 'prenom', label: 'Prénom du salarié', desc: 'Prénom' },
    { key: 'dateNaissance', label: 'Date de Naissance', desc: 'Format JJMMAAAA ou DD/MM/YYYY' },
    { key: 'salaireT1', label: 'Salaire Trimestre 1', desc: 'Montant cotisable T1 en Dinars' },
    { key: 'salaireT2', label: 'Salaire Trimestre 2', desc: 'Montant cotisable T2 en Dinars' },
    { key: 'salaireT3', label: 'Salaire Trimestre 3', desc: 'Montant cotisable T3 en Dinars' },
    { key: 'salaireT4', label: 'Salaire Trimestre 4', desc: 'Montant cotisable T4 en Dinars' },
  ];

  const optionalFields: Array<{ key: keyof ColumnMapping; label: string; desc: string }> = [
    { key: 'salaireAnnuel', label: 'Total Salaire Annuel', desc: 'Calculé auto si non fourni (T1+T2+T3+T4)' },
    { key: 'dureeT1', label: 'Durée T1 (Jours)', desc: 'Défaut: 90 jours' },
    { key: 'dureeT2', label: 'Durée T2 (Jours)', desc: 'Défaut: 90 jours' },
    { key: 'dureeT3', label: 'Durée T3 (Jours)', desc: 'Défaut: 90 jours' },
    { key: 'dureeT4', label: 'Durée T4 (Jours)', desc: 'Défaut: 90 jours' },
    { key: 'dateEntree', label: 'Date d\'entrée', desc: 'Date d\'embauche si cours d\'année' },
    { key: 'dateSortie', label: 'Date de sortie', desc: 'Date de démission/départ' },
    { key: 'observation', label: 'Observation', desc: 'Motif départ ou statut' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                {isAr ? 'ربط أعمدة ملف إكسل بالحقول المطلوبة' : 'Correspondance des colonnes Excel'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'تأكد من مطابقة أعمدة جدولك مع حقول التصريح' : 'Associez chaque colonne de votre fichier aux rubriques CNAS'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAuto}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              title="Réinitialiser la détection automatique"
            >
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              <span>Auto</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
          {/* Required Fields Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Rubriques obligatoires CNAS</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                  Strict
                </span>
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requiredFields.map(({ key, label, desc }) => (
                <div key={key} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-200">{label}</label>
                    {!mapping[key] && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> Non affecté
                      </span>
                    )}
                  </div>
                  <select
                    value={mapping[key] || ''}
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                    className={`w-full bg-slate-800 border ${
                      !mapping[key] ? 'border-amber-600/60' : 'border-slate-700'
                    } rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  >
                    <option value="">-- Sélectionner une colonne --</option>
                    {availableHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Fields Section */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Rubriques complémentaires / facultatives
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optionalFields.map(({ key, label, desc }) => (
                <div key={key} className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                  <label className="text-xs font-medium text-slate-300 block mb-1">{label}</label>
                  <select
                    value={mapping[key] || ''}
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Ignorer / Calculer automatiquement --</option>
                    {availableHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Annuler'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isAr ? 'تطبيق المطابقة' : 'Valider le mapping'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
