# Glomark Store Locator

A responsive web application that helps users find the closest Glomark stores based on their location. The application uses geolocation to identify nearby stores within a 5km radius and highlights the nearest store for quick access.

## Features

- Geolocation-based store detection
- Displays stores within 5km radius
- Highlights the nearest store with visual indicators
- Mobile-optimized with automatic redirection to the nearest store
- Interactive popup showing all nearby stores sorted by distance
- Attempts to open the PickMe app on mobile devices before redirecting to web links

## Files Structure

- `index.html` - Main HTML document
- `styles.css` - CSS styling for the application
- `script.js` - JavaScript functionality
- `logo.png` - Glomark logo image (placeholder)

## Store Data

The application includes the following Glomark stores with their coordinates:

1. Glomark Wattala
2. Glomark Kandy
3. Glomark Kandana
4. Glomark Thalawathugoda
5. Glomark Negombo
6. Glomark Kurunegala
7. Glomark Kottawa
8. Glomark Mount Lavinia
9. Glomark Nawala

## How It Works

1. On page load, the application requests the user's location
2. Calculates distance to all stores using the Haversine formula
3. Identifies stores within 5km radius and determines the nearest store
4. Highlights stores with color-coded buttons (blue for nearby, green for nearest)
5. On mobile devices, automatically redirects to the nearest store after a brief delay
6. Shows a popup with all nearby stores for selection

## Implementation Details

- Uses HTML5 Geolocation API
- Responsive design for both mobile and desktop
- No external dependencies required
- Smooth animations and transitions for better user experience
- Fallback mechanisms for handling errors and unsupported browsers

## Installation

Simply copy all files to your web server and ensure they are in the same directory. No additional setup is required.

## Usage

Open `index.html` in a web browser. Allow location access when prompted to see nearby stores.

## Note

The store links are configured to integrate with the PickMe app. On first access, the application will attempt to open the PickMe app if installed, then redirect to the appropriate web link.
