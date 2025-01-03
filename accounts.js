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
    document.getElementById("regusernote").innerHTML="";
    document.getElementById("regemailnote").innerHTML="";
    document.getElementById("regpassnote").innerHTML="";
    document.getElementById("regmatchnote").innerHTML="";

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
        const token = data.access_token; // Extract the token from the response
        localStorage.clear(); // Clear any existing localStorage data
        localStorage.setItem('jwt_token', token); // Store the token in localStorage
        document.getElementById('lognote').innerHTML = "Successfully Logged into Account";
        window.location.reload();
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
    } else {
        document.getElementById('delnote').innerHTML = "Username or Password Incorrect";
    }


}

// Add event listeners to handle button clicks
document.getElementById("delete").addEventListener("click", captureDelete); // Delete user
document.getElementById("login").addEventListener("click", captureLogin); // Login user
document.getElementById("register").addEventListener("click", captureRegister); // Register user
document.getElementById("logout").addEventListener("click", function () {
    localStorage.clear(); // Clear localStorage on logout
    document.getElementById('lognote').innerHTML = "Successfully Logged Out" // Notify user
});
