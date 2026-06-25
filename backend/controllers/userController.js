import User from '../models/User.js';
import cache from '../utils/cache.js';

export const toggleSaveSalon = async (req, res) => {
  try {
    const { userId, salonId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.savedSalons.indexOf(salonId);
    if (index > -1) {
      user.savedSalons.splice(index, 1); // remove
    } else {
      user.savedSalons.push(salonId); // add
    }
    await user.save();
    
    // Invalidate the cache for this user's saved salons so it updates immediately
    cache.del(`saved_salons_${userId}`);
    
    res.json({ savedSalons: user.savedSalons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedSalons = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if we have this user's saved salons cached
    const cacheKey = `saved_salons_${userId}`;
    const cachedSalons = cache.get(cacheKey);
    if (cachedSalons) {
      return res.json(cachedSalons);
    }

    const user = await User.findById(userId).populate('savedSalons').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Save to cache for 5 minutes
    cache.set(cacheKey, user.savedSalons);
    res.json(user.savedSalons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Auth Controllers
export const signup = async (req, res) => {
  try {
    const { name, email, phone, city, password } = req.body;
    
    // Explicitly check if email is already in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered. Please login.' });
    }

    const newUser = new User({ name, email, phone, city, passwordHash: password, role: 'customer' }); 
    await newUser.save();
    res.status(201).json({ user: { id: newUser._id, name, email, phone, city, role: newUser.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const ownerSignup = async (req, res) => {
  try {
    const { name, email, phone, city, password } = req.body;

    // Explicitly check if email is already in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered. Please login.' });
    }

    const newUser = new User({ name, email, phone, city, passwordHash: password, role: 'owner' }); 
    await newUser.save();
    res.status(201).json({ user: { id: newUser._id, name, email, phone, city, role: newUser.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { loginInput, email, password } = req.body;
    const identifier = loginInput || email;
    
    if (!identifier) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Account not found. Please sign up first.' });
    }

    if (user.passwordHash !== password) {
      return res.status(401).json({ message: 'Invalid credentials. Please check your password.' });
    }

    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        city: user.city,
        role: user.role,
        ownedSalonId: user.ownedSalonId || null
      }, 
      token: 'mock-token' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
