const cors = require('cors');
const exp = require('express');
const bp = require('body-parser');
const passport = require('passport');
const { connect } = require('mongoose');
const { success, error } = require('consola');

// App constants
const { DB,PORT } = require('./config');

// initialize the application
const app = exp();

// middlewares
app.use(cors());
app.use(bp.json()); 
app.use(passport.initialize());

require('./middleware/passport.js')(passport);

// User router Middleware
app.use('/api/users', require('./routes/users.js'));


const startApp = async() => {
    
    try {

        // connection with database
        await connect(DB, {useUnifiedTopology: true, useNewUrlParser:true});

        success({message : `Successfully connected with DB\n${DB}`, badge:true});

        // Listning on the server on PORT 5000
        app.listen(PORT, () => {
           success({message : `server started at port ${PORT}`, badge:true});
        });

    } catch (err) {
        error({message:`Unable to connect to DB`, badge:true});
        startApp();
    }

}

startApp();

// .then(() => {
//     success({message : `Successfully connected with DB\n${DB}`, badge:true});
//  })
//  .catch(err => {
//     error({message:`Unable to connect to DB`, badge:true})
//  })