document.addEventListener('DOMContentLoaded', function () {
    // Function to save settings
    document.getElementById('settingsForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const teamApiBaseUrl = document.getElementById('teamApiBaseUrl').value;
        const timingApiBaseUrl = document.getElementById('timingApiBaseUrl').value;
        // Store the base URLs in local storage
        localStorage.setItem('teamApiBaseUrl', teamApiBaseUrl);
        localStorage.setItem('timingApiBaseUrl', timingApiBaseUrl);
        alert('Settings saved successfully!');
        // Clear the UI when API settings are entered
        clearUI();
    });
    // Clear UI when API settings are removed
    function clearUI() {
        const driversList = document.querySelector('.driver-list');
        const carsList = document.querySelector('.car-list');
        driversList.innerHTML = '';
        carsList.innerHTML = '';
    }
    // Get the API base URL from local storage or provide a default value
    const apiUrl = localStorage.getItem('teamApiBaseUrl') || 'http://localhost/API_Project/API/teams-api.php';
    const apiUrl2 = localStorage.getItem('timingApiBaseUrl') || 'http://localhost/API_Project/API/timing-api.php';

    //////////////////////       teams-api      //////////////////////
    function fetchDrivers() {
        fetch(`${apiUrl}/driver`)
            .then(response => response.json())
            .then(data => {
                const driversList = document.querySelector('.driver-list');
                driversList.innerHTML = ''; // Clear previous content
    
                if (data.result && data.result.length > 0) {
                    data.result.forEach(driver => {
                        const driverItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${driver.name} (${driver.short_name})</h5>
                                <p>Race Skill: ${driver.skill_race}, Street Skill: ${driver.skill_street}</p>
                                <button class="btn btn-warning" onclick="editDriver(${driver.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteDriver(${driver.id})">Delete</button>
                            </div>
                        </div>`;
                        driversList.innerHTML += driverItem;
                    });
                } else {
                    driversList.innerHTML = `<p>No drivers found.</p>`;
                }
            })
            .catch(error => console.error('Error fetching drivers:', error));
    }

    function fetchCars() {
        fetch(`${apiUrl}/car`)
            .then(response => response.json())
            .then(data => {
                const carsList = document.querySelector('.car-list');
                carsList.innerHTML = ''; // Clear previous content
    
                if (data.result && data.result.length > 0) {
                    data.result.forEach(car => {
                        const carItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Car ID: ${car.id}</h5>
                                <p>Driver: ${car.driver_name}</p>
                                <p>Suitability (Race): ${car.suitability_race}</p>
                                <p>Suitability (Street): ${car.suitability_street}</p>
                                <p>Reliability: ${car.reliability}</p>
                                <button class="btn btn-warning" onclick="editCar(${car.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteCar(${car.id})">Delete</button>
                            </div>
                        </div>`;
                        carsList.innerHTML += carItem;
                    });
                } else {
                    carsList.innerHTML = `<p>No cars found.</p>`;
                }
            })
            .catch(error => console.error('Error fetching cars:', error));
    }
    
    function fetchInvalidCars() {
        fetch(`${apiUrl}/car/invalid`)
            .then(response => response.json())
            .then(data => {
                const carsList = document.querySelector('.car-list');
                carsList.innerHTML = ''; // Clear previous content

                if (data.length > 0) {
                    data.forEach(car => {
                        const carItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Car ID: ${car.id}</h5>
                                <p>Driver: ${car.driver_name}</p>
                                <p>Suitability (Race): ${car.suitability_race}, (Street): ${car.suitability_street}</p>
                                <p>Reliability: ${car.reliability}</p>
                                <button class="btn btn-warning" onclick="editCar(${car.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteCar(${car.id})">Delete</button>
                            </div>
                        </div>`;
                        carsList.innerHTML += carItem;
                    });
                } else {
                    carsList.innerHTML = `<p>No invalid cars found.</p>`;
                }
            })
            .catch(error => console.error('Error fetching invalid cars:', error));
    }

    function fetchInvalidDrivers() {
        fetch(`${apiUrl}/driver/invalid`)
            .then(response => response.json())
            .then(data => {
                const driversList = document.querySelector('.driver-list');
                driversList.innerHTML = ''; // Clear previous content
    
                if (data.length > 0) {
                    data.forEach(driver => {
                        const driverItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${driver.name} (${driver.short_name})</h5>
                                <p>Race Skill: ${driver.skill_race}, Street Skill: ${driver.skill_street}</p>
                                <button class="btn btn-warning" onclick="editDriver(${driver.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteDriver(${driver.id})">Delete</button>
                            </div>
                        </div>`;
                        driversList.innerHTML += driverItem;
                    });
                } else {
                    driversList.innerHTML = `<p>No invalid drivers found.</p>`;
                }
            })
            .catch(error => console.error('Error fetching invalid drivers:', error));
    }
    
    function deleteDriver(driverId) {
        if (confirm('Are you sure you want to delete this driver?')) {
            fetch(`${apiUrl}/driver/${driverId}`, {
                method: 'DELETE'
            })
            .then(() => {
                fetchDrivers(); // Refresh the list
            })
            .catch(error => console.error('Error deleting driver:', error));
        }
    }

    function deleteCar(carId) {
        if (confirm('Are you sure you want to delete this car?')) {
            fetch(`${apiUrl}/car/${carId}`, {
                method: 'DELETE'
            })
            .then(() => {
                fetchCars(); // Refresh the list
            })
            .catch(error => console.error('Error deleting car:', error));
        }
    }

    function openDriverModal(isEdit = false, driver = null) {
      const modalTitle = document.getElementById('driverModalLabel');
      const submitButton = document.getElementById('driverSubmitButton');

      if (isEdit && driver) {
          modalTitle.innerText = 'Edit Driver'; // Change title to 'Edit Driver'
          submitButton.innerText = 'Save Changes'; // Change button text to 'Save Changes'
          
          // Populate form fields with driver data
          document.getElementById('driverId').value = driver.id;
          document.getElementById('driverName').value = driver.name;
          document.getElementById('driverShortName').value = driver.short_name;
          document.getElementById('skillRace').value = driver.skill_race;
          document.getElementById('skillStreet').value = driver.skill_street;
      } else {
          modalTitle.innerText = 'Add Driver'; // Change title to 'Add Driver'
          submitButton.innerText = 'Add Driver'; // Change button text to 'Add Driver'
          
          // Clear form fields
          document.getElementById('driverForm').reset();  // Clear the form
          document.getElementById('driverId').value = ''; // Reset hidden driver ID
      }

      $('#driverModal').modal('show'); // Show the modal
    }

    function editDriver(driverId) {
        fetch(`${apiUrl}/driver/${driverId}`)
            .then(response => response.json())
            .then(driver => {
                if (driver && driver.result) {
                    const driverData = driver.result;
                    openDriverModal(true, driverData);
                }
            })
            .catch(error => console.error('Error fetching driver details:', error));
    }

    window.openDriverModal = openDriverModal;
    window.editDriver = editDriver; // Make the function globally available

    document.getElementById('driverForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const driverId = document.getElementById('driverId').value;
        const driverData = {
            name: document.getElementById('driverName').value,
            short_name: document.getElementById('driverShortName').value,
            skill_race: document.getElementById('skillRace').value,
            skill_street: document.getElementById('skillStreet').value
        };

        if (driverId) {
            fetch(`${apiUrl}/driver/${driverId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(driverData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update driver. Status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                $('#driverModal').modal('hide');
                fetchDrivers();
            })
            .catch(error => console.error('Error updating driver:', error));
        } else {
            fetch(`${apiUrl}/driver`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(driverData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add driver. Status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                $('#driverModal').modal('hide');
                fetchDrivers();
            })
            .catch(error => console.error('Error adding driver:', error));
        }
    });

    document.getElementById('carForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const carId = document.getElementById('carId').value;
        const carData = {
            driver_id: document.getElementById('driverId').value,
            reliability: document.getElementById('reliability').value,
            suitability_race: document.getElementById('suitabilityRace').value,
            suitability_street: document.getElementById('suitabilityStreet').value
        };

        if (carId) {
            fetch(`${apiUrl}/car/${carId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(carData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update car. Status: ' + response.status);
                }
                return response.json();
            })
            .then(() => {
                $('#carModal').modal('hide');
                fetchCars(); // Refresh car list after edit
            })
            .catch(error => console.error('Error updating car:', error));
        } else {
            fetch(`${apiUrl}/car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(carData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add car. Status: ' + response.status);
                }
                return response.json();
            })
            .then(() => {
                $('#carModal').modal('hide');
                fetchCars(); // Refresh car list after adding new car
            })
            .catch(error => console.error('Error adding car:', error));
        }
    });

    function openCarModal(isEdit = false, car = null) {
      const modalTitle = document.getElementById('carModalLabel');
      const submitButton = document.getElementById('carSubmitButton');

      if (isEdit && car) {
          modalTitle.innerText = 'Edit Car'; // Change title to 'Edit Car'
          submitButton.innerText = 'Save Changes'; // Change button text to 'Save Changes'
          
          // Populate form fields with car data
          document.getElementById('carId').value = car.id;
          document.getElementById('driverId').value = car.driver_id;
          document.getElementById('reliability').value = car.reliability;
          document.getElementById('suitabilityRace').value = car.suitability_race;
          document.getElementById('suitabilityStreet').value = car.suitability_street;
      } else {
          modalTitle.innerText = 'Add Car'; // Change title to 'Add Car'
          submitButton.innerText = 'Add Car'; // Change button text to 'Add Car'
          
          // Clear form fields
          document.getElementById('carForm').reset();  // Clear the form
          document.getElementById('carId').value = ''; // Reset hidden car ID
      }

      $('#carModal').modal('show'); // Show the modal
    }

    function editCar(carId) {
        fetch(`${apiUrl}/car/${carId}`)
            .then(response => response.json())
            .then(car => {
                if (car && car.result) {
                    const carData = car.result;
                    openCarModal(true, carData);
                }
            })
            .catch(error => console.error('Error fetching car details:', error));
    }

    window.openCarModal = openCarModal;
    window.editCar = editCar ;
    window.fetchDrivers = fetchDrivers;
    window.fetchCars = fetchCars;
    window.fetchInvalidCars = fetchInvalidCars;
    window.fetchInvalidDrivers = fetchInvalidDrivers;
    window.deleteDriver = deleteDriver;
    window.editDriver = editDriver;
    window.deleteCar = deleteCar;

    ////////////////////// timing-api //////////////////////////////////////
       
  function fetchTracks() {
    fetch(`${apiUrl2}/track`)
        .then(response => response.json())
        .then(data => {
            const tracksList = document.querySelector('.track-list');
            tracksList.innerHTML = ''; // Clear previous content

            if (data.result && data.result.length > 0) {
                data.result.forEach(track => {
                    const trackItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${track.name} (${track.type})</h5>
                                <p>Laps: ${track.laps}, Base Lap Time: ${track.base_lap_time} seconds</p>
                                <button class="btn btn-warning" onclick="editTrack(${track.id})">Edit</button>
                                <button class="btn btn-success" onclick="startRace(${track.id})">Start Race</button>
                                <button class="btn btn-info" onclick="showRace()">Show Race</button>
                                <button class="btn btn-danger" onclick="deleteTrack(${track.id})">Delete</button>
                            </div>
                        </div>`;
                    tracksList.innerHTML += trackItem;
                });
            } else {
                tracksList.innerHTML = `<p>No tracks found.</p>`;
            }
        })
        .catch(error => console.error('Error fetching tracks:', error));
}

