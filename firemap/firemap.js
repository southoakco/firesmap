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

// Declare the map variable globally to access it throughout the script
var map;

document.addEventListener("DOMContentLoaded", function() {
    // Get initial map parameters from the URL
    var mode = getQueryVariable("mode");
    var latitude = parseFloat(getQueryVariable("latitude"));
    var longitude = parseFloat(getQueryVariable("longitude"));
    var version = getQueryVariable("version");

    // Initialize the map with parameters or default values
    map = L.map('map').setView([latitude || 51.505, longitude || -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Log mode and version for debugging
    console.log("Map loaded with mode:", mode, "and version:", version);

    // Function to add hotspots to the map
    function addHotspotsToMap(hotspots) {
        hotspots.forEach(function(hotspot) {
            L.marker([hotspot.lat, hotspot.lng]).addTo(map)
                .bindPopup(hotspot.description || "No description available");
        });
    }

    // Fetch hotspots JSON from Google Drive
    var hotspotsUrl = 'https://drive.google.com/uc?export=download&id=1_tflO4gAp4KYuAM-mt5GnYEnGjAGsMzo';
    fetch(hotspotsUrl)
        .then(response => response.json())
        .then(addHotspotsToMap)
        .catch(error => console.error('Error fetching hotspots:', error));

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
