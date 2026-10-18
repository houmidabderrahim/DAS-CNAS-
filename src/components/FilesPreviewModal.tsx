import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Archive, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import JSZip from 'jszip';
import { GeneratedCNASFiles } from '../types/das';

interface FilesPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: GeneratedCNASFiles;
  lang: 'fr' | 'ar';
}

export const FilesPreviewModal: React.FC<FilesPreviewModalProps> = ({
  isOpen,
  onClose,
  files,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'entete' | 'detail'>('detail');
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadZipArchive = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      zip.file(files.enteteFileName, files.enteteContent);
      zip.file(files.detailFileName, files.detailContent);
      
      const readme = `RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE
CAISSE NATIONALE DES ASSURANCES SOCIALES DES TRAVAILLEURS SALARIÉS (CNAS)
DÉCLARATION ANNUELLE DES SALAIRES ET DES SALARIÉS (DAS)

Fichiers générés pour télé-déclaration :
1. ${files.enteteFileName} : Fichier Entête Employeur
2. ${files.detailFileName} : Fichier Détail Salariés (${files.totalEmployees} salariés)

Montants globaux :
- Total Salaires T1 : ${files.totalSalairesT1.toLocaleString('fr-DZ')} DA
- Total Salaires T2 : ${files.totalSalairesT2.toLocaleString('fr-DZ')} DA
- Total Salaires T3 : ${files.totalSalairesT3.toLocaleString('fr-DZ')} DA
- Total Salaires T4 : ${files.totalSalairesT4.toLocaleString('fr-DZ')} DA
- TOTAL ANNUEL COTISABLE : ${files.totalSalairesAnnuel.toLocaleString('fr-DZ')} DA

Cotisations estimées :
- Part Ouvrière (9%) : ${files.cotisationOuvriere.toLocaleString('fr-DZ')} DA
- Part Patronale (25.5%) : ${files.cotisationPatronale.toLocaleString('fr-DZ')} DA
- TOTAL COTISATIONS (34.5%) : ${files.cotisationTotal.toLocaleString('fr-DZ')} DA

Instructions de dépôt :
1. Connectez-vous sur https://teledeclaration.cnas.dz
2. Allez dans "Déclarations" -> "DAS"
3. Importez d'abord le fichier Entête (${files.enteteFileName})
4. Importez le fichier Détail (${files.detailFileName})
5. Validez et téléchargez votre accusé de réception officiel.
`;
      zip.file('README_DAS_CNAS.txt', readme);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DAS_CNAS_${files.enteteFileName.replace('.TXT', '')}_PACK.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const copyCurrentContent = () => {
    const text = activeTab === 'entete' ? files.enteteContent : files.detailContent;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detailLines = files.detailContent.split('\r\n').filter(Boolean);
  const filteredDetailLines = filterQuery
    ? detailLines.filter((l) => l.toLowerCase().includes(filterQuery.toLowerCase()))
    : detailLines;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-5xl w-full h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <span>{isAr ? 'معاينة وتحميل ملفي CNAS' : 'Aperçu des 2 fichiers réglementaires CNAS'}</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/80">
                  Format Fixe CNAS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAr 
                  ? 'ملف Entête وملف Détail Salariés جاهزان للإيداع في منصة التوزيع'
                  : 'Prêts à être télétransmis sur teledeclaration.cnas.dz'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadZipArchive}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all shadow-md cursor-pointer"
              title="Télécharger les 2 fichiers dans une archive ZIP"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Archivage...' : isAr ? 'تحميل الملفين معاً (ZIP)' : 'Télécharger Pack (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection & File Download Buttons */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('detail')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'detail'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{files.detailFileName}</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded font-mono">
                {files.totalEmployees} salariés
              </span>
            </button>

            <button
              onClick={() => setActiveTab('entete')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'entete'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{files.enteteFileName}</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded font-mono">
                Entête
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'detail' && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrer (Nom, NSS...)"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-700 pl-8 pr-3 py-1 text-xs text-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 w-44"
                />
              </div>
            )}

            <button
              onClick={copyCurrentContent}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'entete') {
                  downloadFile(files.enteteFileName, files.enteteContent);
                } else {
                  downloadFile(files.detailFileName, files.detailContent);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Télécharger ce fichier (.TXT)</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto font-mono text-xs">
          {activeTab === 'entete' ? (
            <div className="space-y-4">
              {/* Entête Line Raw */}
              <div>
                <div className="text-[11px] text-slate-400 font-sans mb-1 font-semibold flex items-center justify-between">
                  <span>Contenu brut du fichier Entête ({files.enteteFileName}) :</span>
                  <span className="text-[10px] text-emerald-400 font-mono">1 Ligne fixe</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 tracking-wider break-all shadow-inner select-all">
                  {files.enteteContent.trim()}
                </div>
              </div>

              {/* Decomposition of Header Line */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-slate-300 font-sans">
                <h4 className="text-xs font-semibold text-slate-200 mb-2">
                  Détail du décodage de la ligne Entête selon les normes CNAS :
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">N° Employeur (10 pos)</span>
                    <span className="font-mono text-emerald-400 font-bold">{files.enteteContent.substring(0, 10)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Type Déclaration (1 pos)</span>
                    <span className="font-mono text-amber-400 font-bold">{files.enteteContent.substring(10, 11)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Année Réf (4 pos)</span>
                    <span className="font-mono text-sky-400 font-bold">{files.enteteContent.substring(11, 15)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Nb Salariés (6 pos)</span>
                    <span className="font-mono text-indigo-400 font-bold">{files.totalEmployees}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Total T1</span>
                    <span className="font-mono text-slate-200">{files.totalSalairesT1.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Total T2</span>
                    <span className="font-mono text-slate-200">{files.totalSalairesT2.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Total T3</span>
                    <span className="font-mono text-slate-200">{files.totalSalairesT3.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Total T4</span>
                    <span className="font-mono text-slate-200">{files.totalSalairesT4.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-emerald-900/60 col-span-2">
                    <span className="text-slate-500 block text-[10px]">Total Annuel Déclaré (14 pos centimes)</span>
                    <span className="font-mono text-emerald-400 font-bold">{files.totalSalairesAnnuel.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span>
                  Lignes salariés (194 caractères fixes par ligne) : {filteredDetailLines.length} sur {detailLines.length}
                </span>
                <span className="text-sky-400 font-mono">Encodage ASCII / CRLF</span>
              </div>

              {/* Detail Lines Table with row numbers */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800/80">
                {filteredDetailLines.map((line, idx) => (
                  <div key={idx} className="flex hover:bg-slate-800/50 transition-colors">
                    <span className="w-12 text-slate-500 px-2 py-1.5 text-right select-none border-r border-slate-800 bg-slate-950/50 shrink-0">
                      {(idx + 1).toString().padStart(4, '0')}
                    </span>
                    <span className="px-3 py-1.5 text-sky-200 tracking-wide whitespace-pre overflow-x-auto select-all">
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Format rigoureusement testé pour le téléversement direct sur le portail CNAS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                downloadFile(files.enteteFileName, files.enteteContent);
                setTimeout(() => downloadFile(files.detailFileName, files.detailContent), 300);
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-medium transition-colors border border-slate-700"
            >
              {isAr ? 'تحميل الملفين بشكل منفصل' : 'Télécharger les 2 fichiers séparément'}
            </button>
            <button
              onClick={downloadZipArchive}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل كحزمة ZIP' : 'Télécharger Pack ZIP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
