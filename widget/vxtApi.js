import { IATA_TO_CITY_MAPPING } from "./config.js";

class VxtApiManager {
  constructor(tickerManager, flightTableManager, weatherService) {
    this.tickerManager = tickerManager;
    this.flightTableManager = flightTableManager;
    this.weatherService = weatherService;
    this.iataCodeCity = null;
    this.airportLocation = null;
    this.userPrompt = null;
  }

  processUserInput(rawPrompt) {
    let prompt = rawPrompt.replaceAll(" ", "");
    if (prompt && prompt !== this.userPrompt) {
      this.updateAirportCode(prompt);
      this.userPrompt = prompt;
    }
  }

  updateAirportCode(selectedCode) {
    if (IATA_TO_CITY_MAPPING[selectedCode]) {
      this.iataCodeCity = selectedCode;
      this.airportLocation = IATA_TO_CITY_MAPPING[selectedCode];
      document.getElementById("airport-code").textContent = this.iataCodeCity;
      this.weatherService.updateLocalWeather(this.airportLocation);
    } else {
      console.warn(`Unknown IATA code: ${selectedCode}`);
    }
  }

  updateTamplate(template) {
    const departuresSection = document.getElementById("departures-section");
    const arrivalsSection = document.getElementById("arrivals-section");

    if (!departuresSection || !arrivalsSection) return;

    if (template === "flightScheduleMain") {
      departuresSection.style.display = "";
      arrivalsSection.style.display = "";
    } else if (template === "flightScheduleDepartures") {
      departuresSection.style.display = "";
      arrivalsSection.style.display = "none";
    } else if (template === "flightScheduleArrivals") {
      departuresSection.style.display = "none";
      arrivalsSection.style.display = "";
    }
  }

  createChannel() {
    const channel = $vxt.createChannel($vxtSubChannelId);

    channel.subscribe("config", (response) => {
      console.log(response);
      if (response.data && response.data.Configuration) {
        const config = response.data.Configuration;

        localStorage.setItem("flightWidgetConfig", JSON.stringify(config));

        if (config.iataCodeCity) {
          this.updateAirportCode(config.iataCodeCity);
        }

        this.tickerManager.updateConfiguration(config);

        if (config.template) {
          this.updateTamplate(config.template);
        }

        if (config.rowsCount) {
          this.flightTableManager.setRowsCount(config.rowsCount);
        }

        this.flightTableManager.updateTableDisplay();
      }
    });

    channel.subscribe("playstate", (response) => console.log(response.type));
    channel.subscribe("vxtstate", (response) => console.log(response.type));

    console.log("[WiNE API] channel created", $vxtSubChannelId);
  }

  waitForVxtApi() {
    const interval = setInterval(() => {
      if (window.$vxt) {
        clearInterval(interval);
        this.createChannel();
      }
    }, 100);
  }

initialize() {
  const savedConfig = localStorage.getItem("flightWidgetConfig");
  if (savedConfig) {
    const config = JSON.parse(savedConfig);

    if (config.iataCodeCity) {
      this.updateAirportCode(config.iataCodeCity);
    }

    this.tickerManager.updateConfiguration(config);

    if (config.template) {
      this.updateTamplate(config.template);
    }

    if (config.rowsCount) {
      this.flightTableManager.setRowsCount(config.rowsCount);
    }

    this.flightTableManager.updateTableDisplay();
  }

  this.waitForVxtApi();
}
}

export default VxtApiManager;
