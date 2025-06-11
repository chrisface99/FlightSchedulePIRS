const FILE_URL =
  "https://canvas.samsungvx.com/organizations/23599CF5-F41D-471A-97F1-6F3872F2A44C/partners/F4A4F3BE-182C-4A0F-AEFB-A9A3F66E62E6/widget/flights.json";
const OPENWEATHER_API_KEY = "d34469173c876dc3e734f40f63a5aa5c";
const OPENWEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&lang=pl&q=";
const ARRIVAL_FILE_URL =
  "https://canvas.samsungvx.com/organizations/23599CF5-F41D-471A-97F1-6F3872F2A44C/partners/F4A4F3BE-182C-4A0F-AEFB-A9A3F66E62E6/widget/flights.json";

const departureTableBody = document.querySelector("#departure-table tbody");
const arrivalTableBody = document.querySelector("#arrival-table tbody");

let iataCodeCity;
let AIRPORT_LOCATION;

const iataToCityMapping = {
  WAW: "WARSAW",
  BCN: "BARCELONA",
  BER: "BERLIN",
  KE: "NAIROBI",
  DEL: "DELHI",
};

let userPrompt;

function processUserInput(rawPrompt) {
  let prompt = rawPrompt.replaceAll(" ", "");
  if (prompt && prompt !== userPrompt) {
    updateAirportCode(prompt);
    userPrompt = prompt;
  }
}

function updateAirportCode(selectedCode) {
  if (iataToCityMapping[selectedCode]) {
    iataCodeCity = selectedCode;
    AIRPORT_LOCATION = iataToCityMapping[selectedCode];
    document.getElementById("airport-code").textContent = iataCodeCity;
    updateLocalWeather();
  } else {
    console.warn(`Unknown IATA code: ${selectedCode}`);
  }
}

let rowsCount = 15;

function adjustVisibleRows() {
  return rowsCount;
}

function createChannel() {
  const channel = $vxt.createChannel($vxtSubChannelId);

  channel.subscribe("config", (response) => {
    console.log(response);
    if (response.data && response.data.Configuration) {
      const config = response.data.Configuration;

      if (config.iataCodeCity) {
        updateAirportCode(config.iataCodeCity);
      }

      if (config.inputuserTickerText) {
        userTicker = config.inputuserTickerText;
        document.getElementById("ticker-text").textContent = userTicker;
      }

      if (config.userTickerDirection) {
        userTickerDirection = config.userTickerDirection;
      }

      if (config.userTickerSpeed) {
        userTickerSpeed = config.userTickerSpeed;
      }

      if (config.userTickerFrequency) {
        userTickerFrequency = config.userTickerFrequency;
      }

      if (config.showDefaultTicker !== undefined) {
        showDefaultTicker = config.showDefaultTicker === "true";
      }

      if (config.rowsCount) {
        rowsCount = config.rowsCount;
      }

      updateTableDisplay();
    }
  });

  channel.subscribe("playstate", (response) => console.log(response.type));
  channel.subscribe("vxtstate", (response) => console.log(response.type));

  console.log("[WiNE API] channel created", $vxtSubChannelId);
}

function waitForVxtApi() {
  const interval = setInterval(() => {
    if (window.$vxt) {
      clearInterval(interval);
      createChannel(); 
    }
  }, 100);
}

waitForVxtApi();

let userTicker = "Welcome to the Airport Flight Information System!";
let userTickerDirection = "left"; 
let flightStatusUpdates = []; 
let showDefaultTicker = true; 
let userTickerSpeed = 60; 
let userTickerFrequency = 20; 

let showUserTicker = true; 

function createTicker() {
  const ticker = document.createElement("div");
  ticker.id = "ticker";
  ticker.innerHTML = `<span id="ticker-text">${userTicker}</span>`;
  document.body.appendChild(ticker);

  const tickerText = document.getElementById("ticker-text");
  let position =
    userTickerDirection === "left"
      ? window.innerWidth
      : -tickerText.offsetWidth;

  function moveTicker() {
    if (userTickerDirection === "left") {
      position -= userTickerSpeed / 10;
      if (position < -tickerText.offsetWidth) {
        position = window.innerWidth;
        updateTickerText(); 
      }
    } else {
      position += userTickerSpeed / 10;
      if (position > window.innerWidth) {
        position = -tickerText.offsetWidth;
        updateTickerText(); 
      }
    }
    tickerText.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(moveTicker);
  }

  moveTicker();
}

function updateTickerText() {
  if (showDefaultTicker && flightStatusUpdates.length > 0) {
    if (showUserTicker) {
      document.getElementById("ticker-text").textContent = userTicker;
    } else {
      const latestUpdate = flightStatusUpdates.shift(); 
      flightStatusUpdates.push(latestUpdate);
      document.getElementById("ticker-text").textContent = latestUpdate;
    }
    showUserTicker = !showUserTicker; 
  } else {
    document.getElementById("ticker-text").textContent = userTicker;
  }
}

