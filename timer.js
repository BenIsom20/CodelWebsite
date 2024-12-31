// JAVASCRIPT FOR THE TIMER

let stopwatchTime = 0; // Initial time in seconds (starts at 0)
let stopwatchInterval; // Holds the interval ID for the stopwatch
let isRunning = false; // Flag to track if the stopwatch is currently running

// Function to start the stopwatch
function startStopwatch() {
    // Try to retrieve the saved time from localStorage (if any)
    const savedTime = getLocalStorageWithExpiry("stopwatchTime");
    if (savedTime) {
        stopwatchTime = parseInt(savedTime, 10); // If a saved time exists, restore it
    }
    updateStopwatchDisplay(); // Update the display with the current time

    // Only start the stopwatch interval if it isn't already running
    if (!isRunning) {
        // Set an interval to increment the stopwatch time every second
        stopwatchInterval = setInterval(() => {
            stopwatchTime++; // Increment the stopwatch time by 1 second
            updateStopwatchDisplay(); // Update the display with the new time
            setLocalStorageWithExpiry("stopwatchTime", stopwatchTime); // Save the updated time with expiry
        }, 1000);
        isRunning = true; // Set isRunning to true to indicate the stopwatch is running
    }
}

// Function to stop the stopwatch but keep the current time
function stopStopwatch() {
    clearInterval(stopwatchInterval); // Clear the interval to stop the stopwatch
    isRunning = false; // Set isRunning to false to indicate the stopwatch is stopped
    setLocalStorageWithExpiry("stopwatchTime", stopwatchTime); // Save the current time with expiry
}

// Function to update the display of the stopwatch
function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchTime / 3600); // Calculate hours from total seconds
    const minutes = Math.floor((stopwatchTime % 3600) / 60); // Calculate minutes from remaining seconds
    const seconds = stopwatchTime % 60; // Calculate remaining seconds
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`; // Format time as HH:MM:SS
    document.getElementById("stopwatch").textContent = formattedTime; // Update the DOM with the formatted time
}

// Function to pad the time with a leading zero if it's less than 10
function padZero(time) {
    return time < 10 ? "0" + time : time; // If time is less than 10, add a leading zero
}


function setLocalStorageWithExpiry(key, value) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Next midnight
    const expiryTime = midnight.getTime(); // Get timestamp for midnight

    const data = {
        value: value,
        expiry: expiryTime,
    };

    localStorage.setItem(key, JSON.stringify(data));
}

function getLocalStorageWithExpiry(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
        return null; // No data found
    }

    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
        localStorage.removeItem(key); // Clear expired data
        return null; // Indicate that the data is expired
    }

    return item.value; // Return the valid data
}



