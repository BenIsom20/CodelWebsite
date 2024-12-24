// JAVASCRIPT CODE FOR ALL CODEMIRROR ITEMS

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


