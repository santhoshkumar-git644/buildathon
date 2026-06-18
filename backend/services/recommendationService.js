import Salon from '../models/Salon.js';
import { generateText } from './geminiService.js';

export const getRecommendations = async (preferences) => {
  // Stub for recommendation logic
  // In reality, we would ask Gemini to filter or score salons based on preferences
  console.log('Generating recommendations for:', preferences);
  
  const allSalons = await Salon.find({}).limit(5);
  const aiInsights = await generateText(`Recommend salons based on ${JSON.stringify(preferences)}`);
  
  return {
    recommendations: allSalons,
    aiInsights
  };
};
