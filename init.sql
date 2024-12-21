CREATE DATABASE IF NOT EXISTS qsdb;
USE qsdb;

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    prompt TEXT
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

-- Insert challenges
INSERT INTO challenges (name, prompt) VALUES
('Reverse a String', 'Write a Python function that takes a string as input and returns the string reversed.');

-- Insert challenge cases (note the challenge_id references challenges)
INSERT INTO challenge_cases (challenge_id, prompt, given_data, expected) VALUES
(1, 'Reverse a normal string', 'hello', 'olleh'),
(1, 'Reverse an empty string ', '', ''),
(1, 'Reverse a string with spaces', 'hello world', 'dlrow olleh'),
(1, 'Reverse a single character string', 'a', 'a');




