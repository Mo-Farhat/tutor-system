/**
 * Session Completion Service
 * Handles the complete flow when a tutor marks a session as completed:
 * 1. Calculate duration from scheduled times
 * 2. Find the assignment bucket
 * 3. Get tier rates
 * 4. Deduct hours from bucket
 * 5. Handle overage if bucket goes negative
 * 6. Charge travel fee if physical
 * 7. Create payout record
 * 8. Create audit record
 * 9. Send notifications
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { studentTutorModel, masterTierModel } = require('../models');
const stripeService = require('./stripeService');
const notificationService = require('./notificationService');

// Travel fee constant
const TRAVEL_FEE_CENTS = 1500; // $15.00

class SessionCompletionService {
  
  /**
   * Calculate session duration in hours from lesson times
   */
  calculateDuration(startAt, endAt) {
    const start = new Date(startAt);
    const end = new Date(endAt);
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Debug logging for timezone issues
    console.log(`⏱️ Duration calculation:
      startAt (raw): ${startAt}
      endAt (raw): ${endAt}
      start (parsed): ${start.toISOString()}
      end (parsed): ${end.toISOString()}
      durationMs: ${durationMs}
      durationHours: ${durationHours}`);
    
    return Math.round(durationHours * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Main entry point: Complete a session
   * Called when tutor marks lesson as "completed"
   */
  async completeSession(lessonId, deliveryMode = 'online') {
    // 1. Get the lesson with related data
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: { select: { tier: true } },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.status === 'completed') {
      throw new Error('Lesson is already completed');
    }

    // 2. Calculate duration
    const durationHours = this.calculateDuration(lesson.startAt, lesson.endAt);

    // 3. Find the assignment bucket (or create one for legacy lessons)
    let assignment = await studentTutorModel.findForLesson(
      lesson.studentId,
      lesson.tutorId,
      lesson.subject
    );

    // If no assignment exists (legacy lesson), create one with 0 hours
    if (!assignment) {
      console.log(`📝 Creating assignment for legacy lesson ${lessonId}: student ${lesson.studentId} <-> tutor ${lesson.tutorId}, subject: ${lesson.subject}`);
      assignment = await studentTutorModel.assign(
        lesson.studentId,
        lesson.tutorId,
        {
          subject: lesson.subject,
          status: 'active',
          remainingHours: 0
        }
      );
      console.log(`✅ Assignment created with ID: ${assignment.id}`);
    }

    // 4. Get tier rates
    const tutorTier = lesson.tutor.profile?.tier?.toLowerCase() || 'gold';
    const tierRates = await masterTierModel.findById(tutorTier);
    
    if (!tierRates) {
      throw new Error(`Tier configuration not found for: ${tutorTier}`);
    }

    const hourlyRate = parseFloat(tierRates.hourlyRate);
    const striveCut = parseFloat(tierRates.striveCut);
    const payoutRate = parseFloat(tierRates.payoutRate);

    // 5. Calculate charges
    const baseCharge = durationHours * hourlyRate;
    const grossPayout = durationHours * hourlyRate;
    const netPayout = durationHours * payoutRate;
    const platformCut = durationHours * striveCut;
    
    // Travel fee
    const travelFee = deliveryMode === 'physical' ? 15.00 : null;

    // 6. Deduct hours from bucket
    const previousHours = parseFloat(assignment.remainingHours);
    await studentTutorModel.deductHours(assignment.id, durationHours);
    const newHours = previousHours - durationHours;

    // 7. Calculate overage
    let overageAmount = null;
    let overageHours = 0;
    
    if (newHours < 0) {
      overageHours = Math.abs(newHours);
      overageAmount = overageHours * hourlyRate;
      
      // Reset bucket to 0 (don't leave negative)
      await studentTutorModel.setRemainingHours(assignment.id, 0);
    }

    // 8. Update lesson status
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'completed',
        deliveryMode: deliveryMode,
        completedAt: new Date(),
        studentConfirmed: false, // Needs student confirmation
      },
    });

    // 9. Create TutorPayout record
    const payout = await prisma.tutorPayout.create({
      data: {
        tutorId: lesson.tutorId,
        lessonId: lessonId,
        grossAmount: grossPayout,
        striveCut: platformCut,
        netPayout: netPayout,
        travelFee: travelFee,
        status: 'pending', // Will be 'paid' after student confirms
      },
    });

    // 10. Create SessionAudit record
    const audit = await prisma.sessionAudit.create({
      data: {
        lessonId: lessonId,
        durationHours: durationHours,
        baseCharge: baseCharge,
        travelFee: travelFee,
        overageAmount: overageAmount,
        striveCut: platformCut,
        tutorPayout: netPayout,
      },
    });

    // 11. Send notification to student to confirm session
    await notificationService.createNotification(
      lesson.studentId,
      'session_confirm_request',
      'Please confirm your session',
      `Your ${durationHours} hour session for ${lesson.subject} with ${lesson.tutor.firstName} needs your confirmation.`,
      'high',
      `/dashboard/student/confirm-session/${lessonId}`,
      { lessonId, durationHours, tutorName: `${lesson.tutor.firstName} ${lesson.tutor.lastName}` }
    );

    // 12. If low balance, send warning notification
    if (newHours > 0 && newHours <= 2) {
      await notificationService.createNotification(
        lesson.studentId,
        'bucket_low_warning',
        'Low hours remaining',
        `You have only ${newHours.toFixed(1)} hours remaining for ${lesson.subject} with ${lesson.tutor.firstName}. Consider purchasing more hours.`,
        'medium',
        '/dashboard/student/packages',
        { assignmentId: assignment.id, remainingHours: newHours }
      );
    }

    return {
      success: true,
      lesson: {
        id: lessonId,
        durationHours,
        deliveryMode,
        status: 'completed',
      },
      assignment: {
        id: assignment.id,
        previousHours,
        newHours: Math.max(0, newHours),
        overageHours,
      },
      payout: {
        id: payout.id,
        gross: grossPayout,
        striveCut: platformCut,
        net: netPayout,
        travelFee,
      },
      audit: {
        id: audit.id,
        baseCharge,
        overageAmount,
      },
      pendingCharges: {
        overage: overageAmount,
        travelFee: travelFee,
        // These will be charged after student confirms
      },
    };
  }

  /**
   * Called when student confirms the session
   * This triggers any pending Stripe charges
   */
  async confirmSession(lessonId, studentId, confirmed = true, notes = null) {
    // 1. Get the lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
      include: {
        sessionAudit: true,
        payout: true,
        student: {
          select: {
            id: true,
            stripeCustomerId: true,
            email: true,
          },
        },
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.studentId !== Number(studentId)) {
      throw new Error('Unauthorized: This lesson does not belong to you');
    }

    if (lesson.studentConfirmed) {
      throw new Error('Session already confirmed');
    }

    // 2. Update lesson with confirmation
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        studentConfirmed: confirmed,
        confirmationNotes: notes,
      },
    });

    if (!confirmed) {
      // Disputed - notify admin
      await notificationService.createNotification(
        lesson.tutorId,
        'session_disputed',
        'Session disputed by student',
        `${lesson.student.email} has disputed the session. Notes: ${notes || 'No notes provided'}`,
        'high',
        null,
        { lessonId, notes }
      );
      
      return { success: true, status: 'disputed', notes };
    }

    // 3. Process pending charges
    const audit = lesson.sessionAudit;
    const chargeResults = [];

    // Charge overage if any
    if (audit?.overageAmount && parseFloat(audit.overageAmount) > 0) {
      try {
        const overageCents = Math.round(parseFloat(audit.overageAmount) * 100);
        const paymentIntent = await stripeService.createPaymentIntent(
          studentId,
          overageCents,
          `Overage charge for ${lesson.subject} session`,
          { type: 'overage', lessonId: lessonId.toString() }
        );
        
        // Create transaction record
        await prisma.paymentTransaction.create({
          data: {
            studentId: studentId,
            lessonId: lessonId,
            type: 'session',
            amountCents: overageCents,
            description: `Overage: ${parseFloat(audit.overageAmount).toFixed(2)} hours`,
            status: 'pending',
            stripePaymentId: paymentIntent.id,
          },
        });
        
        chargeResults.push({ type: 'overage', amount: overageCents, status: 'pending' });
      } catch (e) {
        console.error('Failed to charge overage:', e);
        chargeResults.push({ type: 'overage', error: e.message });
      }
    }

    // Charge travel fee if physical
    if (audit?.travelFee && parseFloat(audit.travelFee) > 0) {
      try {
        const paymentIntent = await stripeService.createPaymentIntent(
          studentId,
          TRAVEL_FEE_CENTS,
          `Travel fee for in-person session`,
          { type: 'travel_fee', lessonId: lessonId.toString() }
        );
        
        // Create transaction record
        await prisma.paymentTransaction.create({
          data: {
            studentId: studentId,
            lessonId: lessonId,
            type: 'fee',
            amountCents: TRAVEL_FEE_CENTS,
            description: 'Travel fee - in-person session',
            status: 'pending',
            stripePaymentId: paymentIntent.id,
          },
        });
        
        chargeResults.push({ type: 'travel_fee', amount: TRAVEL_FEE_CENTS, status: 'pending' });
      } catch (e) {
        console.error('Failed to charge travel fee:', e);
        chargeResults.push({ type: 'travel_fee', error: e.message });
      }
    }

    // 4. Update payout status
    if (lesson.payout) {
      await prisma.tutorPayout.update({
        where: { id: lesson.payout.id },
        data: { status: 'confirmed' },
      });
    }

    // 5. Notify tutor
    await notificationService.createNotification(
      lesson.tutorId,
      'session_confirmed',
      'Session confirmed!',
      `Your session has been confirmed by the student. Payout: $${parseFloat(lesson.payout?.netPayout || 0).toFixed(2)}`,
      'medium',
      '/dashboard/tutor/earnings',
      { lessonId, payoutId: lesson.payout?.id }
    );

    return {
      success: true,
      status: 'confirmed',
      charges: chargeResults,
    };
  }
}

module.exports = new SessionCompletionService();
