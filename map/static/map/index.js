let border;
let lastShapePath;
let autocomplete;
let map;
let margin = .25;

let firstPoint = "null";

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
      scaleControl: true
    });

  // the initial rectangle drawn on the map
  border = new google.maps.Polygon({
    paths: newRectanglePath(initialPosition),
    strokeColor: "#000000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0,
    editable: true,
    draggable: true
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
    border.setPath(newRectanglePath(map.getCenter()));
  })
  */

  map.addListener('center_changed', () => {
    // TODO move whole shape with map
    //border.setPath(newRectanglePath(mapCenter));
    
  }) 

  // saves map infos (shape, center, zoom) to show on next page
  const saveButton = document.getElementById('saveMap');
  saveButton.addEventListener('click', () => {
    const mapCenter = map.getCenter();
    let path = "color:0x000000|weight:2";

    // formats the path to fit the url for the static map api
    border.getPath().forEach(point => {
      if (firstPoint == "null"){
        firstPoint = "|" + point.lat() + "," + point.lng();
      }
      path += "|" + point.lat() + "," + point.lng();       
    });
    path += firstPoint;

    // complete arguments for the map parameters
    const argsString =  "center=" + mapCenter.toString().slice(1, mapCenter.toString().length-1) + 
                        "&zoom=" + map.getZoom() + 
                        "&path=" + path;

    // redirects to static map page                  
    window.location.href = argsString;
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
function newRectanglePath(position){
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

    border.setPath(newRectanglePath(newPosition, .008));
  }
}

window.initMap = initMap;

