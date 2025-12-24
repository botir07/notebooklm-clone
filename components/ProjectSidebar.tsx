
import React, { useRef } from 'react';
import { 
  Plus, Database, Loader2, FileText, 
  Search, CheckCircle2, Square, CheckSquare
} from 'lucide-react';
import { Source } from '../types';

interface Props {
  sources: Source[];
  onAddSource: (s: { name: string, data?: string, type: 'pdf' | 'text' }) => void;
  onSelectItem: (id: string) => void;
  selectedId: string | null;
  selectedSourceIds: string[];
  onToggleSource: (id: string) => void;
}

export const ProjectSidebar: React.FC<Props> = ({ 
  sources, onAddSource, onSelectItem, selectedId,
  selectedSourceIds, onToggleSource
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddSource({ 
          name: file.name, 
          data: (reader.result as string).split(',')[1], 
          type: 'pdf' 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-[300px] bg-white flex flex-col shrink-0 overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <button 
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={16} /> Yangi Qo'shish
        </button>
        <input type="file" ref={fileRef} className="hidden" accept="application/pdf" onChange={handleFile} />
      </div>

      <div className="px-6 py-4 flex items-center gap-2 text-slate-300 border-b border-slate-50">
         <Search size={14} />
         <input type="text" placeholder="Qidiruv..." className="bg-transparent border-none outline-none text-xs font-medium w-full text-slate-600 placeholder:text-slate-300" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
        <h3 className="px-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Mening Manbalarim</h3>
        
        {sources.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <Database className="text-slate-100 mb-4" size={40} />
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4">Hozircha manbalar mavjud emas</p>
          </div>
        ) : (
          sources.map((item) => {
            const isActive = selectedId === item.id;
            const isSelected = selectedSourceIds.includes(item.id);
            
            return (
              <div 
                key={item.id} 
                className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${isActive ? 'bg-slate-50 border-slate-100 shadow-sm' : 'hover:bg-slate-50/50 border-transparent'}`}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleSource(item.id); }}
                  className={`shrink-0 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-200 hover:text-slate-300'}`}
                >
                  {isSelected ? <CheckSquare size={18} fill="currentColor" className="text-white" style={{ stroke: 'rgb(79 70 229)' }} /> : <Square size={18} />}
                </button>

                <div 
                  onClick={() => onSelectItem(item.id)}
                  className="flex flex-1 items-center gap-3 min-w-0"
                >
                  <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100/50`}>
                    {item.isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold truncate tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.isAnalyzing ? (
                        <span className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-1">
                          <Loader2 size={8} className="animate-spin" /> Tahlil...
                        </span>
                      ) : (
                        <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-1">
                          <CheckCircle2 size={8} /> Tayyor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
