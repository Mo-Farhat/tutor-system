const express = require("express");
const router = express.Router();
const { appSettingsModel } = require("../models");
const { authenticateToken, requireRole } = require("../middleware/auth");

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole("admin"));

/**
 * GET /api/admin/settings
 * Get all app settings
 */
router.get("/", async (req, res) => {
  try {
    const settings = await appSettingsModel.getAll();
    res.json({
      success: true,
      data: settings.reduce((acc, s) => {
        acc[s.key] = { value: s.value, label: s.label };
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/settings/travel-fee
 * Get travel fee setting
 */
router.get("/travel-fee", async (req, res) => {
  try {
    const travelFee = await appSettingsModel.getTravelFee();
    res.json({
      success: true,
      data: {
        travelFee,
        label: "Travel Fee (AUD)",
      },
    });
  } catch (error) {
    console.error("Error getting travel fee:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/settings/travel-fee
 * Update travel fee setting
 */
router.put("/travel-fee", async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (amount === undefined || isNaN(parseFloat(amount))) {
      return res.status(400).json({
        success: false,
        error: "Valid amount is required",
      });
    }
    
    const fee = parseFloat(amount);
    if (fee < 0) {
      return res.status(400).json({
        success: false,
        error: "Travel fee cannot be negative",
      });
    }
    
    await appSettingsModel.setTravelFee(fee);
    
    console.log(`✅ Travel fee updated to $${fee}`);
    
    res.json({
      success: true,
      data: {
        travelFee: fee,
        message: `Travel fee updated to $${fee}`,
      },
    });
  } catch (error) {
    console.error("Error updating travel fee:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/settings/:key
 * Update any setting by key
 */
router.put("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value, label } = req.body;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        error: "Value is required",
      });
    }
    
    await appSettingsModel.set(key, value, label);
    
    res.json({
      success: true,
      data: { key, value, label },
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
