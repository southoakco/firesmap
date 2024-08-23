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

document.addEventListener("DOMContentLoaded", function() {
    // Get initial map parameters from the URL
    var mode = getQueryVariable("mode");
    var latitude = parseFloat(getQueryVariable("latitude"));
    var longitude = parseFloat(getQueryVariable("longitude"));
    var version = getQueryVariable("version");

    // Initialize the map with parameters or default values
    map = L.map('map', {
        center: [latitude || 51.505, longitude || -0.09],
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
                L.marker([hotspot.latitude, hotspot.longitude])
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
