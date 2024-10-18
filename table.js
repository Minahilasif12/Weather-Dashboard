// Define global variables
const API_KEY = '8f6ccfbf617fb198faab8619427697b5';  // Your OpenWeather API Key
// Define global variables
const GEMINI_API_KEY = 'AIzaSyBTmLi7oqG-MPvx6EmFva1r1oH7nFnAm9Q';  // Your Gemini API Key
let forecastData = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentCity = ''; // Store the current city name

// Function to fetch weather forecast data
async function fetchWeather() {
    const city = document.getElementById('search-bar').value || currentCity;
    if (!city) {
        displayError("Please enter a city name.");
        return;
    }
    currentCity = city.trim();
    console.log(`Fetching weather for city: ${currentCity}`);

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&units=metric&appid=${API_KEY}`);
        const data = await response.json();

        console.log("Weather data response:", data);
        if (data.cod === "200") {
            forecastData = data;
            currentPage = 1;
            renderForecastTable(forecastData);
            clearError();
        } else {
            displayError(`City not found: ${data.message}`);
        }
    } catch (error) {
        displayError("Error fetching weather data.");
        console.error("Error fetching weather data:", error);
    }
}

// Function to display error messages
function displayError(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove('hidden');
}

// Function to clear error messages
function clearError() {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = '';
    errorMessageElement.classList.add('hidden');
}

// Function to render weather data in the table with pagination
function renderForecastTable(data) {
    const tableBody = document.getElementById('forecast-table');
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = data.list.slice(startIndex, startIndex + rowsPerPage);

    tableBody.innerHTML = '';
    paginatedData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-2 px-4 border-b">${new Date(entry.dt_txt).toLocaleDateString()}</td>
            <td class="py-2 px-4 border-b">${entry.main.temp} °C</td>
            <td class="py-2 px-4 border-b">${entry.weather[0].main}</td>
            <td class="py-2 px-4 border-b">${entry.weather[0].description}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = startIndex + rowsPerPage >= data.list.length;
}

// Function to filter and sort forecast data based on the condition
const filterForecastData = (condition) => {
    let filteredData = forecastData.list;

    if (condition === 'asc') {
        // Sort temperatures in ascending order
        filteredData = filteredData.sort((a, b) => a.main.temp - b.main.temp);
    } else if (condition === 'desc') {
        // Sort temperatures in descending order
        filteredData = filteredData.sort((a, b) => b.main.temp - a.main.temp);
    } else if (condition === 'rain') {
        // Filter only days with rain
        filteredData = filteredData.filter(item => item.weather[0].main === 'Rain');
    } else if (condition === 'highest') {
        // Show only the day with the highest temperature
        const highestTemp = Math.max(...filteredData.map(item => item.main.temp));
        filteredData = filteredData.filter(item => item.main.temp === highestTemp);
    }

    // Re-render the table with filtered/sorted data
    renderForecastTable({ list: filteredData });
};

// Function to detect weather-related queries
function isWeatherQuery(query) {
    const weatherKeywords = ['weather', 'forecast', 'rain', 'temperature', 'clouds'];
    return weatherKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Main function to handle chatbot queries
async function handleChatbotQuery(query) {
    console.log("Chatbot query received:", query);
    
    if (isWeatherQuery(query)) {
        console.log("Query is related to weather.");
        await fetchWeatherData();
    } else if (isGeneralQuery(query)) {
        console.log("Query is general, fetching Gemini response.");
        await fetchGeminiResponse(query);
    } else {
        console.log("Query not recognized.");
        displayError("I'm sorry, I can't answer that right now.");
    }
}

// Function to determine if the query is related to weather
function isWeatherQuery(query) {
    const weatherKeywords = ['weather', 'raining', 'temperature', 'forecast'];
    return weatherKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Function to determine if the query is general
function isGeneralQuery(query) {
    return query.trim() !== '';
}

// Function to fetch weather data
async function fetchWeatherData() {
    const city = document.getElementById('search-bar').value || currentCity;
    if (!city) {
        displayError("Please enter a city name.");
        return;
    }
    currentCity = city.trim();
    console.log(`Fetching weather for city: ${currentCity}`);

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&units=metric&appid=${API_KEY}`);
        const data = await response.json();

        if (data.cod === 200) {
            displayWeatherInChat(data);
        } else {
            displayError(`City not found: ${data.message}`);
        }
    } catch (error) {
        displayError("Error fetching weather data.");
        console.error("Error fetching weather data:", error);
    }
}

