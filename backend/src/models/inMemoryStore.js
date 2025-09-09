// In-memory storage for development
class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.tutorApplications = new Map();
    this.tutorProfiles = new Map();
    this.setupTokens = new Map();

    // Counters for generating IDs
    this.userIdCounter = 1;
    this.applicationIdCounter = 1;

    console.log("📚 In-memory storage initialized");
  }

  // User operations
  createUser(userData) {
    const id = this.userIdCounter++;
    const user = {
      id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  getUserById(id) {
    return this.users.get(id);
  }

  getUserByEmail(email) {
    for (let user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  getUserByUsername(username) {
    for (let user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  updateUser(id, updateData) {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = {
        ...user,
        ...updateData,
        updatedAt: new Date(),
      };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return null;
  }

  // Tutor application operations
  createTutorApplication(applicationData) {
    const id = this.applicationIdCounter++;
    const applicationId = `APP-${Date.now()}-${id}`;

    const application = {
      id,
      applicationId,
      ...applicationData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tutorApplications.set(id, application);
    return application;
  }

  getTutorApplicationById(id) {
    return this.tutorApplications.get(id);
  }

  getTutorApplicationByApplicationId(applicationId) {
    for (let app of this.tutorApplications.values()) {
      if (app.applicationId === applicationId) {
        return app;
      }
    }
    return null;
  }

  updateTutorApplication(id, updateData) {
    const application = this.tutorApplications.get(id);
    if (application) {
      const updated = {
        ...application,
        ...updateData,
        updatedAt: new Date(),
      };
      this.tutorApplications.set(id, updated);
      return updated;
    }
    return null;
  }

  getAllPendingApplications() {
    const pending = [];
    for (let app of this.tutorApplications.values()) {
      if (app.status === "pending") {
        pending.push(app);
      }
    }
    return pending;
  }

  // Setup token operations
  createSetupToken(tokenData) {
    this.setupTokens.set(tokenData.token, {
      ...tokenData,
      createdAt: new Date(),
    });
  }

  getSetupToken(token) {
    return this.setupTokens.get(token);
  }

  deleteSetupToken(token) {
    return this.setupTokens.delete(token);
  }

  // Tutor profile operations
  createTutorProfile(userId, profileData) {
    const profile = {
      userId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tutorProfiles.set(userId, profile);
    return profile;
  }

  getTutorProfileByUserId(userId) {
    return this.tutorProfiles.get(userId);
  }

  updateTutorProfile(userId, updateData) {
    const profile = this.tutorProfiles.get(userId);
    if (profile) {
      const updated = {
        ...profile,
        ...updateData,
        updatedAt: new Date(),
      };
      this.tutorProfiles.set(userId, updated);
      return updated;
    }
    return null;
  }

  // Debug methods
  getStats() {
    return {
      users: this.users.size,
      applications: this.tutorApplications.size,
      profiles: this.tutorProfiles.size,
      setupTokens: this.setupTokens.size,
    };
  }

  clear() {
    this.users.clear();
    this.tutorApplications.clear();
    this.tutorProfiles.clear();
    this.setupTokens.clear();
    this.userIdCounter = 1;
    this.applicationIdCounter = 1;
    console.log("🗑️ In-memory storage cleared");
  }
}

// Singleton instance
const store = new InMemoryStore();

module.exports = store;
