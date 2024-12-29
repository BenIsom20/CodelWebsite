// JAVASCRIPT FOR ALL GRID AND TEXT THINGS

// Get references to the grid container and buttons from the DOM
const gridContainer = document.getElementById('grid-container');  // The container where the rectangles will be added
const addRowButton = document.getElementById('submitCode');  // Button to trigger adding a new row
const colorRowButton = document.getElementById('color-row-button');  // Button to trigger coloring the current row

let currentRowIndex = 0;  // Keeps track of the current row index that should be colored
let amountOfRow = 0;

// Function to add a new row to the grid
function addRow(numTests) {
    const columnNumber = numTests;  // Set the number of columns to match the number of tests
    const rowNumber = gridContainer.children.length / columnNumber + 1;  // Calculate the current row number (1-based index)

    // Loop through each column and create a rectangle for each test
    for (let i = 1; i <= columnNumber; i++) {
        const rectangle = document.createElement('div');  // Create a new div element for each rectangle
        rectangle.classList.add('rectangle');  // Add the 'rectangle' class for styling
        rectangle.textContent = `${"Case: "} ${i}`;  // Set the text content to display the test number
        gridContainer.appendChild(rectangle);  // Append the rectangle to the grid container
    }
    amountOfRow++;
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

        // Loop through each result in the stringList and color the corresponding rectangle
        stringList.forEach((result, index) => {
            if (result.includes("Success")) {
                // If the result is "Success", add a 'green' class to the corresponding rectangle
                rectangles[index + startIndex].classList.add('green');
            } else if (result.includes("Failure") || result.includes("Error")) {
                // If the result includes "Failure", add a 'red' class to the corresponding rectangle
                rectangles[index + startIndex].classList.add('red');
            } else {
                // If the result is neither "Success" nor contains "Failure", log the unknown value
            }
        });

        // Increment the row index to move to the next row for the next time colorRow is called
        currentRowIndex++;
    }
}

// Asynchronous function to initialize the grid and send code for execution
async function initializeColumn() {

    // Ensure the gridContainer exists before trying to add elements to it
    if (!gridContainer) {
        return;  // Exit the function if grid container is not available
    }

    // Get the output div to display results
    const outputDiv = document.getElementById("output");


    // Send the code to the backend for execution
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
            rectangle.textContent = `Case: ${i}`;
            // Append the rectangle to the grid container
            gridContainer.appendChild(rectangle);
        }
    } else {
        // Log an error if numTest is not valid
    }

    amountOfRow++;
}

// Function to fetch and display the test explanation
async function fetchTestExplanation() {
    const questionElement = document.getElementById("Question");
    const response = await fetch("http://127.0.0.1:5000/Startup");
    const data = await response.json();
    questionElement.innerHTML = data.explanation;  // Set the inner HTML to the test explanation
}

function storeGridState() {
    const grid = document.getElementById("grid-container");
    const gridState = [];

    // Loop through each child (rectangle) in the grid
    const children = grid.children;
    for (let child of children) {
        gridState.push({
            tagName: child.tagName, // Save the tag name (e.g., 'DIV')
            textContent: child.textContent, // Save text content
            classList: [...child.classList], // Save all classes as an array
            styles: child.style.cssText, // Save inline styles as a string
            dataset: { ...child.dataset }, // Save all data-* attributes
        });
    }

    // Save the array to localStorage
    localStorage.setItem("gridState", JSON.stringify(gridState));
}

// Asynchronous function to load the grid state from localStorage and reinitialize the grid
async function loadGridState() {

    // Fetch the number of tests from the server (assumed to be related to the grid)
    const response = await fetch("http://127.0.0.1:5000/Startup");
    const result = await response.json();

    // After receiving the result, use the numTests property to determine how many columns to create in the grid
    const numTest = result.Array;  // Get the number of tests from the response

    // Ensure numTest is a valid number greater than 0
    if (numTest && typeof numTest === "number" && numTest > 0) {
        // Update the grid's CSS layout dynamically based on numTests
        const gridElement = document.querySelector('.grid');
        if (gridElement) {
            // Set the number of columns in the grid dynamically using the numTest value
            gridElement.style.gridTemplateColumns = `repeat(${numTest}, 100px)`;
        }
    }

    // Retrieve the saved grid state from localStorage
    const savedState = JSON.parse(localStorage.getItem("gridState"));

    // Check if the saved state is valid and is an array
    if (savedState && Array.isArray(savedState)) {
        const grid = document.getElementById("grid-container");
        grid.innerHTML = ""; // Clear the grid before reloading

        // Recreate each rectangle based on saved data
        currentRowIndex = savedState.length / numTest - 1; // Set the current row index to the last saved row

        savedState.forEach((item) => {
            // For each item in the saved state, recreate the rectangle element
            const rectangle = document.createElement(item.tagName); // Create element
            rectangle.textContent = item.textContent; // Set the text content of the rectangle
            rectangle.classList.add(...item.classList); // Add the saved classes to the rectangle
            rectangle.style.cssText = item.styles; // Apply saved styles

            // Restore data-* attributes from the saved state
            for (const [key, value] of Object.entries(item.dataset)) {
                rectangle.dataset[key] = value; // Restore data attributes
            }

            // Append the recreated rectangle to the grid
            grid.appendChild(rectangle);
        });
    }

    // Initialize a flag to track if all rectangles in the current row are successful (green)
    var fail = false;

    // Get all elements with the class 'rectangle' (all grid cells)
    const rectangles = document.querySelectorAll('.rectangle');

    // Set the total number of columns (numTest should match the number of columns)
    const totalColumns = numTest;

    // Adjust the currentRowIndex to refer to the previous row (since index starts from 0)
    const newCurrentRow = currentRowIndex;

    // Calculate the start and end indices for the current row of rectangles
    const startIndex = newCurrentRow * totalColumns;
    const endIndex = startIndex + totalColumns;

    // Ensure there are enough rectangles in the grid to match the current row
    if (rectangles.length < endIndex) {
        // If not enough rectangles exist, log an error and return false
        return false; // Return false if there aren't enough rectangles
    }

    // Loop through each rectangle in the current row
    for (let i = startIndex; i < endIndex; i++) {
        const rectangle = rectangles[i];

        // Check if the rectangle exists at the current index
        if (!rectangle) {
            // If the rectangle is undefined, log an error and return false

            return false;
        }

        // Check if the rectangle has the 'green' class
        if (!rectangle.classList.contains('green')) {
            // If any rectangle is not green, set fail to true
            fail = true;
        }
    }

    // If none of the rectangles in the current row failed (i.e., all are green)
    if (!fail) {
        // Disable the submit button and stop the stopwatch if all tests are successful
        const submitButton = document.getElementById("submitCode");
        submitButton.disabled = true; // Disable the submit button
        stopStopwatch(); // Stop the stopwatch (assumed to be a function defined elsewhere)
    }
}