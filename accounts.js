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
    // Retrieve username and password from the login form
    const username = document.getElementById('logusername').value;
    const password = document.getElementById('logpassword').value;
    // Call the loginUser function to handle login
    loginUser(username, password);
    // Clear input fields
    document.getElementById('logusername').value = '';
    document.getElementById('logpassword').value = '';
}

// Function to capture registration details and trigger the registration process
function captureRegister() {
    // Retrieve username, password, and email from the registration form
    const username = document.getElementById('regusername').value;
    const password = document.getElementById('regpassword').value;
    const email = document.getElementById('regemail').value;

    // if (!isValidUsername(username)) {
    //     alert("Invalid username.");
    //     return;
    // }

    // if (!isValidEmail(email)) {
    //     alert("Invalid email format.");
    //     return;
    // }

    // if (!isValidPassword(password)) {
    //     alert("Invalid password format. Must have >= 4 characters, at least 1 non-lowercase letter.");
    //     return;
    // }

    // Call the registerUser function to handle registration
    registerUser(username, password, email);

    // Clear input fields
    document.getElementById('regusername').value = '';
    document.getElementById('regpassword').value = '';
    document.getElementById('regemail').value = '';
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
        alert("Registration successful"); // Notify the user on successful registration
    } else {
        alert(data.error); // Notify the user on registration failure
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
        alert("Login successful"); // Notify the user on successful login
    } else {
        alert("Username or password incorrect"); // Notify the user on login failure
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
async function deleteUser() {
    // Retrieve username and password from the delete user form
    const username = document.getElementById("delusername").value;
    const password = document.getElementById("delpassword").value;

    if (!username || !password) {
        alert("Please enter both username and password."); // Validate inputs
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
        alert("Account successfully deleted"); // Notify the user on successful deletion
    } else {
        alert("Username or password incorrect"); // Notify the user on deletion failure
    }

    // Clear input fields
    document.getElementById("delusername").value = '';
    document.getElementById("delpassword").value = '';
}

// Add event listeners to handle button clicks
document.getElementById("delete").addEventListener("click", deleteUser); // Delete user
document.getElementById("login").addEventListener("click", captureLogin); // Login user
document.getElementById("register").addEventListener("click", captureRegister); // Register user
document.getElementById("logout").addEventListener("click", function () {
    localStorage.clear(); // Clear localStorage on logout
    alert("logout successful") // Notify user
});
