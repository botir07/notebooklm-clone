
import { GoogleGenAI, Type } from "@google/genai";
import { 
  InfographicData, SourceAnalysis, PresentationData, Slide, 
  FlashcardData, QuizData, InfographicSettings, 
  PresentationSettings, FlashcardSettings, QuizSettings 
} from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let delay = 2000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit && i < maxRetries - 1) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; 
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries reached");
}

const generateSlideImage = async (title: string, content: string[], style: string = 'minimalist'): Promise<string> => {
  return withRetry(async () => {
    const ai = getAI();
    const contentText = content.join(", ");
    const masterPrompt = `Professional educational slide about "${title}". ${contentText}. Style: ${style}, clean educational style, 16:9, vibrant colors, clear hierarchy.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: masterPrompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } },
    });

    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return base64Image;
  });
};

export const analyzeSource = async (source: { data: string, mimeType: string }): Promise<SourceAnalysis> => {
  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: source },
          { text: `Hujjatni tahlil qiling. 
          JSON Format: { "title": "Mavzu nomi", "visualPrompt": "English image prompt", "summary": "5 points", "keyConcepts": [{"term": "x", "definition": "y"}] }` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ["term", "definition"]
              }
            }
          },
          required: ["title", "visualPrompt", "summary", "keyConcepts"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as SourceAnalysis;
  });
};

export const automatePdfToPoster = async (source: { 
  file: { data: string, mimeType: string },
  preAnalysis?: SourceAnalysis,
  settings?: InfographicSettings
}): Promise<InfographicData> => {
  const meta = source.preAnalysis || await analyzeSource(source.file);
  const settings = source.settings;
  
  return withRetry(async () => {
    const ai = getAI();
    let aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "3:4";
    if (settings?.orientation === 'horizontal') aspectRatio = "4:3";
    if (settings?.orientation === 'square') aspectRatio = "1:1";

    const detailInstruction = settings?.detailLevel === 'high' ? "Highly detailed." : "Simple.";
    const userDescription = settings?.description ? `Custom: ${settings.description}.` : "";
    const lang = settings?.language === 'en' ? 'English' : settings?.language === 'ru' ? 'Russian' : 'Uzbek Latin';

    const masterPrompt = `Infographic: "${meta.title}". Text in ${lang}. Style: ${meta.visualPrompt}. ${detailInstruction} ${userDescription}`;

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: masterPrompt }] },
      config: { imageConfig: { aspectRatio } },
    });

    let base64Image = "";
    if (imageResponse.candidates?.[0]?.content?.parts) {
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      title: meta.title,
      imageUrl: base64Image,
      summary: meta.summary,
      keyConcepts: meta.keyConcepts,
      promptUsed: masterPrompt,
      createdAt: Date.now()
    };
  });
};

export const generateFlashcards = async (source: { data: string, mimeType: string }, settings?: FlashcardSettings): Promise<FlashcardData> => {
  return withRetry(async () => {
    const ai = getAI();
    const lang = settings?.language === 'en' ? 'English' : settings?.language === 'ru' ? 'Russian' : 'Uzbek Latin';
    const count = settings?.cardCount || 10;
    const difficulty = settings?.difficulty || 'medium';
    const userDesc = settings?.description ? `Custom instructions: ${settings.description}.` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: source },
          { text: `Create ${count} flashcards in ${lang} with ${difficulty} difficulty. ${userDesc}` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["id", "front", "back"]
              }
            }
          },
          required: ["title", "cards"]
        }
      }
    });
    const data = JSON.parse(response.text || '{}');
    return { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
  });
};

export const generateQuiz = async (source: { data: string, mimeType: string }, settings?: QuizSettings): Promise<QuizData> => {
  return withRetry(async () => {
    const ai = getAI();
    const lang = settings?.language === 'en' ? 'English' : settings?.language === 'ru' ? 'Russian' : 'Uzbek Latin';
    const count = settings?.questionCount || 5;
    const difficulty = settings?.difficulty || 'medium';
    const userDesc = settings?.description ? `Custom instructions: ${settings.description}.` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: source },
          { text: `Create ${count} quiz questions in ${lang} with ${difficulty} difficulty. Explain correct/incorrect answers in the "explanation" field. ${userDesc}` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });
    const data = JSON.parse(response.text || '{}');
    return { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
  });
};

export const generatePresentation = async (source: { data: string, mimeType: string }, settings?: PresentationSettings): Promise<PresentationData> => {
  return withRetry(async () => {
    const ai = getAI();
    const lang = settings?.language === 'en' ? 'English' : settings?.language === 'ru' ? 'Russian' : 'Uzbek Latin';
    const count = settings?.slideCount || 8;
    const style = settings?.style || 'minimalist';
    const userDesc = settings?.description ? `Custom theme/instructions: ${settings.description}.` : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: source },
          { text: `Convert this material into a ${count}-slide presentation in ${lang}. Style: ${style}. ${userDesc}` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            topicOverview: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  detailedExplanation: { type: Type.STRING },
                  didacticMethod: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  speakerNotes: { type: Type.STRING }
                },
                required: ["title", "content", "detailedExplanation", "didacticMethod", "visualPrompt", "speakerNotes"]
              }
            }
          },
          required: ["title", "topicOverview", "slides"]
        }
      }
    });
    const rawData = JSON.parse(response.text || '{}');
    const slidesWithImages: Slide[] = await Promise.all(
      (rawData.slides || []).map(async (slide: any) => {
        try {
          const img = await generateSlideImage(slide.title, slide.content, style);
          return { ...slide, imageUrl: img };
        } catch (e) { return slide; }
      })
    );
    return { id: Math.random().toString(36).substr(2, 9), title: rawData.title, topicOverview: rawData.topicOverview, slides: slidesWithImages, createdAt: Date.now() };
  });
};

export const querySources = async (prompt: string, sources: any[]) => {
  return withRetry(async () => {
    const ai = getAI();
    const parts = sources.map(s => s.type === 'pdf' ? { inlineData: { data: s.data, mimeType: 'application/pdf' } } : { text: s.data });
    parts.push({ text: prompt });
    const res = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: { parts },
      config: { systemInstruction: "Answer ONLY based on the source material." }
    });
    return res.text;
  });
};

export const editImage = async (base64Image: string, prompt: string) => {
  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } }, { text: prompt }] }
    });
    
    let editedImageBase64 = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          editedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return editedImageBase64;
  });
};

export const generateInfographic = async (params: { 
  text?: string, 
  file?: { data: string, mimeType: string },
  customSystemPrompt?: string
}) => {
  return withRetry(async () => {
    const ai = getAI();
    const parts: any[] = [];
    if (params.file) parts.push({ inlineData: params.file });
    if (params.text) parts.push({ text: params.text });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [...parts, { text: "Ushbu ma'lumotlar asosida strukturalangan infografika tayyorlang." }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } },
                  icon: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["title", "content", "icon"]
              }
            },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["step", "description"]
              }
            }
          },
          required: ["title", "sections", "highlights"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  });
};
