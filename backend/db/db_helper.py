import mysql.connector
import os
from datetime import datetime

db_host = os.getenv('MYSQL_HOST')
db_user = os.getenv('MYSQL_USER')
db_password = os.getenv('MYSQL_PASSWORD')
db_database = os.getenv('MYSQL_DATABASE')


db_config = {
    'host': db_host, 
    'user': db_user, 
    'password': db_password,
    'database': db_database #database name
}

def get_challenge_by_id(challenge_id):
    connection = None
    try:
        # Connects to the database and queries for a challenge by ID.
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("SELECT challenge_id, name, prompt, date FROM challenges WHERE challenge_id = %s", (challenge_id,))
        challenge = cursor.fetchone()

        # Returns the challenge details if found; otherwise, returns None.
        if challenge:
            return {
                "challenge_id": challenge[0],
                "name": challenge[1],
                "prompt": challenge[2],
                "date": challenge[3]
            }
        else:
            return None

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

    finally:
        # Ensures database connection is properly closed.
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Retrieves all test cases associated with a specific challenge ID from the database.
def get_challenge_cases_by_id(challenge_id):
    connection = None
    try:
        # Connects to the database and queries for test cases by challenge ID.
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT challenge_case_id, challenge_id, prompt, given_data, expected 
            FROM challenge_cases 
            WHERE challenge_id = %s
            """,
            (challenge_id,)
        )

        # Returns a list of dictionaries containing test case details.
        challenge_cases = cursor.fetchall()
        return [
            {
                "challenge_case_id": case[0],
                "challenge_id": case[1],
                "prompt": case[2],
                "given_data": case[3],
                "expected": case[4]
            }
            for case in challenge_cases
        ]

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return []

    finally:
        # Ensures database connection is properly closed.
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Retrieves the function skeleton for a specific challenge ID from the database.
def get_function_skeleton_by_id(challenge_id):
    connection = None
    try:
        # Connects to the database and queries for a function skeleton by challenge ID.
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT function_skeleton_id, challenge_id, name, parameters, skeleton 
            FROM function_skeletons 
            WHERE challenge_id = %s
            """,
            (challenge_id,)
        )

        # Returns the function skeleton details if found; otherwise, returns None.
        skeleton = cursor.fetchone()
        if skeleton:
            return {
                "function_skeleton_id": skeleton[0],
                "challenge_id": skeleton[1],
                "name": skeleton[2],
                "parameters": skeleton[3],
                "skeleton": skeleton[4]
            }
        else:
            return None

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

    finally:
        # Ensures database connection is properly closed.
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Retrieves a challenge that matches today's date from the database.
def get_challenge_by_date():
    connection = None
    try:
        # Connects to the database and queries for a challenge by today's date.
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        today_date = datetime.now().date()
        cursor.execute(
            """
            SELECT challenge_id, name, prompt, date 
            FROM challenges 
            WHERE DATE(date) = %s
            """,
            (today_date,)
        )

        # Returns the challenge details if found; otherwise, returns None.
        challenge = cursor.fetchone()
        if challenge:
            return {
                "challenge_id": challenge[0],
                "name": challenge[1],
                "prompt": challenge[2],
                "date": challenge[3]
            }
        else:
            return None

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

    finally:
        # Ensures database connection is properly closed.
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Retrieves test cases for today's challenge from the database.
def get_challenge_cases_by_date():
    connection = None
    try:
        # Connects to the database and queries for test cases associated with today's challenge.
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        today_date = datetime.now().date()
        cursor.execute(
            """
            SELECT challenge_case_id, challenge_id, prompt, given_data, expected 
            FROM challenge_cases 
            WHERE challenge_id IN (
                SELECT challenge_id FROM challenges WHERE DATE(date) = %s
            )
            """,
            (today_date,)
        )

        # Returns a list of dictionaries containing test case details.
        challenge_cases = cursor.fetchall()
        return [
            {
                "challenge_case_id": case[0],
                "challenge_id": case[1],
                "prompt": case[2],
                "given_data": case[3],
                "expected": case[4]
            }
            for case in challenge_cases
        ]

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return []

    finally:
        # Ensures database connection is properly closed.
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Retrieves the function skeleton for today's challenge from the database.
def get_function_skeleton_by_date():
    connection = None
    try:
        # Connects to the database and queries for a function skeleton associated with today's challenge.
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        today_date = datetime.now().date()
        cursor.execute(
            """
            SELECT function_skeleton_id, challenge_id, name, parameters, skeleton 
            FROM function_skeletons 
            WHERE challenge_id IN (
                SELECT challenge_id FROM challenges WHERE DATE(date) = %s
            )
            """,
            (today_date,)
        )

        # Returns the function skeleton details if found; otherwise, returns None.
        skeleton = cursor.fetchone()
        if skeleton:
            return {
                "function_skeleton_id": skeleton[0],
                "challenge_id": skeleton[1],
                "name": skeleton[2],
                "parameters": skeleton[3],
                "skeleton": skeleton[4]
            }
        else:
            return None

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

    finally:
        # Ensures database connection is properly closed.
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Function that gets the challenge cases by date
def get_challenge_cases_by_date():
    """Fetch challenge cases for today's challenge."""
    connection = None  # Initialize the connection as None
    try:
        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Get today's date
        today_date = datetime.now().date()

        # Query to fetch challenge cases for today's challenge
        cursor.execute(
            """
            SELECT challenge_case_id, challenge_id, prompt, given_data, expected 
            FROM challenge_cases 
            WHERE challenge_id IN (
                SELECT challenge_id FROM challenges WHERE DATE(date) = %s
            )
            """,
            (today_date,)
        )

        # Fetch all matching challenge cases
        challenge_cases = cursor.fetchall()

        # Return the challenge cases as a list of dictionaries
        return [
            {
                "challenge_case_id": case[0],
                "challenge_id": case[1],
                "prompt": case[2],
                "given_data": case[3],
                "expected": case[4]
            }
            for case in challenge_cases
        ]

    except mysql.connector.Error as err:
        # Handle any database errors
        print(f"Error: {err}")
        return []

    finally:
        # Ensure the connection is closed properly
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Function that retrieves the function skeleton by date
def get_function_skeleton_by_date():
    """Fetch the function skeleton for today's challenge."""
    connection = None  # Initialize the connection as None
    try:
        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Get today's date
        today_date = datetime.now().date()

        # Query to fetch the function skeleton for today's challenge
        cursor.execute(
            """
            SELECT function_skeleton_id, challenge_id, name, parameters, skeleton 
            FROM function_skeletons 
            WHERE challenge_id IN (
                SELECT challenge_id FROM challenges WHERE DATE(date) = %s
            )
            """,
            (today_date,)
        )

        # Fetch the first matching skeleton
        skeleton = cursor.fetchone()

        # Return the skeleton data as a dictionary if found
        if skeleton:
            return {
                "function_skeleton_id": skeleton[0],
                "challenge_id": skeleton[1],
                "name": skeleton[2],
                "parameters": skeleton[3],
                "skeleton": skeleton[4]
            }
        else:
            return None

    except mysql.connector.Error as err:
        # Handle any database errors
        print(f"Error: {err}")
        return None

    finally:
        # Ensure the connection is closed properly
        if connection and connection.is_connected():
            cursor.close()
            connection.close()