import React, { useState } from 'react';
import { 
  Briefcase, 
  UserCheck, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  MessageSquare, 
  Bookmark, 
  ArrowRight, 
  Lightbulb, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  HelpCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { InterviewPrepResult, InterviewQuestion } from '../types/index.ts';

interface InterviewPrepProps {
  onStartSimulation: (title: string, role: string, question?: string) => void;
  onSaveResult: (result: InterviewPrepResult) => void;
  savedResults: InterviewPrepResult[];
}

const PRESET_SCENARIOS = [
  {
    label: 'Engineering Manager (Teknoloji Lideri)',
    interviewerTitle: 'Senior Engineering Manager',
    candidateRole: 'Senior Full Stack Developer',
    companyType: 'Fintech Scale-up',
    interviewRound: 'Sistem Tasarımı & Takım Uyumu',
  },
  {
    label: 'Head of People / HR (İşe Alım Direktörü)',
    interviewerTitle: 'Head of People & Culture',
    candidateRole: 'Product Manager',
    companyType: 'Global SaaS Şirketi',
    interviewRound: 'Kültür, Değerler & Çatışma Yönetimi',
  },
  {
    label: 'VP of Product (Ürün Lideri)',
    interviewerTitle: 'VP of Product',
    candidateRole: 'Senior Product Designer (UI/UX)',
    companyType: 'E-Ticaret Platformu',
    interviewRound: 'Ürün Vizyonu & Metrik Odaklılık',
  },
  {
    label: 'CTO / Kurucu Ortak',
    interviewerTitle: 'Chief Technology Officer (CTO)',
    candidateRole: 'Lead Data Engineer',
    companyType: 'AI & Veri Girişimi',
    interviewRound: 'Mimari Vizyon & Büyüme Stratejisi',
  },
];

export const InterviewPrep: React.FC<InterviewPrepProps> = ({
  onStartSimulation,
  onSaveResult,
  savedResults,
}) => {
  const [interviewerTitle, setInterviewerTitle] = useState('');
  const [candidateRole, setCandidateRole] = useState('');
  const [companyType, setCompanyType] = useState('Teknoloji & SaaS');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Senior');
  const [interviewRound, setInterviewRound] = useState('Teknik ve Kültürel Değerlendirme');
  const [focusAreas, setFocusAreas] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'technical' | 'behavioral' | 'leadership_culture' | 'curveball'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setInterviewerTitle(preset.interviewerTitle);
    setCandidateRole(preset.candidateRole);
    setCompanyType(preset.companyType);
    setInterviewRound(preset.interviewRound);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewerTitle.trim() || !candidateRole.trim()) {
      setError('Lütfen en azından mülakatçı unvanını ve hedef pozisyonunuzu belirtin.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle,
          candidateRole,
          companyType,
          experienceLevel,
          interviewRound,
          focusAreas,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Sorular üretilemedi.');
      }

      const data = await res.json();
      const newResult: InterviewPrepResult = {
        ...data,
        interviewerTitle,
        candidateRole,
        companyType,
        createdAt: new Date().toISOString(),
      };

      setResult(newResult);
      if (data.questions && data.questions.length > 0) {
        setExpandedQuestionId(data.questions[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Mülakat analizi hazırlanırken bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveResult(result);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const filteredQuestions = result?.questions.filter((q) => {
    if (activeFilter === 'all') return true;
    return q.category === activeFilter;
  }) || [];

  const isSaved = result && savedResults.some(
    (s) => s.interviewerTitle === result.interviewerTitle && s.candidateRole === result.candidateRole
  );

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Mülakatçının Unvanına Özel Soru & Strateji Üretici
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-3xl">
          Mülakata gireceğiniz kişinin unvanını (örn. <span className="text-indigo-300 font-medium">Senior Engineering Manager</span>, <span className="text-indigo-300 font-medium">Head of HR</span>, <span className="text-indigo-300 font-medium">VP of Product</span>) belirtin; yapay zeka mülakatçının zihnini analiz etsin, masaya getireceği en zorlu soruları ve kazanma formülünü çıkarsın.
        </p>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Örnek Senaryolar:</span>
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interviewer Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Mülakatı Yapacak Kişinin Unvanı (Interviewer Title) <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={interviewerTitle}
                  onChange={(e) => setInterviewerTitle(e.target.value)}
                  placeholder="Örn: Senior Engineering Manager, HRBP, CTO, Product Director"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Unvan ne kadar spesifik olursa, sorular o kadar hedefe yönelik üretilir.
              </p>
            </div>

            {/* Candidate Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Aday Olarak Başvurduğunuz Pozisyon <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                value={candidateRole}
                onChange={(e) => setCandidateRole(e.target.value)}
                placeholder="Örn: Senior Frontend Developer, Data Analyst, Product Manager"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Bu mülakatçının sizin pozisyonunuzda ne aradığını belirler.
              </p>
            </div>

            {/* Company & Industry */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Şirket / Sektör Türü
              </label>
              <input
                type="text"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                placeholder="Örn: Hızlı Büyüyen Fintech Scale-up, Küresel E-Ticaret, Kurumsal Banka"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Interview Round */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Mülakat Aşaması / Turu
              </label>
              <select
                value={interviewRound}
                onChange={(e) => setInterviewRound(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="İlk Tanışma & HR Elemesi">İlk Tanışma & HR Elemesi</option>
                <option value="Teknik & Mimari Derinlik">Teknik & Mimari Derinlik</option>
                <option value="Vaka Analizi & Problem Çözme">Vaka Analizi & Problem Çözme</option>
                <option value="Kültür, Değerler & Davranışsal Uyum">Kültür, Değerler & Davranışsal Uyum</option>
                <option value="Yönetici & Liderlik / Final Turu">Yönetici & Liderlik / Final Turu</option>
              </select>
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Özel Odak veya Endişe Alanınız (Opsiyonel)
            </label>
            <input
              type="text"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="Örn: Çatışma yönetimi sorularından çekiniyorum, mimari ölçeklenebilirlik, kariyer boşluğu açıklaması"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-3 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Unvan Analiz Ediliyor & Sorular Üretiliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Soruları ve Stratejiyi Üret</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Action Ribbon: Save & Simulate */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/30 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">
              <span className="text-white font-semibold">{result.interviewerTitle}</span> unvanı için <span className="text-white font-semibold">{result.questions.length} potansiyel soru</span> ve mülakat psikolojisi hazırlandı.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaved || saveSuccess}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSaved || saveSuccess
                    ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kaydedildi</span>
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kayıtlarda Mevcut</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Plana Kaydet</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onStartSimulation(result.interviewerTitle, result.candidateRole)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Bu Unvanla Simülasyonu Başlat</span>
              </button>
            </div>
          </div>

          {/* Interviewer Persona Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                  Mülakatçı Profili & Psikolojisi
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {result.interviewerProfile.title}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-950/50 border border-indigo-800/40 text-indigo-400">
                <Compass className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Ana Odak Noktası (Core Focus)</h4>
                  <p className="mt-1 text-slate-200">{result.interviewerProfile.coreFocus}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400">Mülakat Sırasındaki Zihniyeti (Mindset)</h4>
                  <p className="mt-1 text-slate-300 leading-relaxed">{result.interviewerProfile.psychologicalMindset}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bu Unvanı En Çok Ne Etkiler?</span>
                  </h4>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                    {result.interviewerProfile.whatImpressesThem.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 select-none">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>En Büyük Kırmızı Bayrakları (Tuzaklar)</span>
                  </h4>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                    {result.interviewerProfile.keyRedFlags.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-500 select-none">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Potansiyel Mülakat Soruları ({result.questions.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Her soru bu unvanın değerlendirme kriterlerine göre stratejik olarak oluşturuldu.
                </p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tümü ({result.questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('technical')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'technical'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Teknik / Alan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('behavioral')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'behavioral'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Davranışsal (STAR)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('leadership_culture')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'leadership_culture'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Kültür & Liderlik
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('curveball')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'curveball'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ters Köşe
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredQuestions.map((q, index) => {
                const isExpanded = expandedQuestionId === q.id;
                const isCopied = copiedId === q.id;

                return (
                  <div
                    key={q.id || index}
                    className="border border-slate-800 bg-slate-850/60 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700"
                  >
                    {/* Question Header Bar */}
                    <div
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/50 mt-0.5 shrink-0">
                          Q{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <span className="font-medium text-slate-300">{q.categoryLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{result.interviewerTitle} Perspektifi</span>
                          </div>
                          <h4 className="text-sm md:text-base font-semibold text-white leading-snug">
                            {q.question}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(`${q.question}\n\nStrateji: ${q.answerStrategy}\n\nÖrnek Cevap: ${q.sampleAnswer}`, q.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Soruyu ve Yanıtı Kopyala"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-900/50 space-y-4 text-xs md:text-sm">
                        {/* Why they ask */}
                        <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/30">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{result.interviewerTitle} Bu Soruyu Neden Soruyor?</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed text-xs">
                            {q.whyTheyAsk}
                          </p>
                        </div>

                        {/* Answer Strategy */}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>İdeal Yanıt Stratejisi (STAR Formülü)</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed text-xs bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                            {q.answerStrategy}
                          </p>
                        </div>

                        {/* Sample Answer */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 mb-1">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Örnek Güçlü Cevap Taslağı
                            </span>
                          </div>
                          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-slate-200 text-xs leading-relaxed italic">
                            "{q.sampleAnswer}"
                          </div>
                        </div>

                        {/* Red Flags To Avoid */}
                        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Kaçınılması Gereken Kırmızı Bayraklar (Tuzaklar)</span>
                          </div>
                          <p className="text-rose-200/90 text-xs leading-relaxed">
                            {q.redFlagsToAvoid}
                          </p>
                        </div>

                        {/* Interactive Practice Button */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onStartSimulation(result.interviewerTitle, result.candidateRole, q.question)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-700/60 rounded-lg hover:bg-indigo-900/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Bu Soruyu Mülakatçıyla Canlı Pratik Et</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reverse Questions (Adayın Mülakatçıya Sorması Gerekenler) */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-6">
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                Masayı Tersine Çevirin
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Adayın Bu Mülakatçıya ({result.interviewerTitle}) Sorması Gereken Stratejik Sorular
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Mülakatın sonunda "Bize bir sorunuz var mı?" dendiğinde bu soruları sorarak stratejik zekanızı kanıtlayın.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.reverseQuestions.map((rq, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs text-indigo-400 font-bold shrink-0">#{idx + 1}</span>
                    <h5 className="text-xs md:text-sm font-semibold text-white">
                      "{rq.question}"
                    </h5>
                  </div>
                  <p className="text-xs text-slate-400 pl-4 border-l border-slate-800 leading-relaxed">
                    <span className="text-slate-300 font-medium">Neden etkilidir: </span>
                    {rq.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prep Tips */}
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{result.interviewerTitle} Mülakatı İçin Altın Tüyolar</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              {result.prepTips.map((tip, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
