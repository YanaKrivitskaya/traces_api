const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
//const bodyparser = require('body-parser');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8080;
const errorHandler = require('./helpers/error_handler');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.use('/auth', require('./auth/auth.controller'));
app.use('/notes', require('./notes/notes.controller'));
app.use('/tags', require('./tags/tags.controller'));
app.use('/profile', require('./profile/profile.controller'));
app.use('/visas', require('./visas/visas.controller'));
app.use('/trips', require('./trips/trips.controller'));
app.use('/expenses', require('./expenses/expense.controller'));
app.use('/expense-categories', require('./expenses/expense-category.controller'));
app.use('/tickets', require('./tickets/ticket.controller'));
app.use('/bookings', require('./bookings/bookings.controller'));
app.use('/activities', require('./activities/activities.controller'));
app.use('/activity-categories', require('./activities/activity-category.controller'));

app.use(errorHandler);

app.listen(port, ()=>{
    console.log(`app is listening at http://localhost:${port}`);
});

const all_routes = require('express-list-endpoints');
console.log(all_routes(app));
