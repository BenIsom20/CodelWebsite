import yaml
import mysql.connector
import os
from datetime import datetime

# Function to load challenge data from YAML
def load_challenge_data(yaml_file):
    with open(yaml_file, 'r') as file:
        return yaml.safe_load(file)

# Function to generate the function skeleton based on name, parameters, and cases
def generate_function_skeleton(function_name, parameters, cases):
    param_str = ', '.join(parameters)  # Join parameters with commas for the function signature
    
    # Create a string for each case in the format: Case 1: description
    case_str = "\n".join([f"# Case {i+1}: {case['prompt']} ({case['given_data']} -> {case['expected']})"
                         for i, case in enumerate(cases)])

    # Function skeleton template with added cases
    skeleton = f"# CODE HERE\n{case_str}\ndef {function_name}({param_str}):\n    pass"
    return skeleton


# Function to insert data into the database
def insert_challenge_data(challenge_data):
    
    # Get ENVs for database configuration
    db_host = os.getenv('MYSQL_HOST')
    db_user = os.getenv('MYSQL_USER')
    db_password = os.getenv('MYSQL_PASSWORD')
    db_database = os.getenv('MYSQL_DATABASE')

    # Create configuration dictionary for database connections
    conn = {
        'host': db_host, 
        'user': db_user, 
        'password': db_password,
        'database': db_database #database name
    }
    
    cursor = conn.cursor()

    # Insert challenge data
    challenge = challenge_data['challenge']
    
    # Parse the date from the YAML file and convert it to the correct format (YYYY-MM-DD)
    challenge_date = datetime.strptime(challenge['date'], "%Y-%m-%d").date()

    cursor.execute(""" 
        SELECT * FROM challenges WHERE name = %s
    """, (challenge['name'],))
    existing_challenge = cursor.fetchone()

    if existing_challenge:
        print(f"Error: Challenge '{challenge['name']}' already exists in the database.")
        cursor.close()
        conn.close()
        return

    cursor.execute(""" 
        INSERT INTO challenges (name, prompt, date)
        VALUES (%s, %s, %s)
    """, (challenge['name'], challenge['prompt'], challenge_date))
    challenge_id = cursor.lastrowid

    # Insert challenge cases data
    for case in challenge['cases']:
        cursor.execute(""" 
            INSERT INTO challenge_cases (challenge_id, prompt, given_data, expected)
            VALUES (%s, %s, %s, %s)
        """, (challenge_id, case['prompt'], case['given_data'], case['expected']))

    # Generate function skeleton and insert it into function_skeletons table
    function_name = challenge['function']['name']
    parameters = challenge['function']['parameters']
    cases = challenge['cases']  # Pass cases to the skeleton generator
    skeleton = generate_function_skeleton(function_name, parameters, cases)

    cursor.execute(""" 
        INSERT INTO function_skeletons (challenge_id, name, parameters, skeleton)
        VALUES (%s, %s, %s, %s)
    """, (challenge_id, function_name, ', '.join(parameters), skeleton))

    # Commit changes and close connection
    conn.commit()
    cursor.close()
    conn.close()

# Function to list available YAML files in '../challenges' folder (without .yml extension)
def list_yaml_files():
    files = [f for f in os.listdir('../challenges') if f.endswith('.yml')]
    return [os.path.splitext(f)[0] for f in files]

# Function to insert all challenges from the YAML files in the '../challenges' folder
def insert_all():
    available_files = list_yaml_files()
    if not available_files:
        print("No YAML files found in the '../challenges' folder.")
        return

    print("Inserting the following challenge files:")
    for file in available_files:
        print(f"- {file}")
    
    for file in available_files:
        yaml_file = os.path.join('../challenges', file + '.yml')
        challenge_data = load_challenge_data(yaml_file)
        insert_challenge_data(challenge_data)
        print(f"Challenge '{file}' and its cases have been added successfully.")

# Function to list available challenges in the database
def list_challenges():
    
    # Get ENVs for database configuration
    db_host = os.getenv('MYSQL_HOST')
    db_user = os.getenv('MYSQL_USER')
    db_password = os.getenv('MYSQL_PASSWORD')
    db_database = os.getenv('MYSQL_DATABASE')

    # Create configuration dictionary for database connections
    conn = {
        'host': db_host, 
        'user': db_user, 
        'password': db_password,
        'database': db_database #database name
    }
    
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

# Function to list challenges that can be added (exist in YAML files but not in the database)
def list_challenges_to_add():
    
    # Get ENVs for database configuration
    db_host = os.getenv('MYSQL_HOST')
    db_user = os.getenv('MYSQL_USER')
    db_password = os.getenv('MYSQL_PASSWORD')
    db_database = os.getenv('MYSQL_DATABASE')

    # Create configuration dictionary for database connections
    conn = {
        'host': db_host, 
        'user': db_user, 
        'password': db_password,
        'database': db_database #database name
    }
    
    cursor = conn.cursor()

    # Fetch challenge names already in the database
    cursor.execute("""
        SELECT name FROM challenges
    """)
    existing_challenges = {row[0] for row in cursor.fetchall()}

    cursor.close()
    conn.close()

    # List YAML files in the folder
    available_files = list_yaml_files()

    # Filter challenges that are not in the database
    challenges_to_add = [f for f in available_files if f not in existing_challenges]

    return challenges_to_add


# Main function to run the script
def main():
    # Ask user for action
    print("Choose an action:")
    print("1. Insert a single challenge")
    print("2. Insert all challenges from YAML files")

    action = input("Please enter the number corresponding to your choice: ")

    if action == "1":
        # List challenges that can be added
        challenges_to_add = list_challenges_to_add()

        if not challenges_to_add:
            print("No new challenges to add. All challenges in the folder are already in the database.")
            return

        print("Challenges available to add:")
        for i, challenge in enumerate(challenges_to_add, start=1):
            print(f"{i}. {challenge}")

        # Prompt user for the challenge to insert
        choice = input("Enter the number of the challenge you want to add: ")

        try:
            choice_index = int(choice) - 1
            if 0 <= choice_index < len(challenges_to_add):
                selected_challenge = challenges_to_add[choice_index]
                yaml_file = os.path.join('../challenges', selected_challenge + '.yml')
                challenge_data = load_challenge_data(yaml_file)
                insert_challenge_data(challenge_data)
                print(f"Challenge '{selected_challenge}' and its cases have been added successfully.")
            else:
                print("Invalid choice. Please select a valid number from the list.")
        except ValueError:
            print("Invalid input. Please enter a number.")

    elif action == "2":
        # Insert all challenges from YAML files
        insert_all()

    else:
        print("Invalid choice. Please enter 1 or 2.")

if __name__ == "__main__":
    main()