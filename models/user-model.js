const {DATABASE_URL} = require('../config');
const mongoose = require('mongoose');
const {Restaurant} = require('./restaurant-model')

mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);

const restaurantSchema = mongoose.Schema(
    {
        name: String,
        address: String
    }
);

const userSchema = mongoose.Schema (
    {
        userName: String,
        password: String,
        restaurants: [restaurantSchema]
        //each list of restaurants will create a new document for each user
    }
);




userSchema.methods.userData = function(){
    return{
        userName: this.userName,
        restaurants: this.restaurants
    }
}
//the first argument is the collection the model is for
const Users = mongoose.model('users', userSchema);

module.exports = {Users};
