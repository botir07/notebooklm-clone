
import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
// Added ImageIcon to imports
import { Loader2, Upload, Wand2, Download, Eraser, Sparkles, Filter, ImageIcon } from 'lucide-react';

export const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt.trim()) return;
    setLoading(true);
    try {
      const result = await editImage(originalImage, prompt);
      if (result) setResultImage(result);
    } catch (error) {
      console.error("Edit failed:", error);
      alert("Rasmni tahrirlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const presetPrompts = [
    { label: "Retro filtr qo'shish", text: "Add a retro aesthetic filter to this image" },
    { label: "Orqa fonni olib tashlash", text: "Remove the background and make it clean white" },
    { label: "Odamni o'chirish", text: "Remove the person in the background" },
    { label: "Kuzgi kayfiyat", text: "Make the lighting warm and add autumn leaves atmosphere" }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Editor Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Upload size={18} />
              Rasm yuklash
            </h4>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors group bg-slate-50"
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <ImageIcon className="text-slate-300 group-hover:text-indigo-500 mb-2" size={40} />
              <p className="text-slate-500 text-sm">PNG yoki JPG yuklang</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={18} />
              O'zgartirish buyrug'i
            </h4>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Masalan: 'Retro filtr qo'shish' yoki 'Fondagi odamlarni olib tashlash'..."
              className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 mb-4"
            />
            
            <div className="flex flex-wrap gap-2 mb-6">
              {presetPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.text)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-medium transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleEdit}
              disabled={loading || !originalImage || !prompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
              AI orqali o'zgartirish
            </button>
          </div>
        </div>

        {/* Display Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Natija</span>
              {resultImage && (
                <a 
                  href={resultImage} 
                  download="edited-image.png"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-bold"
                >
                  <Download size={16} />
                  Yuklab olish
                </a>
              )}
            </div>
            <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
              {loading ? (
                <div className="text-center">
                  <Loader2 className="animate-spin text-indigo-600 mx-auto mb-2" size={40} />
                  <p className="text-slate-500 font-medium">Tasvir tahrirlanmoqda...</p>
                </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Edited" className="w-full h-full object-contain" />
              ) : originalImage ? (
                <img src={originalImage} alt="Original" className="w-full h-full object-contain opacity-50" />
              ) : (
                <div className="text-slate-400 text-center p-8">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Tahrirlangan rasm shu yerda ko'rinadi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
