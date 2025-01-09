import mysql.connector
import os

# Function to remove a challenge from the database
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

    # Check if the challenge exists in the database
    cursor.execute(""" 
        SELECT * FROM challenges WHERE challenge_id = %s
    """, (challenge_id,))
    existing_challenge = cursor.fetchone()

    if not existing_challenge:
        print(f"Error: Challenge with ID '{challenge_id}' does not exist in the database.")
        cursor.close()
        conn.close()
        return

    # Print the challenge ID and name for confirmation
    print(f"Removing Challenge {existing_challenge[0]}: {existing_challenge[1]}")

    # Remove related data from the function_skeletons table
    cursor.execute(""" 
        DELETE FROM function_skeletons WHERE challenge_id = %s
    """, (challenge_id,))

    # Remove related data from the challenge_cases table
    cursor.execute(""" 
        DELETE FROM challenge_cases WHERE challenge_id = %s
    """, (challenge_id,))

    # Remove the challenge from the challenges table
    cursor.execute(""" 
        DELETE FROM challenges WHERE challenge_id = %s
    """, (challenge_id,))

    # Commit changes and close connection
    conn.commit()
    cursor.close()
    conn.close()

    print(f"Challenge with ID '{challenge_id}' and its related data have been removed successfully.")

# Function to list available challenges in the database
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

    # Get a list of all challenge IDs and names
    cursor.execute(""" 
        SELECT challenge_id, name FROM challenges
    """)
    challenges = cursor.fetchall()

    cursor.close()
    conn.close()

    # Display challenges with challenge_id and name
    for challenge in challenges:
        print(f"{challenge[0]}. {challenge[1]}")

    return challenges

# Function to remove all challenges from the database
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

    # Get a list of all challenge IDs to remove
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

    # Iterate over all challenge_ids and remove them
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

    # Commit changes and close connection
    conn.commit()
    cursor.close()
    conn.close()

    print("All challenges and their related data have been removed successfully.")

# Main function to run the script
def main():
    # Ask user for action
    print("Choose an action:")
    print("1. Remove a single challenge")
    print("2. Remove all challenges")

    action = input("Please enter the number corresponding to your choice: ")

    if action == "1":
        # List available challenges in the database
        available_challenges = list_challenges()

        if not available_challenges:
            print("No challenges found in the database.")
            return

        # Prompt user for the challenge_id to remove
        challenge_id = input("Please enter the challenge ID of the challenge to remove: ")

        # Check if the challenge_id is valid
        try:
            challenge_id = int(challenge_id)
        except ValueError:
            print(f"Error: '{challenge_id}' is not a valid challenge ID.")
            return

        # Remove the challenge from the database
        remove_challenge(challenge_id)

    elif action == "2":
        # Remove all challenges from the database
        remove_all()

    else:
        print("Invalid choice. Please enter 1 or 2.")

if __name__ == "__main__":
    main()
