// JAVASCRIPT CODE FOR ALL CODEMIRROR ITEMS

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
        "Ctrl-Q": function(cm) {       // Toggle line commenting with Ctrl+Q
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

document.addEventListener("DOMContentLoaded", () =>{
    if(!localStorage.getItem("savedCode")){
        loadSkeleton(3);
    }
    
});
