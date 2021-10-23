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
// Container Elements
const headerEl = $("#header");
const mainEl = $("#main");
const mainWrapperEl = $("#mainWrapper");
const cityContainerEl = $("#cityContainer");
const searchCitiesEl = $("#searchCities");
const savedCitiesEl = $("#savedCities");
const weatherDataEl = $("#weatherData");
const footerEl = $("#footer");

// Interactive Elements
const cityInput = $("#cityInput");
const searchCityBtn = $("#searchCity");
const citiesListEl = $("#citiesList");
const divEl = "<div>";
const sectionEl = "<section>";
const articleEl = "<article>";
const spanEl = "<span>";
const pEl = "<p>";

// ~~~~~~~~~~~~~~~~~~~~
// GLOBAL VARIABLES
// ~~~~~~~~~~~~~~~~~~~~
let localStorageEntity = "dd-weather-";
let datetime;
let timer;
let myOpenWeatherApiKey = "2b2c5b74287143d7e917daac22179433";
let currentWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/weather?appid=" + myOpenWeatherApiKey + "&units=imperial&q=";
let oneCallWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/onecall?appid=" + myOpenWeatherApiKey + "&units=imperial&exclude=minutely,hourly&lat=";
let oneCallWeatherDataRequestUrl_suffix = "&lon=";
let forecastWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?appid=" + myOpenWeatherApiKey + "&cnt=5&lat=";
let forecastWeatherDataRequestUrl_suffix = "&lon=";

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
    // render Hourglass to show the user we got their input
    weatherDataEl.html('<i id="weatherWait" class="fas fa-hourglass-start"></i>');
    // begin api call
    fetch(currentWeatherDataRequestUrl + cityName)
        .then(function (response) {
            return response.json();
        })
        .then(function (cityData) {
            $("#weatherWait").removeClass("fa-hourglass-start").addClass("fas fa-hourglass-end"); // change it to -end to show data is being processed
            fetch(oneCallWeatherDataRequestUrl + cityData.coord.lat + oneCallWeatherDataRequestUrl_suffix + cityData.coord.lon)
                .then(function (oneCallResponse) {
                    return oneCallResponse.json();
                })
                .then(function (weatherData) {
                    renderData(cityData, weatherData);
                });
        });
}

function renderData(cityData, weatherData) {
    console.log(cityData);
    console.log(weatherData);
    let dataBlock = $(articleEl).attr('id', 'currentWeather').addClass("m-1 p-2");
    // city name & weather icon(s)
    let thisTitle = `Current Conditions in ${cityData.name}, ${cityData.sys.country}`;
    for (i = 0; i < weatherData.current.weather.length; i++) {
        thisTitle += ` <img src="http://openweathermap.org/img/w/${weatherData.current.weather[i]['icon']}.png" alt="${weatherData.current.weather[i]['main']}"/>`;
    }
    dataBlock.append($("<h2>").attr('id', 'currentWeatherCityName').html(thisTitle));
    // date
    dataBlock.append($("<h3>").attr('id', 'currentWeatherTime').text(`for ${moment(datetime).format("llll")}`));
    // temp
    dataBlock.append($(divEl).attr('id', 'temperature').html(`Temperature: ${Math.round(weatherData.current.temp)}&deg;F`));
    // wind
    let windDirection = getWindDirection(weatherData.current.wind_deg);
    dataBlock.append($(divEl).attr('id', 'wind').html(`Wind Speed: ${weatherData.current.wind_speed} mph ${windDirection}`));
    // humidity
    dataBlock.append($(divEl).attr('id', 'humidity').text(`Humidity: ${weatherData.current.humidity}%`));
    // uv index
    let uvindexEl = $(divEl).attr('id', 'uvindexContainer').addClass("px-1").text('UV Index: ');;
    let uvindexValueEl = $(spanEl).attr('id', 'uvindex').addClass("px-1").text(weatherData.current.uvi);
    uvindexEl.append(uvindexValueEl);
    dataBlock.append(uvindexEl);
    // misc info provided
    let thisDescription = `Feels like ${Math.round(weatherData.current.feels_like)}&deg;F.`;
    for (let i = 0; i < weatherData.current.weather.length; i++) {
        thisDescription += ` ${weatherData.current.weather[i]['description']}.`;
    }
    console.log(weatherData.alerts);
    if (weatherData.alerts !== undefined) {
        for (let i = 0; i < weatherData.alerts.length; i++) {
            thisDescription += `<span data-id="${i}" class="weatherAlert mx-1 p-1">${weatherData.alerts[i]['event']}</span>`; // add jquery ui dialog widget to show the whole event.
        }
    }
    dataBlock.append($(divEl).attr('id', 'currentWeatherDescription').html(thisDescription));

    // change #uvindex background color depending on value
    // let uvindexEl = $("#uvindex");
    if (weatherData.current.uvi < 3) {
        uvindexValueEl.addClass('uvLow');
    } else if (weatherData.current.uvi >= 3 && weatherData.current.uvi < 6) {
        uvindexValueEl.addClass('uvModerate');
    } else if (weatherData.current.uvi >= 6 && weatherData.current.uvi < 7) {
        uvindexValueEl.addClass('uvHigh');
    } else {
        uvindexValueEl.addClass('uvSevere'); // weatherData.current.uvi >= 7
    }
    // write the current weather to the page
    weatherDataEl.html(dataBlock);

    let forecastBlock = $(divEl).attr("id", "currentForecast");
    console.log(weatherData.daily);
    // now output the 5-day forecast
    for (let day = 0; day < 5; day++) {
        const thisDay = weatherData.daily[day];
        console.log(thisDay);
        // let thisForecastDay = $(divEl).addClass("forecastDay");
        // let thisForecastDayDt = moment(datetime).format(thisDay.dt);
        // thisForecastDay.append($(pEl).text(`date: ${thisForecastDayDt}`));
        



        // forecastBlock.append(thisForecastDay);
    }
    weatherDataEl.append(forecastBlock);
}

