import Salon from '../models/Salon.js';

export const getAllSalons = async (req, res) => {
  try {
    const salons = await Salon.find({});
    res.json(salons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (salon) {
      res.json(salon);
    } else {
      res.status(404).json({ message: 'Salon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchSalons = async (req, res) => {
  try {
    // Basic search stub
    const salons = await Salon.find({});
    res.json(salons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
