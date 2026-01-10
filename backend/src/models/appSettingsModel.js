const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Model for managing global app settings (key-value store)
 */
const appSettingsModel = {
  /**
   * Get a setting by key
   */
  async get(key) {
    const setting = await prisma.appSettings.findUnique({
      where: { key },
    });
    return setting?.value || null;
  },

  /**
   * Get a setting as a number
   */
  async getNumber(key, defaultValue = 0) {
    const value = await this.get(key);
    return value !== null ? parseFloat(value) : defaultValue;
  },

  /**
   * Set a setting value
   */
  async set(key, value, label = null) {
    return prisma.appSettings.upsert({
      where: { key },
      update: { value: String(value), label },
      create: { key, value: String(value), label },
    });
  },

  /**
   * Get all settings
   */
  async getAll() {
    return prisma.appSettings.findMany({
      orderBy: { key: 'asc' },
    });
  },

  /**
   * Delete a setting
   */
  async delete(key) {
    return prisma.appSettings.delete({
      where: { key },
    });
  },

  // Convenience methods for specific settings
  KEYS: {
    TRAVEL_FEE: 'travel_fee_dollars',
  },

  async getTravelFee() {
    return this.getNumber(this.KEYS.TRAVEL_FEE, 15.00);
  },

  async setTravelFee(amount) {
    return this.set(this.KEYS.TRAVEL_FEE, amount, 'Travel Fee (AUD)');
  },
};

module.exports = appSettingsModel;
