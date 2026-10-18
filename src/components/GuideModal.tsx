import React from 'react';
import { X, HelpCircle, ExternalLink, FileText, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'ar';
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                {isAr ? 'دليل إعداد وإيداع التصريح السنوي للأجور (DAS CNAS)' : 'Guide officiel de télé-déclaration DAS CNAS'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'خطوات توليد ورفع الملفين عبر البوابة الرقمية للضمان الاجتماعي' : 'Procédure technique pour teledeclaration.cnas.dz'}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Explanation of the 2 files */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <h4 className="font-semibold text-emerald-400 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Pourquoi la CNAS exige-t-elle exactement 2 fichiers ?</span>
            </h4>
            <p className="leading-relaxed text-slate-300">
              Conformément à la réglementation algérienne de la Sécurité Sociale, la télédéclaration de la DAS annuelle nécessite la transmission de deux fichiers au format texte pur (.TXT) à longueur fixe, sans séparateur :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-mono text-emerald-400 font-bold block">1. Fichier Entête (DaaE...)</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Contient le N° Employeur, la raison sociale, l'adresse, et le récapitulatif global des 4 trimestres et du montant annuel en centimes.
                </p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-mono text-sky-400 font-bold block">2. Fichier Détail (DaaS...)</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Contient une ligne de 194 caractères fixes pour chaque salarié avec son NSS (12 chiffres), état civil, et salaires T1, T2, T3, T4.
                </p>
              </div>
            </div>
          </div>

          {/* Step by step checklist */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Procédure en 4 étapes simples :
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-semibold text-slate-200">Préparez votre fichier Excel</div>
                  <p className="text-slate-400 mt-0.5">
                    Utilisez votre fichier de paie habituel (PC Paie, Sage, etc.) ou cliquez sur "Modèle Excel vierge" dans l'application pour télécharger le tableau standard pré-formaté.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="font-semibold text-slate-200">Importez le fichier dans l'application</div>
                  <p className="text-slate-400 mt-0.5">
                    Glissez-déposez le fichier Excel. Notre algorithme audite automatiquement chaque numéro de sécurité sociale (NSS) et vérifie la stricte concordance : T1 + T2 + T3 + T4 = Total Annuel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-semibold text-slate-200">Générez et téléchargez le Pack ZIP</div>
                  <p className="text-slate-400 mt-0.5">
                    Cliquez sur "Générer les 2 fichiers CNAS". Téléchargez les deux fichiers texte conformes nommés aux normes exactes de votre N° Cotisant (ex: D24E...TXT et D24S...TXT).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <div className="font-semibold text-slate-200">Téléversez sur le portail CNAS</div>
                  <p className="text-slate-400 mt-0.5">
                    Rendez-vous sur <a href="https://teledeclaration.cnas.dz" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-mono">teledeclaration.cnas.dz</a> avec vos identifiants d'agence, chargez les deux fichiers, validez la déclaration et imprimez votre récépissé d'accusé de réception.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CNAS Regulation reminder */}
          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-200/90 leading-relaxed">
              <strong>Échéance réglementaire :</strong> En Algérie, la DAS doit être impérativement déposée avant le <strong>31 Janvier</strong> de l'année N+1 pour éviter les pénalités de retard prévues par la législation de sécurité sociale.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <a
            href="https://teledeclaration.cnas.dz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <span>Ouvrir teledeclaration.cnas.dz</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            {isAr ? 'إغلاق' : 'Fermer le guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
