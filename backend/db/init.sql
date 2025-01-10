CREATE DATABASE IF NOT EXISTS codelDatabase;
USE codelDatabase;

-- Create challenges table that holds each individual challenge
CREATE TABLE IF NOT EXISTS challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    prompt TEXT,
    date TIMESTAMP
);

-- Create challenge_cases table with foreign key which holds each challenges tests
CREATE TABLE IF NOT EXISTS challenge_cases (
    challenge_case_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    prompt VARCHAR(255) NOT NULL,
    given_data VARCHAR(255) NOT NULL,
    expected VARCHAR(255) NOT NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
);

-- Create function_skeletons table which holds each challenges function skeleton
CREATE TABLE IF NOT EXISTS function_skeletons (
    function_skeleton_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    parameters VARCHAR(255),
    skeleton TEXT,
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id)
);

-- Create User data table which holds each account information
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    streak INT NOT NULL DEFAULT 0, 
    wins INT NOT NULL DEFAULT 0,
    curtimer INT NOT NULL DEFAULT 0,
    curgrid TEXT,
    curcode TEXT,
    attempts INT NOT NULL DEFAULT 0,
    completed TINYINT NOT NULL DEFAULT 0,
    totalTime INT NOT NULL DEFAULT 0,
    allStreak INT NOT NULL DEFAULT 0
);

-- Create webInfo table which holds information about CODEL as a whole
CREATE TABLE IF NOT EXISTS webInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    allAttempts INT NOT NULL DEFAULT 0,
    allTime INT NOT NULL DEFAULT 0,
    allUsers INT NOT NULL DEFAULT 0
);

-- -- Insert the initial row with default values into webInfo
-- INSERT INTO webInfo (allAttempts, allTime, allUsers)
-- SELECT 0, 0, 0
-- WHERE NOT EXISTS (SELECT 1 FROM webInfo);

