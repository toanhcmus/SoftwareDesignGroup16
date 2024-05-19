const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const novelController = require('../controllers/novelPageController.js');

router.use(bodyParser.urlencoded({ extended: true }));

router.route("/:name").get(novelController.renderNovelPage);

module.exports = router;