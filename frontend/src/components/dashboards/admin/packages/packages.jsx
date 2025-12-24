import React, { useState, useEffect } from "react";
import adminService from "../../../../services/adminService";
import {
  PACKAGE_TYPES,
  TUTOR_TIERS,
  TUTOR_TIER_LABELS,
  DEFAULT_PACKAGE_DISCOUNT,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
} from "../constants/adminConstants";
import { useSubjects } from "../../../../contexts/SubjectsContext";
import "../../../../css/dashboards/admin/packages/packages.css";

function AdminPackages() {
  // Get subjects from context
  const { getFlatSubjects, isLoading: subjectsLoading } = useSubjects();
  const subjectsList = getFlatSubjects();
  
  // Get unique subject names for dropdowns
  const uniqueSubjects = [...new Set(subjectsList.map(s => s.name))].sort();
  
  const [packages, setPackages] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentPackages, setStudentPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPackageDetailsModal, setShowPackageDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newPackage, setNewPackage] = useState({
    name: "",
    subject: "",
    hours: "",
    price: "",
    discount: "",
    discountType: "fixed", // fixed or percentage
    tierEligibility: [],
    validity: "6", // months
    refundable: true,
    description: "",
    autoRenewal: false,
    renewalPeriod: "3", // months
  });
  const [assignmentData, setAssignmentData] = useState({
    studentId: "",
    packageId: "",
    paymentMethod: "card",
    paymentStatus: PAYMENT_STATUS.PENDING,
    notes: "",
  });
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load real packages data from API
      const [packagesResponse, studentsResponse] = await Promise.all([
        adminService.getPackages(),
        adminService.getUsers({ role: "student" })
      ]);

      // Transform packages data to match frontend expectations
      const transformedPackages = packagesResponse.items?.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        subject: pkg.subject,
        hours: pkg.hours,
        price: parseFloat(pkg.priceDollars || 0),
        discount: pkg.discountType === "fixed" 
          ? parseFloat(pkg.discountValueDollars || 0)
          : pkg.discountPercent || 0,
        discountType: pkg.discountType === "percent" ? "percentage" : pkg.discountType || "fixed",
        tierEligibility: pkg.eligibleTiers || [],
        validity: pkg.validityMonths || 6,
        refundable: pkg.refundable || false,
        description: pkg.description || "",
        active: pkg.isActive !== false,
        studentsEnrolled: 0, // TODO: Calculate from actual enrollments
        autoRenewal: pkg.autoRenew || false,
        renewalPeriod: 3, // TODO: Add to backend model
        createdAt: pkg.createdAt,
        lastModified: pkg.updatedAt,
        totalRevenue: 0, // TODO: Calculate from actual sales
      })) || [];

      // Transform students data
      const transformedStudents = studentsResponse.data?.map(student => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        phone: student.phone || "",
        yearLevel: "Year 12", // TODO: Get from student profile
        subjects: [], // TODO: Get from student profile
        status: student.status || "active",
        joinDate: student.createdAt,
      })) || [];

      // Mock student packages data for now - TODO: Implement real student package tracking
      const mockStudentPackages = [];

      setPackages(transformedPackages);
      setStudents(transformedStudents);
      setStudentPackages(mockStudentPackages);
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback to empty arrays on error
      setPackages([]);
      setStudents([]);
      setStudentPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = () => {
    setEditingPackage(null);
    setNewPackage({
      name: "",
      subject: "",
      hours: "",
      price: "",
      discount: "",
      discountType: "fixed",
      tierEligibility: [],
      validity: "6",
      refundable: true,
      description: "",
      autoRenewal: false,
      renewalPeriod: "3",
    });
    setShowCreateModal(true);
  };

  const handleAssignPackage = (packageData) => {
    setAssignmentData({
      studentId: "",
      packageId: packageData.id,
      paymentMethod: "card",
      paymentStatus: PAYMENT_STATUS.PENDING,
      notes: "",
    });
    setStudentSearchTerm("");
    setShowStudentDropdown(false);
    setShowAssignModal(true);
  };

  const handleViewPackageDetails = (packageData) => {
    setSelectedPackage(packageData);
    setShowPackageDetailsModal(true);
  };

  const handleProcessPayment = (studentPackageId) => {
    const studentPackage = studentPackages.find(
      (sp) => sp.id === studentPackageId
    );
    if (studentPackage) {
      setAssignmentData({
        studentId: studentPackage.studentId,
        packageId: studentPackage.packageId,
        paymentMethod: "card",
        paymentStatus: PAYMENT_STATUS.PENDING,
        notes: "",
      });
      setShowPaymentModal(true);
    }
  };

  const handleToggleAutoRenewal = (studentPackageId) => {
    setStudentPackages((prev) =>
      prev.map((sp) =>
        sp.id === studentPackageId
          ? { ...sp, autoRenewal: !sp.autoRenewal }
          : sp
      )
    );
  };

  const handleRetirePackage = async (packageId) => {
    const packageToDelete = packages.find((pkg) => pkg.id === packageId);
    const enrolledStudents = packageToDelete
      ? packageToDelete.studentsEnrolled
      : 0;

    let confirmMessage = "Are you sure you want to retire this package?";
    if (enrolledStudents > 0) {
      confirmMessage += ` This package has ${enrolledStudents} enrolled student(s). It will be marked as inactive but existing enrollments will continue.`;
    } else {
      confirmMessage += " This will make it unavailable for new enrollments.";
    }

    if (window.confirm(confirmMessage)) {
      try {
        const response = await adminService.retirePackage(packageId);
        
        if (response.success) {
          // Update local state to mark as inactive
          setPackages((prev) => 
            prev.map((pkg) => 
              pkg.id === packageId ? { ...pkg, active: false } : pkg
            )
          );
          alert("Package retired successfully!");
        } else {
          alert("Error retiring package: " + (response.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error retiring package:", error);
        alert("Error retiring package: " + error.message);
      }
    }
  };

  const handleRenewPackage = (studentPackageId) => {
    const studentPackage = studentPackages.find(
      (sp) => sp.id === studentPackageId
    );
    if (studentPackage) {
      const packageData = packages.find(
        (pkg) => pkg.id === studentPackage.packageId
      );
      if (packageData) {
        const newExpiryDate = new Date(studentPackage.expiryDate);
        newExpiryDate.setMonth(newExpiryDate.getMonth() + packageData.validity);

        setStudentPackages((prev) =>
          prev.map((sp) =>
            sp.id === studentPackageId
              ? {
                  ...sp,
                  expiryDate: newExpiryDate.toISOString().split("T")[0],
                  hoursRemaining: packageData.hours,
                  hoursUsed: 0,
                  status: "active",
                  progress: 0,
                  renewalDate: newExpiryDate.toISOString().split("T")[0],
                }
              : sp
          )
        );
      }
    }
  };

  const handleEditPackage = (packageData) => {
    setEditingPackage(packageData);
    setNewPackage({
      name: packageData.name,
      subject: packageData.subject,
      hours: packageData.hours.toString(),
      price: packageData.price.toString(),
      discount: packageData.discount.toString(),
      tierEligibility: packageData.tierEligibility,
      validity: packageData.validity.toString(),
      refundable: packageData.refundable,
      description: packageData.description,
    });
    setShowCreateModal(true);
  };

  const handleSavePackage = async () => {
    try {
      // Prepare package data for API
      const packageData = {
        name: newPackage.name,
        subject: newPackage.subject,
        hours: parseInt(newPackage.hours),
        priceDollars: parseFloat(newPackage.price),
        discountType: newPackage.discountType === "percentage" ? "percent" : "fixed",
        validityMonths: parseInt(newPackage.validity),
        eligibleTiers: newPackage.tierEligibility,
        refundable: newPackage.refundable,
        autoRenew: newPackage.autoRenewal,
        description: newPackage.description,
        isActive: true,
      };

      // Add discount value based on type
      if (newPackage.discountType === "percentage") {
        packageData.discountPercent = parseInt(newPackage.discount) || 0;
      } else {
        packageData.discountValueDollars = parseFloat(newPackage.discount) || 0;
      }

      let response;
      if (editingPackage) {
        // Update existing package
        response = await adminService.updatePackage(editingPackage.id, packageData);
      } else {
        // Create new package
        response = await adminService.createPackage(packageData);
      }

      if (response.success) {
        // Reload packages data
        await loadData();
        setShowCreateModal(false);
        alert(editingPackage ? "Package updated successfully!" : "Package created successfully!");
      } else {
        alert("Error saving package: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Error saving package: " + error.message);
    }
  };

  const handleToggleActive = async (packageId) => {
    try {
      const pkg = packages.find(p => p.id === packageId);
      if (!pkg) return;

      const response = await adminService.updatePackage(packageId, {
        isActive: !pkg.active
      });

      if (response.success) {
        // Update local state
        setPackages((prev) =>
          prev.map((p) =>
            p.id === packageId ? { ...p, active: !p.active } : p
          )
        );
      } else {
        alert("Error updating package status: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error toggling package status:", error);
      alert("Error updating package status: " + error.message);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || pkg.subject === filterSubject;
    const matchesStatus =
      !filterStatus || (filterStatus === "active" ? pkg.active : !pkg.active);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const getPackageStudents = (packageId) => {
    return studentPackages.filter((sp) => sp.packageId === packageId);
  };

  const getStudentPackages = (studentId) => {
    return studentPackages.filter((sp) => sp.studentId === studentId);
  };

  const getExpiringPackages = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return studentPackages.filter((sp) => {
      const expiryDate = new Date(sp.expiryDate);
      return expiryDate <= thirtyDaysFromNow && sp.status === "active";
    });
  };

  const getLowUsagePackages = () => {
    return studentPackages.filter((sp) => {
      const usagePercentage = (sp.hoursUsed / sp.totalHours) * 100;
      return usagePercentage < 25 && sp.status === "active";
    });
  };

  const formatCurrency = (amount) => {
    // Handle NaN, null, undefined, or non-numeric values
    if (isNaN(amount) || amount === null || amount === undefined) {
      return "$0.00";
    }

    // Ensure amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return "$0.00";
    }

    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(numericAmount);
  };

  const calculateFinalPrice = (price, discount, discountType) => {
    if (discountType === "percentage") {
      return price * (1 - discount / 100);
    }
    return Math.max(0, price - discount);
  };

  const getPackageStats = () => {
    const totalPackages = packages.length;
    const activePackages = packages.filter((pkg) => pkg.active).length;
    const totalStudents = studentPackages.length;
    const activeStudents = studentPackages.filter(
      (sp) => sp.status === "active"
    ).length;
    const expiringSoon = getExpiringPackages().length;
    const lowUsage = getLowUsagePackages().length;

    // Calculate total revenue safely
    const totalRevenue = packages.reduce((sum, pkg) => {
      const revenue = parseFloat(pkg.totalRevenue) || 0;
      return sum + revenue;
    }, 0);

    return {
      totalPackages,
      activePackages,
      totalStudents,
      activeStudents,
      expiringSoon,
      lowUsage,
      totalRevenue,
    };
  };

  // Student search functionality
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const handleStudentSelect = (student) => {
    setAssignmentData((prev) => ({
      ...prev,
      studentId: student.id,
    }));
    setStudentSearchTerm(student.name);
    setShowStudentDropdown(false);
  };

  const handleStudentSearchChange = (e) => {
    setStudentSearchTerm(e.target.value);
    setShowStudentDropdown(true);
  };

  if (isLoading) {
    return (
      <div className="admin-packages-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading packages...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-packages-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="admin-packages-content">
              {/* Header */}
              <div className="admin-packages-header">
                <div className="admin-packages-title-section">
                  <h2 className="admin-packages-title">Package Management</h2>
                  <p className="admin-packages-subtitle text-muted">
                    Create, manage, and assign tutoring packages with
                    comprehensive tracking
                  </p>
                </div>
                <div className="admin-packages-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleCreatePackage}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Create Package
                  </button>
                </div>
              </div>

              {/* Package Statistics */}
              <div className="admin-packages-stats mb-4">
                <div className="row">
                  <div className="col-md-2">
                    <div className="stat-card">
                      <div className="stat-number">
                        {getPackageStats().totalPackages}
                      </div>
                      <div className="stat-label">Total Packages</div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="stat-card">
                      <div className="stat-number">
                        {getPackageStats().activePackages}
                      </div>
                      <div className="stat-label">Active Packages</div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="stat-card">
                      <div className="stat-number">
                        {getPackageStats().activeStudents}
                      </div>
                      <div className="stat-label">Active Students</div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="stat-card">
                      <div className="stat-number">
                        {getPackageStats().expiringSoon}
                      </div>
                      <div className="stat-label">Expiring Soon</div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="stat-card">
                      <div className="stat-number">
                        {getPackageStats().lowUsage}
                      </div>
                      <div className="stat-label">Low Usage</div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="stat-card">
                      <div className="stat-number">
                        {formatCurrency(getPackageStats().totalRevenue)}
                      </div>
                      <div className="stat-label">Total Revenue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="admin-packages-controls mb-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="admin-search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                    >
                      <option value="">All Subjects</option>
                      {uniqueSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterSubject("");
                        setFilterStatus("");
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Packages Table */}
              <div className="admin-packages-table-section">
                {filteredPackages.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="fas fa-box text-muted mb-3"></i>
                    <h5>No packages found</h5>
                    <p className="text-muted">
                      Create your first tutoring package to get started
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreatePackage}
                    >
                      Create Package
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table admin-packages-table">
                      <thead>
                        <tr>
                          <th>Package Details</th>
                          <th>Pricing</th>
                          <th>Eligibility</th>
                          <th>Students</th>
                          <th>Revenue</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPackages.map((pkg) => {
                          const packageStudents = getPackageStudents(pkg.id);
                          const finalPrice = calculateFinalPrice(
                            pkg.price,
                            pkg.discount,
                            pkg.discountType
                          );
                          const expiringStudents = packageStudents.filter(
                            (sp) => {
                              const expiryDate = new Date(sp.expiryDate);
                              const thirtyDaysFromNow = new Date();
                              thirtyDaysFromNow.setDate(
                                thirtyDaysFromNow.getDate() + 30
                              );
                              return (
                                expiryDate <= thirtyDaysFromNow &&
                                sp.status === "active"
                              );
                            }
                          ).length;

                          return (
                            <tr key={pkg.id}>
                              <td>
                                <div className="package-info">
                                  <div className="package-name">
                                    <strong>{pkg.name}</strong>
                                    <span className="badge bg-info ms-2">
                                      {pkg.subject}
                                    </span>
                                  </div>
                                  <div className="package-details">
                                    <small className="text-muted">
                                      {pkg.hours}h • {pkg.validity} months
                                      validity
                                    </small>
                                    <br />
                                    <small className="text-muted">
                                      {pkg.description}
                                    </small>
                                  </div>
                                  {pkg.autoRenewal && (
                                    <div className="auto-renewal-badge">
                                      <span className="badge bg-success">
                                        <i className="fas fa-sync me-1"></i>Auto
                                        Renewal
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="pricing-info">
                                  <div className="original-price">
                                    {formatCurrency(pkg.price)}
                                  </div>
                                  {pkg.discount > 0 && (
                                    <div className="discount-info">
                                      <span className="discount-amount text-success">
                                        -
                                        {pkg.discountType === "percentage"
                                          ? `${pkg.discount}%`
                                          : formatCurrency(pkg.discount)}
                                      </span>
                                      <div className="final-price">
                                        <strong>
                                          {formatCurrency(finalPrice)}
                                        </strong>
                                      </div>
                                    </div>
                                  )}
                                  {pkg.refundable && (
                                    <small className="text-info">
                                      <i className="fas fa-undo me-1"></i>
                                      Refundable
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="tier-eligibility">
                                  {pkg.tierEligibility.map((tier, index) => (
                                    <span
                                      key={index}
                                      className={`badge bg-secondary me-1 mb-1`}
                                    >
                                      {TUTOR_TIER_LABELS[tier] || tier}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <div className="student-stats">
                                  <div className="student-count">
                                    <strong>{pkg.studentsEnrolled}</strong>{" "}
                                    enrolled
                                  </div>
                                  {expiringStudents > 0 && (
                                    <div className="expiring-warning">
                                      <small className="text-warning">
                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                        {expiringStudents} expiring soon
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="revenue-info">
                                  <div className="total-revenue">
                                    {formatCurrency(pkg.totalRevenue)}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="status-actions">
                                  <button
                                    className={`btn btn-sm ${
                                      pkg.active
                                        ? "btn-success"
                                        : "btn-secondary"
                                    }`}
                                    onClick={() => handleToggleActive(pkg.id)}
                                  >
                                    {pkg.active ? "Active" : "Inactive"}
                                  </button>
                                </div>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="btn btn-sm btn-outline-danger me-1"
                                    onClick={() => handleRetirePackage(pkg.id)}
                                    title="Delete Package"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => handleEditPackage(pkg)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-info me-1"
                                    onClick={() =>
                                      handleViewPackageDetails(pkg)
                                    }
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleAssignPackage(pkg)}
                                  >
                                    <i className="fas fa-user-plus"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Package Modal */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Package Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newPackage.name}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., 10 Hour Chemistry Package"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-select"
                      value={newPackage.subject}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Subject</option>
                      {uniqueSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Hours</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newPackage.hours}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          hours: e.target.value,
                        }))
                      }
                      placeholder="10"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Price (AUD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={newPackage.price}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="750.00"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-select"
                      value={newPackage.discountType}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          discountType: e.target.value,
                        }))
                      }
                    >
                      <option value="fixed">Fixed Amount (AUD)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      Discount{" "}
                      {newPackage.discountType === "percentage"
                        ? "(%)"
                        : "(AUD)"}
                    </label>
                    <input
                      type="number"
                      step={
                        newPackage.discountType === "percentage" ? "1" : "0.01"
                      }
                      className="form-control"
                      value={newPackage.discount}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                      placeholder={
                        newPackage.discountType === "percentage"
                          ? "10"
                          : "50.00"
                      }
                      max={
                        newPackage.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newPackage.description}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Package description..."
                    ></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Validity (Months)</label>
                    <select
                      className="form-select"
                      value={newPackage.validity}
                      onChange={(e) =>
                        setNewPackage((prev) => ({
                          ...prev,
                          validity: e.target.value,
                        }))
                      }
                    >
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tier Eligibility</label>
                    <div className="tier-selection">
                      {Object.entries(TUTOR_TIERS).map(([key, value]) => (
                        <div
                          key={value}
                          className="form-check form-check-inline"
                        >
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`tier-${value}`}
                            checked={newPackage.tierEligibility.includes(value)}
                            onChange={(e) => {
                              const updatedTiers = e.target.checked
                                ? [...newPackage.tierEligibility, value]
                                : newPackage.tierEligibility.filter(
                                    (tier) => tier !== value
                                  );
                              setNewPackage((prev) => ({
                                ...prev,
                                tierEligibility: updatedTiers,
                              }));
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`tier-${value}`}
                          >
                            {TUTOR_TIER_LABELS[value]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Refundable</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newPackage.refundable}
                        onChange={(e) =>
                          setNewPackage((prev) => ({
                            ...prev,
                            refundable: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">
                        Allow refunds for this package
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Auto Renewal</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newPackage.autoRenewal}
                        onChange={(e) =>
                          setNewPackage((prev) => ({
                            ...prev,
                            autoRenewal: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">
                        Enable auto-renewal for students
                      </label>
                    </div>
                  </div>
                  {newPackage.autoRenewal && (
                    <div className="col-md-6">
                      <label className="form-label">
                        Renewal Period (Months)
                      </label>
                      <select
                        className="form-select"
                        value={newPackage.renewalPeriod}
                        onChange={(e) =>
                          setNewPackage((prev) => ({
                            ...prev,
                            renewalPeriod: e.target.value,
                          }))
                        }
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSavePackage}
                  disabled={
                    !newPackage.name ||
                    !newPackage.subject ||
                    !newPackage.hours ||
                    !newPackage.price
                  }
                >
                  {editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showPackageDetailsModal && selectedPackage && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-box-open me-2"></i>
                  Package Details - {selectedPackage.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPackageDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="package-details-section">
                      <h6>Package Information</h6>
                      <div className="detail-item">
                        <strong>Name:</strong> {selectedPackage.name}
                      </div>
                      <div className="detail-item">
                        <strong>Subject:</strong> {selectedPackage.subject}
                      </div>
                      <div className="detail-item">
                        <strong>Hours:</strong> {selectedPackage.hours}
                      </div>
                      <div className="detail-item">
                        <strong>Validity:</strong> {selectedPackage.validity}{" "}
                        months
                      </div>
                      <div className="detail-item">
                        <strong>Description:</strong>{" "}
                        {selectedPackage.description}
                      </div>
                      <div className="detail-item">
                        <strong>Refundable:</strong>
                        <span
                          className={`badge bg-${
                            selectedPackage.refundable ? "success" : "danger"
                          } ms-2`}
                        >
                          {selectedPackage.refundable ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Auto Renewal:</strong>
                        <span
                          className={`badge bg-${
                            selectedPackage.autoRenewal
                              ? "success"
                              : "secondary"
                          } ms-2`}
                        >
                          {selectedPackage.autoRenewal ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="package-pricing-section">
                      <h6>Pricing & Revenue</h6>
                      <div className="detail-item">
                        <strong>Original Price:</strong>{" "}
                        {formatCurrency(selectedPackage.price)}
                      </div>
                      <div className="detail-item">
                        <strong>Discount:</strong>
                        {selectedPackage.discount > 0 ? (
                          <span className="text-success">
                            -
                            {selectedPackage.discountType === "percentage"
                              ? `${selectedPackage.discount}%`
                              : formatCurrency(selectedPackage.discount)}
                          </span>
                        ) : (
                          "No discount"
                        )}
                      </div>
                      <div className="detail-item">
                        <strong>Final Price:</strong>
                        <span className="text-primary">
                          {formatCurrency(
                            calculateFinalPrice(
                              selectedPackage.price,
                              selectedPackage.discount,
                              selectedPackage.discountType
                            )
                          )}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Total Revenue:</strong>{" "}
                        {formatCurrency(selectedPackage.totalRevenue)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12">
                    <h6>Student Enrollments</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Purchase Date</th>
                            <th>Expiry Date</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Auto Renewal</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPackageStudents(selectedPackage.id).map((sp) => (
                            <tr key={sp.id}>
                              <td>{sp.studentName}</td>
                              <td>{sp.purchaseDate}</td>
                              <td>{sp.expiryDate}</td>
                              <td>
                                <div
                                  className="progress"
                                  style={{ width: "100px", height: "20px" }}
                                >
                                  <div
                                    className="progress-bar"
                                    style={{ width: `${sp.progress}%` }}
                                  >
                                    {sp.progress}%
                                  </div>
                                </div>
                                <small className="text-muted">
                                  {sp.hoursUsed}/{sp.totalHours} hours
                                </small>
                              </td>
                              <td>
                                <span
                                  className={`badge bg-${
                                    sp.status === "active"
                                      ? "success"
                                      : "secondary"
                                  }`}
                                >
                                  {sp.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className={`btn btn-sm ${
                                    sp.autoRenewal
                                      ? "btn-success"
                                      : "btn-outline-secondary"
                                  }`}
                                  onClick={() => handleToggleAutoRenewal(sp.id)}
                                >
                                  <i
                                    className={`fas fa-${
                                      sp.autoRenewal ? "check" : "times"
                                    }`}
                                  ></i>
                                </button>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleRenewPackage(sp.id)}
                                >
                                  <i className="fas fa-sync"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPackageDetailsModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowPackageDetailsModal(false);
                    handleEditPackage(selectedPackage);
                  }}
                >
                  Edit Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Package Modal */}
      {showAssignModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Package to Student</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Select Student</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search for a student..."
                        value={studentSearchTerm}
                        onChange={handleStudentSearchChange}
                        onFocus={() => setShowStudentDropdown(true)}
                        onBlur={() =>
                          setTimeout(() => setShowStudentDropdown(false), 200)
                        }
                      />
                      {showStudentDropdown && (
                        <div
                          className="dropdown-menu show w-100"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                className="dropdown-item"
                                onClick={() => handleStudentSelect(student)}
                              >
                                <div>
                                  <strong>{student.name}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {student.email}
                                  </small>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="dropdown-item text-muted">
                              No students found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Package</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        packages.find(
                          (pkg) => pkg.id === assignmentData.packageId
                        )?.name || ""
                      }
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={assignmentData.paymentMethod}
                      onChange={(e) =>
                        setAssignmentData((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                    >
                      <option value="card">Credit Card</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Payment Status</label>
                    <select
                      className="form-select"
                      value={assignmentData.paymentStatus}
                      onChange={(e) =>
                        setAssignmentData((prev) => ({
                          ...prev,
                          paymentStatus: e.target.value,
                        }))
                      }
                    >
                      <option value={PAYMENT_STATUS.PENDING}>Pending</option>
                      <option value={PAYMENT_STATUS.COMPLETED}>
                        Completed
                      </option>
                      <option value={PAYMENT_STATUS.FAILED}>Failed</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={assignmentData.notes}
                      onChange={(e) =>
                        setAssignmentData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Additional notes about this assignment..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    // Handle package assignment logic
                    const packageData = packages.find(
                      (pkg) => pkg.id === assignmentData.packageId
                    );
                    const studentData = students.find(
                      (student) =>
                        student.id === parseInt(assignmentData.studentId)
                    );

                    if (packageData && studentData) {
                      const newStudentPackage = {
                        id: Date.now(),
                        studentId: parseInt(assignmentData.studentId),
                        packageId: assignmentData.packageId,
                        studentName: studentData.name,
                        packageName: packageData.name,
                        purchaseDate: new Date().toISOString().split("T")[0],
                        expiryDate: new Date(
                          Date.now() +
                            packageData.validity * 30 * 24 * 60 * 60 * 1000
                        )
                          .toISOString()
                          .split("T")[0],
                        hoursRemaining: packageData.hours,
                        hoursUsed: 0,
                        totalHours: packageData.hours,
                        paymentStatus: assignmentData.paymentStatus,
                        paymentAmount: calculateFinalPrice(
                          packageData.price,
                          packageData.discount,
                          packageData.discountType
                        ),
                        paymentDate: new Date().toISOString().split("T")[0],
                        autoRenewal: packageData.autoRenewal,
                        renewalDate: null,
                        status: "active",
                        progress: 0,
                      };

                      setStudentPackages((prev) => [
                        ...prev,
                        newStudentPackage,
                      ]);
                      setPackages((prev) =>
                        prev.map((pkg) =>
                          pkg.id === assignmentData.packageId
                            ? {
                                ...pkg,
                                studentsEnrolled: pkg.studentsEnrolled + 1,
                              }
                            : pkg
                        )
                      );
                    }

                    setShowAssignModal(false);
                  }}
                  disabled={!assignmentData.studentId}
                >
                  Assign Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPackages;
