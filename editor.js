// JAVASCRIPT CODE FOR ALL CODEMIRROR ITEMS

// Initialize CodeMirror editor with Python syntax highlighting and other settings
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-python", // Set the mode to Python for syntax highlighting
    theme: "midnight", // Set the theme for the editor
    lineNumbers: true, // Enable line numbers in the editor
    autoCloseBrackets: true, // Enable auto-closing of brackets
});
editor.setSize("90%", 300); // Set the editor size to 90% width and 300px height

// Event listener for "Run Code" button
document.getElementById("runCode").addEventListener("click", async function () {
    const userCode = editor.getValue(); // Get the code from CodeMirror editor
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    const weird = document.getElementById("weird"); // (Not used in this code, but may be for debugging)

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

// Event listener for "Submit Code" button
document.getElementById("submitCode").addEventListener("click", async function () {
    // Get the user's code from the CodeMirror editor
    const userCode = editor.getValue();
    // Get the output display div element
    const outputDiv = document.getElementById("output");

    // Send the user's code to the backend for execution via a POST request
    try {
        // Make an asynchronous POST request to the Flask backend
        const response = await fetch("http://127.0.0.1:5000/test", {
            method: "POST", // HTTP method is POST
            headers: { "Content-Type": "application/json" }, // Set request headers for JSON content
            body: JSON.stringify({ code: userCode }), // Send the code as JSON in the body
        });

        // Parse the JSON response from the backend
        const result = await response.json();

        // Check if there was an error in the response (e.g., compilation error)
        if (!result.error.length == 0) {
            // Display compilation error message if there is an error
            outputDiv.textContent = "COMPILATION ERROR";
            outputDiv.innerHTML += "<br>NO SUBMISSION RECORDED<br>ERROR OUTPUT:<br>";
            outputDiv.innerHTML += result.error; // Display the error details
        } else {
            // If there is no error, display the success message and the output
            outputDiv.innerHTML = "Code Successfully Submitted<br>output:<br>";
            outputDiv.innerHTML += result.output || "No output"; // Display the output, or "No output" if none

            // Convert the 'testList' (a dictionary of test results) into an array
            const array = result.testList;
            const resultsArray = Object.values(array); // Get an array of values from the test results object

            // Get the number of tests
            const numTests = result.numTests;

            // Call the function to color rows based on the test results
            colorRow(resultsArray, numTests);

            // Check if all tests pass
            if (!victoryCheck(numTests)) {
                // Call the function to add rows in the grid based on the number of tests
                addRow(numTests);
            } else {
                // Disable the submit button and stop the stopwatch if all tests pass
                const submitButton = document.getElementById("submitCode");
                submitButton.disabled = true;
                stopStopwatch();
            }
        }
    } catch (error) {
        // Handle the case where the fetch request fails (e.g., server not reachable)
        outputDiv.textContent = "Failed to connect to the server." + error; // Display error message
    }
});
