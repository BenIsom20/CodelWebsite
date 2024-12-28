document.getElementById("submitCode").addEventListener("click", async function () {
    // Get the user's code from the CodeMirror editor (this is where the user inputs their code)
    const userCode = editor.getValue();
    const outputDiv = document.getElementById("output");

    try {
        // Send the user's code to the backend via a POST request
        const response = await fetch("http://127.0.0.1:5000/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: userCode }),
        });

        // Parse the JSON response from the backend
        const result = await response.json();

        if (result.error && result.error.length > 0) {
            // If there is a compilation error, display it
            outputDiv.innerHTML = result.error;
        } else {
            // Display success message and output
            outputDiv.innerHTML = "Code Successfully Submitted";

            // Get the test results and number of tests
            const resultsArray = Object.values(result.testList);
            const givenValues = result.givenValues; // Get the given values from the response
            const numTests = result.numTests;

            // Color the rows based on test results
            colorRow(resultsArray, numTests);

            // Display each test result with its given_value and actual result
            let resultDetails = "<h3>Test Results:</h3><ul>";
            for (let i = 0; i < resultsArray.length; i++) {
                const caseResult = resultsArray[i];
                const givenValue = givenValues[i];  // Get the corresponding given value from the response
                resultDetails += `<li>(${givenValue}) -> ${caseResult}</li>`;
            }
            resultDetails += "</ul>";

            // Append the result details to the output
            outputDiv.innerHTML += resultDetails;

            // Check if all tests pass
            if (!victoryCheck(resultsArray)) {
                // If not all tests pass, add a new row to the grid
                addRow(numTests);
            } else {
                // If all tests pass, disable the submit button and stop the stopwatch
                document.getElementById("submitCode").disabled = true;
                stopStopwatch();
            }
        }
    } catch (error) {
        // Handle fetch or server errors
        outputDiv.textContent = "Error in submission: " + error.message;
    }

    // Save the current grid state to localStorage
    const grid = document.getElementById("grid-container");
    const gridState = Array.from(grid.children).map(child => ({
        tagName: child.tagName,
        textContent: child.textContent,
        classList: [...child.classList],
        styles: child.style.cssText,
        dataset: { ...child.dataset },
    }));
    localStorage.setItem("gridState", JSON.stringify(gridState));
});

// Function to check if all tests passed
function victoryCheck(resultsArray) {
    // Loop through each result to find any "Failure"
    for (let result of resultsArray) {
        if (result.includes("Failure")) {
            return false; // Return false if any failure is found
        }
        if (result.includes("Error")) {
            return false; // Return false if any error is found
        }
    }
    return true; // Return true if all tests passed
}
