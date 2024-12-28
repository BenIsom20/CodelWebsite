from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import io
import sys
import logging
from db_helper import get_challenge_by_id, get_challenge_cases_by_id, get_function_skeleton_by_id

# Setup Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Setup logging configuration
logging.basicConfig(level=logging.DEBUG)

# Global variables to store current challenge details
current_challenge = {}
current_challenge_cases = []
current_challenge_function_skeleton = {}

def set_current_challenge(challenge_id):
    """Fetch the challenge from the database and set it to the global variable."""
    global current_challenge
    current_challenge = get_challenge_by_id(challenge_id)

def set_current_challenge_cases(challenge_id):
    """Fetch the challenge test cases from the database and set them to the global variable."""
    global current_challenge_cases
    current_challenge_cases = get_challenge_cases_by_id(challenge_id)

def set_current_challenge_function_skeleton(challenge_id):
    """Fetch the function skeleton from the database and set it to the global variable."""
    global current_challenge_function_skeleton
    current_challenge_function_skeleton = get_function_skeleton_by_id(challenge_id)

@app.route("/run", methods=["POST"])
def execute_code():
    """Route to execute user-provided Python code."""
    try:
        # Get the code from the request
        data = request.json
        code = data.get("code", "").replace("\t", "    ")  # Replace tabs with spaces

        # Execute the code using subprocess
        process = subprocess.run(
            ["python3", "-c", code],  # Use "python" if using Python 2
            text=True,
            capture_output=True,
            timeout=5  # Timeout for preventing long-running processes
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

@app.route("/test", methods=["POST"])
def test_code():
    """Route to test the user's code against predefined test cases."""
    try:
        # Get the code from the request
        data = request.json
        code = data.get("code", "")

        # Get function name from the skeleton
        function_name = current_challenge_function_skeleton['name']

        results = {}
        given_values = []  # To store the given values for each test case

        # Loop through each test case
        for case in current_challenge_cases:
            # Add the given value for the test case
            given_data = case['given_data']
            given_values.append(given_data)

            expected = case['expected']

            # Prepare the code to execute, including the function call
            code_call = f"{function_name}({given_data})"
            full_code = f"""
{code}

# Call the function and print the result
result = {code_call}
# Capture the output
captured_output.seek(0)  # Move cursor to the beginning of the buffer
captured_output.truncate(0)  # Clear the content in the buffer
print(result)  # Print the result
"""
            # Capture the output using StringIO
            captured_output = io.StringIO()
            sys.stdout = captured_output  # Redirect stdout to capture print statements

            try:
                full_code = full_code.replace("\t", "    ")  # Replace tabs with spaces
                exec(full_code)  # Execute the user code

                # Get the captured output and compare with expected
                actual_output = captured_output.getvalue().strip()

                # Check if the output matches the expected result
                if str(actual_output) == str(expected):
                    results[case['challenge_case_id']] = f"Success: Expected '{expected}', got '{actual_output}'"
                else:
                    results[case['challenge_case_id']] = f"Failure: Expected '{expected}', got '{actual_output}'"

            except Exception as e:
                results[case['challenge_case_id']] = f"Error: {str(e)}"
            finally:
                sys.stdout = sys.__stdout__  # Reset stdout to default

        # Return the results and given values to the frontend
        return jsonify({
            "numTests": len(results),
            "testList": results,
            "givenValues": given_values  # Include the given values in the response
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/Startup", methods=["GET"])
def Startup():
    """Route to initialize and return the current challenge details."""
    # Set the current challenge to the specified challenge ID (3 in this case)
    set_current_challenge(3)
    set_current_challenge_cases(3)
    set_current_challenge_function_skeleton(3)
   
    # Generate an explanation for the test, including the challenge prompt and test case details
    descriptions = {
        "Question": current_challenge["prompt"],
        **{
            f"Case {i + 1}": f"Case {i + 1}: {case['prompt']} ({case['given_data']} -> {case['expected']})"
            for i, case in enumerate(current_challenge_cases)
        }
    }

    # Generate explanation string
    explanation = "<br>".join(descriptions.values())

    return jsonify({
        "explanation": explanation,
        "Array": len(descriptions) - 1  # Number of test cases
    })

@app.route('/get_skeleton/<int:challenge_id>', methods=['GET'])
def get_skeleton(challenge_id):
    """Route to fetch the function skeleton for a given challenge."""
    set_current_challenge_function_skeleton(challenge_id)
    skeleton = current_challenge_function_skeleton
    if skeleton:
        return jsonify({"skeleton": skeleton["skeleton"]}), 200
    else:
        return jsonify({"error": "Skeleton not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
