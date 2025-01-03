var cameFrom = false;
var loggedIn = false;

// Open the popup with animation
document.getElementById("user").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default action for <a>
    const popup = document.getElementById("mainPopup");
    popup.style.display = "flex";
    setTimeout(() => {
        popup.style.opacity = "1";
        popup.style.transform = "scale(1)";
    }, 10); // Allow a slight delay for transition to apply

    // Default to Login form
    document.querySelector(".tab-link[data-target='loginForm']").click();
});

// Close the popup with animation
document.getElementById("closePopup").addEventListener("click", () => {
    const popup = document.getElementById("mainPopup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.8)";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300); // Match the transition duration

    if (cameFrom && loggedIn) {
        document.getElementById("stats").click();
    }
    

});

// Close the popup when clicking outside the content
document.getElementById("mainPopup").addEventListener("click", (event) => {
    const popupContent = document.querySelector(".popup-content");
    if (!popupContent.contains(event.target)) {
        const popup = document.getElementById("mainPopup");
        popup.style.opacity = "0";
        popup.style.transform = "scale(0.8)";
        setTimeout(() => {
            popup.style.display = "none";
        }, 300); // Match the transition duration
    }

    if (cameFrom && loggedIn) {
        document.getElementById("stats").click();
    }
    

});


// Tab switching logic with animation
const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

tabLinks.forEach(link => {
    link.addEventListener("click", event => {
        const targetId = event.target.getAttribute("data-target");

        // Remove active class and hide current tab with animation
        const currentTab = document.querySelector(".tab-content.active");
        currentTab.style.opacity = "0";
        currentTab.style.transform = "translateX(-100%)";
        setTimeout(() => {
            currentTab.style.display = "none";
            currentTab.classList.remove("active");

            // Show target tab with animation
            const targetContent = document.getElementById(targetId);
            targetContent.style.display = "block";
            setTimeout(() => {
                targetContent.style.opacity = "1";
                targetContent.style.transform = "translateX(0)";
                targetContent.classList.add("active");
            }, 10);
        }, 300); // Match the transition duration
    });
});

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600); // Calculate hours
    const mins = Math.floor((seconds % 3600) / 60); // Calculate remaining minutes
    const secs = seconds % 60; // Calculate remaining seconds

    // Format as HH:MM:SS with leading zeros
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Function to fetch stats
async function fetchStats() {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        return null; // Indicate no stats are available
    }
    try {
        const response = await fetch("http://localhost:5000/stats", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            const createdDate = new Date(data.stats.created);
            const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Format options
            const formattedDate = createdDate.toLocaleDateString(undefined, options); // Format date based on locale

            // Update the HTML with a better sentence
            document.getElementById("nameStats").innerHTML =
                `${data.stats.username}, joined on ${formattedDate}`; // Return stats if the response is successful
            document.getElementById("statsWins").innerHTML = "🏆 total wins: " + data.stats.wins;
            document.getElementById("statsStreak").innerHTML = "🔥 current streak: " + data.stats.streak;
            document.getElementById("statsAllStreak").innerHTML = "🌟 highest streak: " + data.stats.allStreak;
            document.getElementById("statsTotal").innerHTML = "⏳ total time on CODEL: " + formatTime(data.stats.allTime);
            return data.stats;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Event listener for stats button
document.getElementById("stats").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent default action for <a>
    const stats = await fetchStats(); // Wait for fetchStats to resolve
    if (!stats) {
        cameFrom = true;
        // Show the main popup if no stats are available
        const popup = document.getElementById("mainPopup");
        popup.style.display = "flex";
        setTimeout(() => {
            popup.style.opacity = "1";
            popup.style.transform = "scale(1)";
        }, 10); // Allow a slight delay for transition to apply

        // Default to Login form
        document.querySelector(".tab-link[data-target='loginForm']").click();
    } else {
        const popup = document.getElementById("statsPopup");
        popup.style.display = "flex";
        setTimeout(() => {
            popup.style.opacity = "1";
            popup.style.transform = "scale(1)";
        }, 10); // Slight delay for smooth transition
    }
});


function closePopup() {
    const popup = document.getElementById("statsPopup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.8)";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300); // Match transition duration

    if (cameFrom && loggedIn) {
        loggedIn = false;
        cameFrom = false;
        window.location.reload();
    }
}

document.addEventListener("click", (event) => {
    const popup = document.getElementById("statsPopup");
    const popupContent = document.getElementById("popupContent");
    if (popup.style.display === "flex" && !popupContent.contains(event.target)) {
        closePopup();
    }
});

document.getElementById("closeStatsPopup").addEventListener("click", closePopup);


// JAVASCRIPT FOR ALL ACCOUNTS FUNCTIONALITY

// Helper function to validate the username
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]+$/; // Allows only letters and numbers
    return usernameRegex.test(username) && username.length <= 254;
}

// Helper function to validate the email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
    return emailRegex.test(email);
}

// Helper function to validate the password
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[^a-z]).{4,}$/; // Requires a non-lowercase letter and at least 4 characters
    return passwordRegex.test(password);
}

