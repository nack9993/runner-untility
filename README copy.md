# GPX Track Viewer

A web application to visualize GPX tracks on Google Maps with directional indicators and playback controls.

## Features

- **GPX File Upload**: Support for standard GPX file format
- **Interactive Map**: Display tracks on Google Maps with terrain view
- **Directional Arrows**: Show movement direction along the track
- **Track Animation**: Play back the route with adjustable speed
- **Track Information**: Display total distance, duration, and point count
- **Start/End Markers**: Clear indicators for track beginning and end
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API and Geometry Library
4. Create credentials (API Key)
5. Replace `YOUR_API_KEY` in `index.html` with your actual API key

### 2. Run the Application

1. Open `index.html` in your web browser
2. Or serve it using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

### 3. Using the Application

1. Click "Choose GPX File" to upload your GPX track file
2. The track will be displayed on the map with:
   - Red line showing the complete path
   - Directional arrows indicating movement direction
   - Green marker at the start point
   - Red marker at the end point
3. Use the playback controls to animate the route:
   - **Play**: Start the animation
   - **Pause**: Pause the animation
   - **Reset**: Reset to the beginning
   - **Speed Slider**: Adjust animation speed (1x to 10x)
4. Track information panel shows:
   - Total number of track points
   - Total distance in kilometers
   - Total duration (if time data is available)
   - Current animation progress

## File Structure

```
gpx-map-viewer/
├── index.html      # Main application file
├── styles.css      # Styling and responsive design
├── sample.gpx      # Sample GPX file for testing
└── README.md       # This documentation
```

## GPX File Format

The application supports standard GPX files with the following structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <name>Track Name</name>
    <trkseg>
      <trkpt lat="latitude" lon="longitude">
        <ele>elevation</ele>
        <time>timestamp</time>
      </trkpt>
      <!-- More track points -->
    </trkseg>
  </trk>
</gpx>
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Testing

A sample GPX file (`sample.gpx`) is included for testing. This file contains a simple track in San Francisco with 10 points.

## Troubleshooting

### Map not loading
- Check that you've replaced `YOUR_API_KEY` with a valid Google Maps API key
- Ensure the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for any error messages

### GPX file not parsing
- Ensure the file is in valid GPX format
- Check that the file contains `<trkpt>` elements with lat/lon attributes
- Try the included sample.gpx file first

### Animation not working
- Ensure the GPX file was loaded successfully
- Check that track points are available
- Try refreshing the page and re-uploading the file

## Technical Details

### Libraries Used
- Google Maps JavaScript API
- Native JavaScript (no external dependencies)

### Key Functions
- **parseGPX()**: Parses GPX XML and extracts track points
- **displayTrack()**: Renders the track on Google Maps
- **addDirectionArrows()**: Adds directional indicators
- **startAnimation()**: Animates track playback
- **calculateDistance()**: Computes distances using Haversine formula

## License

This project is open source and available under the MIT License.
