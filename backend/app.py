from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import subprocess
from db.db_helper import get_challenge_by_id, get_challenge_cases_by_id, get_function_skeleton_by_id, get_challenge_by_date, get_challenge_cases_by_date, get_function_skeleton_by_date
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
import mysql.connector
import json
import io
import os
import logging
import sys
from flask_apscheduler import APScheduler
from datetime import datetime, timedelta
from pytz import timezone
from better_profanity import profanity
from collections.abc import Iterable
from secretload import get_secret

get_secret('database_secrets')
get_secret('jwt_key')

db_host = os.getenv('db_host')
db_user = os.getenv('db_username')
db_password = os.getenv('db_password')
db_database = os.getenv('db_name')
jwt_secret_key = os.getenv('jwt_key')

app = Flask(__name__, template_folder='/app/frontend/templates', static_folder='/app/frontend/static')
# Enable CORS for all routes
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/how')
def how():
    return render_template('How.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

# Setup logging configuration
logging.basicConfig(level=logging.DEBUG)

app.config["JWT_SECRET_KEY"] = jwt_secret_key
jwt = JWTManager(app)


db_config = {
    'host': db_host, 
    'user': db_user, 
    'password': db_password,
    'database': db_database #database name
}

# Global variable for storing the current challenge
current_challenge_id = 0
current_challenge = {}
current_challenge_cases = []
current_challenge_function_skeleton = {}

def set_current_challenge_by_id(challenge_id):
    """Fetch the challenge from the database and set it to the global variable."""
    global current_challenge
    current_challenge = get_challenge_by_id(challenge_id)

def set_current_challenge_cases_by_id(challenge_id):
    """Fetch the challenge cases from the database and set them to the global variable."""
    global current_challenge_cases
    current_challenge_cases = get_challenge_cases_by_id(challenge_id)

def set_current_challenge_function_skeleton_by_id(challenge_id):
    """Fetch the function skeleton from the database and set it to the global variable."""
    global current_challenge_function_skeleton
    current_challenge_function_skeleton = get_function_skeleton_by_id(challenge_id)

def set_current_challenge_by_date():
    """Fetch the challenge from the database and set it to the global variable."""
    global current_challenge
    current_challenge = get_challenge_by_date()

def set_current_challenge_cases_by_date():
    """Fetch the challenge cases from the database and set them to the global variable."""
    global current_challenge_cases
    current_challenge_cases = get_challenge_cases_by_date()

def set_current_challenge_function_skeleton_by_date():
    """Fetch the function skeleton from the database and set it to the global variable."""
    global current_challenge_function_skeleton
    current_challenge_function_skeleton = get_function_skeleton_by_date()

def get_chicago_midnight():
    # Define the Chicago time zone
    chicago_tz = timezone('America/Chicago')

    # Get the current time in the Chicago time zone
    now = datetime.now(chicago_tz)

    # Calculate midnight in Chicago (next day)
    midnight = datetime(now.year, now.month, now.day) + timedelta(days=1)

    # Convert Chicago midnight to UTC
    utc_midnight = midnight.astimezone(timezone('UTC'))

    return utc_midnight.isoformat()  # Return as an ISO string

# Configuration for APScheduler
class Config:
    SCHEDULER_API_ENABLED = True  # Enables the scheduler's API for job management

app.config.from_object(Config)
scheduler = APScheduler()
scheduler.init_app(app)

# Define a scheduled job with a timezone
@scheduler.task("cron", id="midnight_job", hour=0, minute=0, timezone=timezone("America/Chicago"))
def midnight_job():
    """Scheduled job to reset the daily challenge and clear user progress."""
    try:
        # Reset the current challenge, cases, and function skeleton
        set_current_challenge_by_date()
        set_current_challenge_cases_by_date()
        set_current_challenge_function_skeleton_by_date()

        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Clear all users' curtimer, curgrid, curcode, and attempts (this resets for all users)
        query_reset_progress = """
            UPDATE users
            SET curtimer = 0, curgrid = NULL, curcode = NULL, attempts = 0;
        """
        cursor.execute(query_reset_progress)

        # Reset streak to zero only for users where completed is false or zero
        query_reset_streak = """
            UPDATE users
            SET streak = 0
            WHERE completed = 0
        """
        cursor.execute(query_reset_streak)

        query_reset_completed = """
            UPDATE users
            SET completed = 0;
        """
        cursor.execute(query_reset_completed)

        connection.commit()

        cursor.close()
        connection.close()

        logging.info("Midnight job ran successfully: User progress cleared and challenge updated, streak reset for incomplete users.")

    except Exception as e:
        logging.error(f"Error during midnight job: {e}")

# Start the scheduler
scheduler.start()

@app.route('/get_chicago_midnight', methods=['GET'])
def get_chicago_midnight_api():
    midnight_utc = get_chicago_midnight()
    return jsonify({"chicago_midnight_utc": midnight_utc})

@app.route("/run", methods=["POST"])
def execute_code():
    try:
        # Get the code from the request
        data = request.json
        code = data.get("code", "")
        code = code.replace("\t", "    ")

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
    """Route to test the user's code against predefined test cases."""
    try:
        data = request.json
        code = data.get("code", "")

        function_name = current_challenge_function_skeleton['name']
        results = {}
        given_values = []

        for case in current_challenge_cases:
            given_data = case['given_data']
            given_values.append(given_data)
            expected = case['expected']

            # Prepare the code to execute
            code_call = f"{function_name}({given_data})"
            full_code = f"""
{code}

result = {code_call}
"""
            captured_output = io.StringIO()
            sys.stdout = captured_output

            try:
                full_code = full_code.replace("\t", "    ")
                exec(full_code)

                actual_output = locals().get("result", None)

                # Parse expected and actual values for logical comparison
                parsed_expected = json.loads(expected)
                parsed_actual = json.loads(json.dumps(actual_output))

                # Comparison function to handle different types of values
                def compare_values(expected, actual):
                    if isinstance(actual, Iterable) and not isinstance(actual, str):
                        # Compare iterables (lists, tuples, dicts)
                        return sorted(expected) == sorted(actual)
                    else:
                        # Direct comparison for non-iterables
                        return expected == actual

                # Perform comparison
                if compare_values(parsed_expected, parsed_actual):
                    results[case['challenge_case_id']] = "Success"
                else:
                    results[case['challenge_case_id']] = (
                        f"Failure: Expected {parsed_expected}, got {parsed_actual}"
                    )

            except Exception as e:
                # Error message should provide more specific feedback on the user's code
                results[case['challenge_case_id']] = f"Error: {str(e)}"
            finally:
                sys.stdout = sys.__stdout__

        return jsonify({
            "numTests": len(results),
            "testList": results,
            "givenValues": given_values
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/Startup", methods=["GET"])
def Startup():
    # Set the current challenge
    set_current_challenge_by_date()
    set_current_challenge_cases_by_date()
    set_current_challenge_function_skeleton_by_date()
   
    # Explanation for the test
    tests = {
        **{
            f"Case {i + 1}": 
            f"Case {i + 1}: {case['prompt']} ({case['given_data']} -> {case['expected']})"
            for i, case in enumerate(current_challenge_cases)
        }
    }

    explanation = ""
    for value in tests.values():
        explanation += value + "<br>" 
    # Add the value to the total

    return jsonify({
        "prompt": current_challenge["prompt"],
        "Cases": tests,
        "Array": len(tests),
    })

@app.route('/get_skeleton', methods=['GET'])
def get_skeleton():
    skeleton = current_challenge_function_skeleton
    skel = skeleton["skeleton"]
    if skeleton:
        return jsonify({"skeleton": skel}), 200  # Ensure 'skeleton' key
    else:
        return jsonify({"error": "Skeleton not found"}), 404

@app.route("/register", methods=["POST"])
def register():
    try:
        # Extract data from the JSON payload in the request
        data = request.json
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        # Ensure all required fields are provided
        if not username or not password or not email:
            return jsonify({"error": "Missing required fields"}), 400

        profanity.load_censor_words()  # Load default list of profane words
        if profanity.contains_profanity(username):
            return jsonify({"error": "Profanity detected in username"}), 400

        # Hash the password securely
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Check if the username or email already exists in the database
        cursor.execute("SELECT user_id FROM users WHERE username = %s OR email = %s", (username, email))
        if cursor.fetchone():
            return jsonify({"error": "Username or email already exists"}), 400

        # Insert the new user into the database
        cursor.execute(
            "INSERT INTO users (username, password_hash, email) VALUES (%s, %s, %s)",
            (username, hashed_password, email)
        )
        connection.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except mysql.connector.Error as err:
        # Handle any database errors
        return jsonify({"error": "Username or Email already in use"}), 500
    finally:
        # Ensure the database connection is closed
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

# Login an existing user and generate a JWT token
@app.route("/login", methods=["POST"])
def login():
    try:
        # Extract data from the JSON payload in the request
        data = request.json
        username = data.get("username")
        password = data.get("password")

        # Ensure both username and password are provided
        if not username or not password:
            return jsonify({"error": "Missing required fields"}), 400

        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Retrieve the user from the database
        cursor.execute("SELECT user_id, password_hash FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        # Verify the provided password against the stored hash
        if not user or not bcrypt.checkpw(password.encode("utf-8"), user[1].encode("utf-8")):
            return jsonify({"error": "Invalid username or password"}), 401

        # Generate a JWT token for the authenticated user
        access_token = create_access_token(identity={"user_id": user[0], "username": username})
        return jsonify({"access_token": access_token}), 200

    except mysql.connector.Error as err:
        # Handle any database errors
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        # Ensure the database connection is closed
        if connection.is_connected():
            cursor.close()
            connection.close()

# A protected route that requires a valid JWT token
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    try:
        # Get the current user's identity from the JWT token
        current_user = get_jwt_identity()
        return jsonify({"username": current_user['username']}), 200
    except:
        # Handle invalid or missing tokens
        return jsonify({"error": "Invalid token"}), 401

# Helper function to get a database connection
def get_db_connection():
    return mysql.connector.connect(
        host="db",  # Docker service name for the database
        user="devuser",
        password="devpass",
        database="qsdb"
    )

# Update the user's state after a victory
@app.route("/victory", methods=["POST"])
@jwt_required()  # Protect the route
def victory():
    try:
        # Get the username from the JWT token
        whatUser = get_jwt_identity()
        username = whatUser['username']

        # Extract data from the JSON payload in the request
        data = request.json
        grid_state = data.get("gridState")
        stopwatch_time = data.get("stopwatchTime")
        saved_code = data.get("savedCode")
        attempts = data.get("attempts")

        # Update the user's record in the database
        query = """
            UPDATE users
            SET 
                wins = wins + 1, 
                streak = streak + 1, 
                completed = 1, 
                curtimer = %s, 
                curgrid = %s, 
                curcode = %s, 
                attempts = %s,
                totalTime = totalTime + %s,
                allStreak = CASE 
                                WHEN streak > allStreak THEN streak
                                ELSE allStreak
                            END
            WHERE username = %s
        """
        values = (stopwatch_time, grid_state, saved_code, attempts, stopwatch_time, username)

        # Execute the query
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(query, values)
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({"message": "User state updated successfully"}), 200
    except Exception as e:
        # Handle any exceptions that occur
        return jsonify({"error": str(e)}), 500

# Update the user's state after a victory
@app.route("/saveProgress", methods=["POST"])
@jwt_required()  # Protect the route
def saveProgress():
    try:
        # Get the username from the JWT token
        whatUser = get_jwt_identity()
        username = whatUser['username']

        # Extract data from the JSON payload in the request
        data = request.json
        grid_state = data.get("gridState")
        stopwatch_time = data.get("stopwatchTime")
        saved_code = data.get("savedCode")
        attempts = data.get("attempts")

        # Update the user's record in the database
        query = """
            UPDATE users
            SET curtimer = %s, curgrid = %s, curcode = %s, attempts = %s
            WHERE username = %s
        """
        values = (stopwatch_time, grid_state, saved_code, attempts, username)

        # Execute the query
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(query, values)
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({"message": "User state updated successfully"}), 200
    except Exception as e:
        # Handle any exceptions that occur
        return jsonify({"error": str(e)}), 500

# Delete a user and their associated data
@app.route("/delete_user", methods=["POST"])
def delete_user():
    try:
        # Extract data from the JSON payload in the request
        data = request.json
        username = data.get('username')
        password = data.get('password')

        # Ensure both username and password are provided
        if not username or not password:
            return jsonify({"error": "Username and password are required."}), 400

        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Verify the user's credentials
        cursor.execute("SELECT user_id, password_hash FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user or not bcrypt.checkpw(password.encode("utf-8"), user[1].encode("utf-8")):
            return jsonify({"error": "Invalid username or password"}), 401

        # Delete the user from the database
        cursor.execute("DELETE FROM users WHERE username = %s", (username,))
        connection.commit()

        cursor.close()
        connection.close()

        return jsonify({"message": "User and their data have been deleted successfully."}), 200

    except Exception as e:
        # Handle any exceptions that occur
        return jsonify({"error": str(e)}), 500

# Retrieve user data from the database
@app.route("/get_user_data", methods=["GET"])
@jwt_required()  # Protect the route with JWT token
def get_user_data():
    try:
        # Get the username from the JWT token
        whatuse = get_jwt_identity()
        username = whatuse['username']

        # Fetch the user's data from the database
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if user is None:
            # Return a default response if no data is found
            return jsonify({"time": "domb"})
        else:
            # Format the user's data into a JSON response
            user_data = {
                "username": user[1],
                "time": user[7],
                "grid": user[8],
                "code": user[9],
                "completed": user[11],
            }
            return jsonify({"time": user_data["time"], "grid": user_data["grid"], "code": user_data["code"], "completed": user_data["completed"]}), 200

    except Exception as e:
        # Handle any exceptions that occur
        return jsonify({"error": str(e)}), 500

@app.route("/getLeaderboard", methods=["GET"])
def getLeaderboard():
    try:
        # Get the offset and limit from query parameters (default values if not provided)
        offset = int(request.args.get("offset", 0))  # Default offset is 0
        limit = int(request.args.get("limit", 10))  # Default limit is 10

        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Query with LIMIT and OFFSET for pagination
        query = """
            SELECT username, attempts, curtimer, streak, wins
            FROM users
            WHERE attempts > 0 AND curtimer > 0 AND completed = 1
            ORDER BY attempts ASC, curtimer ASC
            LIMIT %s OFFSET %s;
        """
        cursor.execute(query, (limit, offset))
        results = cursor.fetchall()

        # Format the results into a JSON response
        leaderboard = [{"username": row[0], "attempts": row[1], "time": row[2], "streak": row[3], "wins": row[4]} for row in results]

        # Close the cursor and connection
        cursor.close()
        connection.close()

        # Return the leaderboard data
        return jsonify({"leaderboard": leaderboard}), 200

    except Exception as e:
        # Handle any exceptions that occur
        return jsonify({"error": str(e)}), 500


# Retrieve user data from the database
@app.route("/stats", methods=["GET"])
@jwt_required()  # Protect the route with JWT token
def stats():
    try:
        # Get the username from the JWT token
        whatuse = get_jwt_identity()
        username = whatuse['username']

        # Fetch the user's data from the database
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        cursor.close()
        connection.close()

        if user is None:
            # Return a default response if no data is found
            return jsonify({"stats": "none"})
        else:
            # Format the user's data into a JSON response
            user_data = {
                "username": user[1],
                "created": user[4],
                "streak": user[5],
                "wins": user[6],
                "allTime": user[12],
                "allStreak": user[13],
            }
            return jsonify({"stats": user_data}), 200

    except Exception as e:
        # Handle any exceptions that occur
        return jsonify({"error": str(e)}), 500


#ALL PATHS MUST BE ABOVE THIS CODE!
if __name__ == "__main__":
    # Fetch the port from the environment, with a default value if not set
    port = int(os.environ.get('PORT', 5000))  # Default port 5000
    app.run(debug=True, host="0.0.0.0", port=port)

