
import React, { useState } from 'react';
import { 
  X, Share2, 
  ThumbsUp, ThumbsDown, MoreHorizontal, FileDown, Loader2
} from 'lucide-react';
import { InfographicStudio } from './InfographicStudio';
import { PresentationStudio } from './PresentationStudio';
import { FlashcardStudio } from './FlashcardStudio';
import { QuizStudio } from './QuizStudio';
import { InfographicData, PresentationData, FlashcardData, QuizData } from '../types';
import { jsPDF } from 'jspdf';

interface Props {
  itemId: string;
  infographics: InfographicData[];
  presentations: PresentationData[];
  flashcards: FlashcardData[];
  quizzes: QuizData[];
  onClose: () => void;
}

export const ProjectModal: React.FC<Props> = ({ 
  itemId, infographics, presentations, flashcards, quizzes, onClose 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const poster = infographics.find(i => i.id === itemId);
  const presentation = presentations.find(p => p.id === itemId);
  const flashcardSet = flashcards.find(f => f.id === itemId);
  const quiz = quizzes.find(q => q.id === itemId);

  if (!poster && !presentation && !flashcardSet && !quiz) return null;

  const title = poster?.title || presentation?.title || flashcardSet?.title || quiz?.title || 'Asset';

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (poster) {
        // Infografika rasmini yuklab olish
        const link = document.createElement('a');
        link.download = `BilimGrafik-${poster.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = poster.imageUrl;
        link.click();
      } else if (presentation) {
        // Prezentatsiyani PDF formatida yuklab olish (modal headeridan default)
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1280, 720]
        });

        for (let i = 0; i < presentation.slides.length; i++) {
          const slide = presentation.slides[i];
          if (i > 0) pdf.addPage([1280, 720], 'landscape');
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, 1280, 720, 'F');
          if (slide.imageUrl) {
            pdf.addImage(slide.imageUrl, 'PNG', 0, 0, 1280, 720);
          }
        }
        pdf.save(`${presentation.title.replace(/\s+/g, '-')}.pdf`);
      } else if (flashcardSet || quiz) {
        // Matnli assetlar uchun PDF konspekt
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(title, 20, 20);
        doc.setFontSize(12);
        let y = 40;
        
        if (flashcardSet) {
          flashcardSet.cards.forEach((c, idx) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`${idx + 1}. Savol: ${c.front}`, 20, y);
            y += 10;
            doc.text(`   Javob: ${c.back}`, 20, y);
            y += 15;
          });
        } else if (quiz) {
          quiz.questions.forEach((q, idx) => {
            if (y > 250) { doc.addPage(); y = 20; }
            doc.text(`${idx + 1}. ${q.question}`, 20, y);
            y += 10;
            q.options.forEach((opt, oIdx) => {
              doc.text(`   ${String.fromCharCode(97 + oIdx)}) ${opt}`, 20, y);
              y += 7;
            });
            doc.text(`   To'g'ri javob: ${q.options[q.correctAnswer]}`, 20, y);
            y += 15;
          });
        }
        doc.save(`${title.replace(/\s+/g, '-')}.pdf`);
      }
    } catch (error) {
      console.error("Yuklab olishda xato:", error);
      alert("Faylni yuklab olishda xatolik yuz berdi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full h-full max-w-[95vw] max-h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200/50">
        
        <header className="h-20 shrink-0 border-b border-slate-100 bg-white flex items-center justify-between px-8">
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate tracking-tight">{title}</h2>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {poster ? 'Infografika' : presentation ? 'Slaydlar' : flashcardSet ? 'Kartochkalar' : 'Test'} Asset
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><Share2 size={18}/></button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18}/>}
              </button>
              <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><MoreHorizontal size={18}/></button>
              <button onClick={onClose} className="ml-2 p-2.5 bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl transition-all"><X size={18} /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative bg-slate-50/30">
          <div className="h-full w-full overflow-y-auto custom-scrollbar">
            {poster && <InfographicStudio infographics={[poster]} selectedId={poster.id} hideHeader={true} />}
            {presentation && <PresentationStudio presentations={[presentation]} selectedId={presentation.id} hideHeader={true} />}
            {flashcardSet && <FlashcardStudio data={flashcardSet} />}
            {quiz && <QuizStudio data={quiz} />}
          </div>
        </div>

        <footer className="h-12 shrink-0 border-t border-slate-50 bg-white flex items-center justify-between px-10">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-pointer">
                 <ThumbsUp size={12} /> <span>Foydali</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-pointer">
                 <ThumbsDown size={12} /> <span>Sifatsiz</span>
              </div>
           </div>
           <div className="text-[8px] font-bold text-slate-400 italic">BilimGrafik Workspace</div>
        </footer>
      </div>
    </div>
  );
};
