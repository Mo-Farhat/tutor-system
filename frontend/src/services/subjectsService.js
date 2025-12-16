/**
 * Subjects Service - Public API for fetching subject data
 */

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`;

/**
 * Fetch all active subjects grouped by yearLevel and curriculum
 * @returns {Promise<Object>} - { success, data: { grouped, flat } }
 */
export async function getPublicSubjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch subjects");
    }

    return data;
  } catch (error) {
    console.error("getPublicSubjects error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch subjects metadata (curricula and year levels)
 * @returns {Promise<Object>}
 */
export async function getSubjectsMetadata() {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/metadata`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch metadata");
    }

    return data;
  } catch (error) {
    console.error("getSubjectsMetadata error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch subjects for a specific curriculum and year level
 * @param {string} curriculum - e.g., "VCE", "HSC"
 * @param {string} yearLevel - e.g., "Year 11/12", "Year 1-10"
 * @returns {Promise<Object>}
 */
export async function getSubjectsForCurriculum(curriculum, yearLevel) {
  try {
    const params = new URLSearchParams({ curriculum, yearLevel });
    const response = await fetch(`${API_BASE_URL}/subjects/filter?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch subjects");
    }

    return data;
  } catch (error) {
    console.error("getSubjectsForCurriculum error:", error);
    return { success: false, error: error.message };
  }
}

export default {
  getPublicSubjects,
  getSubjectsMetadata,
  getSubjectsForCurriculum,
};
