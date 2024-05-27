const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const novelController = require('../controllers/novelPageController.js');

router.use(bodyParser.urlencoded({ extended: true }));

router.route("/:name/page=:page").get(novelController.renderNovelPage);

module.exports = router;