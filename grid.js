// JAVASCRIPT FOR ALL GRID AND TEXT THINGS

// Get references to the grid container and buttons from the DOM
const gridContainer = document.getElementById('grid-container');  // The container where the rectangles will be added
const addRowButton = document.getElementById('submitCode');  // Button to trigger adding a new row
const colorRowButton = document.getElementById('color-row-button');  // Button to trigger coloring the current row

let currentRowIndex = 0;  // Keeps track of the current row index that should be colored

// Function to add a new row to the grid
function addRow(numTests) {
    const columnNumber = numTests;  // Set the number of columns to match the number of tests
    const rowNumber = gridContainer.children.length / columnNumber + 1;  // Calculate the current row number (1-based index)

    // Loop through each column and create a rectangle for each test
    for (let i = 1; i <= columnNumber; i++) {
        const rectangle = document.createElement('div');  // Create a new div element for each rectangle
        rectangle.classList.add('rectangle');  // Add the 'rectangle' class for styling
        rectangle.textContent = `${"Test: "} ${i}`;  // Set the text content to display the test number
        gridContainer.appendChild(rectangle);  // Append the rectangle to the grid container
    }
}

// Function to color a row based on the results
function colorRow(stringList, numTests) {
    const rectangles = document.querySelectorAll('.rectangle');  // Get all rectangles in the grid
    const totalColumns = numTests;  // Set the total number of columns in the grid
    const totalRows = rectangles.length / totalColumns;  // Calculate the total number of rows in the grid

    // Check if there are still rows to color
    if (currentRowIndex < totalRows) {
        // Calculate the start and end indices for the current row
        const startIndex = currentRowIndex * totalColumns;
        const endIndex = startIndex + totalColumns;

        // Check if stringList is an array (for debugging)
        if (!Array.isArray(stringList)) {
            const weird = document.getElementById("weird");  // Find the element with id "weird"
            weird.innerHTML = "not array";  // Display a message if stringList is not an array
        }

        // Loop through each result in the stringList and color the corresponding rectangle
        stringList.forEach((result, index) => {
            if (result == "Success") {
                // If the result is "Success", add a 'green' class to the corresponding rectangle
                rectangles[index + startIndex].classList.add('green');
            } else if (result == "Failure") {
                // If the result is "Failure", add a 'red' class to the corresponding rectangle
                rectangles[index + startIndex].classList.add('red');
            } else {
                // If the result is neither "Success" nor "Failure", log the unknown value
                console.log(`Index ${index}: Unknown value (${result}).`);
            }
        });

        // Increment the row index to move to the next row for the next time colorRow is called
        currentRowIndex++;
    }
}

// Function to check if all tests in the current row are successful (green)
function victoryCheck(numTests) {
    // Get all elements with the class 'rectangle' (all the grid cells)
    const rectangles = document.querySelectorAll('.rectangle');

    // Calculate the total number of columns (numTests should match the number of columns)
    const totalColumns = numTests;

    // Decrement currentRowIndex by 1 to refer to the previous row (since index starts from 0)
    const newCurrentRow = currentRowIndex - 1;

    // Calculate the start and end indices for the current row of rectangles
    const startIndex = newCurrentRow * totalColumns;
    const endIndex = startIndex + totalColumns;

    // Ensure that there are enough rectangles in the grid to match the current row
    if (rectangles.length < endIndex) {
        // If not enough rectangles exist, log an error and return false
        console.error('Not enough rectangles in the grid.');
        return false; // Return false if there aren't enough rectangles
    }

    // Loop through each rectangle in the current row
    for (let i = startIndex; i < endIndex; i++) {
        const rectangle = rectangles[i];

        // Check if the rectangle exists at the current index
        if (!rectangle) {
            // If the rectangle is undefined, log an error and return false
            console.error(`Rectangle at index ${i} is undefined.`);
            return false;
        }

        // Check if the rectangle has the 'green' class
        if (!rectangle.classList.contains('green')) {
            // If any rectangle is not green, return false
            return false;
        }
    }

    // If all rectangles in the current row are green, return true
    return true;
}

// Asynchronous function to initialize the grid and send code for execution
async function initializeColumn() {
    // Get the grid container element where the rectangles will be appended
    const gridContainer = document.getElementById('grid-container');

    // Ensure the gridContainer exists before trying to add elements to it
    if (!gridContainer) {
        console.error("Grid container not found!");  // Log an error if grid container is not found
        return;  // Exit the function if grid container is not available
    }

    // Get the user's code from the CodeMirror editor
    const userCode = editor.getValue();
    // Get the output div to display results
    const outputDiv = document.getElementById("output");
    // (Unused in this code, but might be for debugging or other purposes)
    const weird = document.getElementById("weird");

    // Send the code to the backend for execution
    try {
        const response = await fetch("http://127.0.0.1:5000/Startup");
        const result = await response.json();

        // After receiving the result, use the numTests property to create rectangles in the grid
        const numTest = result.Array;  // Get the number of tests from the response

        // Ensure numTest is a valid number greater than 0
        if (numTest && typeof numTest === "number" && numTest > 0) {
            // Update the grid's CSS layout dynamically based on numTests
            const gridElement = document.querySelector('.grid');
            if (gridElement) {
                // Set the number of columns in the grid dynamically
                gridElement.style.gridTemplateColumns = `repeat(${numTest}, 100px)`;  // Update grid layout for columns
            }

            // Create the rectangles (one for each test) and add them to the grid container
            for (let i = 1; i <= numTest; i++) {
                // Create a new div element for each rectangle
                const rectangle = document.createElement('div');
                // Add a class to the rectangle for styling
                rectangle.classList.add('rectangle');
                // Set the text content of the rectangle to display the test number
                rectangle.textContent = `Test: ${i}`;
                // Append the rectangle to the grid container
                gridContainer.appendChild(rectangle);
            }
        } else {
            // Log an error if numTest is not valid
            console.error("Invalid numTests value.");
        }
    } catch (error) {
        // Handle any errors that occur during the fetch or other asynchronous operations
        outputDiv.textContent = "Failed to connect to the server.";  // Display a connection error message
    }
}

// Initialize the grid by calling the function to set up the columns and rectangles
initializeColumn();

// Function to fetch and display the test explanation
async function fetchTestExplanation() {
    const questionElement = document.getElementById("Question");
    try {
        const response = await fetch("http://127.0.0.1:5000/Startup");
        const data = await response.json();
        questionElement.innerHTML = data.explanation;  // Set the inner HTML to the test explanation
    } catch (error) {
        questionElement.textContent = "Failed to load test explanation.";  // Show error message if fetch fails
        console.error("Error fetching test explanation:", error);
    }
}

// Run on startup to fetch the test explanation
fetchTestExplanation();
