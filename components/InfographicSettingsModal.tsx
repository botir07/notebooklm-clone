
import React, { useState } from 'react';
import { X, Check, Layout, Square, Columns } from 'lucide-react';
import { InfographicSettings } from '../types';

interface Props {
  onClose: () => void;
  onGenerate: (settings: InfographicSettings) => void;
  isGenerating: boolean;
}

export const InfographicSettingsModal: React.FC<Props> = ({ onClose, onGenerate, isGenerating }) => {
  const [settings, setSettings] = useState<InfographicSettings>({
    language: 'uz',
    orientation: 'vertical',
    detailLevel: 'standard',
    description: ''
  });

  const orientations = [
    { id: 'horizontal', label: 'Gorizontal', icon: Columns },
    { id: 'vertical', label: 'Vertikal', icon: Layout },
    { id: 'square', label: 'Kvadrat', icon: Square },
  ];

  const levels = [
    { id: 'low', label: 'Past' },
    { id: 'standard', label: 'Standart' },
    { id: 'high', label: 'Yuqori', beta: true },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200/50">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layout size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Infografika sozlamalari</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Language Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tilni tanlang</label>
              <select 
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value as any})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="uz">O'zbekcha (Lotin)</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Orientatsiyani tanlang</label>
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                {orientations.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSettings({...settings, orientation: o.id as any})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.orientation === o.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {settings.orientation === o.id && <Check size={12} />}
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detail Level */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tafsilot darajasi</label>
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
              {levels.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSettings({...settings, detailLevel: l.id as any})}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.detailLevel === l.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {settings.detailLevel === l.id && <Check size={12} />}
                  {l.label}
                  {l.beta && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[7px] ml-1">BETA</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Infografikani tasvirlang</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
              placeholder="Uslub, rang yoki asosiy elementlarni ko'rsating: 'Ko'k rangli mavzudan foydalaning va uchta asosiy ko'rsatkichni ajratib ko'rsating'"
              className="w-full h-32 p-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner placeholder:text-slate-300"
            />
          </div>
        </div>

        <footer className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => onGenerate(settings)}
            disabled={isGenerating}
            className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            Yaratish
          </button>
        </footer>
      </div>
    </div>
  );
};
