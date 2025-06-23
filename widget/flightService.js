import { CONFIG } from "./config.js";

class FlightService {
  async fetchFlights() {
    try {
      const response = await fetch(CONFIG.FILE_URL);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching flight data:", error);
      return [];
    }
  }

  async fetchArrivals() {
    try {
      const response = await fetch(CONFIG.FILE_URL);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching arrival data:", error);
      return [];
    }
  }

  async fetchAirlineIcon(airlineCode) {
    const iconUrl = `${CONFIG.AIRLINE_ICON_BASE_URL}${airlineCode}.svg`;

    try {
      const response = await fetch(iconUrl);
      if (response.ok) {
        return iconUrl;
      }
    } catch (error) {
      console.error(`Error fetching airline icon for ${airlineCode}:`, error);
    }
    return "";
  }
}

export default FlightService;
