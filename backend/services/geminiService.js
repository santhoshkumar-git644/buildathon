import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let ai;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'missing_key' && apiKey.trim() !== '') {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn('GEMINI_API_KEY environment variable is empty or missing. AI will run in offline fallback mode.');
  }
} catch (e) {
  console.warn('Google Gen AI SDK initialization failed:', e.message);
}

const MODEL = 'gemini-2.5-flash';

const generateMockResponse = (prompt, imageBase64) => {
  // Check if it is a review summary prompt
  if (prompt.includes('Summarize the following customer reviews')) {
    return 'Customers love this salon for its clean environment, professional staff, and excellent haircutting services. Highly recommended!';
  }

  // Parse user query from the prompt
  let userQuery = '';
  const queryMatch = prompt.match(/User Query:\s*"([^"]+)"/);
  if (queryMatch) {
    userQuery = queryMatch[1];
  } else {
    userQuery = prompt;
  }

  const queryLower = userQuery.toLowerCase();
  
  // Try to parse the salon database from prompt
  let salons = [];
  const dbMatch = prompt.match(/database of salons in the user's city\/area[\s\S]*?:\n([\s\S]+?)\n\nUser Query:/);
  if (dbMatch) {
    try {
      salons = JSON.parse(dbMatch[1].trim());
    } catch (e) {
      console.warn('Could not parse salons from prompt for mock response', e);
    }
  }

  let reply = '';
  
  if (queryLower.includes('near') || queryLower.includes('close') || queryLower.includes('location') || queryLower.includes('map') || queryLower.includes('address') || queryLower.includes('dist')) {
    if (salons && salons.length > 0) {
      const closest = salons[0];
      const second = salons[1];
      reply = `Based on your location coordinates, the closest salon is ${closest.name} (${closest.distance || '1.2 km'} away in ${closest.area || 'your area'}). `;
      if (second) {
        reply += `Another nearby option is ${second.name} (${second.distance || '2.4 km'} away). `;
      }
      reply += `You can book an appointment at any of these spots directly.`;
      
      // Append book salon tag
      reply += `\n\n[BOOK_SALON: ${closest._id || closest.id}]`;
    } else {
      reply = `Based on your location coordinates, there are some great salons in your city. Please select a city from the navigation bar to see the closest options.`;
    }
  } else if (imageBase64 || queryLower.includes('photo') || queryLower.includes('image') || queryLower.includes('look') || queryLower.includes('style')) {
    reply = 'That is a gorgeous style! In offline fallback mode, I cannot run deep visual analysis, but this clean layered cut and styling would look incredible on you. ';
    if (salons && salons.length > 0) {
      const matches = salons.filter(s => s.services.some(srv => srv.name.toLowerCase().includes('hair') || srv.name.toLowerCase().includes('cut')));
      const recommended = matches.length > 0 ? matches[0] : salons[0];
      const haircutService = recommended.services.find(s => s.name.toLowerCase().includes('hair') || s.name.toLowerCase().includes('cut'));
      const priceStr = haircutService ? `Rs ${haircutService.price}` : 'Rs 800 - Rs 1200';
      reply += `I recommend visiting ${recommended.name} in ${recommended.area || 'your area'} for this. Their haircut service is priced at ${priceStr}.`;
      reply += `\n\n[BOOK_SALON: ${recommended._id || recommended.id}]`;
    } else {
      reply += 'Usually, matching services like styling, wash, and blow dry cost around Rs 800 - Rs 1200.';
    }
  } else if (queryLower.includes('men') || queryLower.includes('guy') || queryLower.includes('boy')) {
    const menSalons = salons.filter(s => s.name.toLowerCase().includes('men') || s.services.some(srv => srv.name.toLowerCase().includes('men')));
    const recommended = menSalons.length > 0 ? menSalons[0] : (salons[0] || { name: 'Classic Cuts Lounge' });
    reply = `For Men's grooming, I highly recommend ${recommended.name}. They specialize in fades, beard grooming, and hair coloring treatments.`;
    if (recommended._id || recommended.id) {
      reply += `\n\n[BOOK_SALON: ${recommended._id || recommended.id}]`;
    }
  } else if (queryLower.includes('bridal') || queryLower.includes('wedding') || queryLower.includes('marry') || queryLower.includes('makeup')) {
    const bridalSalons = salons.filter(s => s.name.toLowerCase().includes('bridal') || s.services.some(srv => srv.name.toLowerCase().includes('bridal') || srv.name.toLowerCase().includes('makeup')));
    const recommended = bridalSalons.length > 0 ? bridalSalons[0] : (salons[0] || { name: 'Gold & Gloss Parlour' });
    reply = `For premium bridal makeup and wedding salon packages, ${recommended.name} offers excellent services and packages.`;
    if (recommended._id || recommended.id) {
      reply += `\n\n[BOOK_SALON: ${recommended._id || recommended.id}]`;
    }
  } else {
    // Default reply
    if (salons && salons.length > 0) {
      const first = salons[0];
      reply = `I would recommend checking out ${first.name} in ${first.area || 'your area'}. They offer high-quality services starting from Rs ${first.services[0]?.price || '500'}. Let me know if you would like pricing for specific services!`;
      reply += `\n\n[BOOK_SALON: ${first._id || first.id}]`;
    } else {
      reply = 'Welcome to ShearCity! I can help you find the best salons, compare prices, and recommend hairstyles. How can I help you today?';
    }
  }
  
  return reply + ' (Offline Fallback Mode)';
};

export const generateText = async (prompt, imageBase64 = null) => {
  if (!ai) {
    return generateMockResponse(prompt, imageBase64);
  }
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
    console.error('Gemini API Error, falling back to mock response:', error);
    return generateMockResponse(prompt, imageBase64);
  }
};

export const summarizeReviews = async (reviews) => {
  const reviewsText = reviews.map(r => `${r.rating} stars: ${r.comment}`).join('\n');
  const prompt = `Summarize the following customer reviews for a salon into a concise 2-sentence highlight:\n\n${reviewsText}`;
  return await generateText(prompt);
};
