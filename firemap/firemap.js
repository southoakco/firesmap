// Declare the map variable globally so it can be accessed in any function
var map;

document.addEventListener("DOMContentLoaded", function() {
    // Initialize the map on the 'map' div
    map = L.map('map').setView([51.505, -0.09], 13); // Set a default center and zoom level

    // Add a tile layer to the map using OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Listen for messages sent to the window
    window.addEventListener("message", function(event) {
        // Check the origin to make sure messages are sent from your allowed domains
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
        }
    }, false);
});
