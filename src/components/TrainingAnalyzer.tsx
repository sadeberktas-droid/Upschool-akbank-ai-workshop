import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Target, 
  Sparkles, 
  Bookmark, 
  Check, 
  Loader2, 
  X, 
  Image as ImageIcon,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';
import { TrainingAnalysisResult } from '../types/index.ts';

interface TrainingAnalyzerProps {
  onSaveResult: (result: TrainingAnalysisResult) => void;
  savedResults: TrainingAnalysisResult[];
}

const SAMPLE_TRAININGS = [
  {
    title: 'Full-Stack Web Dev (React & Node.js)',
    currentRole: 'Mid-Level Frontend / Full-Stack Geliştirici',
    targetRole: 'Senior Cloud & Systems Architect',
    trainingsText: `1. Modern React & TypeScript Bootcamp (40 saat):
- React 18, Hooks (useMemo, useCallback, custom hooks)
- Redux Toolkit & Zustand durum yönetimi
- Tailwind CSS ve Responsive UI tasarımı

2. Node.js & Express REST API Eğitimi (30 saat):
- Express middleware yapısı, JWT tabanlı kimlik doğrulama
- PostgreSQL ile temel CRUD sorguları, Prisma ORM
- Temel Docker konteyner oluşturma ve Docker Compose

3. Temel Git & CI/CD Giriş:
- GitHub Actions ile basit test çalıştırma ve Vercel dağıtımı`,
  },
  {
    title: 'Veri Analitiği & İş Zekası',
    currentRole: 'Junior Veri Analisti',
    targetRole: 'Lead Data Scientist / AI Engineer',
    trainingsText: `1. Python for Data Science (Udemy - 35 saat):
- Pandas, NumPy, veri temizleme ve manipülasyon
- Matplotlib ve Seaborn ile veri görselleştirme
- Scikit-Learn ile basit regresyon ve sınıflandırma modelleri

2. İleri Düzey SQL & Veri Ambarı (Datacamp):
- Window functions, CTE'ler, karmaşık JOIN operasyonları
- Star schema ve Snowflake / BigQuery temelleri

3. Power BI Dashboard Tasarımı Sertifikası:
- DAX formülleri, iş zekası KPI raporlaması`,
  },
];

