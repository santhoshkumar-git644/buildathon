import { getRecommendations } from '../services/recommendationService.js';

export const recommendSalons = async (req, res) => {
  try {
    const { preferences } = req.body;
    const recommendations = await getRecommendations(preferences);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
