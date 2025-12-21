const { masterTierModel } = require("../models");

/**
 * Get all tiers
 */
exports.getAllTiers = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const tiers = await masterTierModel.findAll(includeInactive);
    
    res.json({
      success: true,
      data: tiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        hourlyRate: parseFloat(tier.hourlyRate),
        striveCut: parseFloat(tier.striveCut),
        payoutRate: parseFloat(tier.payoutRate),
        isActive: tier.isActive,
        createdAt: tier.createdAt,
        updatedAt: tier.updatedAt,
      })),
    });
  } catch (e) {
    console.error("adminTiers.getAllTiers", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Get tier by ID
 */
exports.getTierById = async (req, res) => {
  try {
    const tier = await masterTierModel.findById(req.params.id);
    
    if (!tier) {
      return res.status(404).json({ success: false, error: "Tier not found" });
    }
    
    res.json({
      success: true,
      data: {
        id: tier.id,
        name: tier.name,
        hourlyRate: parseFloat(tier.hourlyRate),
        striveCut: parseFloat(tier.striveCut),
        payoutRate: parseFloat(tier.payoutRate),
        isActive: tier.isActive,
        createdAt: tier.createdAt,
        updatedAt: tier.updatedAt,
      },
    });
  } catch (e) {
    console.error("adminTiers.getTierById", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Create a new tier
 */
exports.createTier = async (req, res) => {
  try {
    const { id, name, hourlyRate, striveCut, isActive } = req.body;
    
    if (!id || !name || hourlyRate === undefined || striveCut === undefined) {
      return res.status(400).json({
        success: false,
        error: "id, name, hourlyRate, and striveCut are required",
      });
    }
    
    // Check if tier already exists
    const existing = await masterTierModel.findById(id);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Tier with this ID already exists",
      });
    }
    
    const tier = await masterTierModel.create({
      id,
      name,
      hourlyRate,
      striveCut,
      isActive,
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: tier.id,
        name: tier.name,
        hourlyRate: parseFloat(tier.hourlyRate),
        striveCut: parseFloat(tier.striveCut),
        payoutRate: parseFloat(tier.payoutRate),
        isActive: tier.isActive,
      },
    });
  } catch (e) {
    console.error("adminTiers.createTier", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Update a tier
 */
exports.updateTier = async (req, res) => {
  try {
    const { name, hourlyRate, striveCut, isActive } = req.body;
    
    const existing = await masterTierModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Tier not found" });
    }
    
    const tier = await masterTierModel.update(req.params.id, {
      name,
      hourlyRate,
      striveCut,
      isActive,
    });
    
    res.json({
      success: true,
      data: {
        id: tier.id,
        name: tier.name,
        hourlyRate: parseFloat(tier.hourlyRate),
        striveCut: parseFloat(tier.striveCut),
        payoutRate: parseFloat(tier.payoutRate),
        isActive: tier.isActive,
      },
    });
  } catch (e) {
    console.error("adminTiers.updateTier", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Delete a tier (soft delete)
 */
exports.deleteTier = async (req, res) => {
  try {
    const existing = await masterTierModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Tier not found" });
    }
    
    await masterTierModel.delete(req.params.id);
    
    res.json({ success: true, message: "Tier deactivated successfully" });
  } catch (e) {
    console.error("adminTiers.deleteTier", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
