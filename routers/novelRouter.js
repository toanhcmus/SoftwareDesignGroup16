const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const novelController = require('../controllers/novelController.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.use('/', express.json());
router.route("/:name/page=:page").get(novelController.renderNovelPage);
router.route("/name=:name/src=:src/page=:page").get(novelController.renderNovelPageSrc);
router.get('/saveStates',novelController.saveStates);
module.exports = router;