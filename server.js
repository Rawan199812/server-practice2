'use strict';

// Application Dependencies 
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');

// Environmental variables
require('dotenv').config();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Application Setup
const app = express();
const client = new pg.Client(DATABASE_URL);

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static('./public'));

app.set('view engine', 'ejs');
// routes:
app.get('/',homePage);
function homePage(req,res) {
    res.render('index');
    
}



client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
}).catch(error => console.log(error));