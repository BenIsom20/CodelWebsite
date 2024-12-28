from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
from db_helper import get_challenge_by_id, get_challenge_cases_by_id, get_function_skeleton_by_id

from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
import mysql.connector
import json

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)




app.config["JWT_SECRET_KEY"] = "changeLater"
jwt = JWTManager(app)

db_config = {
    'host': 'db', # change this to the name of my db container if using docker
    'user': 'devuser', 
    'password': 'devpass',
    'database': 'qsdb' #database name
}

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
            #"t5": "Success" if "5" in process.stdout else "Failure",
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

    # Set the current challenge to the first one
    set_current_challenge(1)
    set_current_challenge_cases(1)
   
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


# Register a new user
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if not username or not password or not email:
            return jsonify({"error": "Missing required fields"}), 400

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Check if username or email already exists
        cursor.execute("SELECT user_id FROM users WHERE username = %s OR email = %s", (username, email))
        if cursor.fetchone():
            return jsonify({"error": "Username or email already exists"}), 400

        # Insert new user into database
        cursor.execute(
            "INSERT INTO users (username, password_hash, email) VALUES (%s, %s, %s)",
            (username, hashed_password, email)
        )
        connection.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Login an existing user and generate JWT token
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Missing required fields"}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        cursor.execute("SELECT user_id, password_hash FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user or not bcrypt.checkpw(password.encode("utf-8"), user[1].encode("utf-8")):
            return jsonify({"error": "Invalid username or password"}), 401

        # Generate JWT token
        access_token = create_access_token(identity={"user_id": user[0], "username": username})
        return jsonify({"access_token": access_token}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# A protected route that requires JWT token
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    try:
        current_user = get_jwt_identity()
        return jsonify({"message": f"Hello, {current_user['username']}!"}), 200
    except:
        return jsonify({"error": "Invalid token"}), 401
    

def get_db_connection():
    return mysql.connector.connect(
        host="db",  # Docker service name for the database
        user="devuser",
        password="devpass",
        database="qsdb"
    )


@app.route("/victory", methods=["POST"])
@jwt_required()  # Protect the route
def victory():
    try:
        # Get the username from the JWT token
        whatUser = get_jwt_identity()  # This fetches the identity stored in the token during login
        username = whatUser['username']
        # Get the JSON payload from the request
        data = request.json
        
        # Extract values from the payload
        grid_state = data.get("gridState")  # Value from local storage
        stopwatch_time = data.get("stopwatchTime")  # Value from local storage
        saved_code = data.get("savedCode")  # Value from local storage

        # Update the user's record in the database
        query = """
            UPDATE users
            SET curtimer = %s, curgrid = %s, curcode = %s
            WHERE username = %s
        """
        values = (stopwatch_time, grid_state, saved_code, username)

        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(query, values)
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({"message": "User state updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/delete_user", methods=["POST"])
def delete_user():
    try:
        # Get the JSON payload from the request
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required."}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        cursor.execute("SELECT user_id, password_hash FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user or not bcrypt.checkpw(password.encode("utf-8"), user[1].encode("utf-8")):
            return jsonify({"error": "Invalid username or password"}), 401



        # Delete the user and their associated data
        cursor.execute("DELETE FROM users WHERE username = %s", (username,))
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({"message": "User and their data have been deleted successfully."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Example route to get user data
@app.route("/get_user_data", methods=["GET"])
@jwt_required()  # Protect the route with JWT token
def get_user_data():
    try:
        # Get the username from the JWT token
        whatuse = get_jwt_identity()  # This fetches the identity stored in the token during login
        username = whatuse['username']
        # Here you would fetch the user data from the database using the username
        connection = get_db_connection()  # Ensure you have a function to get the DB connection
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if user is None:
            return jsonify({"time": "domb"})  # Return None if no user data is found
        else:
            # Return user data (for example, return user details excluding password)
            user_data = {
                "username": user[1],
                "time": user[7],
                "grid": user[8],
                "code": user[9],
            }
            return jsonify({"time": user_data["time"], "grid": user_data["grid"], "code": user_data["code"]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




#ALL PATHS MUST BE ABOVE THIS CODE!
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

