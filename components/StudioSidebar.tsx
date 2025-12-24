
import React, { useState } from 'react';
import { 
  PieChart, Monitor, Library, HelpCircle, 
  Loader2, PanelRightClose, MessageSquare, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { automatePdfToPoster, generatePresentation, generateFlashcards, generateQuiz } from '../services/geminiService';
import { 
  Source, InfographicData, PresentationData, FlashcardData, QuizData, 
  InfographicSettings, PresentationSettings, FlashcardSettings, QuizSettings 
} from '../types';
import { InfographicSettingsModal } from './InfographicSettingsModal';
import { PresentationSettingsModal } from './PresentationSettingsModal';
import { FlashcardSettingsModal } from './FlashcardSettingsModal';
import { QuizSettingsModal } from './QuizSettingsModal';

interface Props {
  sources: Source[];
  infographics: InfographicData[];
  presentations: PresentationData[];
  flashcards: FlashcardData[];
  quizzes: QuizData[];
  selectedSourceIds: string[];
  activeTab: 'chat' | 'studio' | 'editor' | 'presentation';
  onSelectItem: (id: string, type: 'poster' | 'presentation' | 'flashcard' | 'quiz' | 'chat') => void;
  onGeneratePoster: (data: any) => void;
  onGeneratePresentation: (data: any) => void;
  onGenerateFlashcards: (data: any) => void;
  onGenerateQuiz: (data: any) => void;
}

export const StudioSidebar: React.FC<Props> = ({ 
  sources, infographics, presentations, flashcards, quizzes, 
  selectedSourceIds, onSelectItem, 
  onGeneratePoster, onGeneratePresentation, onGenerateFlashcards, onGenerateQuiz
}) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'poster' | 'presentation' | 'flashcard' | 'quiz' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tools = [
    { id: 'poster', label: 'Grafika', icon: PieChart, color: 'text-indigo-500' },
    { id: 'presentation', label: 'Slaydlar', icon: Monitor, color: 'text-yellow-600' },
    { id: 'flashcard', label: 'Kartochka', icon: Library, color: 'text-rose-500' },
    { id: 'quiz', label: 'Testlar', icon: HelpCircle, color: 'text-cyan-500' },
  ];

  const handleToolClick = (id: string) => {
    setErrorMessage(null);
    const selectedSources = sources.filter(s => selectedSourceIds.includes(s.id) && !s.isAnalyzing);
    if (selectedSources.length === 0) {
      alert("Iltimos, avval chap paneldan kamida bitta 'TAYYOR' manbani belgilang.");
      return;
    }
    setActiveModal(id as any);
  };

  const getLatestSource = () => {
    const selectedSources = sources.filter(s => selectedSourceIds.includes(s.id) && !s.isAnalyzing);
    return selectedSources[selectedSources.length - 1];
  };

  const handleGeneratePoster = async (settings: InfographicSettings) => {
    const source = getLatestSource();
    if (!source?.data) return;
    setGeneratingId('poster');
    try {
      const res = await automatePdfToPoster({ 
        file: { data: source.data, mimeType: 'application/pdf' }, 
        preAnalysis: source.analysis,
        settings
      });
      onGeneratePoster(res);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage("Poster yaratishda xatolik yuz berdi.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGeneratePresentation = async (settings: PresentationSettings) => {
    const source = getLatestSource();
    if (!source?.data) return;
    setGeneratingId('presentation');
    try {
      const res = await generatePresentation({ data: source.data, mimeType: 'application/pdf' }, settings);
      onGeneratePresentation(res);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage("Slaydlarni yaratishda xatolik yuz berdi.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateFlashcards = async (settings: FlashcardSettings) => {
    const source = getLatestSource();
    if (!source?.data) return;
    setGeneratingId('flashcard');
    try {
      const res = await generateFlashcards({ data: source.data, mimeType: 'application/pdf' }, settings);
      onGenerateFlashcards(res);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage("Kartochkalarni yaratishda xatolik yuz berdi.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateQuiz = async (settings: QuizSettings) => {
    const source = getLatestSource();
    if (!source?.data) return;
    setGeneratingId('quiz');
    try {
      const res = await generateQuiz({ data: source.data, mimeType: 'application/pdf' }, settings);
      onGenerateQuiz(res);
      setActiveModal(null);
    } catch (err: any) {
      setErrorMessage("Testlarni yaratishda xatolik yuz berdi.");
    } finally {
      setGeneratingId(null);
    }
  };

  const allProjects = [
    ...infographics.map(i => ({ ...i, name: i.title, viewType: 'poster' as const })),
    ...presentations.map(p => ({ ...p, name: p.title, viewType: 'presentation' as const })),
    ...flashcards.map(f => ({ ...f, name: f.title, viewType: 'flashcard' as const })),
    ...quizzes.map(q => ({ ...q, name: q.title, viewType: 'quiz' as const }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <aside className="w-[280px] bg-white flex flex-col shrink-0 overflow-hidden border-l border-slate-100">
      <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Studiya</h2>
          <PanelRightClose size={16} className="text-slate-300" />
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Diqqat</span>
            </div>
            <p className="text-[10px] text-rose-700 font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-10">
          {tools.map((tool) => (
            <div 
              key={tool.id}
              onClick={() => !generatingId && handleToolClick(tool.id)}
              className="relative group cursor-pointer p-4 rounded-3xl border border-slate-50 hover:border-slate-200 hover:bg-slate-50 transition-all flex flex-col items-center gap-3 text-center aspect-square justify-center"
            >
              <div className={`p-3 rounded-2xl ${tool.color} bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform`}>
                {generatingId === tool.id ? <Loader2 size={20} className="animate-spin" /> : <tool.icon size={20} />}
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tool.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-1 mb-8">
           <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Mening Loyihalarim</h3>
             <button onClick={() => onSelectItem('chat', 'chat')} className="text-slate-300 hover:text-slate-900">
               <MessageSquare size={14} />
             </button>
           </div>
           
           {allProjects.length === 0 ? (
             <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-2 italic text-center py-4">Hali loyihalar yo'q</p>
           ) : (
             allProjects.map((item) => {
               let Icon = PieChart;
               let iconColor = "text-indigo-500 bg-indigo-50/50";
               if (item.viewType === 'presentation') { Icon = Monitor; iconColor = "text-yellow-600 bg-yellow-50/50"; }
               if (item.viewType === 'flashcard') { Icon = Library; iconColor = "text-rose-500 bg-rose-50/50"; }
               if (item.viewType === 'quiz') { Icon = HelpCircle; iconColor = "text-cyan-500 bg-cyan-50/50"; }

               return (
                 <div 
                   key={item.id} 
                   onClick={() => onSelectItem(item.id, item.viewType)}
                   className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-slate-50/50"
                 >
                   <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${iconColor} border border-slate-100/50`}>
                     <Icon size={14} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-[11px] font-bold truncate tracking-tight text-slate-600">{item.name}</h4>
                     <span className="text-[7px] font-black text-emerald-500 uppercase flex items-center gap-1">
                       <CheckCircle2 size={8} /> TAYYOR
                     </span>
                   </div>
                 </div>
               );
             })
           )}
        </div>
      </div>

      {activeModal === 'poster' && (
        <InfographicSettingsModal 
          onClose={() => setActiveModal(null)}
          onGenerate={handleGeneratePoster}
          isGenerating={generatingId === 'poster'}
        />
      )}
      {activeModal === 'presentation' && (
        <PresentationSettingsModal 
          onClose={() => setActiveModal(null)}
          onGenerate={handleGeneratePresentation}
          isGenerating={generatingId === 'presentation'}
        />
      )}
      {activeModal === 'flashcard' && (
        <FlashcardSettingsModal 
          onClose={() => setActiveModal(null)}
          onGenerate={handleGenerateFlashcards}
          isGenerating={generatingId === 'flashcard'}
        />
      )}
      {activeModal === 'quiz' && (
        <QuizSettingsModal 
          onClose={() => setActiveModal(null)}
          onGenerate={handleGenerateQuiz}
          isGenerating={generatingId === 'quiz'}
        />
      )}
    </aside>
  );
};