function addFlightStatusUpdate(flight, type) {
  const time = new Date(flight[type].scheduled).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const city =
    flight[type === "departure" ? "arrival" : "departure"].iata || "Unknown";
  const update = `Flight ${flight.flight.iata} ${type === "departure" ? "to" : "from"
    } ${city} is scheduled at ${time}.`;
  flightStatusUpdates.push(update);
}

document.getElementById("airport-code").textContent = iataCodeCity;

function updateClock() {
  const now = new Date();
  const options = { weekday: "long" };
  document.getElementById("current-day").textContent = now.toLocaleDateString(
    "en-US",
    options
  );
  document.getElementById("current-date").textContent = now.toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );
  document.getElementById("current-time").textContent = now.toLocaleTimeString(
    "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  );
}

async function updateLocalWeather() {
  try {
    const response = await fetch(
      `${OPENWEATHER_URL}${AIRPORT_LOCATION}&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    if (data.main && data.weather) {
      document.getElementById("current-temp").textContent = `${Math.round(
        data.main.temp
      )}°`;
      document.getElementById("weather-condition").textContent =
        data.weather[0].main;

      const weatherIcon = document.querySelector(".weather-icon");
      const weatherCondition = data.weather[0].main.toLowerCase();

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
  } catch (error) {
    console.error("Error fetching local weather:", error);
  }
}

async function fetchFlights() {
  try {
    const response = await fetch(FILE_URL);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return [];
  }
}

async function fetchArrivals() {
  try {
    const response = await fetch(ARRIVAL_FILE_URL);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching arrival data:", error);
    return [];
  }
}

const weatherCache = {};

async function fetchWeather(city) {
  const now = Date.now();

  if (weatherCache[city] && now - weatherCache[city].timestamp < 3600000) {
    return weatherCache[city].data;
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_URL}${city}&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    if (data.main && data.weather) {
      const weatherData = {
        temp: `${Math.round(data.main.temp)}°C`,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      };

      weatherCache[city] = { data: weatherData, timestamp: now };

      return weatherData;
    }
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
  }

  return { temp: "N/A", icon: "" };
}

const gateCache = {};

const statusOptions = ["On Time", "Boarding", "Delayed", "Cancelled"];
const statusClasses = ["on-time", "boarding", "delayed", "cancelled"];

async function fetchAirlineIcon(airlineCode) {
  const primaryUrl = `https://canvas.samsungvx.com/organizations/23599CF5-F41D-471A-97F1-6F3872F2A44C/partners/F4A4F3BE-182C-4A0F-AEFB-A9A3F66E62E6/widget/icons/${airlineCode}.svg`;
  const fallbackUrl = `https://canvas.samsungvx.com/organizations/23599CF5-F41D-471A-97F1-6F3872F2A44C/partners/F4A4F3BE-182C-4A0F-AEFB-A9A3F66E62E6/widget/icons/${airlineCode}.svg`; 

  try {
    const response = await fetch(primaryUrl);
    if (response.ok) {
      return primaryUrl;
    } else {
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        return fallbackUrl;
      }
    }
  } catch (error) {
    console.error(`Error fetching airline icon for ${airlineCode}:`, error);
  }
  return ""; 
}

async function updateDepartureTable(flights) {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  let upcomingFlights = flights.filter((flight) => {
    const flightTime = new Date(flight.departure.scheduled);
    const flightHour = flightTime.getHours();
    const flightMinutes = flightTime.getMinutes();
    return (
      flightHour > currentHour ||
      (flightHour === currentHour && flightMinutes >= currentMinutes)
    );
  });

  if (upcomingFlights.length === 0) {
    upcomingFlights = [...flights];
  }

  upcomingFlights.sort((a, b) => {
    const timeA = new Date(a.departure.scheduled);
    const timeB = new Date(b.departure.scheduled);
    return timeA - timeB;
  });

  departureTableBody.innerHTML = "";

  const uniqueFlights = [];
  const seenFlightNo = new Set();

  for (const flight of upcomingFlights) {
    if (uniqueFlights.length >= rowsCount) break; 

    const flightTime = new Date(flight.departure.scheduled).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );

    const iataCode = flight.arrival.iata || "Unknown";
    const destinationCity = getCityNameFromIATA(iataCode);

    const airlineCode = flight.flight.iata.slice(0, 2);
    const airlineIcon = await fetchAirlineIcon(airlineCode);

    if (flight.departure.gate) {
      gateCache[flight.flight.iata] = flight.departure.gate;
    } else if (!gateCache[flight.flight.iata]) {
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 7)); 
      const number = Math.floor(Math.random() * 20) + 1; 
      gateCache[flight.flight.iata] = `${letter}${number}`;
    }

    const gate = gateCache[flight.flight.iata];

    const randomStatusIndex = Math.floor(Math.random() * statusOptions.length);
    const status = statusOptions[randomStatusIndex];
    const statusClass = statusClasses[randomStatusIndex];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${flightTime}</td>
      <td>${destinationCity} (${iataCode})</td>
      <td>
        <img src="${airlineIcon}" alt="${airlineCode}" class="airline-icon">
        ${flight.flight.iata || "N/A"}
      </td>
      <td>${gate}</td>
      <td class="${statusClass}">${status}</td>
    `;

    departureTableBody.appendChild(row);
    uniqueFlights.push(flight);
    seenFlightNo.add(flight.flight.iata); 
    addFlightStatusUpdate(flight, "departure"); 
  }
}

const iataCityMapping = [
  { iata: "WAW", city: "Warsaw" },
  { iata: "JFK", city: "New York" },
  { iata: "LHR", city: "London" },
  { iata: "CDG", city: "Paris" },
  { iata: "FRA", city: "Frankfurt" },
  { iata: "DXB", city: "Dubai" },
  { iata: "HND", city: "Tokyo" },
  { iata: "SIN", city: "Singapore" },
  { iata: "SYD", city: "Sydney" },
  { iata: "PEK", city: "Beijing" },
  { iata: "DOH", city: "Doha" },
  { iata: "BEG", city: "Belgrade" },
  { iata: "BUD", city: "Budapest" },
  { iata: "ALC", city: "Alicante" },
  { iata: "ATH", city: "Athens" },
  { iata: "BRU", city: "Brussels" },
  { iata: "AMS", city: "Amsterdam" },
  { iata: "ZRH", city: "Zurich" },
  { iata: "CPH", city: "Copenhagen" },
  { iata: "CTA", city: "Catania" },
  { iata: "AYT", city: "Antalya" },
  { iata: "BER", city: "Berlin" },
  { iata: "CXR", city: "Nha Trang" },
  { iata: "BCN", city: "Barcelona" },
  { iata: "BOM", city: "Mumbai" },
  { iata: "ARN", city: "Stockholm" },
  { iata: "BLL", city: "Billund" }, 
  { iata: "CAI", city: "Cairo" }, 
  { iata: "DWC", city: "Dubai" }, 
  { iata: "CGN", city: "Cologne" }, 
];

function getCityNameFromIATA(iata) {
  const mapping = iataCityMapping.find((entry) => entry.iata === iata);
  return mapping ? mapping.city : "Unknown City";
}

async function updateArrivalTable(flights) {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  let upcomingFlights = flights.filter((flight) => {
    const flightTime = new Date(flight.arrival.scheduled);
    const flightHour = flightTime.getHours();
    const flightMinutes = flightTime.getMinutes();
    return (
      flightHour > currentHour ||
      (flightHour === currentHour && flightMinutes >= currentMinutes)
    );
  });

  if (upcomingFlights.length === 0) {
    upcomingFlights = [...flights];
  }

  upcomingFlights.sort((a, b) => {
    const timeA = new Date(a.arrival.scheduled);
    const timeB = new Date(b.arrival.scheduled);
    return timeA - timeB;
  });

  arrivalTableBody.innerHTML = "";

  const uniqueFlights = [];
  for (const flight of upcomingFlights) {
    if (uniqueFlights.length >= rowsCount) break; 

    const flightTime = new Date(flight.arrival.scheduled).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );

    const iataCode = flight.arrival.iata || "Unknown";
    const departureCity = getCityNameFromIATA(iataCode);

    const airlineCode = flight.flight.iata
      ? flight.flight.iata.slice(0, 2)
      : "XX";
    const airlineIcon = await fetchAirlineIcon(airlineCode);

    if (flight.arrival.gate) {
      gateCache[flight.flight.iata] = flight.arrival.gate;
    } else if (!gateCache[flight.flight.iata]) {
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 7)); 
      const number = Math.floor(Math.random() * 20) + 1; 
      gateCache[flight.flight.iata] = `${letter}${number}`;
    }

    const gate = gateCache[flight.flight.iata];

    const randomStatusIndex = Math.floor(Math.random() * statusOptions.length);
    const status = statusOptions[randomStatusIndex];
    const statusClass = statusClasses[randomStatusIndex];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${flightTime}</td>
      <td>${departureCity} (${iataCode})</td>
      <td>
        <img src="${airlineIcon}" alt="${airlineCode}" class="airline-icon">
        ${flight.flight.iata || "N/A"}
      </td>
      <td>${gate}</td>
      <td class="${statusClass}">${status}</td>
    `;

    arrivalTableBody.appendChild(row);
    uniqueFlights.push(flight);
    addFlightStatusUpdate(flight, "arrival"); 
  }
}

function updateTableDisplay() {
  fetchFlights().then(updateDepartureTable);
  fetchArrivals().then(updateArrivalTable);
}

async function init() {
  createTicker(); 
  updateClock();
  setInterval(updateClock, 1000);

  await updateLocalWeather();
  setInterval(updateLocalWeather, 600000); 

  const flights = await fetchFlights();
  const arrivals = await fetchArrivals();
  updateDepartureTable(flights);
  updateArrivalTable(arrivals);

  setInterval(async () => {
    const updatedFlights = await fetchFlights();
    const updatedArrivals = await fetchArrivals();
    updateDepartureTable(updatedFlights);
    updateArrivalTable(updatedArrivals);
  }, 60000); 
}

window.addEventListener("resize", () => {
  location.reload(); 
});

init();
