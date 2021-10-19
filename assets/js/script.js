// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Author: Mark Drummond
// Date: 16-Oct-2021
// Assignment: Work Day Planner
// See README.md for more information
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ~~~~~~~~~~~~~~~~~~~~
// SPECIFICATIONS
// ~~~~~~~~~~~~~~~~~~~~
/*
    * Search by city name.
        * Display the city name, current date, temperature, wind, humidity, uv index (with color-coded severity), and weather icon representating current weather conditions.
        * Display 5-day forecast that displays the date, weather icon representating weather conditions, the temperature, the wind speed, and the humidity
    * Save each search's data in `localStorage` for quick recall via button on page.
    * BONUS FEATURE: Use city.list.json file (in ./assets/data/) to make the search bar auto-complete based on user input. This file is 40MB, so figure out how to "pre-load" it.
*/

// ~~~~~~~~~~~~~~~~~~~~
// DOCUEMENT SELECTORS
// ~~~~~~~~~~~~~~~~~~~~
// Containers
const headerEl = $("#header");
const mainEl = $("#main");
const cityContainerEl = $("#cityContainer");
const searchCitiesEl = $("#searchCities");
const savedCitiesEl = $("#savedCities");
const weatherDataEl = $("#weatherData");
const footerEl = $("#footer");

// Interactions
const cityInput = $("#cityInput");
const searchCityBtn = $("#searchCity");
const citiesListEl = $("#citiesList");

// ~~~~~~~~~~~~~~~~~~~~
// GLOBAL VARIABLES
// ~~~~~~~~~~~~~~~~~~~~
let localStorageEntity = "dd-weather-";
let datetime;
let timer;
let myOpenWeatherApiKey = "2b2c5b74287143d7e917daac22179433";
let currentWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/weather?appid=" + myOpenWeatherApiKey + "&q=";
let oneCallWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/onecall?appid=" + myOpenWeatherApiKey + "&exclude=minutely,hourly,daily,alerts&lat=";
let oneCallWeatherDataRequestUrl_suffix = "&lon=";
let forecastWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?appid=" + myOpenWeatherApiKey + "&cnt=5&lat=";
let forecastWeatherDataRequestUrl_suffix = "&lon=";

/*

weatherData {
    id: weatherData.id

*/

// ~~~~~~~~~~~~~~~~~~~~
// FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~

function init() {
    datetime = moment();
    searchCityBtn.click(() => {
        getWeather(cityInput.val());
    });
    // Unimplemented refresh feature
    // let timerInterval = 0;
    // timer = setInterval(() => {
    //     timerInterval++;

    // }, 1000);
}

function getWeather(cityName) {
    let weatherData;
    fetch(currentWeatherDataRequestUrl + cityName)
        .then(function(response) {
            return response.json();
        })
        .then(function(cityData) {
            fetch(oneCallWeatherDataRequestUrl + cityData.coord.lat + oneCallWeatherDataRequestUrl_suffix + cityData.coord.lon)
                .then(function(oneCallResponse) {
                    return oneCallResponse.json();
                })
                .then(function(weatherData) {
                    console.log(weatherData);
                    let weatherBlock = $("<div>");
                    weatherBlock.append(`<span id="temperature">Temperature: ${weatherData.current.temp}</span><br />`);
                    weatherBlock.append(`<span id="wind">Wind: ${weatherData.current.wind_speed}</span><br />`);
                    weatherBlock.append(`<span id="humidity">Humidity: ${weatherData.current.humidity}</span><br />`);
                    weatherBlock.append(`<span id="uvindex">UV Index: ${weatherData.current.uvi}</span>`);

                    weatherDataEl.html(weatherBlock);
                });
        });
}


// ~~~~~~~~~~~~~~~~~~~~
// BEGIN EXECUTION HERE
// ~~~~~~~~~~~~~~~~~~~~
init();

// eof