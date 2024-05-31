const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const controller = require('../controllers/homeController.js');
const chapterController = require('../controllers/chapterController.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.post('/download',chapterController.sendFileExportToClient);

router.get('/',controller.renderHome)



module.exports = router;