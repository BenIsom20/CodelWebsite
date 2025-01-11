// JAVASCRIPT FOR ALL GRID AND TEXT THINGS

// Get references to the grid container and buttons from the DOM
const gridContainer = document.getElementById('grid-container');  // The container where the rectangles will be added
const addRowButton = document.getElementById('submitCode');  // Button to trigger adding a new row
const colorRowButton = document.getElementById('color-row-button');  // Button to trigger coloring the current row

// Global variables for the current row to be colored and the amount of rows
let currentRowIndex = 0;
let amountOfRow = 0;

// Function to add a new row to the grid
function addRow(numTests) {
    const columnNumber = numTests;
    const rowNumber = Math.floor(gridContainer.children.length / columnNumber) + 1;

    // Loop through each column and create a rectangle for each test
    for (let i = 1; i <= columnNumber; i++) {
        const rectangle = document.createElement('div');
        rectangle.classList.add('rectangle');

        // Create an <img> element for the suitcase icon
        const suitcaseImage = document.createElement('img');
        suitcaseImage.src = `/static/images/greyCase${i}.svg`;
        suitcaseImage.alt = 'Suitcase';
        suitcaseImage.classList.add('suitcase-img');
        rectangle.appendChild(suitcaseImage);

        // Append the rectangle to the grid container
        gridContainer.appendChild(rectangle);
    }
    amountOfRow++;
}

// Function to color the next row corresponding to the results of the tests
function colorRow(stringList, numTests) {
    const rectangles = document.querySelectorAll('.rectangle');
    const totalColumns = numTests;
    const totalRows = Math.floor(rectangles.length / totalColumns);

    if (currentRowIndex < totalRows) {
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
                        suitcaseImage.src = `/static/images/greenCase${index + 1}.svg`;
                    }
                } else if (result.includes("Failure") || result.includes("Error")) {
                    // If the result includes "Failure" or "Error", add a 'red' class to the corresponding rectangle
                    rectangle.classList.add('red');

                    // Change suitcase image to red case
                    let suitcaseImage = rectangle.querySelector('.suitcase-img');
                    if (suitcaseImage) {
                        suitcaseImage.src = `/static/images/redCase${index + 1}.svg`;
                    }
                }
            }
        });
        currentRowIndex++;
    }
}

// Asynchronous function to initialize the grid and send code for execution
async function initializeColumn() {
    // Send the code to the backend for execution
    const response = await fetch(`http://${publicIp}/Startup`);
    const result = await response.json();

    // After receiving the result, use the numTests property to create rectangles in the grid
    const numTest = result.Array;
    if (numTest) {
        // Update the grid's CSS layout dynamically based on numTests
        const gridElement = document.querySelector('.grid');
        if (gridElement) {
            gridElement.style.gridTemplateColumns = `repeat(${numTest}, minmax(auto,200px))`;  // Update grid layout for columns
            const height = gridElement.offsetWidth/numTest - numTest*10;
            gridElement.style.gridTemplateRows = `repeat(${numTest}, minmax(${height}, 100px))`;
        }

        // Create the rectangles (one for each test) and add them to the grid container
        for (let i = 1; i <= numTest; i++) {
            const rectangle = document.createElement('div');
            rectangle.classList.add('rectangle');

            // Create an img element for the suitcase image
            const suitcaseImage = document.createElement('img');
            suitcaseImage.src = `/static/images/greyCase${i}.svg`;
            suitcaseImage.alt = 'Suitcase';
            suitcaseImage.classList.add('suitcase-img');
            rectangle.appendChild(suitcaseImage);

            // Append the rectangle to the grid container
            gridContainer.appendChild(rectangle);
        }
    } else {
        // not used may set up logging in the future
    }
    amountOfRow++;
}

