import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { api } from './server/api';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use('/api', api);

// Gemini AI assistant route for restaurant insights
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { prompt, contextData } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        reply: "Simulación de Asistente IA (Para respuestas en vivo con Gemini, configure GEMINI_API_KEY en el panel de Secretos):\n\nBasado en tus datos actuales: Tienes un ticket promedio saludable de $105,000. Tus productos más rentables son el 'Mojito Cubano' y la 'Hamburguesa Angus Trufada'. Te recomiendo promocionar la Cerveza IPA en combo con Nachos durante las horas de menor afluencia (4 PM - 7 PM)."
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `Eres un consultor experto en gestión de bares y restaurantes (ERP POS System). 
Proporciona análisis breves, ejecutivos y altamente estratégicos sobre ventas, optimización de menú, control de inventario y fidelización.`;

    const fullPrompt = `${systemInstruction}\n\nDatos actuales del restaurante:\n${JSON.stringify(contextData, null, 2)}\n\nPregunta o instrucción del usuario: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    return res.status(500).json({ error: error.message || 'Error processing AI request' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERP POS Server running on http://localhost:${PORT}`);
  });
}

startServer();
