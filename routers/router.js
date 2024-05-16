const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const controller = require('../controllers/homeController.js');

router.use(bodyParser.urlencoded({ extended: true }));

router.use('/', controller.renderHome);

module.exports = router;