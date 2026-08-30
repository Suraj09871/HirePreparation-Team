const express = require('express');
const router = express.Router();
const PreparationPath = require('../models/PreparationPath');

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/prep/sample-questions - Public sample questions for landing page
router.get('/sample-questions', async (req, res) => {
    try {
        const questions = await PreparationPath.aggregate([
            { $unwind: "$questions" },
            { $sample: { size: 8 } },
            { $project: { 
                question: "$questions.question", 
                company: "$companyName", 
                topic: "$questions.category", 
                difficulty: "$questions.difficulty",
                _id: 0
            }}
        ]);
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load sample questions.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const paths = await PreparationPath.find().sort({ companyName: 1 });
        res.json({ success: true, preparations: paths });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const prep = await PreparationPath.findById(req.params.id);
        if (!prep) return res.status(404).json({ success: false, message: 'Not found.' });
        res.json({ success: true, preparation: prep });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/company/:name', async (req, res) => {
    try {
        const prep = await PreparationPath.findOne({
            companyName: { $regex: new RegExp(`^${escapeRegex(req.params.name)}$`, 'i') }
        });
        if (!prep) return res.status(404).json({ success: false, message: 'Not found.' });
        res.json({ success: true, preparation: prep });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
