// JAVASCRIPT CODE FOR ALL CODEMIRROR ITEMS
var attempt = 0;
// Initialize CodeMirror editor with Python syntax highlighting and other settings
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-python", // Set the mode to Python for syntax highlighting
    theme: "midnight", // Set the theme for the editor
    lineNumbers: true, // Enable line numbers in the editor
    autoCloseBrackets: true, // Enable auto-closing of brackets
});
editor.setSize("90%", 300); // Set the editor size to 90% width and 300px height

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("saveCode").addEventListener("click", async function() {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML="Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("user").addEventListener("click", async function() {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML="Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("leader").addEventListener("click", async function() {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML="Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("develop").addEventListener("click", async function() {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML="Code Successfully Saved!";
});

// Event listener for the "Save Code" button to trigger the saveCode function
document.getElementById("how").addEventListener("click", async function() {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    localStorage.setItem("savedCode", stringUserCode);
    const outputDiv = document.getElementById("output"); // Output div where results will be displayed
    outputDiv.innerHTML="Code Successfully Saved!";
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

async function victorySend() {
    try {
        // Retrieve the JWT token from local storage
        if (localStorage.getItem("jwt_token") != null) {

            const token = localStorage.getItem("jwt_token");
            
            //  Prepare the payload
            const payload = {
                gridState: localStorage.getItem("gridState"),
                stopwatchTime: localStorage.getItem("stopwatchTime"),
                savedCode: localStorage.getItem("savedCode"),
                attempts: attempt
            };



            // Send the POST request with the token in the header
            fetch("http://localhost:5000/victory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Include the token here
                },
                body: JSON.stringify(payload)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        console.log("State updated successfully:", data.message);
                        document.getElementById("debug").innerHTML = data.message;
                    } else if (data.error) {
                        console.error("Error updating state:", data.error);
                        document.getElementById("debug").innerHTML = data.error;
                    }
                })
                .catch(error => {
                    console.error("Network error:", error);
                    document.getElementById("debug").innerHTML = error;
                });



        }
        else {
            document.getElementById("debug").innerHTML = "No token found";
        }


    }
    catch (error) {
        document.getElementById("debug").innerHTML = error;
    }


}




// SCRIPT FOR THE SUBMIT BUTTON SO THAT THE EVENT LISTERS CAN BE ONE
// Add an event listener to the "submitCode" button that triggers when it's clicked
document.getElementById("submitCode").addEventListener("click", async function () {
    attempt++;
    var victory = false;
    // Get the user's code from the CodeMirror editor (this is where the user inputs their code)
    const userCode = editor.getValue();
    // Get the output div element where the results or error messages will be displayed
    const outputDiv = document.getElementById("output");

    try {
        // Send the user's code to the backend via a POST request to the "/test" endpoint
        const response = await fetch("http://127.0.0.1:5000/test", {
            method: "POST",  // Use POST method for sending data
            headers: { "Content-Type": "application/json" },  // Set the content type to JSON
            body: JSON.stringify({ code: userCode }),  // Send the user's code as a JSON string
        });

        // Parse the JSON response from the backend
        const result = await response.json();

        // Check if there was an error in the response (e.g., compilation error)
        if (!result.error.length == 0) {
            // If there is an error, display the compilation error and the error details
            outputDiv.textContent = "COMPILATION ERROR";
            outputDiv.innerHTML += "<br>NO SUBMISSION RECORDED<br>ERROR OUTPUT:<br>";
            outputDiv.innerHTML += result.error;  // Display the error message
        } else {
            const userCode = editor.getValue();
            const stringUserCode = JSON.stringify(userCode);
            localStorage.setItem("savedCode", stringUserCode);
            // If no error, display the success message and the output from the backend
            outputDiv.innerHTML = "Code Successfully Submitted<br>output:<br>";
            outputDiv.innerHTML += result.output || "No output";  // Display the output or "No output" if none

            // Convert the 'testList' object (test results) into an array
            const array = result.testList;
            const resultsArray = Object.values(array);  // Get the values of the test results
            const numTests = result.numTests;  // Get the number of tests

            // Call the colorRow function to color the rows based on the test results
            colorRow(resultsArray, numTests);

            // Check if all tests pass using the victoryCheck function
            if (!victoryCheck(numTests)) {
                // If not all tests pass, add a new row to the grid
                addRow(numTests);
            } else {
                victory = true;
                // If all tests pass, disable the submit button and stop the stopwatch
                const submitButton = document.getElementById("submitCode");
                submitButton.disabled = true;  // Disable the submit button
                stopStopwatch();  // Stop the stopwatch
                
            }
        }
    } catch (error) {
        // If there is an error with the fetch request (e.g., server is unreachable), display an error message
        outputDiv.textContent = "Failed to connect to the server." + error;
    }

    // After processing the result, save the current grid state to localStorage
    const grid = document.getElementById("grid-container");
    const gridState = [];

    // Loop through each child element (rectangle) in the grid
    const children = grid.children;
    for (let child of children) {
        // Save the properties of each child (e.g., tag name, text content, class list, styles, and data attributes)
        gridState.push({
            tagName: child.tagName,  // Save the tag name (e.g., 'DIV')
            textContent: child.textContent,  // Save the text content of the rectangle
            classList: [...child.classList],  // Save all the classes as an array
            styles: child.style.cssText,  // Save the inline styles as a string
            dataset: { ...child.dataset },  // Save all the data-* attributes
        });
    }

    // Store the grid state as a JSON string in localStorage
    localStorage.setItem("gridState", JSON.stringify(gridState));

    if(victory){
        victorySend();
    }

});










document.addEventListener("DOMContentLoaded", () =>{
    if(!localStorage.getItem("savedCode")){
        loadSkeleton(1);
    }
    
});
