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
        chunkedLoading: true,
        chunkInterval: 20
    });
    overlays["Hotspots"] = hotspotLayer;
    map.addLayer(hotspotLayer);

    // Fetch and add hotspots from the CSV file
    fetch('https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv')
        .then(response => response.text())
        .then(text => {
            var data = Papa.parse(text, {
                header: true,
                skipEmptyLines: true
            }).data;
            data.forEach(hotspot => {
                var latitude = parseFloat(hotspot.latitude);
                var longitude = parseFloat(hotspot.longitude);
                if (!isNaN(latitude) && !isNaN(longitude)) {
                    L.marker([latitude, longitude], {
                        icon: L.icon({
                            iconUrl: 'fire.png',
                            iconSize: [38, 95],
                            iconAnchor: [22, 94],
                            popupAnchor: [-3, -76]
                        })
                    }).addTo(hotspotLayer);
                }
            });
        })
        .catch(error => console.error('Error loading hotspots from CSV:', error));

    // Listen for messages to update the map
    window.addEventListener("message", function(event) {
        if (event.origin !== "https://southoakco.github.io" && event.origin !== "http://localhost") {
            console.error("Received message from unauthorized domain:", event.origin);
            return;
        }
        var data = event.data;
        if (data && data.longitude && data.latitude) {
            map.setView([data.latitude, data.longitude], map.getZoom());
        }
    }, false);
});
