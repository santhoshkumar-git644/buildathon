import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'missing_key' });
} catch (e) {
  console.warn('Google Gen AI SDK initialization failed:', e.message);
}

const MODEL = 'gemini-2.5-flash';

export const generateText = async (prompt, imageBase64 = null) => {
  if (!ai) return 'AI Service unavailable.';
  try {
    const contents = [prompt];
    
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
      const mimeType = imageBase64.split(';')[0].split(':')[1];
      contents.push({
        inlineData: { data: base64Data, mimeType }
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: contents,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Sorry, I am having trouble connecting to my AI brain right now.';
  }
};

export const summarizeReviews = async (reviews) => {
  const reviewsText = reviews.map(r => `${r.rating} stars: ${r.comment}`).join('\n');
  const prompt = `Summarize the following customer reviews for a salon into a concise 2-sentence highlight:\n\n${reviewsText}`;
  return await generateText(prompt);
};
