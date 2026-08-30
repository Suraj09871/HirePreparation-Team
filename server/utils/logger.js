const ActivityLog = require('../models/ActivityLog');

/**
 * Persists user and system activities to MongoDB for Admin Activity Log monitoring
 * @param {string|ObjectId} userId - User ID performing the action
 * @param {string} action - Action category identifier (e.g. 'login', 'apply', 'job_create')
 * @param {string} details - Human-readable action details
 * @param {Object} metadata - Optional additional action payload
 */
const logActivity = async (userId, action, details = '', metadata = {}) => {
    try {
        if (!userId) return;
        await new ActivityLog({
            userId,
            action,
            details,
            metadata
        }).save();
    } catch (err) {
        console.error('⚠️ Activity logging error:', err.message);
    }
};

module.exports = { logActivity };