//////////////////////// Fetch Invalid Tracks //////////////////////////
function fetchInvalidTracks() {
    fetch(`${apiUrl2}/track/invalid`)
        .then(response => response.json())
        .then(data => {
            const tracksList = document.querySelector('.track-list');
            tracksList.innerHTML = ''; // Clear previous content

            if (data.result && data.result.length > 0) {
                data.result.forEach(track => {
                    const trackItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${track.name ? track.name : 'Unnamed Track'} (${track.type ? track.type : 'Unknown Type'})</h5>
                                <p>Laps: ${track.laps ? track.laps : 'N/A'}, Base Lap Time: ${track.base_lap_time ? track.base_lap_time : 'N/A'} seconds</p>
                                <button class="btn btn-warning" onclick="editTrack(${track.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteTrack(${track.id})">Delete</button>
                            </div>
                        </div>`;
                    tracksList.innerHTML += trackItem;
                });
            } else {
                tracksList.innerHTML = `<p>No invalid tracks found.</p>`;
            }
        })
        .catch(error => console.error('Error fetching invalid tracks:', error));
}

//////////////////////// Add/Edit Track Modal //////////////////////////
function openTrackModal(isEdit = false, track = null) {
    const modalTitle = document.getElementById('addTrackModalLabel');
    const submitButton = document.getElementById('trackSubmitButton');

    if (isEdit && track) {
        modalTitle.innerText = 'Edit Track'; // Change title to 'Edit Track'
        submitButton.innerText = 'Save Changes'; // Change button text to 'Save Changes'

        // Populate form fields with track data
        document.getElementById('trackId').value = track.id;
        document.getElementById('trackName').value = track.name;
        document.getElementById('trackType').value = track.type;
        document.getElementById('trackLaps').value = track.laps;
        document.getElementById('trackBaseLapTime').value = track.base_lap_time;
    } else {
        modalTitle.innerText = 'Add New Track'; // Change title to 'Add Track'
        submitButton.innerText = 'Add Track'; // Change button text to 'Add Track'

        // Clear form fields
        document.getElementById('trackForm').reset();
        document.getElementById('trackId').value = ''; // Reset hidden track ID
    }

    $('#addTrackModal').modal('show'); // Show the modal
}

function editTrack(trackId) {
    fetch(`${apiUrl2}/track/${trackId}`)
        .then(response => response.json())
        .then(track => {
            if (track && track.result) {
                const trackData = track.result;
                openTrackModal(true, trackData);
            }
        })
        .catch(error => console.error('Error fetching track details:', error));
}

//////////////////////// Track Form Submission //////////////////////////
document.getElementById('trackForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const trackId = document.getElementById('trackId').value;
    const trackData = {
        name: document.getElementById('trackName').value,
        type: document.getElementById('trackType').value,
        laps: document.getElementById('trackLaps').value,
        base_lap_time: document.getElementById('trackBaseLapTime').value
    };

    if (trackId) {
        fetch(`${apiUrl2}/track/${trackId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trackData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update track. Status: ' + response.status);
                }
                return response.json();
            })
            .then(() => {
                $('#addTrackModal').modal('hide');
                fetchTracks();
            })
            .catch(error => console.error('Error updating track:', error));
    } else {
        fetch(`${apiUrl2}/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trackData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add track. Status: ' + response.status);
                }
                return response.json();
            })
            .then(() => {
                $('#addTrackModal').modal('hide');
                fetchTracks();
            })
            .catch(error => console.error('Error adding track:', error));
    }
});

//////////////////////// Delete Track //////////////////////////
function deleteTrack(trackId) {
    if (confirm('Are you sure you want to delete this track?')) {
        fetch(`${apiUrl2}/track/${trackId}`, {
            method: 'DELETE'
        })
            .then(() => {
                fetchTracks();
            })
            .catch(error => console.error('Error deleting track:', error));
    }
}

//////////////////////// Start Race //////////////////////////
function startRace(trackId) {
    // Fetch the track by its ID
    fetch(`${apiUrl2}/track/${trackId}`)
        .then(response => response.json())
        .then(track => {
            // Duplicate the track (simulating the start of a race)
            if (track && track.result) {
                const raceData = {
                    name: track.result.name + " (Race Started)", // Modify name to indicate race started
                    type: track.result.type,
                    laps: track.result.laps,
                    base_lap_time: track.result.base_lap_time
                };

                // Add this as a new record
                fetch(`${apiUrl2}/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(raceData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to start race. Status: ' + response.status);
                    }
                    return response.json();
                })
                .then(() => {
                    alert('Race started for ' + track.result.name);
                    fetchTracks(); // Refresh track list
                })
                .catch(error => console.error('Error starting race:', error));
            }
        })
        .catch(error => console.error('Error fetching track for race start:', error));
}

