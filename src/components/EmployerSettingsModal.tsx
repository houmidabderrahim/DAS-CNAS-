import React, { useState } from 'react';
import { X, Building2, Check, AlertCircle, FileCode, Info } from 'lucide-react';
import { EmployerInfo } from '../types/das';
import { ALGERIAN_WILAYAS, getCNASFileNames } from '../utils/cnasFormatters';

interface EmployerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employer: EmployerInfo;
  onSave: (employer: EmployerInfo) => void;
  lang: 'fr' | 'ar';
}

export const EmployerSettingsModal: React.FC<EmployerSettingsModalProps> = ({
  isOpen,
  onClose,
  employer,
  onSave,
  lang,
}) => {
  const [formData, setFormData] = useState<EmployerInfo>({ ...employer });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const fileNames = getCNASFileNames(formData);

  const validate = () => {
    const errs: Record<string, string> = {};
    const num = formData.numeroEmployeur ? formData.numeroEmployeur.replace(/[^0-9]/g, '') : '';
    
    if (num.length !== 10) {
      errs.numeroEmployeur = 'Le N° Employeur / Cotisant doit contenir exactement 10 chiffres (ex: 1612345678).';
    }
    if (!formData.raisonSociale || formData.raisonSociale.trim().length === 0) {
      errs.raisonSociale = 'La raison sociale est requise.';
    }
    if (!formData.anneeReference || formData.anneeReference < 2000 || formData.anneeReference > 2030) {
      errs.anneeReference = 'Année de déclaration invalide (ex: 2024).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                {isAr ? 'بيانات رب العمل / المؤسسة (CNAS)' : 'Paramètres Employeur / Cotisant CNAS'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr 
                  ? 'المعلومات المطلوبة لتوليد اسم ومحتوى ملف Entête' 
                  : 'Nécessaire pour le nommage et la ligne d\'entête officielle'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* N° Employeur (10 chiffres) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                {isAr ? 'رقم المستخدم / رقم المشترك (10 أرقام)' : 'N° Employeur / Cotisant (10 chiffres)'} *
              </label>
              <span className="text-[11px] font-mono text-emerald-400">
                {formData.numeroEmployeur.length}/10
              </span>
            </div>
            <input
              type="text"
              maxLength={10}
              placeholder="Ex: 1612345678"
              value={formData.numeroEmployeur}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setFormData({ ...formData, numeroEmployeur: val });
              }}
              className={`mt-1.5 w-full bg-slate-800/90 border ${
                errors.numeroEmployeur ? 'border-rose-500' : 'border-slate-700'
              } rounded-lg px-3 py-2 text-sm text-slate-100 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
            />
            {errors.numeroEmployeur ? (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.numeroEmployeur}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Code wilaya (2 premiers chiffres) + numéro d'adhérent attribué par la CNAS
              </p>
            )}
          </div>

          {/* Raison Sociale */}
          <div>
            <label className="text-xs font-medium text-slate-300">
              {isAr ? 'اسم المؤسسة / التسمية القانونية' : 'Raison Sociale / Dénomination'} *
            </label>
            <input
              type="text"
              maxLength={30}
              placeholder="Ex: SARL ALGERIE TECHNOLOGIE"
              value={formData.raisonSociale}
              onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value.toUpperCase() })}
              className={`mt-1.5 w-full bg-slate-800/90 border ${
                errors.raisonSociale ? 'border-rose-500' : 'border-slate-700'
              } rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
            />
          </div>

          {/* Two Columns: Année de Référence & Type de Déclaration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300">
                {isAr ? 'سنة التصريح (Année Réf)' : 'Année de Déclaration'} *
              </label>
              <select
                value={formData.anneeReference}
                onChange={(e) => setFormData({ ...formData, anneeReference: parseInt(e.target.value, 10) })}
                className="mt-1.5 w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024 (Dernière campagne)</option>
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">
                {isAr ? 'نوع التصريح' : 'Type de Déclaration'} *
              </label>
              <select
                value={formData.typeDeclaration}
                onChange={(e) => setFormData({ ...formData, typeDeclaration: e.target.value as any })}
                className="mt-1.5 w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="N">N - Normale (Nouvelle déclaration)</option>
                <option value="C">C - Complémentaire (Ajout de salariés)</option>
                <option value="R">R - Rectificative (Après contrôle CNAS)</option>
              </select>
            </div>
          </div>

          {/* Wilaya & Centre Payeur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300">
                {isAr ? 'الولاية التابعة لـ CNAS' : 'Wilaya de rattachement'}
              </label>
              <select
                value={formData.wilayaCode}
                onChange={(e) => setFormData({ ...formData, wilayaCode: e.target.value })}
                className="mt-1.5 w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">
                {isAr ? 'مركز الدفع / رمز الوكالة' : 'Centre Payeur / Code Agence'}
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="Ex: 001"
                value={formData.codeCentrePayeur}
                onChange={(e) => setFormData({ ...formData, codeCentrePayeur: e.target.value })}
                className="mt-1.5 w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="text-xs font-medium text-slate-300">
              {isAr ? 'العنوان' : 'Adresse de l\'entreprise'}
            </label>
            <input
              type="text"
              maxLength={40}
              placeholder="Ex: 12 RUE DIDOUCHE MOURAD, ALGER"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value.toUpperCase() })}
              className="mt-1.5 w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* CNAS File Names Preview Badge */}
          <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <FileCode className="w-3.5 h-3.5" />
              <span>Noms officiels des deux fichiers générés :</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300">
                <span className="text-slate-500 block text-[10px] font-sans">1. Fichier Entête :</span>
                <span className="text-emerald-400 font-bold">{fileNames.enteteFileName}</span>
              </div>
              <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300">
                <span className="text-slate-500 block text-[10px] font-sans">2. Fichier Salariés :</span>
                <span className="text-sky-400 font-bold">{fileNames.detailFileName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Annuler'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isAr ? 'حفظ البيانات' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
