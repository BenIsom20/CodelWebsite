/* main.js */
let publicIp = "thecodel.com";

/* -----------------------------
 * Helper: Re-start Fade-In Animation
 * ----------------------------- */
function reAddFadeInAnimation() {
  // Ensure the body starts at opacity 0
  document.body.style.opacity = 0;

  // Remove 'fade-in' class to reset any prior animation
  document.body.classList.remove("fade-in");

  // Force a reflow so browser sees the class removal
  void document.body.offsetWidth;

  // Re-add 'fade-in' to start the animation from 0 -> 1
  document.body.classList.add("fade-in");
}

/* -----------------------------
 * On Animation End, set opacity to 1
 * ----------------------------- */
document.body.addEventListener("animationend", (e) => {
  if (e.animationName === "fadeIn") {
    document.body.style.opacity = 1;
  }
});

/* -----------------------------
 * Core: Get User Data
 * ----------------------------- */
async function getUserData() {
  const token = localStorage.getItem("jwt_token");
  const gridData = getIndexLocalStorageWithExpiry("gridState");

  const response = await fetch(`https://${publicIp}/get_user_data`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await response.json();
  const { time, code, grid, completed } = result;
  const victory = completed === 1 ? true : null;

  // If we have valid data and victory is true
  if (time && code && grid && victory) {
    setIndexLocalStorageWithExpiry("stopwatchTime", time);
    setIndexLocalStorageWithExpiry("savedCode", code);
    setIndexLocalStorageWithExpiry("gridState", grid);

    await loadCode();
    await startStopwatch();
    await loadGridState();
  }
  // If we have valid data but no victory
  else if (time && code && grid) {
    if (!sessionStorage.getItem("alreadyLoaded")) {
      setIndexLocalStorageWithExpiry("stopwatchTime", time);
    }
    sessionStorage.setItem("alreadyLoaded", "yes");
    setIndexLocalStorageWithExpiry("savedCode", code);
    setIndexLocalStorageWithExpiry("gridState", grid);

    await loadCode();
    await startStopwatch();
    await loadGridState();
  }
  // Otherwise, initialize a new session
  else {
    await startStopwatch();
    await initializeColumn();
    await loadCode();
  }
}

/* -----------------------------
 * Clear Expired Local Storage
 * ----------------------------- */
function clearExpiredLocalStorage() {
  const now = Date.now();
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const itemStr = localStorage.getItem(key);
      try {
        const item = JSON.parse(itemStr);
        if (item && item.expiry && now > item.expiry) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }
}

/* -----------------------------
 * Main Initialization Logic
 * (Runs on window onload)
 * ----------------------------- */
async function initApp() {
  // Clear expired localStorage
  clearExpiredLocalStorage();

  // Fetch and display test explanation
  await fetchTestExplanation();

  // Set expiry
  await setExpiry();

  // Check token and grid data
  const token = localStorage.getItem("jwt_token");
  const gridData = getIndexLocalStorageWithExpiry("gridState");

  if (!token) {
    await startStopwatch();
    if (gridData) {
      await loadGridState();
    } else {
      await initializeColumn();
    }
    await loadCode();
  } else {
    await getUserData();
    await populateForm();
  }

  // Handle post-login state restoration
  if (sessionStorage.getItem("cameFrom") === "true") {
    sessionStorage.setItem("cameFrom", "false");
    document.getElementById("stats").click();
  }
}

/* -----------------------------
 * On window onload
 * ----------------------------- */
window.onload = async function () {
  // Re-start fade-in animation
  reAddFadeInAnimation();
  // Run main init
  await initApp();
};

/* -----------------------------
 * On pageshow (handles bfcache)
 * ----------------------------- */
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // Page loaded from back/forward cache
    reAddFadeInAnimation();
  }
});

/* -----------------------------
 * Reload GIF
 * ----------------------------- */
function reloadGif() {
  const logo = document.getElementById("logo");
  if (!logo) return;
  const currentSrc = logo.src.split("?")[0];
  const newSrc = `${currentSrc}?t=${Date.now()}`;
  logo.src = newSrc;
}

/* -----------------------------
 * Clear LocalStorage + Cookies
 * ----------------------------- */
function clearLocalStorageAndCookies() {
  localStorage.clear();
  document.cookie = ""; // Simplified
  reloadGif();
}

/* -----------------------------
 * Reset State
 * ----------------------------- */
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

/* -----------------------------
 * Set Expiry with Chicago Midnight
 * ----------------------------- */
async function setExpiry() {
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

/* -----------------------------
 * localStorage with Expiry Helpers
 * ----------------------------- */
function setIndexLocalStorageWithExpiry(key, value) {
  const expiration = getIndexLocalStorageWithExpiry("expiry");
  if (expiration) {
    const data = { value, expiry: expiration };
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function getIndexLocalStorageWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = Date.now();
    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    // If parse fails, return null or handle differently
    return null;
  }
}

/* -----------------------------
 * Smooth Transition on Link Clicks
 * ----------------------------- */
function smoothTransition(event) {
  try {
    event.preventDefault();
    const href = event.currentTarget.href;
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = href;
    }, 300);
  } catch (error) {
    // Handle or log error
  }
}
document.getElementById("leader").addEventListener("click", smoothTransition);
document.getElementById("how").addEventListener("click", smoothTransition);

/* -----------------------------
 * Optional: jQuery-based first-visit GIF logic
 * (Commented Out)
 * ----------------------------- 
$(document).ready(function () {
  function playGif(gifclass) {
    const gif = $(gifclass);
    gif[0].src = gif[0].src.replace(/\?.*$/, "") + "?x=" + Math.random();
  }

  const seenGif = Cookies.get('seenGif');
  if (!seenGif) {
    $('.hack6-loading-wrapper').css('display', 'flex');
    playGif('.hack6-gif');
    // typer.js
    Cookies.set('seenGif', true, { expires: 1 });

    setTimeout(() => {
      $('.hack6-loading-wrapper').fadeOut(500);
    }, 3000);
  }
});
*/
