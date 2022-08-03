let border;
let lastShapePath;
let autocomplete;
let map;


// Initialize and add the map
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

  border = new google.maps.Polygon({
    paths: newBorderPath(initialPosition, .25),
    strokeColor: "#000000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0,
    editable: true
  });

  border.setMap(map);

  // Gets border coordinates each time it's updated
  border.addListener('mouseup', () => {
    lastShapePath = border.getPath().getArray()
    console.log(`Last shape coordinates: ${lastShapePath}`);
  });
}

function initAutocomplete(){
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete'),
    {
      types: ['geocode'],
      fields: ['geometry', 'name'],
    }
  );
  autocomplete.addListener('place_changed', onPlaceChanged);

}

function newBorderPath(position, margin){
  const borderPath = [
    // lat: N-S [-90°;90°]
    // lng: W-E [-180°;180°]
    {lat: position.lat() - margin/2, lng: position.lng() - margin},
    {lat: position.lat() + margin/2, lng: position.lng() - margin},
    {lat: position.lat() + margin/2, lng: position.lng() + margin},
    {lat: position.lat() - margin/2, lng: position.lng() + margin}  
  ];

  return borderPath;
}

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
