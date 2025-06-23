class ClockManager {
  constructor() {
    this.intervalId = null;
  }

  updateClock() {
    const now = new Date();
    const options = { weekday: "long" };

    document.getElementById("current-day").textContent = now.toLocaleDateString(
      "en-US",
      options
    );

    document.getElementById("current-date").textContent =
      now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    document.getElementById("current-time").textContent =
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
  }

  startClock() {
    this.updateClock();

    this.intervalId = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  stopClock() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default ClockManager;
