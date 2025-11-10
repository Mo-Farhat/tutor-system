const lessonPipelineModel = require("../models/lessonPipelineModel");

/**
 * Get pipeline for a student-tutor pair
 */
async function getPipeline(studentId, tutorId) {
  try {
    let pipeline = await lessonPipelineModel.getPipelineByStudentAndTutor(studentId, tutorId);
    
    // If pipeline doesn't exist, initialize it
    if (!pipeline || pipeline.length === 0) {
      pipeline = await lessonPipelineModel.initializePipeline(studentId, tutorId);
    }
    
    // Transform to frontend-friendly format
    const stages = [
      { key: 'initial_contact', name: 'Initial Contact' },
      { key: 'academic_consultation', name: 'Academic Consultation' },
      { key: 'payment_method_added', name: 'Student Added Payment Method' },
      { key: 'first_paid_lesson', name: 'First Paid Lesson' },
      { key: 'package_purchase', name: 'Package Purchase' },
      { key: 'regular_sessions', name: 'Regular Sessions' },
    ];

    return stages.map((stageInfo) => {
      const pipelineStage = pipeline.find((p) => p.stage === stageInfo.key);
      return {
        name: stageInfo.name,
        key: stageInfo.key,
        status: pipelineStage?.status || 'pending',
        date: pipelineStage?.date || null,
        notes: pipelineStage?.notes || '',
      };
    });
  } catch (error) {
    console.error('Error in getPipeline service:', error);
    throw error;
  }
}

/**
 * Update a specific pipeline stage
 */
async function updatePipelineStage(studentId, tutorId, stageName, updateData) {
  try {
    // Validate stage name
    const validStages = [
      'initial_contact',
      'academic_consultation',
      'payment_method_added',
      'first_paid_lesson',
      'package_purchase',
      'regular_sessions',
    ];

    if (!validStages.includes(stageName)) {
      throw new Error(`Invalid stage name: ${stageName}`);
    }

    // Validate status if provided
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      throw new Error(`Invalid status: ${updateData.status}`);
    }

    const data = {
      status: updateData.status,
      date: updateData.date ? new Date(updateData.date) : undefined,
      notes: updateData.notes,
    };

    // If status is completed and date is not provided, set it to now
    if (updateData.status === 'completed' && !data.date) {
      data.date = new Date();
    }

    const updated = await lessonPipelineModel.upsertPipelineStage(
      studentId,
      tutorId,
      stageName,
      data
    );

    return updated;
  } catch (error) {
    console.error('Error in updatePipelineStage service:', error);
    throw error;
  }
}

/**
 * Get all pipelines for a student (admin view)
 */
async function getStudentPipelines(studentId) {
  try {
    const pipelines = await lessonPipelineModel.getPipelinesByStudent(studentId);
    
    // Group by tutor
    const groupedByTutor = {};
    
    pipelines.forEach((pipeline) => {
      const tutorId = pipeline.tutorId;
      
      if (!groupedByTutor[tutorId]) {
        groupedByTutor[tutorId] = {
          tutor: pipeline.tutor,
          stages: [],
        };
      }
      
      groupedByTutor[tutorId].stages.push({
        name: formatStageName(pipeline.stage),
        key: pipeline.stage,
        status: pipeline.status,
        date: pipeline.date,
        notes: pipeline.notes,
      });
    });
    
    return Object.values(groupedByTutor);
  } catch (error) {
    console.error('Error in getStudentPipelines service:', error);
    throw error;
  }
}

/**
 * Get all pipelines for a tutor
 */
async function getTutorPipelines(tutorId) {
  try {
    const pipelines = await lessonPipelineModel.getPipelinesByTutor(tutorId);
    
    // Group by student
    const groupedByStudent = {};
    
    pipelines.forEach((pipeline) => {
      const studentId = pipeline.studentId;
      
      if (!groupedByStudent[studentId]) {
        groupedByStudent[studentId] = {
          student: pipeline.student,
          stages: [],
        };
      }
      
      groupedByStudent[studentId].stages.push({
        name: formatStageName(pipeline.stage),
        key: pipeline.stage,
        status: pipeline.status,
        date: pipeline.date,
        notes: pipeline.notes,
      });
    });
    
    return Object.values(groupedByStudent);
  } catch (error) {
    console.error('Error in getTutorPipelines service:', error);
    throw error;
  }
}

/**
 * Initialize pipeline for a new student-tutor pairing
 */
async function initializePipelineForPair(studentId, tutorId) {
  try {
    return await lessonPipelineModel.initializePipeline(studentId, tutorId);
  } catch (error) {
    console.error('Error in initializePipelineForPair service:', error);
    throw error;
  }
}

/**
 * Update pipeline when student adds payment method
 * Marks payment_method_added stage as completed for all tutors
 */
async function updatePipelineOnPaymentMethodAdded(studentId) {
  try {
    // Get all tutors for this student
    const studentTutorModel = require('../models/studentTutorModel');
    const tutorPairs = await studentTutorModel.listByStudent(studentId);
    
    // Update pipeline for each tutor
    const updatePromises = tutorPairs.map(pair => 
      updatePipelineStage(
        studentId,
        pair.tutorId,
        'payment_method_added',
        { status: 'completed', date: new Date() }
      )
    );
    
    await Promise.all(updatePromises);
    return { success: true, updatedCount: tutorPairs.length };
  } catch (error) {
    console.error('Error updating pipeline on payment method added:', error);
    throw error;
  }
}

/**
 * Helper function to format stage names
 */
function formatStageName(stage) {
  const stageNames = {
    initial_contact: 'Initial Contact',
    academic_consultation: 'Academic Consultation',
    payment_method_added: 'Payment Method Added',
    first_paid_lesson: 'First Paid Lesson',
    package_purchase: 'Package Purchase',
    regular_sessions: 'Regular Sessions',
  };
  return stageNames[stage] || stage;
}

module.exports = {
  getPipeline,
  updatePipelineStage,
  getStudentPipelines,
  getTutorPipelines,
  initializePipelineForPair,
  updatePipelineOnPaymentMethodAdded,
};

