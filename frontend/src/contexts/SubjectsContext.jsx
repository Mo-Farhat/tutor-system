/**
 * SubjectsContext - Global context for subject data
 * Provides subjects grouped by yearLevel/curriculum for use across the app
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPublicSubjects } from "../services/subjectsService";

// Create context
const SubjectsContext = createContext(null);

/**
 * SubjectsProvider - Wraps app to provide subject data
 */
export function SubjectsProvider({ children }) {
  const [subjects, setSubjects] = useState(null); // { data: grouped, flat: [] }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subjects on mount
  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getPublicSubjects();

      if (response.success) {
        setSubjects({
          grouped: response.data,
          flat: response.flat || [],
        });
      } else {
        setError(response.error || "Failed to load subjects");
      }
    } catch (err) {
      console.error("SubjectsProvider: Error fetching subjects:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  /**
   * Get subjects for a specific curriculum and year level
   * @param {string} curriculum 
   * @param {string} yearLevel 
   * @returns {Array<string>}
   */
  const getSubjectsFor = useCallback(
    (curriculum, yearLevel) => {
      if (!subjects?.grouped || !yearLevel || !curriculum) {
        return [];
      }

      const yearLevelData = subjects.grouped[yearLevel];
      if (!yearLevelData) {
        return [];
      }

      return yearLevelData[curriculum] || [];
    },
    [subjects]
  );

  /**
   * Get all curricula/states for a specific year level
   * @param {string} yearLevel 
   * @returns {Array<string>}
   */
  const getCurriculaFor = useCallback(
    (yearLevel) => {
      if (!subjects?.grouped || !yearLevel) {
        return [];
      }

      const yearLevelData = subjects.grouped[yearLevel];
      if (!yearLevelData) {
        return [];
      }

      return Object.keys(yearLevelData).sort();
    },
    [subjects]
  );

  /**
   * Get all available year levels
   * @returns {Array<string>}
   */
  const getYearLevels = useCallback(() => {
    if (!subjects?.grouped) {
      return [];
    }
    return Object.keys(subjects.grouped).sort();
  }, [subjects]);

  /**
   * Get Year 11/12 subjects organized by curriculum
   * @returns {Object} - { VCE: [...], HSC: [...], ... }
   */
  const getYear1112Subjects = useCallback(() => {
    if (!subjects?.grouped) {
      return {};
    }
    return subjects.grouped["Year 11/12"] || {};
  }, [subjects]);

  /**
   * Get Year 1-10 subjects organized by state
   * @returns {Object} - { VIC: [...], NSW: [...], ... }
   */
  const getYear110Subjects = useCallback(() => {
    if (!subjects?.grouped) {
      return {};
    }
    return subjects.grouped["Year 1-10"] || {};
  }, [subjects]);

  /**
   * Get all subjects as a flat array
   * @returns {Array<Object>} - [{ id, name, curriculum, yearLevel }, ...]
   */
  const getFlatSubjects = useCallback(() => {
    return subjects?.flat || [];
  }, [subjects]);

  /**
   * Refresh subjects (for after admin adds/edits subjects)
   */
  const refreshSubjects = useCallback(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const value = {
    // State
    subjects,
    isLoading,
    error,

    // Methods
    getSubjectsFor,
    getCurriculaFor,
    getYearLevels,
    getYear1112Subjects,
    getYear110Subjects,
    getFlatSubjects,
    refreshSubjects,
  };

  return (
    <SubjectsContext.Provider value={value}>
      {children}
    </SubjectsContext.Provider>
  );
}

/**
 * useSubjects hook - Access subjects context
 */
export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (!context) {
    throw new Error("useSubjects must be used within a SubjectsProvider");
  }
  return context;
}

export default SubjectsContext;
