const sessionCompletionService = require('../services/sessionCompletionService');

/**
 * Complete a session (called by tutor)
 * POST /api/auth/tutor/lessons/:id/complete
 */
exports.completeSession = async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    const { deliveryMode } = req.body;

    // Verify the tutor owns this lesson
    const { lessonModel } = require('../models');
    const lesson = await lessonModel.findByIdForTutor(lessonId, req.user.id);
    
    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lesson not found or not authorized' 
      });
    }

    if (lesson.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Lesson is already completed' 
      });
    }

    const result = await sessionCompletionService.completeSession(
      lessonId, 
      deliveryMode || 'online'
    );

    res.json({ success: true, data: result });
  } catch (e) {
    console.error('session.completeSession', e);
    res.status(500).json({ 
      success: false, 
      error: e.message || 'Internal server error' 
    });
  }
};

/**
 * Confirm a session (called by student)
 * POST /api/auth/student/lessons/:id/confirm
 */
exports.confirmSession = async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    const { confirmed, notes } = req.body;

    if (confirmed === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'confirmed field is required (true or false)' 
      });
    }

    const result = await sessionCompletionService.confirmSession(
      lessonId,
      req.user.id,
      confirmed,
      notes
    );

    res.json({ success: true, data: result });
  } catch (e) {
    console.error('session.confirmSession', e);
    res.status(500).json({ 
      success: false, 
      error: e.message || 'Internal server error' 
    });
  }
};

/**
 * Get pending confirmations for a student
 * GET /api/auth/student/lessons/pending-confirmation
 */
exports.getPendingConfirmations = async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const lessons = await prisma.lesson.findMany({
      where: {
        studentId: req.user.id,
        status: 'completed',
        studentConfirmed: false,
      },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sessionAudit: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    const formatted = lessons.map(lesson => ({
      id: lesson.id,
      subject: lesson.subject,
      startAt: lesson.startAt,
      endAt: lesson.endAt,
      completedAt: lesson.completedAt,
      deliveryMode: lesson.deliveryMode,
      tutor: lesson.tutor,
      audit: lesson.sessionAudit ? {
        durationHours: parseFloat(lesson.sessionAudit.durationHours),
        baseCharge: parseFloat(lesson.sessionAudit.baseCharge),
        travelFee: lesson.sessionAudit.travelFee ? parseFloat(lesson.sessionAudit.travelFee) : null,
        overageAmount: lesson.sessionAudit.overageAmount ? parseFloat(lesson.sessionAudit.overageAmount) : null,
      } : null,
    }));

    res.json({ success: true, data: formatted });
  } catch (e) {
    console.error('session.getPendingConfirmations', e);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};
