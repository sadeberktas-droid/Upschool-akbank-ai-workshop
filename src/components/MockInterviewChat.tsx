import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Sparkles, 
  UserCheck, 
  ShieldQuestion, 
  Lightbulb, 
  Loader2, 
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage } from '../types/index.ts';

interface MockInterviewChatProps {
  initialTitle?: string;
  initialRole?: string;
  initialQuestion?: string;
}

const COACH_QUICK_QUESTIONS = [
  'STAR tekniğini mülakatta nasıl kusursuz uygularım?',
  'Mülakatçı "En büyük başarısızlığın neydi?" diye sorarsa ne demeliyim?',
  'Maaş beklentisi ve teklif pazarlığını bu unvandaki kişiyle nasıl yönetmeliyim?',
  'Teknik olarak bilmediğim bir soru gelirse dürüstçe nasıl toparlarım?',
];

export const MockInterviewChat: React.FC<MockInterviewChatProps> = ({
  initialTitle = 'Senior Engineering Manager',
  initialRole = 'Senior Full Stack Developer',
  initialQuestion,
}) => {
  const [interviewerTitle, setInterviewerTitle] = useState(initialTitle);
  const [candidateRole, setCandidateRole] = useState(initialRole);
  const [mode, setMode] = useState<'interviewer' | 'coach'>('interviewer');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize or reset chat when mode/interviewer changes
  useEffect(() => {
    initChat(initialQuestion);
  }, [mode, interviewerTitle, candidateRole]);

  const initChat = (startingQuestion?: string) => {
    if (mode === 'interviewer') {
      const welcomeText = startingQuestion
        ? `Merhaba, mülakatımıza hoş geldiniz. Ben ${interviewerTitle || 'Mülakatçınız'}. ${candidateRole || 'Bu pozisyon'} için başvurunuzu ve arka planınızı inceledim.\n\nHazırsanız şu soruyla başlayalım:\n\n👉 "${startingQuestion}"`
        : `Merhaba, mülakatımıza hoş geldiniz. Ben ${interviewerTitle || 'Mülakatçınız'}. ${candidateRole || 'Bu pozisyon'} için yaptığınız başvuruyu memnuniyetle değerlendiriyoruz.\n\nLütfen kısaca kendinizi ve son dönemde üzerinde çalıştığınız en kritik projedeki rolünüzü özetleyebilir misiniz?`;

      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([
        {
          id: 'welcome-coach',
          role: 'model',
          text: `Merhaba! Ben senin Kıdemli Kariyer ve Mülakat Koçunum. "${interviewerTitle}" karşısına çıkarken cevaplarını STAR formatına sokmana, hikayeleştirme yapmana ve en zor soruları avantajına çevirmene yardımcı olacağım.\n\nNereden başlamak istersin? İster hazırlandığın bir cevabı yaz ben eleştireyim, istersen stratejik bir soru sor!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          interviewerTitle,
          candidateRole,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error('Yanıt alınamadı.');
      }

      const data = await res.json();
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply || 'Cevap alınamadı.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Üzgünüm, yanıt üretilirken bir bağlantı sorunu yaşandı. Lütfen tekrar deneyin.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            <span>Canlı Mülakat Simülasyonu & Yapay Zeka Koçluk</span>
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Seçtiğiniz unvan ile karşılıklı mülakat yapın veya koçunuzdan cevaplarınızı analiz etmesini isteyin.
          </p>
        </div>

        {/* Mode Toggle Bar */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setMode('interviewer')}
            className={`px-3.5 py-1.5 font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              mode === 'interviewer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mülakatçı Simülasyonu</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('coach')}
            className={`px-3.5 py-1.5 font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              mode === 'coach'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Kariyer Koçu Modu</span>
          </button>
        </div>
      </div>

      {/* Profile Bar Config */}
      <div className="p-4 bg-slate-850/60 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Mülakatçının Unvanı
          </label>
          <input
            type="text"
            value={interviewerTitle}
            onChange={(e) => setInterviewerTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Hedef Pozisyonunuz
          </label>
          <input
            type="text"
            value={candidateRole}
            onChange={(e) => setCandidateRole(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-slate-850 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[560px]">
        {/* Chat Top Status */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-white">
              {mode === 'interviewer' ? `Mülakatçı: ${interviewerTitle}` : 'Kariyer & Mülakat Danışmanı'}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">
              {mode === 'interviewer' ? 'Canlı Değerlendirme & Takip Soruları' : 'STAR Taktikleri & Rehberlik'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => initChat()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Sohbeti Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yeniden Başlat</span>
          </button>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedIndex === index;

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1 opacity-70">
                    <span>{isUser ? 'Siz' : mode === 'interviewer' ? interviewerTitle : 'Koç'}</span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, index)}
                          className="hover:text-white transition-colors"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{mode === 'interviewer' ? `${interviewerTitle} yanıtınızı değerlendiriyor...` : 'Koçunuz taktik hazırlıyor...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {mode === 'coach' && (
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/40 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 shrink-0 font-medium">Hızlı Sor:</span>
            {COACH_QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 whitespace-nowrap cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'interviewer'
                  ? 'Cevabınızı buraya yazın (STAR yöntemini kullanarak durum, aksiyon ve sonucu aktarın)...'
                  : 'Koçunuza danışmak istediğiniz bir soruyu veya yanıtınızı yazın...'
              }
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Gönder</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
