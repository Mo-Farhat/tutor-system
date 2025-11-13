const prisma = require("../db/prisma");
const emailService = require("../services/emailService");
const { studentTutorModel } = require("../models");

// Student -> create a request
exports.requestTutor = async (req, res) => {
  try {
    const studentId = req.user.id; // req.user is populated by authenticateToken
    const { tutorId, message } = req.body || {};
    if (!tutorId) return res.status(400).json({ success: false, error: "tutorId is required" });

    // Validate tutor
    const tutor = await prisma.user.findUnique({ where: { id: Number(tutorId) } });
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ success: false, error: "Tutor not found" });
    }

    // Prevent duplicate pending request
    const existing = await prisma.tutorRequest.findFirst({
      where: { studentId, tutorId: Number(tutorId), status: "pending" },
    });
    if (existing) {
      return res.status(400).json({ success: false, error: "You already have a pending request to this tutor." });
    }

    // Optional: prevent a new request if already paired & active
    const existingPair = await prisma.studentTutor.findFirst({
      where: { studentId, tutorId: Number(tutorId), status: "active" },
    });
    if (existingPair) {
      return res.status(400).json({ success: false, error: "You are already paired with this tutor." });
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });

    const created = await prisma.tutorRequest.create({
      data: {
        studentId,
        tutorId: Number(tutorId),
        message: message ?? null,
      },
    });

    // Notify tutor (best-effort)
    try {
      await emailService.sendTutorRequestNotification(tutor.email, student, tutor);
    } catch (e) {
      console.error("Email notify failed:", e.message);
    }

    // Send onboarding email to student (best-effort)
    try {
      await emailService.sendStudentOnboardingEmail(student.email, student);
    } catch (e) {
      console.error("Student onboarding email failed:", e.message);
    }

    res.status(201).json({ success: true, data: created, message: "Request sent" });
  } catch (e) {
    console.error("requestTutor", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Tutor -> list requests they received
exports.listReceived = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const items = await prisma.tutorRequest.findMany({
      where: { tutorId },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
      },
    });
    res.json({ success: true, data: items });
  } catch (e) {
    console.error("listReceived", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Student -> list requests they sent
exports.listMine = async (req, res) => {
  try {
    const studentId = req.user.id;
    const items = await prisma.tutorRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      include: {
        tutor: { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
      },
    });
    res.json({ success: true, data: items });
  } catch (e) {
    console.error("listMine", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Tutor -> accept / reject
exports.respond = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const requestId = Number(req.params.id);
    const { action } = req.body || {}; // 'accept' | 'reject'
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, error: "action must be 'accept' or 'reject'" });
    }

    const reqRow = await prisma.tutorRequest.findFirst({ where: { id: requestId, tutorId } });
    if (!reqRow) return res.status(404).json({ success: false, error: "Request not found" });
    if (reqRow.status !== "pending") return res.status(400).json({ success: false, error: `Already ${reqRow.status}` });

    // Update request
    const updated = await prisma.tutorRequest.update({
      where: { id: requestId },
      data: { status: action === "accept" ? "accepted" : "rejected" },
    });

    // On accept -> create StudentTutor pair (idempotent via model guard)
    if (action === "accept") {
      await studentTutorModel.assign(reqRow.studentId, reqRow.tutorId, { status: "active" });
    }

    res.json({ success: true, data: updated, message: `Request ${action}ed` });
  } catch (e) {
    console.error("respond", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