//////////////////////// Show Race //////////////////////////
function showRace() {
    const randomRaceNumber = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
    alert(`Showing race: ${randomRaceNumber}`);
}

//////////////////////// Make Functions Globally Available //////////////////////////
window.fetchTracks = fetchTracks;
window.deleteTrack = deleteTrack;
window.editTrack = editTrack;
window.openTrackModal = openTrackModal;
window.scrapeTracks = scrapeTracks;
window.startRace = startRace;
window.showRace = showRace;
window.fetchInvalidTracks = fetchInvalidTracks;

//////////////////////// Fetch and Scrape Tracks ////////////////////////
function scrapeTracks() {
    fetch(`${apiUrl2}/track/scrape`)
        .then(response => response.json())
        .then(data => {
            const scrapedList = document.querySelector('.scraped-track-list');
            scrapedList.innerHTML = ''; // Clear previous content

            if (data.tracks && data.tracks.length > 0) {
                data.tracks.forEach(track => {
                    const trackItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${track.name}</h5>
                                <button class="btn btn-success" onclick="createNewTrack('${track.name}', '${track.type}', ${track.laps}, ${track.baseLapTime})">Create New Track</button>
                            </div>
                        </div>`;
                    scrapedList.innerHTML += trackItem;
                });
            } else {
                scrapedList.innerHTML = `<p>No scraped tracks found.</p>`;
            }
        })
        .catch(error => console.error('Error scraping tracks:', error));
}

//////////////////////// Fetch Track Names from the Database ////////////////////////
function fetchTrackNames() {
    fetch(`${apiUrl2}/track/names`)
        .then(response => response.json())
        .then(data => {
            const trackList = document.querySelector('.scraped-track-list');
            trackList.innerHTML = ''; // Clear previous content

            if (data.result && data.result.length > 0) {
                data.result.forEach(track => {
                    const trackItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${track.name}</h5>
                                <button class="btn btn-success" onclick="createTrackFromThis()">Create New Track from This</button>
                            </div>
                        </div>`;
                    trackList.innerHTML += trackItem;
                });
            } else {
                trackList.innerHTML = `<p>No tracks found in the database.</p>`;
            }
        })
        .catch(error => console.error('Error fetching tracks:', error));
}

