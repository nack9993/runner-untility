// GPX Viewer functionality

// Global variables
let map;
let gpxData = null;
let trackPolyline = null;
let progressivePolyline = null; // Progressive polyline for animation
let directionMarkers = [];
let progressiveArrows = []; // Progressive arrows for animation
let currentMarker = null;
let animationInterval = null;
let currentPointIndex = 0;
let isPlaying = false;
let progressiveDots = []; // Array to store progressive dots during animation
let isAnimationMode = false; // Track if we're in animation mode

// Cross street line variables
let crossStreetLines = []; // Array to store all cross street lines
let isDrawingMode = false; // Track if we're in drawing mode
let drawingPoints = []; // Array to store points while drawing
let tempMarkers = []; // Temporary markers while drawing

// Convoy variables for multiple moving pins
let convoyMarkers = []; // Array to store all moving markers (default pin + avatars)

function initMap() {
  // Initialize Google Map
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
    mapTypeId: "terrain",
  });

  // Set up file upload handler
  document
    .getElementById("gpxFile")
    .addEventListener("change", handleFileUpload);

  // Set up playback controls
  document
    .getElementById("playBtn")
    .addEventListener("click", startAnimation);
  document
    .getElementById("pauseBtn")
    .addEventListener("click", pauseAnimation);
  document
    .getElementById("resetBtn")
    .addEventListener("click", resetAnimation);
  document
    .getElementById("speedSlider")
    .addEventListener("input", updateSpeed);

  // Set up cross street line controls
  document
    .getElementById("toggleDrawBtn")
    .addEventListener("click", toggleDrawingMode);
  document
    .getElementById("cancelDrawBtn")
    .addEventListener("click", cancelDrawing);

  // Set up map click listener for drawing lines
  map.addListener("click", handleMapClick);
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".gpx")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        gpxData = parseGPX(e.target.result);
        displayTrack();
        showTrackInfo();
        document.getElementById("playbackSection").style.display = "block";
        document.getElementById("crossStreetSection").style.display = "block";
      } catch (error) {
        alert("Error parsing GPX file: " + error.message);
      }
    };
    reader.readAsText(file);
  } else {
    alert("Please select a valid GPX file.");
  }
}

function displayTrack() {
  if (!gpxData || !gpxData.trackPoints.length) return;

  // Clear previous track
  clearTrack();

  // Create polyline for the track
  const path = gpxData.trackPoints.map((point) => ({
    lat: point.lat,
    lng: point.lon,
  }));

  trackPolyline = new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: "#FF6B35",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  });

  trackPolyline.setMap(map);

  // Add direction arrows
  addDirectionArrows();

  // Fit map to track bounds
  const bounds = new google.maps.LatLngBounds();
  path.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds);

  // Add start and end markers
  addStartEndMarkers();
}

function addDirectionArrows() {
  const points = gpxData.trackPoints;
  const arrowInterval = Math.max(1, Math.floor(points.length / 20)); // Show ~20 arrows max

  for (let i = 0; i < points.length - 1; i += arrowInterval) {
    const start = new google.maps.LatLng(points[i].lat, points[i].lon);
    const end = new google.maps.LatLng(
      points[i + 1].lat,
      points[i + 1].lon
    );

    const heading = google.maps.geometry.spherical.computeHeading(
      start,
      end
    );

    const arrowMarker = new google.maps.Marker({
      position: start,
      map: map,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        fillColor: "#FF6B35",
        fillOpacity: 0.8,
        strokeColor: "#FFFFFF",
        strokeWeight: 1,
        rotation: heading,
      },
      title: "Point " + (i + 1),
    });

    directionMarkers.push(arrowMarker);
  }
}

function addStartEndMarkers() {
  const points = gpxData.trackPoints;
  if (points.length === 0) return;

  // Start marker
  new google.maps.Marker({
    position: { lat: points[0].lat, lng: points[0].lon },
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#FF6B35",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "Start",
  });

  // End marker
  const lastPoint = points[points.length - 1];
  new google.maps.Marker({
    position: { lat: lastPoint.lat, lng: lastPoint.lon },
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#CC5500",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "End",
  });
}

function clearTrack() {
  if (trackPolyline) {
    trackPolyline.setMap(null);
    trackPolyline = null;
  }

  directionMarkers.forEach((marker) => marker.setMap(null));
  directionMarkers = [];

  // Clear progressive dots
  progressiveDots.forEach((marker) => marker.setMap(null));
  progressiveDots = [];

  if (currentMarker) {
    currentMarker.setMap(null);
    currentMarker = null;
  }

  // Clear convoy markers
  convoyMarkers.forEach((marker) => marker.setMap(null));
  convoyMarkers = [];

  // Clear cross street lines
  clearAllCrossStreetLines();
}

function showTrackInfo() {
  if (!gpxData) return;

  document.getElementById("totalPoints").textContent =
    gpxData.trackPoints.length;
  document.getElementById("totalDistance").textContent =
    gpxData.totalDistance.toFixed(2) + " km";
  document.getElementById("totalDuration").textContent = formatDuration(
    gpxData.totalDuration
  );
  document.getElementById("trackInfo").style.display = "block";
}

function startAnimation() {
  if (!gpxData || isPlaying) return;

  isPlaying = true;
  isAnimationMode = true;
  
  // Clear the static track and show only start marker
  clearStaticTrack();
  addStartMarker();
  
  // Initialize convoy for smooth animation
  initializeConvoy();
  
  // Set initial zoom level for smooth tracking
  map.setZoom(16);
  
  const speed = parseInt(document.getElementById("speedSlider").value);
  const interval = Math.max(30, 300 / speed); // Minimum 30ms interval for smoother animation

  animationInterval = setInterval(() => {
    if (currentPointIndex >= gpxData.trackPoints.length) {
      pauseAnimation();
      addEndMarker(); // Add end marker when animation completes
      return;
    }

    showCurrentPoint();
    updateProgressiveTrack();
    currentPointIndex++;
    updateProgress();
  }, interval);
}

