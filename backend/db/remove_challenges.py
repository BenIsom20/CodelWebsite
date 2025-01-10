import mysql.connector
import os

# Removes a specific challenge and its associated data from the database.
def remove_challenge(challenge_id):
    # Database connection
    db_host = os.getenv('MYSQL_HOST')
    db_user = os.getenv('MYSQL_USER')
    db_password = os.getenv('MYSQL_PASSWORD')
    db_database = os.getenv('MYSQL_DATABASE')


    # Create a connection to the MySQL database
    conn = mysql.connector.connect(
        host=db_host, 
        user=db_user, 
        password=db_password,
        database=db_database  # Use actual database name
    )
    
    cursor = conn.cursor()

    # Searches for corresponding challenge
    cursor.execute(""" 
        SELECT * FROM challenges WHERE challenge_id = %s
    """, (challenge_id,))
    existing_challenge = cursor.fetchone()

    if not existing_challenge:
        print(f"Error: Challenge with ID '{challenge_id}' does not exist in the database.")
        cursor.close()
        conn.close()
        return

    print(f"Removing Challenge {existing_challenge[0]}: {existing_challenge[1]}")

    # Executes removing specific challenge
    cursor.execute(""" 
        DELETE FROM function_skeletons WHERE challenge_id = %s
    """, (challenge_id,))

    cursor.execute(""" 
        DELETE FROM challenge_cases WHERE challenge_id = %s
    """, (challenge_id,))

    cursor.execute(""" 
        DELETE FROM challenges WHERE challenge_id = %s
    """, (challenge_id,))

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Challenge with ID '{challenge_id}' and its related data have been removed successfully.")

# Lists all challenges in the database with their IDs and names.
def list_challenges():
    # Database connection
    db_host = os.getenv('MYSQL_HOST')
    db_user = os.getenv('MYSQL_USER')
    db_password = os.getenv('MYSQL_PASSWORD')
    db_database = os.getenv('MYSQL_DATABASE')

    # Create a connection to the MySQL database
    conn = mysql.connector.connect(
        host=db_host, 
        user=db_user, 
        password=db_password,
        database=db_database  # Use actual database name
    )
    
    cursor = conn.cursor()

    # Fetches all challenges and returns all
    cursor.execute(""" 
        SELECT challenge_id, name FROM challenges
    """)
    challenges = cursor.fetchall()

    cursor.close()
    conn.close()

    for challenge in challenges:
        print(f"{challenge[0]}. {challenge[1]}")

    return challenges

# Removes all challenges and their associated data from the database.
def remove_all():
    # Database connection
    db_host = os.getenv('MYSQL_HOST')
    db_user = os.getenv('MYSQL_USER')
    db_password = os.getenv('MYSQL_PASSWORD')
    db_database = os.getenv('MYSQL_DATABASE')

    # Create a connection to the MySQL database
    conn = mysql.connector.connect(
        host=db_host, 
        user=db_user, 
        password=db_password,
        database=db_database  # Use actual database name
    )
    
    cursor = conn.cursor()

    # Fetches all challenges from databse
    cursor.execute(""" 
        SELECT challenge_id FROM challenges
    """)
    challenge_ids = cursor.fetchall()

    if not challenge_ids:
        print("No challenges found in the database.")
        cursor.close()
        conn.close()
        return

    print("Removing all challenges and their related data...")

    # Deletes all challenges
    for challenge_id in challenge_ids:
        cursor.execute(""" 
            DELETE FROM function_skeletons WHERE challenge_id = %s
        """, (challenge_id[0],))

        cursor.execute(""" 
            DELETE FROM challenge_cases WHERE challenge_id = %s
        """, (challenge_id[0],))

        cursor.execute(""" 
            DELETE FROM challenges WHERE challenge_id = %s
        """, (challenge_id[0],))

    conn.commit()
    cursor.close()
    conn.close()

    print("All challenges and their related data have been removed successfully.")

# Handles user input to perform actions related to challenges in the database.
def main():
    print("Choose an action:")
    print("1. Remove a single challenge")
    print("2. Remove all challenges")

    action = input("Please enter the number corresponding to your choice: ")

    if action == "1":
        available_challenges = list_challenges()

        if not available_challenges:
            print("No challenges found in the database.")
            return

        challenge_id = input("Please enter the challenge ID of the challenge to remove: ")

        try:
            challenge_id = int(challenge_id)
        except ValueError:
            print(f"Error: '{challenge_id}' is not a valid challenge ID.")
            return

        remove_challenge(challenge_id)

    elif action == "2":
        remove_all()

    else:
        print("Invalid choice. Please enter 1 or 2.")

if __name__ == "__main__":
    main()
