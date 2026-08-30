const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, roleCheck } = require('../middleware/auth');

// GET /api/companies/my-company - Get recruiter's company details & hiring process
router.get('/my-company', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        let company = null;
        if (user.companyId) {
            company = await Company.findById(user.companyId);
        }
        if (!company) {
            company = await Company.findOne({ 
                $or: [{ submittedBy: user._id }, { recruiterId: user._id }]
            });
        }

        if (!company) {
            // Return empty company template for recruiter to fill in and submit
            company = {
                name: '',
                website: '',
                domain: 'product',
                industry: 'Technology',
                size: 'startup',
                headquarter: '',
                address: '',
                foundedYear: null,
                employeeCount: '',
                description: '',
                hrName: user.name || '',
                hrEmail: user.email || '',
                hrPhone: '',
                companyEmail: '',
                registrationNumber: '',
                linkedIn: '',
                verificationStatus: 'no_company',
                isVerified: false,
                hiringProcess: [
                    { roundNumber: 1, roundName: 'Online Aptitude & Coding Assessment', roundType: 'online_assessment', description: 'MCQs on DSA, Quantitative Aptitude & 2 Coding Questions', durationMinutes: 60, cutoffScore: '70%', mode: 'online' },
                    { roundNumber: 2, roundName: 'Technical Interview 1', roundType: 'technical_interview', description: 'Core CS subjects, Data Structures, Algorithms and Project Discussion', durationMinutes: 45, cutoffScore: 'Pass', mode: 'online' },
                    { roundNumber: 3, roundName: 'HR & Managerial Discussion', roundType: 'hr_discussion', description: 'Behavioral assessment, culture fit, and salary discussion', durationMinutes: 30, cutoffScore: 'Fit', mode: 'online' }
                ],
                hiringCriteria: {
                    minCgpa: 6.5,
                    allowedBacklogs: 0,
                    eligibleDegrees: ['B.Tech', 'B.E.', 'MCA', 'M.Tech'],
                    eligibleBranches: ['CSE', 'IT', 'ECE', 'All eligible'],
                    keyFocusSkills: ['Problem Solving', 'Data Structures', 'Communication'],
                    experienceRange: '0-2 Years'
                }
            };
        }

        res.json({
            success: true,
            company
        });
    } catch (err) {
        console.error('Error fetching company:', err);
        res.status(500).json({ success: false, message: 'Failed to load company profile: ' + err.message });
    }
});

