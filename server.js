'use strict'
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {DATABASE_URL, PORT} = require('./config');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const {localStrategy, jwtStrategy} = require('./auth/strategies');
const {router: authRouter} = require('./auth/router');
//router: authRouter uses deconstructuring with renaming
require('dotenv').config();
const jsonParser = bodyParser.json();

app.use(morgan('common'));
app.use(express.static('public'));

const restaurantListRouter = require('./restaurantListRouter');
const userAccountRouter = require('./userAccountRouter');


mongoose.Promise = global.Promise;

const jwtAuth = passport.authenticate('jwt', {session: false});
const localAuth = passport.authenticate('local', {session: false});

passport.use(localStrategy);
passport.use(jwtStrategy);


app.use('/dashboard', restaurantListRouter);
app.use('/user-account', userAccountRouter);
app.use('/login', jsonParser, authRouter);


let server;
let port;

function runServer(databaseUrl, port=PORT){
    return new Promise(function(resolve, reject){
        mongoose.connect(databaseUrl, function(err){
                if(err){
                    return reject(err);
                }
                console.log(`mongoose connected to ${databaseUrl}`);
                server = app.listen(port, function(){
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', function(err){
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer(){
    return new Promise(function(resolve, reject){
        mongoose.disconnect().then(()=>{
            return new Promise(function(resolve, reject){
                console.log("closing server");
                server.close(err=>{
                    if(err){
                        console.log(err);
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    });
}


//this runs if server.js is called directly, if this isn't included
    //the server will be started twice when running tests
//module provides a file name property which is the entry point of the current
    //application.
//when ran directly (node server.js vs require('/server')) require.main is set
    //to it's module. So it would equal server.js if ran directly
//therefore require.main === module would return true if ran directly
    //(server.js === server.js)
if (require.main === module) {
  runServer(DATABASE_URL).catch(err=> console.log(err));
}

module.exports = {app, runServer, closeServer};
