import React from 'react';
import { Project } from '../types';

interface Props { projects: Project[]; onAction: (t: string) => void; isGenerating: boolean; }

export const StudioSidebar: React.FC<Props> = ({ projects = [], onAction, isGenerating }) => {
  return (
    <div className="w-64 border-r bg-white p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asboblar</h3>
        {['slaydlar', 'kartochka', 'testlar'].map(type => (
          <button 
            key={type}
            disabled={isGenerating}
            onClick={() => onAction(type)}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-500 transition-all text-left text-[10px] font-bold uppercase text-slate-600"
          >
            + {type} yaratish
          </button>
        ))}
      </div>
      <div className="mt-auto space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loyihalar</h3>
        <div className="space-y-2">
          {projects && projects.length > 0 ? projects.map(p => (
            <div key={p.id} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-[11px] font-bold truncate text-slate-700">{p.title}</p>
              <p className="text-[9px] text-indigo-600 font-bold uppercase">{p.type}</p>
            </div>
          )) : <p className="text-[10px] text-slate-300 text-center py-4 italic">Ro'yxat bo'sh</p>}
        </div>
      </div>
    </div>
  );
};