let stopwatchTime = 0; // Initial time in seconds (starts at 0)
let stopwatchInterval; // Holds the interval ID for the stopwatch
let isRunning = false; // Flag to track if the stopwatch is currently running

// Function to start the stopwatch
async function startStopwatch() {
    // Try to retrieve the saved time from localStorage to start from there
    const savedTime = getTimerLocalStorageWithExpiry("stopwatchTime");
    if (savedTime) {
        stopwatchTime = parseInt(savedTime, 10);
    }
    updateStopwatchDisplay(); // Update the display with the current time

    // Only start the stopwatch interval if it isn't already running
    if (!isRunning) {
        // Set an interval to increment the stopwatch time every second
        stopwatchInterval = setInterval(async () => {
            stopwatchTime++;
            // saves time to local storage
            setTimerLocalStorageWithExpiry("stopwatchTime", stopwatchTime);
            updateStopwatchDisplay(); // Update the display with the new time
        }, 1000);
        isRunning = true;
    }
}

// Function to stop the stopwatch but keep the current time
function stopStopwatch() {
    clearInterval(stopwatchInterval);
    isRunning = false;
    setTimerLocalStorageWithExpiry("stopwatchTime", stopwatchTime);
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
    return time < 10 ? "0" + time : time;
}

// Function to set to the local storage with expiration date at midnight chicago time

async function setTimerLocalStorageWithExpiry(key, value) {
    var expiryTime;
    // Check if expiration date already exists
    const savedItem = localStorage.getItem(key);

    if (savedItem) {
        const item = JSON.parse(savedItem);
        expiryTime = item.expiry; // Use the existing expiry time
    } else {
        expiryTime = getIndexLocalStorageWithExpiry("expiry");
    }
    const data = {
        value: value,
        expiry: expiryTime
    };
    localStorage.setItem(key, JSON.stringify(data)); // Save data with expiry
}

// Function to pull from local storage and check if expired or not and only return if not expired
function getTimerLocalStorageWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    if (now > item.expiry) {
        localStorage.removeItem(key); // Clear expired data
        return null; // Indicate that the data is expired
    }
    return item.value; // Return the valid data
}
