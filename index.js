require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Controllers
const homeController = require('./controllers/homeController');
const novelController = require('./controllers/novelDescriptionController');

// Routes
app.use('/', homeController);
app.use('/novel', novelController);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
