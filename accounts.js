function captureLogin() {
    const username = document.getElementById('logusername').value;
    const password = document.getElementById('logpassword').value;
    loginUser(username, password);
}

function captureRegister() {
    
    const username = document.getElementById('regusername').value;
    const password = document.getElementById('regpassword').value;
    const email = document.getElementById('regemail').value;
    registerUser(username, password, email);
    
}



// Function to register a new user
async function registerUser(username, password, email) {
    try {
        // Send a POST request to the registration endpoint
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email
            })
        });


        // Parse the JSON response
        const data = await response.json();
        if (response.ok) {
            // Log success message if registration is successful
            document.getElementById("debug").innerHTML = "Registration successful";
            console.log('Registration successful:', data);
        } else {
            // Log error message if registration fails
            document.getElementById("debug").innerHTML = "response bad";
            console.error('Registration failed:', data);
        }
    }
    catch (error) {
        document.getElementById("debug").innerHTML = error;
    }


}

// Function to log in an existing user
async function loginUser(username, password) {
    try {
        // Send a POST request to the login endpoint
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        // Parse the JSON response
        const data = await response.json();
        if (response.ok) {
            // Log success message if login is successful
            console.log('Login successful:', data);
            const token = data.access_token;  // Save the token to use for protected routes
            localStorage.clear();
            localStorage.setItem('jwt_token', token);  // Store the token in localStorage
            document.getElementById("debug").innerHTML = "Registration successful";
        } else {
            // Log error message if login fails
            console.error('Login failed:', data);
            document.getElementById("debug").innerHTML = "response bad";
        }
    }
    catch (error) {
        document.getElementById("debug").innerHTML = error;
    }



}

// Function to access a protected route
async function accessProtectedRoute() {
    const token = localStorage.getItem('jwt_token');  // Retrieve the token from localStorage
    if (!token) {
        // Log error message if no token is found
        console.error('No token found');
        return;
    }

    // Send a GET request to the protected endpoint with the token in the Authorization header
    const response = await fetch('http://localhost:5000/protected', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Parse the JSON response
    const data = await response.json();
    if (response.ok) {
        // Log the protected data if the request is successful
        console.log('Protected data:', data);
        document.getElementById("debug").innerHTML = "Registration successful";
    } else {
        // Log error message if the request fails
        console.error('Failed to access protected route:', data);
        document.getElementById("debug").innerHTML = "Registration fail";

    }
}

 async function deleteUser() {
    const username = document.getElementById("delusername").value;
    const password = document.getElementById("delpassword").value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const payload = {
        username: username,
        password: password
    };

    try {
        const response = await fetch('http://localhost:5000/delete_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while deleting the account." + error);
    }
}


document.getElementById("delete").addEventListener("click", deleteUser);
document.getElementById("login").addEventListener("click", captureLogin);
document.getElementById("register").addEventListener("click", captureRegister);
document.getElementById("logout").addEventListener("click", function () {
    localStorage.clear();
    document.getElementById("debug").innerHTML = "Logged out successfully";
});