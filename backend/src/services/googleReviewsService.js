/**
 * Google Reviews Service
 * Fetches reviews from Google Places API for Strive Academics
 */

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUSINESS_NAME = 'Strive Academics Australia';

/**
 * Find Place ID using Text Search
 */
async function findPlaceId() {
  const searchQuery = encodeURIComponent(BUSINESS_NAME);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchQuery}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
    return data.candidates[0].place_id;
  }
  
  throw new Error(`Unable to find place ID for ${BUSINESS_NAME}. Status: ${data.status}`);
}

/**
 * Fetch reviews for a given Place ID
 * @param {string} placeId - The Google Place ID
 * @param {number} limit - Maximum number of reviews to return (default: 5)
 */
async function fetchReviews(placeId, limit = 5) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total,name&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Failed to fetch place details. Status: ${data.status}`);
  }
  
  const result = data.result;
  const reviews = (result.reviews || []).slice(0, limit).map(review => ({
    name: review.author_name,
    text: review.text,
    rating: review.rating,
    date: review.relative_time_description,
    profilePhoto: review.profile_photo_url,
    time: review.time // Unix timestamp
  }));
  
  return {
    businessName: result.name,
    overallRating: result.rating,
    totalReviews: result.user_ratings_total,
    reviews
  };
}

/**
 * Get Google reviews for Strive Academics
 * @param {number} limit - Maximum number of reviews to return
 */
async function getStriveAcademicsReviews(limit = 5) {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY environment variable is not set');
  }
  
  const placeId = await findPlaceId();
  return fetchReviews(placeId, limit);
}

module.exports = {
  getStriveAcademicsReviews,
  findPlaceId,
  fetchReviews
};