// Function to display weather data in the chat
function displayWeatherInChat(data) {
    const chatbotMessages = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('p-2', 'border-b', 'border-gray-300');

    const city = data.name;
    const temp = data.main.temp;
    const weatherCondition = data.weather[0].description;

    messageDiv.textContent = `Chatbot: The current temperature in ${city} is ${temp}°C with ${weatherCondition}.`;
    chatbotMessages.appendChild(messageDiv);
}

// Function to fetch response from Gemini for general queries
async function fetchGeminiResponse(query) {
    // Implement your existing Gemini API call here
    console.log("Fetching Gemini response for query:", query);
    // Add the logic to fetch and display the response
}

// Display error message
function displayError(message) {
    const chatbotMessages = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('p-2', 'text-red-600');
    messageDiv.textContent = message;
    chatbotMessages.appendChild(messageDiv);
}


// Function to fetch response from Gemini Chatbot API for non-weather-related queries
async function fetchGeminiResponse(query) {
    const payload = {
        contents: [{
            parts: [{ text: query }]
        }]
    };

    console.log("Fetching Gemini response for query:", query);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Gemini response:", data);

        // Check if the response has candidates and use the first one
        if (data.candidates && data.candidates.length > 0) {
            const chatbotMessages = document.getElementById('chatbot-messages');
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('p-2', 'border-b', 'border-gray-300');

            // Extract the text from the parts array
            const responseParts = data.candidates[0].content.parts;
            if (responseParts && responseParts.length > 0) {
                messageDiv.textContent = `Chatbot: ${responseParts.map(part => part.text).join(' ')}`; // Join parts text
            } else {
                messageDiv.textContent = "Chatbot: Sorry, I couldn't find a response for that.";
            }
            chatbotMessages.appendChild(messageDiv);
        } else {
            console.error("No candidates found in the Gemini API response.");
            const chatbotMessages = document.getElementById('chatbot-messages');
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('p-2', 'border-b', 'border-gray-300');
            messageDiv.textContent = "Chatbot: Sorry, I couldn't find a response for that.";
            chatbotMessages.appendChild(messageDiv);
        }

    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        const chatbotMessages = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('p-2', 'border-b', 'border-gray-300');
        messageDiv.textContent = "Chatbot: An error occurred while fetching the response.";
        chatbotMessages.appendChild(messageDiv);
    }
}

// Function to initialize event listeners
function initializeEventListeners() {
    console.log("Initializing event listeners for chatbot."); 

    // Reference the chatbot input
    const chatbotInput = document.getElementById('chat-input');  // Changed from 'chatbot-input' to 'chat-input'

    // Weather-related event listeners
    const sortAscButton = document.getElementById('sort-asc');
    const sortDescButton = document.getElementById('sort-desc');
    const filterRainButton = document.getElementById('filter-rain');
    const highestTempButton = document.getElementById('highest-temp');

    if (sortAscButton) {
        sortAscButton.addEventListener('click', () => {
            console.log("Sorting temperatures in ascending order.");
            filterForecastData('asc');
        });
    }
    if (sortDescButton) {
        sortDescButton.addEventListener('click', () => {
            console.log("Sorting temperatures in descending order.");
            filterForecastData('desc');
        });
    }
    if (filterRainButton) {
        filterRainButton.addEventListener('click', () => {
            console.log("Filtering forecast data for rainy days.");
            filterForecastData('rain');
        });
    }
    if (highestTempButton) {
        highestTempButton.addEventListener('click', () => {
            console.log("Showing highest temperature day.");
            filterForecastData('highest');
        });
    }

    // Pagination Controls
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');

    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                console.log("Going to previous page.");
                currentPage--;
                renderForecastTable(forecastData);
            }
        });
    }
    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            if (currentPage * rowsPerPage < forecastData.list.length) {
                console.log("Going to next page.");
                currentPage++;
                renderForecastTable(forecastData);
            }
        });
    }

    // Chatbot query submission
    const chatSubmitButton = document.getElementById('chat-submit');  // Correct button ID used
    if (chatSubmitButton) {
        chatSubmitButton.addEventListener('click', () => {
            const query = chatbotInput.value;
            console.log("Chatbot submit button clicked, query:", query);
            handleChatbotQuery(query);
            chatbotInput.value = ''; // Clear the input
        });
    }
}

// Initialize event listeners when DOM is fully loaded
window.addEventListener('DOMContentLoaded', initializeEventListeners);
