export const getSalonCoordinates = (salon) => {
  let centerLat = 19.0760;
  let centerLon = 72.8777;
  const city = (salon.city || '').toLowerCase();
  
  if (city.includes('delhi')) { centerLat = 28.7041; centerLon = 77.1025; }
  else if (city.includes('bengaluru') || city.includes('bangalore')) { centerLat = 12.9716; centerLon = 77.5946; }
  else if (city.includes('kolkata')) { centerLat = 22.5726; centerLon = 88.3639; }
  else if (city.includes('chennai')) { centerLat = 13.0827; centerLon = 80.2707; }
  else if (city.includes('hyderabad')) { centerLat = 17.3850; centerLon = 78.4867; }
  else if (city.includes('pune')) { centerLat = 18.5204; centerLon = 73.8567; }

  const hash = (salon.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) - 50) / 1000;
  const lonOffset = (((hash * 17) % 100) - 50) / 1000;

  return { lat: centerLat + latOffset, lon: centerLon + lonOffset };
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Distance in km
};
