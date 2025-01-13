publicIp = "thecodel.com";
// Global variable tracking if stats was clicked
let cameFrom = false;

// Event listener for the user icon
document.getElementById("user").addEventListener("click", (event) => {
    // creates opening animation for the account popup
    event.preventDefault();
    const popup = document.getElementById("mainPopup");
    popup.style.display = "flex";
    setTimeout(() => {
        popup.style.opacity = "1";
        popup.style.transform = "scale(1)";
    }, 10);
    const name = localStorage.getItem("jwt_token");
    if(name){
        
        document.querySelector(".tab-link[data-target='loggedInForm']").click();
    }else{
        document.querySelector(".tab-link[data-target='loginForm']").click();
    }
    // Default to Login form
});

async function populateForm(){
    try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`http://${publicIp}/protected`, {
            // Send a GET request to the protected endpoint with the token in the Authorization header
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const usernameDict = await response.json();
            const username = usernameDict.username;
            document.getElementById("userDisplay").innerHTML = `Currently logged in as<br>${username}.`
        }


    } catch (error) {
        console.log(error);
    }
}

// Event listener for the closing button for popup
document.getElementById("closePopup").addEventListener("click", () => {
    // creates closing animation
    const popup = document.getElementById("mainPopup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.8)";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300);
    cameFrom = false;
});

// Event listener for the mainPopup to close when not clicked
document.getElementById("mainPopup").addEventListener("click", (event) => {
    // checks what was clicked and if it was not inside the popup then creates closing animation
    const popupContent = document.querySelector(".popup-content");
    if (!popupContent.contains(event.target)) {
        cameFrom = false;
        const popup = document.getElementById("mainPopup");
        popup.style.opacity = "0";
        popup.style.transform = "scale(0.8)";
        setTimeout(() => {
            popup.style.display = "none";
        }, 300);
    }
    
});

// Tab switching logic with animation
const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

// Code for switching between popups
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
        }, 300);
    });
});

// Function that formats seconds into a more readable time
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Format as HH:MM:SS with leading zeros
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Function to fetch the user stats if logged in
async function fetchStats() {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        return null; // Indicate no stats are available since no user logged in 
    }
    try {
        const response = await fetch(`http://${publicIp}/stats`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            // formats the date to be in more readable format
            const createdDate = new Date(data.stats.created);
            const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Format options
            const formattedDate = createdDate.toLocaleDateString(undefined, options); // Format date based on locale

            // Update the HTML with users stats
            document.getElementById("nameStats").innerHTML =
                `${data.stats.username}, joined on ${formattedDate}`;
            document.getElementById("statsWins").innerHTML = "🏆 total wins: " + data.stats.wins;
            document.getElementById("statsStreak").innerHTML = "🔥 current streak: " + data.stats.streak;
            document.getElementById("statsAllStreak").innerHTML = "🌟 highest streak: " + data.stats.allStreak;
            document.getElementById("statsTotal").innerHTML = "⏳ total time on CODEL: " + formatTime(data.stats.allTime);
            return data.stats;
        } else {
            return null; // if there was no user with that token returns null to indicate no stats 
        }
    } catch (error) {
        return null; // if there was any exceptions returns null to indicate no stats
    }
}

// Event listener for stats button
document.getElementById("stats").addEventListener("click", async (event) => {
    event.preventDefault();
    const stats = await fetchStats();
    // if there are no stats to show prompts the user to sign in with same account popup
    if (!stats) {
        cameFrom = true;
        const popup = document.getElementById("mainPopup");
        popup.style.display = "flex";
        setTimeout(() => {
            popup.style.opacity = "1";
            popup.style.transform = "scale(1)";
        }, 10);

        // Default to Login form
        document.querySelector(".tab-link[data-target='loginForm']").click();
    } else { // otherwise opens the stats popup to display stats
        const popup = document.getElementById("statsPopup");
        popup.style.display = "flex";
        setTimeout(() => {
            popup.style.opacity = "1";
            popup.style.transform = "scale(1)";
        }, 10);
    }
});

// Function that closes the stats popup
function closePopup() {
    cameFrom = false;
    const popup = document.getElementById("statsPopup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.8)";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300);
}

// Event listener for closing the popup if not clicked
document.addEventListener("click", (event) => {
    const popup = document.getElementById("statsPopup");
    const popupContent = document.getElementById("popupContent");
    if (popup.style.display === "flex" && !popupContent.contains(event.target)) {
        closePopup();
    }
});

