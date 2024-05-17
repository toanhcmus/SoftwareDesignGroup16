const express = require('express');
const router = express.Router();

// Novel Description Page

module.exports = {
    renderNovelDescription: (req,res,next)=>{
        res.render('novelDescription');
    }
};
