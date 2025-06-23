class TickerManager {
  constructor() {
    this.userTicker = "Welcome to the Airport Flight Information System!";
    this.userTickerDirection = "left";
    this.flightStatusUpdates = [];
    this.showDefaultTicker = true;
    this.userTickerSpeed = 60;
    this.userTickerFrequency = 20;
    this.showUserTicker = true;
  }

  createTicker() {
    const ticker = document.createElement("div");
    ticker.id = "ticker";
    ticker.innerHTML = `<span id="ticker-text">${this.userTicker}</span>`;
    document.body.appendChild(ticker);

    const tickerText = document.getElementById("ticker-text");
    let position =
      this.userTickerDirection === "left"
        ? window.innerWidth
        : -tickerText.offsetWidth;

    const moveTicker = () => {
      if (this.userTickerDirection === "left") {
        position -= this.userTickerSpeed / 10;
        if (position < -tickerText.offsetWidth) {
          position = window.innerWidth;
          this.updateTickerText();
        }
      } else {
        position += this.userTickerSpeed / 10;
        if (position > window.innerWidth) {
          position = -tickerText.offsetWidth;
          this.updateTickerText();
        }
      }
      tickerText.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(moveTicker);
    };

    moveTicker();
  }

  updateTickerText() {
    if (this.showDefaultTicker && this.flightStatusUpdates.length > 0) {
      if (this.showUserTicker) {
        document.getElementById("ticker-text").textContent = this.userTicker;
      } else {
        const latestUpdate = this.flightStatusUpdates.shift();
        this.flightStatusUpdates.push(latestUpdate);
        document.getElementById("ticker-text").textContent = latestUpdate;
      }
      this.showUserTicker = !this.showUserTicker;
    } else {
      document.getElementById("ticker-text").textContent = this.userTicker;
    }
  }

  addFlightStatusUpdate(flight, type) {
    const time = new Date(flight[type].scheduled).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const city =
      flight[type === "departure" ? "arrival" : "departure"].iata || "Unknown";
    const update = `Flight ${flight.flight.iata} ${
      type === "departure" ? "to" : "from"
    } ${city} is scheduled at ${time}.`;
    this.flightStatusUpdates.push(update);
  }

  updateConfiguration(config) {
    if (config.inputuserTickerText) {
      this.userTicker = config.inputuserTickerText;
      document.getElementById("ticker-text").textContent = this.userTicker;
    }

    if (config.userTickerDirection) {
      this.userTickerDirection = config.userTickerDirection;
    }

    if (config.userTickerSpeed) {
      this.userTickerSpeed = config.userTickerSpeed;
    }

    if (config.userTickerFrequency) {
      this.userTickerFrequency = config.userTickerFrequency;
    }

    if (config.showDefaultTicker !== undefined) {
      this.showDefaultTicker = config.showDefaultTicker === "true";
    }
  }
}

export default TickerManager;