// Event listener for the close button on stats popup
document.getElementById("closeStatsPopup").addEventListener("click", closePopup);


// JAVASCRIPT FOR ALL ACCOUNTS FUNCTIONALITY

// Helper function to validate the username under our conditions
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username) && username.length <= 254;
}

// Helper function to validate the email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to validate the password
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[^a-z]).{4,}$/; // Requires a non-lowercase letter and at least 4 characters
    return passwordRegex.test(password);
}

// Function to capture login details and trigger the login process
function captureLogin() {
    // clears any prior error notes
    document.getElementById("lognote").innerHTML = '';

    // captures login info
    document.getElementById("lognote").innerHTML = "";
    const username = document.getElementById("logusername").value;
    const password = document.getElementById("logpassword").value;

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
    // clears any error notes
    document.getElementById("regusernote").innerHTML = "";
    document.getElementById("regemailnote").innerHTML = "";
    document.getElementById("regpassnote").innerHTML = "";
    document.getElementById("regmatchnote").innerHTML = "";

    // Retrieve username, password, and email from the registration form
    const username = document.getElementById('regusername').value;
    const password = document.getElementById('regpassword').value;
    const confpassword = document.getElementById('regpasswordconf').value;
    const email = document.getElementById('regemail').value;

    // Checks for all inputs being valid

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

// Function to capture the delete request and call function to handle it
function captureDelete() {
    // clears any prior notes
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
    const response = await fetch(`http://${publicIp}/register`, {
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
        await loginUser(username, password); // Log in the new user
    } else {
        document.getElementById('regnote').innerHTML = "Username or Email Already Exists";
    }
}

// Function to log in an existing user
async function loginUser(username, password) {
    try {
        // Send a POST request to the login endpoint
        const response = await fetch(`http://${publicIp}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        // Parse the JSON response
        const data = await response.json();
        if (response.ok) {
            const token = data.access_token; // Extract the token from the response
            localStorage.clear(); // Clear any existing localStorage data
            localStorage.setItem('jwt_token', token); // Store the token in localStorage
            document.getElementById('lognote').innerHTML = "Successfully Logged into Account";
            if (!cameFrom) {
                window.location.reload();
            }
            else {
                // If user signed in from clicking user stats button then stores that to open after refresh
                cameFrom = false;
                sessionStorage.setItem("cameFrom", "true");
                window.location.reload();
            }
        } else {
            document.getElementById('lognote').innerHTML = "Username or Password Incorrect";
        }
    }
    catch (error) {
        // empty for right now may set up logging later
    }

}

// Function to delete a user account
async function deleteUser(username, password) {
    // Send a POST request to the delete user endpoint
    const payload = { username, password };
    const response = await fetch(`http://${publicIp}/delete_user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    // Parse the response 
    const data = await response.json();
    if (response.ok) {
        document.getElementById('delnote').innerHTML = "Successfully Deleted Account";
        await logoutUserOnDel(username); // logs out the user when account deleted
    } else {
        document.getElementById('delnote').innerHTML = "Username or Password Incorrect";
    }
}

// Function to log out 
async function logoutUserOnDel(paramusername) {
    const token = localStorage.getItem('jwt_token'); 
    if (!token) return; // Exit if no token is found

    // Send a GET request to the protected endpoint with the token in the Authorization header
    const response = await fetch(`http://${publicIp}/protected`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Checks if the account deleted is the one that is currently logged in and if so deletes saved data
    const data = await response.json();
    if (response.ok) {
        if (paramusername === data.username) {
            localStorage.clear();
            window.location.reload();
        }
        else {
            // not used may set up logging later
        }
    }
}
// Add event listeners to handle button clicks for login, delete, register, logout 
document.getElementById("delete").addEventListener("click", captureDelete); // Delete user
document.getElementById("login").addEventListener("click", captureLogin); // Login user
document.getElementById("register").addEventListener("click", captureRegister); // Register user

// Event listener for logout button
document.getElementById("logout").addEventListener("click", function () {
    // removes saved token and notifies logged out
    if (localStorage.getItem('jwt_token')) {
        localStorage.clear();
        sessionStorage.removeItem("alreadyLoaded");
        document.getElementById('outnote').innerHTML = "Successfully Logged Out" 
        window.location.reload();
    }
    else {
        document.getElementById('outnote').innerHTML = "No Account Logged In"
    }
});