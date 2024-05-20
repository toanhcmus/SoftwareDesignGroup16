const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const chapterController = require('../controllers/chapterController.js');

router.use(bodyParser.urlencoded({ extended: true }));

router.route("/:name/:chap").get(chapterController.renderChapterPage);

module.exports = router;