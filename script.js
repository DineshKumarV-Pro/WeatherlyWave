const apiKey = 'caf87105fd3f266bec4127269ded93b4';

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (city === "") return alert("Please enter a city name");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    document.getElementById("cityName").innerText = data.name;
    document.getElementById("description").innerText = data.weather[0].description;
    document.getElementById("temperature").innerText = `${data.main.temp} °C`;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    document.getElementById("weatherResult").classList.remove("hidden");
  } catch (error) {
    alert("Error fetching weather: " + error.message);
  }
}
