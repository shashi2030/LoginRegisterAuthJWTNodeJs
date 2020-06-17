const express = require('express');
var bodyParser =  require('body-parser');
// const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
var config = require('./config/config');


const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
var url = config.getDBConnectionString();

mongoose.connect(url, function (err, db) {
    if (err) {
        console.log("Unable to connect to MongoDb server. Error: ", err);
    } else {
        console.log("Mongodb Connection established successfully");
    }
});
// route which should handle request
app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`listening on the poart ${PORT}`);
})