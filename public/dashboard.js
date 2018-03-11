'use strict'

function getRestaurantData(callback){
    $('.container').on('click', function(){
        console.log("getRestaurantData working");
        $.getJSON(`/dashboard/restaurants`, callback);
    })
}

//render restaurant list
function renderRestaurantList(data){
    console.log(data[1].restaurants);
    let restaurantsArray = data[1].restaurants;
        restaurantsArray.forEach(function(restaurantObject){
            for(var key in restaurantObject){
                if(key === 'name'){
                    $('.restaurant-list').append(
                        `<p>${restaurantObject[key]}</p>`
                    );
                }else if(key === 'address'){
                    $('.restaurant-list').append(
                        `<p>${restaurantObject[key]}</p>`
                    );
                }
            }
    });
}

function getAndDisplayRestaurants(){
    getRestaurantData(renderRestaurantList);
}



function getRandomRestaurant(callback){
    $('.generate-restaurant').on('click', function(){
        // 5a9c8ec5f037d2fbe9405cb6 is user _id to test with
        $.getJSON('restaurants/random/5a9c8ec5f037d2fbe9405cb6', callback);
    });
}

function renderRandomRestaurant(restaurant){
    console.log(restaurant);
    $('.random-restaurant').append(
        `<p>${restaurant.name}</p>
         <p>${restaurant.address}</p>`
    )
}

function getAndDisplayRandomRestaurant(){
    getRandomRestaurant(renderRandomRestaurant);
}

function renderRestaurantAddressInput(){
    $('.add-restaurant-input-js').on('click', function(){
        $(this).attr('placeholder', 'Restaurant Name');
        const addressInput = $(this).next();
        if(addressInput.attr('type') === 'hidden'){
            addressInput.attr('type', 'text');
        }
    });
}

function sendNewRestaurantData(){
    $('.add-restaurant-button-js').on('click', function(event){
        event.preventDefault();
        console.log(event);
        let restaurantName = event.target.form[0].value;
        let address = event.target.form[1].value;

        let restObj = {
            name: restaurantName,
            address: address
        };

        $.ajax({
            url:'/dashboard/restaurants/5a9c8ec5f037d2fbe9405cb6',
            method: 'PUT',
            data: JSON.stringify(restObj),
            dataType: 'json',
            contentType: 'application/json; charset= utf-8',
            success: function(message){
                console.log(message);
            }
        });
    });
    //Will add callback to append new restaurant to rendered list of restaurants
}

$(function(){
    getAndDisplayRestaurants();
    getAndDisplayRandomRestaurant();
    renderRestaurantAddressInput();
    sendNewRestaurantData();
})
