import React, { useState, useEffect } from "react";
import { getProfileDiff } from "../../../../services/adminService";

const ProfileDiffView = ({ changeRequest }) => {
    const [diff, setDiff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (changeRequest && changeRequest.type === "profile_update") {
            fetchDiff();
        }
    }, [changeRequest]);

    const fetchDiff = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProfileDiff(changeRequest.id);

            if (response.success) {
                setDiff(response.data);
            } else {
                setError("Failed to load diff");
            }
        } catch (err) {
            console.error("Error fetching profile diff:", err);
            setError("Failed to load diff");
        } finally {
            setLoading(false);
        }
    };

    if (!changeRequest || changeRequest.type !== "profile_update") {
        return null;
    }

    const formatValue = (value) => {
        if (value === null || value === undefined) {
            return <span className="text-muted">(empty)</span>;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return <span className="text-muted">(empty array)</span>;
            }
            return (
                <div>
                    {value.map((item, idx) => (
                        <span key={idx} className="badge bg-secondary me-1 mb-1">
                            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                        </span>
                    ))}
                </div>
            );
        }

        if (typeof value === 'object') {
            return <pre className="mb-0">{JSON.stringify(value, null, 2)}</pre>;
        }

        return <span>{String(value)}</span>;
    };

    const formatFieldName = (fieldName) => {
        return fieldName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    return (
        <div className="profile-diff-view mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">
                    <i className="fas fa-exchange-alt me-2"></i>
                    Profile Changes
                </h6>
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setExpanded(!expanded)}
                >
                    <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
                    {expanded ? ' Hide' : ' Show'} Details
                </button>
            </div>

            {expanded && (
                <>
                    {/* Tutor's Description */}
                    {diff?.changeDescription && (
                        <div className="alert alert-info mb-3">
                            <strong>Tutor's Description:</strong>
                            <p className="mb-0 mt-1">{diff.changeDescription}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="small text-muted mt-2">Loading changes...</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    )}

                    {!loading && !error && diff?.diff && (
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '20%' }}>Field</th>
                                        <th style={{ width: '40%' }} className="text-danger">Current Value</th>
                                        <th style={{ width: '40%' }} className="text-success">Proposed Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(diff.diff).map(([field, values]) => (
                                        <tr key={field} className={values.changed ? 'table-warning' : ''}>
                                            <td>
                                                <strong>{formatFieldName(field)}</strong>
                                                {values.changed && (
                                                    <i className="fas fa-edit text-warning ms-2" title="Modified"></i>
                                                )}
                                            </td>
                                            <td className="text-muted">
                                                {formatValue(values.old)}
                                            </td>
                                            <td>
                                                <strong>{formatValue(values.new)}</strong>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && diff?.diff && Object.keys(diff.diff).length === 0 && (
                        <div className="text-center text-muted py-3">
                            <i className="fas fa-info-circle me-2"></i>
                            No changes detected
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfileDiffView;
