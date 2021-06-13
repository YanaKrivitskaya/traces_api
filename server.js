const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
//const bodyparser = require('body-parser');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8080;

var connection  = require('../traces_api/db');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.use('/auth', require('./auth/auth.controller'));

app.get('/', (req, res) =>{
    res.send("hello");
});

app.listen(port, ()=>{
    console.log(`app is listening at http://localhost:${port}`);
});
