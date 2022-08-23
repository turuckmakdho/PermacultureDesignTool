let border;
let lastShapePath;
let autocomplete;
let map;
let margin = .25;

// Initialize and add the map to the web page
function initMap() {
  
  initAutocomplete();

  // The location of the Colosseum
  const initialPosition = new google.maps.LatLng(41.89133329713466, 12.492259832316195);
  
  // The map, centered on the initial position
  map = new google.maps.Map(document.getElementById("map"), 
    {
      zoom: 10, 
      center: initialPosition, 
      streetViewControl: false,
    });

  // the initial rectangle drawn on the map
  border = new google.maps.Polygon({
    paths: newBorderPath(initialPosition),
    strokeColor: "#000000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0,
    editable: true
  });

  border.setMap(map);

  // forLater
  // Gets border coordinates each time it's updated
  border.addListener('mouseup', () => {
    lastShapePath = border.getPath().getArray()
    console.log(`Last shape coordinates: ${lastShapePath}`);
  });

  /*
  map.addListener('zoom_changed', () => {
    //TODO adjust shape scale according to zoom level
    margin = map.getZoom() /1000;
    border.setPath(newBorderPath(map.getCenter()));
  })
  */

  map.addListener('center_changed', () => {
    let mapCenter = map.getCenter();
    border.setPath(newBorderPath(mapCenter));

    let argsString = "center=" + mapCenter.toString().slice(1, mapCenter.toString().length-1) + "&zoom=" + map.getZoom();
    document.getElementById('saveMap').setAttribute("href", argsString);
  })
}

// autocompletes place entered by the user (can be any location in the world) and saves name and geometry infos
function initAutocomplete(){
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete'),
    {
      types: ['geocode'],
      fields: ['geometry', 'name'],
    }
  );

  // callback when user enters location
  autocomplete.addListener('place_changed', onPlaceChanged);
}

// creates a rectangular border around given position, margin being the distance from center
function newBorderPath(position){
  const borderPath = [
    // lat: N-S [-90°;90°]
    // lng: W-E [-180°;180°]
    {lat: position.lat() - margin/2, lng: position.lng() - margin},
    {lat: position.lat() + margin/2, lng: position.lng() - margin},
    {lat: position.lat() + margin/2, lng: position.lng() + margin},
    {lat: position.lat() - margin/2, lng: position.lng() + margin}  
  ];

  //console.log(borderPath);
  return borderPath;
}


// when the user enters a location, verify it exists, and if it does, center the map on it, zoom, and move the border shape
function onPlaceChanged(){
  var place = autocomplete.getPlace();

  if(!place.geometry){
    document.getElementById('autocomplete').placeholder = 'Enter a place';
  } else {
    document.getElementById('autocomplete').placeholder = place.name;

    const newPosition = place.geometry.location;

    map.setCenter(newPosition);
    map.setZoom(15);

    border.setPath(newBorderPath(newPosition, .008));
  }
}

window.initMap = initMap;

