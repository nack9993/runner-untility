// GPX parsing and utility functions

// GPX Parser
function parseGPX(gpxText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, "text/xml");

  // Check for parsing errors
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid GPX file format");
  }

  let trackPoints = [];
  const trkpts = xmlDoc.getElementsByTagName("trkpt");

  if (trkpts.length === 0) {
    throw new Error("No track points found in GPX file");
  }

  for (let i = 0; i < trkpts.length; i++) {
    const trkpt = trkpts[i];
    const lat = parseFloat(trkpt.getAttribute("lat"));
    const lon = parseFloat(trkpt.getAttribute("lon"));

    const timeElement = trkpt.getElementsByTagName("time")[0];
    const time = timeElement ? new Date(timeElement.textContent) : null;

    const eleElement = trkpt.getElementsByTagName("ele")[0];
    const elevation = eleElement
      ? parseFloat(eleElement.textContent)
      : null;

    trackPoints.push({
      lat: lat,
      lon: lon,
      time: time,
      elevation: elevation,
    });
  }

  // Downsample track points if there are more than 200 points
  if (trackPoints.length > 200) {
    trackPoints = downsampleTrackPoints(trackPoints, 200);
  }

  // Calculate total distance and duration
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 1; i < trackPoints.length; i++) {
    const distance = calculateDistance(
      trackPoints[i - 1].lat,
      trackPoints[i - 1].lon,
      trackPoints[i].lat,
      trackPoints[i].lon
    );
    totalDistance += distance;

    if (trackPoints[i].time && trackPoints[i - 1].time) {
      totalDuration =
        (trackPoints[trackPoints.length - 1].time - trackPoints[0].time) /
        1000;
    }
  }

  return {
    trackPoints: trackPoints,
    totalDistance: totalDistance,
    totalDuration: totalDuration,
  };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function downsampleTrackPoints(trackPoints, maxPoints) {
  if (trackPoints.length <= maxPoints) {
    return trackPoints;
  }

  const downsampledPoints = [];
  const step = (trackPoints.length - 1) / (maxPoints - 1);

  // Always include the first point
  downsampledPoints.push(trackPoints[0]);

  // Select evenly spaced points
  for (let i = 1; i < maxPoints - 1; i++) {
    const index = Math.round(i * step);
    downsampledPoints.push(trackPoints[index]);
  }

  // Always include the last point
  downsampledPoints.push(trackPoints[trackPoints.length - 1]);

  return downsampledPoints;
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return hours + "h " + minutes + "m " + secs + "s";
  } else {
    return minutes + "m " + secs + "s";
  }
} 