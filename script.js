// API key protection by "Please don't steal my API key" LLC.
const API_KEY = "9841eb3cf92db6ef35a0c522b6592885"

// Side controls
const cityInput = document.querySelector('#city-input');
const countrySelector = document.querySelector('#country-selector');
const stateSelector = document.querySelector('#state-selector');
const searchButton = document.querySelector('#search-button');

// Current/main card divs
const currentCityEl = document.querySelector('.current-city');
const currentWeatherDescEl = document.querySelector('.current-weather-desc');
const currentWeatherIconEl = document.querySelector('.current-weather-icon');
const currentTempEl = document.querySelector('.current-temp');

// Weather parameters card
const feelsLikeValueEl = document.querySelector('.feels-like-value');
const popValueEl = document.querySelector('.pop-value');
const windValueEl = document.querySelector('.wind-value');
const humidityValueEl = document.querySelector('.humidity-value');

class WeatherCity {
    constructor(name, state = "", lat, lon) {
        this.name = name;
        this.state = state;
        this.lat = lat;
        this.lon = lon;
        this.weatherParameters = undefined;
    }

    toString() {
        return `${this.name}, ${this.state}, ${this.lat}, ${this.lon}, ${this.weatherParameters}`
    }

    /**
     * Given an icon ID, returns a CSS style url to access the correct icon locally.
     * 
     * @param {String} iconID icon ID representing a weather state. Usually given by WeatherCity weather parameters
     * @returns string representing a CSS style url for the icon
     */
    static getIconURL(iconID) {
        switch (iconID) {
            case '01d':
                return 'url(/icons/sunny.svg)';      
            case '01n':
                return 'url(/icons/clear_night.svg)';
            case '02d':
                return 'url(/icons/partly_cloudy.svg)';
            case '02n':
                return 'url(/icons/partly_cloudy_night.svg)';
            case '03d':
                return 'url(/icons/cloudy.svg)';
            case '03n':
                return 'url(/icons/cloudy.svg)';
            case '04d':
                return 'url(/icons/cloudy.svg)';
            case '04n':
                return 'url(/icons/cloudy.svg)';
            case '09d':
                return 'url(/icons/rainy.svg)';
            case '09n':
                return 'url(/icons/rainy.svg)';
            case '10d':
                return 'url(/icons/rainy.svg)';
            case '10n':
                return 'url(/icons/rainy.svg)';
            case '11d':
                return 'url(/icons/thunderstorm.svg)';
            case '11n':
                return 'url(/icons/thunderstorm.svg)';
            case '13d':
                return 'url(/icons/snow.svg)';
            case '13n':
                return 'url(/icons/snow.svg)';
            case '50d':
                return 'url(/icons/fog.svg)';
            case '50n':
                return 'url(/icons/fog.svg)';
            default:
                return 'url(/icons/cloudy.svg)';
        }
    }

    static getWindString(windDeg, windSpeed) {
        let windDir = "";
        if ((windDeg >= 0 && windDeg <= 21) || (windDeg >= 338 && windDeg <= 360)) {
            windDir = "North";
        } else if (windDeg >= 22 && windDeg <= 68) {
            windDir = "NE";
        } else if (windDeg >= 69 && windDeg <= 113) {
            windDir = "East";
        } else if (windDeg >= 114 && windDeg <= 158) {
            windDir = "SE";
        } else if (windDeg >= 159 && windDeg <= 203) {
            windDir = "South";
        } else if (windDeg >= 204 && windDeg <= 248) {
            windDir = "SW";
        } else if (windDeg >= 249 && windDeg <= 293) {
            windDir = "West";
        } else if (windDeg >= 294 && windDeg <= 337) {
            windDir = "NW";
        } else {
            ""
        }

        return `${Math.round(windSpeed)} MPH ${windDir}`;
    }
}

let currentWeatherCity = undefined;

