const apiKey = "caf87105fd3f266bec4127269ded93b4"; // OpenWeatherMap API key
let debounceTimer;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateDateTime();
  setInterval(updateDateTime, 60000);
  adjustViewportHeight();
  window.addEventListener('resize', adjustViewportHeight);
  
  // Theme toggle functionality
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Check for saved theme preference
  if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }

  // Try to get weather by geolocation first
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      getWeatherByCoords,
      () => console.log("Location access denied"),
      { timeout: 5000 }
    );
  }

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

// Initialize theme from localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  updateThemeIcon();
}

// Update theme icon based on current mode
function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  if (document.documentElement.classList.contains('dark')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    icon.classList.remove('moon-icon'); // Remove black color for sun
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    icon.classList.add('moon-icon'); // Add black color for moon
  }
}

// Toggle dark/light theme
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  updateThemeIcon();
}

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
    item.className = 'p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-left text-gray-800 dark:text-gray-100 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors';
    item.innerHTML = `
      <div class="font-medium">${city.name}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400">${city.state ? city.state + ', ' : ''}${city.country}</div>
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

// Clear any existing errors
function clearErrors() {
  const errorContainer = document.getElementById('errorContainer');
  errorContainer.innerHTML = '';
}

// Show error message
function showError(message) {
  clearErrors();
  const errorContainer = document.getElementById('errorContainer');
  
  const errorElement = document.createElement('div');
  errorElement.className = 'bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded text-sm flex items-center gap-2';
  errorElement.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  errorContainer.appendChild(errorElement);
}

// Get weather data
async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  const weatherInfo = document.getElementById("weatherInfo");
  const errorMsg = document.getElementById("errorMsg");
  const loader = document.getElementById("loader");

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  loader.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  errorMsg.classList.add("hidden");

  try {
    // Get both current weather and forecast in parallel
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    ]);

    if (!weatherRes.ok) throw new Error("City not found");
    if (!forecastRes.ok) throw new Error("Forecast data unavailable");

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    displayWeatherData(weatherData, forecastData);
  } catch (err) {
    showError(err.message || "Failed to fetch weather data");
  } finally {
    loader.classList.add("hidden");
  }
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
    // Get both current weather and forecast in parallel
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
    forecastItem.className = 'forecast-item bg-white/50 dark:bg-slate-700/50 p-1 sm:p-2 rounded-lg text-center';
    forecastItem.innerHTML = `
      <p class="text-xs font-medium text-gray-600 dark:text-gray-300">${dayName}</p>
      <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${day.weather[0].description}" 
           class="w-6 h-6 sm:w-8 sm:h-8 mx-auto my-1 weather-icon" />
      <p class="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white">${temp}°C</p>
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
  const body = document.getElementById("body");
  
  // Remove any existing weather-related classes
  const classesToRemove = [
    'from-blue-400', 'via-blue-300', 'to-blue-100', 'dark:from-blue-900', 'dark:via-blue-800', 'dark:to-blue-700',
    'from-gray-400', 'via-gray-200', 'to-gray-100', 'dark:from-gray-700', 'dark:via-gray-600', 'dark:to-gray-500',
    'from-blue-600', 'via-blue-400', 'to-blue-200', 'dark:from-blue-800', 'dark:via-blue-600', 'dark:to-blue-400',
    'from-gray-800', 'via-gray-600', 'to-gray-300', 'dark:from-gray-900', 'dark:via-gray-800', 'dark:to-gray-700',
    'from-blue-100', 'via-blue-50', 'to-white', 'dark:from-blue-300', 'dark:via-blue-200', 'dark:to-blue-100',
    'from-gray-300', 'via-gray-200', 'to-gray-100', 'dark:from-gray-600', 'dark:via-gray-500', 'dark:to-gray-400',
    'from-slate-400', 'via-slate-300', 'to-slate-100', 'dark:from-slate-700', 'dark:via-slate-600', 'dark:to-slate-500'
  ];
  
  classesToRemove.forEach(cls => body.classList.remove(cls));

  // Add new gradient classes based on condition and theme
  let gradientClasses = [];
  switch (condition) {
    case "clear":
      gradientClasses = document.documentElement.classList.contains('dark') 
        ? ['dark:from-blue-900', 'dark:via-blue-800', 'dark:to-blue-700']
        : ['from-blue-400', 'via-blue-300', 'to-blue-100'];
      break;
    case "clouds":
      gradientClasses = document.documentElement.classList.contains('dark') 
        ? ['dark:from-gray-700', 'dark:via-gray-600', 'dark:to-gray-500']
        : ['from-gray-400', 'via-gray-200', 'to-gray-100'];
      break;
    case "rain":
    case "drizzle":
      gradientClasses = document.documentElement.classList.contains('dark') 
        ? ['dark:from-blue-800', 'dark:via-blue-600', 'dark:to-blue-400']
        : ['from-blue-600', 'via-blue-400', 'to-blue-200'];
      break;
    case "thunderstorm":
      gradientClasses = document.documentElement.classList.contains('dark') 
        ? ['dark:from-gray-900', 'dark:via-gray-800', 'dark:to-gray-700']
        : ['from-gray-800', 'via-gray-600', 'to-gray-300'];
      break;
    case "snow":
      gradientClasses = document.documentElement.classList.contains('dark') 
        ? ['dark:from-blue-300', 'dark:via-blue-200', 'dark:to-blue-100']
        : ['from-blue-100', 'via-blue-50', 'to-white'];
      break;
    case "mist":
    case "fog":
    case "haze":
      gradientClasses = document.documentElement.classList.contains('dark') 
        ? ['dark:from-gray-600', 'dark:via-gray-500', 'dark:to-gray-400']
        : ['from-gray-300', 'via-gray-200', 'to-gray-100'];
      break;
    default:
      gradientClasses = document.documentElement.classList.contains('dark') 
        ? ['dark:from-slate-700', 'dark:via-slate-600', 'dark:to-slate-500']
        : ['from-slate-400', 'via-slate-300', 'to-slate-100'];
  }

  // Add the base gradient class and the new gradient colors
  body.classList.add('bg-gradient-to-br', ...gradientClasses);
}
