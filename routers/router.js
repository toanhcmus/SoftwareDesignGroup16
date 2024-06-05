const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const controller = require('../controllers/homeController.js');
const novelController = require('../controllers/novelController.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.use('/', express.json());
router.get('/', controller.renderHome);
module.exports = router;