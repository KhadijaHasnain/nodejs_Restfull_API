<?php
include 'config.php'; // Include database connection
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

// Helper function to send JSON responses
function send_json($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// If no specific path is provided, return a list of available endpoints
if (empty($path) || empty($path[0])) {
    // Fetch all drivers
    $stmt = $conn->prepare("SELECT * FROM drivers");
    $stmt->execute();
    $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch all cars
    $stmt = $conn->prepare("SELECT cars.*, drivers.name AS driver_name FROM cars LEFT JOIN drivers ON cars.driver_id = drivers.id");
    $stmt->execute();
    $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return both drivers and cars in the response
    echo json_encode([
        'code' => 200,
        'message' => 'All drivers and cars',
        'drivers' => $drivers,
        'cars' => $cars
    ]);
    exit();
}

switch ($method) {
    case 'GET':
        if ($path[0] === 'driver') {
            if (isset($path[1])) {
                // Fetch invalid drivers where skill_race + skill_street != 100
                if ($path[1] === 'invalid') {
                    $stmt = $conn->prepare("SELECT * FROM drivers WHERE (skill_race + skill_street) != 100");
                    $stmt->execute();
                    $invalidDrivers = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    send_json($invalidDrivers ?: ['message' => 'No invalid drivers found'], $invalidDrivers ? 200 : 404);
                }
                // Fetch a single driver by id
                else {
                    $stmt = $conn->prepare("SELECT * FROM drivers WHERE id = ?");
                    $stmt->execute([$path[1]]);
                    $driver = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($driver) {
                        $driverOutput = [
                            'id' => $driver['id'],
                            'shortName' => $driver['short_name'],
                            'name' => $driver['name'],
                            'skill' => [
                                'race' => $driver['skill_race'],
                                'street' => $driver['skill_street']
                            ]
                        ];
                        send_json(['code' => 200, 'result' => $driverOutput]);
                    } else {
                        send_json(['message' => 'Driver not found'], 404);
                    }
                }
            } else {
                // Fetch all drivers
                $stmt = $conn->prepare("SELECT * FROM drivers");
                $stmt->execute();
                $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);
                send_json(['code' => 200, 'result' => $drivers]);
            }
        }
        // Fetch cars (all, by id, or invalid)
        elseif ($path[0] === 'car') {
            if (isset($path[1])) {
                // Fetch invalid cars where suitability_race + suitability_street != 100
                if ($path[1] === 'invalid') {
                    $stmt = $conn->prepare("SELECT cars.*, drivers.name AS driver_name FROM cars LEFT JOIN drivers ON cars.driver_id = drivers.id WHERE (suitability_race + suitability_street) != 100");
                    $stmt->execute();
                    $invalidCars = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    send_json($invalidCars ?: ['message' => 'No invalid cars found'], $invalidCars ? 200 : 404);
                }
                // Fetch a single car by id
                else {
                    $stmt = $conn->prepare("SELECT cars.*, drivers.name AS driver_name FROM cars LEFT JOIN drivers ON cars.driver_id = drivers.id WHERE cars.id = ?");
                    $stmt->execute([$path[1]]);
                    $car = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($car) {
                        $carOutput = [
                            'id' => $car['id'],
                            'driver' => [
                                'name' => $car['driver_name'],
                                'uri' => 'https://TeamVM/driver/' . $car['driver_id']
                            ],
                            'suitability' => [
                                'race' => $car['suitability_race'],
                                'street' => $car['suitability_street']
                            ],
                            'reliability' => $car['reliability']
                        ];
                        send_json(['code' => 200, 'result' => $carOutput]);
                    } else {
                        send_json(['message' => 'Car not found'], 404);
                    }
                }
            } else {
                // Fetch all cars
                $stmt = $conn->prepare("SELECT cars.*, drivers.name AS driver_name FROM cars LEFT JOIN drivers ON cars.driver_id = drivers.id");
                $stmt->execute();
                $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
                send_json(['code' => 200, 'result' => $cars]);
            }
        }
        break;

        case 'POST':
            if ($path[0] === 'driver') {
                $data = json_decode(file_get_contents("php://input"), true);
        
                // Check if all required fields are present
                if (!isset($data['name'], $data['short_name'], $data['skill_race'], $data['skill_street'])) {
                    send_json(['message' => 'Invalid input data'], 400); // Send an error message if fields are missing
                }
        
                // Insert the driver data into the database
                $stmt = $conn->prepare("INSERT INTO drivers (name, short_name, skill_race, skill_street) VALUES (?, ?, ?, ?)");
                $result = $stmt->execute([$data['name'], $data['short_name'], $data['skill_race'], $data['skill_street']]);
                send_json(['message' => $result ? 'Driver added successfully' : 'Failed to add driver']);
            }

        // Add new car
        elseif ($path[0] === 'car') {
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['driver_id'], $data['reliability'], $data['suitability']['race'], $data['suitability']['street'])) {
                send_json(['message' => 'Invalid input data'], 400);
            }

            $stmt = $conn->prepare("INSERT INTO cars (driver_id, reliability, suitability_race, suitability_street) VALUES (?, ?, ?, ?)");
            $result = $stmt->execute([$data['driver_id'], $data['reliability'], $data['suitability']['race'], $data['suitability']['street']]);
            send_json(['message' => $result ? 'Car added successfully' : 'Failed to add car']);
        }
        break;

    case 'PUT':
        // Update driver details
        if ($path[0] === 'driver' && isset($path[1])) {
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['name'], $data['short_name'], $data['skill_race'], $data['skill_street'])) {
                send_json(['message' => 'Invalid input data'], 400); // Updated to expect shortName, skill_race, skill_street
            }
    
            $stmt = $conn->prepare("UPDATE drivers SET name = ?, short_name = ?, skill_race = ?, skill_street = ? WHERE id = ?");
            $result = $stmt->execute([$data['name'], $data['short_name'], $data['skill_race'], $data['skill_street'], $path[1]]);
            send_json(['message' => $result ? 'Driver updated successfully' : 'Failed to update driver']);
        }

        // Update car details
        elseif ($path[0] === 'car' && isset($path[1])) {
            $data = json_decode(file_get_contents("php://input"), true);
            if (!isset($data['driver_id'], $data['reliability'], $data['suitability_race'], $data['suitability_street'])) {
                send_json(['message' => 'Invalid input data'], 400);
            }

            $stmt = $conn->prepare("UPDATE cars SET driver_id = ?, reliability = ?, suitability_race = ?, suitability_street = ? WHERE id = ?");
            $result = $stmt->execute([$data['driver_id'], $data['reliability'], $data['suitability_race'], $data['suitability_street'], $path[1]]);
            send_json(['message' => $result ? 'Car updated successfully' : 'Failed to update car']);
        }
        break;

    case 'DELETE':
        // Delete driver or car
        if ($path[0] === 'driver' && isset($path[1])) {
            $stmt = $conn->prepare("DELETE FROM drivers WHERE id = ?");
            $result = $stmt->execute([$path[1]]);
            send_json(['message' => $result ? 'Driver deleted successfully' : 'Failed to delete driver']);
        }
        elseif ($path[0] === 'car' && isset($path[1])) {
            $stmt = $conn->prepare("DELETE FROM cars WHERE id = ?");
            $result = $stmt->execute([$path[1]]);
            send_json(['message' => $result ? 'Car deleted successfully' : 'Failed to delete car']);
        }
        break;

    default:
        http_response_code(405); // Method not allowed
        send_json(['message' => 'Method not allowed'], 405);
        break;
}
