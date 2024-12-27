from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
from db_helper import get_challenge_by_id, get_challenge_cases_by_id, get_function_skeleton_by_id

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Global variable for storing the current challenge
current_challenge = {}
current_challenge_cases = []
current_challenge_function_skeleton = {}

def set_current_challenge(challenge_id):
    """Fetch the challenge from the database and set it to the global variable."""
    global current_challenge
    current_challenge = get_challenge_by_id(challenge_id)

def set_current_challenge_cases(challenge_id):
    """Fetch the challenge cases from the database and set them to the global variable."""
    global current_challenge_cases
    current_challenge_cases = get_challenge_cases_by_id(challenge_id)

def set_current_challenge_function_skeleton(challenge_id):
    """Fetch the function skeleton from the database and set it to the global variable."""
    global current_challenge_function_skeleton
    current_challenge_function_skeleton = get_function_skeleton_by_id(challenge_id)

@app.route("/run", methods=["POST"])
def execute_code():
    try:
        # Get the code from the request
        data = request.json
        code = data.get("code", "")

        # Execute the code using subprocess (Python interpreter)
        process = subprocess.run(
            ["python3", "-c", code],  # Adjust to "python" if using Python 2
            text=True,
            capture_output=True,
            timeout=5  # Prevent long-running processes
        )

        # Return the output or error
        return jsonify({
            "output": process.stdout,
            "error": process.stderr
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Code execution timed out"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import subprocess
import logging
import textwrap

# Setup logging configuration
logging.basicConfig(level=logging.DEBUG)

import io
import sys

@app.route("/test", methods=["POST"])
def test_code():
    try:
        # Get the code from the request
        data = request.json
        code = data.get("code", "")

        # Debugging: Print the received code
        print("Received code to execute:")
        print(code)

        # Get function name
        function_name = current_challenge_function_skeleton['name']

        # Debugging: Print the function name
        print(f"Function name: {function_name}")

        # Create the results dictionary
        results = {}

        # Loop through each test case
        for case in current_challenge_cases:
            # Get given data & expected for case
            given_data = case['given_data']
            expected = case['expected']

            # Debugging: Print the test case details
            print(f"Running test case: {case['challenge_case_id']}")
            print(f"Given data: {given_data}")
            print(f"Expected: {expected}")

            # Setup the function call
            code_call = f"{function_name}({given_data})"
            print(f"Function call: {code_call}")

            # Prepare the code to execute, including the function call and print statement
            full_code = f"""
{code}

# Call the function and print the result
result = {code_call}
print(result)  # This will print the result to stdout
"""

            # Capture the output using StringIO
            captured_output = io.StringIO()
            sys.stdout = captured_output  # Redirect stdout to capture print statements

            try:
                # Execute the code dynamically
                exec(full_code)

                # Get the captured output
                actual_output = captured_output.getvalue().strip()

                # Debugging: Print the actual vs expected comparison
                print(f"Actual output: {actual_output}")
                print(f"Expected output: {expected}")

                # Convert both expected and actual to the same type
                if str(actual_output) == str(expected):
                    results[case['challenge_case_id']] = "Success"
                else:
                    results[case['challenge_case_id']] = f"Failure: Expected '{expected}', got '{actual_output}'"

            except Exception as e:
                # Handle any errors in code execution
                print(f"Error executing code: {e}")
                results[case['challenge_case_id']] = f"Error: {str(e)}"

            finally:
                sys.stdout = sys.__stdout__  # Reset stdout to default

        # Debugging: Print the final results dictionary
        print("Test results:", results)

        # Return the combined result
        return jsonify({
            "numTests": len(results),
            "testList": results
        })

    except Exception as e:
        # Handle general exceptions
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/Startup", methods=["GET"])
def Startup():

    # Set the current challenge to the first one
    set_current_challenge(2)
    set_current_challenge_cases(2)
    set_current_challenge_function_skeleton(2)
   
    # Explanation for the test
    descriptions = {
        "Question": current_challenge["prompt"],
        **{
            f"Case {i + 1}": 
            f"Case {i + 1}: {case['prompt']} ({case['given_data']} -> {case['expected']})"
            for i, case in enumerate(current_challenge_cases)
        }
    }

    explanation = ""
    for value in descriptions.values():
        explanation += value + "<br>" 
    # Add the value to the total

    return jsonify({
        "explanation": explanation,
        "Array": len(descriptions)-1
    })

@app.route('/get_skeleton/<int:challenge_id>', methods=['GET'])
def get_skeleton(challenge_id):
    set_current_challenge_function_skeleton(challenge_id)
    skeleton = current_challenge_function_skeleton
    skel = skeleton["skeleton"]
    if skeleton:
        return jsonify({"skeleton": skel}), 200  # Ensure 'skeleton' key
    else:
        return jsonify({"error": "Skeleton not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