function pauseAnimation() {
  isPlaying = false;
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  
  // If animation completes, exit animation mode and show full track
  if (currentPointIndex >= gpxData.trackPoints.length) {
    isAnimationMode = false;
    // Keep the progressive track visible after completion
  }
}

function resetAnimation() {
  pauseAnimation();
  currentPointIndex = 0;
  isAnimationMode = false;
  
  // Clear progressive elements
  progressiveDots.forEach((marker) => marker.setMap(null));
  progressiveDots = [];
  
  progressiveArrows.forEach((marker) => marker.setMap(null));
  progressiveArrows = [];

  if (currentMarker) {
    currentMarker.setMap(null);
    currentMarker = null;
  }
  
  if (progressivePolyline) {
    progressivePolyline.setMap(null);
    progressivePolyline = null;
  }
  
  // Restore full track view
  displayTrack();
  updateProgress();
}

function showCurrentPoint() {
  if (!gpxData || currentPointIndex >= gpxData.trackPoints.length) return;

  const point = gpxData.trackPoints[currentPointIndex];

  // Add a progressive dot at the current point
  const progressiveDot = new google.maps.Marker({
    position: { lat: point.lat, lng: point.lon },
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 4,
      fillColor: "#F7931E", // Orange color for progressive dots
      fillOpacity: 0.8,
      strokeColor: "#CC5500", // Dark orange border
      strokeWeight: 1,
    },
    title: "Track Point " + (currentPointIndex + 1),
  });

  // Store the dot in our progressive dots array
  progressiveDots.push(progressiveDot);

  // Clear legacy current marker if it exists
  if (currentMarker) {
    currentMarker.setMap(null);
    currentMarker = null;
  }

  // Initialize convoy if not already created
  if (convoyMarkers.length === 0) {
    initializeConvoy();
  }

  // Update convoy positions smoothly
  updateConvoyPositions(point);

  // Smoothly pan the map to follow the moving pin
  map.panTo({ lat: point.lat, lng: point.lon });
}

function initializeConvoy() {
  // Clear existing convoy markers
  convoyMarkers.forEach((marker) => marker.setMap(null));
  convoyMarkers = [];

  // Create main default pin
  const mainMarker = new google.maps.Marker({
    position: { lat: 0, lng: 0 }, // Will be updated by updateConvoyPositions
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#FFB366",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 3,
    },
    title: "Main Position",
    zIndex: 1000,
  });
  convoyMarkers.push(mainMarker);
}

function updateConvoyPositions(point) {
  if (convoyMarkers.length === 0) return;

  // Update main pin position
  if (convoyMarkers[0]) {
    convoyMarkers[0].setPosition({ lat: point.lat, lng: point.lon });
    convoyMarkers[0].setTitle("Main Position - Point " + (currentPointIndex + 1));
  }
}

function clearStaticTrack() {
  if (trackPolyline) {
    trackPolyline.setMap(null);
    trackPolyline = null;
  }
  
  directionMarkers.forEach((marker) => marker.setMap(null));
  directionMarkers = [];
}

function addStartMarker() {
  const points = gpxData.trackPoints;
  if (points.length === 0) return;

  new google.maps.Marker({
    position: { lat: points[0].lat, lng: points[0].lon },
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#FF6B35",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "Start",
  });
}

function addEndMarker() {
  const points = gpxData.trackPoints;
  if (points.length === 0) return;

  const lastPoint = points[points.length - 1];
  new google.maps.Marker({
    position: { lat: lastPoint.lat, lng: lastPoint.lon },
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#CC5500",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "End",
  });
}

function updateProgressiveTrack() {
  if (!gpxData || currentPointIndex <= 0) return;
  
  // Update progressive polyline
  const progressivePath = gpxData.trackPoints.slice(0, currentPointIndex + 1).map((point) => ({
    lat: point.lat,
    lng: point.lon,
  }));

  if (progressivePolyline) {
    progressivePolyline.setMap(null);
  }

  progressivePolyline = new google.maps.Polyline({
    path: progressivePath,
    geodesic: true,
    strokeColor: "#FF6B35",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  });

  progressivePolyline.setMap(map);

  // Add direction arrow every 10 points to avoid too many arrows
  if (currentPointIndex > 0 && currentPointIndex % 10 === 0) {
    const points = gpxData.trackPoints;
    const start = new google.maps.LatLng(points[currentPointIndex - 1].lat, points[currentPointIndex - 1].lon);
    const end = new google.maps.LatLng(points[currentPointIndex].lat, points[currentPointIndex].lon);

    const heading = google.maps.geometry.spherical.computeHeading(start, end);

    const arrowMarker = new google.maps.Marker({
      position: start,
      map: map,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        fillColor: "#FF6B35",
        fillOpacity: 0.8,
        strokeColor: "#FFFFFF",
        strokeWeight: 1,
        rotation: heading,
      },
      title: "Point " + currentPointIndex,
    });

    progressiveArrows.push(arrowMarker);
  }
}

function updateProgress() {
  if (!gpxData) return;

  const progress = (currentPointIndex / gpxData.trackPoints.length) * 100;
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById("progressText").textContent =
    Math.round(progress) + "%";
  document.getElementById("currentPoint").textContent =
    currentPointIndex + 1 + " / " + gpxData.trackPoints.length;
}

function updateSpeed() {
  const speed = document.getElementById("speedSlider").value;
  document.getElementById("speedValue").textContent = speed + "x";

  if (isPlaying) {
    pauseAnimation();
    startAnimation();
  }
} 