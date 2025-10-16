import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import tutorService from '../services/tutorService';

const TutorChangeRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    type: '',
    oldValue: '',
    newValue: '',
    customType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common change request types
  const changeTypes = [
    { value: 'phone_number', label: 'Phone Number' },
    { value: 'bio', label: 'Bio/Description' },
    { value: 'hourly_rate', label: 'Hourly Rate' },
    { value: 'university', label: 'University' },
    { value: 'current_studies', label: 'Current Studies' },
    { value: 'subjects', label: 'Subjects' },
    { value: 'locations', label: 'Available Locations' },
    { value: 'preferred_locations', label: 'Preferred Locations' },
    { value: 'schools_attended', label: 'Schools Attended' },
    { value: 'custom', label: 'Other (specify)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Determine the final type value
      const finalType = formData.type === 'custom' ? formData.customType : formData.type;
      
      // Validation
      if (!finalType.trim()) {
        throw new Error('Please select or specify a change type');
      }
      if (!formData.newValue.trim()) {
        throw new Error('Please provide the new value you want to change to');
      }

      const requestData = {
        type: finalType.trim(),
        oldValue: formData.oldValue.trim() || null,
        newValue: formData.newValue.trim()
      };

      const response = await tutorService.submitChangeRequest(requestData);

      if (response.success) {
        setSuccess('Your change request has been submitted successfully! It will be reviewed by an administrator.');
        setFormData({
          type: '',
          oldValue: '',
          newValue: '',
          customType: ''
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response.error || 'Failed to submit change request');
      }
    } catch (err) {
      console.error('Error submitting change request:', err);
      setError(err.message || 'An error occurred while submitting your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Request Profile Change</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>What would you like to change?</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a field to change...</option>
                  {changeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {formData.type === 'custom' && (
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Specify the field you want to change</Form.Label>
                  <Form.Control
                    type="text"
                    name="customType"
                    value={formData.customType}
                    onChange={handleInputChange}
                    placeholder="e.g., Emergency contact, Teaching experience"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Current Value (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="oldValue"
                  value={formData.oldValue}
                  onChange={handleInputChange}
                  placeholder="What is the current value? (if applicable)"
                />
                <Form.Text className="text-muted">
                  This helps administrators understand what you're changing from.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>New Value <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="newValue"
                  value={formData.newValue}
                  onChange={handleInputChange}
                  placeholder="What do you want to change it to?"
                  required
                />
                <Form.Text className="text-muted">
                  Provide the exact new value you want this field to have.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || !formData.type || !formData.newValue.trim()}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline-secondary"
              onClick={() => {
                setFormData({
                  type: '',
                  oldValue: '',
                  newValue: '',
                  customType: ''
                });
                setError('');
                setSuccess('');
              }}
            >
              Clear Form
            </Button>
          </div>
        </Form>

        <div className="mt-4">
          <h6>📋 Important Notes:</h6>
          <ul className="small text-muted">
            <li>All change requests require administrator approval</li>
            <li>You'll receive a notification once your request is reviewed</li>
            <li>Processing typically takes 1-2 business days</li>
            <li>For urgent changes, please contact support directly</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TutorChangeRequestForm;