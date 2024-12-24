import mysql.connector

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
        # Establish connection to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Query to fetch the challenge by ID
        cursor.execute("SELECT challenge_id, name, prompt, date FROM challenges WHERE challenge_id = %s", (challenge_id,))
        challenge = cursor.fetchone()  # Fetch a single record

        if challenge:
            # Return the challenge as a dictionary
            return {
                "challenge_id": challenge[0],
                "name": challenge[1],
                "prompt": challenge[2],
                "date": challenge[3]
            }
        else:
            return None  # If no challenge is found
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

    finally:
        # Safely close the connection if it was successfully established
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            
def get_challenge_cases_by_id(challenge_id):
    """Fetch the test cases for a specific challenge by its ID from the database."""
    connection = None  # Initialize connection to None
    try:
        # Establish connection to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Query to fetch the challenge cases by challenge ID
        cursor.execute(
            """
            SELECT challenge_case_id, challenge_id, prompt, given_data, expected 
            FROM challenge_cases 
            WHERE challenge_id = %s
            """,
            (challenge_id,)
        )

        # Fetch all records
        challenge_cases = cursor.fetchall()

        # Transform each record into a dictionary and return as a list
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
        # Safely close the connection if it was successfully established
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_function_skeleton_by_id(challenge_id):
    """Fetch the function skeleton for a specific challenge by its ID from the database."""
    connection = None  # Initialize connection to None
    try:
        # Establish connection to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Query to fetch the function skeleton by challenge ID
        cursor.execute(
            """
            SELECT function_skeleton_id, challenge_id, name, parameters, skeleton 
            FROM function_skeletons 
            WHERE challenge_id = %s
            """,
            (challenge_id,)
        )

        # Fetch the first record (assuming only one skeleton per challenge)
        skeleton = cursor.fetchone()

        # Return the record as a dictionary if it exists, otherwise return None
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
        # Safely close the connection if it was successfully established
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
