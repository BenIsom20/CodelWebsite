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
        cursor.execute("SELECT challenge_id, name, prompt FROM challenges WHERE challenge_id = %s", (challenge_id,))
        challenge = cursor.fetchone()  # Fetch a single record

        if challenge:
            # Return the challenge as a dictionary
            return {
                "challenge_id": challenge[0],
                "name": challenge[1],
                "prompt": challenge[2]
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
