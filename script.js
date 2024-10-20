const searchButton = document.getElementById("search-button");
const searchBar = document.getElementById("search-bar");
const region = document.querySelector(".location h2");
const temperature = document.querySelector(".temperature h1");
const weatherImgToday = document.getElementById("weather-img-today");
const weatherNameToday = document.getElementById("weather-name-today");
const sunriseTime = document.getElementById("sunrise");
const sunsetTime = document.getElementById("sunset");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const windDiretion = document.getElementById("air-dir");
const pressure = document.getElementById("air-speed");
const dateToday = document.getElementById("date");
const locationButton = document.getElementById("location-button");
let locationApi = "Hasilpur";

fetchCurrentWeather(locationApi);
// to get user ip

locationButton.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      let currentLocation = `${latitude},${longitude}`;
      await fetchCurrentWeather(currentLocation);
      searchBar.value = "";
      // Fetch weather data using WeatherAPI
    },
    (error) => {
      // User has denied location access or an error occurred
      if (error.code === error.PERMISSION_DENIED) {
        showErrorpermanet(
          "You have denied location access. Please enable it from your browser settings.<br>Then again click here."
        );
      } else {
        console.error("Error occurred:", error.message);
      }
    },
    {
      enableHighAccuracy: true,
    }
  );
});

// To get location from searchbar
searchButton.addEventListener("click", function () {
  const value = searchBar.value;
  if (value !== "") {
    fetchCurrentWeather(value);
  }
});
searchBar.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    const value = searchBar.value;
    if (value !== "") {
      fetchCurrentWeather(value);
    }
  }
});

// when user clik on body while an error displaying then eroor display will none.
window.addEventListener("click", function (event) {
  const errorBox = document.getElementById("error-box");
  if (event.target === errorBox) {
    errorBox.style.display = "none";
  }
});

async function fetchCurrentWeather(location) {
  // fetching current weather data without sunrise and sunset
  try {
    showSpinner();
    const response = await fetch(
      `https://foam-cerulean-globeflower.glitch.me/weather?q=${location}`
    );
    if (!response.ok) {
      if (response.status === 400) {
        hideSpinner();
        await showError("Location Does Not Exit!");
        return;
      }
      throw new Error(`HTTP Error! status: ${response.status} ${response}`);
    }
    const data = await response.json();
    await changeDataInHTMl(data);

    // fetching data of sunrise and sunset using astronomy end point

    const response1 = await fetch(
      `https://foam-cerulean-globeflower.glitch.me/sunTime?q=${location}`
    );
    if (!response1.ok) {
      hideSpinner();
      throw new Error("HTTP Error! status: ", response1.status);
    }
    const data1 = await response1.json();
    sunriseTime.textContent = data1.astronomy.astro.sunrise; // changin sunrise time
    sunsetTime.textContent = data1.astronomy.astro.sunset; // changing sunset time
    hideSpinner();
  } catch (error) {
    hideSpinner();
    await showError(`there is an error! ${error}`);
  }
}

// changing data in html of current weather without sunrise and sunset
async function changeDataInHTMl(data) {
  const flexTemp = document.getElementById("temp");
  region.textContent = data.location["name"];
  region.title = data.location["name"];
  temperature.textContent = `${data.current["temp_c"]} °`;
  flexTemp.textContent = `${data.current["temp_c"]} °`;
  weatherNameToday.textContent = data.current.condition["text"];
  let img = data.current.condition.text;
  let newImage = img.replace(/\s+/g, "").toLowerCase();
  weatherImgToday.src = `./img/${data.current.is_day}${newImage}.png`;
  humidity.textContent = `${data.current["humidity"]}%`;
  windSpeed.textContent = `${data.current["wind_kph"]} KM/h`;
  pressure.textContent = `${data.current["pressure_mb"]} mb`;
  windDiretion.textContent = createFullNameOfWindDirection(
    data.current["wind_dir"]
  );
  const localTime = data.location.localtime;
  let formatDate = timeToDay(localTime);
  formatDate = formatDate.split(" ");
  const brFormatDate = `${formatDate[0]} ${formatDate[1]} <br>${formatDate[2]} ${formatDate[3]}`;
  dateToday.innerHTML = brFormatDate;
  const daysBody = document.querySelector(".lower-body");
  daysBody.innerHTML = "";
  // days inner html
  let i = 1;
  data.forecast.forecastday.forEach((day) => {
    const date = timeToDay(day.date);
    const date2 = date.split(" ");
    const lastDate = halfToFullDay(date2[0]);
    let img = day.day.condition.text;
    let newImage = img.replace(/\s+/g, "").toLowerCase();
    daysBody.innerHTML += `<div class="box-lower-${i}">
          <div class="img-set" style="width: 90px; height: 115px;">
            <img src="./img/1${newImage}.png" alt="">
          </div>
            <h2>${day.day.avgtemp_c}°</h2>
            <div class="condition-text">${day.day.condition.text}</div>
            <div>${lastDate}</div>
        </div>`;
    i++;
  });
}

