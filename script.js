const apiKey = "caf87105fd3f266bec4127269ded93b4";

      async function getWeather() {
        const city = document.getElementById("cityInput").value.trim();
        if (!city) return alert("Please enter a city name");

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("City not found");

          const data = await res.json();

          document.getElementById("cityName").innerText = data.name;
          document.getElementById("description").innerText = data.weather[0].description;
          document.getElementById("temperature").innerText = `${data.main.temp} °C`;

          // Load animated weather icon
          const iconCode = data.weather[0].icon;
          const animatedIcons = {
            "01d": "https://www.amcharts.com/wp-content/uploads/2019/04/sun.svg",
            "01n": "https://www.amcharts.com/wp-content/uploads/2019/04/moon.svg",
            "02d": "https://www.amcharts.com/wp-content/uploads/2019/04/cloudy-day-1.svg",
            "02n": "https://www.amcharts.com/wp-content/uploads/2019/04/cloudy-night-1.svg",
            "03d": "https://www.amcharts.com/wp-content/uploads/2019/04/cloudy.svg",
            "03n": "https://www.amcharts.com/wp-content/uploads/2019/04/cloudy.svg",
            "04d": "https://www.amcharts.com/wp-content/uploads/2019/04/cloudy.svg",
            "04n": "https://www.amcharts.com/wp-content/uploads/2019/04/cloudy.svg",
            "09d": "https://www.amcharts.com/wp-content/uploads/2019/04/rainy-6.svg",
            "09n": "https://www.amcharts.com/wp-content/uploads/2019/04/rainy-6.svg",
            "10d": "https://www.amcharts.com/wp-content/uploads/2019/04/rainy-3.svg",
            "10n": "https://www.amcharts.com/wp-content/uploads/2019/04/rainy-5.svg",
            "11d": "https://www.amcharts.com/wp-content/uploads/2019/04/thunder.svg",
            "11n": "https://www.amcharts.com/wp-content/uploads/2019/04/thunder.svg",
            "13d": "https://www.amcharts.com/wp-content/uploads/2019/04/snowy-6.svg",
            "13n": "https://www.amcharts.com/wp-content/uploads/2019/04/snowy-6.svg",
            "50d": "https://www.amcharts.com/wp-content/uploads/2019/04/mist.svg",
            "50n": "https://www.amcharts.com/wp-content/uploads/2019/04/mist.svg",
          };

          document.getElementById("weatherIcon").src = animatedIcons[iconCode] || "";

          document.getElementById("weatherResult").classList.remove("hidden");
        } catch (error) {
          alert("Error: " + error.message);
        }
      }