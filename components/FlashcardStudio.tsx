
import React, { useState } from 'react';
import { FlashcardData } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export const FlashcardStudio: React.FC<{ data: FlashcardData }> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = data.cards[currentIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/30">
      <div className="w-full max-w-lg">
        {/* Flip Card Container */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative h-96 w-full cursor-pointer perspective-1000 group"
        >
          <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center p-12 text-center">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Savol / Termin</span>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">{card.front}</h3>
              <p className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Kartani ag'daring</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-12 text-center text-white">
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-6">Javob / Ta'rif</span>
              <p className="text-xl font-medium leading-relaxed">{card.back}</p>
              <RotateCcw className="mt-12 opacity-50" size={20} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center justify-between px-4">
          <button 
            disabled={currentIndex === 0}
            onClick={() => { setCurrentIndex(i => i - 1); setIsFlipped(false); }}
            className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-20"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {currentIndex + 1} / {data.cards.length}
            </p>
          </div>

          <button 
            disabled={currentIndex === data.cards.length - 1}
            onClick={() => { setCurrentIndex(i => i + 1); setIsFlipped(false); }}
            className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-20"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