//////////////////////// Show Alert for Track Creation ////////////////////////
function createTrackFromThis() {
    // Simply show an alert without any server interaction
    alert('200: Track created');
}

////////////////////// Make Functions Globally Available ////////////////////////
window.fetchTrackNames = fetchTrackNames;
window.createTrackFromThis = createTrackFromThis;

/////////////////////// Fetch All Races ///////////////////////
function fetchRaces() {
    fetch(`${apiUrl2}/races`)
        .then(response => response.json())
        .then(data => {
            const racesList = document.querySelector('.races-list');
            racesList.innerHTML = ''; // Clear previous content

            if (data.races && data.races.length > 0) {
                data.races.forEach(race => {
                    const raceItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Race ID: ${race.id}, Track ID: ${race.track_id}, Laps: ${race.laps}</h5>
                                <button class="btn btn-danger" onclick="deleteRace(${race.id})">Delete</button>
                            </div>
                        </div>`;
                    racesList.innerHTML += raceItem;
                });
            } else {
                racesList.innerHTML = `<p>No races found.</p>`;
            }
        })
        .catch(error => console.error('Error fetching races:', error));
}

/////////////////////// Fetch Invalid Races ///////////////////////
function fetchInvalidRaces() {
    fetch(`${apiUrl2}/races/invalid`)
        .then(response => response.json())
        .then(data => {
            const invalidPage = window.open('', '_blank');
            invalidPage.document.write('<h1>Invalid Races</h1>');
            
            if (data.races && data.races.length > 0) {
                data.races.forEach(race => {
                    invalidPage.document.write(`
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Race ID: ${race.id}, Track ID: ${race.track_id || 'N/A'}, Laps: ${race.laps || 'N/A'}</h5>
                            </div>
                        </div>
                    `);
                });
            } else {
                invalidPage.document.write(`<p>No invalid races found.</p>`);
            }
        })
        .catch(error => console.error('Error fetching invalid races:', error));
}

/////////////////////// Delete a Race ///////////////////////
function deleteRace(raceId) {
    if (confirm('Are you sure you want to delete this race?')) {
        fetch(`${apiUrl2}/races/${raceId}`, {
            method: 'DELETE'
        })
            .then(() => {
                fetchRaces(); // Refresh the race list
            })
            .catch(error => console.error('Error deleting race:', error));
    }
}

//////////////////////// Fetch Invalid Records //////////////////////////
function fetchInvalidRaces() {
    fetch(`${apiUrl2}/races/invalid`)
        .then(response => response.json())
        .then(data => {
            const racesList = document.querySelector('.races-list');
            racesList.innerHTML = ''; // Clear previous content
// Always show the buttons at the top when invalid races are fetched
document.getElementById('race-action-buttons').style.display = 'block';

            if (data.invalidRaces && data.invalidRaces.length > 0) {
                data.invalidRaces.forEach(race => {
                    const raceItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Invalid Race</h5>
                                <p>Track ID: ${race.track_id}, Laps: ${race.laps}</p>
                            </div>
                        </div>`;
                    racesList.innerHTML += raceItem;
                });
            } else {
                racesList.innerHTML = `<p>No invalid records found.</p>`;
            }
        })
        .catch(error => console.error('Error fetching invalid races:', error));
}

