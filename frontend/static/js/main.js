let publicIp = "127.0.0.1"

// Function to retrieve user data from the backend and initialize the application state
async function getUserData() {
    // Retrieve JWT token and grid state from local storage
    const token = localStorage.getItem("jwt_token");

    const gridData = getIndexLocalStorageWithExpiry("gridState");
    // Send a GET request to the backend to fetch user data
    const response = await fetch(`http://${publicIp}:5000/get_user_data`, {
        method: "GET",  // GET method is used to retrieve data from the server
        headers: { 'Authorization': `Bearer ${token}` },  // Include the token for authorization
    });

    // Parse the JSON response from the backend
    const result = await response.json();
    const time = result.time;  // Retrieved stopwatch time
    const code = result.code;  // Retrieved saved code
    const grid = result.grid;  // Retrieved grid state
    let completed = result.completed;
    var victory = null;
    if(completed === 1){
        victory = true;
    }

    // If all required data is present, save it to local storage and initialize the app
    if (time && code && grid && victory) {
        setIndexLocalStorageWithExpiry("stopwatchTime", time);
        setIndexLocalStorageWithExpiry("savedCode", code);
        setIndexLocalStorageWithExpiry("gridState", grid);
        loadCode();           // Load the saved code into the editor
        startStopwatch();     // Start the stopwatch with the saved time
        loadGridState();      // Restore the grid state
    } 
    else if (time && code && grid) {
        setIndexLocalStorageWithExpiry("savedCode", code);
        setIndexLocalStorageWithExpiry("gridState", grid);
        loadCode();           // Load the saved code into the editor
        startStopwatch();     // Start the stopwatch with the saved time
        loadGridState();      // Restore the grid state
    }
    else {
        // If some data is missing, initialize components with available data
        startStopwatch();     // Start a new stopwatch session
        if (gridData) {
            loadGridState();  // Restore grid state if available
        } else {
            initializeColumn();  // Initialize a new column structure if no grid data exists
        }
        await loadCode();           // Load code into the editor 
    }
}

function clearExpiredLocalStorage() {
    const now = new Date().getTime();

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const itemStr = localStorage.getItem(key);
            try {
                const item = JSON.parse(itemStr);

                if (item && item.expiry && now > item.expiry) {
                    localStorage.removeItem(key); // Remove only expired items
                }
            } catch (e) {
                // If parsing fails, ignore (likely non-expiry-related data)
            }
        }
    }
}

// ONE SINGULAR ONLOAD FUNCTION -->
// This function is executed when the window finishes loading
window.onload = async function () {
    // Listen for the pageshow event to handle back navigation or cache restoration
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    });

    document.body.classList.add('fade-in');
    clearExpiredLocalStorage(); // Clear expired data from localStorage

    // Fetch and display test explanation (assumes fetchTestExplanation is defined elsewhere)
    fetchTestExplanation();

    // Retrieve the JWT token and grid state from local storage
    const token = localStorage.getItem("jwt_token");
    const gridData = getIndexLocalStorageWithExpiry("gridState");

    // Check if the token exists in local storage
    if (!token) {
        // If no token is found, start the stopwatch
        startStopwatch();

        // Check if grid state exists in local storage
        if (gridData) {
            loadGridState();  // Load the saved grid state
        } else {
            initializeColumn();  // Initialize a new grid structure if no data is found
        }
        await delay(100);
        // Load the saved code into the editor (or start fresh if none exists)
        await loadCode();
    } else {
        // If a token is present, retrieve user data from the backend
        getUserData();
    }

    if(sessionStorage.getItem("cameFrom") === "true"){
        sessionStorage.setItem("cameFrom", "false");
        document.getElementById("stats").click();
    }
}

window.addEventListener('pageshow', function (event) {
    if (!sessionStorage.getItem("pageReloaded")) {
        sessionStorage.setItem("pageReloaded", "true");
        window.location.reload();
    } else {
        sessionStorage.removeItem("pageReloaded");
    }
});


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function reloadGif() {
    const logo = document.getElementById('logo'); // Select the logo element
    const currentSrc = logo.src.split('?')[0]; // Remove any existing query string
    const newSrc = currentSrc + '?t=' + new Date().getTime(); // Add a timestamp as a query string to force reload
    logo.src = newSrc; // Reassign the src to trigger reload
}

// Call this when clearing storage or cookies
function clearLocalStorageAndCookies() {
    localStorage.clear(); // Clear local storage
    document.cookie = ""; // Clear cookies (simplified, for demonstration)
    reloadGif(); // Force the GIF to reload without flicker
}

// Function to reset the state by clearing localStorage and reloading the page
function resetState() {
    // Clear all cookies
    const cookies = document.cookie.split(";"); // Get all cookies as an array
    reloadGif(); // Force the GIF to reload without flicker
    for (let cookie of cookies) {
        const name = cookie.split("=")[0].trim(); // Extract cookie name
        // Set the cookie to expire in the past to delete it
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }

    // Clear all localStorage
    localStorage.clear(); // Clear all data from localStorage
    location.reload(); // Reload the page to reset everything
}
document.getElementById("resetButton").addEventListener("click", resetState);

function setIndexLocalStorageWithExpiry(key, value) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Next midnight
    const expiryTime = midnight.getTime(); // Get timestamp for midnight

    const data = {
        value: value,
        expiry: expiryTime,
    };

    localStorage.setItem(key, JSON.stringify(data));
}

function getIndexLocalStorageWithExpiry(key) {
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

