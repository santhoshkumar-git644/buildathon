import Salon from '../models/Salon.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { generateText, summarizeReviews } from '../services/geminiService.js';
import cache from '../utils/cache.js';

export const chatWithAI = async (req, res) => {
  try {
    const { query, imageBase64, userCity } = req.body;
    
    // Check cache for identical text queries
    const cacheKey = !imageBase64 && query ? `ai_chat_${userCity || 'all'}_${query.toLowerCase().trim()}` : null;
    if (cacheKey) {
      const cachedReply = cache.get(cacheKey);
      if (cachedReply) return res.json({ reply: cachedReply });
    }
    
    // Fetch salons, filter by userCity if provided
    let salons = cache.get('all_salons');
    if (!salons) {
      salons = await Salon.find({}).lean();
      cache.set('all_salons', salons);
    }
    const filterSalons = userCity ? salons.filter(s => s.city === userCity) : salons;
    // Map to a summary projection in-memory for the AI context
    const contextData = filterSalons.map(s => ({ name: s.name, city: s.city, area: s.area, services: s.services, _id: s._id }));
    const context = JSON.stringify(contextData);

    const prompt = `You are ShearCity's AI Assistant. Your job is to answer user queries about salon styles, match them with salons, and provide price estimations.
    
Here is our database of salons and their services with prices in the user's area:
${context}

User Query: "${query || 'What hairstyle is in the attached image, and where can I get it?'}"

Respond concisely. If you successfully recommend a specific salon from the database, you MUST output the exact tag [BOOK_SALON: <salon_id>] at the end of your response, replacing <salon_id> with the actual _id of the recommended salon. Do not include brackets around the ID itself inside the tag.`;

    const aiResponse = await generateText(prompt, imageBase64);
    
    if (cacheKey) cache.set(cacheKey, aiResponse, 600); // Cache AI responses for 10 minutes

    res.json({ reply: aiResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalonSummary = async (req, res) => {
  try {
    const { salonId } = req.params;
    const salon = await Salon.findById(salonId).lean();
    if (!salon) return res.status(404).json({ message: 'Salon not found' });
    
    const summary = await summarizeReviews(salon.reviews || []);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPersonalizedFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const { city } = req.query;
    const user = await User.findById(userId).lean();
    
    // Fetch all salons for manual sorting logic
    let allSalons = cache.get('all_salons');
    if (!allSalons) {
      allSalons = await Salon.find({}).lean();
      cache.set('all_salons', allSalons);
    } else {
      // Deep clone cached array so matchScore mutations don't affect cache
      allSalons = JSON.parse(JSON.stringify(allSalons));
    }
    
    let rebookingSuggestion = null;

    if (user) {
      // Find past bookings to see if rebooking is due
      const pastBooking = await Booking.findOne({ userId: user._id, status: 'past' }).sort({ date: -1 }).lean();
      
      if (pastBooking) {
        const bookingDate = new Date(pastBooking.date);
        const daysSince = Math.floor((new Date() - bookingDate) / (1000 * 60 * 60 * 24));
        
        if (daysSince > 21) {
          rebookingSuggestion = `It's been ${daysSince} days since your last ${pastBooking.services[0]} at ${pastBooking.salonName}. Time for a refresh?`;
        }
      }

      // Personalized ranking logic based on user preferences vs salon tags/services
      const prefStr = user.preferences?.preferredStyles?.join(' ') + ' ' + user.preferences?.favoriteCategories?.join(' ');
      
      allSalons.forEach(salon => {
        salon.matchScore = 0;
        const salonInfo = salon.tags.join(' ') + ' ' + salon.services.map(s=>s.name).join(' ');
        
        if (user.preferences?.preferredStyles?.some(style => salonInfo.includes(style))) {
           salon.matchScore += 10;
        }
        if (user.city === salon.city) salon.matchScore += 5;
        
        // Filter out if minimum service price is over budget
        const minPrice = Math.min(...salon.services.map(s => s.price));
        if (user.preferences?.budget && minPrice > user.preferences.budget) {
           salon.matchScore -= 20; // Penalize for being out of budget
        }
      });
      
      allSalons.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    if (city) {
      allSalons = allSalons.filter(s => s.city.toLowerCase() === city.toLowerCase());
    }
    
    res.json({
      feed: allSalons.slice(0, 10), // Return top 10 matched
      rebookingSuggestion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
