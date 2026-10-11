
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

const weatherCodes = {
  0: ["Clear sky", "☀️", "🌙"],
  1: ["Mainly clear", "🌤️", "🌙"],
  2: ["Partly cloudy", "⛅", "☁️"],
  3: ["Overcast", "☁️", "☁️"],
  45: ["Foggy", "🌫️", "🌫️"],
  48: ["Rime fog", "🌫️", "🌫️"],
  51: ["Light drizzle", "🌦️", "🌧️"],
  53: ["Moderate drizzle", "🌦️", "🌧️"],
  55: ["Dense drizzle", "🌧️", "🌧️"],
  56: ["Freezing drizzle", "🌧️", "🌧️"],
  57: ["Heavy freezing drizzle", "🌧️", "🌧️"],
  61: ["Light rain", "🌦️", "🌧️"],
  63: ["Moderate rain", "🌧️", "🌧️"],
  65: ["Heavy rain", "🌧️", "🌧️"],
  66: ["Freezing rain", "🌧️", "🌧️"],
  67: ["Heavy freezing rain", "🌧️", "🌧️"],
  71: ["Light snowfall", "🌨️", "🌨️"],
  73: ["Moderate snowfall", "🌨️", "🌨️"],
  75: ["Heavy snowfall", "❄️", "❄️"],
  77: ["Snow grains", "❄️", "❄️"],
  80: ["Light rain showers", "🌦️", "🌧️"],
  81: ["Moderate rain showers", "🌧️", "🌧️"],
  82: ["Violent rain showers", "⛈️", "⛈️"],
  85: ["Snow showers", "🌨️", "🌨️"],
  86: ["Heavy snow showers", "❄️", "❄️"],
  95: ["Thunderstorm", "⛈️", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️", "⛈️"],
  99: ["Severe thunderstorm with hail", "⛈️", "⛈️"]
};

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = "Loading...";
  message.textContent = "Fetching weather data...";
  weatherCard.hidden = true;

  try {
    // Find the city coordinates

    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Unable to search for the city.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the spelling.");
    }

    const place = geoData.results[0];

    //  Get current weather using coordinates

    const params = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "weather_code",
        "wind_speed_10m"
      ].join(","),
      timezone: "auto"
    });

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`
    );

    if (!weatherResponse.ok) {
      throw new Error("Unable to retrieve weather data.");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    if (!current) {
      throw new Error("Weather information is unavailable.");
    }

    //  Display the weather

    const weatherInfo = weatherCodes[current.weather_code] ||
      ["Unknown conditions", "🌍", "🌍"];

    document.getElementById("cityName").textContent =
      [place.name, place.admin1, place.country]
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(", ");

    document.getElementById("date").textContent =
      new Date(current.time).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }) + " (local time)";

    document.getElementById("temperature").textContent =
      `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("description").textContent =
      weatherInfo[0];

    document.getElementById("weatherIcon").textContent =
      weatherInfo[current.is_day ? 1 : 2];

    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
      `${current.wind_speed_10m} km/h`;

    document.getElementById("feelsLike").textContent =
      `${Math.round(current.apparent_temperature)}°C`;

    weatherCard.hidden = false;
    message.textContent = "Weather updated successfully!";
  } catch (error) {
    message.textContent =
      error.message || "Something went wrong. Please try again.";
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
});

// Show a default city's weather when the app opens

cityInput.value = "Delhi";
searchForm.requestSubmit();
