import Review from '../models/Review.js';
import Salon from '../models/Salon.js';

export const createReview = async (req, res) => {
  try {
    const { salonId, author, rating, comment } = req.body;
    const review = new Review({ salonId, author, rating, comment });
    await review.save();
    
    // Also push to Salon's review array
    const salon = await Salon.findById(salonId);
    if (salon) {
      salon.reviews.unshift({ author, rating, comment, date: new Date() });
      salon.reviewCount += 1;
      // Update average rating roughly
      salon.rating = ((salon.rating * (salon.reviewCount - 1)) + rating) / salon.reviewCount;
      await salon.save();
    }
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSalonReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ salonId: req.params.salonId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
