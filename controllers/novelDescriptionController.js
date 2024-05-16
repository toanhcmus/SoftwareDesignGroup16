const express = require('express');
const router = express.Router();

// Novel Description Page
router.get('/', (req, res) => {
    res.render('novelDescription');
});

module.exports = router;
