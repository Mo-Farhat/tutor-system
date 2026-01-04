const express = require('express');
const router = express.Router();
const { getStriveAcademicsReviews } = require('../services/googleReviewsService');

/**
 * GET /api/reviews/google
 * Fetch Google reviews for Strive Academics
 * Query params:
 *   - limit: Maximum number of reviews to return (default: 5)
 */
router.get('/google', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const reviewsData = await getStriveAcademicsReviews(limit);
    
    res.json({
      success: true,
      data: reviewsData
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
