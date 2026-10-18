import React from 'react';
import { 
  Building2, 
  HelpCircle, 
  FileText, 
  Download, 
  Settings, 
  Globe2, 
  ShieldCheck, 
  CheckCircle2, 
  Minus, 
  Square, 
  X,
  ExternalLink
} from 'lucide-react';
import { EmployerInfo } from '../types/das';

interface DesktopHeaderProps {
  employer: EmployerInfo;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenBordereau: () => void;
  onDownloadTemplate: () => void;
  onReset: () => void;
  lang: 'fr' | 'ar';
  setLang: (lang: 'fr' | 'ar') => void;
  hasData: boolean;
  onOpenPreview: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  employer,
  onOpenSettings,
  onOpenGuide,
  onOpenBordereau,
  onDownloadTemplate,
  onReset,
  lang,
  setLang,
  hasData,
  onOpenPreview,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="bg-slate-900 border-b border-slate-700/80 select-none shadow-md">
      {/* Desktop Window Titlebar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-xs border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          {/* Algerian Flag Pin */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="inline-block w-3.5 h-2.5 rounded-xs overflow-hidden shadow-xs relative border border-slate-600">
              <span className="absolute inset-y-0 left-0 w-1/2 bg-emerald-600"></span>
              <span className="absolute inset-y-0 right-0 w-1/2 bg-white"></span>
              <span className="absolute inset-0 flex items-center justify-center text-[7px] text-red-600 font-bold leading-none">★</span>
            </span>
            <span className="font-semibold text-slate-200">DAS Studio Algérie</span>
            <span className="text-[10px] text-emerald-400 font-mono">v2025.2</span>
          </div>

          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 truncate max-w-xs sm:max-w-md hidden sm:inline">
            {isAr 
              ? 'توليد ملفات التصريح السنوي بالأجور - الضمان الاجتماعي CNAS'
              : 'Générateur officiel des 2 fichiers DAS CNAS (Télé-déclaration)'}
          </span>
        </div>

        {/* Window controls styling for desktop app feel */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Format CNAS Conforme</span>
          </div>
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button 
              type="button" 
              title="Réduire" 
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button 
              type="button" 
              title="Agrandir" 
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            >
              <Square className="w-2.5 h-2.5" />
            </button>
            <button 
              type="button" 
              title="Fermer" 
              onClick={onReset}
              className="p-1 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation & Employer Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Logo badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">
                  CNAS DAS Generator
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Télé-déclaration
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'الجزائر - Caisse Nationale des Assurances Sociales' : 'République Algérienne Démocratique et Populaire'}
              </p>
            </div>
          </div>

          {/* Quick Employer Status Chip */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg text-xs text-slate-200 transition-all cursor-pointer shadow-xs"
            title="Modifier les coordonnées employeur"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <div className="text-left">
              <div className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">
                {employer.raisonSociale || 'Mon Entreprise'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Cotisant: <span className="text-emerald-300 font-bold">{employer.numeroEmployeur || '16...'}</span> ({employer.anneeReference})
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Download sample Excel template */}
          <button
            onClick={onDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors shadow-xs"
            title="Télécharger un modèle Excel pré-rempli pour la DAS CNAS"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'تحميل نموذج إكسل' : 'Modèle Excel vierge'}</span>
          </button>

          {/* Bordereau Recapitulatif button (if has data) */}
          {hasData && (
            <button
              onClick={onOpenBordereau}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 rounded-lg text-xs font-medium transition-colors shadow-xs"
              title="Générer l'état récapitulatif officiel et le calcul des cotisations"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'جدول ملخص الاشتراكات' : 'Bordereau Récapitulatif'}</span>
            </button>
          )}

          {/* Portal Guide Modal */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'دليل الإيداع CNAS' : 'Guide Télé-déclaration'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Changer de langue / تغيير اللغة"
          >
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold">{lang === 'fr' ? 'العربية' : 'Français'}</span>
          </button>

          {/* External CNAS Portal Link */}
          <a
            href="https://teledeclaration.cnas.dz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-medium transition-colors"
            title="Ouvrir le portail officiel de télé-déclaration CNAS"
          >
            <span>Portail CNAS</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
