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
    var latitude = parseFloat(getQueryVariable("latitude")) || 43.615;
    var longitude = parseFloat(getQueryVariable("longitude")) || -116.2023;

    // Initialize the map centered on Boise, Idaho or URL parameters
    map = L.map('map', {
        center: [latitude, longitude],
        zoom: 13,
        layers: [baseLayers['OpenStreetMap']]
    });

    // Layer control setup
    L.control.layers(baseLayers, overlays).addTo(map);

    // Marker cluster group setup
    var hotspotLayer = L.markerClusterGroup({
        chunkedLoading: true, // Enables lazy loading of markers
        chunkInterval: 20 // Process markers in chunks, adjusting time in milliseconds
    });
    overlays["Hotspots"] = hotspotLayer;
    map.addLayer(hotspotLayer);

    // Fetch the JSON data from Google Cloud Storage
    var googleCloudUrl = 'https://storage.googleapis.com/hotspotbucket1/hotspots_24hr.json';

    fetch(googleCloudUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(hotspot => {
                var marker = L.marker([hotspot.latitude, hotspot.longitude], {
                    icon: L.icon({
                        iconUrl: 'fire.png',
                        iconSize: [38, 95],
                        iconAnchor: [22, 94],
                        popupAnchor: [-3, -76]
                    })
                }).bindPopup(`Coordinates: ${hotspot.latitude.toFixed(3)}, ${hotspot.longitude.toFixed(3)}`);
                hotspotLayer.addLayer(marker);
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
