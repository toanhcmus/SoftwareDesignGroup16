const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const novelController = require('../controllers/novelController.js');

router.use(bodyParser.urlencoded({ extended: true }));

router.route("/keyword=:keyword/:name/page=:page").get(novelController.renderNovelPage);

module.exports = router;