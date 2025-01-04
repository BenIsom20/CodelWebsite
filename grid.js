// JAVASCRIPT FOR ALL GRID AND TEXT THINGS

// Get references to the grid container and buttons from the DOM
const gridContainer = document.getElementById('grid-container');  // The container where the rectangles will be added
const addRowButton = document.getElementById('submitCode');  // Button to trigger adding a new row
const colorRowButton = document.getElementById('color-row-button');  // Button to trigger coloring the current row

let currentRowIndex = 0;  // Keeps track of the current row index that should be colored
let amountOfRow = 0;

// Function to add a new row to the grid
function addRow(numTests) {
    const columnNumber = numTests; // Set the number of columns to match the number of tests
    const rowNumber = Math.floor(gridContainer.children.length / columnNumber) + 1; // Calculate the current row number (1-based index)

    // Loop through each column and create a rectangle for each test
    for (let i = 1; i <= columnNumber; i++) {
        const rectangle = document.createElement('div'); // Create a new div element for each rectangle
        rectangle.classList.add('rectangle'); // Add the 'rectangle' class for styling

        // Create an <img> element for the suitcase icon
        const suitcaseImage = document.createElement('img');
        suitcaseImage.src = 'images/greyCase.svg'; // Default to grey suitcase
        suitcaseImage.alt = 'Suitcase'; // Add an alt attribute for accessibility
        suitcaseImage.classList.add('suitcase-img'); // Add a class for styling

        // Append the suitcase image to the rectangle
        rectangle.appendChild(suitcaseImage);

        // Append the rectangle to the grid container
        gridContainer.appendChild(rectangle);
    }

    amountOfRow++;
}

