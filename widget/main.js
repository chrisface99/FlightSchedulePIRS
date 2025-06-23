import { CONFIG } from "./config.js";
import WeatherService from "./weatherService.js";
import FlightService from "./flightService.js";
import TickerManager from "./ticker.js";
import FlightTableManager from "./flightTable.js";
import VxtApiManager from "./vxtApi.js";
import ClockManager from "./clock.js";

class AirportApp {
  constructor() {
    this.weatherService = new WeatherService();
    this.flightService = new FlightService();
    this.tickerManager = new TickerManager();
    this.flightTableManager = new FlightTableManager(this.tickerManager);
    this.vxtApiManager = new VxtApiManager(
      this.tickerManager,
      this.flightTableManager,
      this.weatherService
    );
    this.clockManager = new ClockManager();

    this.dataRefreshInterval = null;
    this.weatherRefreshInterval = null;
  }

  async init() {
    this.tickerManager.createTicker();
    this.clockManager.startClock();
    this.vxtApiManager.initialize();
    await this.weatherService.updateLocalWeather("");
    await this.flightTableManager.updateTableDisplay();
    this.setupRefreshIntervals();
    this.setupEventListeners();
    console.log("Airport Flight Information System initialized");
  }

  setupRefreshIntervals() {
    this.weatherRefreshInterval = setInterval(async () => {
      if (this.vxtApiManager.airportLocation) {
        await this.weatherService.updateLocalWeather(
          this.vxtApiManager.airportLocation
        );
      }
    }, CONFIG.WEATHER_REFRESH_INTERVAL);

    this.dataRefreshInterval = setInterval(async () => {
      await this.flightTableManager.updateTableDisplay();
    }, CONFIG.DATA_REFRESH_INTERVAL);
  }

  setupEventListeners() {
    // window.addEventListener("resize", () => {
    //   location.reload();
    // });
  }

  destroy() {
    if (this.dataRefreshInterval) {
      clearInterval(this.dataRefreshInterval);
    }

    if (this.weatherRefreshInterval) {
      clearInterval(this.weatherRefreshInterval);
    }

    this.clockManager.stopClock();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new AirportApp();
  app.init().catch((error) => {
    console.error("Failed to initialize Airport App:", error);
  });

  window.airportApp = app;
});

window.addEventListener("beforeunload", () => {
  if (window.airportApp) {
    window.airportApp.destroy();
  }
});
