/**
* Set up IndexDB
*/

(function() {
  'use strict';

  // Check for browser support

  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

})();

// Creates the database

console.log('We\'re about to create a database!'); // This shows in the console

const dbPromise = idb.open('mws-restaurant-reviews', 8, function(upgradeDb) {
  console.log('Creating the database');

// If there is not an objectstore named 'restaurants', create one, with a primary key of 'id'

  if (!upgradeDb.objectStoreNames.contains('restaurants', {keypath: 'id'} )) {
    // var restaurantsOS = upgradeDb.createObjectStore('restaurants', {keypath: 'id'} );
    const restaurantsOS = upgradeDb.createObjectStore('keyval'); // Making the storage

    restaurantsOS.createIndex('neighborhood', 'neighborhood', {unique: false}); // Create index for neighborhoods
    restaurantsOS.createIndex('cuisine_type', 'cuisine_type', {unique: false}); // Create index for cuisines. TODO Add data
    // restaurantsOS.createIndex('restaurant_id', 'restaurant_id', {unique: false}); // Create index for review. TODO Add data

    console.log('Creating the restaurants objectstore');
  }

  if (!upgradeDb.objectStoreNames.contains('reviews', {keypath: 'id'} )) {
    const reviewsOS = upgradeDb.createObjectStore('keyvalReviews'); // Making the storage

    // reviewsOS.createIndex('reviews', 'reviews', {unique: false}); // Create index for neighborhoods

    console.log('Creating the reviews objectstore');
  }

});

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_URL_REVIEWS() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

/*
  static dbTransaction(db) {
    let tx = dbPromise.transction('restaurants', 'readwrite');
    let store = tx.objectstore('restaurants');
  }

  */

  /**
   * Fetch all restaurants.
   */

  static addDB(restaurants) { // Make a new one for reviews
    for (let i=0; i < restaurants.length; i++) { // Look into "closure" and "hoisting", slight differences between ES5 & ES6
      dbPromise.then(function(db) {
      //console.log(restaurants);
      //console.log(restaurants.length);
      //console.log(i);
      //console.log(restaurants[i]);
      let tx = db.transaction('keyval', 'readwrite'); // Starting the transaction
      let keyvalStore = tx.objectStore('keyval'); // Build the object to put into the database
      keyvalStore.put(restaurants[i],restaurants[i].id); // Storing each object into the databate (specifying what to store)
      return tx.complete; // Stop the transaction
      }).catch(function(error){
        console.log("An erorr has occured during the IDB " + error); // Give an error. error = what the error is exactly
      })
    }

    /**
     * Fetch all reviews.
     */

    // TODO: if no connections, pull from IDB (look at using fetch for fallback (IDB.getAll))
    // Small changes, then save, then improve from there

      /*
      set(key, val) {
        return dbPromise.then(db => {
          const tx = db.transaction('keyval', 'readwrite');
          tx.objectStore('keyval').put(val, key);
          return tx.complete;
        });
      },

      From jake

      */

      // let tx = db.transaction

  }

/*
Fetch all reviews
*/

static addDBReviews(reviews) {
 for (let i=0; i < reviews.length; i++) {
   dbPromise.then(function(db) {
   let tx = db.transaction('keyvalReviews', 'readwrite'); // Starting the transaction
   let keyvalStore = tx.objectStore('keyvalReviews'); // Build the object to put into the database
   keyvalStore.put(reviews[i],reviews[i].id); // Storing each object into the databate (specifying what to store)
   return tx.complete; // Stop the transaction
   }).catch(function(error){
     console.log("An erorr has occured during the IDB " + error); // Give an error. error = what the error is exactly
   })
 }
}

  /*
  TODO
  Pull from web and display first
  Display data, then write to the Database
  When someone is asking for a restaurant, check the database first, if not, go to network
  Update database with changes from the network
  CATCH if the server returns nothing (error handling)
  */

  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL); // Get data from the sails server
    // console.log('Got data from the server!'); // This fires twice?
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        console.log('Server response is ' + xhr.status);
        const json = JSON.parse(xhr.responseText); // This is the actual data array
        const restaurants = json; // Fix this later
        // console.log(json); // This fires twice = OK, can improve this later in main.js
        // dbTransaction.add(restaurants);
        DBHelper.addDB(restaurants);
        callback(null, restaurants);
      }
      // if (xhr.status === 500) {
        // console.log("Sheeeet");
      // }
      else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.onerror = (error) => {
    console.log("You're out of luck " + error); // This is triggering when offline
    // TODO: When offline, look for restaurant data in IDB
    };
    xhr.send();
  }

  /*
  Fetch reviews
  */

  static fetchReviews(id, callback) {
    let xhr = new XMLHttpRequest();
    //xhr.open('GET', DBHelper.DATABASE_URL_REVIEWS?restaurant_id=id); // Get data from the sails server
    xhr.open('GET', `${DBHelper.DATABASE_URL_REVIEWS}?restaurant_id=${id}`);
    // http://localhost:8000/restaurant.html?id=6
    // console.log(DBHelper.DATABASE_URL_REVIEWS); // Print the current URL
    // console.log('Got data from the server!'); // This fires twice?
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        // console.log('Server response is ' + xhr.status);
        const json = JSON.parse(xhr.responseText); // This is the actual data array
        const reviews = json; // Fix this later
        // console.log(json); // This fires twice = OK, can improve this later in main.js

        DBHelper.addDBReviews(reviews);
        callback(null, reviews);
      }
      // if (xhr.status === 500) {
        // console.log("Sheeeet");
      // }
      else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.onerror = (error) => {
    console.log("You're out of luck " + error);
    };
    xhr.send();
  }


  /*
  // Function for adding JSON data to indexDB

  dbPromise(function(db) {
  var tx = dbPromise.transction('restaurants', 'readwrite');
  var store = tx.objectstore('restaurants');

  restaurants.add(DATABASE_URL); // ???

});
  */

  /**
   * Fetch a review by its ID.

  static fetchReviewsById(id, callback) {
    // fetch all reviews with proper error handling.
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const reviews = reviews.filter(r => r.id == id); // Find all that match with filter, not just the first one
        if (reviews) { // Got the reviews
          callback(null, reviews);
        } else { // Restaurant does not exist in the database
          callback('Reviews does not exist', null);
        }
      }
    });
  }
   */

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // const restaurant = restaurants.find(r => r.id == id);
        const restaurant = restaurants.find(r => r.id == id);
        // const restaurant = restaurants // new file is named restaurants
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine == cuisine); // Why does this work now when it wasn't needed before?
        console.log(restaurant.cuisine_type);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
