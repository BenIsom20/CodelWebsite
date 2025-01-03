// JAVASCRIPT CODE FOR ALL CODEMIRROR ITEMS
var attempt = 0;
// Initialize CodeMirror editor with Python syntax highlighting and other settings
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-python",          // Set the mode to Python for syntax highlighting
    theme: "CodelTheme",             // Set the theme for the editor
    lineNumbers: true,              // Enable line numbers
    lineWrapping: true,             // Enable line wrapping for long lines
    matchBrackets: true,            // Highlight matching brackets
    autoCloseBrackets: true,        // Automatically close brackets
    indentUnit: 4,                  // Set the indentation size to 4 spaces
    indentWithTabs: true,          // Use tabs instead of spaces for indentation
    tabSize: 4,                     // Display tabs as 4 spaces wide
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"], // Add gutters for line numbers and folding
    foldGutter: true,              // Enable code folding
    styleActiveLine: true,         // Highlight the active line
    highlightSelectionMatches: {   // Highlight all matching selections
        showToken: true,
        annotateScrollbar: true
    },
    readOnly: false,               // Set to true if the editor should be read-only
    autofocus: true,               // Automatically focus on the editor when the page loads
    cursorBlinkRate: 530,          // Set cursor blink rate
    viewportMargin: Infinity,      // Ensure the editor renders all lines (useful for long files)
});

editor.setSize("100%", 300); // Set the editor size to 90% width and 300px height

function saveCodeAndNotify() {
    const userCode = editor.getValue(); // Retrieve the current code from the editor
    const stringUserCode = JSON.stringify(userCode); // Convert the code to a JSON string
    setLocalStorageWithExpiry("savedCode", stringUserCode); // Save the code in localStorage 
}

// Event listener for the "User" button to save code and notify
document.getElementById("user").addEventListener("click", function () {
    saveCodeAndNotify();
    document.getElementById("mainPopup").style.display = "flex";

    // Default to Login form
    document.querySelector(".tab-link[data-target='loginForm']").click();
});

// Event listener for the "Leader" button to save code and notify
document.getElementById("leader").addEventListener("click", saveCodeAndNotify);

// Event listener for the "Develop" button to save code and notify
document.getElementById("develop").addEventListener("click", saveCodeAndNotify);

// Event listener for the "How" button to save code and notify
document.getElementById("how").addEventListener("click", saveCodeAndNotify);


// Function to load the saved code from localStorage when the page is loaded
function loadCode() {
    const savedCode = getLocalStorageWithExpiry("savedCode"); // Retrieve saved code from localStorage
    const parsedCode = JSON.parse(savedCode); // Parse the saved code
    if (parsedCode) {
        editor.setValue(parsedCode); // Load the saved code into the editor
    }
}

// Function to fetch and populate skeleton code based on a challenge ID
async function loadSkeleton() {
    const response = await fetch(`http://127.0.0.1:5000/get_skeleton`); // Fetch skeleton code from the server
    if (response.ok) {
        const skeleton = await response.json(); // Parse the server response
        const ske = skeleton.skeleton; // Extract the skeleton code
        editor.setValue(ske); // Populate the editor with the skeleton code
    }
}

// Event listener for "Run Code" button
document.getElementById("runCode").addEventListener("click", async function () {
    const userCode = editor.getValue(); // Get the code from CodeMirror editor
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    // Send code to backend for execution via a POST request
    const response = await fetch("http://127.0.0.1:5000/run", {
        method: "POST", // HTTP method is POST
        headers: { "Content-Type": "application/json" }, // Set request headers for JSON content
        body: JSON.stringify({ code: userCode }), // Send the code as JSON in the body
    });

    // Parse the response from the backend
    const result = await response.json();

    // Check if there is an error in the response
    if (result.error && result.error.length > 0) {
        outputDiv.textContent = result.error; // Display error if any
    } else {
        outputDiv.textContent = result.output || "No output"; // Display output or "No output" if none
    }
});

document.addEventListener("DOMContentLoaded", () => {
    //runs load skeleton function to load the skeleton code
    const code = getLocalStorageWithExpiry("savedCode");
    if (!code) {
        loadSkeleton();
    }
});

