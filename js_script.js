var map;
var places = [];
function initAutocomplete() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 39.29, lng: -101.2195},
		zoom: 5,
		mapTypeId: 'roadmap'
	});

	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);

	var input2 = document.getElementById('pac-input2');
	var searchBox2 = new google.maps.places.SearchBox(input2);


	var markers = [];
	var addCircle;
	var addCircle2;

	var bounds = new google.maps.LatLngBounds();

	searchBox.addListener('places_changed', function() {
		places[0] = searchBox.getPlaces();
		if (places[0].length == 0) {
			return;
		}

	  // Clear out the old markers.
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];

		places[0].forEach(function(place) {
			if (!place.geometry) {
				console.log("Returned place contains no geometry");
				return;
			}

			// Create a marker for each place.
			markers.push(new google.maps.Marker({
				map: map,
				position: place.geometry.location
			  
			}));
			if (addCircle != undefined) 
				addCircle.setMap(null);
			addCircle = new google.maps.Circle({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.35,
				map: map,
				center: {lat: place.geometry.location.lat() * 1, lng: place.geometry.location.lng() * 1},
				radius: 16093.4 //10 miles
			});


			bounds.union(place.geometry.viewport);
			places[2] = place.geometry.location; //keeps the coords of add1
		});
	  
	  //map.fitBounds(bounds);
		if (places[3] == undefined)
			map.fitBounds(bounds);
		else if (places[2].lng() < places[3].lng())
			map.fitBounds(new google.maps.LatLngBounds(places[2], places[3]));
		else
			map.fitBounds(new google.maps.LatLngBounds(places[3], places[2]));
		
		updateStores(places[2].lat(), places[2].lng(), 0);
	});


	var markers2 = [];
	searchBox2.addListener('places_changed', function() {
		places[1] = searchBox2.getPlaces();
		if (places[1].length == 0) {
			return;
		}


		markers2.forEach(function(marker2) {
			marker2.setMap(null);
		});
		markers2 = [];


		places[1].forEach(function(place) {
			
			if (!place.geometry) {
			  console.log("Returned place contains no geometry");
			  return;
			}

			markers2.push(new google.maps.Marker({
			  map: map,
			  position: place.geometry.location
			}));
			
			if (addCircle2 != undefined)
				addCircle2.setMap(null);
			addCircle2 = new google.maps.Circle({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.35,
				map: map,
				center: {lat: place.geometry.location.lat() * 1, lng: place.geometry.location.lng() * 1},
				radius: 16093.4
			});

			bounds.union(place.geometry.viewport);
			places[3] = place.geometry.location; //keeps the coords of add2
		});
		if (places[2] == undefined)
			map.fitBounds(bounds);
		else if (places[2].lng() < places[3].lng())
			map.fitBounds(new google.maps.LatLngBounds(places[2], places[3]));
		else
			map.fitBounds(new google.maps.LatLngBounds(places[3], places[2]));

		updateStores(places[3].lat(), places[3].lng(), 1);
	});
}

var placeMarkers1 = [];
var placeMarkers2 = [];
var results1;
var results2;
var address;
var infowindow;

function updateStores(addlat, addlng, type) {
	address = type;
	if (type == 0) {
		placeMarkers1.forEach(function(marker) {
			marker.setMap(null);
		});
		placeMarkers1 = [];
		results1 = [];
	}
	else {
		placeMarkers2.forEach(function(marker) {
			marker.setMap(null);
		});
		placeMarkers2 = [];
		results2 = [];
	}
		
	infowindow = new google.maps.InfoWindow();
	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: {lat: addlat, lng: addlng},
		radius: 16093.4, //10 miles
		type: ['real_estate_agency']
	}, callback);
}

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
		if (address == 0)
			results1 = results;
		else
			results2 = results;
		if (results1 != undefined && results2 != undefined)
			updateSearchResults();
	}
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		title: place.name
	});
	if (address == 0)
		placeMarkers1.push(marker);
	else
		placeMarkers2.push(marker);

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	});
}

function updateSearchResults() {
	var unsorted_places = [];
  
	for (var i = 0; i < results1.length; i++) {
		unsorted_places.push({name: results1[i].name, distance: calculateDistanceMile(results1[i].geometry.location)});
	}
	for (var i = 0; i < results2.length; i++) {
		var objj = {name: results2[i].name, distance: calculateDistanceMile(results2[i].geometry.location)};
		unsorted_places.push(objj);
	  
	}
	var sorted_placesWithDuplicates = sortPlaces(unsorted_places);
	var sorted_places = removeDuplicates(sorted_placesWithDuplicates);
  
	var list = document.getElementById("results");
	list.style.display = "block";
	list.style.height = (sorted_places.length) * 18 + 50 + "px";
	var x = document.getElementById("ordered");
  
	while(x.hasChildNodes())
		x.removeChild(x.firstChild);
	
	for (var i = 0; i < sorted_places.length; i++) {
		var node = document.createElement('LI');
		var nodeData = document.createTextNode(sorted_places[i]["name"] + ' (' + sorted_places[i]["distance"] + ' mi)');
		node.appendChild(nodeData);
		ordered.appendChild(node);
	}
	for (var i = 0; i < sorted_places.length; i++) {
		for (var j = 0; j < Math.max(placeMarkers1.length, placeMarkers2.length); j++) {
			if (j < placeMarkers1.length && sorted_places[i]["name"] == placeMarkers1[j].getTitle()) {
				placeMarkers1[j].setLabel((i + 1).toString());
				break;
			}
			else if (j < placeMarkers2.length && sorted_places[i]["name"] == placeMarkers2[j].getTitle()) {
				placeMarkers2[j].setLabel((i + 1).toString());
				break;
			}
		}
	}
}


function calculateDistanceMile(place) {
	return Math.round((google.maps.geometry.spherical.computeDistanceBetween(places[2], place) + 
		  google.maps.geometry.spherical.computeDistanceBetween(places[3], place)) * 0.621371 / 1) / 1000;
}

function sortPlaces(unsorted_places) {
	return unsorted_places.sort(function(a, b){return (a["distance"] != b["distance"] ? a["distance"]-b["distance"] : a["name"]-b["name"])});
}

function removeDuplicates(list) {
	var tempList = [];
	tempList = list;
	var len = list.length;

	for (var i = 0; i < len; i++) {
		for (var j = i + 1; j < len; j++) {
			if (tempList[i]["name"] == tempList[j]["name"] && tempList[i]["distance"] == tempList[j]["distance"]) {
				tempList.splice(j, 1);
				len = len - 1;
				break;
			}
		}
	}
  
	return tempList;
}
