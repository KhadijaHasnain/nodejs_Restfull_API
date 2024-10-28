CREATE DATABASE formula1;
USE formula1;

-- Drivers Table
CREATE TABLE drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    skill_race INT NOT NULL,
    skill_street INT NOT NULL
);

-- Cars Table
CREATE TABLE cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id INT NOT NULL,
    reliability INT NOT NULL,
    suitability_race INT NOT NULL,
    suitability_street INT NOT NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- Insert sample drivers
INSERT INTO drivers (name, short_name, skill_race, skill_street) 
VALUES 
('Lewis Hamilton', 'Lewis', 95, 80),
('Max Verstappen', 'Max', 90, 85),
('Charles Leclerc', 'Charles', 50, 60), -- Invalid: skills don't sum to 100
('Sebastian Vettel', 'Seb', 100, 0);

-- Insert sample cars
INSERT INTO cars (driver_id, reliability, suitability_race, suitability_street)
VALUES 
(1, 90, 50, 50),  -- Valid
(2, 85, 88, 12),  -- Invalid: suitability doesn't sum to 100
(3, 75, 60, 40),  -- Valid
(4, 80, 55, 55);  -- Invalid: suitability doesn't sum to 100

-- Create the 'tracks' table
CREATE TABLE tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('race', 'street') NOT NULL,
    laps INT NOT NULL,
    base_lap_time DECIMAL(10, 3) NOT NULL
);

-- Insert some dummy data into the 'tracks' table
INSERT INTO tracks (name, type, laps, base_lap_time) VALUES
('Monaco Grand Prix', 'street', 78, 72.909),
('Silverstone Circuit', 'race', 52, 90.123),
('Spa-Francorchamps', 'race', 44, 101.345),
('Monza Circuit', 'race', 53, 79.123),
('Singapore Grand Prix', 'street', 61, 107.456),
('Baku City Circuit', 'street', 51, 105.789),
('Suzuka Circuit', 'race', 53, 83.876),
('Miami Grand Prix', 'street', 57, 98.654),
('Austin Circuit of the Americas', 'race', 56, 95.567);

-- A record with null values to simulate invalid data
INSERT INTO tracks (name, type, laps, base_lap_time) VALUES
(NULL, 'race', NULL, NULL),
('Invalid Track', NULL, NULL, 120.000);

-- Create the 'races' table allowing NULL for 'laps'
CREATE TABLE IF NOT EXISTS races (
    id INT AUTO_INCREMENT PRIMARY KEY,
    track_id INT,
    laps INT,  -- Allowing NULL for laps
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);

-- Insert some dummy data into the 'races' table
INSERT INTO races (track_id, laps) VALUES
(1, 78),  -- Monaco Grand Prix
(2, 52),  -- Silverstone Circuit
(3, 44),  -- Spa-Francorchamps
(4, 53),  -- Monza Circuit
(5, 61),  -- Singapore Grand Prix
(6, 51),  -- Baku City Circuit
(7, 53),  -- Suzuka Circuit
(8, 57),  -- Miami Grand Prix
(9, 56);  -- Austin Circuit of the Americas

-- Add a record with invalid values (track_id and laps can be NULL)
INSERT INTO races (track_id, laps) VALUES
(NULL, NULL);  -- Invalid race record
