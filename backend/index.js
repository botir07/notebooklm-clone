import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5000;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5", // Barqaror pullik model
                "messages": [
                    { "role": "system", "content": "Siz ta'limga oid ma'lumotlarni qayta ishlovchi professonalsiz." },
                    ...(history || []).map(msg => ({
                        role: msg.role === 'ai' ? 'assistant' : 'user',
                        content: String(msg.text || msg.content)
                    })),
                    { "role": "user", "content": String(message) }
                ]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        res.json({ response: data.choices[0].message.content });
    } catch (error) {
        console.error("❌ Xato:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT} da tayyor`));