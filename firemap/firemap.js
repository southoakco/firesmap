// Function to parse URL query parameters
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

// Declare the map and layers variables globally
var map;
var baseLayers = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    })
};
var overlays = {};

// Custom icon for the hotspots
var hotspotIcon = L.icon({
    iconUrl: 'leaf-green.png',
    iconSize: [38, 95], // size of the icon
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
});

document.addEventListener("DOMContentLoaded", function() {
    // Get initial map parameters from the URL
    var mode = getQueryVariable("mode");
    var version = getQueryVariable("version");

    // Initialize the map centered on Boise, Idaho
    map = L.map('map', {
        center: [43.615, -116.2023], // Boise, Idaho coordinates
        zoom: 13,
        layers: [baseLayers['OpenStreetMap']]
    });

    // Log mode and version for debugging
    console.log("Map loaded with mode:", mode, "and version:", version);

    // Layer control setup
    L.control.layers(baseLayers, overlays).addTo(map);

    // Marker group for hotspots
    var hotspotLayer = L.layerGroup().addTo(map);
    overlays["Hotspots"] = hotspotLayer;

    // Fetch and add hotspots to the map
    fetch('hotspots_24hrs.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(hotspot => {
                L.marker([hotspot.latitude, hotspot.longitude], {icon: hotspotIcon})
                    .bindPopup(`Brightness: ${hotspot.brightness}`)
                    .addTo(hotspotLayer);
            });
        })
        .catch(error => console.error('Error loading hotspots:', error));

    // Listen for messages to update the map
    window.addEventListener("message", function(event) {
        // Ensure messages are coming from authorized domains
        if (event.origin !== "https://southoakco.github.io" && event.origin !== "http://localhost") {
            console.error("Received message from unauthorized domain:", event.origin);
            return;
        }

        // Update the map's center if latitude and longitude are provided
        var data = event.data;
        if (data && data.longitude && data.latitude) {
            map.setView([data.latitude, data.longitude], map.getZoom());
        }
    }, false);
});
