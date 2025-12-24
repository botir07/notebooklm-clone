
import React, { useState, useEffect } from 'react';
import { 
  Download, ChevronLeft, ChevronRight, Sparkles, 
  BookOpen, Lightbulb, Target, Info, Bookmark, 
  Share2, Maximize2
} from 'lucide-react';

export const InfographicStudio: React.FC<{ infographics: any[], selectedId?: string | null, hideHeader?: boolean }> = ({ infographics, selectedId, hideHeader }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeInfoTab, setActiveInfoTab] = useState<'summary' | 'concepts'>('summary');
  
  useEffect(() => {
    if (selectedId) {
      const idx = infographics.findIndex(i => i.id === selectedId);
      if (idx !== -1) setSelectedIndex(idx);
    }
  }, [selectedId, infographics]);

  const current = infographics[selectedIndex];

  const download = () => {
    if (!current?.imageUrl) return;
    const link = document.createElement('a');
    link.download = `BilimGrafik-${current.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = current.imageUrl;
    link.click();
  };

  if (infographics.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-white">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-10 border border-slate-100 animate-pulse">
          <Sparkles size={40} className="text-slate-200" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Hali posterlar yaratilmagan</h3>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-500">
      {/* Dynamic Grid Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: The Poster Visual */}
        {/* items-start ensures the top of the infographic is always visible when content overflows */}
        <div className="flex-[1.5] overflow-y-auto p-8 lg:p-12 flex flex-col items-center justify-start custom-scrollbar">
          <div className="max-w-3xl w-full relative group py-4 lg:py-8">
            {/* Poster Shadow Effect */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] opacity-20 -z-10 rounded-full"></div>
            
            <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 relative overflow-hidden">
              <img src={current.imageUrl} alt={current.title} className="w-full h-auto rounded-[2.2rem]" />
              
              {/* Overlay Actions */}
              <div className="absolute top-8 right-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <button onClick={download} className="p-4 bg-white/90 backdrop-blur shadow-xl rounded-2xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all">
                  <Download size={20} />
                </button>
                <button className="p-4 bg-white/90 backdrop-blur shadow-xl rounded-2xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all">
                  <Maximize2 size={20} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between px-4 pb-10">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full">AI Generated</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3:4 Poster Format</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Share2 size={16}/></button>
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Bookmark size={16}/></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Analysis & Metadata */}
        <div className="flex-1 bg-white border-l border-slate-100 flex flex-col overflow-hidden">
          <div className="p-10 shrink-0">
            <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{current.title}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Hujjatning intellektual tahlili</p>
            
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setActiveInfoTab('summary')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeInfoTab === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Konspekt
              </button>
              <button 
                onClick={() => setActiveInfoTab('concepts')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeInfoTab === 'concepts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Terminlar
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
            {activeInfoTab === 'summary' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                   <div className="flex items-center gap-2 mb-4 text-indigo-600">
                      <Lightbulb size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Asosiy G'oya</span>
                   </div>
                   <p className="text-slate-600 text-sm leading-relaxed font-medium">
                     {current.summary}
                   </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 px-2">
                    <Target size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Kutilayotgan natijalar</span>
                  </div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">0{i}</div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">Ushbu poster orqali mavzuning murakkab qismlari vizual tarzda osonlashtirildi.</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                {current.keyConcepts?.map((concept: any, idx: number) => (
                  <div key={idx} className="group p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default">
                    <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                      <BookOpen size={16} className="text-slate-300 group-hover:text-indigo-400" />
                      {concept.term}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {concept.definition}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-10 border-t border-slate-50 bg-slate-50/50">
             <div className="flex items-center gap-4 text-slate-400">
               <Info size={16} />
               <p className="text-[9px] font-bold leading-relaxed">
                 Ushbu infografika va tahlil Gemini AI tomonidan PDF manba asosida avtomatik shakllantirildi.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
