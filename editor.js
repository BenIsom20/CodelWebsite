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
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("user").addEventListener("click", async function () {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("leader").addEventListener("click", async function () {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("develop").addEventListener("click", async function () {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("how").addEventListener("click", async function () {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML = "Code Successfully Saved!";
});

// Function to load the saved code from localStorage when the page is loaded
function loadCode() {
    const savedCode = localStorage.getItem("savedCode"); // Retrieve saved code from localStorage
    const parsedCode = JSON.parse(savedCode);
    if (parsedCode) {
        editor.setValue(parsedCode); // Load the saved code into the textarea

    }
}

// Fetch and Populate Skeleton Code
async function loadSkeleton(challengeId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/get_skeleton/${challengeId}`);
        if (response.ok) {
            const skeleton = await response.json();
            const ske = skeleton.skeleton;
            editor.setValue(ske); // Populate editor with skeleton

        }
    } catch (error) {
        console.error('Error fetching skeleton:', error);
    }
}

// Event listener for "Run Code" button
document.getElementById("runCode").addEventListener("click", async function () {
    const userCode = editor.getValue(); // Get the code from CodeMirror editor
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    // Send code to backend for execution via a POST request
    try {
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
    } catch (error) {
        outputDiv.textContent = "Failed to connect to the server."; // Handle server connection errors
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("savedCode")) {
        loadSkeleton(1);
    }
});

document.getElementById("submitCode").addEventListener("click", async function () {
    attempt++;
    var victory = false;
    // Get the user's code from the CodeMirror editor (this is where the user inputs their code)
    const userCode = editor.getValue();
    const outputDiv = document.getElementById("output");

    try {
        // Send the user's code to the backend via a POST request
        const response = await fetch("http://127.0.0.1:5000/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: userCode }),
        });

        // Parse the JSON response from the backend
        const result = await response.json();

        if (result.error && result.error.length > 0) {
            // If there is a compilation error, display it
            outputDiv.innerHTML = result.error;
        } else {

            const userCode = editor.getValue();
            const stringUserCode = JSON.stringify(userCode);
            localStorage.setItem("savedCode", stringUserCode);

            // Display success message and output
            outputDiv.innerHTML = "Code Successfully Submitted";

            // Get the test results and number of tests
            const resultsArray = Object.values(result.testList);
            const givenValues = result.givenValues; // Get the given values from the response
            const numTests = result.numTests;

            // Display each test result with its given_value and actual result
            let resultDetails = "<h3>Test Results:</h3><ul>";
            for (let i = 0; i < resultsArray.length; i++) {
                const caseResult = resultsArray[i];
                const givenValue = givenValues[i];  // Get the corresponding given value from the response
                resultDetails += `<li>(${givenValue}) -> ${caseResult}</li>`;
            }
            resultDetails += "</ul>";

            // Append the result details to the output
            outputDiv.innerHTML += resultDetails;

            // Check if all tests pass
            if (victoryCheck(resultsArray) == "f") {
                // If not all tests pass, add a new row to the grid
                addRow(numTests);
                colorRow(resultsArray, numTests);
            } else if (victoryCheck(resultsArray) == "s") {
                colorRow(resultsArray, numTests);
                victory = true;
                // If all tests pass, disable the submit button and stop the stopwatch
                const submitButton = document.getElementById("submitCode");
                submitButton.disabled = true;  // Disable the submit button
                stopStopwatch();  // Stop the stopwatch
            } else if (victoryCheck(resultsArray) == "e") {
                attempt--;
            }
        }
    } catch (error) {
        // Handle fetch or server errors
        outputDiv.textContent = "Error in submission: " + error.message;
    }

    // Save the current grid state to localStorage
    const grid = document.getElementById("grid-container");
    const gridState = Array.from(grid.children).map(child => ({
        tagName: child.tagName,
        textContent: child.textContent,
        classList: [...child.classList],
        styles: child.style.cssText,
        dataset: { ...child.dataset },
    }));

    localStorage.setItem("gridState", JSON.stringify(gridState));

    if (victory) {
        victorySend();
    }
});

// Function to check if all tests passed
function victoryCheck(resultsArray) {
    // Loop through each result to find any "Failure"
    for (let result of resultsArray) {
        if (errored(result)) { return "e" }
    }
    for (let result of resultsArray) {
        if (failed(result)) { return "f" }
    }
    return "s"; // Return true if all tests passed
}

function failed(result) {
    if (result.includes("Failure")) {
        return true; // Return false if any failure is found
    } else {
        return false;
    }
}

function errored(result) {
    if (result.includes("Error")) {
        return true; // Return false if any failure is found
    } else {
        return false;
    }
}

// function that sends the victory and data to backend
async function victorySend() {
    try {
        // Retrieve the JWT token from local storage
        if (localStorage.getItem("jwt_token") != null) {

            const token = localStorage.getItem("jwt_token");

            // Prepare the payload with necessary data from local storage
            const payload = {
                gridState: localStorage.getItem("gridState"),  // Grid state data
                stopwatchTime: localStorage.getItem("stopwatchTime"),  // Stopwatch time
                savedCode: localStorage.getItem("savedCode"),  // Saved code
                attempts: attempt  // Number of attempts (ensure 'attempt' is defined elsewhere)
            };

            // Send the POST request with the token in the Authorization header
            fetch("http://localhost:5000/victory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",  // Indicating the request body is in JSON format
                    "Authorization": `Bearer ${token}`  // Include the JWT token in the Authorization header
                },
                body: JSON.stringify(payload)  // Send the payload as a JSON string
            })
                .then(response => response.json())  // Parse the response JSON
                .then(data => {
                    // Check for success or error message in the response
                    if (data.message) {
                        console.log("State updated successfully:", data.message);
                        document.getElementById("debug").innerHTML = data.message;  // Display success message
                    } else if (data.error) {
                        console.error("Error updating state:", data.error);
                        document.getElementById("debug").innerHTML = data.error;  // Display error message
                    }
                })
                .catch(error => {
                    // Handle any network or other errors
                    console.error("Network error:", error);
                    document.getElementById("debug").innerHTML = error;  // Display error message
                });
        }
        else {
            // If no JWT token is found in local storage, notify the user
            document.getElementById("debug").innerHTML = "No token found";
        }

    }
    catch (error) {
        // Catch any unexpected errors in the function
        document.getElementById("debug").innerHTML = error;
    }
}
