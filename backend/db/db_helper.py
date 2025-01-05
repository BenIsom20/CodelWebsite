import mysql.connector
from datetime import datetime

# Database connection parameters
db_config = {
    'host': 'db',  # Or the name of your DB container if using Docker
    'user': 'devuser',  # The user you set in docker-compose.yml
    'password': 'devpass',  # The password you set in docker-compose.yml
    'database': 'qsdb'  # Your database name
}

def get_challenge_by_id(challenge_id):
    """Fetch a specific challenge by its ID from the database."""
    connection = None  # Initialize connection to None
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Query to fetch the challenge by ID
        cursor.execute("SELECT challenge_id, name, prompt, date FROM challenges WHERE challenge_id = %s", (challenge_id,))
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_challenge_cases_by_id(challenge_id):
    """Fetch the test cases for a specific challenge by its ID from the database."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_function_skeleton_by_id(challenge_id):
    """Fetch the function skeleton for a specific challenge by its ID from the database."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_challenge_by_date():
    """Fetch a challenge that matches today's date."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_challenge_cases_by_date():
    """Fetch challenge cases for today's challenge."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_function_skeleton_by_date():
    """Fetch the function skeleton for today's challenge."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_challenge_by_date():
    """Fetch a challenge that matches today's date."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_challenge_cases_by_date():
    """Fetch challenge cases for today's challenge."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_function_skeleton_by_date():
    """Fetch the function skeleton for today's challenge."""
    connection = None
    try:
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
        if connection and connection.is_connected():
            cursor.close()
            connection.close()