// Event listener for the "Submit Code" button
document.getElementById("submitCode").addEventListener("click", async function () {
    attempt++; // Increment the attempt counter
    var victory = false; // Track if the user achieves victory
    const userCode = editor.getValue(); // Get the user's code from the editor
    const outputDiv = document.getElementById("output"); // Div to display results or messages

    try {
        // Send the user's code to the backend via a POST request
        const response = await fetch("http://127.0.0.1:5000/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Specify JSON content type
            body: JSON.stringify({ code: userCode }), // Send the code as a JSON object
        });

        // Parse the JSON response from the backend
        const result = await response.json();

        if (result.error && result.error.length > 0) {
            // Display compilation errors if present
            outputDiv.innerHTML = result.error;
        } else {
            // Save the submitted code to localStorage
            const stringUserCode = JSON.stringify(userCode);
            setLocalStorageWithExpiry("savedCode", stringUserCode);

            // Notify the user of successful submission
            outputDiv.innerHTML = "Code Successfully Submitted";

            // Extract test results and related data
            const resultsArray = Object.values(result.testList); // Test outcomes
            const givenValues = result.givenValues; // Input values for the tests
            const numTests = result.numTests; // Total number of tests

            // Display detailed test results
            let resultDetails = "<h3>Test Results:</h3><ul>";
            for (let i = 0; i < resultsArray.length; i++) {
                const caseResult = resultsArray[i]; // Test result for each case
                const givenValue = givenValues[i]; // Corresponding input value
                resultDetails += `<li>(${givenValue}) -> ${caseResult}</li>`;
            }
            resultDetails += "</ul>";
            outputDiv.innerHTML += resultDetails;

            // Check the test results and update the grid accordingly
            if (victoryCheck(resultsArray) == "f") {
                // Add a new row if not all tests pass
                addRow(numTests);
                colorRow(resultsArray, numTests); // Color the row based on test outcomes
            } else if (victoryCheck(resultsArray) == "s") {
                // All tests passed
                colorRow(resultsArray, numTests); // Update grid with success colors
                victory = true;
                const submitButton = document.getElementById("submitCode");
                submitButton.disabled = true; // Disable the submit button
                stopStopwatch(); // Stop the stopwatch
            } else if (victoryCheck(resultsArray) == "e") {
                // No significant change, decrement the attempt counter
                attempt--;
            }
        }
    } catch (error) {
        // Handle errors during the fetch or server communication
        outputDiv.textContent = "Error in submission: " + error.message;
    }

    // Save the current state of the grid to localStorage
    const grid = document.getElementById("grid-container");
    const gridState = Array.from(grid.children).map(child => ({
        tagName: child.tagName, // HTML tag name
        textContent: child.textContent, // Text inside the element
        classList: [...child.classList], // List of CSS classes
        styles: child.style.cssText, // Inline styles
        dataset: { ...child.dataset }, // Data attributes
    }));
    const jsonGridState = JSON.stringify(gridState);
    setLocalStorageWithExpiry("gridState", jsonGridState);

    if (victory) {
        victorySend(); // Send a victory signal if all tests pass
        victorySequence(); // Display victory message and fireworks
    } else {
        saveProgress();
        trySequence(); // Display try again message and animation
    }
});


// Function to check if all tests passed
function victoryCheck(resultsArray) {
    // Check for any errored test cases
    for (let result of resultsArray) {
        if (errored(result)) {
            return "e"; // Return "e" if any test has an error
        }
    }
    // Check for any failed test cases
    for (let result of resultsArray) {
        if (failed(result)) {
            return "f"; // Return "f" if any test has a failure
        }
    }
    return "s"; // Return "s" if all tests pass
}

// Function to check if a test case failed
function failed(result) {
    if (result.includes("Failure")) {
        return true; // Return true if "Failure" is found in the result
    } else {
        return false; // Return false otherwise
    }
}

// Function to check if a test case errored
function errored(result) {
    if (result.includes("Error")) {
        return true; // Return true if "Error" is found in the result
    } else {
        return false; // Return false otherwise
    }
}

// Function to send victory state and related data to the backend
async function saveProgress() {
    // Check if a JWT token exists in local storage
    if (localStorage.getItem("jwt_token") != null) {

        const token = localStorage.getItem("jwt_token"); // Retrieve the token

        const grid = getLocalStorageWithExpiry("gridState"); // Retrieve grid state from localStorage
        const timer = getLocalStorageWithExpiry("stopwatchTime"); // Retrieve stopwatch time from localStorage
        const code = getLocalStorageWithExpiry("savedCode"); // Retrieve saved code from localStorage

        // Prepare the payload with relevant data from local storage
        const payload = {
            gridState: grid,  // Grid state data
            stopwatchTime: timer,  // Stopwatch time
            savedCode: code,  // Saved code
            attempts: attempt  // Number of attempts (ensure 'attempt' is defined globally)
        };

        // Send a POST request to the backend to update victory state
        fetch("http://localhost:5000/saveProgress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // Indicate JSON content
                "Authorization": `Bearer ${token}`  // Include JWT token in the Authorization header
            },
            body: JSON.stringify(payload)  // Convert payload to JSON string
        })
    }
}


// Function to send victory state and related data to the backend
async function victorySend() {
        // Check if a JWT token exists in local storage
        if (localStorage.getItem("jwt_token") != null) {
            const token = localStorage.getItem("jwt_token"); // Retrieve the token

            const grid = getLocalStorageWithExpiry("gridState"); // Retrieve grid state from localStorage
            const timer = getLocalStorageWithExpiry("stopwatchTime"); // Retrieve stopwatch time from localStorage
            const code = getLocalStorageWithExpiry("savedCode"); // Retrieve saved code from localStorage

            // Prepare the payload with relevant data from local storage
            const payload = {
                gridState: grid,  // Grid state data
                stopwatchTime: timer,  // Stopwatch time
                savedCode: code,  // Saved code
                attempts: attempt  // Number of attempts (ensure 'attempt' is defined globally)
            };

            // Send a POST request to the backend to update victory state
            fetch("http://localhost:5000/victory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",  // Indicate JSON content
                    "Authorization": `Bearer ${token}`  // Include JWT token in the Authorization header
                },
                body: JSON.stringify(payload)  // Convert payload to JSON string
            })
        }
}

function victorySequence() {
    const navbar = document.getElementById("mainNavbar");
    const logo = document.getElementById("logo");
    navbar.classList.add("vic-burst");
    navbar.addEventListener("animationend", function () {
        navbar.classList.remove("vic-burst");
    });
    navbar.style.boxShadow = "0 2px 50px #61C9A8ed";
    logo.src = "images/V.gif?";
}

function trySequence() {
    const navbar = document.getElementById("mainNavbar");
    navbar.classList.add("try-burst");
    navbar.addEventListener("animationend", function () {
        navbar.classList.remove("try-burst");
    });
}

function setLocalStorageWithExpiry(key, value) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Next midnight
    const expiryTime = midnight.getTime(); // Get timestamp for midnight

    const data = {
        value: value,
        expiry: expiryTime,
    };

    localStorage.setItem(key, JSON.stringify(data));
}

function getLocalStorageWithExpiry(key) {
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
