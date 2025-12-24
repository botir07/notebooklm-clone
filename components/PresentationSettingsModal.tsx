
import React, { useState } from 'react';
import { X, Check, Monitor, LayoutTemplate } from 'lucide-react';
import { PresentationSettings } from '../types';

interface Props {
  onClose: () => void;
  onGenerate: (settings: PresentationSettings) => void;
  isGenerating: boolean;
}

export const PresentationSettingsModal: React.FC<Props> = ({ onClose, onGenerate, isGenerating }) => {
  const [settings, setSettings] = useState<PresentationSettings>({
    language: 'uz',
    slideCount: 10,
    style: 'corporate',
    description: ''
  });

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200/50">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
              <Monitor size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Prezentatsiya sozlamalari</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Til</label>
              <select 
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value as any})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none"
              >
                <option value="uz">O'zbekcha</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Slaydlar soni</label>
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                {[5, 10, 15].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSettings({...settings, slideCount: val as any})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.slideCount === val ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {val} Slayd
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dizayn uslubi</label>
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
              {['minimalist', 'corporate', 'creative'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSettings({...settings, style: s as any})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.style === s ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Qo'shimcha tavsif</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
              placeholder="Masalan: 'Ko'k va oq ranglardan foydalaning, ko'proq grafikalar bo'lsin'"
              className="w-full h-32 p-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
            />
          </div>
        </div>

        <footer className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => onGenerate(settings)}
            disabled={isGenerating}
            className="flex items-center gap-3 px-10 py-4 bg-yellow-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-700 transition-all shadow-xl disabled:opacity-50"
          >
            {isGenerating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Slaydlarni Yaratish
          </button>
        </footer>
      </div>
    </div>
  );
};
