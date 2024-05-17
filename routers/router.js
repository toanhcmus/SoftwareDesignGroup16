const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const homeController = require('../controllers/homeController.js');
const novelDescriptionController=require('../controllers/novelDescriptionController.js');
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', homeController.renderHome);
router.get('/novel', novelDescriptionController.renderNovelDescription);

module.exports = router;