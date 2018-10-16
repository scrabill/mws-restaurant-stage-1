let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  /*image.alt = DBHelper.imageAltForRestaurant(restaurant);*/
  image.alt = restaurant.name;
  li.append(image);

  /*const alt = document.createElement('alt'); */


  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details of the restaurant ';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  const favorite = document.createElement('button');
  favorite.innerHTML = '❤';
  // favorite.setAttribute('class', 'favorite');
  favorite.setAttribute('id', 'favorite-' + restaurant.id); // Add id=restaurant.id attribute
  // console.log(restaurant.is_favorite); // Print favorite status (true/false) to console
  const fave_status = restaurant.is_favorite;
  // console.log(fave_status); // Print favorite status (true/false) to console

  if (fave_status === true) {
    console.log(restaurant.id + " is a favorite");
    //favorite.setAttribute('style', 'background-color:orange;color:white');
    favorite.setAttribute('class', 'favorite');
  } else {
    console.log(restaurant.id + " is not a favorite");
    //favorite.setAttribute('style', 'background-color:grey;color:darkgrey');
  }

  // favorite.onlick = DBHelper.switchClass();
  favorite.setAttribute('onclick', 'DBHelper.switchClass(' + restaurant.id + ')')

  //myPara.setAttribute("id", "id_you_like");
  li.append(favorite);

  return li

  /*
  favorites
  TODO:
  If restaurant is a favorite, then apply favorite class to button
  If restaurant is not a favorite, then apply notFavorite class to button
  On click, toggle favorite status (yes/no)
  Write status back to the database
  */
  // const isFavorite = restaurant.is_favorite;
/*
  const favoriteButton = document.getElementById("favorite"); // Finds the favorite button
  favoriteButton.addEventListener('click', switchClass, false);

  function switchClass() {
    if (favoriteButton.classList) {
      favoriteButton.classList.toggle("myClass");
    }
  }*/

  /*

  function myFunction() {
    var element = document.getElementById("myDIV");
    element.classList.toggle("mystyle");
    }

  */

}

/*
Function to toggle between favorite class


const favoriteButton = document.getElementById("favorite"); // Finds the favorite button
favoriteButton.addEventListener('click', switchClass, false);

function switchClass() {
  if (favoriteButton.classList) {
    favoriteButton.classList.toggle("favorite");
  }
}

*/

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
