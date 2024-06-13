const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const homeController = require('../controllers/homeController.js');
const novelController = require('../controllers/novelController.js');
const chapterController = require('../controllers/chapterController.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.use('/', express.json());
router.post('/download',chapterController.sendFileExportToClient);
router.post('/fetchModules', homeController.fetchModules);
router.post('/fetchFileExports', chapterController.fetchFileExports);
router.get('/',homeController.renderHome)

module.exports = router;