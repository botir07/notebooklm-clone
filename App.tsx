import React, { useState } from 'react';
import { StudioSidebar } from './components/StudioSidebar'; 
import { ProjectSidebar } from './components/ProjectSidebar';
import { ChatWorkspace } from './components/ChatWorkspace';
import { ImageEditor } from './components/ImageEditor';
import { analyzeSource, generatePresentation, generateFlashcards, generateQuiz } from './services/geminiService';
import { Source, Project } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor'>('chat');
  const [sources, setSources] = useState<Source[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addSource = async (newSource: { name: string, data?: string, type: 'pdf' | 'text' }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const sourceObj: Source = { ...newSource, id, isAnalyzing: true, createdAt: Date.now() };
    setSources(prev => [...prev, sourceObj]);
    if (newSource.data) {
      try {
        const analysis = await analyzeSource(newSource.data);
        setSources(prev => prev.map(s => s.id === id ? { ...s, analysis, isAnalyzing: false } : s));
      } catch (err) {
        setSources(prev => prev.map(s => s.id === id ? { ...s, isAnalyzing: false } : s));
      }
    }
  };

  const handleStudioAction = async (type: string) => {
    if (sources.length === 0) return alert("Avval PDF yuklang!");
    setIsGenerating(true);
    try {
      let result;
      const latest = sources[sources.length - 1];
      if (type === 'slaydlar') result = await generatePresentation(latest);
      else if (type === 'kartochka') result = await generateFlashcards(latest);
      else if (type === 'testlar') result = await generateQuiz(latest);
      
      const newProject: Project = {
        id: Date.now().toString(),
        title: "Loyiha: " + type,
        type: type as any,
        content: result,
        createdAt: Date.now()
      };
      setProjects(prev => [newProject, ...prev]);
    } catch (err) {
      alert("AI xatosi yuz berdi");
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <StudioSidebar projects={projects || []} onAction={handleStudioAction} isGenerating={isGenerating} />
      <ProjectSidebar sources={sources || []} onAddSource={addSource} projects={projects || []} />
      <main className="flex-1 flex flex-col bg-white shadow-2xl m-2 rounded-[2rem] overflow-hidden border">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-slate-50/50">
          <h1 className="font-black text-indigo-600">BILIMGRAFIK AI</h1>
          <div className="flex bg-white p-1 rounded-xl border">
            <button onClick={() => setActiveTab('chat')} className={`px-6 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>CHAT</button>
            <button onClick={() => setActiveTab('editor')} className={`px-6 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>EDITOR</button>
          </div>
        </header>
        <div className="flex-1 relative overflow-hidden">
          {activeTab === 'chat' ? <ChatWorkspace sources={sources || []} onNewInfographic={(d) => setProjects(p => [d, ...p])} /> : <ImageEditor />}
        </div>
      </main>
    </div>
  );
};
export default App;