import Salon from '../models/Salon.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { generateText, summarizeReviews } from '../services/geminiService.js';
import cache from '../utils/cache.js';

const getSalonCoordinates = (salon) => {
  // Determine center coordinate based on city
  let centerLat = 19.0760;
  let centerLon = 72.8777;
  const city = (salon.city || '').toLowerCase();
  if (city.includes('delhi')) { centerLat = 28.7041; centerLon = 77.1025; }
  else if (city.includes('bengaluru') || city.includes('bangalore')) { centerLat = 12.9716; centerLon = 77.5946; }
  else if (city.includes('kolkata')) { centerLat = 22.5726; centerLon = 88.3639; }
  else if (city.includes('chennai')) { centerLat = 13.0827; centerLon = 80.2707; }
  else if (city.includes('hyderabad')) { centerLat = 17.3850; centerLon = 78.4867; }
  else if (city.includes('pune')) { centerLat = 18.5204; centerLon = 73.8567; }

  // Generate deterministic offset based on salon name length and characters
  const hash = (salon.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) - 50) / 1000; // range: [-0.05, 0.05]
  const lonOffset = (((hash * 17) % 100) - 50) / 1000; // range: [-0.05, 0.05]

  return {
    lat: centerLat + latOffset,
    lon: centerLon + lonOffset
  };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // in km
};

export const chatWithAI = async (req, res) => {
  try {
    const { query, imageBase64, userCity, latitude, longitude } = req.body;
    
    // Check cache for identical text queries (bypass cache for image queries or location queries to get dynamic recommendations)
    const hasLocation = latitude && longitude;
    const cacheKey = !imageBase64 && !hasLocation && query ? `ai_chat_${userCity || 'all'}_${query.toLowerCase().trim()}` : null;
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
    
    let filterSalons = userCity ? salons.filter(s => s.city.toLowerCase() === userCity.toLowerCase()) : salons;
    
    // If coordinates are provided, compute distance for each salon and sort by distance
    let locationContext = '';
    if (hasLocation) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      locationContext = `User Current Coordinates: Lat ${userLat}, Lon ${userLon}.\n`;
      
      filterSalons = filterSalons.map(s => {
        const coords = getSalonCoordinates(s);
        const dist = calculateDistance(userLat, userLon, coords.lat, coords.lon);
        return {
          ...s,
          computedDistance: dist
        };
      });
      
      // Sort by computed distance
      filterSalons.sort((a, b) => a.computedDistance - b.computedDistance);
    } else {
      filterSalons = filterSalons.map(s => ({
        ...s,
        computedDistance: s.distance || 2.5
      }));
    }

    // Map to a summary projection in-memory for the AI context
    const contextData = filterSalons.map(s => ({ 
      name: s.name, 
      city: s.city, 
      area: s.area, 
      services: s.services.map(srv => ({ name: srv.name, price: srv.price })),
      _id: s._id || s.id,
      distance: `${s.computedDistance} km`
    }));
    
    const context = JSON.stringify(contextData);

    const prompt = `You are ShearCity's AI Assistant. Your job is to answer user queries about salon styles, match them with salons, and provide price estimations.
    
${locationContext}Here is our database of salons in the user's city/area with their services, prices, and distances:
${context}

User Query: "${query || 'What hairstyle is in the attached image, and where can I get it?'}"

Instructions:
1. Respond concisely and professionally.
2. If the user asks for salons near them, closest salons, or mentions location, check the distances provided in the database context and recommend the closest options. Explicitly state the distance (e.g. "Salon X is closest, just 1.5 km away").
3. If the user attaches a photo, analyze the style/haircut and recommend the best matching services from the database.
4. If you successfully recommend a specific salon from the database, you MUST output the exact tag [BOOK_SALON: <salon_id>] at the end of your response, replacing <salon_id> with the actual _id/id of the recommended salon. Do not include brackets around the ID itself inside the tag.`;

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
