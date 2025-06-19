const apiKey = "caf87105fd3f266bec4127269ded93b4"; // OpenWeatherMap API key
let debounceTimer;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  updateDateTime();
  setInterval(updateDateTime, 60000);
  adjustViewportHeight();
  window.addEventListener('resize', adjustViewportHeight);

  // Show Chennai weather by default
  getWeatherByCity('Chennai');

  document.getElementById('cityInput').addEventListener('input', handleInput);
  document.getElementById('cityInput').addEventListener('focus', handleInput);
  document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#suggestions') && !e.target.closest('#cityInput')) {
      document.getElementById('suggestions').classList.add('hidden');
    }
  });
  
  const voiceSearchBtn = document.getElementById('voiceSearchBtn');
  if ('webkitSpeechRecognition' in window) {
    voiceSearchBtn.addEventListener('click', startVoiceRecognition);
  } else {
    voiceSearchBtn.classList.add('hidden');
  }
});

// Voice recognition function
function startVoiceRecognition() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  
  // Show feedback to user
  const voiceSearchBtn = document.getElementById('voiceSearchBtn');
  voiceSearchBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
  voiceSearchBtn.classList.remove('bg-blue-100', 'text-blue-600');
  voiceSearchBtn.classList.add('bg-red-100', 'text-red-600');
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('cityInput').value = transcript;
    getWeather();
  };
  
  recognition.onerror = (event) => {
    console.error('Voice recognition error', event.error);
    showError('Voice recognition failed. Please try again.');
    resetVoiceButton();
  };
  
  recognition.onend = () => {
    resetVoiceButton();
  };
  
  recognition.start();
  
  function resetVoiceButton() {
    voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceSearchBtn.classList.remove('bg-red-100', 'text-red-600');
    voiceSearchBtn.classList.add('bg-blue-100', 'text-blue-600');
  }
};

// Adjust for mobile viewport height
function adjustViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Update date and time
function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: "short", 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  };
  
  // Adjust format for very small screens
  if (window.innerWidth <= 375) {
    options.weekday = "short";
    options.month = "short";
  }
  
  document.getElementById("datetime").innerText = now.toLocaleDateString("en-US", options);
}

// Get city suggestions
async function getCitySuggestions(query) {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

// Display suggestions
function displaySuggestions(suggestions) {
  const container = document.getElementById('suggestions');
  container.innerHTML = '';
  
  if (suggestions.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  suggestions.forEach(city => {
    const item = document.createElement('div');
    item.className = 'p-3 hover:bg-gray-100 cursor-pointer text-left text-gray-800 text-sm border-b border-gray-100 last:border-0 transition-colors';
    item.innerHTML = `
      <div class="font-medium">${city.name}</div>
      <div class="text-xs text-gray-500">${city.state ? city.state + ', ' : ''}${city.country}</div>
    `;
    item.onclick = () => {
      document.getElementById('cityInput').value = `${city.name}, ${city.country}`;
      container.classList.add('hidden');
      getWeather();
    };
    container.appendChild(item);
  });
  
  container.classList.remove('hidden');
}

// Debounce input for suggestions
function handleInput() {
  clearTimeout(debounceTimer);
  const query = document.getElementById('cityInput').value.trim();
  
  if (query.length < 2) {
    document.getElementById('suggestions').classList.add('hidden');
    return;
  }
  
  debounceTimer = setTimeout(async () => {
    const suggestions = await getCitySuggestions(query);
    displaySuggestions(suggestions);
  }, 300);
}

// Get weather by city name (added this new function)
async function getWeatherByCity(city) {
  const weatherInfo = document.getElementById("weatherInfo");
  const errorMsg = document.getElementById("errorMsg");
  const loader = document.getElementById("loader");

  loader.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  errorMsg.classList.add("hidden");

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    ]);

    if (!weatherRes.ok) throw new Error("City not found");
    if (!forecastRes.ok) throw new Error("Forecast data unavailable");

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    displayWeatherData(weatherData, forecastData);
    document.getElementById("cityInput").value = weatherData.name;
  } catch (err) {
    showError(err.message || "Failed to fetch weather data");
  } finally {
    loader.classList.add("hidden");
  }
}

// Get weather data
async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  getWeatherByCity(city);
}

// Get weather by coordinates
async function getWeatherByCoords(position) {
  const { latitude, longitude } = position.coords;
  const weatherInfo = document.getElementById("weatherInfo");
  const errorMsg = document.getElementById("errorMsg");
  const loader = document.getElementById("loader");

  loader.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  errorMsg.classList.add("hidden");

  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
    ]);

    if (!weatherRes.ok) throw new Error("Location weather data not available");
    if (!forecastRes.ok) throw new Error("Forecast data unavailable");

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    displayWeatherData(weatherData, forecastData);
    document.getElementById("cityInput").value = weatherData.name;
  } catch (err) {
    showError(err.message || "Failed to fetch location weather");
  } finally {
    loader.classList.add("hidden");
  }
}