function colorRow(stringList, numTests) {
    const rectangles = document.querySelectorAll('.rectangle');  // Get all rectangles in the grid
    const totalColumns = numTests;  // Set the total number of columns in the grid
    const totalRows = Math.floor(rectangles.length / totalColumns);  // Calculate the total number of rows in the grid

    // Check if there are still rows to color
    if (currentRowIndex < totalRows) {
        // Calculate the start index of the current row
        const startIndex = currentRowIndex * totalColumns;

        // Loop through each result in the stringList and color the corresponding rectangle
        stringList.forEach((result, index) => {
            // Ensure we're within the bounds of the current row
            const rectIndex = startIndex + index;
            if (rectIndex < rectangles.length) {
                const rectangle = rectangles[rectIndex];

                if (result.includes("Success")) {
                    // If the result is "Success", add a 'green' class to the corresponding rectangle
                    rectangle.classList.add('green');

                    // Change suitcase image to green case
                    let suitcaseImage = rectangle.querySelector('.suitcase-img');
                    if (suitcaseImage) {
                        suitcaseImage.src = 'images/greenCase.svg';  // Change the image
                    }
                } else if (result.includes("Failure") || result.includes("Error")) {
                    // If the result includes "Failure" or "Error", add a 'red' class to the corresponding rectangle
                    rectangle.classList.add('red');

                    // Change suitcase image to red case
                    let suitcaseImage = rectangle.querySelector('.suitcase-img');
                    if (suitcaseImage) {
                        suitcaseImage.src = 'images/redCase.svg';  // Change the image
                    }
                }
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

            // Create an img element for the suitcase image
            const suitcaseImage = document.createElement('img');
            suitcaseImage.src = 'images/greyCase.svg';  // Set the image source
            suitcaseImage.alt = 'Suitcase';           // Set an alt text for accessibility
            suitcaseImage.classList.add('suitcase-img'); // Add a class for custom styling if needed

            // Append the image to the rectangle
            rectangle.appendChild(suitcaseImage);

            // Append the rectangle to the grid container
            gridContainer.appendChild(rectangle);
        }
    } else {
        // Log an error if numTest is not valid
    }

    amountOfRow++;
}

async function fetchTestExplanation() {
    const questionElement = document.getElementById("Question");

    // Get the current date in "YYYY-MM-DD" format
    const currentDate = new Date().toISOString().split('T')[0];

    // Get the stored cookie date (if exists)
    const lastRunDate = Cookies.get('lastTypingEffectRunDate');

    // Fetch question data
    const response = await fetch("http://127.0.0.1:5000/Startup");
    const data = await response.json();
    var txt = data.prompt; // Get the prompt from the fetched data

    if (localStorage.getItem('jwt_token')) {
        try {
            const token = localStorage.getItem('jwt_token'); // Retrieve the token from localStorage
            const response2 = await fetch("http://127.0.0.1:5000/protected", {
                // Send a GET request to the protected endpoint with the token in the Authorization header
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const usernameDict = await response2.json();
            const username = usernameDict.username;

            // Check if the user is logged in and add a greeting to the question prompt
            if (response2.ok && username) {
                // If the user is logged in, append Hello 'username' to the question prompt
                txt = `Hello ${username}, ${txt}`;
            }
        } catch (error) {
            // If there's an error fetching the username, log the error
            alert(error);
        }
    } else {
        // If the user is not logged in, append a generic greeting to the question prompt
        txt = `Hello guest, ${txt}`;
    }

    // Check if the date has changed
    if (lastRunDate === currentDate) {
        // If the effect has already run today, just populate the Question element with the full text
        questionElement.innerHTML = txt;
        return;
    }

    // Set the question prompt (this will initialize the text for the typing effect)
    questionElement.innerHTML = "<span id='typed-text'></span><span class='cursor'>|</span>"; // Separate the cursor and typed-text container

    let i = 0;
    const sentencePause = 1000; // Pause duration after each sentence
    let typingTimeout;

    // Function to generate a random speed between 30 and 100
    function getRandomSpeed() {
        return Math.floor(Math.random() * (30 - 10 + 1)) + 20; // Random speed between 10 and 30
    }

    // Function to toggle cursor blink (only on '|')
    function toggleCursorBlink() {
        const cursor = document.querySelector(".cursor");
        cursor.classList.toggle("blink"); // Toggle blink class on the cursor (|)
    }

    function typeWriter() {
        // Check if there's more text to type
        if (i < txt.length) {
            const typedText = document.getElementById("typed-text");
            // Add character to the text
            typedText.innerHTML = txt.substring(0, i); // Add typed text (no cursor here)

            // Add the blinking cursor (|)
            const cursor = document.querySelector(".cursor");
            cursor.style.visibility = "visible"; // Ensure cursor is visible

            // Get the current character
            const currentChar = txt.charAt(i);

            // Print the character first, then handle punctuation logic
            typedText.innerHTML = txt.substring(0, i + 1); // Add current character

            if (currentChar === '.' || currentChar === '?' || currentChar === '!') {
                // Pause after punctuation, then blink cursor
                typingTimeout = setTimeout(() => {
                    toggleCursorBlink(); // Start blinking the cursor
                    // Pause before continuing the typing effect
                    typingTimeout = setTimeout(typeWriter, sentencePause);
                }, sentencePause); // Pause duration after punctuation
            } else {
                // Continue typing with random speed
                typingTimeout = setTimeout(typeWriter, getRandomSpeed());
            }

            i++; // Increment to next character
        } else {
            // After typing completes, stop blinking and remove the cursor
            const cursor = document.querySelector(".cursor");
            cursor.classList.remove("blink"); // Stop blinking
            setTimeout(() => {
                cursor.style.visibility = "hidden"; // Hide cursor completely after the typing is done
            }, 500); // Wait for a moment before hiding the cursor
        }
    }

    // Start the typing effect
    typeWriter();

    // Set the cookie with the current date, and make it expire at midnight (next day)
    Cookies.set('lastTypingEffectRunDate', currentDate, { expires: 1 }); // Cookie expires in 1 day
}

function storeGridState(victory) {
    const grid = document.getElementById("grid-container");
    const gridState = [];

    // Loop through each child (rectangle) in the grid
    const children = grid.children;
    for (let child of children) {
        const suitcaseImage = child.querySelector('.suitcase-img'); // Get the image element inside the rectangle
        const imageSrc = suitcaseImage ? suitcaseImage.src : '';  // Capture the src of the image (or empty string if no image)

        gridState.push({
            tagName: child.tagName, // Save the tag name (e.g., 'DIV')
            imageSrc: imageSrc, // Store the image src
            classList: [...child.classList], // Save all classes as an array
            styles: child.style.cssText, // Save inline styles as a string
            dataset: { ...child.dataset }, // Save all data-* attributes
        });
    }

    // Save the array to localStorage
    const jsongridState = JSON.stringify(gridState);
    setGridLocalStorageWithExpiry("gridState", jsongridState);

    if (victory) {
        victorySend(); // Send a victory signal if all tests pass
        victorySequence(); // Display victory message and fireworks
    } else {
        saveProgress();
        trySequence(); // Display try again message and animation
    }
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
    const savedState = JSON.parse(getGridLocalStorageWithExpiry("gridState"));

    // Check if the saved state is valid and is an array
    if (savedState && Array.isArray(savedState)) {
        const grid = document.getElementById("grid-container");
        grid.innerHTML = ""; // Clear the grid before reloading

        // Recreate each rectangle based on saved data
        currentRowIndex = savedState.length / numTest - 1; // Set the current row index to the last saved row

        // Recreate each rectangle based on saved data
        savedState.forEach((item) => {
            const rectangle = document.createElement(item.tagName); // Create element
            rectangle.classList.add(...item.classList); // Add the saved classes to the rectangle
            rectangle.style.cssText = item.styles; // Apply saved styles

            // Restore data-* attributes from the saved state
            for (const [key, value] of Object.entries(item.dataset)) {
                rectangle.dataset[key] = value; // Restore data attributes
            }

            // Create and append the image based on the saved imageSrc
            if (item.imageSrc) {
                const suitcaseImage = document.createElement('img');
                suitcaseImage.src = item.imageSrc; // Restore the image src
                suitcaseImage.alt = 'Suitcase'; // Set an alt text for accessibility
                suitcaseImage.classList.add('suitcase-img'); // Add class for styling
                rectangle.appendChild(suitcaseImage); // Append the image to the rectangle
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
        victorySequence();
        const submitButton = document.getElementById("submitCode");
        submitButton.disabled = true; // Disable the submit button
        stopStopwatch(); // Stop the stopwatch (assumed to be a function defined elsewhere)
    }
}

function setGridLocalStorageWithExpiry(key, value) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Next midnight
    const expiryTime = midnight.getTime(); // Get timestamp for midnight

    const data = {
        value: value,
        expiry: expiryTime,
    };

    localStorage.setItem(key, JSON.stringify(data));
}

function getGridLocalStorageWithExpiry(key) {
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