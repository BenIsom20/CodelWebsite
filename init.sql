CREATE DATABASE IF NOT EXISTS qsdb;
USE qsdb;

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    prompt TEXT,
    date TIMESTAMP
);

-- Create challenge_cases table with foreign key
CREATE TABLE IF NOT EXISTS challenge_cases (
    challenge_case_id INT AUTO_INCREMENT PRIMARY KEY,  -- Adding a unique ID for each case
    challenge_id INT NOT NULL,
    prompt VARCHAR(255) NOT NULL,
    given_data VARCHAR(255) NOT NULL,
    expected VARCHAR(255) NOT NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)  -- Foreign key to challenges table
);

-- Create function_skeletons table with foreign key to challenges table
CREATE TABLE IF NOT EXISTS function_skeletons (
    function_skeleton_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique ID for each function skeleton
    challenge_id INT NOT NULL,  -- Foreign key referencing challenges
    name VARCHAR(255) NOT NULL,  -- Function name
    parameters VARCHAR(255),  -- Function parameters as a string
    skeleton TEXT,  -- Function skeleton
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)  -- Foreign key to challenges table
);


