// Fetches user-specific data from the backend and initializes the application state.
// Handles scenarios where the user has completed their session, partially completed, or has no saved data.
async function getUserData() {
    const token = localStorage.getItem("jwt_token"); // Retrieve JWT token
    const gridData = getIndexLocalStorageWithExpiry("gridState"); // Retrieve grid state

    // Fetch user data from the backend
    const response = await fetch("http://127.0.0.1:5000/get_user_data", {
        method: "GET",
        headers: { 'Authorization': `Bearer ${token}` },
    });

    const result = await response.json(); // Parse JSON response
    const { time, code, grid, completed } = result; // Destructure result

    // Determine victory state
    const victory = completed === 1 ? true : null;

    if (time && code && grid && victory) {

        // Save data to local storage and initialize components for completed state
        setIndexLocalStorageWithExpiry("stopwatchTime", time);
        setIndexLocalStorageWithExpiry("savedCode", code);
        setIndexLocalStorageWithExpiry("gridState", grid);
        
        loadCode();
        startStopwatch();
        loadGridState();
    } else if (time && code && grid) {
        // Save data for ongoing work
        if(!sessionStorage.getItem("alreadyLoaded")){
            setIndexLocalStorageWithExpiry("stopwatchTime", time);
        }
        sessionStorage.setItem("alreadyLoaded", "yes");
        setIndexLocalStorageWithExpiry("savedCode", code);
        setIndexLocalStorageWithExpiry("gridState", grid);
        await delay(100);
        loadCode();
        startStopwatch();
        loadGridState();
    } else {
        // Initialize new session if no valid data exists
        startStopwatch();
        if (gridData) {
            loadGridState();
        } else {
            initializeColumn();
        }
        await delay(100);
        await loadCode();
    }
}

// Clears items in localStorage that have passed their expiration date.
// Ensures stale data does not persist and affect application behavior.
function clearExpiredLocalStorage() {
    const now = new Date().getTime();
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const itemStr = localStorage.getItem(key);
            try {
                const item = JSON.parse(itemStr);
                if (item && item.expiry && now > item.expiry) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // Catch and ignore JSON parsing errors (e.g., for non-expirable items)
            }
        }
    }
}

// Sets up the application when the window finishes loading.
// Includes handling localStorage expiration, restoring states, and fetching user data.
window.onload = async function () {
    // Handle back navigation or cache restoration
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    });

    document.body.classList.add('fade-in'); // Add fade-in effect
    clearExpiredLocalStorage(); // Remove expired localStorage data
    fetchTestExplanation(); // Fetch and display test explanation

    const token = localStorage.getItem("jwt_token");
    const gridData = getIndexLocalStorageWithExpiry("gridState");

    if (!token) {
        // Initialize state for unauthenticated users
        startStopwatch();
        if (gridData) {
            loadGridState();
        } else {
            initializeColumn();
        }
        await delay(100);
        await loadCode();
    } else {
        // Retrieve and initialize user data
        await getUserData();
    }

    // Handle post-login state restoration
    await delay(500);
    if (sessionStorage.getItem("cameFrom") === "true") {
        sessionStorage.setItem("cameFrom", "false");
        document.getElementById("stats").click();
    }
};

// Creates a delay for a specified number of milliseconds.
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Reloads the logo image to prevent caching issues.
function reloadGif() {
    const logo = document.getElementById('logo');
    const currentSrc = logo.src.split('?')[0];
    const newSrc = `${currentSrc}?t=${new Date().getTime()}`;
    logo.src = newSrc;
}

// Clears all data in localStorage and cookies, and reloads the page.
function clearLocalStorageAndCookies() {
    localStorage.clear();
    document.cookie = ""; // Simplified cookie clearing
    reloadGif();
}

// Resets the application by clearing localStorage, cookies, and reloading the page.
function resetState() {
    const cookies = document.cookie.split(";");
    reloadGif();
    for (let cookie of cookies) {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
}
document.getElementById("resetButton").addEventListener("click", resetState);

// Stores a key-value pair in localStorage with an expiration date set to Chicago midnight.
async function setIndexLocalStorageWithExpiry(key, value) {
    const response = await fetch("http://127.0.0.1:5000/get_chicago_midnight");
    const info = await response.json();

    if (response.ok) {
        const date = info.chicago_midnight_utc;
        const expiryTime = new Date(date).getTime();

        const data = { value, expiry: expiryTime };
        localStorage.setItem(key, JSON.stringify(data));
    }
}

// Retrieves a value from localStorage if it has not expired.
function getIndexLocalStorageWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    if (now > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return item.value;
}

// Event listener to make animation when going away from page
document.getElementById('leader').addEventListener('click', function (event) {
    smoothTransition(event);
});

// Event listener to make animation when going away from page
document.getElementById('how').addEventListener('click', function (event) {
    smoothTransition(event);
});

// Function to make a smooth transition
function smoothTransition(event) {
    try {
        event.preventDefault();
        const href = event.currentTarget.href;
        document.body.classList.remove('fade-in');
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = href;
        }, 300); 
    }
    catch (error) {
        // empty might set up logging later 
    }
}

// // animation for on first visit of website in logo and prompt
// $(document).ready(function () {
//     function playGif(gifclass) {
//         const gif = $(gifclass);
//         gif[0].src = gif[0].src.replace(/\?.*$/, "") + "?x=" + Math.random();
//     }
//     const seenGif = Cookies.get('seenGif');
//     if (!seenGif) {
//         $('.hack6-loading-wrapper').css('display', 'flex');
//         playGif('.hack6-gif');
//         typer.js
//         Cookies.set('seenGif', true, { expires: 1 });

//         setTimeout(() => {
//             $('.hack6-loading-wrapper').fadeOut(500);
//         }, 3000)
//     }
// })