const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8080;

/*var connection  = require('../traces_api/db');

connection.query("SELECT * FROM notes", function(err, results) {
    if(err) console.log(err);
    console.log(results);
});*/

app.get('/', (req, res) =>{
    res.send("hello");
});

app.listen(port, ()=>{
    console.log(`app is listening at http://localhost:${port}`);
});