// Display weather data
function displayWeatherData(weatherData, forecastData) {
  const weatherInfo = document.getElementById("weatherInfo");
  const errorMsg = document.getElementById("errorMsg");
  const weather = weatherData.weather[0].main.toLowerCase();
  const iconCode = weatherData.weather[0].icon;

  // Display main weather info
  document.getElementById("cityName").innerText = `${weatherData.name}, ${weatherData.sys.country}`;
  document.getElementById("description").innerText = weatherData.weather[0].description;
  document.getElementById("temp").innerText = `${Math.round(weatherData.main.temp)}°C`;
  document.getElementById("humidity").innerText = `${weatherData.main.humidity}%`;
  document.getElementById("wind").innerText = `${Math.round(weatherData.wind.speed * 3.6)} km/h`;
  document.getElementById("pressure").innerText = `${weatherData.main.pressure} hPa`;
  
  // Format visibility (convert meters to km)
  const visibilityKm = (weatherData.visibility / 1000).toFixed(1);
  document.getElementById("visibility").innerText = `${visibilityKm} km`;

  // Set weather icon with animation
  const weatherIcon = document.getElementById("weatherIcon");
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.classList.remove("animate__pulse");
  void weatherIcon.offsetWidth;
  weatherIcon.classList.add("animate__pulse");

  // Display forecast
  displayForecast(forecastData);

  // Show the weather info
  weatherInfo.classList.remove("hidden");
  weatherInfo.classList.add("animate__fadeIn");
  errorMsg.classList.add("hidden");

  // Set appropriate background based on weather condition
  setBackground(weather);
}

// Display forecast
function displayForecast(forecastData) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = '';

  // Get daily forecasts (one per day at noon if available)
  const dailyForecasts = [];
  const processedDays = new Set();
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString();
    
    // Use noon forecast or first available if none at noon
    if (!processedDays.has(dayKey) ){
      processedDays.add(dayKey);
      dailyForecasts.push(item);
    }
    
    // Stop when we have 5 days
    if (dailyForecasts.length >= 5) return;
  });

  dailyForecasts.slice(0, 5).forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const iconCode = day.weather[0].icon;
    const temp = Math.round(day.main.temp);

    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item bg-white/50 p-1 sm:p-2 rounded-lg text-center';
    forecastItem.innerHTML = `
      <p class="text-xs font-medium text-gray-600">${dayName}</p>
      <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${day.weather[0].description}" 
           class="w-6 h-6 sm:w-8 sm:h-8 mx-auto my-1 weather-icon" />
      <p class="text-xs sm:text-sm font-semibold text-gray-800">${temp}°C</p>
    `;
    forecastContainer.appendChild(forecastItem);
  });
}

// Show error message
function showError(message) {
  const weatherInfo = document.getElementById("weatherInfo");
  const errorMsg = document.getElementById("errorMsg");
  const loader = document.getElementById("loader");

  loader.classList.add("hidden");
  weatherInfo.classList.add("hidden");

  errorMsg.innerHTML = `
    <div class="flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span class="text-xs sm:text-sm">${message}</span>
    </div>
  `;
  errorMsg.classList.remove("hidden");
  errorMsg.classList.add("animate__headShake");
}

// Set background based on weather condition
function setBackground(condition) {
  const body = document.body;
  
  // Clear any existing background styles
  body.style.background = '';
  body.className = ''; // Clear all classes
  
  // Set new background based on weather condition
  switch (condition.toLowerCase()) {
    case "clear":
      body.style.background = 'linear-gradient(135deg, #ffafbd 0%, #ffc3a0 100%)'; // Sunrise colors
      break;
    case "clouds":
      body.style.background = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'; // Cloudy gray
      break;
    case "rain":
      body.style.background = 'linear-gradient(135deg, #005AA7 0%, #FFFDE4 100%)'; // Rainy blue
      break;
    case "drizzle":
      body.style.background = 'linear-gradient(135deg, #7F9EA8 0%, #4A6B7A 100%)'; // Light rain
      break;
    case "thunderstorm":
      body.style.background = 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)'; // Stormy
      break;
    case "snow":
      body.style.background = 'linear-gradient(135deg, #E6E9F0 0%, #eef2f3 100%)'; // Snow white
      break;
    case "mist":
    case "fog":
    case "haze":
      body.style.background = 'linear-gradient(135deg, #C9D6FF 0%, #E2E2E2 100%)'; // Misty
      break;
    default:
      body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'; // Default
  }
  
  // Add smooth transition
  body.style.transition = 'background 1s ease';
}