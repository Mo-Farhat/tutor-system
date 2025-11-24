// FILE: src/controllers/profileChangeRequestController.js
const tutorService = require('../services/tutorService');
const tutorProfileModel = require('../models/tutorProfileModel');
const tutorChangeRequestModel = require('../models/tutorChangeRequestModel');

class ProfileChangeRequestController {
    /**
     * Submit entire profile for review
     * POST /api/tutor/profile/submit-changes
     */
    async submitProfileChanges(req, res) {
        try {
            const userId = req.user.id;
            const { profileData, changeDescription } = req.body;

            // Validate required data
            if (!profileData) {
                return res.status(400).json({
                    success: false,
                    error: 'Profile data is required'
                });
            }

            // Check for existing pending changes
            const existingPending = await tutorChangeRequestModel.listByTutor(userId);
            const hasPending = existingPending.some(
                req => req.type === 'profile_update' && req.status === 'pending'
            );

            if (hasPending) {
                return res.status(400).json({
                    success: false,
                    error: 'You already have pending profile changes awaiting review'
                });
            }

            // Get current profile as "oldValue"
            const currentProfile = await tutorProfileModel.findByUserId(userId);

            if (!currentProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Profile not found'
                });
            }

            // Create sanitized snapshots (remove user object and metadata)
            const oldSnapshot = {
                bio: currentProfile.bio,
                hourly_rate: currentProfile.hourly_rate,
                university: currentProfile.university,
                current_studies: currentProfile.current_studies,
                subjects_selected: currentProfile.subjects_selected,
                preferred_locations: currentProfile.preferred_locations,
                schools_attended: currentProfile.schools_attended,
                phone_number: currentProfile.phone_number,
            };

            const newSnapshot = {
                bio: profileData.bio,
                hourly_rate: profileData.hourly_rate,
                university: profileData.university,
                current_studies: profileData.current_studies,
                subjects_selected: profileData.subjects_selected,
                preferred_locations: profileData.preferred_locations,
                schools_attended: profileData.schools_attended,
                phone_number: profileData.phone_number,
            };

            // Create change request with snapshots
            const changeRequest = await tutorChangeRequestModel.create(
                userId,
                'profile_update',
                JSON.stringify(oldSnapshot),
                JSON.stringify(newSnapshot)
            );

            // Add change description if provided
            if (changeDescription) {
                await tutorChangeRequestModel.updateDescription(
                    changeRequest.id,
                    changeDescription
                );
            }

            res.json({
                success: true,
                data: changeRequest,
                message: 'Profile changes submitted for review'
            });
        } catch (error) {
            console.error('Error submitting profile changes:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit profile changes'
            });
        }
    }

    /**
     * Get pending profile changes for logged-in tutor
     * GET /api/tutor/profile/pending-changes
     */
    async getPendingProfileChanges(req, res) {
        try {
            const userId = req.user.id;
            const allRequests = await tutorChangeRequestModel.listByTutor(userId);

            const pending = allRequests.filter(
                req => req.type === 'profile_update' && req.status === 'pending'
            );

            res.json({
                success: true,
                data: pending
            });
        } catch (error) {
            console.error('Error fetching pending changes:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch pending changes'
            });
        }
    }

    /**
     * Get diff between current and proposed changes
     * GET /api/tutor/profile/change-diff/:changeRequestId
     */
    async getProfileDiff(req, res) {
        try {
            const { changeRequestId } = req.params;
            const userId = req.user.id;

            const changeRequest = await tutorChangeRequestModel.findById(
                Number(changeRequestId)
            );

            if (!changeRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Change request not found'
                });
            }

            // Verify ownership (unless admin)
            if (changeRequest.tutorId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }

            const oldProfile = JSON.parse(changeRequest.oldValue || '{}');
            const newProfile = JSON.parse(changeRequest.newValue || '{}');

            // Generate diff object showing what changed
            const diff = this.generateDiff(oldProfile, newProfile);

            res.json({
                success: true,
                data: {
                    diff,
                    changeDescription: changeRequest.changeDescription,
                    status: changeRequest.status,
                    createdAt: changeRequest.createdAt,
                    reviewedAt: changeRequest.reviewedAt,
                    comments: changeRequest.comments
                }
            });
        } catch (error) {
            console.error('Error fetching profile diff:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch profile diff'
            });
        }
    }

    /**
     * Helper function to generate diff between old and new profile
     */
    generateDiff(oldProfile, newProfile) {
        const diff = {};
        const allKeys = new Set([
            ...Object.keys(oldProfile),
            ...Object.keys(newProfile)
        ]);

        for (const key of allKeys) {
            const oldVal = oldProfile[key];
            const newVal = newProfile[key];

            // Deep comparison for arrays and objects
            const oldStr = JSON.stringify(oldVal);
            const newStr = JSON.stringify(newVal);

            if (oldStr !== newStr) {
                diff[key] = {
                    old: oldVal,
                    new: newVal,
                    changed: true
                };
            }
        }

        return diff;
    }
}

module.exports = new ProfileChangeRequestController();