searchButton.addEventListener('click', async function() {
    if (cityInput.value == "") {
        cityInput.setCustomValidity("Please enter a city");
        cityInput.reportValidity();
    } else {
        currentWeatherCity = await getWeather(cityInput.value, stateSelector.value, countrySelector.value);
        updateUI(currentWeatherCity);
    }
})

cityInput.addEventListener('input', function() {
    cityInput.setCustomValidity("");
    cityInput.reportValidity();
});

/**
 * Returns a WeatherCity object given a city name, country code, and optional state code
 * @param {String} city city name
 * @param {String} state (optional) state code
 * @param {String} country country code
 * @returns {WeatherCity} WeatherCity object based on the given arguments
 */
async function getWeather(city, state = null, country = "US") {
    const newWeatherCity = await getCoordinates(city, state, country)
    newWeatherCity.weatherParameters = await getWeatherParameters(newWeatherCity.lat, newWeatherCity.lon);
    return newWeatherCity;
}


/**
 * Calls to the geocoding api to retrieve coordinates based on city, state, and country. 
 * Returns a new WeatherCity when available.
 * 
 * @param {String} city city name
 * @param {String} state (optional) state name
 * @param {String} country 2 letter country code
 * @returns {WeatherCity} returns WeatherCity object with an undefined weatherParameters
 */
async function getCoordinates(city, state = null, country = "US") {
    const baseUrl = "http://api.openweathermap.org/geo/1.0/direct?"
    const limit = 1; // Number of locations the api will return


    let q = "q=";
    if (state != null) {
        q = q.concat(city, ',', state, ',', country);
    } else {
        q = q.concat(city, ',', country);
    }

    const qLimit = `&limit=${limit}`;
    const apiKey = `&appid=${API_KEY}`;

    const url = baseUrl.concat(q, qLimit, apiKey);

    const response = await fetch(url);
    const respJson = await response.json();
    return new WeatherCity(
        respJson[0].name,
        state,
        respJson[0].lat,
        respJson[0].lon
    )
}

/**
 * Returns JSON object with weather parameters of the given latitude and longitude
 * 
 * @param {Number} lat latitude of city
 * @param {Number} lon longitude of city
 * @returns {JSON} JSON object of the various weather parameters of the given latitude and longitude
 */
async function getWeatherParameters(lat, lon) {
    const baseURL = "https://api.openweathermap.org/data/2.5/onecall?"

    const qLatLon = `lat=${lat}&lon=${lon}`; // Latitude and longitude
    const exclude = '&exclude=minutely,alerts' // Parameters to exclude
    const units = "&units=imperial" // Units of measurement
    const api = `&appid=${API_KEY}`

    const url = baseURL.concat(qLatLon, exclude, units, api)

    const response = await fetch(url);
    const respJson = await response.json();
    return respJson;
}

function updateUI(weatherCity) {
    cityInput.value = "";
    updateMainCityCard(weatherCity);
    updateWeatherParameterCard(weatherCity);
}

function updateMainCityCard(weatherCity) {
    currentCityEl.textContent = weatherCity.name;
    console.log(weatherCity.weatherParameters.current.weather[0].description)
    currentWeatherDescEl.textContent = weatherCity.weatherParameters.current.weather[0].description.toString();
    currentWeatherIconEl.style.backgroundImage = WeatherCity.getIconURL(weatherCity.weatherParameters.current.weather[0].icon);
    currentTempEl.textContent = `${Math.floor(weatherCity.weatherParameters.current.temp)}\xB0`
}

function updateWeatherParameterCard(weatherCity) {
    feelsLikeValueEl.textContent = `${Math.floor(weatherCity.weatherParameters.current.feels_like)}\xB0`
    popValueEl.textContent = `${Math.floor(weatherCity.weatherParameters.hourly[0].pop * 100)}%`;
    windValueEl.textContent = WeatherCity.getWindString(weatherCity.weatherParameters.current.wind_deg, weatherCity.weatherParameters.current.wind_speed);
}

async function init() {
    currentWeatherCity = await getWeather("phoenix", "az")
    updateUI(currentWeatherCity);
}

init();