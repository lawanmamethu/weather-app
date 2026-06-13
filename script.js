// DOM Elements
const cityInput = document.getElementById('cityInput');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherCard = document.getElementById('weatherCard');
const initialMsg = document.getElementById('initialMsg');

// Display elements
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const fahrenheit = document.getElementById('fahrenheit');
const conditionExtra = document.getElementById('conditionExtra');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');

// API Key (free tier - replace if needed)
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';

// Update current time and date
function updateTimeAndDate() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    currentTime.textContent = `${hours}:${minutes} ${ampm}`;
    
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Call once and update every minute
updateTimeAndDate();
setInterval(updateTimeAndDate, 60000);

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

// Get weather icon class based on condition
function getWeatherIconClass(condition) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return 'fa-sun';
    if (conditionLower.includes('cloud')) return 'fa-cloud';
    if (conditionLower.includes('rain')) return 'fa-cloud-rain';
    if (conditionLower.includes('drizzle')) return 'fa-cloud-rain';
    if (conditionLower.includes('thunder')) return 'fa-bolt';
    if (conditionLower.includes('snow')) return 'fa-snowflake';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return 'fa-smog';
    return 'fa-cloud-sun';
}

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Fetch weather data
async function fetchWeather(city) {
    if (!city || city.length < 2) {
        weatherCard.style.display = 'none';
        initialMsg.style.display = 'block';
        return;
    }

    loadingDiv.style.display = 'block';
    weatherCard.style.display = 'none';
    errorDiv.style.display = 'none';
    initialMsg.style.display = 'none';

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`🌍 "${city}" not found. Please check the city name.`);
            } else {
                throw new Error('⚠️ Something went wrong. Please try again.');
            }
        }

        const data = await response.json();
        const tempC = Math.round(data.main.temp);
        const tempF = celsiusToFahrenheit(data.main.temp);
        const weatherCondition = data.weather[0].description;
        const weatherMain = data.weather[0].main;

        // Update UI
        cityName.innerHTML = `<i class="fas ${getWeatherIconClass(weatherCondition)}"></i> ${data.name}, ${data.sys.country}`;
        temperature.textContent = `${tempC}°C`;
        description.textContent = weatherCondition.charAt(0).toUpperCase() + weatherCondition.slice(1);
        feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidity.textContent = `${data.main.humidity}%`;
        wind.textContent = `${data.wind.speed} m/s`;
        pressure.textContent = `${data.main.pressure} hPa`;
        fahrenheit.textContent = `${tempF}°F`;
        conditionExtra.textContent = weatherMain;

        weatherCard.style.display = 'block';

    } catch (err) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${err.message}`;
        errorDiv.style.display = 'block';
        weatherCard.style.display = 'none';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Debounced search (waits 500ms after typing stops)
const debouncedFetch = debounce(fetchWeather, 500);

// Event listeners
cityInput.addEventListener('input', (e) => {
    const city = e.target.value.trim();
    debouncedFetch(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        fetchWeather(city);
    }
});

