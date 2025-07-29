// Main application initialization and page switching functionality

// Initialize the application when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  initializeLuckyDraw();
});

// Page switching functionality
function switchPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Remove active class from all nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected page
  document.getElementById(pageId).classList.add('active');
  
  // Add active class to corresponding nav button
  if (pageId === 'gpx-viewer') {
    document.getElementById('gpxViewerNav').classList.add('active');
  } else if (pageId === 'lucky-draw') {
    document.getElementById('luckyDrawNav').classList.add('active');
  } else if (pageId === 'email-preview') {
    document.getElementById('emailPreviewNav').classList.add('active');
    // Initialize email preview when page is shown
    if (window.initializeEmailPreview) {
      window.initializeEmailPreview();
    }
  }
}

// Load Google Maps API
function initializeApp() {
  const script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyA4dgpQZBaVw0DMJHt-pSXstlRqVe-GSOY&callback=initMap&libraries=geometry";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
} 