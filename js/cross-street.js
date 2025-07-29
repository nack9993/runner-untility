// Cross Street Line Functions

function toggleDrawingMode() {
  isDrawingMode = !isDrawingMode;
  
  if (isDrawingMode) {
    document.getElementById("toggleDrawBtn").textContent = "📏 Drawing...";
    document.getElementById("toggleDrawBtn").style.backgroundColor = "#FF6B35";
    document.getElementById("toggleDrawBtn").style.color = "white";
    document.getElementById("drawingInstructions").style.display = "block";
    map.setOptions({ draggable: false }); // Disable map dragging while drawing
  } else {
    exitDrawingMode();
  }
}

function exitDrawingMode() {
  isDrawingMode = false;
  document.getElementById("toggleDrawBtn").textContent = "📏 Draw Line";
  document.getElementById("toggleDrawBtn").style.backgroundColor = "";
  document.getElementById("toggleDrawBtn").style.color = "";
  document.getElementById("drawingInstructions").style.display = "none";
  map.setOptions({ draggable: true }); // Re-enable map dragging
  
  // Clear any temporary drawing state
  clearTempMarkers();
  drawingPoints = [];
}

function cancelDrawing() {
  exitDrawingMode();
}

function handleMapClick(event) {
  if (!isDrawingMode) return;

  const clickedPoint = {
    lat: event.latLng.lat(),
    lng: event.latLng.lng()
  };

  drawingPoints.push(clickedPoint);

  // Add a temporary marker
  const tempMarker = new google.maps.Marker({
    position: clickedPoint,
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: "#FF6B35",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "Line Point " + drawingPoints.length,
  });

  tempMarkers.push(tempMarker);

  // If we have two points, create the line
  if (drawingPoints.length === 2) {
    createCrossStreetLine(drawingPoints[0], drawingPoints[1]);
    exitDrawingMode();
  }
}

function createCrossStreetLine(point1, point2) {
  const lineId = Date.now(); // Simple unique ID
  
  const crossStreetLine = new google.maps.Polyline({
    path: [point1, point2],
    geodesic: true,
    strokeColor: "#9C27B0", // Purple color for cross street lines
    strokeOpacity: 1.0,
    strokeWeight: 3,
    strokeStyle: 'solid'
  });

  crossStreetLine.setMap(map);

  // Add start and end markers for the line
  const startMarker = new google.maps.Marker({
    position: point1,
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: "#9C27B0",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "Cross Street Start",
  });

  const endMarker = new google.maps.Marker({
    position: point2,
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: "#9C27B0",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "Cross Street End",
  });

  // Calculate distance
  const distance = calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);

  // Store the line data
  const lineData = {
    id: lineId,
    polyline: crossStreetLine,
    startMarker: startMarker,
    endMarker: endMarker,
    point1: point1,
    point2: point2,
    distance: distance
  };

  crossStreetLines.push(lineData);
  updateCrossStreetList();
}

function updateCrossStreetList() {
  const listContainer = document.getElementById("crossStreetList");
  listContainer.innerHTML = "";

  if (crossStreetLines.length === 0) {
    listContainer.innerHTML = "<p style='color: #666; font-size: 12px; margin: 8px 0;'>No cross street lines created</p>";
    return;
  }

  crossStreetLines.forEach((lineData, index) => {
    const lineItem = document.createElement("div");
    lineItem.className = "cross-street-item";
    lineItem.innerHTML = `
      <div class="line-info">
        <strong>Line ${index + 1}</strong>
        <span>${lineData.distance.toFixed(2)} km</span>
      </div>
      <button class="delete-line-btn" onclick="deleteCrossStreetLine(${lineData.id})">✕</button>
    `;
    listContainer.appendChild(lineItem);
  });
}

function deleteCrossStreetLine(lineId) {
  const lineIndex = crossStreetLines.findIndex(line => line.id === lineId);
  if (lineIndex === -1) return;

  const lineData = crossStreetLines[lineIndex];
  
  // Remove from map
  lineData.polyline.setMap(null);
  lineData.startMarker.setMap(null);
  lineData.endMarker.setMap(null);

  // Remove from array
  crossStreetLines.splice(lineIndex, 1);
  
  // Update the list
  updateCrossStreetList();
}

function clearTempMarkers() {
  tempMarkers.forEach(marker => marker.setMap(null));
  tempMarkers = [];
}

function clearAllCrossStreetLines() {
  crossStreetLines.forEach(lineData => {
    lineData.polyline.setMap(null);
    lineData.startMarker.setMap(null);
    lineData.endMarker.setMap(null);
  });
  crossStreetLines = [];
  updateCrossStreetList();
} 