import React, { useState, useEffect } from "react";
import adminService from "../../../../services/adminService";
import "../../../../css/dashboards/admin/finance/tierManagement.css";

function TierManagement() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hourlyRate: "",
    striveCut: "",
  });

  // Travel Fee State
  const [travelFee, setTravelFee] = useState(15);
  const [travelFeeInput, setTravelFeeInput] = useState("15");
  const [travelFeeLoading, setTravelFeeLoading] = useState(false);
  const [travelFeeSuccess, setTravelFeeSuccess] = useState(false);

  useEffect(() => {
    fetchTiers();
    fetchTravelFee();
  }, []);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getTiers();
      if (res.success) {
        setTiers(res.data);
      } else {
        setError(res.error || "Failed to fetch tiers");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchTravelFee = async () => {
    try {
      const res = await adminService.getTravelFee();
      if (res.success) {
        setTravelFee(res.data.travelFee);
        setTravelFeeInput(String(res.data.travelFee));
      }
    } catch (err) {
      console.error("Error fetching travel fee:", err);
    }
  };

  const handleUpdateTravelFee = async () => {
    try {
      setTravelFeeLoading(true);
      setTravelFeeSuccess(false);
      const amount = parseFloat(travelFeeInput);
      if (isNaN(amount) || amount < 0) {
        setError("Please enter a valid travel fee amount");
        return;
      }
      const res = await adminService.updateTravelFee(amount);
      if (res.success) {
        setTravelFee(amount);
        setTravelFeeSuccess(true);
        setTimeout(() => setTravelFeeSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to update travel fee");
      }
    } catch (err) {
      setError("Failed to update travel fee");
    } finally {
      setTravelFeeLoading(false);
    }
  };

  const handleOpenModal = (tier = null) => {
    if (tier) {
      setEditingTier(tier);
      setFormData({
        name: tier.name,
        hourlyRate: tier.hourlyRate,
        striveCut: tier.striveCut,
      });
    } else {
      setEditingTier(null);
      setFormData({
        name: "",
        hourlyRate: "",
        striveCut: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTier(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const tierName = formData.name.toLowerCase();
    const data = {
      name: tierName,
      hourlyRate: parseFloat(formData.hourlyRate),
      striveCut: parseFloat(formData.striveCut),
    };

    // Add id when creating a new tier (id is the tier name in lowercase)
    if (!editingTier) {
      data.id = tierName;
    }

    try {
      let res;
      if (editingTier) {
        res = await adminService.updateTier(editingTier.id, data);
      } else {
        res = await adminService.createTier(data);
      }

      if (res.success) {
        fetchTiers();
        handleCloseModal();
      } else {
        setError(res.error || "Failed to save tier");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const payoutRate = (parseFloat(formData.hourlyRate) || 0) - (parseFloat(formData.striveCut) || 0);

  if (loading && tiers.length === 0) {
    return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="tier-management-container">
      <div className="tier-management-header">
        <h2 className="tier-management-title">Master Tier Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-2"></i> Add New Tier
        </button>
      </div>

      {error && !showModal && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Travel Fee Configuration */}
      <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h5 className="mb-1">
                <i className="fas fa-car me-2 text-primary"></i>
                Travel Fee (Physical Sessions)
              </h5>
              <small className="text-muted">
                This fee is charged to students for in-person sessions and paid directly to the tutor.
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group" style={{ width: '150px' }}>
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  value={travelFeeInput}
                  onChange={(e) => setTravelFeeInput(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <button
                className={`btn ${travelFeeSuccess ? 'btn-success' : 'btn-outline-primary'}`}
                onClick={handleUpdateTravelFee}
                disabled={travelFeeLoading}
              >
                {travelFeeLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : travelFeeSuccess ? (
                  <><i className="fas fa-check me-1"></i> Saved</>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="tier-grid">
        {tiers.map((tier) => (
          <div key={tier.id} className={`tier-card ${tier.name.toLowerCase()}`}>
            <div className="tier-name">{tier.name}</div>
            <div className="tier-rate-item">
              <span className="tier-rate-label">Student Hourly Rate</span>
              <span className="tier-rate-value">${parseFloat(tier.hourlyRate).toFixed(2)}</span>
            </div>
            <div className="tier-rate-item">
              <span className="tier-rate-label">Strive Cut</span>
              <span className="tier-rate-value">${parseFloat(tier.striveCut).toFixed(2)}</span>
            </div>
            <div className="tier-rate-item">
              <span className="tier-rate-label">Tutor Payout Rate</span>
              <span className="tier-rate-value payout">${parseFloat(tier.payoutRate).toFixed(2)}</span>
            </div>
            <div className="tier-actions">
              <button className="btn-edit-tier" onClick={() => handleOpenModal(tier)}>
                <i className="fas fa-edit me-1"></i> Edit Rates
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="tier-modal-overlay" onClick={handleCloseModal}>
          <div className="tier-modal" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-4">{editingTier ? "Edit Tier" : "Create New Tier"}</h4>
            
            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="tier-form-group">
                <label>Tier Name</label>
                <input
                  type="text"
                  className="tier-form-control"
                  placeholder="e.g. Gold, Premium, Elite"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={editingTier}
                />
              </div>
              <div className="tier-form-group">
                <label>Student Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="tier-form-control"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  required
                />
              </div>
              <div className="tier-form-group">
                <label>Strive Cut ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="tier-form-control"
                  value={formData.striveCut}
                  onChange={(e) => setFormData({ ...formData, striveCut: e.target.value })}
                  required
                />
              </div>

              <div className="tier-calc-preview">
                <div className="calc-row">
                  <span>Hourly Rate:</span>
                  <span>${(parseFloat(formData.hourlyRate) || 0).toFixed(2)}</span>
                </div>
                <div className="calc-row">
                  <span>Strive Cut:</span>
                  <span>-${(parseFloat(formData.striveCut) || 0).toFixed(2)}</span>
                </div>
                <div className="calc-row total">
                  <span>Tutor Payout:</span>
                  <span>${payoutRate.toFixed(2)}</span>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-grow-1">
                  {editingTier ? "Update Tier" : "Create Tier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TierManagement;
