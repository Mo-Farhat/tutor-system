const prisma = require("../db/prisma");

/**
 * Get all pipeline stages for a specific student-tutor pair
 */
async function getPipelineByStudentAndTutor(studentId, tutorId) {
  return await prisma.lessonPipeline.findMany({
    where: {
      studentId: parseInt(studentId),
      tutorId: parseInt(tutorId),
    },
    orderBy: {
      stage: 'asc',
    },
  });
}

/**
 * Get a specific pipeline stage
 */
async function getPipelineStage(studentId, tutorId, stage) {
  return await prisma.lessonPipeline.findUnique({
    where: {
      studentId_tutorId_stage: {
        studentId: parseInt(studentId),
        tutorId: parseInt(tutorId),
        stage: stage,
      },
    },
  });
}

/**
 * Create or update a pipeline stage
 */
async function upsertPipelineStage(studentId, tutorId, stage, data) {
  return await prisma.lessonPipeline.upsert({
    where: {
      studentId_tutorId_stage: {
        studentId: parseInt(studentId),
        tutorId: parseInt(tutorId),
        stage: stage,
      },
    },
    update: {
      status: data.status,
      date: data.date || null,
      notes: data.notes || null,
    },
    create: {
      studentId: parseInt(studentId),
      tutorId: parseInt(tutorId),
      stage: stage,
      status: data.status || 'pending',
      date: data.date || null,
      notes: data.notes || null,
    },
  });
}

/**
 * Initialize all pipeline stages for a student-tutor pair
 */
async function initializePipeline(studentId, tutorId) {
  const stages = [
    'initial_contact',
    'academic_consultation',
    'payment_method_added',
    'first_paid_lesson',
    'package_purchase',
    'regular_sessions',
  ];

  const operations = stages.map((stage) =>
    prisma.lessonPipeline.upsert({
      where: {
        studentId_tutorId_stage: {
          studentId: parseInt(studentId),
          tutorId: parseInt(tutorId),
          stage: stage,
        },
      },
      update: {},
      create: {
        studentId: parseInt(studentId),
        tutorId: parseInt(tutorId),
        stage: stage,
        status: 'pending',
      },
    })
  );

  return await prisma.$transaction(operations);
}

/**
 * Get all pipelines for a specific student (across all tutors)
 */
async function getPipelinesByStudent(studentId) {
  return await prisma.lessonPipeline.findMany({
    where: {
      studentId: parseInt(studentId),
    },
    include: {
      tutor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [
      { tutorId: 'asc' },
      { stage: 'asc' },
    ],
  });
}

/**
 * Get all pipelines for a specific tutor (across all students)
 */
async function getPipelinesByTutor(tutorId) {
  return await prisma.lessonPipeline.findMany({
    where: {
      tutorId: parseInt(tutorId),
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [
      { studentId: 'asc' },
      { stage: 'asc' },
    ],
  });
}

/**
 * Delete all pipeline stages for a student-tutor pair
 */
async function deletePipeline(studentId, tutorId) {
  return await prisma.lessonPipeline.deleteMany({
    where: {
      studentId: parseInt(studentId),
      tutorId: parseInt(tutorId),
    },
  });
}

module.exports = {
  getPipelineByStudentAndTutor,
  getPipelineStage,
  upsertPipelineStage,
  initializePipeline,
  getPipelinesByStudent,
  getPipelinesByTutor,
  deletePipeline,
};

