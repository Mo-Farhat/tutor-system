import api from "./api";

class StudentService {
  // Get assigned tutors for the current student
  async getMyTutors() {
    try {
      const response = await api.get("/auth/student/my-tutors");
      return response.data; // response.data already contains { success: true, data: [...] }
    } catch (error) {
      console.error("Error fetching my tutors:", error);
      return { success: false, error: error.message };
    }
  }

  // Get parent contacts
  async getParents() {
    try {
      const response = await api.get("/auth/student/parents");
      return response.data;
    } catch (error) {
      console.error("Error fetching parents:", error);
      return { success: false, error: error.message };
    }
  }

  // Create parent contact
  async createParent(parentData) {
    try {
      const response = await api.post("/auth/student/parents", parentData);
      return response.data;
    } catch (error) {
      console.error("Error creating parent:", error);
      return { success: false, error: error.message };
    }
  }

  // Update parent contact
  async updateParent(parentId, parentData) {
    try {
      const response = await api.put(
        `/auth/student/parents/${parentId}`,
        parentData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating parent:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete parent contact
  async deleteParent(parentId) {
    try {
      const response = await api.delete(`/auth/student/parents/${parentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting parent:", error);
      return { success: false, error: error.message };
    }
  }

  // Set primary parent contact
  async setPrimaryParent(parentId) {
    try {
      const response = await api.post(
        `/auth/student/parents/${parentId}/set-primary`
      );
      return response.data;
    } catch (error) {
      console.error("Error setting primary parent:", error);
      return { success: false, error: error.message };
    }
  }

  // Get upcoming lessons
  async getUpcomingLessons() {
    try {
      const response = await api.get("/auth/student/lessons/upcoming");
      return response.data; // response.data already contains { success: true, data: [...] }
    } catch (error) {
      console.error("Error fetching upcoming lessons:", error);
      return { success: false, error: error.message };
    }
  }

  // Get completed lessons
  async getCompletedLessons() {
    try {
      const response = await api.get("/auth/student/lessons/completed");
      return response.data;
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
      return { success: false, error: error.message };
    }
  }

  // Get specific lesson details
  async getLesson(lessonId) {
    try {
      const response = await api.get(`/auth/student/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      return { success: false, error: error.message };
    }
  }

  // Give feedback for a lesson
  async giveLessonFeedback(lessonId, feedbackData) {
    try {
      const response = await api.post(
        `/auth/student/lessons/${lessonId}/feedback`,
        feedbackData
      );
      return response.data;
    } catch (error) {
      console.error("Error giving lesson feedback:", error);
      return { success: false, error: error.message };
    }
  }

  // Download lesson ICS file
  async downloadLessonIcs(lessonId) {
    try {
      const response = await api.get(`/auth/student/lessons/${lessonId}/ics`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading lesson ICS:", error);
      return { success: false, error: error.message };
    }
  }

  // Get available packages
  async getPackages() {
    try {
      const response = await api.get("/auth/student/packages");
      return response.data;
    } catch (error) {
      console.error("Error fetching packages:", error);
      return { success: false, error: error.message };
    }
  }

  // Purchase a package
  async purchasePackage(packageData) {
    try {
      const response = await api.post(
        "/auth/student/packages/purchase",
        packageData
      );
      return response.data;
    } catch (error) {
      console.error("Error purchasing package:", error);
      return { success: false, error: error.message };
    }
  }

  // Get payment history
  async getPayments() {
    try {
      const response = await api.get("/auth/student/payments");
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      return { success: false, error: error.message };
    }
  }

  // Get specific invoice
  async getInvoice(invoiceId) {
    try {
      const response = await api.get(`/auth/student/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return { success: false, error: error.message };
    }
  }

  // Get progress reports
  async getReports() {
    try {
      const response = await api.get("/auth/student/reports");
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      return { success: false, error: error.message };
    }
  }

  // Get specific report
  async getReport(reportId) {
    try {
      const response = await api.get(`/auth/student/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching report:", error);
      return { success: false, error: error.message };
    }
  }

  // Get achievements
  async getAchievements() {
    try {
      const response = await api.get("/auth/student/achievements");
      return response.data;
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return { success: false, error: error.message };
    }
  }

  // Get goals
  async getGoals() {
    try {
      const response = await api.get("/auth/student/goals");
      return response.data;
    } catch (error) {
      console.error("Error fetching goals:", error);
      return { success: false, error: error.message };
    }
  }

  // Create a goal
  async createGoal(goalData) {
    try {
      const response = await api.post("/auth/student/goals", goalData);
      return response.data;
    } catch (error) {
      console.error("Error creating goal:", error);
      return { success: false, error: error.message };
    }
  }

  // Update a goal
  async updateGoal(goalId, goalData) {
    try {
      const response = await api.put(`/auth/student/goals/${goalId}`, goalData);
      return response.data;
    } catch (error) {
      console.error("Error updating goal:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete a goal
  async deleteGoal(goalId) {
    try {
      const response = await api.delete(`/auth/student/goals/${goalId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return { success: false, error: error.message };
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await api.get("/auth/student/payment-methods");
      return response.data;
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return { success: false, error: error.message };
    }
  }

  // Create payment method
  async createPaymentMethod(paymentMethodData) {
    try {
      const response = await api.post(
        "/auth/student/payment-methods",
        paymentMethodData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment method:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId) {
    try {
      const response = await api.delete(
        `/auth/student/payment-methods/${paymentMethodId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting payment method:", error);
      return { success: false, error: error.message };
    }
  }

  // Get support tickets
  async getSupportTickets() {
    try {
      const response = await api.get("/auth/student/support-tickets");
      return response.data;
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      return { success: false, error: error.message };
    }
  }

  // Create support ticket
  async createSupportTicket(ticketData) {
    try {
      const response = await api.post(
        "/auth/student/support-tickets",
        ticketData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating support ticket:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const studentService = new StudentService();
export default studentService;
