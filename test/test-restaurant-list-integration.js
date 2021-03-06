'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {Users} = require('../models/user-model');
const {createAuthToken} = require('../auth/router')

const expect = chai.expect;
chai.use(chaiHttp); //allows me to make http requests in tests

function seedTestData(){
    let seededTestData = [];
    console.log("Seeding database");
    for(let i = 0; i < 10; i++){
        seededTestData.push(testDataModel());
    }
    return Users.insertMany(seededTestData);
}

function testDataModel(){

             return {
                userName: faker.internet.userName(),
                password: faker.internet.password(),
                restaurants: [
                    {
                        name: faker.company.companyName(),
                        address: faker.address.streetAddress()
                    },
                    {
                        name: faker.company.companyName(),
                        address: faker.address.streetAddress()
                    },
                    {
                        name: faker.company.companyName(),
                        address: faker.address.streetAddress()
                    },
                    {
                        name: faker.company.companyName(),
                        address: faker.address.streetAddress()
                    }
                ]
            };
        // });
}

function tearDownTestDb(){
    console.log("Deleting database");
    return Users.deleteMany();
}

describe('Restaurant API', function(){

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function(){
        return seedTestData();
    });

    afterEach(function(){
        return tearDownTestDb();
    });

    after(function(){
        closeServer()

    });


    describe('POST user-account endpoint', function(){
        it('should create a new user object', function(){

            const newPost = {
                userName: faker.internet.userName(),
                password: faker.internet.password(),
                restaurants: []
            }

            return chai.request(app)
                .post('/user-account')
                .send(newPost)
                .then(function(res){
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res).to.be.json;
                    expect(res.body).to.include.keys('userName', '_id', 'restaurants');
                    return Users.findById(res.body._id);
                })
                .then(function(user){
                    expect(user).to.not.be.null;
                    expect(user.userName).to.equal(newPost.userName);
                    expect(user.restaurants).to.not.be.null;
                });
        });
    });
    describe('restaurants create PUT endpoint', function(){
        it('should add a new restaurant to existing user object', function(){
            const newRestaurant = {
                name: faker.company.companyName(),
                address: faker.address.streetAddress()
            }

            return Users
                .findOne()
                .then(function(user){
                    let testAuthToken = createAuthToken(user.forAuthToken());
                    return chai.request(app)
                        .put(`/dashboard/restaurants/${user._id}`)
                        .set('Authorization', `Bearer ${testAuthToken}`)
                        .send(newRestaurant)
                        .then(function(res){
                            expect(res).to.have.status(201);
                            expect(res.body.message).to.equal("Restaurant added!");
                            return Users.findById(user.id);
                        })
                        .then(function(userNewRest){
                            const newRestEntry = userNewRest.restaurants.length - 1;
                            expect(userNewRest.restaurants[newRestEntry].name).to.equal(newRestaurant.name);
                            expect(userNewRest.restaurants[newRestEntry].address).to.equal(newRestaurant.address);
                        });

                });
        });
    });

    describe('restaurants update PUT endpoint', function(){
        it('should update existing embedded restaurant document', function(){

            const restToUpdate = {
                name: faker.company.companyName(),
                address: faker.address.streetAddress()
            }

            return Users
                .findOne()
                .then(function(user){
                    let testAuthToken = createAuthToken(user.forAuthToken());
                    return chai.request(app)
                        .put(`/dashboard/restaurants/edit/${user._id}.${user.restaurants[0]._id}`)
                        .set('Authorization', `Bearer ${testAuthToken}`)
                        .send(restToUpdate)
                        .then(function(res){
                            expect(res).to.have.status(204);
                            return Users.findById(user._id);
                        })
                        .then(function(updated){
                            const updatedRestaurant = updated.restaurants[0];
                            expect(updatedRestaurant.name).to.equal(restToUpdate.name);
                            expect(updatedRestaurant.address).to.equal(restToUpdate.address);
                        });
                });
        });
    });

    describe('restaurants DELETE endpoint', function(){
        it('should delete existing embedded restaurant document', function(){
            return Users
                .findOne()
                .then(function(user){
                    const restaurantIdToDelete = user.restaurants[0]._id;
                    let testAuthToken = createAuthToken(user.forAuthToken());

                    return chai.request(app)
                        .delete(`/dashboard/restaurants/delete/${user._id}.${user.restaurants[0]._id}`)
                        .set('Authorization', `Bearer ${testAuthToken}`)
                        .then(function(res){
                            expect(res).to.have.status(204);
                            return Users.findById(user._id);
                        })
                        .then(function(userAfterDelete){
                            expect(userAfterDelete.restaurants.id(restaurantIdToDelete)).to.be.null;
                        });
                });
        });
    });

    describe('GET random restaurant endpoint', function(){
        it('should return a random restaurant to the user', function(){
            return Users
                .findOne()
                .then(function(user){
                    let testAuthToken = createAuthToken(user.forAuthToken());
                    return chai.request(app)
                        .get(`/dashboard/restaurants/random/${user._id}`)
                        .set('Authorization', `Bearer ${testAuthToken}`)
                        .then(function(res){
                            expect(res).to.have.status(200);
                            expect(res).to.be.json;
                            expect(res.body).to.be.an('object');
                            expect(res.body).to.not.be.null;
                        });
                });
        });
    });
});
