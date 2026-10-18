import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import { ValidationError } from '../types/das';

interface ValidationReportProps {
  errors: ValidationError[];
  totalRecords: number;
  onAutoFixQuarterSums?: () => void;
  lang: 'fr' | 'ar';
}

export const ValidationReport: React.FC<ValidationReportProps> = ({
  errors,
  totalRecords,
  onAutoFixQuarterSums,
  lang,
}) => {
  const isAr = lang === 'ar';
  const criticalErrors = errors.filter((e) => e.gravite === 'error');
  const warnings = errors.filter((e) => e.gravite === 'warning');

  const hasMismatchSumWarning = warnings.some((w) => w.champ.includes('Salaires'));

  if (errors.length === 0) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-300">
              {isAr ? 'البيانات متوافقة 100% مع معايير CNAS' : 'Conformité CNAS validée à 100%'}
            </h4>
            <p className="text-xs text-slate-300">
              {totalRecords} {isAr ? 'عامل تم التحقق من أرقامهم ومبالغهم دون أي خطأ' : 'salariés vérifiés. Prêt pour l\'exportation réglementaire.'}
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-900/50 px-2.5 py-1 rounded border border-emerald-700/50">
          0 Erreur • 0 Avertissement
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {criticalErrors.length > 0 ? (
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
          <span className="text-sm font-semibold text-slate-200">
            {isAr ? 'تقرير التدقيق والتأكد من مطابقة CNAS' : 'Audit de conformité CNAS'}
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            {criticalErrors.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {criticalErrors.length} {isAr ? 'خطأ حرج' : 'Erreurs critiques'}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {warnings.length} {isAr ? 'تنبيه' : 'Avertissements'}
              </span>
            )}
          </div>
        </div>

        {/* Quick auto-fix button if sum mismatches */}
        {hasMismatchSumWarning && onAutoFixQuarterSums && (
          <button
            onClick={onAutoFixQuarterSums}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Recalcule automatiquement le salaire annuel = T1+T2+T3+T4"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isAr ? 'مزامنة المجموع السنوي تلقائياً' : 'Ajuster Total Annuel = T1+T2+T3+T4'}</span>
          </button>
        )}
      </div>

      {/* List of issues */}
      <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto text-xs">
        {errors.map((err, i) => (
          <div
            key={i}
            className={`px-4 py-2.5 flex items-start gap-3 ${
              err.gravite === 'error' ? 'bg-rose-950/15' : 'bg-amber-950/10'
            }`}
          >
            <div className="mt-0.5">
              {err.gravite === 'error' ? (
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-200">
                  {err.ligne > 0 ? `Ligne ${err.ligne} : ` : ''}{err.employeeNom}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {err.champ}
                </span>
              </div>
              <p className={`mt-0.5 ${err.gravite === 'error' ? 'text-rose-300' : 'text-amber-300'}`}>
                {err.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
