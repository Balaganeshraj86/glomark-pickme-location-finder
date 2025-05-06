// Store locations with coordinates
const stores = [
    { id: "store-wattala", name: "Glomark Wattala", lat: 6.991337, lng: 79.889625 },
    { id: "store-kandy", name: "Glomark Kandy", lat: 7.293497, lng: 80.635010 },
    { id: "store-kandana", name: "Glomark Kandana", lat: 7.048293, lng: 79.892387 },
    { id: "store-thalawathugoda", name: "Glomark Thalawathugoda", lat: 6.872935, lng: 79.909944 },
    { id: "store-negombo", name: "Glomark Negombo", lat: 7.211580, lng: 79.839279 },
    { id: "store-kurunegala", name: "Glomark Kurunegala", lat: 7.484999, lng: 80.362739 },
    { id: "store-kottawa", name: "Glomark Kottawa", lat: 6.841352, lng: 79.968410 },
    { id: "store-mtlavinia", name: "Glomark Mount Lavinia", lat: 6.839844, lng: 79.867409 },
    { id: "store-nawala", name: "Glomark Nawala", lat: 6.894882, lng: 79.889051 }
];

// Google Maps travel time data (based on screenshot)
const travelTimeData = {
    // Attidiya area coordinates
    "attidiya": {
        center: { lat: 6.847362, lng: 79.881989 },
        radius: 0.5, // km
        routes: {
            "store-mtlavinia": {
                time: 7, // minutes (as per Google Maps)
                distance: 3.0 // km (as per Google Maps)
            }
        }
    },
    // Kawdana area
    "kawdana": {
        center: { lat: 6.847000, lng: 79.873000 },
        radius: 0.5,
        routes: {
            "store-mtlavinia": {
                time: 8, // minutes (as per Google Maps)
                distance: 2.8 // km (as per Google Maps)
            }
        }
    }
};

// Reference points for specific areas
const referencePoints = [
    { name: "attidiya", ...travelTimeData.attidiya },
    { name: "kawdana", ...travelTimeData.kawdana }
];

let userLat = null;
let userLng = null;
const nearbyDistanceThreshold = 5; // km
let nearbyStores = [];
let userArea = null;

// Elements
const locationMessage = document.getElementById("location-status");
const nearbyStoresCount = document.getElementById("nearby-stores-count");
const nearbyPopup = document.getElementById("nearby-popup");
const nearbyStoresList = document.getElementById("nearby-stores-list");
const loader = document.getElementById("loader");

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    getUserLocation();
});

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        // Show loading indicator if available
        if (loader) {
            loader.style.display = "flex";
        }
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                // Hide loading indicator
                if (loader) {
                    loader.style.display = "none";
                }
                
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                
                // Check if user is in a special reference area
                userArea = checkUserArea(userLat, userLng);
                
                if (userArea) {
                    // Handle location based on Google Maps data
                    handleSpecificAreaLocation(userArea);
                } else {
                    // Normal flow for locations without specific Google Maps data
                    findNearestStore();
                }
            },
            function(error) {
                // Hide loading indicator
                if (loader) {
                    loader.style.display = "none";
                }
                
                handleLocationError(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        locationMessage.textContent = "Geolocation is not supported by this browser.";
    }
}

// Check if user is in a special reference area
function checkUserArea(lat, lng) {
    for (const area of referencePoints) {
        const distance = calculateDistance(lat, lng, area.center.lat, area.center.lng);
        if (distance <= area.radius) {
            return area.name;
        }
    }
    return null;
}

// Handle location for specific areas with Google Maps data
function handleSpecificAreaLocation(areaName) {
    const areaData = travelTimeData[areaName];
    
    // Find the closest store based on Google Maps data
    let closestStoreId = null;
    let minTime = Infinity;
    
    for (const storeId in areaData.routes) {
        const routeData = areaData.routes[storeId];
        if (routeData.time < minTime) {
            minTime = routeData.time;
            closestStoreId = storeId;
        }
    }
    
    if (closestStoreId) {
        const closestStore = stores.find(store => store.id === closestStoreId);
        const routeData = areaData.routes[closestStoreId];
        
        if (closestStore && routeData) {
            locationMessage.innerHTML = `
                Your nearest store is <strong>${closestStore.name}</strong> 
                (${routeData.time} min / ${routeData.distance} km away).
            `;
            
            // Highlight the nearest store
            highlightNearestStore(closestStoreId);
            
            // Add to nearby stores
            nearbyStores = [{ 
                id: closestStoreId, 
                name: closestStore.name, 
                distance: routeData.time, 
                unit: "min" 
            }];
            
            // Find other nearby stores
            findOtherNearbyStores();
            
            // Update nearby stores count
            updateNearbyStoresCount();
        }
    } else {
        // Fallback to regular distance calculation
        findNearestStore();
    }
}

