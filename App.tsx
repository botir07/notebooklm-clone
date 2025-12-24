
import React, { useState } from 'react';
import { Source, InfographicData, PresentationData, FlashcardData, QuizData } from './types';
import { ProjectSidebar } from './components/ProjectSidebar';
import { StudioSidebar } from './components/StudioSidebar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { ImageEditor } from './components/ImageEditor';
import { ProjectModal } from './components/ProjectModal';
import { Settings, Sparkles, Layers } from 'lucide-react';
import { analyzeSource } from './services/geminiService';

const App: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [infographics, setInfographics] = useState<InfographicData[]>([]);
  const [presentations, setPresentations] = useState<PresentationData[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  
  const [activeTab, setActiveTab] = useState<'chat' | 'editor'>('chat');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  const addSource = async (newSource: { name: string, data?: string, type: 'pdf' | 'text' }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const sourceObj: Source = { 
      ...newSource, 
      id, 
      isAnalyzing: true, 
      createdAt: Date.now() 
    };
    setSources(prev => [...prev, sourceObj]);
    setSelectedSourceIds(prev => [...prev, id]);

    if (newSource.type === 'pdf' && newSource.data) {
      try {
        const analysis = await analyzeSource({ data: newSource.data, mimeType: 'application/pdf' });
        setSources(prev => prev.map(s => s.id === id ? { ...s, analysis, isAnalyzing: false } : s));
      } catch (err) {
        console.error("Tahlilda xatolik:", err);
        setSources(prev => prev.map(s => s.id === id ? { ...s, isAnalyzing: false } : s));
      }
    } else {
      setSources(prev => prev.map(s => s.id === id ? { ...s, isAnalyzing: false } : s));
    }
  };

  const toggleSourceSelection = (id: string) => {
    setSelectedSourceIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleNewPoster = (data: InfographicData) => {
    setInfographics([data, ...infographics]);
    setSelectedItemId(data.id);
    setIsModalOpen(true);
  };

  const handleNewPresentation = (data: PresentationData) => {
    setPresentations([data, ...presentations]);
    setSelectedItemId(data.id);
    setIsModalOpen(true);
  };

  const handleNewFlashcards = (data: FlashcardData) => {
    setFlashcards([data, ...flashcards]);
    setSelectedItemId(data.id);
    setIsModalOpen(true);
  };

  const handleNewQuiz = (data: QuizData) => {
    setQuizzes([data, ...quizzes]);
    setSelectedItemId(data.id);
    setIsModalOpen(true);
  };

  const handleSelectItem = (id: string, type: string) => {
    if (type === 'chat') {
       setActiveTab('chat');
       setSelectedItemId(null);
    } else {
       setSelectedItemId(id);
       setIsModalOpen(true);
    }
  };

  return (
    <div className="h-screen flex bg-white text-slate-900 overflow-hidden font-sans">
      <ProjectSidebar 
        sources={sources}
        onAddSource={addSource}
        onSelectItem={(id) => handleSelectItem(id, 'source')}
        selectedId={selectedItemId}
        selectedSourceIds={selectedSourceIds}
        onToggleSource={toggleSourceSelection}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-white border-x border-slate-100">
        <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-2 rounded-xl text-white shadow-sm">
              <Layers size={18} />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tighter text-lg leading-none">BilimGrafik</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
              <Settings size={18} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
               <Sparkles size={18} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatWorkspace 
              sources={sources.filter(s => selectedSourceIds.includes(s.id))} 
              onNewInfographic={handleNewPoster} 
            />
          )}
          {activeTab === 'editor' && <div className="p-12"><ImageEditor /></div>}
        </div>
      </main>

      <StudioSidebar 
        sources={sources}
        infographics={infographics}
        presentations={presentations}
        flashcards={flashcards}
        quizzes={quizzes}
        selectedSourceIds={selectedSourceIds}
        activeTab={activeTab as any}
        onSelectItem={handleSelectItem}
        onGeneratePoster={handleNewPoster}
        onGeneratePresentation={handleNewPresentation}
        onGenerateFlashcards={handleNewFlashcards}
        onGenerateQuiz={handleNewQuiz}
      />

      {isModalOpen && selectedItemId && (
        <ProjectModal 
          itemId={selectedItemId}
          infographics={infographics}
          presentations={presentations}
          flashcards={flashcards}
          quizzes={quizzes}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
