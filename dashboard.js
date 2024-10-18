// OpenWeather API Key
const API_KEY = '8f6ccfbf617fb198faab8619427697b5';
let isCelsius = true; // State variable to track temperature unit
let barChart;
let doughnutChart;
let lineChart;

// Fetch weather data from OpenWeather API (Forecast for next 5 days)
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        displayError(error.message);
    }
}

// Convert temperature to Fahrenheit
function convertToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}
// Function to change background based on weather icon code
function changeBackground(weatherIcon) {
    const weatherDataElement = document.getElementById('weather-data');

    // Define gradient backgrounds for different weather conditions based on icon codes
    const weatherGradients = {
        '01d': 'linear-gradient(to right, #00c6ff, #0072ff)', // Clear sky (day)
        '01n': 'linear-gradient(to right, #2b5876, #4e4376)', // Clear sky (night)
        '02d': 'linear-gradient(to right, #bdc3c7, #2c3e50)', // Few clouds (day)
        '02n': 'linear-gradient(to right, #3a3d40, #181719)', // Few clouds (night)
        '03d': 'linear-gradient(to right, #a7a7a7, #2c3e50)', // Scattered clouds (day)
        '03n': 'linear-gradient(to right, #3a3d40, #181719)', // Scattered clouds (night)
        '04d': 'linear-gradient(to right, #bdc3c7, #2c3e50)', // Broken clouds (day)
        '04n': 'linear-gradient(to right, #3a3d40, #181719)', // Broken clouds (night)
        '09d': 'linear-gradient(to right, #74ebd5, #acb6e5)', // Shower rain (day)
        '09n': 'linear-gradient(to right, #232526, #414345)', // Shower rain (night)
        '10d': 'linear-gradient(to right, #74ebd5, #acb6e5)', // Rain (day)
        '10n': 'linear-gradient(to right, #232526, #414345)', // Rain (night)
        '11d': 'linear-gradient(to right, #555555, #000000)', // Thunderstorm (day)
        '11n': 'linear-gradient(to right, #232526, #414345)', // Thunderstorm (night)
        '13d': 'linear-gradient(to right, #ffffff, #e6e6e6)', // Snow (day)
        '13n': 'linear-gradient(to right, #d7d2cc, #304352)', // Snow (night)
        '50d': 'linear-gradient(to right, #f0f0f0, #d9d9d9)', // Mist (day)
        '50n': 'linear-gradient(to right, #8e9eab, #eef2f3)', // Mist (night)
        'default': 'linear-gradient(to right, #f8cdda, #1d2b64)' // Default background
    };

    // Apply the corresponding background gradient based on the icon code
    const gradient = weatherGradients[weatherIcon] || weatherGradients['default']; // Fallback to default if the icon is not found
    weatherDataElement.style.background = gradient;
    weatherDataElement.style.backgroundSize = 'cover'; // Ensure the gradient covers the whole element
    weatherDataElement.style.backgroundPosition = 'center'; // Center the gradient
}



// Update UI with weather data
function updateWeatherData(weatherData) {
    const weatherDescription = weatherData.list[0].weather[0].description;
    const weatherIcon = weatherData.list[0].weather[0].icon; // Get the icon code
    const temperatureC = weatherData.list[0].main.temp;

    document.getElementById('city-name').textContent = `Weather in ${weatherData.city.name}`;
    document.getElementById('temperature').textContent = `Temperature: ${isCelsius ? temperatureC.toFixed(2) + ' °C' : convertToFahrenheit(temperatureC).toFixed(2) + ' °F'}`;
    document.getElementById('weather-description').textContent = `Current Weather: ${weatherDescription}`;
    document.getElementById('humidity').textContent = `Humidity: ${weatherData.list[0].main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${weatherData.list[0].wind.speed} m/s`;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${weatherIcon}.png`; // Set the correct weather icon

    // Change background based on the weather icon
    changeBackground(weatherIcon);

    // Prepare chart data for the next 5 days
    const temperatures = weatherData.list.slice(0, 5).map(item => isCelsius ? item.main.temp : convertToFahrenheit(item.main.temp));
    const weatherConditions = weatherData.list.slice(0, 5).map(item => item.weather[0].main);

    createBarChart(temperatures);
    createDoughnutChart(weatherConditions);
    createLineChart(temperatures);
}


// Bar Chart: Temperature for the next 5 days
function createBarChart(temperatures) {
    const ctx = document.getElementById('bar-chart').getContext('2d');

    // Destroy previous chart if it exists
    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            animations: {
                tension: {
                    duration: 2000,
                    easing: 'easeInOutBounce',
                    from: 1,
                    to: 0,
                    loop: true
                }
            }
        }
    });
}

// Doughnut Chart: Weather conditions distribution
function createDoughnutChart(conditions) {
    const weatherCount = {};
    conditions.forEach(cond => {
        weatherCount[cond] = (weatherCount[cond] || 0) + 1;
    });

    const ctx = document.getElementById('doughnut-chart').getContext('2d');

    // Destroy previous chart if it exists
    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherCount),
            datasets: [{
                data: Object.values(weatherCount),
                backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(153, 102, 255, 0.6)']
            }]
        },
        options: {
            animations: {
                tension: {
                    duration: 2000,
                    easing: 'easeInOutBounce'
                }
            }
        }
    });
}

// Line Chart: Temperature changes over the next 5 days
function createLineChart(temperatures) {
    const ctx = document.getElementById('line-chart').getContext('2d');

    // Destroy previous chart if it exists
    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgba(75, 192, 192, 0.6)',
                fill: false
            }]
        },
        options: {
            animations: {
                y: {
                    easing: 'easeOutBounce',
                    from: 0,
                    duration: 2000
                }
            }
        }
    });
}

// Handle Error Display
function displayError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('city-name').textContent = '';
    document.getElementById('temperature').textContent = '';
    document.getElementById('weather-description').textContent = '';
    document.getElementById('humidity').textContent = '';
    document.getElementById('wind-speed').textContent = '';
    document.getElementById('weather-icon').src = '';

    // Reset background to default when error occurs
    document.getElementById('weather-data').className = "p-4 shadow rounded mb-6 bg-blue-200";
}

// Event listener for search button
document.getElementById('search-btn').addEventListener('click', async () => {
    const city = document.getElementById('search-bar').value;
    if (city) {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            updateWeatherData(weatherData);
        }
    } else {
        displayError('Please enter a city name');
    }
});

// Event listener for toggle button
document.getElementById('toggle-btn').addEventListener('click', async () => {
    isCelsius = !isCelsius; // Toggle the state

    // Re-fetch weather data for the current city
    const city = document.getElementById('city-name').textContent.split(' ')[2]; // Extract the city name from the displayed data
    if (city) {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            updateWeatherData(weatherData); // Update data and charts
        }
    }
});

// Initial Call to Set Up Event Listeners
function init() {
    document.getElementById('search-btn').addEventListener('click', async () => {
        const city = document.getElementById('search-bar').value;
        if (city) {
            const weatherData = await fetchWeather(city);
            if (weatherData) {
                updateWeatherData(weatherData);
            }
        } else {
            displayError('Please enter a city name');
        }
    });
}

// Call the init function to set everything up
init();