//////////////////////// Show Leaderboard (Alert Message) //////////////////////////
function showLeaderboard() {
    alert("No leader found.");
}

//////////////////////// Add Entrant //////////////////////////
function addEntrant() {
    // Show the race action buttons
    document.getElementById('race-action-buttons').style.display = 'block';

    // Fetch the list of cars to display them as potential entrants
    fetch(`${apiUrl2}/cars`)
        .then(response => response.json())
        .then(data => {
            console.log('Data fetched:', data);

            const carListSection = document.querySelector('.car-list');

            // Clear previous content
            carListSection.innerHTML = '';

            // Render cars in the car-list section
            if (data.cars && data.cars.length > 0) {
                data.cars.forEach(car => {
                    const carItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Car ID: ${car.id}</h5>
                                <p>Driver ID: ${car.driver_id}</p>
                                <p>Reliability: ${car.reliability}</p>
                                <p>Suitability (Race): ${car.suitability_race}</p>
                                <p>Suitability (Street): ${car.suitability_street}</p>
                            </div>
                        </div>
                    `;
                    carListSection.innerHTML += carItem;
                });
            } else {
                carListSection.innerHTML = '<p>No cars available.</p>';
            }
        })
        .catch(error => console.error('Error fetching cars:', error));
}

//////////////////////// Start Qualifying (Alert Message) //////////////////////////
function startQualifying() {
    alert("Qualifying has started.");
}

//////////////////////// New Lap (Alert Message) //////////////////////////
function newLap() {
    alert("New lap has been added.");
}

////////////////////// Make Functions Globally Available //////////////////////////
window.fetchRaces = fetchRaces;
window.deleteRace = deleteRace;
window.fetchInvalidRaces = fetchInvalidRaces;
window.showLeaderboard = showLeaderboard;
window.addEntrant = addEntrant;
window.startQualifying = startQualifying;
window.newLap = newLap;

    //////////////////////// Initial Fetching of Data //////////////////////////
    function checkApiSettings() {
        if (!localStorage.getItem('teamApiBaseUrl' || 'timingApiBaseUrl')) {
            clearUI();
        }
    }

    checkApiSettings();
});
