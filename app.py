from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

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

@app.route("/test", methods=["POST"])
def test_code():
    try:
        # Get the code from the request
        data = request.json
        code = data.get("code", "")

        # Execute the code using subprocess
        process = subprocess.run(
            ["python3", "-c", code],
            text=True,
            capture_output=True,
            timeout=5  # Prevent long-running processes
        )
        
         # Prepare the result for each test
        results = {
            "t1": "Success" if "1" in process.stdout else "Failure",
            "t2": "Success" if "2" in process.stdout else "Failure",
            "t3": "Success" if "3" in process.stdout else "Failure",
            "t4": "Success" if "4" in process.stdout else "Failure",
            "t5": "Success" if "5" in process.stdout else "Failure",
        }

        # Return the combined result
        return jsonify({
            **results,
            "output": process.stdout,
            "error": process.stderr,
            "numTests": len(results),
            "testList": results
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Code execution timed out"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/Startup", methods=["GET"])
def Startup():
    # Example explanation for the test
    descriptions = {
        "Question": "Challenge: Write a method to print 12345<br>",
        "test1ex": "Test 1: Checking if 1 is present",
        "test2ex": "Test 2: Checking if 2 is present",
        "test3ex": "Test 3: Checking if 3 is present",
        "test4ex": "Test 4: Checking if 4 is present",
        "test5ex": "Test 5: Checking if 5 is present"
    }

    explanation = ""
    for value in descriptions.values():
        explanation += value + "<br>" 
    # Add the value to the total

    
    return jsonify({
        "explanation": explanation,
        "Array": len(descriptions)-1
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
