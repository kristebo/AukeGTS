Ext.ns('Auke.utils');

Auke.utils.loadViewFromHash = function(hashString) {
	if (!hashString) {
		return;
	}

	var hashArr = hashString.split(':');
	var viewName = hashArr[0];
	var viewParams = hashArr.slice(1);

	var viewContainer = Ext.getCmp('viewContainer');
	var view = Ext.create('Auke.view.' + viewName, {
		params : viewParams
	});
	if (viewContainer) {
		viewContainer.removeAll(true);
		viewContainer.add(view);
	}
};

Auke.utils.loadView = function(viewName, viewParams) {
	if (!viewName) {
		return null;
	}
	oldToken = Ext.History.getToken();
	newToken = viewName;
	if (viewParams && viewParams.length) {
		newToken += ':' + viewParams.join(':');
	}
	if (oldToken != newToken) {
		Ext.History.add(newToken);
	}
};

Auke.utils.buildHTML = function(data) {

	return "<h1>Drone Info</h1> <input type='button' onclick=Auke.utils.start(" + "'"
			+ data.id + "'"
			+ ") value='Start Moving'  /> | <input type='button' onclick=Auke.utils.stop("
			+ "'" + data.id + "'" + ") value='Stop Moving'  /> <ul>"
			+ "<li>Drone ID:" + data.id + "</li><li>GPS: "
			+ data.currentPosition.latitude + "/"
			+ data.currentPosition.longitude + "</li><li>Speed:" + data.speed
			+ "</li><li>Altitude: " + data.altitude + "</li><li>Flying: "
			+ data.flying + "</li></ul>"

}

var map;
var mgr;
var icons = {};
Auke.utils.markers = [];
Auke.utils.allmarkers = {};
var layerId = "SIMULATED";
function load() {
	var myOptions = {
		zoom : 3,
		center : new google.maps.LatLng(50.62504, -100.10742),
		mapTypeId : google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);

	mgr = new MarkerManager(map);

	google.maps.event.addListener(mgr, 'loaded', function() {
		google.maps.event.addListener(map, 'idle', function() {
			$("#resultZoom").text(map.getZoom());
			var mapBound = map.getBounds();
			var ne = mapBound.getNorthEast();
			var sw = mapBound.getSouthWest();
			var southWestLat = "Upper Left: " + sw.lat() + " / " + sw.lng();
			var northEastLat = "Lower Right: " + ne.lat() + " / " + ne.lng();
			$("#resultBoundary").html(southWestLat + " And " + northEastLat);
			updateStatus(mgr.getMarkerCount(map.getZoom()));
		});

		var interval = setInterval(function() {
			loadDroneIncurrentView(layerId);
		}, 5000);
	});
}

Auke.utils.createMarker = function(id, posn, title, icon, contentHTML, map) {
	var markerOptions = {
		id : id,
		position : posn,
		title : title,
		icon : icon,
		content : contentHTML
	};
	// if (icon !== false) {
	// markerOptions.shadow = icon.shadow;
	// markerOptions.icon = icon.icon;
	// markerOptions.shape = icon.shape;
	// }

	var marker = new google.maps.Marker(markerOptions);
	Auke.utils.createInfoWindow(marker, map);
	Auke.utils.centerZoom(marker, map);
	return marker;
}

function updateStatus(html) {
	document.getElementById("numberDrone").innerHTML = html;
}

var infoWindow = new google.maps.InfoWindow();
Auke.utils.createInfoWindow = function(marker, map) {
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(marker.content);
		infoWindow.open(map, marker);
	});
}

Auke.utils.centerZoom = function(marker, map) {
	google.maps.event.addListener(marker, 'dblclick', function() {
		var bounds = new google.maps.LatLngBounds();
		bounds.extend(marker.position);
		map.fitBounds(bounds);
	});
}

// ---- Test button
Auke.utils.startAll = function() {
	var mapBound = map.getBounds();
	for ( var i in allmarkers) {
		var oldMarker = allmarkers[i];
		if (mapBound.contains(oldMarker.getPosition())) {
			Auke.utils.start(oldMarker.id)
		}
	}
}

Auke.utils.stopAll = function() {
	var mapBound = map.getBounds();
	for ( var i in allmarkers) {
		var oldMarker = allmarkers[i];
		if (mapBound.contains(oldMarker.getPosition())) {
			Auke.utils.stop(oldMarker.id)
		}
	}
}

function showDroneFromLayer(sel) {
	layerId = sel.value;
	loadDroneIncurrentView(layerId);
}

function reloadMarkers() {
	loadDroneIncurrentView(layerId);
}

Auke.utils.stop = function(id) {
	$.ajax({
		url : 'service/drone/stop/' + id,
		dataType : 'json',
		contentType : "text/html; charset=utf-8",
		success : function(response) {
			var data = response.data[0];
			Auke.utils.changeMarkerPosition(data);
		}
	})
}

Auke.utils.start = function(id) {
	$.ajax({
		url : 'service/drone/start/' + id,
		dataType : 'json',
		contentType : "text/html; charset=utf-8",
		success : function(response) {
			var data = response.data[0];
			Auke.utils.changeMarkerPosition(data);
		}
	})
}

Auke.utils.changeMarkerPosition = function(data) {
	var newPosition = new google.maps.LatLng(data.currentPosition.latitude,
			data.currentPosition.longitude);
	var marker = Auke.utils.allmarkers[data.id];
	marker.setPosition(newPosition);
}

function autoCenter(markers) {
	var bounds = new google.maps.LatLngBounds();
	$.each(markers, function(index, marker) {
		bounds.extend(marker.position);
	});
	map.fitBounds(bounds);
}

//google.maps.event.addDomListener(window, 'load', load);