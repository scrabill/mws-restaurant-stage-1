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

    // restaurantsOS.createIndex('neighborhood', 'neighborhood', {unique: false}); // Create index for neighborhoods
    // restaurantsOS.createIndex('cuisine_type', 'cuisine_type', {unique: false}); // Create index for cuisines. TODO Add data
    // restaurantsOS.createIndex('restaurant_id', 'restaurant_id', {unique: false}); // Create index for review. TODO Add data

    console.log('Creating the restaurants objectstore');
  }

  if (!upgradeDb.objectStoreNames.contains('reviews', {keypath: 'id'} )) {
    const reviewsOS = upgradeDb.createObjectStore('keyvalReviews'); // Making the storage

    // reviewsOS.createIndex('reviews', 'reviews', {unique: false}); // Create index for neighborhoods

    console.log('Creating the reviews objectstore');
  }

});

/*
Get restaurant data from the object store


dbPromise.then(function(db) {
  var tx = db.transaction('keyval', 'readonly');
  var store = tx.objectStore('keyval');
  return store.getAll();
}).then(function(restaurant) {
  console.log('Items by name:', restaurant);
});
*/

/*
Get review data from the object store


dbPromise.then(function(db) {
  var tx = db.transaction('keyvalReviews', 'readonly');
  var store = tx.objectStore('keyvalReviews');
  return store.getAll();
}).then(function(reviews) {
  console.log('Items by name:', reviews);
});
*/

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

  /**
   * Fetch all restaurants.
   */

  static addDB(restaurants) { // Make a new one for reviews
    for (let i=0; i < restaurants.length; i++) { // Look into "closure" and "hoisting", slight differences between ES5 & ES6
      dbPromise.then(function(db) {
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
Update restaurant data in IDB, if what is on the sails server has been changed
*/

static updateIDB(id, status) {
  console.log("Running updateIDB function"); // This works

  dbPromise.then(function(db) {
    const tx = db.transaction('keyval', 'readwrite');
    const objectStore = tx.objectStore('keyval');
  //   const myIndex = keyvalStore.index('is_favorite');

    console.log("Opening transaction"); // this works
    console.log("Restuarant " + id + " was clicked on and the favorite status is " + status) // this works

    objectStore.openCursor().onsuccess = function(event) { // Cursor is not opening up
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.id === 10) // testing using ID of 10
        console.log("Opening the keyval object store");
        cursor.continue();
      }

    }



    // keyvalStore.openCursor().onsuccess = function(event) {
    //   const cursor = event.target.result;
    //   console.log(event.target.result);
    //   if (cursor) {
    //     if (cursor.value.is_favorite === false || cursor.value.is_favorite === true) {
    //       const updateData = cursor.value;
    //       updateData.is_favorite = status; // How do I get the new value if is_favorite, so that I can update the IDB value?
    //
    //       const request = cursor.update(updateData);
    //       request.onsuccess = function() {
    //         console.log("IDB has been updated");
    //       };
    //     };
    //   } else {
    //     console.log("This is the else statment being triggered");
    //   }
    // };
  });
}
  /*

  Source: https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor/update

  function updateResult() {
    list.innerHTML = '';
    const transaction = db.transaction(['rushAlbumList'], 'readwrite');
    const objectStore = transaction.objectStore('rushAlbumList');

    objectStore.openCursor().onsuccess = function(event) {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.albumTitle === 'A farewell to kings') {
          const updateData = cursor.value;

          updateData.year = 2050;
          const request = cursor.update(updateData);
          request.onsuccess = function() {
            console.log('A better album year?');
          };
        };

        const listItem = document.createElement('li');
        listItem.innerHTML = '<strong>' + cursor.value.albumTitle + '</strong>, ' + cursor.value.year;
        list.appendChild(listItem);
        cursor.continue();
      } else {
        console.log('Entries displayed.');
      }
    };
  };

  */


  // for (let i=0; i < restaurants.length; i++) { // Look into "closure" and "hoisting", slight differences between ES5 & ES6
  //   dbPromise.then(function(db) {
  //   let tx = db.transaction('keyval', 'readwrite'); // Starting the transaction
  //   let keyvalStore = tx.objectStore('keyval'); // Build the object to put into the database
  //   keyvalStore.put(restaurants[i],restaurants[i].id); // Storing each object into the databate (specifying what to store)
  //   return tx.complete; // Stop the transaction
  //   }).catch(function(error){
  //     console.log("An error has occured during the IDB " + error); // Give an error. error = what the error is exactly
  //   })
  // }




static pullFromIDB(restaurants) { // Make a new one for reviews
    // let tx = db.transaction('keyval', 'read'); // Starting the transaction
    console.log("Reading from keyval");
    //let keyvalStore = tx.objectStore('keyval');
    //keyvalStore.get(restaurants[i],restaurants[i].id); // Storing each object into the databate (specifying what to store)
  //return tx.complete; // Stop the transaction
    //}).catch(function(error){
      //console.log("An erorr has occured during the IDB " + error); // Give an error. error = what the error is exactly
    //})
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
    // DBHelper.pullFromIDB();
      dbPromise.then(function(db) {
        var tx = db.transaction('keyval', 'readonly');
        var store = tx.objectStore('keyval');
        return store.getAll();
      }).then(function(restaurants) {
        console.log('Items by name:', restaurants);
        callback(restaurants, null);
      });
    };
    xhr.send();
  }

  /*
  Function Pull data from IDB when offline
  */



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
    dbPromise.then(function(db) {
      var tx = db.transaction('keyvalReviews', 'readonly');
      var store = tx.objectStore('keyvalReviews');
      return store.getAll();
    }).then(function(reviews) {
      console.log('Items by name:', reviews);
      callback(reviews, null);
    });
  };
  xhr.send();
}

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

  /*
  Toggle static and live map
  */

  static switchMap() {
    console.log("The static map was clicked");
    const staticMapImg = document.getElementById('static-map');
    const liveMapImg = document.getElementById('map');
    if (liveMapImg.className === 'hide') { // If the live map is hidden
      liveMapImg.className = 'show'; // Show the live map
      staticMapImg.className = 'hide'; // Hide the static one
    } else {
      liveMapImg.className = 'hide'; // If in doubt, hide the live map for now
    }
 }

  /*
  Toggle Favorites


  static switchClass(restaurant, id) {
    const favoriteButton = document.getElementById('favorite-' + restaurant.id); // Finds the favorite button
    console.log("This element has an ID name of: " + "favorite-" + restaurant.id);
    if (favoriteButton.classList) {
      favoriteButton.classList.toggle("favorite");
    }
  }
  */

  static switchClass(id) {
   const favoriteButton = document.getElementById('favorite-' + id);
   // // const fave_status = restaurant.is_favorite;
   console.log("Clicked on ", favoriteButton);
   favoriteButton.classList.toggle("favorite"); // Add/remove favorite class
   // DBHelper.updateFavorite();
   // console.log("Favorite status is: ", restaurant.is_favorite);

   if (favoriteButton.classList == "favorite") {
     console.log("true");
     console.log("The ID is: " + id);
     DBHelper.testFunction(id, true);
   } else {
     console.log("false");
     DBHelper.testFunction(id, false);
   }
   // console.log("Is Favorite?" + fave_status);
 }

 /*
This code came with some help from laura
static switchClass(id) {
   const favoriteButton = document.getElementById('favorite-' + id);
   // // const fave_status = restaurant.is_favorite;
   console.log("Clicked on ", favoriteButton);
   favoriteButton.classList.toggle("favorite"); // Add/remove favorite class
   // DBHelper.updateFavorite();
   // console.log("Favorite status is: ", restaurant.is_favorite);

   if (favoriteButton.classList == "favorite") {
     console.log("true");
     DBHelper.testFunction(id, true);
   } else {
     console.log("false");
     DBHelper.testFunction(id, false);
   }
   // console.log("Is Favorite?" + fave_status);
 }

 */

   /*
   Write change in status back to the Database
   */
   static testFunction(id, status) {
     console.log("testFunction has been triggered");
     let data = {};
     let xhr = new XMLHttpRequest();
     //xhr.open('GET', 'http://localhost:1337/restaurants/?is_favorite=false'); // Get data from the sails server
     // xhr.open('PUT', 'http://localhost:1337/restaurants/1/?is_favorite=true');
     xhr.open('PUT', 'http://localhost:1337/restaurants/'+ id + '/?is_favorite=' + status); // from laura
     // console.log('http://localhost:1337/restaurants/?is_favorite=false'); // http://localhost:1337/restaurants  `${DBHelper.DATABASE_URL_REVIEWS}?restaurant_id=${id}`
     xhr.onload = () => {
       if (xhr.status === 200) { // Got a success response from server!
           console.log('Server response is ' + xhr.status);
           const json = JSON.parse(xhr.responseText); // This is the actual data array
           const restaurants = json; // Fix this later
           // const restaurant = restaurants.find(r => r.id == id);
           // callback(null, restaurants);
           console.log(restaurants);
           // is_favorite: false
           console.log("Is restaurant " + id + " a favorite? " + status)
           DBHelper.updateIDB(id, status);

         }
         else { // Oops!. Got an error from server.
           const error = (`Request failed. Returned status of ${xhr.status}`);
           // callback(error, null);
         }
       };
       // xhr.onerror = (error) => {
       // console.log("You're out of luck " + error); // This is triggering when offline
       // // TODO: When offline, look for restaurant data in IDB
       // // DBHelper.pullFromIDB();
       //   dbPromise.then(function(db) {
       //     var tx = db.transaction('keyval', 'readonly');
       //     var store = tx.objectStore('keyval');
       //     return store.getAll();
       //   }).then(function(restaurants) {
       //     console.log('Items by name:', restaurants);
       //     callback(restaurants, null);
       //   });
       // };
       xhr.send();
     }

   // static updateFavorite(id, is_favorite) {
   //   console.log("updateFavorite function is running");
   //   const url = 'http://localhost:1337/restaurants/1/?is_favorite=true';
   //   const method = "PUT";
   //   let postBody = {
   //     "is_favorite": null,
   //   }
   //
   //
   //   // When the status is changed, write it to the database and IDB
   //   // "is_favorite": false
   //
   //   // DBHelper.addFavorite(url, method);
   //   // console.log(url);
   // }

}


/*
Toggle favorites


const favoriteButton = document.getElementById("favorite"); // Finds the favorite button
favoriteButton.addEventListener('click', switchClass, false);

function switchClass() {
  if (favoriteButton.classList) {
    favoriteButton.classList.toggle("favorite");
  }
}
*/

/*
TODOS so that I can pass!
- Users are able to mark a restaurant as a favorite, this toggle is visible in the application. Favorite status writes to the database and IDB
- User is able to add a review to a restaurant while offline and the review is sent to the server when connectivity is re-established.
*/
