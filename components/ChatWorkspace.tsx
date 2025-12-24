import React, { useState, useRef, useEffect } from 'react';
import { automatePdfToPoster, querySources } from '../services/geminiService';
import { Loader2, Send, Sparkles, MessageSquare, Image as ImageIcon, Info } from 'lucide-react';
import { Source } from '../types';

interface Props {
  sources: Source[];
  onNewInfographic: (data: any) => void;
}

export const ChatWorkspace: React.FC<Props> = ({ sources, onNewInfographic }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, type?: 'text' | 'action' }[]>([
    { role: 'ai', text: "Salom! Men siz yuklagan manbalar asosida savollarga javob berishim yoki posterlar yaratib berishim mumkin. Qanday yordam bera olaman?", type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Xabarlar ko'payganda avtomatik pastga tushirish
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsgText = input;
    const userMsgLower = input.toLowerCase();
    
    // Foydalanuvchi xabarini ekranda ko'rsatish
    const updatedMessages = [...messages, { role: 'user' as const, text: userMsgText, type: 'text' as const }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Poster yaratish so'rovini tekshirish
      const isInfographicRequest = 
        userMsgLower.includes('poster') || 
        userMsgLower.includes('infografika') || 
        userMsgLower.includes('yarat') || 
        userMsgLower.includes('chiz');

      if (isInfographicRequest && sources.length > 0) {
        const latestSource = sources[sources.length - 1];
        
        if (latestSource.isAnalyzing) {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: "Hujjat hali tahlil qilinmoqda. Iltimos, bir necha soniya kuting va qaytadan so'rang.", 
            type: 'text' 
          }]);
          setLoading(false);
          return;
        }

        const result = await automatePdfToPoster({
          file: { data: latestSource.data!, mimeType: 'application/pdf' },
          preAnalysis: latestSource.analysis
        });
        
        onNewInfographic(result);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: "Ajoyib! Sizning so'rovingiz asosida yangi infografika posteri tayyorlandi. Uni o'ng tarafdagi 'Studiya' bo'limida ko'rishingiz mumkin.",
          type: 'action'
        }]);
      } else {
        // Savol-javob rejimi
        if (sources.length === 0) {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: "Kechirasiz, hali hech qanday manba (PDF) yuklanmagan. Savol berish uchun avval chap paneldan manba qo'shing.", 
            type: 'text' 
          }]);
        } else {
          // TUZATISH: querySources funksiyasiga tarix va manbalarni to'liq yuboramiz
          const answer = await querySources(updatedMessages, sources);
          setMessages(prev => [...prev, { role: 'ai', text: answer, type: 'text' }]);
        }
      }
    } catch (err) {
      console.error("Chat hatoligi:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "Xatolik yuz berdi. Backend server ishlayotganini va API kalitni tekshiring.", type: 'text' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Xabarlar maydoni */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <div className={`max-w-3xl flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${
                m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {m.role === 'user' ? <MessageSquare size={14} /> : <Sparkles size={14} />}
              </div>
              <div className={`p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : m.type === 'action' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tl-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap font-medium">
                  {m.text}
                </div>
                {m.type === 'action' && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    <ImageIcon size={12} /> Poster yaratildi
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={14} />
              </div>
              <div className="bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI o'ylamoqda...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input maydoni */}
      <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Yuklangan PDF bo'yicha savol bering..."
            className="w-full h-24 p-6 pr-32 bg-slate-100 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/5 outline-none resize-none text-sm font-bold placeholder:text-slate-400 transition-all shadow-inner"
          />
          <div className="absolute right-5 bottom-5 flex gap-3">
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-xl shadow-indigo-200 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Yuborish
            </button>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-6">
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
             <Info size={12} /> Faqat manbalar asosida
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
             <ImageIcon size={12} /> Poster rejimi faol
           </div>
        </div>
      </div>
    </div>
  );
};