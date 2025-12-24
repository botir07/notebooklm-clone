const OPENROUTER_API_KEY = "SIZNING_OPENROUTER_KEYINGIZ"; // Kalitni shu yerga qo'ying

export const callAI = async (prompt: string) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", 
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free", 
        "messages": [{ "role": "user", "content": prompt }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("AI Error:", error.message);
    throw error;
  }
};

// ChatWorkspace so'rayotgan export funksiyasi
export const automatePdfToPoster = async (sourceData: string) => {
  return await callAI(`Ushbu ma'lumotdan poster uchun chiroyli tekst tayyorla: ${sourceData}`);
};

export const analyzeSource = (text: string) => callAI(`Tahlil qil: ${text}`);
export const generatePresentation = (source: any) => callAI(`Slayd mazmuni yarat: ${source.data}`);
export const generateFlashcards = (source: any) => callAI(`10 ta kartochka yarat: ${source.data}`);
export const generateQuiz = (source: any) => callAI(`5 ta test yarat: ${source.data}`);