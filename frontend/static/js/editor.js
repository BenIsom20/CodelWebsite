// JAVASCRIPT CODE FOR ALL CODEMIRROR ITEMS

// Global attempt counter
var attempt = 0;

// Initialize CodeMirror editor with Python syntax highlighting and other settings
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-python",
    theme: "CodelTheme",
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 4,
    indentWithTabs: true,
    tabSize: 4,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    foldGutter: true,
    styleActiveLine: true,
    highlightSelectionMatches: {
        showToken: true,
        annotateScrollbar: true
    },
    readOnly: false,
    autofocus: true,
    cursorBlinkRate: 530,
    viewportMargin: Infinity,
});

editor.setSize("100%", 300); // Set the editor size


// Save code to localStorage with an expiry and notify user.
async function saveCode() {
    const userCode = editor.getValue();
    const stringUserCode = JSON.stringify(userCode);
    await setLocalStorageWithExpiry("savedCode", stringUserCode);
}

// Event listener for the "Leader" button to save code
document.getElementById("leader").addEventListener("click", saveCode);

// Event listener for the "How" button to save code
document.getElementById("how").addEventListener("click", saveCode);


// Fetch code skeleton from the backend.
async function fetchSkeleton() {
            const response = await fetch(`http://${publicIp}/get_skeleton`);
            if (response.ok) {
                return await response.json(); // Return parsed skeleton
            }
}

// Load code from localStorage or fetch skeleton if not found.
async function loadCode() {
    // checks if there is already code saved and if not then loads the skeleton
    const code = getLocalStorageWithExpiry("savedCode");
    if (code === null) {
        const skeleton = await fetchSkeleton();
        editor.setValue(skeleton.skeleton);
    } else {
            const parsedCode = JSON.parse(code);
            editor.setValue(parsedCode);
    }
}

// Event listener for "Run Code" button
document.getElementById("runCode").addEventListener("click", async function () {
    // Gets the code currently in the editor and sends it to backend for execution
    const userCode = editor.getValue();
    const outputDiv = document.getElementById("output");
    const response = await fetch(`http://${publicIp}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userCode }),
    });

    // Parse the response from the backend
    const result = await response.json();
    if (result.error && result.error.length > 0) {
        // Check response for error in ran code and display if so
        outputDiv.textContent = result.error;
    } else {
        // Display output or "No output" if none
        outputDiv.textContent = result.output || "No output";
    }
});

// Event listener for the "Submit Code" button
document.getElementById("submitCode").addEventListener("click", async function () {
    // tracks an attempt and gets the code in editor to send to backend for tests
    attempt++;
    var victory = false;
    const userCode = editor.getValue();
    const outputDiv = document.getElementById("output");
    try {
        // Send the user's code to the backend via a POST request
        const response = await fetch(`http://${publicIp}/test`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: userCode }),
        });

        // Parse the JSON response from the backend
        const result = await response.json();

        if (result.error && result.error.length > 0) {
            // Display compilation errors if present
            outputDiv.innerHTML = result.error;
        } else {
            // Save the submitted code to localStorage
            const stringUserCode = JSON.stringify(userCode);
            await setLocalStorageWithExpiry("savedCode", stringUserCode);

            // Notify the user of successful submission
            outputDiv.innerHTML = "Code Successfully Submitted";

            // Extract test results and outcomes
            const resultsArray = Object.values(result.testList);
            const givenValues = result.givenValues;
            const numTests = result.numTests;

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
        // no use right now may set up loggin in future
    }
    await storeGridState(victory); // Save the grid state to localStorage
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
        return true;
    } else {
        return false;
    }
}

// Function to check if a test case errored
function errored(result) {
    if (result.includes("Error")) {
        return true;
    } else {
        return false;
    }
}

// Function to send victory state and related data to the backend
async function saveProgress() {
    // Check user is signed in 
    if (localStorage.getItem("jwt_token") != null) {
        // get stored data
        const token = localStorage.getItem("jwt_token");
        const grid = getLocalStorageWithExpiry("gridState");
        const timer = getLocalStorageWithExpiry("stopwatchTime");
        const code = getLocalStorageWithExpiry("savedCode");

        // Prepare the payload with relevant data from local storage
        const payload = {
            gridState: grid,
            stopwatchTime: timer,
            savedCode: code,
            attempts: attempt
        };

        // Send a POST request to the backend to update victory state
        fetch(`http://${publicIp}/saveProgress`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
    }
}

// Function to send victory state and related data to the backend
async function victorySend() {
    // Check if user is signed in
    if (localStorage.getItem("jwt_token") != null) {
        // get data to send
        const token = localStorage.getItem("jwt_token");
        const grid = getLocalStorageWithExpiry("gridState");
        const timer = getLocalStorageWithExpiry("stopwatchTime");
        const code = getLocalStorageWithExpiry("savedCode");

        // Prepare the payload with relevant data from local storage
        const payload = {
            gridState: grid,
            stopwatchTime: timer,
            savedCode: code,
            attempts: attempt
        };

        // Send a POST request to the backend to update victory state
        fetch(`http://${publicIp}/victory`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
    }
}

// Function for animation when user wins and updates total time on codel
async function victorySequence() {
    // Animation for victory
    const navbar = document.getElementById("mainNavbar");
    const logo = document.getElementById("logo");
    navbar.classList.add("vic-burst");
    navbar.addEventListener("animationend", function () {
        navbar.classList.remove("vic-burst");
    });
    navbar.style.boxShadow = "0 2px 50px #61C9A8ed";
    logo.src = "static/images/V.gif?";
    const time = getLocalStorageWithExpiry("stopwatchTime");
    const timeDic = { "time_increment": time }

    // Send the user's code to the backend via a POST request to update total time
    const response = await fetch(`http://${publicIp}/updateAllTime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timeDic),
    });
}

// Funciton for animation when user attempts and does not win
function trySequence() {
    // Animation for try
    const navbar = document.getElementById("mainNavbar");
    navbar.classList.add("try-burst");
    navbar.addEventListener("animationend", function () {
        navbar.classList.remove("try-burst");
    });
}

// Function to set to the local storage with expiration date at midnight chicago time
async function setLocalStorageWithExpiry(key, value) {
    const response = await fetch(`http://${publicIp}/get_chicago_midnight`)
    const info = await response.json();
    if (response.ok) {
        const date = info.chicago_midnight_utc;
        const objdate = new Date(date);
        var expiryTime = objdate.getTime();

    }
    const data = {
        value: value,
        expiry: expiryTime,
    };

    localStorage.setItem(key, JSON.stringify(data));
}

// Function to pull from local storage and check if expired or not and only return if not expired
function getLocalStorageWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    if (now > item.expiry) {
        localStorage.removeItem(key); // Clear expired data
        return null; // Indicate that the data is expired
    }
    return item.value; // Return the valid data
}