// Find other nearby stores
function findOtherNearbyStores() {
    if (userLat === null || userLng === null) return;
    
    // Calculate distances to all stores
    stores.forEach(store => {
        // Skip stores already in the nearbyStores list
        if (nearbyStores.some(ns => ns.id === store.id)) return;
        
        const distance = calculateDistance(userLat, userLng, store.lat, store.lng);
        
        if (distance <= nearbyDistanceThreshold) {
            // Convert km to minutes (assuming average speed of 20 km/h)
            const timeMinutes = Math.round(distance * 3); // 3 minutes per km as a rough estimate
            
            nearbyStores.push({
                id: store.id,
                name: store.name,
                distance: timeMinutes,
                unit: "min"
            });
        }
    });
    
    // Sort by travel time
    nearbyStores.sort((a, b) => a.distance - b.distance);
}

// Find the nearest store using direct distance
function findNearestStore() {
    if (userLat === null || userLng === null) {
        locationMessage.textContent = "Location not available.";
        return;
    }

    // Calculate distances to all stores
    const storesWithDistances = stores.map(store => {
        const distance = calculateDistance(userLat, userLng, store.lat, store.lng);
        // Convert km to minutes (assuming average speed of 20 km/h)
        const timeMinutes = Math.round(distance * 3); // 3 minutes per km as a rough estimate
        return { ...store, distance, timeMinutes };
    });

    // Sort by distance
    storesWithDistances.sort((a, b) => a.distance - b.distance);
    
    // Nearest store
    const nearestStore = storesWithDistances[0];
    
    // Display nearest store info with both distance and time
    locationMessage.innerHTML = `
        Your nearest store is <strong>${nearestStore.name}</strong> 
        (${nearestStore.timeMinutes} min / ${nearestStore.distance.toFixed(1)} km away).
    `;
    
    // Highlight the nearest store button
    highlightNearestStore(nearestStore.id);
    
    // Find nearby stores (within threshold)
    nearbyStores = storesWithDistances
        .filter(store => store.distance <= nearbyDistanceThreshold)
        .map(store => ({
            id: store.id,
            name: store.name,
            distance: store.timeMinutes,
            unit: "min"
        }));
    
    // Update nearby stores count
    updateNearbyStoresCount();
}

// Update the count of nearby stores
function updateNearbyStoresCount() {
    nearbyStoresCount.textContent = nearbyStores.length;
    
    if (nearbyStores.length > 1) {
        nearbyStoresCount.style.display = "block";
        nearbyStoresCount.addEventListener("click", showNearbyStores);
    } else {
        nearbyStoresCount.style.display = "none";
    }
}

// Show the nearby stores popup
function showNearbyStores() {
    // Clear the list
    nearbyStoresList.innerHTML = "";
    
    // Add each nearby store to the list
    nearbyStores.forEach(store => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <strong>${store.name}</strong>: ${store.distance} ${store.unit}
            <button class="select-store" data-store-id="${store.id}">Select</button>
        `;
        nearbyStoresList.appendChild(listItem);
    });
    
    // Add event listeners to the select buttons
    document.querySelectorAll(".select-store").forEach(button => {
        button.addEventListener("click", function() {
            const storeId = this.getAttribute("data-store-id");
            selectStore(storeId);
            closePopup();
        });
    });
    
    // Show the popup
    nearbyPopup.style.display = "block";
}

// Close the nearby stores popup
function closePopup() {
    nearbyPopup.style.display = "none";
}

// Select a store (highlight it)
function selectStore(storeId) {
    // Remove highlight from all stores
    stores.forEach(store => {
        const element = document.getElementById(store.id);
        if (element) {
            element.querySelector("button").classList.remove("nearest");
        }
    });
    
    // Add highlight to selected store
    const selectedElement = document.getElementById(storeId);
    if (selectedElement) {
        selectedElement.querySelector("button").classList.add("nearest");
    }
}

// Highlight the nearest store
function highlightNearestStore(storeId) {
    stores.forEach(store => {
        const element = document.getElementById(store.id);
        if (element) {
            const button = element.querySelector("button");
            if (store.id === storeId) {
                button.classList.add("nearest");
            } else {
                button.classList.remove("nearest");
            }
        }
    });
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Handle location errors
function handleLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            locationMessage.textContent = "Location access denied. Please enable location services.";
            break;
        case error.POSITION_UNAVAILABLE:
            locationMessage.textContent = "Location information unavailable.";
            break;
        case error.TIMEOUT:
            locationMessage.textContent = "Location request timed out.";
            break;
        case error.UNKNOWN_ERROR:
            locationMessage.textContent = "An unknown error occurred.";
            break;
    }
}

// Fix for automatic redirection issue
document.addEventListener("DOMContentLoaded", function() {
    // Get all store links
    const storeLinks = document.querySelectorAll("#store-buttons a");
    
    // Prevent automatic navigation by stopping the default behavior
    storeLinks.forEach(link => {
        const originalHref = link.getAttribute("href");
        const storeButton = link.querySelector("button");
        
        // Remove the href attribute from the link
        link.removeAttribute("href");
        
        // Add click event to the button
        storeButton.addEventListener("click", function() {
            // Navigate to the original href
            window.location.href = originalHref;
        });
    });
});