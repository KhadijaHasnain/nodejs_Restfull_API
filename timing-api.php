<?php
include 'config.php'; // Include database connection
require 'vendor/autoload.php'; // For Goutte or any scraping tool
use Goutte\Client;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// Scrape Function to get track data from Formula 1 website
function scrapeF1Tracks() {
    $client = new Client();
    $crawler = $client->request('GET', 'https://www.formula1.com/en/racing/2024');

    $tracks = [];

    // Check if the crawler successfully fetched the page
    if ($crawler) {
        // Scrape track information from the website
        $crawler->filter('.event-item-wrapper')->each(function ($node) use (&$tracks) {
            try {
                // Scrape the track name
                $trackName = $node->filter('.event-title')->text();

                // Scrape additional information for laps and base lap time (adjust as per website structure)
                // Note: Make sure these values are present, or you can skip optional fields like laps or lap times if they are not always present.
                $trackDetails = $node->filter('.event-item__circuit-info')->text();
                $laps = 78; // Placeholder, adjust based on website content if needed
                $fastestLap = 72.909; // Placeholder, adjust based on website content if needed

                // Determine if it's a street or race track
                $trackType = stripos($trackDetails, 'street') !== false ? 'street' : 'race';

                // Add track information to the array
                $tracks[] = [
                    'name' => $trackName,
                    'type' => $trackType,
                    'laps' => $laps,
                    'baseLapTime' => $fastestLap
                ];
            } catch (Exception $e) {
                // Catch any exceptions that occur while scraping a specific track
                error_log('Error scraping track data: ' . $e->getMessage());
            }
        });
    } else {
        error_log('Failed to retrieve the webpage for scraping.');
    }

    return $tracks;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

// If no specific path is provided, return all tracks from the database
if (empty($path) || empty($path[0])) {
    // Fetch all tracks from the database
    $stmt = $conn->prepare("SELECT * FROM tracks");
    $stmt->execute();
    $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the track data in JSON format
    echo json_encode([
        'code' => 200,
        'message' => 'All available tracks from the database',
        'tracks' => $tracks
    ], JSON_UNESCAPED_SLASHES);
    exit();
}

// Handle requests
switch ($method) {
    case 'GET':
        // Get track by id or all tracks
        if ($path[0] === 'track') {
            // Check if we are looking for a specific track, invalid, startRace, showRace, or all
            if (isset($path[1])) {
                if ($path[1] === 'scrape') {
                    // Scrape and return tracks
                    $scrapedTracks = scrapeF1Tracks();
                    if (!empty($scrapedTracks)) {
                        echo json_encode(['code' => 200, 'message' => 'Scraped Formula 1 Tracks', 'tracks' => $scrapedTracks], JSON_UNESCAPED_SLASHES);
                    } else {
                        echo json_encode(['code' => 404, 'message' => 'No tracks found from the scraping process.']);
                    }
                } elseif ($path[1] === 'invalid') {
                    // Fetch tracks with null values in fields
                    $stmt = $conn->prepare("SELECT * FROM tracks WHERE name IS NULL OR type IS NULL OR laps IS NULL OR base_lap_time IS NULL");
                    $stmt->execute();
                    $invalidTracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode(['code' => 200, 'result' => $invalidTracks], JSON_UNESCAPED_SLASHES);
                } elseif ($path[1] === 'startRace') {
                    // Duplicate a random track to simulate a race start
                    $stmt = $conn->prepare("SELECT * FROM tracks ORDER BY RAND() LIMIT 1");
                    $stmt->execute();
                    $track = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($track) {
                        // Insert duplicate track as a new record
                        $stmt = $conn->prepare("INSERT INTO tracks (name, type, laps, base_lap_time) VALUES (?, ?, ?, ?)");
                        $stmt->execute([$track['name'], $track['type'], $track['laps'], $track['base_lap_time']]);
                        echo json_encode(['message' => 'Race started with a duplicate track record.']);
                    } else {
                        echo json_encode(['message' => 'No track available to duplicate for the race.'], 404);
                    }
                } elseif ($path[1] === 'showRace') {
                    // Simulate a race with a random number of laps
                    $randomLaps = rand(5, 100); // Random number of laps
                    echo json_encode(['message' => "The race is ongoing with $randomLaps laps."]);
                }elseif ($path[1] === 'names') {
                    // Fetch only track names from the database
                    $stmt = $conn->prepare("SELECT name FROM tracks WHERE name IS NOT NULL");
                    $stmt->execute();
                    $trackNames = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode(['code' => 200, 'result' => $trackNames], JSON_UNESCAPED_SLASHES);
                } else {
                    // Fetch specific track by ID
                    $stmt = $conn->prepare("SELECT * FROM tracks WHERE id = ?");
                    $stmt->execute([$path[1]]);
                    $track = $stmt->fetch(PDO::FETCH_ASSOC);
                    echo json_encode(['code' => 200, 'result' => $track], JSON_UNESCAPED_SLASHES);
                }
            } else {
                // Fetch all tracks if no specific path is given
                $stmt = $conn->prepare("SELECT * FROM tracks");
                $stmt->execute();
                $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['code' => 200, 'result' => $tracks], JSON_UNESCAPED_SLASHES);
            }
        }
         // Handle race-specific requests
elseif ($path[0] === 'races') {
    if (isset($path[1])) {
        if ($path[1] === 'invalid') {
            // Fetch invalid races (those with null track_id or laps)
            try {
                $stmt = $conn->prepare("SELECT * FROM races WHERE track_id IS NULL OR laps IS NULL");
                $stmt->execute();
                $invalidRaces = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if ($invalidRaces) {
                    echo json_encode(['code' => 200, 'races' => $invalidRaces]);
                } else {
                    echo json_encode(['code' => 404, 'message' => 'No invalid races found']);
                }
            } catch (PDOException $e) {
                echo json_encode(['code' => 500, 'message' => 'Error fetching invalid races: ' . $e->getMessage()]);
            }
        } else {
            // Fetch a specific race by ID (path[1] is the race ID)
            try {
                $stmt = $conn->prepare("SELECT * FROM races WHERE id = ?");
                $stmt->execute([$path[1]]);
                $race = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($race) {
                    echo json_encode(['code' => 200, 'race' => $race]);
                } else {
                    echo json_encode(['code' => 404, 'message' => 'Race not found']);
                }
            } catch (PDOException $e) {
                echo json_encode(['code' => 500, 'message' => 'Error fetching race: ' . $e->getMessage()]);
            }
        }
    } else {
        // Fetch all races if no specific race ID or invalid flag is given
        try {
            $stmt = $conn->prepare("SELECT * FROM races");
            $stmt->execute();
            $races = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($races) {
                echo json_encode(['code' => 200, 'races' => $races]);
            } else {
                echo json_encode(['code' => 404, 'message' => 'No races found']);
            }
        } catch (PDOException $e) {
            echo json_encode(['code' => 500, 'message' => 'Error fetching races: ' . $e->getMessage()]);
        }
    }
}

elseif ($path[0] === 'cars') {
    try {
        $stmt = $conn->prepare("SELECT * FROM cars");
        $stmt->execute();
        $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($cars) {
            echo json_encode(['code' => 200, 'cars' => $cars]);
        } else {
            echo json_encode(['code' => 404, 'message' => 'No cars found']);
        }
    } catch (PDOException $e) {
        echo json_encode(['code' => 500, 'message' => 'Error fetching cars: ' . $e->getMessage()]);
    }
}

        break;

    case 'POST':
        // Add a new track
        if ($path[0] === 'track') {
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $conn->prepare("INSERT INTO tracks (name, type, laps, base_lap_time) VALUES (?, ?, ?, ?)");
            $result = $stmt->execute([$data['name'], $data['type'], $data['laps'], $data['base_lap_time']]);
            echo json_encode(['message' => $result ? 'Track added successfully' : 'Failed to add track'], JSON_UNESCAPED_SLASHES);
        }
        break;

    case 'PUT':
        // Update a track
        if ($path[0] === 'track' && isset($path[1])) {
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $conn->prepare("UPDATE tracks SET name = ?, type = ?, laps = ?, base_lap_time = ? WHERE id = ?");
            $result = $stmt->execute([$data['name'], $data['type'], $data['laps'], $data['base_lap_time'], $path[1]]);
            echo json_encode(['message' => $result ? 'Track updated successfully' : 'Failed to update track'], JSON_UNESCAPED_SLASHES);
        }
        break;

    case 'DELETE':
        // Delete a track
        if ($path[0] === 'track' && isset($path[1])) {
            $stmt = $conn->prepare("DELETE FROM tracks WHERE id = ?");
            $result = $stmt->execute([$path[1]]);
            echo json_encode(['message' => $result ? 'Track deleted successfully' : 'Failed to delete track'], JSON_UNESCAPED_SLASHES);
        }
        // Handle deleting a race
        elseif ($path[0] === 'races' && isset($path[1])) {
            $stmt = $conn->prepare("DELETE FROM races WHERE id = ?");
            $result = $stmt->execute([$path[1]]);
            echo json_encode(['message' => $result ? 'Race deleted successfully' : 'Failed to delete race']);
        }
        break;

    default:
        http_response_code(405); // Method not allowed
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