// Function to capture login details and trigger the login process
function captureLogin() {
    document.getElementById("lognote").innerHTML = "";
    const username = document.getElementById("logusername").value;
    const password = document.getElementById("logpassword").value;

    // Retrieve username and password from the login form

    // Call the loginUser function to handle login
    if (username && password) {
        loginUser(username, password);

    } else {
        document.getElementById("lognote").innerHTML = "Please fill out all fields.";
    }

    // Clear input fields
    document.getElementById('logusername').value = '';
    document.getElementById('logpassword').value = '';
}

// Function to capture registration details and trigger the registration process
function captureRegister() {
    document.getElementById("regusernote").innerHTML = "";
    document.getElementById("regemailnote").innerHTML = "";
    document.getElementById("regpassnote").innerHTML = "";
    document.getElementById("regmatchnote").innerHTML = "";

    // Retrieve username, password, and email from the registration form
    const username = document.getElementById('regusername').value;
    const password = document.getElementById('regpassword').value;
    const confpassword = document.getElementById('regpasswordconf').value;
    const email = document.getElementById('regemail').value;

    if (!isValidUsername(username)) {
        document.getElementById("regusernote").innerHTML = "Username Invalid";
        return;
    }

    if (!isValidEmail(email)) {
        document.getElementById("regemailnote").innerHTML = "Email Invalid";
        return;
    }

    if (!isValidPassword(password)) {
        document.getElementById("regpassnote").innerHTML = "Password Invalid";
        return;
    }

    if (password !== confpassword) {
        document.getElementById("regmatchnote").innerHTML = "Passwords do not match";
        return;
    }

    // Call the registerUser function to handle registration
    registerUser(username, password, email);

    // Clear input fields
    document.getElementById('regusername').value = '';
    document.getElementById('regpassword').value = '';
    document.getElementById('regemail').value = '';
    document.getElementById('regpasswordconf').value = '';
}

function captureDelete() {
    document.getElementById("delnote").innerHTML = "";
    // Retrieve username and password from the delete user form
    const username = document.getElementById('delusername').value;
    const password = document.getElementById('delpassword').value;
    // Call the deleteUser function to handle deletion

    if (username && password) {
        deleteUser(username, password);

    } else {
        document.getElementById("delnote").innerHTML = "Please fill out all fields.";
    }
    // Clear input fields
    document.getElementById('delusername').value = '';
    document.getElementById('delpassword').value = '';
}

// Function to register a new user
async function registerUser(username, password, email) {
    // Send a POST request to the registration endpoint
    const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
    });

    // Parse the JSON response
    const data = await response.json();
    if (response.ok) {
        document.getElementById('regnote').innerHTML = "Successfully Created Account";
        loginUser(username, password); // Log in the new user
    } else {
        document.getElementById('regnote').innerHTML = "Username or Email Already Exists";
    }
}

// Function to log in an existing user
async function loginUser(username, password) {
    // Send a POST request to the login endpoint
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    // Parse the JSON response
    const data = await response.json();
    if (response.ok) {
        loggedIn = true;
        const token = data.access_token; // Extract the token from the response
        localStorage.clear(); // Clear any existing localStorage data
        localStorage.setItem('jwt_token', token); // Store the token in localStorage
        document.getElementById('lognote').innerHTML = "Successfully Logged into Account";
        if(!cameFrom) {
            window.location.reload();
        }
    } else {
        document.getElementById('lognote').innerHTML = "Username or Password Incorrect";
    }
}

// Function to access a protected route using a token
async function accessProtectedRoute() {
    const token = localStorage.getItem('jwt_token'); // Retrieve the token from localStorage
    if (!token) return; // Exit if no token is found

    // Send a GET request to the protected endpoint with the token in the Authorization header
    const response = await fetch('http://localhost:5000/protected', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (response.ok) {
        // Handle successful response (not implemented yet)
    } else {
        // Handle failed response (e.g., invalid token)
    }
}

// Function to delete a user account
async function deleteUser(username, password) {
    if (!username || !password) {
        return;
    }
    const payload = { username, password };
    // Send a POST request to the delete user endpoint
    const response = await fetch('http://localhost:5000/delete_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('delnote').innerHTML = "Successfully Deleted Account";
        logoutUserOnDel(username);
    } else {
        document.getElementById('delnote').innerHTML = "Username or Password Incorrect";
    }


}

async function logoutUserOnDel(paramusername) {
    const token = localStorage.getItem('jwt_token'); // Retrieve the token from localStorage
    if (!token) return; // Exit if no token is found

    // Send a GET request to the protected endpoint with the token in the Authorization header
    const response = await fetch('http://localhost:5000/protected', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (response.ok) {
        if (paramusername === data.username) {
            localStorage.clear();
            window.location.reload();
        }
        else {

        }
    }
}
// Add event listeners to handle button clicks
document.getElementById("delete").addEventListener("click", captureDelete); // Delete user
document.getElementById("login").addEventListener("click", captureLogin); // Login user
document.getElementById("register").addEventListener("click", captureRegister); // Register user
document.getElementById("logout").addEventListener("click", function () {
    if (localStorage.getItem('jwt_token')) {
        localStorage.clear();
        document.getElementById('lognote').innerHTML = "Successfully Logged Out" // Notify user
        window.location.reload();
    }
    else {
        document.getElementById('lognote').innerHTML = "No Account Logged In" // Notify user
    }

});