export const TrainingAnalyzer: React.FC<TrainingAnalyzerProps> = ({
  onSaveResult,
  savedResults,
}) => {
  const [trainingsText, setTrainingsText] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('Bilişim & Yazılım');

  // Image Upload state for certificate / syllabus
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrainingAnalysisResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleApplySample = (sample: typeof SAMPLE_TRAININGS[0]) => {
    setTrainingsText(sample.trainingsText);
    setCurrentRole(sample.currentRole);
    setTargetRole(sample.targetRole);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel formatı yükleyin (PNG, JPG, WebP).');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Prompt user to extract content with OCR
    setOcrLoading(true);
    setError(null);
    try {
      const base64Data = await fileToBase64(file);
      const res = await fetch('/api/document/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: file.type,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.extractedText) {
          setTrainingsText((prev) => 
            prev ? `${prev}\n\n[Görselden Okunan Eğitim/Sertifika Bilgisi]:\n${data.extractedText}` : data.extractedText
          );
        }
      }
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:image/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingsText.trim() && !imageFile) {
      setError('Lütfen katıldığınız eğitimlerin içeriklerini girin veya bir sertifika belgesi yükleyin.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      }

      const res = await fetch('/api/career/analyze-trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingsText,
          currentRole,
          targetRole,
          industry,
          imageBase64,
          mimeType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Eğitim analizi yapılamadı.');
      }

      const data = await res.json();
      const newResult: TrainingAnalysisResult = {
        ...data,
        currentRole: currentRole || 'Belirtilmedi',
        targetRole: targetRole || 'Bir Sonraki Kıdem',
        createdAt: new Date().toISOString(),
      };

      setResult(newResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analiz sırasında bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSaveResult(result);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isSaved = result && savedResults.some(
    (s) => s.targetRole === result.targetRole && s.createdAt === result.createdAt
  );

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Eğitim İçerik Analizi & Sıradaki Adım Yol Haritası
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-3xl">
          Bugüne kadar katıldığınız eğitimlerin, aldığınız kursların veya sertifikaların içeriklerini paylaşın. Yapay zeka kariyer danışmanınız, hedefinizdeki pozisyona ulaşmak için mevcut yetkinliklerinizi tartsın, eksik kalan boşlukları tespit etsin ve tam olarak <span className="text-indigo-300 font-medium">bir sonraki adımda hangi eğitimi almanız gerektiğini</span> net bir müfredatla önünüze koysun.
        </p>

        {/* Quick Samples */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Örnek Eğitim Geçmişi:</span>
          {SAMPLE_TRAININGS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(sample)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Mevcut Pozisyonunuz veya Alanınız
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="Örn: Mid-Level Full Stack Geliştirici, Satış Uzmanı, İK Uzmanı"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Hedeflediğiniz Bir Sonraki Rol / Kariyer Hedefi <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Örn: Senior Cloud Architect, Head of Growth, Data Science Manager"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Past Trainings Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300">
                Katıldığınız Eğitimlerin, Kursların ve Sertifikaların İçerikleri <span className="text-indigo-400">*</span>
              </label>
              <span className="text-xs text-slate-500">
                Ders konularını, araçları ve modülleri ne kadar detaylı yazarsanız o kadar keskin analiz yapılır.
              </span>
            </div>
            <textarea
              rows={6}
              required={!imageFile}
              value={trainingsText}
              onChange={(e) => setTrainingsText(e.target.value)}
              placeholder="Örnek:
1. İleri Düzey Python ve Makine Öğrenimi (Coursera):
   - Scikit-learn, Random Forest, Model Değerlendirme metrikleri
2. AWS Cloud Practitioner Eğitimi:
   - S3, EC2, IAM, Lambda temelleri
3. Proje Yönetimi & Çevik Metodolojiler Semineri:
   - Scrum seremonileri, Jira kullanımı"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs"
            />
          </div>

          {/* Visual Certificate / Syllabus Upload with Gemini OCR */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Sertifika, Kurs Müfredatı veya CV Görseli Yükle (Gemini Görsel Analiz)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Eğitim sertifikanızın veya kurs müfredatının ekran görüntüsünü yükleyin; Gemini metni otomatik okuyup analiz etsin.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="certificate-upload"
                />
                <label
                  htmlFor="certificate-upload"
                  className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Belge Görseli Seç</span>
                </label>
              </div>
            </div>

            {/* Upload status & preview */}
            {imagePreview && (
              <div className="flex items-center gap-3 p-3 bg-slate-850 rounded-lg border border-slate-800 mt-2">
                <img
                  src={imagePreview}
                  alt="Yüklenen Sertifika"
                  className="w-14 h-14 object-cover rounded border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{imageFile?.name}</p>
                  <p className="text-xs text-slate-400">
                    {ocrLoading ? 'Yapay zeka görseli okuyor...' : 'Görsel başarıyla eklendi ve metin aktarıldı.'}
                  </p>
                </div>
                {ocrLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || ocrLoading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Eğitim İçerikleri Analiz Ediliyor & Yol Haritası Çıkarılıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sonraki Eğitim Adımını Belirle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Action Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/30 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">
              Hedef: <span className="text-white font-semibold">{result.targetRole}</span> için <span className="text-indigo-400 font-semibold">{result.recommendedNextTrainings.length} öncelikli eğitim</span> ve gelişim haritası oluşturuldu.
            </div>
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
                  <span>Yol Haritasını Kaydet</span>
                </>
              )}
            </button>
          </div>

          {/* Executive Summary Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-6">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
              Kariyer & Eğitim Danışmanı Değerlendirmesi
            </span>
            <h3 className="text-xl font-bold text-white mt-1 mb-3">
              Mevcut Durum ve Stratejik Sıçrama Özeti
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {result.executiveSummary}
            </p>
          </div>

          {/* Acquired Competencies & Critical Skill Gaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Acquired Competencies */}
            <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Mevcut Kazanılan Yetkinlikler (Sağlam Temel)</h4>
              </div>
              <p className="text-xs text-slate-400">
                Aldığınız eğitimlerle başarıyla inşa ettiğiniz zemin:
              </p>

              <div className="space-y-3">
                {result.acquiredCompetencies.map((comp, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{comp.area}</span>
                      <span className="text-emerald-400 font-mono text-xs font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/50">
                        {comp.masteryLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Skill Gaps */}
            <div className="bg-slate-850/70 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h4 className="text-base font-bold text-white">Eksik Kalan Boşluklar & Kör Noktalar (Skill Gaps)</h4>
              </div>
              <p className="text-xs text-slate-400">
                Hedeflediğiniz pozisyona geçiş için bu eğitimlerin kapsamadığı kritik eksikler:
              </p>

              <div className="space-y-3">
                {result.criticalSkillGaps.map((gap, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{gap.gapName}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-200">Neden kritik:</strong> {gap.whyItMatters}
                    </p>
                    <p className="text-xs text-rose-300/80 italic">
                      Risk: {gap.riskIfIgnored}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Next Trainings (The Core Deliverable!) */}
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                Sizin İçin Özel Müfredat
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Bir Sonraki Adımda Alınması Gereken Öncelikli Eğitimler
              </h3>
              <p className="text-xs text-slate-400">
                Bu eğitimler tamamlanan eğitimlerinizin üzerine doğrudan oturacak ve hedef pozisyonunuza köprü kuracaktır.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {result.recommendedNextTrainings.map((training, idx) => (
                <div
                  key={idx}
                  className="bg-slate-850 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/50 text-indigo-300">
                            {training.priority}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400">{training.suggestedPlatforms}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">
                          {training.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Why this next */}
                  <div className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    <strong className="text-indigo-300 font-semibold">Neden Sıradaki Adım Bu Olmalı: </strong>
                    {training.whyThisNext}
                  </div>

                  {/* Topics to master */}
                  <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800/80">
                    <h5 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Bu Eğitimde Mutlaka Ustalaşılması Gereken Konu Başlıkları:</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {training.syllabusTopics.map((topic, tIdx) => (
                        <div key={tIdx} className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold select-none">›</span>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hands-on portfolio project */}
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs text-slate-300">
                    <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Eğitim Bitiminde Portfolyoya Eklenecek Somut Capstone Proje:</span>
                    </div>
                    <p className="leading-relaxed">{training.portfolioProject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Stage Career Roadmap */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-6">
            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                Gelişim Çizelgesi
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                3 Aşamalı Stratejik Kariyer Dönüşüm Planı
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.careerMilestones.map((ms, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">{ms.timeframe}</span>
                    <span className="text-xs text-slate-400 font-medium">{ms.phase}</span>
                  </div>
                  <h5 className="text-sm font-bold text-white">
                    {ms.focusGoal}
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800">
                    {ms.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
