const prisma = require("../db/prisma");

class ReportModel {
  // Student methods
  listForStudent(studentId) {
    return prisma.report.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { date: "desc" },
      include: { tutor: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  getForStudent(studentId, id) {
    return prisma.report.findFirst({
      where: { id: Number(id), studentId: Number(studentId) },
      include: { tutor: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  // Tutor methods
  listForTutor(tutorId) {
    return prisma.report.findMany({
      where: { tutorId: Number(tutorId) },
      orderBy: { date: "desc" },
      include: { 
        student: { select: { id: true, firstName: true, lastName: true } },
        tutor: { select: { id: true, firstName: true, lastName: true } }
      },
    });
  }

  getForTutor(tutorId, reportId) {
    return prisma.report.findFirst({
      where: { 
        id: Number(reportId), 
        tutorId: Number(tutorId) 
      },
      include: { 
        student: { select: { id: true, firstName: true, lastName: true } },
        tutor: { select: { id: true, firstName: true, lastName: true } }
      },
    });
  }

  async createByTutor(tutorId, data) {
    const {
      studentId,
      type,
      subject,
      starRating,
      progressSummary,
      overview,
      keyAchievements,
      skillsCovered,
      areasToImprove,
      nextTermGoals,
      homeworkCompletion,
      engagement,
      attendanceNote,
      nextGoal,
      term,
      overallProgress,
    } = data;

    return prisma.report.create({
      data: {
        tutorId: Number(tutorId),
        studentId: Number(studentId),
        type: type,
        subject: subject,
        starRating: starRating ? Number(starRating) : null,
        progressSummary: progressSummary || null,
        overview: overview || null,
        keyAchievements: keyAchievements || [],
        skillsCovered: skillsCovered || [],
        areasToImprove: areasToImprove || [],
        nextTermGoals: nextTermGoals || [],
        homeworkCompletion: homeworkCompletion || null,
        engagement: engagement || null,
        attendanceNote: attendanceNote || null,
        nextGoal: nextGoal || null,
        term: term || null,
        overallProgress: overallProgress || null,
        isLocked: false,
      },
      include: { 
        student: { select: { id: true, firstName: true, lastName: true } },
        tutor: { select: { id: true, firstName: true, lastName: true } }
      },
    });
  }

  async updateByTutor(tutorId, reportId, data) {
    // First check if report exists and belongs to tutor
    const existing = await this.getForTutor(tutorId, reportId);
    if (!existing) {
      throw new Error("Report not found or access denied");
    }
    if (existing.isLocked) {
      throw new Error("Cannot edit locked report");
    }

    const updateData = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.starRating !== undefined) updateData.starRating = data.starRating ? Number(data.starRating) : null;
    if (data.progressSummary !== undefined) updateData.progressSummary = data.progressSummary;
    if (data.overview !== undefined) updateData.overview = data.overview;
    if (data.keyAchievements !== undefined) updateData.keyAchievements = data.keyAchievements;
    if (data.skillsCovered !== undefined) updateData.skillsCovered = data.skillsCovered;
    if (data.areasToImprove !== undefined) updateData.areasToImprove = data.areasToImprove;
    if (data.nextTermGoals !== undefined) updateData.nextTermGoals = data.nextTermGoals;
    if (data.homeworkCompletion !== undefined) updateData.homeworkCompletion = data.homeworkCompletion;
    if (data.engagement !== undefined) updateData.engagement = data.engagement;
    if (data.attendanceNote !== undefined) updateData.attendanceNote = data.attendanceNote;
    if (data.nextGoal !== undefined) updateData.nextGoal = data.nextGoal;
    if (data.term !== undefined) updateData.term = data.term;
    if (data.overallProgress !== undefined) updateData.overallProgress = data.overallProgress;

    return prisma.report.update({
      where: { id: Number(reportId) },
      data: updateData,
      include: { 
        student: { select: { id: true, firstName: true, lastName: true } },
        tutor: { select: { id: true, firstName: true, lastName: true } }
      },
    });
  }

  async deleteByTutor(tutorId, reportId) {
    // First check if report exists and belongs to tutor
    const existing = await this.getForTutor(tutorId, reportId);
    if (!existing) {
      throw new Error("Report not found or access denied");
    }
    if (existing.isLocked) {
      throw new Error("Cannot delete locked report");
    }

    return prisma.report.delete({
      where: { id: Number(reportId) },
    });
  }
}

module.exports = new ReportModel();
