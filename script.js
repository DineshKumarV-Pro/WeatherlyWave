const apiKey = "caf87105fd3f266bec4127269ded93b4";
    let debounceTimer;

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

    // Format current date
    function formatDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date().toLocaleDateString('en-US', options);
    }

    // Format time from timestamp
    function formatTime(timestamp, timezone) {
      const date = new Date((timestamp + timezone) * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      if (!city) {
        showError('Please enter a city name');
        return;
      }
      
      document.getElementById('suggestions').classList.add('hidden');
      clearErrors();
      
      const button = document.getElementById('searchButton');
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner spinner mr-2"></i> Searching...';
      button.disabled = true;
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'City not found. Please check the spelling.' : 'Weather data unavailable. Please try again later.');
        }
        
        const data = await response.json();
        displayWeather(data);
      } catch (error) {
        showError(error.message);
      } finally {
        button.innerHTML = originalText;
        button.disabled = false;
      }
    }

    // Display weather data
    function displayWeather(data) {
      // Update basic info
      document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
      document.getElementById('currentDate').textContent = formatDate();
      document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
      document.getElementById('description').textContent = data.weather[0].description;
      document.getElementById('humidity').textContent = `${data.main.humidity}%`;
      document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
      document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
      document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
      document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
      document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise, data.timezone);
      document.getElementById('sunset').textContent = formatTime(data.sys.sunset, data.timezone);
      document.getElementById('cloudiness').textContent = `${data.clouds.all}%`;

      // Set weather icon using Font Awesome
      const iconCode = data.weather[0].icon;
      const weatherIcon = document.getElementById('weatherIcon');
      
      // Clear all existing classes
      weatherIcon.className = 'fas animate-float text-5xl sm:text-6xl';
      
      // Add appropriate icon class based on weather condition
      if (iconCode === '01d') {
        weatherIcon.classList.add('fa-sun');
        weatherIcon.style.color = '#FBBF24'; // Yellow for sun
      } else if (iconCode === '01n') {
        weatherIcon.classList.add('fa-moon');
        weatherIcon.style.color = '#4B5563'; // Gray for moon
      } else if (iconCode === '02d') {
        weatherIcon.classList.add('fa-cloud-sun');
      } else if (iconCode === '02n') {
        weatherIcon.classList.add('fa-cloud-moon');
      } else if (iconCode.startsWith('03') || iconCode.startsWith('04')) {
        weatherIcon.classList.add('fa-cloud');
      } else if (iconCode.startsWith('09') || iconCode.startsWith('10')) {
        weatherIcon.classList.add('fa-cloud-rain');
      } else if (iconCode.startsWith('11')) {
        weatherIcon.classList.add('fa-bolt');
      } else if (iconCode.startsWith('13')) {
        weatherIcon.classList.add('fa-snowflake');
      } else if (iconCode.startsWith('50')) {
        weatherIcon.classList.add('fa-smog');
      } else {
        // Default icon
        weatherIcon.classList.add('fa-cloud');
      }
      
      // Show the weather card with animation
      document.getElementById('weatherResult').classList.remove('hidden');
    }

    // Initialize the app
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
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
    });