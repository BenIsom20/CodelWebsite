// SCRIPT FOR THE SUBMIT BUTTON SO THAT THE EVENT LISTERS CAN BE ONE
// Add an event listener to the "submitCode" button that triggers when it's clicked
document.getElementById("submitCode").addEventListener("click", async function () {
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
});
