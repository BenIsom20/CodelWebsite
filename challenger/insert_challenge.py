import yaml
import mysql.connector
import os
from datetime import datetime

# Function to load challenge data from YAML
def load_challenge_data(yaml_file):
    with open(yaml_file, 'r') as file:
        return yaml.safe_load(file)

# Function to generate the function skeleton based on name and parameters
def generate_function_skeleton(function_name, parameters):
    param_str = ', '.join(parameters)  # Join parameters with commas for the function signature
    skeleton = f"# CODE HERE\n\ndef {function_name}({param_str}):\n    pass"  # Function skeleton template
    return skeleton

# Function to insert data into the database
def insert_challenge_data(challenge_data):
    # Database connection
    conn = mysql.connector.connect(
        host='db',
        user='devuser',
        password='devpass',
        database='qsdb'
    )
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
    skeleton = generate_function_skeleton(function_name, parameters)

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
    # Database connection
    conn = mysql.connector.connect(
        host='db',
        user='devuser',
        password='devpass',
        database='qsdb'
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

# Main function to run the script
def main():
    # Ask user for action
    print("Choose an action:")
    print("1. Insert a single challenge")
    print("2. Insert all challenges from YAML files")

    action = input("Please enter the number corresponding to your choice: ")

    if action == "1":
        # List available challenges in the database
        available_challenges = list_challenges()

        if not available_challenges:
            print("No challenges found in the database.")
            return

        # Prompt user for the challenge_id to insert
        challenge_id = input("Please enter the challenge ID of the challenge to insert: ")

        # Check if the challenge_id is valid
        try:
            challenge_id = int(challenge_id)
        except ValueError:
            print(f"Error: '{challenge_id}' is not a valid challenge ID.")
            return

        # Find the challenge file corresponding to the challenge_id
        challenge = next((ch for ch in available_challenges if ch[0] == challenge_id), None)
        if challenge:
            yaml_file = os.path.join('../challenges', challenge[1] + '.yml')
            challenge_data = load_challenge_data(yaml_file)
            insert_challenge_data(challenge_data)
            print(f"Challenge '{challenge[1]}' and its cases have been added successfully.")
        else:
            print(f"Error: Challenge ID '{challenge_id}' not found.")
        
    elif action == "2":
        # Insert all challenges from YAML files
        insert_all()

    else:
        print("Invalid choice. Please enter 1 or 2.")

if __name__ == "__main__":
    main()
