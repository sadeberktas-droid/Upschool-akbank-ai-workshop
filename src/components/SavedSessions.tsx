import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  MessageSquareCode, 
  GraduationCap, 
  ChevronRight, 
  ArrowRight, 
  Download, 
  Check, 
  Copy,
  FolderOpen
} from 'lucide-react';
import { InterviewPrepResult, TrainingAnalysisResult } from '../types/index.ts';

interface SavedSessionsProps {
  interviewPlans: InterviewPrepResult[];
  trainingRoadmaps: TrainingAnalysisResult[];
  onSelectInterview: (plan: InterviewPrepResult) => void;
  onSelectTraining: (roadmap: TrainingAnalysisResult) => void;
  onDeleteInterview: (index: number) => void;
  onDeleteTraining: (index: number) => void;
}

export const SavedSessions: React.FC<SavedSessionsProps> = ({
  interviewPlans,
  trainingRoadmaps,
  onSelectInterview,
  onSelectTraining,
  onDeleteInterview,
  onDeleteTraining,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'interview' | 'training'>('interview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleExportMarkdown = (plan: InterviewPrepResult, idx: number) => {
    let md = `# Mülakat Hazırlığı: ${plan.interviewerTitle} - ${plan.candidateRole}\n\n`;
    md += `Tarih: ${new Date(plan.createdAt).toLocaleDateString()}\n\n`;
    md += `## Mülakatçı Profili\n`;
    md += `- Unvan: ${plan.interviewerProfile.title}\n`;
    md += `- Ana Odak: ${plan.interviewerProfile.coreFocus}\n`;
    md += `- Zihniyet: ${plan.interviewerProfile.psychologicalMindset}\n\n`;
    md += `## Sorular\n`;
    plan.questions.forEach((q, i) => {
      md += `### ${i + 1}. ${q.question} (${q.categoryLabel})\n`;
      md += `**Neden Soruluyor:** ${q.whyTheyAsk}\n\n`;
      md += `**Strateji:** ${q.answerStrategy}\n\n`;
      md += `**Örnek Cevap:** "${q.sampleAnswer}"\n\n`;
      md += `**Kırmızı Bayraklar:** ${q.redFlagsToAvoid}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedId(`interview-${idx}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTrainingMd = (roadmap: TrainingAnalysisResult, idx: number) => {
    let md = `# Eğitim & Kariyer Yol Haritası: ${roadmap.targetRole}\n\n`;
    md += `Mevcut Rol: ${roadmap.currentRole}\n`;
    md += `Hedef: ${roadmap.targetRole}\n\n`;
    md += `## Yönetici Özeti\n${roadmap.executiveSummary}\n\n`;
    md += `## Önerilen Sıradaki Eğitimler\n`;
    roadmap.recommendedNextTrainings.forEach((t, i) => {
      md += `### ${i + 1}. ${t.title} [${t.priority}]\n`;
      md += `**Neden Bu Eğitim:** ${t.whyThisNext}\n`;
      md += `**Platform/Ekol:** ${t.suggestedPlatforms}\n`;
      md += `**Konular:** ${t.syllabusTopics.join(', ')}\n`;
      md += `**Proje:** ${t.portfolioProject}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedId(`training-${idx}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasAnySaved = interviewPlans.length > 0 || trainingRoadmaps.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-indigo-400" />
            <span>Kayıtlı Mülakat & Eğitim Planlarınız</span>
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Daha önce oluşturduğunuz ve tarayıcınızda saklanan mülakat stratejilerini ve eğitim yol haritalarını inceleyin.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('interview')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'interview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>Mülakatlar ({interviewPlans.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('training')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'training'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Eğitim Haritaları ({trainingRoadmaps.length})</span>
          </button>
        </div>
      </div>

      {!hasAnySaved ? (
        <div className="p-12 text-center bg-slate-850/40 border border-slate-800 rounded-xl space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">Henüz Kayıtlı Plan Yok</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            "Unvana Özel Sorular" veya "Eğitim Analizi" sekmelerinden analiz yapıp "Kaydet" butonuna tıklayarak burada arşivleyebilirsiniz.
          </p>
        </div>
      ) : activeSubTab === 'interview' ? (
        interviewPlans.length === 0 ? (
          <div className="p-8 text-center bg-slate-850/40 border border-slate-800 rounded-xl text-xs text-slate-400">
            Kayıtlı mülakat planı bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewPlans.map((plan, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-850 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono">{new Date(plan.createdAt).toLocaleDateString('tr-TR')}</span>
                    <span className="text-indigo-400 font-semibold">{plan.questions.length} Soru</span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {plan.interviewerTitle}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Aday Rolü: <span className="text-indigo-300 font-medium">{plan.candidateRole}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {plan.interviewerProfile.coreFocus}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportMarkdown(plan, idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Markdown Olarak Kopyala"
                    >
                      {copiedId === `interview-${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Kopyala</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteInterview(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectInterview(plan)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Görüntüle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : trainingRoadmaps.length === 0 ? (
        <div className="p-8 text-center bg-slate-850/40 border border-slate-800 rounded-xl text-xs text-slate-400">
          Kayıtlı eğitim yol haritası bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingRoadmaps.map((map, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-850 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono">{new Date(map.createdAt).toLocaleDateString('tr-TR')}</span>
                  <span className="text-indigo-400 font-semibold">{map.recommendedNextTrainings.length} Öncelikli Eğitim</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Hedef: {map.targetRole}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Mevcut: <span className="text-slate-400">{map.currentRole}</span>
                </p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {map.executiveSummary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportTrainingMd(map, idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Markdown Olarak Kopyala"
                  >
                    {copiedId === `training-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Kopyala</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTraining(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTraining(map)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Görüntüle</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
