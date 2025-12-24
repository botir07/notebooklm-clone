
import React, { useEffect, useState } from 'react';
import { PresentationData } from '../types';
import { 
  Play, Layout, Monitor, Sparkles, ImageIcon, Download, FileText, FileBarChart, Loader2, ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';

export const PresentationStudio: React.FC<{ presentations: PresentationData[], selectedId?: string | null, hideHeader?: boolean }> = ({ presentations, selectedId, hideHeader }) => {
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [isExporting, setIsExporting] = useState<'pdf' | 'pptx' | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    if (selectedId) {
      const idx = presentations.findIndex(p => p.id === selectedId);
      if (idx !== -1) setSelectedDeckIndex(idx);
    }
  }, [selectedId, presentations]);

  if (presentations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-white">
        <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-10 border border-indigo-100">
          <Layout size={40} className="text-indigo-200" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Prezentatsiyalar mavjud emas</h3>
        <p className="max-w-md text-sm text-slate-400 font-medium">
          PDF hujjat yuklang va "Prezentatsiya Yaratish" tugmasini bosing. AI yaxlit 16:9 o'quv slaydlarini tayyorlaydi.
        </p>
      </div>
    );
  }

  const currentDeck = presentations[selectedDeckIndex];

  const exportToPDF = async () => {
    setIsExporting('pdf');
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720]
      });

      for (let i = 0; i < currentDeck.slides.length; i++) {
        const slide = currentDeck.slides[i];
        if (i > 0) pdf.addPage([1280, 720], 'landscape');
        
        // Background color
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 1280, 720, 'F');

        if (slide.imageUrl) {
          try {
            pdf.addImage(slide.imageUrl, 'PNG', 0, 0, 1280, 720);
          } catch (e) {
            console.error("Image failed to load in PDF", e);
          }
        }
      }
      pdf.save(`${currentDeck.title.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF yaratishda xatolik.");
    } finally {
      setIsExporting(null);
      setShowDownloadMenu(false);
    }
  };

  const exportToPPTX = async () => {
    setIsExporting('pptx');
    try {
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';

      currentDeck.slides.forEach((slide) => {
        const s = pres.addSlide();
        if (slide.imageUrl) {
          s.addImage({ data: slide.imageUrl, x: 0, y: 0, w: '100%', h: '100%' });
        } else {
          s.background = { color: 'FFFFFF' };
          s.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '333333' });
          s.addText(slide.content.join('\n'), { x: 0.5, y: 1.5, fontSize: 18, color: '666666' });
        }
      });

      await pres.writeFile({ fileName: `${currentDeck.title.replace(/\s+/g, '-')}.pptx` });
    } catch (err) {
      console.error(err);
      alert("PPTX yaratishda xatolik.");
    } finally {
      setIsExporting(null);
      setShowDownloadMenu(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {!hideHeader && (
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-white shadow-sm z-20">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold text-slate-900 truncate max-w-[400px]">{currentDeck.title}</h3>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Sparkles size={10} /> {currentDeck.slides.length} Slaydlar
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Yuklab Olish
                <ChevronDown size={14} />
              </button>

              {showDownloadMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={exportToPDF}
                    disabled={!!isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50"
                  >
                    <FileText size={16} className="text-rose-500" />
                    <span className="text-[11px] font-bold text-slate-600">PDF Formatda</span>
                  </button>
                  <button 
                    onClick={exportToPPTX}
                    disabled={!!isExporting}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <FileBarChart size={16} className="text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-600">PowerPoint (PPTX)</span>
                  </button>
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all">
              <Play size={14} /> Namoyish
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/30 p-6 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
          {currentDeck.slides.map((slide, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <div className="w-full aspect-video relative group">
                <div className="w-full h-full bg-white rounded-[2rem] shadow-xl border border-slate-200/50 overflow-hidden relative">
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-200">
                      <ImageIcon size={64} className="animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Slayd tayyorlanmoqda...</p>
                    </div>
                  )}
                  
                  <div className="absolute top-6 left-6">
                    <div className="px-3 py-1.5 bg-black/10 backdrop-blur-md rounded-xl text-[9px] font-black text-white uppercase tracking-widest border border-white/10 shadow-sm">
                      Slayd {idx + 1}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-8 flex flex-col gap-2">
                 <h4 className="text-sm font-bold text-slate-800 tracking-tight">{slide.title}</h4>
                 <div className="flex flex-wrap gap-2">
                   {slide.content.map((c, i) => (
                     <span key={i} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] text-slate-500 font-medium">
                       {c}
                     </span>
                   ))}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
