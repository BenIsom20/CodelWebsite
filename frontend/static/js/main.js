publicIp = "thecodel.com";

// Function to retrieve user data from the backend and initialize the application state
async function getUserData() {
    const token = localStorage.getItem("jwt_token"); // Retrieve JWT token
    const gridData = getIndexLocalStorageWithExpiry("gridState"); // Retrieve grid state

    // Send a GET request to the backend to fetch user data
    const response = await fetch(`https://${publicIp}/get_user_data`, {
        method: "GET",  // GET method is used to retrieve data from the server
        headers: { 'Authorization': `Bearer ${token}` },  // Include the token for authorization
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

        await loadCode();
        await startStopwatch();
        await loadGridState();
        
    } else if (time && code && grid) {
        // Save data for ongoing work
        if (!sessionStorage.getItem("alreadyLoaded")) {
            setIndexLocalStorageWithExpiry("stopwatchTime", time);
        }
        sessionStorage.setItem("alreadyLoaded", "yes");
        setIndexLocalStorageWithExpiry("savedCode", code);
        setIndexLocalStorageWithExpiry("gridState", grid);

        await loadCode();
        await startStopwatch();
        await loadGridState();
        
    } else {
        // Initialize new session if no valid data exists
        await startStopwatch();
        await initializeColumn();
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
// Run the init logic on a normal (non-cached) load
window.onload = async function () {
    // On initial load, re-add fade-in immediately
    // reAddFadeInAnimation();
    await initApp();
};

// Re-run the fade-in animation if the page comes from the bfcache
window.addEventListener("pageshow", async function (event) {
    if (event.persisted) {
        reAddFadeInAnimation();
    }
});


async function initApp() {
    clearExpiredLocalStorage();      // Remove expired localStorage data
    await fetchTestExplanation();    // Fetch and display test explanation
    await setExpiry();

    const token = localStorage.getItem("jwt_token");
    const gridData = getIndexLocalStorageWithExpiry("gridState");

    if (!token) {
        // Initialize state for unauthenticated users
        await startStopwatch();
        if (gridData) {
            await loadGridState();
        } else {
            await initializeColumn();
        }
        await loadCode();
    } else {
        // Retrieve and initialize user data
        await getUserData();
        await populateForm();
    }

    // Handle post-login state restoration
    if (sessionStorage.getItem("cameFrom") === "true") {
        sessionStorage.setItem("cameFrom", "false");
        document.getElementById("stats").click();
    }
}

function reAddFadeInAnimation() {
    // Remove the fade-in class to reset animation
    document.body.classList.remove("fade-in");

    // Force a reflow to ensure the class removal is recognized
    void document.body.offsetWidth;

    // Re-add the fade-in class so the animation restarts
    document.body.classList.add("fade-in");
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

async function setExpiry(){
    const response = await fetch(`https://${publicIp}/get_chicago_midnight`);
    const info = await response.json();

    if (response.ok) {
        const date = info.chicago_midnight_utc;
        const expiryTime = new Date(date).getTime();
        const value = new Date(date).getTime();

        const data = { value, expiry: expiryTime };
        localStorage.setItem("expiry", JSON.stringify(data));
    }
}

// Stores a key-value pair in localStorage with an expiration date set to Chicago midnight.
function setIndexLocalStorageWithExpiry(key, value) {
        const expiration = getIndexLocalStorageWithExpiry("expiry");
        if(expiration){
            const data = { value, expiry: expiration };
            localStorage.setItem(key, JSON.stringify(data));
        } else{
            // may set up logging later 
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