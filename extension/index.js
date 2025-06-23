let iataCodeCity = "";
let AIRPORT_LOCATION = "";
let flightStatusUpdates = [];
let showDefaultTicker = true;

function addFlightStatusUpdate(flight, type) {
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
  flightStatusUpdates.push(update);
}

function createChannel() {
  const channel = $vxt.createChannel($vxtSubChannelId);

  channel.subscribe("get", (response) => {
    console.log(response);

    if (response.error) {
      console.error("Error in response:", response.error);
      return;
    }

    const selectedIataCode = response.payload?.iataCodeCity || "WAW";

    updateAirportCode(selectedIataCode);

    if (response.payload?.showDefaultTicker !== undefined) {
      showDefaultTicker = response.payload.showDefaultTicker === "true";
    }

    console.log("Show Default Ticker:", showDefaultTicker);

    if (showDefaultTicker && flightStatusUpdates.length > 0) {
      const latestUpdate = flightStatusUpdates[flightStatusUpdates.length - 1];
      console.log("Latest Flight Status Update:", latestUpdate);
    }

    channel.publish("data", {
      type: "contents",
      payload: {
        categories: [
          {
            name: `Airport Flight Schedule for ${AIRPORT_LOCATION}`,
            displayMode: "grid",
          },
          {
            name: `Airport Flight Schedule - Departures for ${AIRPORT_LOCATION}`,
            displayMode: "grid",
          },
          {
            name: `Airport Flight Schedule - Arrivals for ${AIRPORT_LOCATION}`,
            displayMode: "grid",
          },
        ],
        content: [
          {
            resourceType: "content",
            resourceId: "FlightScheduleMain",
            resourceName: "Airport Flight Schedule",
            thumbnailPath: "https://i.imgur.com/XDU7y1T.png",
            isLandscape: true,
            category: `Airport Flight Schedule for ${AIRPORT_LOCATION}`,
            orientation: "landscape",
            keywords: "airport, main dashboard",
            config: {
              Configuration: [
                {
                  type: "hidden",
                  id: "template",
                  value: "flightScheduleMain",
                },
                {
                  type: "hidden",
                  id: "iataCodeCity",
                  value: iataCodeCity,
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value: "",
                  caption: "Flight Schedule Ticker Configuration",
                  size: "large",
                  position: "top",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Please input text which you want to paste in Ticker element of Flight schedule",
                  caption: "",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "text",
                  id: "inputuserTickerText",
                  caption: "",
                  value: "Welcome to the Airport Flight Information System!",
                  useTranslate: true,
                  multiLine: true,
                  charactersLimit: 300,
                  label: "Ticker Text",
                },
                {
                  type: "divider",
                  id: "extensionDivider",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Choose whether you want the default ticker information to scroll from left to right or from right to left.",
                  caption: "",
                  size: "mesdium",
                  position: "top",
                },
                {
                  type: "dropdown",
                  id: "userTickerDirection",
                  caption: "Show default ticker",
                  list: ["left", "right"],
                  value: "left",
                },
                {
                  type: "range",
                  id: "userTickerSpeed",
                  caption: "Select ticker speed",
                  min: 1,
                  max: 100,
                  step: 1,
                  value: 60,
                },
                {
                  type: "range",
                  id: "userTickerFrequency",
                  caption: "Select ticker frequency",
                  min: 1,
                  max: 60,
                  step: 1,
                  value: 20,
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Select true if you want to show the status of the flight in the ticker.",
                  caption: "",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "dropdown",
                  id: "showDefaultTicker",
                  caption: "Show default ticker",
                  list: ["false", "true"],
                  value: "true",
                },
                {
                  type: "divider",
                  id: "extensionDivider",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value: "",
                  caption: "Flight Schedule Table Configuration",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "range",
                  id: "rowsCount",
                  caption: "Select number of rows",
                  min: 1,
                  max: 30,
                  step: 1,
                  value: 15,
                },
              ],
            },
          },
          {
            resourceType: "content",
            resourceId: "FlightScheduleDepartures",
            resourceName: "Airport Flight Schedule - Departures",
            thumbnailPath: "https://i.imgur.com/XDU7y1T.png",
            isLandscape: true,
            category: `Airport Flight Schedule - Departures for ${AIRPORT_LOCATION}`,
            orientation: "landscape",
            keywords: "airport, departures",
            config: {
              Configuration: [
                {
                  type: "hidden",
                  id: "template",
                  value: "flightScheduleDepartures",
                },
                {
                  type: "hidden",
                  id: "iataCodeCity",
                  value: iataCodeCity,
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value: "",
                  caption: "Flight Schedule Ticker Configuration",
                  size: "large",
                  position: "top",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Please input text which you want to paste in Ticker element of Flight schedule",
                  caption: "",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "text",
                  id: "inputuserTickerText",
                  caption: "",
                  value: "Welcome to the Airport Flight Information System!",
                  useTranslate: true,
                  multiLine: true,
                  charactersLimit: 300,
                  label: "Ticker Text",
                },
                {
                  type: "divider",
                  id: "extensionDivider",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Choose whether you want the default ticker information to scroll from left to right or from right to left.",
                  caption: "",
                  size: "mesdium",
                  position: "top",
                },
                {
                  type: "dropdown",
                  id: "userTickerDirection",
                  caption: "Show default ticker",
                  list: ["left", "right"],
                  value: "left",
                },
                {
                  type: "range",
                  id: "userTickerSpeed",
                  caption: "Select ticker speed",
                  min: 1,
                  max: 100,
                  step: 1,
                  value: 60,
                },
                {
                  type: "range",
                  id: "userTickerFrequency",
                  caption: "Select ticker frequency",
                  min: 1,
                  max: 60,
                  step: 1,
                  value: 20,
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Select true if you want to show the status of the flight in the ticker.",
                  caption: "",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "dropdown",
                  id: "showDefaultTicker",
                  caption: "Show default ticker",
                  list: ["false", "true"],
                  value: "true",
                },
                {
                  type: "divider",
                  id: "extensionDivider",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value: "",
                  caption: "Flight Schedule Table Configuration",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "range",
                  id: "rowsCount",
                  caption: "Select number of rows",
                  min: 1,
                  max: 30,
                  step: 1,
                  value: 15,
                },
              ],
            },
          },
          {
            resourceType: "content",
            resourceId: "FlightScheduleArrivals",
            resourceName: "Airport Flight Schedule - Arrivals",
            thumbnailPath: "https://i.imgur.com/XDU7y1T.png",
            isLandscape: true,
            category: `Airport Flight Schedule - Arrivals for ${AIRPORT_LOCATION}`,
            orientation: "landscape",
            keywords: "airport, arrivals",
            config: {
              Configuration: [
                {
                  type: "hidden",
                  id: "template",
                  value: "flightScheduleArrivals",
                },
                {
                  type: "hidden",
                  id: "iataCodeCity",
                  value: iataCodeCity,
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value: "",
                  caption: "Flight Schedule Ticker Configuration",
                  size: "large",
                  position: "top",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Please input text which you want to paste in Ticker element of Flight schedule",
                  caption: "",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "text",
                  id: "inputuserTickerText",
                  caption: "",
                  value: "Welcome to the Airport Flight Information System!",
                  useTranslate: true,
                  multiLine: true,
                  charactersLimit: 300,
                  label: "Ticker Text",
                },
                {
                  type: "divider",
                  id: "extensionDivider",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Choose whether you want the default ticker information to scroll from left to right or from right to left.",
                  caption: "",
                  size: "mesdium",
                  position: "top",
                },
                {
                  type: "dropdown",
                  id: "userTickerDirection",
                  caption: "Show default ticker",
                  list: ["left", "right"],
                  value: "left",
                },
                {
                  type: "range",
                  id: "userTickerSpeed",
                  caption: "Select ticker speed",
                  min: 1,
                  max: 100,
                  step: 1,
                  value: 60,
                },
                {
                  type: "range",
                  id: "userTickerFrequency",
                  caption: "Select ticker frequency",
                  min: 1,
                  max: 60,
                  step: 1,
                  value: 20,
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value:
                    "Select true if you want to show the status of the flight in the ticker.",
                  caption: "",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "dropdown",
                  id: "showDefaultTicker",
                  caption: "Show default ticker",
                  list: ["false", "true"],
                  value: "true",
                },
                {
                  type: "divider",
                  id: "extensionDivider",
                },
                {
                  type: "message",
                  id: "welcomeMessageHeading",
                  value: "",
                  caption: "Flight Schedule Table Configuration",
                  size: "medium",
                  position: "top",
                },
                {
                  type: "range",
                  id: "rowsCount",
                  caption: "Select number of rows",
                  min: 1,
                  max: 30,
                  step: 1,
                  value: 15,
                },
              ],
            },
          },
        ],
      },
    });
  });
}

function updateAirportCode(selectedIataCode) {
  const iataToCityMapping = {
    WAW: "WARSAW",
    BCN: "BARCELONA",
    BER: "BERLIN",
    KE: "NAIROBI",
    DEL: "DELHI",
  };

  const city = iataToCityMapping[selectedIataCode] || "UNKNOWN";

  iataCodeCity = selectedIataCode;
  AIRPORT_LOCATION = city;

  if (document.getElementById("airport-code")) {
    document.getElementById("airport-code").textContent = iataCodeCity;
  }

  if (window.updateLocalWeather) {
    updateLocalWeather();
  }
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
