var mapApp = angular.module('mapApp', []);
//Given Co-ordinates
var cordinates = [{lat: -37.822066, lng: 144.963454},
					  {lat: -37.841936, lng: 144.935747},
					  {lat: -37.803082, lng: 144.862707},
					  {lat: -35.309049, lng: 149.108155},
					  {lat: -37.807772, lng: 145.059477}
]

mapApp.controller('MapController',function($scope){
	var directionsDisplay = new google.maps.DirectionsRenderer({draggable: true}); // Settting draggable true can help user to re-route 
    var directionsService = new google.maps.DirectionsService; 
	
	//Default Map Options
	var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(-25.2744, 133.7751), //Initiall Map is set to Australia cordinates
        mapTypeId: google.maps.MapTypeId.ROADMAP 
    }
	
	//Assigning map
	$scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);	
	directionsDisplay.setMap($scope.map);
	
	var cities = []
	var desti = []
	
	//Geocoder is used for reverse geocode(Helps to get the detailed address based on lat lng values)
	var geocoder = new google.maps.Geocoder;
	
	for(var i = 0; i < cordinates.length; i++){
		geocoder.geocode({'location': cordinates[i]}, function(results,status){
			if(status === 'OK'){
				var point = {
					'label': results[0].formatted_address,
					'lat': results[0].geometry.location.lat(),
					'lng': results[0].geometry.location.lng()
				}
				cities.push(point)
			}
		})

	//Setting up values to dropdowns 	
		$scope.names = cities
		$scope.desti = cities
		$scope.breakpoints = cities
		
	}
	
	//Button click
	$scope.findRoute = function(start,end,breakP){
		
		var waypts = []
		
		//Validating Start and Destination. If they are not selected then user will be asked to select one from the list.
		if(start === undefined || end === undefined){
			document.getElementById("directions-panel").innerHTML = '<h4>Please select <em><b>START</b></em> and <em><b>DESTINATION</b></em> to find the ROUTE</h4>'
			return;
		}

		/*Check for waypoints 
		  If it contains start and destination in the waypoints remove them.
		*/
		if(breakP !== undefined){
			for(var i = 0; i < breakP.length; i++){
			if(breakP[i].label != start.label && breakP[i].label !== end.label)
				waypts.push({location: new google.maps.LatLng(breakP[i].lat, breakP[i].lng), stopover: true})
			}	
		} 
		
		/*Get Transport type*/
		var drivingBtn = document.getElementById("DRIVING").style.backgroundColor
		var transitBtn = document.getElementById("TRANSIT").style.backgroundColor
		
		var transportType 
		if(drivingBtn == "white"){
			transportType = "DRIVING"
		} else if(transitBtn == "white"){
			transportType = "TRANSIT"
			waypts = [];
		} else if(drivingBtn == "" && transitBtn == ""){
			document.getElementById("directions-panel").innerHTML = '<h4>Please select <b>Tranportation type</b></h4>'
			return;
		}
		
		var startpoint = {lat: start.lat, lng: start.lng} // Lat and lng values of start point
		var endpoint = {lat: end.lat, lng: end.lng} // Lat and Lng values of Destination

		//Function call to calculate the route
		calculateAndDisplayRoute(directionsService, directionsDisplay, start, end, waypts,transportType); 
	}
});

/*
	This function is used to calculate and display the route. 
	@start = This is a latlng variable contains value of start point
	@end = This is a LatLng variable contains value of end point(Destination)
	@waypoints = This is an array of LatLng values of stop points in between strat and end
*/
 function calculateAndDisplayRoute(directionsService, directionsDisplay, start, end, waypts,transportType) {
		
		if(waypts !== undefined){
			directionsService.route({
			  origin: start,
			  destination: end,
			  waypoints: waypts,
			  optimizeWaypoints: true,
			  travelMode: google.maps.TravelMode[transportType]
			}, function(response, status) {
			  if (status == 'OK') {
				directionsDisplay.setDirections(response);
				var route = response.routes[0];
				var summaryPanel = document.getElementById('directions-panel');
				summaryPanel.innerHTML = '';
				//For each route, display summary information.
				for (var i = 0; i < route.legs.length; i++) {
					var routeSegment = i + 1;
					summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
						'</b><br>';
					summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
					summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
					summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
				}
			  } else {
				window.alert('Directions request failed due to ' + status);
			  }
			});	
		} else {
			directionsService.route({
			  origin: start,
			  destination: end,
			  optimizeWaypoints: true,
			  travelMode: google.maps.TravelMode[transportType]
			}, function(response, status) {
			  if (status == 'OK') {
				directionsDisplay.setDirections(response);
				var route = response.routes[0];
				var summaryPanel = document.getElementById('directions-panel');
				summaryPanel.innerHTML = '<h4><em>Travel Plan</em></h4><br>';
				//For each route, display summary information.
				for (var i = 0; i < route.legs.length; i++) {
					var routeSegment = i + 1;
					summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
						'</b><br>';
					summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
					summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
					summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
				}
			  } else {
				window.alert('Directions request failed due to ' + status);
			  }
			});
		}
}