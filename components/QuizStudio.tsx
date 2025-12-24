
import React, { useState } from 'react';
import { QuizData } from '../types';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, Lightbulb } from 'lucide-react';

export const QuizStudio: React.FC<{ data: QuizData }> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const question = data.questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === question.correctAnswer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizComplete(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (quizComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-8 border border-indigo-100">
          <Award size={48} className="text-indigo-600" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Quiz Yakunlandi!</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">Sizning natijangiz:</p>
        <div className="text-6xl font-black text-indigo-600 mb-12">
          {score} / {data.questions.length}
        </div>
        <button 
          onClick={restart}
          className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
        >
          <RotateCcw size={18} /> Qaytadan Urinish
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 lg:p-20 bg-white overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full">
        {/* Question */}
        <h3 className="text-2xl font-bold text-slate-900 mb-16 leading-tight text-center lg:text-left">
          {question.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4 mb-10">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.correctAnswer;
            const isSelected = idx === selectedOption;
            
            let btnClass = "bg-white border-slate-100 hover:border-slate-200";
            let icon = null;

            if (isAnswered) {
              if (isCorrect) {
                btnClass = "bg-emerald-50 border-emerald-500 text-slate-900";
                icon = <CheckCircle2 size={20} className="text-emerald-500" />;
              } else if (isSelected) {
                btnClass = "bg-rose-50 border-rose-500 text-slate-900";
                icon = <XCircle size={20} className="text-rose-500" />;
              } else {
                btnClass = "bg-white border-slate-50 opacity-40";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left font-bold text-base ${btnClass}`}
              >
                <span>{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation Card */}
        {isAnswered && (
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-8 duration-500">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${selectedOption === question.correctAnswer ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  <Lightbulb size={18} />
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedOption === question.correctAnswer ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {selectedOption === question.correctAnswer ? 'TO\'G\'RI JAVOB' : 'XATO JAVOB'}
                </h4>
              </div>
              
              <div className="space-y-4">
                 <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                   {question.explanation}
                 </p>
                 <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
                       💡 O'quv maslahati: Savolga berilgan izohni diqqat bilan o'rganish sizga keyingi testlarda yordam beradi.
                    </p>
                 </div>
              </div>
            </div>
            
            <button 
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100"
            >
              {currentIndex === data.questions.length - 1 ? 'Testni Yakunlash' : 'Keyingi Savolga O\'tish'} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Progress Display */}
        {!isAnswered && (
          <div className="mt-12 flex flex-col items-center">
             <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-slate-300 transition-all duration-500" 
                  style={{ width: `${((currentIndex + 1) / data.questions.length) * 100}%` }}
                />
             </div>
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                SAVOL {currentIndex + 1} / {data.questions.length}
             </span>
          </div>
        )}
      </div>
    </div>
  );
};
