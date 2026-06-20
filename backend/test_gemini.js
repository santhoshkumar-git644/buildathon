import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const MODEL = 'gemini-2.5-flash';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: ['Hello'],
    });
    console.log("Success:", response.text);
  } catch (error) {
    console.error("Error:", error.message || error);
  }
}
test();
