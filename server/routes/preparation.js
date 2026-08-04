const express = require('express');
const router = express.Router();
const PreparationPath = require('../models/PreparationPath');

router.get('/', async (req, res) => {
    try {
        const paths = await PreparationPath.find()
            .select('companyName difficulty description questionCount topicCount avgSalary roles')
            .sort({ companyName: 1 });
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
            companyName: { $regex: new RegExp(`^${req.params.name}$`, 'i') }
        });
        if (!prep) return res.status(404).json({ success: false, message: 'Not found.' });
        res.json({ success: true, preparation: prep });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
