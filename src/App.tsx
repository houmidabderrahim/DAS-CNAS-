import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Archive, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Coins, 
  Building2, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Search, 
  RefreshCw, 
  Printer, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  HelpCircle,
  FileCode,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { EmployerInfo, EmployeeRecord, ColumnMapping, GeneratedCNASFiles, ValidationError } from './types/das';
import { 
  generateCNASFiles, 
  validateEmployeeRecords, 
  getCNASFileNames,
  cleanNSS,
  formatToJJMMAAAA 
} from './utils/cnasFormatters';
import { parseExcelBuffer, generateSampleExcelWorkbook, autoDetectColumns } from './utils/excelParser';
import { DesktopHeader } from './components/DesktopHeader';
import { EmployerSettingsModal } from './components/EmployerSettingsModal';
import { ColumnMappingModal } from './components/ColumnMappingModal';
import { ValidationReport } from './components/ValidationReport';
import { FilesPreviewModal } from './components/FilesPreviewModal';
import { BordereauModal } from './components/BordereauModal';
import { GuideModal } from './components/GuideModal';

export default function App() {
  // Application State
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  
  // Employer Credentials (Defaulted to typical Algerian company, fully editable)
  const [employer, setEmployer] = useState<EmployerInfo>({
    numeroEmployeur: '1612345678', // 10 digits
    raisonSociale: 'SARL ATLAS DEVELOPPEMENT ALGERIE',
    adresse: 'ZONE INDUSTRIELLE OUED SMAR, ALGER',
    anneeReference: 2024,
    typeDeclaration: 'N',
    codeCentrePayeur: '001',
    wilayaCode: '16',
  });

  // Excel parsed state
  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [rawFileBuffer, setRawFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const [currentMapping, setCurrentMapping] = useState<ColumnMapping | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'ligne' | 'nom' | 'salaireAnnuel'>('ligne');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBordereauOpen, setIsBordereauOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAr = lang === 'ar';

  // Real-time CNAS validation audit
  const validationErrors = useMemo<ValidationError[]>(() => {
    if (records.length === 0) return [];
    return validateEmployeeRecords(records, employer);
  }, [records, employer]);

  // Real-time CNAS generated payload
  const cnasFiles = useMemo<GeneratedCNASFiles | null>(() => {
    if (records.length === 0) return null;
    return generateCNASFiles(records, employer);
  }, [records, employer]);

  // File names for employer
  const fileNames = useMemo(() => getCNASFileNames(employer), [employer]);

  // Handle Excel File Drop / Input
  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setFileName(file.name);
      const buffer = await file.arrayBuffer();
      setRawFileBuffer(buffer);

      const parsed = await parseExcelBuffer(buffer);
      setAvailableSheets(parsed.sheetNames);
      setSelectedSheet(parsed.selectedSheet);
      setAvailableHeaders(parsed.headers);
      setCurrentMapping(parsed.detectedMapping);
      setRecords(parsed.records);
    } catch (err: any) {
      console.error('Erreur lecture Excel:', err);
      alert(`Erreur lors de la lecture du fichier Excel : ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Switch Sheet in Multi-sheet workbook
  const handleSheetChange = async (sheet: string) => {
    if (!rawFileBuffer) return;
    try {
      setIsLoading(true);
      setSelectedSheet(sheet);
      const parsed = await parseExcelBuffer(rawFileBuffer, sheet);
      setAvailableHeaders(parsed.headers);
      setCurrentMapping(parsed.detectedMapping);
      setRecords(parsed.records);
    } catch (err: any) {
      console.error('Erreur changement de feuille:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply custom mapping
  const handleApplyMapping = async (newMapping: ColumnMapping) => {
    if (!rawFileBuffer) return;
    try {
      setIsLoading(true);
      setCurrentMapping(newMapping);
      const parsed = await parseExcelBuffer(rawFileBuffer, selectedSheet, newMapping);
      setRecords(parsed.records);
    } catch (err: any) {
      console.error('Erreur application mapping:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-correct annual sum differences (T1+T2+T3+T4 = Salaire Annuel)
  const handleAutoFixSums = () => {
    setRecords((prev) =>
      prev.map((rec) => {
        const sum = Math.round(((rec.salaireT1 || 0) + (rec.salaireT2 || 0) + (rec.salaireT3 || 0) + (rec.salaireT4 || 0)) * 100) / 100;
        return {
          ...rec,
          salaireAnnuel: sum,
        };
      })
    );
  };

  // Load realistic sample data
  const handleLoadSampleData = async () => {
    setIsLoading(true);
    const sampleBuffer = generateSampleExcelWorkbook();
    setFileName('Exemple_Paie_Algerie_DAS_2024.xlsx');
    setRawFileBuffer(sampleBuffer.buffer as ArrayBuffer);
    const parsed = await parseExcelBuffer(sampleBuffer.buffer as ArrayBuffer);
    setAvailableSheets(parsed.sheetNames);
    setSelectedSheet(parsed.selectedSheet);
    setAvailableHeaders(parsed.headers);
    setCurrentMapping(parsed.detectedMapping);
    setRecords(parsed.records);
    setIsLoading(false);
  };

  // Download blank sample Excel template
  const handleDownloadTemplate = () => {
    const uint8 = generateSampleExcelWorkbook();
    const blob = new Blob([uint8.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Modele_DAS_CNAS_Algerie.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset app state
  const handleReset = () => {
    setRecords([]);
    setRawFileBuffer(null);
    setFileName('');
  };

  // Filtered and Sorted Records
  const displayRecords = useMemo(() => {
    let list = records;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.nom.toLowerCase().includes(q) ||
          r.prenom.toLowerCase().includes(q) ||
          r.nss.toLowerCase().includes(q) ||
          (r.observation && r.observation.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'ligne') cmp = a.ligne - b.ligne;
      else if (sortField === 'nom') cmp = a.nom.localeCompare(b.nom);
      else if (sortField === 'salaireAnnuel') cmp = a.salaireAnnuel - b.salaireAnnuel;
      return sortAsc ? cmp : -cmp;
    });
  }, [records, searchQuery, sortField, sortAsc]);

  // Inline Record Editing
  const updateRecordField = (id: string, field: keyof EmployeeRecord, value: any) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (['salaireT1', 'salaireT2', 'salaireT3', 'salaireT4'].includes(field as string)) {
          updated.salaireAnnuel = Math.round(
            ((updated.salaireT1 || 0) + (updated.salaireT2 || 0) + (updated.salaireT3 || 0) + (updated.salaireT4 || 0)) * 100
          ) / 100;
        }
        return updated;
      })
    );
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id).map((r, i) => ({ ...r, ligne: i + 1 })));
  };

  const addNewRecord = () => {
    const newLigne = records.length + 1;
    const newRec: EmployeeRecord = {
      id: `emp_manual_${Date.now()}`,
      ligne: newLigne,
      nss: `${employer.wilayaCode}9000000001`,
      nom: 'NOUVEAU',
      prenom: 'SALARIE',
      dateNaissance: '01/01/1990',
      dureeT1: 90,
      uniteT1: 'J',
      salaireT1: 150000,
      dureeT2: 90,
      uniteT2: 'J',
      salaireT2: 150000,
      dureeT3: 90,
      uniteT3: 'J',
      salaireT3: 150000,
      dureeT4: 90,
      uniteT4: 'J',
      salaireT4: 150000,
      salaireAnnuel: 600000,
      dateEntree: '',
      dateSortie: '',
      observation: '',
    };
    setRecords((prev) => [newRec, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Desktop Application Header */}
      <DesktopHeader
        employer={employer}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBordereau={() => setIsBordereauOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
        onReset={handleReset}
        lang={lang}
        setLang={setLang}
        hasData={records.length > 0}
        onOpenPreview={() => setIsPreviewOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
        {/* VIEW A: NO FILE UPLOADED - WELCOME / DROPZONE */}
        {records.length === 0 ? (
          <div className="max-w-4xl w-full mx-auto my-auto py-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Algerian CNAS Hero Card */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Norme Officielle Télé-déclaration CNAS Algérie</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isAr 
                  ? 'توليد ملفي التصريح السنوي بالأجور (DAS) بنقرة واحدة'
                  : 'Générez les deux fichiers DAS CNAS à partir d\'Excel'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                {isAr
                  ? 'ارفع ملف إكسل الخاص بالأجور وسيقوم البرنامج بتوليد ملف Entête وملف Salariés بالتنسيق الثابت المعتمد من طرف مصالح الضمان الاجتماعي الجزائري.'
                  : 'Importez votre tableau Excel et obtenez instantanément le Fichier Entête Employeur (DaaE...) et le Fichier Détail Salariés (DaaS...) prêts pour télétransmettre sur teledeclaration.cnas.dz.'}
              </p>
            </div>

            {/* Drag & Drop Card */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900/90 hover:bg-slate-850/90 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer shadow-2xl group flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                <Upload className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                  {isAr ? 'اسحب ملف الإكسل هنا أو انقر للاختيار' : 'Glissez-déposez votre fichier Excel ici'}
                </h3>
                <p className="text-xs text-slate-400">
                  Prend en charge tous les formats : <span className="text-emerald-400 font-mono">.xlsx</span>, <span className="text-emerald-400 font-mono">.xls</span>, <span className="text-emerald-400 font-mono">.csv</span> (PC Paie, Sage, etc.)
                </p>
              </div>

              <button
                type="button"
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isAr ? 'اختيار ملف من الحاسوب' : 'Parcourir les fichiers'}</span>
              </button>
            </div>

            {/* Quick action buttons & CNAS badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleLoadSampleData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Tester avec des données algériennes d'exemple</span>
              </button>

              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Télécharger le modèle Excel vierge</span>
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Guide de télé-déclaration</span>
              </button>
            </div>

            {/* CNAS Technical Specification Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">1. Fichier Entête Employeur</span>
                <p className="text-[11px] leading-relaxed">
                  Nommé <span className="text-emerald-400 font-mono">D{fileNames.enteteFileName.substring(1, 3)}E...TXT</span> avec numéro cotisant et totaux des 4 trimestres en centimes.
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">2. Fichier Détail Salariés</span>
                <p className="text-[11px] leading-relaxed">
                  Nommé <span className="text-sky-400 font-mono">D{fileNames.detailFileName.substring(1, 3)}S...TXT</span> avec structure exacte de 194 positions par ligne (NSS 12 chiffres, T1 à T4).
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-slate-200 block mb-1">3. Détection Intelligente</span>
                <p className="text-[11px] leading-relaxed">
                  Reconnaissance automatique des colonnes en français et en arabe, avec possibilité de mapping personnalisé.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW B: DATA LOADED & WORKSPACE ACTIVE */
          <div className="flex flex-col gap-4 flex-1">
            {/* Top Toolbar: File name, Multi-sheet tabs, Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 font-medium">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="truncate max-w-xs">{fileName}</span>
                </div>

                {/* Multi-sheet selector if Excel has >1 sheet */}
                {availableSheets.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-400">Feuille :</span>
                    <select
                      value={selectedSheet}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="bg-slate-900 text-slate-200 text-xs rounded px-2 py-0.5 border border-slate-700 focus:outline-none"
                    >
                      {availableSheets.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Button to open column mapper */}
                <button
                  onClick={() => setIsMappingOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Modifier l'association des colonnes de votre Excel"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mapping des colonnes</span>
                </button>

                {/* Change Excel button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Changer de fichier</span>
                </button>
              </div>

              {/* Primary Generation CTAs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
                >
                  <FileCode className="w-4 h-4" />
                  <span>{isAr ? 'معاينة وتحميل ملفي CNAS' : 'Générer les 2 fichiers CNAS'}</span>
                  <span className="bg-emerald-800/80 px-1.5 py-0.5 rounded text-[10px] font-mono">
                    .TXT
                  </span>
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Total Salariés */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-medium block">
                    {isAr ? 'عدد العمال المصرح بهم' : 'Effectif déclaré'}
                  </span>
                  <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">
                    {records.length} <span className="text-xs font-normal text-slate-400">salariés</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Total Brut Annuel Cotisable */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-medium block">
                    {isAr ? 'المجموع السنوي للأجور' : 'Masse salariale annuelle (DAS)'}
                  </span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    {cnasFiles ? cnasFiles.totalSalairesAnnuel.toLocaleString('fr-DZ') : '0'}{' '}
                    <span className="text-xs font-normal text-slate-400">DA</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Cotisations Sociales 34.5% */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-medium block">
                    {isAr ? 'اشتراكات الضمان الاجتماعي (34.5%)' : 'Cotisations CNAS (34.5%)'}
                  </span>
                  <div className="text-xl font-bold text-indigo-400 font-mono mt-0.5">
                    {cnasFiles ? cnasFiles.cotisationTotal.toLocaleString('fr-DZ') : '0'}{' '}
                    <span className="text-xs font-normal text-slate-400">DA</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Fichiers Prêts */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-medium block">
                    {isAr ? 'الملفان الجاهزان' : 'Fichiers télétransmissibles'}
                  </span>
                  <div className="text-xs font-bold text-slate-200 font-mono mt-1 space-y-0.5">
                    <div className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {fileNames.enteteFileName}
                    </div>
                    <div className="text-sky-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {fileNames.detailFileName}
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Archive className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Validation Auditor Report */}
            <ValidationReport
              errors={validationErrors}
              totalRecords={records.length}
              onAutoFixQuarterSums={handleAutoFixSums}
              lang={lang}
            />

            {/* Interactive Employee Data Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden shadow-md">
              {/* Table search & action bar */}
              <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Rechercher salarié, NSS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-800 border border-slate-700 pl-8 pr-3 py-1.5 text-xs text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52 sm:w-64"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    Affichage de <strong>{displayRecords.length}</strong> sur {records.length} salariés
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={addNewRecord}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ajouter un salarié</span>
                  </button>
                </div>
              </div>

              {/* Table container */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">N°</th>
                      <th className="py-2.5 px-3 w-36">N° Sécu (NSS)</th>
                      <th className="py-2.5 px-3 w-40 cursor-pointer" onClick={() => { setSortField('nom'); setSortAsc(!sortAsc); }}>
                        <div className="flex items-center gap-1">
                          <span>Nom</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>
                      <th className="py-2.5 px-3 w-36">Prénom</th>
                      <th className="py-2.5 px-3 w-28">Date Naiss.</th>
                      <th className="py-2.5 px-3 text-right">Salaire T1</th>
                      <th className="py-2.5 px-3 text-right">Salaire T2</th>
                      <th className="py-2.5 px-3 text-right">Salaire T3</th>
                      <th className="py-2.5 px-3 text-right">Salaire T4</th>
                      <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => { setSortField('salaireAnnuel'); setSortAsc(!sortAsc); }}>
                        <div className="flex items-center justify-end gap-1">
                          <span>Total Annuel</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>
                      <th className="py-2.5 px-3 w-28">Dates E/S</th>
                      <th className="py-2.5 px-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {displayRecords.map((emp) => {
                      const cleanNum = (emp.nss || '').replace(/[^0-9]/g, '');
                      const isNssValid = cleanNum.length === 10 || cleanNum.length === 12;
                      const sum4T = Math.round(((emp.salaireT1 || 0) + (emp.salaireT2 || 0) + (emp.salaireT3 || 0) + (emp.salaireT4 || 0)) * 100) / 100;
                      const hasSumDiff = Math.abs(sum4T - (emp.salaireAnnuel || 0)) > 1.0;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors group">
                          {/* Ligne */}
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">
                            {emp.ligne.toString().padStart(3, '0')}
                          </td>

                          {/* NSS */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={emp.nss}
                              maxLength={12}
                              onChange={(e) => updateRecordField(emp.id, 'nss', e.target.value)}
                              className={`bg-transparent font-mono text-xs w-full px-1.5 py-0.5 rounded border ${
                                !isNssValid
                                  ? 'border-rose-500/80 bg-rose-950/20 text-rose-300'
                                  : 'border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-200'
                              }`}
                            />
                          </td>

                          {/* Nom */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={emp.nom}
                              onChange={(e) => updateRecordField(emp.id, 'nom', e.target.value.toUpperCase())}
                              className="bg-transparent font-semibold text-xs w-full px-1.5 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-200"
                            />
                          </td>

                          {/* Prénom */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={emp.prenom}
                              onChange={(e) => updateRecordField(emp.id, 'prenom', e.target.value)}
                              className="bg-transparent text-xs w-full px-1.5 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-200"
                            />
                          </td>

                          {/* Date Naissance */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={emp.dateNaissance}
                              placeholder="JJMMAAAA"
                              onChange={(e) => updateRecordField(emp.id, 'dateNaissance', e.target.value)}
                              className="bg-transparent font-mono text-xs w-full px-1.5 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-300"
                            />
                          </td>

                          {/* Salaire T1 */}
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              value={emp.salaireT1 || 0}
                              onChange={(e) => updateRecordField(emp.id, 'salaireT1', parseFloat(e.target.value) || 0)}
                              className="bg-transparent font-mono text-xs w-24 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-200"
                            />
                          </td>

                          {/* Salaire T2 */}
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              value={emp.salaireT2 || 0}
                              onChange={(e) => updateRecordField(emp.id, 'salaireT2', parseFloat(e.target.value) || 0)}
                              className="bg-transparent font-mono text-xs w-24 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-200"
                            />
                          </td>

                          {/* Salaire T3 */}
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              value={emp.salaireT3 || 0}
                              onChange={(e) => updateRecordField(emp.id, 'salaireT3', parseFloat(e.target.value) || 0)}
                              className="bg-transparent font-mono text-xs w-24 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-200"
                            />
                          </td>

                          {/* Salaire T4 */}
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              value={emp.salaireT4 || 0}
                              onChange={(e) => updateRecordField(emp.id, 'salaireT4', parseFloat(e.target.value) || 0)}
                              className="bg-transparent font-mono text-xs w-24 text-right px-1.5 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-emerald-500 focus:bg-slate-800 text-slate-200"
                            />
                          </td>

                          {/* Total Annuel */}
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {hasSumDiff && (
                                <span title="Écart entre somme trimestrielle et total annuel" className="text-amber-400">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                </span>
                              )}
                              <span className={`font-mono font-bold ${hasSumDiff ? 'text-amber-300' : 'text-emerald-400'}`}>
                                {(emp.salaireAnnuel || 0).toLocaleString('fr-DZ')} DA
                              </span>
                            </div>
                          </td>

                          {/* Dates E/S */}
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                            {emp.dateEntree || emp.dateSortie ? (
                              <div>
                                {emp.dateEntree && <span className="text-emerald-400">E:{emp.dateEntree} </span>}
                                {emp.dateSortie && <span className="text-rose-400">S:{emp.dateSortie}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => deleteRecord(emp.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Supprimer ce salarié"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Quick Bar */}
              <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Double-cliquez sur n'importe quel champ pour modifier la valeur avant génération.
                </div>
                <div className="flex items-center gap-3">
                  <span>Masse salariale T1: {cnasFiles?.totalSalairesT1.toLocaleString('fr-DZ')} DA</span>
                  <span>•</span>
                  <span>T2: {cnasFiles?.totalSalairesT2.toLocaleString('fr-DZ')} DA</span>
                  <span>•</span>
                  <span>T3: {cnasFiles?.totalSalairesT3.toLocaleString('fr-DZ')} DA</span>
                  <span>•</span>
                  <span>T4: {cnasFiles?.totalSalairesT4.toLocaleString('fr-DZ')} DA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Desktop Window Bottom Status Bar */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Système DAS Prêt (Hors-ligne & Sécurisé)</span>
          </div>
          <span className="text-slate-700">|</span>
          <span>Encodage: <span className="font-mono text-slate-300">ASCII / CRLF Windows</span></span>
          <span className="text-slate-700">|</span>
          <span>Taux CNAS: <span className="font-mono text-slate-300">9% + 25.5% = 34.5%</span></span>
        </div>

        <div className="flex items-center gap-3">
          <span>Plateforme officielle : <span className="text-emerald-400 font-mono">teledeclaration.cnas.dz</span></span>
          <span className="text-slate-700">|</span>
          <span className="font-semibold text-slate-300">CNAS Algérie</span>
        </div>
      </footer>

      {/* MODALS */}
      <EmployerSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        employer={employer}
        onSave={(newEmp) => setEmployer(newEmp)}
        lang={lang}
      />

      {currentMapping && (
        <ColumnMappingModal
          isOpen={isMappingOpen}
          onClose={() => setIsMappingOpen(false)}
          availableHeaders={availableHeaders}
          currentMapping={currentMapping}
          onApplyMapping={handleApplyMapping}
          lang={lang}
        />
      )}

      {cnasFiles && (
        <FilesPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          files={cnasFiles}
          lang={lang}
        />
      )}

      {cnasFiles && (
        <BordereauModal
          isOpen={isBordereauOpen}
          onClose={() => setIsBordereauOpen(false)}
          employer={employer}
          files={cnasFiles}
          lang={lang}
        />
      )}

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        lang={lang}
      />
    </div>
  );
}
