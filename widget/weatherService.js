import { CONFIG } from "./config.js";

class WeatherService {
  constructor() {
    this.weatherCache = {};
  }

  async fetchWeather(city) {
    const now = Date.now();

    if (
      this.weatherCache[city] &&
      now - this.weatherCache[city].timestamp < CONFIG.WEATHER_CACHE_TTL
    ) {
      return this.weatherCache[city].data;
    }

    try {
      const response = await fetch(
        `${CONFIG.OPENWEATHER_URL}${city}&appid=${CONFIG.OPENWEATHER_API_KEY}`
      );
      const data = await response.json();

      if (data.main && data.weather) {
        const weatherData = {
          temp: `${Math.round(data.main.temp)}°C`,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
        };

        this.weatherCache[city] = { data: weatherData, timestamp: now };
        return weatherData;
      }
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
    }

    return { temp: "N/A", icon: "" };
  }

  async updateLocalWeather(location) {
    try {
      const response = await fetch(
        `${CONFIG.OPENWEATHER_URL}${location}&appid=${CONFIG.OPENWEATHER_API_KEY}`
      );
      const data = await response.json();

      if (data.main && data.weather) {
        document.getElementById("current-temp").textContent = `${Math.round(
          data.main.temp
        )}°`;
        document.getElementById("weather-condition").textContent =
          data.weather[0].main;

        this.updateWeatherIcon(data.weather[0].main.toLowerCase());
      }
    } catch (error) {
      console.error("Error fetching local weather:", error);
    }
  }

  updateWeatherIcon(weatherCondition) {
    const weatherIcon = document.querySelector(".weather-icon");

    if (weatherCondition.includes("clear")) {
      weatherIcon.textContent = "☀️";
    } else if (weatherCondition.includes("cloud")) {
      weatherIcon.textContent = "☁️";
    } else if (
      weatherCondition.includes("rain") ||
      weatherCondition.includes("drizzle")
    ) {
      weatherIcon.textContent = "🌧️";
    } else if (weatherCondition.includes("snow")) {
      weatherIcon.textContent = "❄️";
    } else if (weatherCondition.includes("thunderstorm")) {
      weatherIcon.textContent = "⛈️";
    } else {
      weatherIcon.textContent = "🌤️";
    }
  }
}

export default WeatherService;