// PUT /api/companies/my-company - Update recruiter's company, HR contact & hiring process rounds
router.put('/my-company', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        let company = null;
        if (user.companyId) {
            company = await Company.findById(user.companyId);
        }
        if (!company) {
            company = await Company.findOne({ 
                $or: [{ submittedBy: user._id }, { recruiterId: user._id }]
            });
        }

        if (!company) {
            company = new Company({ submittedBy: user._id });
        }

        const {
            name, website, description, logo, domain, industry, size,
            headquarter, address, foundedYear, employeeCount,
            hrName, hrEmail, hrPhone, companyEmail, registrationNumber, linkedIn,
            hiringProcess, hiringCriteria
        } = req.body;

        if (name) company.name = name.trim();
        if (website !== undefined) company.website = website.trim();
        if (description !== undefined) company.description = description.trim();
        if (logo !== undefined) company.logo = logo.trim();
        if (domain) company.domain = domain;
        if (industry) company.industry = industry;
        if (size) company.size = size;
        if (headquarter !== undefined) company.headquarter = headquarter.trim();
        if (address !== undefined) company.address = address.trim();
        if (foundedYear !== undefined) company.foundedYear = foundedYear ? Number(foundedYear) : null;
        if (employeeCount !== undefined) company.employeeCount = employeeCount.trim();

        // HR Details
        if (hrName !== undefined) company.hrName = hrName.trim();
        if (hrEmail !== undefined) company.hrEmail = hrEmail.trim();
        if (hrPhone !== undefined) company.hrPhone = hrPhone.trim();
        if (companyEmail !== undefined) company.companyEmail = companyEmail.trim();
        if (registrationNumber !== undefined) company.registrationNumber = registrationNumber.trim();
        if (linkedIn !== undefined) company.linkedIn = linkedIn.trim();

        // Hiring Process & Selection Rounds
        if (Array.isArray(hiringProcess)) {
            company.hiringProcess = hiringProcess.map((r, idx) => ({
                roundNumber: r.roundNumber || (idx + 1),
                roundName: r.roundName || `Round ${idx + 1}`,
                roundType: r.roundType || 'technical_interview',
                description: r.description || '',
                durationMinutes: Number(r.durationMinutes) || 45,
                cutoffScore: r.cutoffScore || '',
                mode: r.mode || 'online'
            }));
        }

        // Hiring Criteria
        if (hiringCriteria && typeof hiringCriteria === 'object') {
            company.hiringCriteria = {
                minCgpa: Number(hiringCriteria.minCgpa) || 0,
                allowedBacklogs: Number(hiringCriteria.allowedBacklogs) || 0,
                eligibleDegrees: Array.isArray(hiringCriteria.eligibleDegrees) ? hiringCriteria.eligibleDegrees : [],
                eligibleBranches: Array.isArray(hiringCriteria.eligibleBranches) ? hiringCriteria.eligibleBranches : [],
                keyFocusSkills: Array.isArray(hiringCriteria.keyFocusSkills) ? hiringCriteria.keyFocusSkills : [],
                experienceRange: hiringCriteria.experienceRange || 'All experience levels'
            };
        }

        company.submittedBy = user._id;

        // Set status to pending for admin verification unless already verified
        if (company.verificationStatus !== 'approved') {
            company.verificationStatus = 'pending';
            company.rejectionReason = '';
        }

        // Sync HR Details with Recruiter's User Account
        let userUpdated = false;
        if (hrName && hrName.trim() && user.name !== hrName.trim()) {
            user.name = hrName.trim();
            userUpdated = true;
        }
        if (hrEmail && hrEmail.trim() && user.email !== hrEmail.toLowerCase().trim()) {
            const emailInUse = await User.findOne({ email: hrEmail.toLowerCase().trim(), _id: { $ne: user._id } });
            if (!emailInUse) {
                user.email = hrEmail.toLowerCase().trim();
                userUpdated = true;
            }
        }

        if (!user.companyId || user.companyId.toString() !== company._id.toString()) {
            user.companyId = company._id;
            userUpdated = true;
        }

        if (userUpdated) {
            await user.save();
        }

        // Notify Admins
        try {
            const adminUsers = await User.find({ role: { $in: ['admin', 'sub-admin'] } });
            for (const adm of adminUsers) {
                await Notification.create({
                    type: 'alert',
                    title: `🏢 Company Verification Request: ${company.name}`,
                    message: `Recruiter ${user.name} (${user.email}) submitted/updated "${company.name}" for company verification. Please review in Admin Dashboard.`,
                    targetRole: 'admin',
                    targetUserId: adm._id,
                    createdBy: user._id
                });
            }
        } catch(notifErr) {
            console.error('Admin notification error:', notifErr);
        }

        res.json({
            success: true,
            message: 'Company profile and HR details saved successfully!',
            company,
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId
            }
        });
    } catch (err) {
        console.error('Error updating company:', err);
        res.status(500).json({ success: false, message: 'Failed to update company: ' + err.message });
    }
});

// GET /api/companies/all - List verified companies for students
router.get('/all', async (req, res) => {
    try {
        const companies = await Company.find({ verificationStatus: 'approved' })
            .select('name website domain industry size logo headquarter hiringProcess hiringCriteria')
            .sort({ name: 1 });
        res.json({ success: true, companies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/companies/:id - Public company profile & hiring process
router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
        res.json({ success: true, company });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/companies/hr-profile - Direct HR profile & password update
router.put('/hr-profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { name, email, phone, password } = req.body;

        if (name && name.trim()) {
            user.name = name.trim();
        }
        if (email && email.trim() && email.toLowerCase().trim() !== user.email) {
            const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
            if (existing) return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
            user.email = email.toLowerCase().trim();
        }
        if (password && password.trim().length >= 6) {
            user.password = password.trim();
        }

        await user.save();

        // Also sync HR name & phone to Company model if exists
        if (user.companyId) {
            const co = await Company.findById(user.companyId);
            if (co) {
                if (name) co.hrName = name.trim();
                if (email) co.hrEmail = email.trim();
                if (phone) co.hrPhone = phone.trim();
                await co.save();
            }
        }

        res.json({
            success: true,
            message: 'HR profile updated successfully!',
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