function getWindDirection(deg) {
    let arrowDeg = deg + 180; // wind direction is the direction *from which* the wind is coming, so we should flip the arrow
    let windDirection = `<i class="fas fa-long-arrow-alt-up" style="transform: rotate(${arrowDeg}deg)"></i> `;
    if (deg == 0 || deg == 360) {
        windDirection += 'N';
    } else if (deg > 0 && deg < 45) {
        windDirection += 'NNE';
    } else if (deg == 45) {
        windDirection += 'NE';
    } else if (deg > 45 && deg < 90) {
        windDirection += 'ENE';
    } else if (deg == 90) {
        windDirection += 'E';
    } else if (deg > 90 && deg < 135) {
        windDirection += 'ESE';
    } else if (deg == 135) {
        windDirection += 'SE';
    } else if (deg > 135 && deg < 180) {
        windDirection += 'SSE';
    } else if (deg == 180) {
        windDirection += 'S';
    } else if (deg > 180 && deg < 225) {
        windDirection += 'SSW';
    } else if (deg == 225) {
        windDirection += 'SW';
    } else if (deg > 225 && deg < 270) {
        windDirection += 'WSW';
    } else if (deg == 270) {
        windDirection += 'W';
    } else if (deg > 270 && deg < 315) {
        windDirection += 'WNW';
    } else if (deg == 315) {
        windDirection += 'NW';
    } else if (deg > 315 && deg < 360) {
        windDirection += 'NNW';
    } else {
        return false;
    }
    return windDirection;
}

// Retreive from localStorage
function getData(data, isError = false) {
    let thisLocalStorageEntity = localStorageEntity;
    if (isError === true) {
        thisLocalStorageEntity += "ERR";
    }
    let thisData = JSON.parse(localStorage.getItem(`${thisLocalStorageEntity}-${data}`));

}

// Save to localStorage
function saveData(data, isError = false) {
    let thisData = [
        moment().formt("YYYY-MM-DD HH:mm:ss"),
        data
    ];
    let thisLocalStorageEntity = localStorageEntity;
    if (isError === true) {
        thisLocalStorageEntity += "ERR";
    }
    localStorage.setItem(`${thisLocalStorageEntity}-${data}`, JSON.stringify(thisData));
    return;
}

// ~~~~~~~~~~~~~~~~~~~~
// BEGIN EXECUTION HERE
// ~~~~~~~~~~~~~~~~~~~~
init();

// eof