
import React, { useState, useRef } from 'react';
import { generateInfographic } from '../services/geminiService';
import { InfographicData } from '../types';
import * as htmlToImage from 'html-to-image';
import { 
  Loader2, AlertCircle, CheckCircle2, Lightbulb, 
  Book, HelpCircle, FileUp, X, FileText, BrainCircuit, 
  MessageSquareText, ChevronDown, ChevronUp, Cpu, ShieldCheck, Download, 
  ImageIcon, Code, Zap, Info, Target, Star
} from 'lucide-react';

const IconMap: Record<string, React.FC<any>> = {
  Book, Lightbulb, CheckCircle2, AlertCircle, HelpCircle, Code, Zap, Info, Target, Star
};

export const InfographicGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [pdfFile, setPdfFile] = useState<{ data: string, name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSystem, setShowSystem] = useState(false);
  
  const infographicRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPdfFile({ data: base64String, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadAsImage = async (format: 'png' | 'jpeg') => {
    if (!infographicRef.current) return;
    setIsExporting(true);
    try {
      const options = { pixelRatio: 3, backgroundColor: '#0f172a' };
      const dataUrl = format === 'png' 
        ? await htmlToImage.toPng(infographicRef.current, options)
        : await htmlToImage.toJpeg(infographicRef.current, options);
      const link = document.createElement('a');
      link.download = `bilimgrafik-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() && !pdfFile) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateInfographic({
        text: input.trim() || undefined,
        file: pdfFile ? { data: pdfFile.data, mimeType: 'application/pdf' } : undefined,
        customSystemPrompt: customPrompt.trim() || undefined
      });
      setData(result);
    } catch (err) {
      setError("Xatolik. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Settings Side */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">System Prompt</h4>
            <button onClick={() => setShowSystem(!showSystem)} className="text-slate-500">
              {showSystem ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          {showSystem && (
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Masalan: 'Python mavzusida kodli misollar bilan poster yarating...'"
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-indigo-100 outline-none"
            />
          )}
          
          <div className="mt-6 space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mavzu yoki matnni kiriting..."
              className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-white text-slate-900"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 transition-all"
            >
              <input type="file" className="hidden" ref={fileInputRef} accept="application/pdf" onChange={handleFileChange} />
              {pdfFile ? <p className="text-xs font-bold text-indigo-600 truncate">{pdfFile.name}</p> : <p className="text-[10px] text-slate-400 uppercase font-black">Manba PDF (Optional)</p>}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Cpu size={18} />}
              Poster Yaratish
            </button>
          </div>
        </div>
      </div>

      {/* Poster Display */}
      <div className="lg:col-span-8">
        {data ? (
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <button onClick={() => downloadAsImage('png')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                <Download size={14} /> PNG Yuklab Olish
              </button>
            </div>

            <div 
              ref={infographicRef}
              className="bg-[#0f172a] text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[900px] flex flex-col"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #1e293b 0%, #0f172a 100%)' }}
            >
              {/* Header */}
              <div className="text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-indigo-500 rounded-full opacity-50 blur-sm"></div>
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 mt-4 leading-tight">{data.title}</h2>
                {data.subtitle && <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px]">{data.subtitle}</p>}
              </div>

              {/* Main Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {data.sections.map((section: any, idx: number) => {
                  const IconComp = IconMap[section.icon] || Info;
                  const isCode = section.type === 'code' || section.title.toLowerCase().includes('misol');
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-8 rounded-[2rem] border transition-all ${
                        isCode 
                        ? 'bg-slate-950 border-emerald-500/30 md:col-span-2' 
                        : 'bg-white/5 border-white/10 backdrop-blur-md'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-2xl ${isCode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                          <IconComp size={24} />
                        </div>
                        <h4 className={`font-black uppercase tracking-widest text-xs ${isCode ? 'text-emerald-400' : 'text-indigo-300'}`}>
                          {section.title}
                        </h4>
                      </div>
                      
                      {isCode ? (
                        <div className="font-mono text-sm space-y-2 bg-black/40 p-6 rounded-2xl border border-white/5">
                          {section.content.map((line: string, i: number) => (
                            <p key={i} className="flex gap-4">
                              <span className="text-slate-600 select-none">{i+1}</span>
                              <span className={line.includes('import') || line.includes('def') ? 'text-pink-400' : 'text-slate-300'}>{line}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {section.content.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-300 font-medium text-sm leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer / Highlights */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] shadow-xl">
                  <h4 className="font-black uppercase text-[10px] tracking-[0.3em] mb-4 text-indigo-100 flex items-center gap-2">
                    <Star size={14} /> Muhim Nuqtalar
                  </h4>
                  <div className="space-y-3">
                    {data.highlights.map((h: string, i: number) => (
                      <p key={i} className="text-sm font-bold text-white leading-snug flex gap-3">
                        <span className="opacity-40">0{i+1}</span> {h}
                      </p>
                    ))}
                  </div>
                </div>

                {data.steps && (
                  <div className="space-y-4">
                    <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-500">Strategiya</h4>
                    <div className="flex flex-col gap-3">
                      {data.steps.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <span className="text-xl font-black text-indigo-500/50">{s.step}</span>
                          <p className="text-xs font-bold text-slate-400">{s.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[600px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
              <ImageIcon size={32} className="opacity-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">Poster kutish holatida</p>
          </div>
        )}
      </div>
    </div>
  );
};
