import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
  try {
    const models = await ai.models.list();
    // In @google/genai, this might be paginated or an array
    for await (const m of models) {
      console.log(m.name);
    }
  } catch (error) {
    console.error("Error:", error.message || error);
  }
}
list();
