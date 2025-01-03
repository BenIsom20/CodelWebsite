// JAVASCRIPT CODE FOR ALL CODEMIRROR ITEMS
var attempt = 0;
// Initialize CodeMirror editor with Python syntax highlighting and other settings
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-python",          // Set the mode to Python for syntax highlighting
    theme: "midnight",             // Set the theme for the editor
    lineNumbers: true,              // Enable line numbers
    lineWrapping: true,             // Enable line wrapping for long lines
    matchBrackets: true,            // Highlight matching brackets
    autoCloseBrackets: true,        // Automatically close brackets
    indentUnit: 4,                  // Set the indentation size to 4 spaces
    indentWithTabs: true,          // Use tabs instead of spaces for indentation
    tabSize: 4,                     // Display tabs as 4 spaces wide
    extraKeys: {
        "Ctrl-Space": "autocomplete", // Enable autocomplete with Ctrl+Space
        "Ctrl-Q": function (cm) {       // Toggle line commenting with Ctrl+Q
            cm.toggleComment();
        }
    },
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

editor.setSize("90%", 300); // Set the editor size to 90% width and 300px height

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("saveCode").addEventListener("click", async function () {
    // Retrieve the current code from the editor
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode); // Convert the code to a JSON string
    localStorage.setItem("savedCode", stringUserCode); // Save the code in localStorage
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!"; // Notify the user of success
});

// Event listener for the "User" button to save code and notify
document.getElementById("user").addEventListener("click", async function () {
    const userCode = editor.getValue(); // Retrieve the current code from the editor
    const stringUserCode = JSON.stringify(userCode); // Convert the code to a JSON string
    localStorage.setItem("savedCode", stringUserCode); // Save the code in localStorage
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!"; // Notify the user of success
});

// Event listener for the "Leader" button to save code and notify
document.getElementById("leader").addEventListener("click", async function () {
    const userCode = editor.getValue(); // Retrieve the current code from the editor
    const stringUserCode = JSON.stringify(userCode); // Convert the code to a JSON string
    localStorage.setItem("savedCode", stringUserCode); // Save the code in localStorage
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!"; // Notify the user of success
});

// Event listener for the "Develop" button to save code and notify
document.getElementById("develop").addEventListener("click", async function () {
    const userCode = editor.getValue(); // Retrieve the current code from the editor
    const stringUserCode = JSON.stringify(userCode); // Convert the code to a JSON string
    localStorage.setItem("savedCode", stringUserCode); // Save the code in localStorage
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!"; // Notify the user of success
});

// Event listener for the "How" button to save code and notify
document.getElementById("how").addEventListener("click", async function () {
    const userCode = editor.getValue(); // Retrieve the current code from the editor
    const stringUserCode = JSON.stringify(userCode); // Convert the code to a JSON string
    localStorage.setItem("savedCode", stringUserCode); // Save the code in localStorage
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!"; // Notify the user of success
});

// Function to load the saved code from localStorage when the page is loaded
function loadCode() {
    const savedCode = localStorage.getItem("savedCode"); // Retrieve saved code from localStorage
    const parsedCode = JSON.parse(savedCode); // Parse the JSON string into a usable format
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
    if (!localStorage.getItem("savedCode")) {
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
            localStorage.setItem("savedCode", stringUserCode);

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
    localStorage.setItem("gridState", JSON.stringify(gridState)); // Store grid state

    if (victory) {
        victorySend(); // Send a victory signal if all tests pass
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
async function victorySend() {
    // Check if a JWT token exists in local storage
    if (localStorage.getItem("jwt_token") != null) {
        const token = localStorage.getItem("jwt_token"); // Retrieve the token

        // Prepare the payload with relevant data from local storage
        const payload = {
            gridState: localStorage.getItem("gridState"),  // Grid state data
            stopwatchTime: localStorage.getItem("stopwatchTime"),  // Stopwatch time
            savedCode: localStorage.getItem("savedCode"),  // Saved code
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
            .then(response => response.json())  // Parse the response JSON
            .then(data => {
                // Handle the response from the backend
                if (data.message) {
                    console.log("State updated successfully:", data.message);
                    document.getElementById("debug").innerHTML = data.message; // Display success message
                } else if (data.error) {
                    console.error("Error updating state:", data.error);
                    document.getElementById("debug").innerHTML = data.error; // Display error message
                }
            })
            .catch(error => {
                // Handle network or other errors
                console.error("Network error:", error);
                document.getElementById("debug").innerHTML = error; // Display network error message
            });
    } else {
        // Notify the user if no JWT token is found in local storage
        document.getElementById("debug").innerHTML = "No token found";
    }
}
