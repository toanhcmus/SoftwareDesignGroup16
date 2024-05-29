const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const controller = require('../controllers/homeController.js');
const chapterController = require('../controllers/chapterController.js');

router.use(bodyParser.urlencoded({ extended: true }));

router.use('/',controller.renderHome)

router.get('/abc',  (req, res) => {
    const responseData = { message: 'Data from server!' };
    console.log("aba")
    res.json(responseData);
});

module.exports = router;