import React from 'react';
import { Sparkles, MessageSquareCode, GraduationCap, MessagesSquare, Bookmark } from 'lucide-react';

interface NavbarProps {
  activeTab: 'interview' | 'training' | 'chat' | 'saved';
  setActiveTab: (tab: 'interview' | 'training' | 'chat' | 'saved') => void;
  onQuickStart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickStart }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('interview')}
            className="text-left font-bold text-lg tracking-tight text-white whitespace-nowrap shrink-0 hover:text-indigo-400 transition-colors"
          >
            CareerMentor <span className="text-indigo-400 font-semibold text-base">AI</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('interview')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'interview'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>Unvana Özel Sorular</span>
          </button>

          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'training'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Eğitim & Kariyer Analizi</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'chat'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessagesSquare className="w-4 h-4" />
            <span>Canlı Mülakat Simülasyonu</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 ${
              activeTab === 'saved'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Kayıtlı Planlar</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickStart}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Koçluğu Başlat</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-900/95 py-2 px-2 text-xs">
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'interview' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <MessageSquareCode className="w-4 h-4" />
          <span>Sorular</span>
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'training' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Eğitim Analizi</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'chat' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <MessagesSquare className="w-4 h-4" />
          <span>Simülasyon</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            activeTab === 'saved' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Kayıtlar</span>
        </button>
      </div>
    </header>
  );
};
