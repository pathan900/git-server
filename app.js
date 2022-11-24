const express = require("express");
const mongoose = require("mongoose")
const app = express();




//database connection
const {MONGO_URI} = require('./keys');
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("database connected") )
    .catch(err => console.log(err))

require('./models/user')
require('./models/post')
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

//server
app.listen(5000)

app.use((req, res)=>{
    res.send("404 error page not found")
})