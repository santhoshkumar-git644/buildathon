import crypto from 'crypto';
import User from '../models/User.js';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const signup = async (req, res) => {
  try {
    const { name, email, phone, city, password } = req.body;

    // Validation
    if (!name || !city || !password) {
      return res.status(400).json({ message: 'Name, City, and Password are required.' });
    }

    if (!email && !phone) {
      return res.status(400).json({ message: 'Provide either Email or Phone Number.' });
    }

    if (email && phone) {
      return res.status(400).json({ message: 'Provide either Email or Phone Number, not both.' });
    }

    // Check if user already exists
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }
    }

    if (phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this phone number already exists.' });
      }
    }

    const passwordHash = hashPassword(password);
    const user = new User({
      name,
      email: email || '',
      phone: phone || '',
      city,
      passwordHash
    });

    const savedUser = await user.save();
    
    // Return user details with a simulated token
    res.status(201).json({
      token: `simulated-jwt-${savedUser._id}`,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        city: savedUser.city
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { loginInput, password } = req.body;

    if (!loginInput || !password) {
      return res.status(400).json({ message: 'Login input (email/phone) and password are required.' });
    }

    // Find user by either email or phone
    const user = await User.findOne({
      $or: [
        { email: loginInput },
        { phone: loginInput }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    res.json({
      token: `simulated-jwt-${user._id}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
