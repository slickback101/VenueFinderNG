const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Venues endpoint - not implemented yet',
        data: []
    });
});

router.get('/:id', (req, res) => {
    res.json({
        success: true,
        message: 'Get venue by ID - not implemented yet',
        data: null
    });
});

module.exports = router;