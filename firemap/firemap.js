// Declare the map variable globally so it can be accessed in any function
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
    // Initialize the map on the 'map' div
    map = L.map('map').setView([51.505, -0.09], 13); // Set a default center and zoom level
    // Get initial map parameters from the URL
    var mode = getQueryVariable("mode");
    var latitude = parseFloat(getQueryVariable("latitude"));
    var longitude = parseFloat(getQueryVariable("longitude"));
    var version = getQueryVariable("version");

    // Add a tile layer to the map using OpenStreetMap tiles
    // Initialize the map with parameters or default values
    map = L.map('map').setView([latitude || 51.505, longitude || -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Listen for messages sent to the window
    // Log mode and version for debugging
    console.log("Map loaded with mode:", mode, "and version:", version);

    // Listen for messages to update the map
    window.addEventListener("message", function(event) {
        // Check the origin to make sure messages are sent from your allowed domains
        // Ensure messages are coming from authorized domains
        if (event.origin !== "https://southoakco.github.io" && event.origin !== "http://localhost") {
            console.error("Received message from unauthorized domain:", event.origin);
            return;
        }

        // Check if data contains latitude and longitude
        if (event.data.latitude && event.data.longitude) {
            console.log("Received coordinates:", event.data.latitude, event.data.longitude);
            // Center the map on the received coordinates
            map.setView([event.data.latitude, event.data.longitude], map.getZoom());
        } else {
            console.error("Received incomplete data:", event.data);
        // Update the map's center if latitude and longitude are provided
        var data = event.data;
        if (data && data.longitude && data.latitude) {
            map.setView([data.latitude, data.longitude], map.getZoom());
        }
    }, false);
});
