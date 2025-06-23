import {
  getCityNameFromIATA,
  formatFlightTime,
  isUpcomingFlight,
  sortFlightsByTime,
  generateRandomGate,
  getRandomFlightStatus,
} from "./utils.js";
import FlightService from "./flightService.js";

class FlightTableManager {
  constructor(tickerManager) {
    this.flightService = new FlightService();
    this.tickerManager = tickerManager;
    this.departureTableBody = document.querySelector("#departure-table tbody");
    this.arrivalTableBody = document.querySelector("#arrival-table tbody");
    this.gateCache = {};
  }

  setRowsCount(count) {
    this.rowsCount = count;
  }

  async updateDepartureTable(flights) {
    const currentTime = new Date();
    let upcomingFlights = flights.filter((flight) =>
      isUpcomingFlight(flight.departure.scheduled)
    );

    if (upcomingFlights.length === 0) {
      upcomingFlights = [...flights];
    }

    upcomingFlights = sortFlightsByTime(upcomingFlights, "departure");
    this.departureTableBody.innerHTML = "";

    const uniqueFlights = [];
    const seenFlightNo = new Set();

    for (const flight of upcomingFlights) {
      if (uniqueFlights.length >= this.rowsCount) break;

      const flightTime = formatFlightTime(flight.departure.scheduled);
      const iataCode = flight.arrival.iata || "Unknown";
      const destinationCity = getCityNameFromIATA(iataCode);
      const airlineCode = flight.flight.iata.slice(0, 2);
      const airlineIcon = await this.flightService.fetchAirlineIcon(
        airlineCode
      );

      if (flight.departure.gate) {
        this.gateCache[flight.flight.iata] = flight.departure.gate;
      } else if (!this.gateCache[flight.flight.iata]) {
        this.gateCache[flight.flight.iata] = generateRandomGate();
      }

      const gate = this.gateCache[flight.flight.iata];
      const { status, statusClass } = getRandomFlightStatus();

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

      this.departureTableBody.appendChild(row);
      uniqueFlights.push(flight);
      seenFlightNo.add(flight.flight.iata);
      this.tickerManager.addFlightStatusUpdate(flight, "departure");
    }
  }

  async updateArrivalTable(flights) {
    let upcomingFlights = flights.filter((flight) =>
      isUpcomingFlight(flight.arrival.scheduled, true)
    );

    if (upcomingFlights.length === 0) {
      upcomingFlights = [...flights];
    }

    upcomingFlights = sortFlightsByTime(upcomingFlights, "arrival");
    this.arrivalTableBody.innerHTML = "";

    const uniqueFlights = [];
    for (const flight of upcomingFlights) {
      if (uniqueFlights.length >= this.rowsCount) break;

      const flightTime = formatFlightTime(flight.arrival.scheduled);
      const iataCode = flight.arrival.iata || "Unknown";
      const departureCity = getCityNameFromIATA(iataCode);
      const airlineCode = flight.flight.iata
        ? flight.flight.iata.slice(0, 2)
        : "XX";
      const airlineIcon = await this.flightService.fetchAirlineIcon(
        airlineCode
      );

      if (flight.arrival.gate) {
        this.gateCache[flight.flight.iata] = flight.arrival.gate;
      } else if (!this.gateCache[flight.flight.iata]) {
        this.gateCache[flight.flight.iata] = generateRandomGate();
      }

      const gate = this.gateCache[flight.flight.iata];
      const { status, statusClass } = getRandomFlightStatus();

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

      this.arrivalTableBody.appendChild(row);
      uniqueFlights.push(flight);
      this.tickerManager.addFlightStatusUpdate(flight, "arrival");
    }
  }

async updateTableDisplay() {
  const allFlights = await this.flightService.fetchFlights();
  const departures = allFlights.filter(f => f.departure && f.departure.scheduled);
  const arrivals = allFlights.filter(f => f.arrival && f.arrival.scheduled);

  await this.updateDepartureTable(departures);
  await this.updateArrivalTable(arrivals);
}
}

export default FlightTableManager;
