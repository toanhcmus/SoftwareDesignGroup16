require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const cookie=require('cookie-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cookie());
app.use(express.json());
// Controllers

// Routes
// app.use('/', homeController);
// app.use('/novel', novelController);
// Routers
const router = require('./routers/router.js');
const novelPageRouter = require('./routers/novelRouter.js');
const chapterRouter = require('./routers/chapterRouter.js');

app.use('', novelPageRouter);
app.use('', chapterRouter);
app.use('/', router);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