function timeToDay(localTime) {
  const date = new Date(localTime);
  const options = {
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  const formatDate = date.toDateString("en-us", options);
  return formatDate;
}
// converting diriction of air in full form like "SW" in "Sout-West"
function createFullNameOfWindDirection(name) {
  if (name === "SW") {
    return "South-West";
  } else if (name === "NE") {
    return "North-East";
  } else if (name === "SE") {
    return "South-East";
  } else if (name === "NW") {
    return "North-West";
  } else if (name === "N") {
    return "North";
  } else if (name === "E") {
    return "East";
  } else if (name === "S") {
    return "South";
  } else {
    return "West";
  }
}

function showSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "flex";
}

function hideSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "none";
}

async function showError(text) {
  const errorBox = document.getElementById("error-box");
  const error = document.getElementById("error");
  error.textContent = text;
  errorBox.style.display = "flex";
  setTimeout(() => {
    errorBox.style.display = "none";
  }, 2000);
}

async function showErrorpermanet(text) {
  const errorBox = document.getElementById("error-box");
  const error = document.getElementById("error");
  error.innerHTML = text;
  errorBox.style.display = "flex";
}

function halfToFullDay(name) {
  for (let i = 0; i < days.length; i++) {
    if (days[i].slice(0, 3) === name) return days[i];
  }
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// responsive with js at max width 900px

const mediaQuery = window.matchMedia("(max-width: 900px)"); // Corrected the media query (no semicolon inside the string)

function makeResponsive(e) {
  const location = document.querySelector(".location");
  const day = document.querySelector(".day");
  const temperature = document.querySelector(".temperature");
  const searchBox = document.querySelector(".search-box");
  const boxUpper1 = document.querySelector(".box-upper-1"); // Fixed selector (added dot)
  const boxUpper3 = document.querySelector(".box-upper-3"); // Fixed selector (added dot)
  const boxUpper2 = document.querySelector(".box-upper-2"); // Fixed selector (added dot)
  const upperbody = document.querySelector("upper-body");

  if (e.matches) {
    // If width is 900px or less
    const newDiv = document.createElement("div");
    newDiv.className = "location-and-day";
    newDiv.appendChild(location);
    newDiv.appendChild(day);

    // Move temperature element to boxUpper3
    if (boxUpper3) {
      boxUpper2.insertBefore(temperature, boxUpper2.firstChild); // Append temperature element to boxUpper3
      boxUpper1.insertBefore(searchBox, boxUpper1.firstChild); // Append temperature element to boxUpper3
      boxUpper1.appendChild(newDiv);
    }
  } else {
    // If the width is greater than 900px, move it back to boxUpper1
    const locationAndDay = document.querySelector(".location-and-day");

    // Move temperature element back to boxUpper1
    if (boxUpper1) {
      if (locationAndDay) {
        boxUpper1.removeChild(locationAndDay);
      }
      boxUpper1.appendChild(location); // Append temperature element to boxUpper3
      boxUpper1.appendChild(day); // Append temperature element to boxUpper3
      boxUpper1.appendChild(temperature); // Append temperature element back to boxUpper1
      boxUpper3.insertBefore(searchBox, boxUpper3.firstChild); // Append temperature element to boxUpper3
    }
  }
}

// Attach the event listener correctly without calling the function immediately
mediaQuery.addEventListener("change", makeResponsive);

// Run the function once on page load to apply the correct state
makeResponsive(mediaQuery);