// Function to fetch from backend what the challenge prompt is
async function fetchTestExplanation() {
    const questionElement = document.getElementById("question");
    const currentDate = new Date().toISOString().split('T')[0];
    const lastRunDate = Cookies.get('lastTypingEffectRunDate');

    // Fetch question data
    const response = await fetch(`http://${publicIp}/Startup`);
    const data = await response.json();
    var txt = data.prompt; // Get the prompt from the fetched data

    // checks for logged in user to change prompt to have their name
    if (localStorage.getItem('jwt_token')) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response2 = await fetch(`http://${publicIp}/protected`, {
                // Send a GET request to the protected endpoint with the token in the Authorization header
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const usernameDict = await response2.json();
            const username = usernameDict.username;
            if (response2.ok && username) {
                txt = `Hello ${username}, ${txt}`;
            }
        } catch (error) {
            // empty for right now may add logging in future
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
    // Otherwise runs the animation for first load
    questionElement.innerHTML = "<span id='typed-text'></span><span class='cursor'>|</span>";
    let i = 0;
    const sentencePause = 1000;
    let typingTimeout;

    // Function to generate a random speed between 30 and 100
    function getRandomSpeed() {
        return Math.floor(Math.random() * (30 - 10 + 1)) + 20;
    }

    // Function to toggle cursor blink (only on '|')
    function toggleCursorBlink() {
        const cursor = document.querySelector(".cursor");
        cursor.classList.toggle("blink");
    }

    // Function to make animation of typing prompt
    function typeWriter() {
        // Check if there's more text to type
        if (i < txt.length) {
            const typedText = document.getElementById("typed-text");
            // Add character to the text
            typedText.innerHTML = txt.substring(0, i); // Add typed text (no cursor here)

            // Add the blinking cursor (|)
            const cursor = document.querySelector(".cursor");
            cursor.style.visibility = "visible";

            const currentChar = txt.charAt(i);

            typedText.innerHTML = txt.substring(0, i + 1);

            if (currentChar === '.' || currentChar === '?' || currentChar === '!') {
                // Pause after punctuation, then blink cursor
                typingTimeout = setTimeout(() => {
                    toggleCursorBlink();
                    typingTimeout = setTimeout(typeWriter, sentencePause);
                }, sentencePause);
            } else {
                typingTimeout = setTimeout(typeWriter, getRandomSpeed());
            }

            i++;
        } else {
            // After typing completes, stop blinking and remove the cursor
            const cursor = document.querySelector(".cursor");
            cursor.classList.remove("blink");
            setTimeout(() => {
                cursor.style.visibility = "hidden";
            }, 500);
        }
    }
    // Start the typing effect
    typeWriter();

    // Set the cookie with the current date, and make it expire at midnight (next day)
    Cookies.set('lastTypingEffectRunDate', currentDate, { expires: 1 }); // Cookie expires in 1 day
}

// Function that stores what the current state of the grid to local storage
async function storeGridState(victory) {
    const grid = document.getElementById("grid-container");
    const gridState = [];

    // Loop through each child (rectangle) in the grid and store each
    const children = grid.children;
    for (let child of children) {
        const suitcaseImage = child.querySelector('.suitcase-img');
        const imageSrc = suitcaseImage ? suitcaseImage.src : '';

        gridState.push({
            tagName: child.tagName,
            imageSrc: imageSrc,
            classList: [...child.classList],
            styles: child.style.cssText,
            dataset: { ...child.dataset },
        });
    }

    // Save the array to localStorage
    const jsongridState = JSON.stringify(gridState);
    await setGridLocalStorageWithExpiry("gridState", jsongridState);

    // checks if there was a victory to corresponding animations and what data to send to the backend
    if (victory) {
        victorySend(); // Function to send victory data to backend
        victorySequence(); // Animation upon victory
    } else {
        saveProgress(); // Function to send attempt data to backend
        trySequence(); // Animaiton upon partial attempt
    }
}

// Asynchronous function to load the grid state from localStorage and reinitialize the grid
async function loadGridState() {
    // Fetch the number of tests from the server (assumed to be related to the grid)
    const response = await fetch(`http://${publicIp}/Startup`);
    const result = await response.json();

    // After receiving the result, use the numTests property to determine how many columns to create in the grid
    const numTest = result.Array;

    if (numTest) {
        // Update the grid's CSS layout dynamically based on numTests
        const gridElement = document.querySelector('.grid');
        if (gridElement) {
            gridElement.style.gridTemplateColumns = `repeat(${numTest}, minmax(auto,200px))`;  // Update grid layout for columns
            const height = gridElement.offsetWidth/numTest - numTest*10;
            gridElement.style.gridTemplateRows = `repeat(${numTest}, minmax(${height}, 100px))`;
        }
    }

    // Retrieve the saved grid state from localStorage
    const savedState = JSON.parse(getGridLocalStorageWithExpiry("gridState"));
    // Check if the saved state is valid and is an array
    if (savedState && Array.isArray(savedState)) {
        const grid = document.getElementById("grid-container");
        grid.innerHTML = "";

        // Recreate each rectangle based on saved data
        currentRowIndex = savedState.length / numTest - 1;
        savedState.forEach((item) => {
            const rectangle = document.createElement(item.tagName);
            rectangle.classList.add(...item.classList);
            rectangle.style.cssText = item.styles;
            for (const [key, value] of Object.entries(item.dataset)) {
                rectangle.dataset[key] = value;
            }
            if (item.imageSrc) {
                const suitcaseImage = document.createElement('img');
                suitcaseImage.src = item.imageSrc;
                suitcaseImage.alt = 'Suitcase';
                suitcaseImage.classList.add('suitcase-img');
                rectangle.appendChild(suitcaseImage);
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

    // Loop through each rectangle in the current row to check if all pass
    for (let i = startIndex; i < endIndex; i++) {
        const rectangle = rectangles[i];
        // Check if the rectangle has the 'green' class
        if (!rectangle.classList.contains('green')) {
            // If any rectangle is not green, set fail to true
            fail = true;
        }
    }

    // If none of the rectangles in the current row failed (i.e., all are green)
    if (!fail) {
        // Disable the submit button and stop the stopwatch if all tests are successful
        await victorySequence();
        const submitButton = document.getElementById("submitCode");
        submitButton.disabled = true;
        stopStopwatch();
    }
}

// Function to set to the local storage with expiration date at midnight chicago time
async function setGridLocalStorageWithExpiry(key, value) {

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