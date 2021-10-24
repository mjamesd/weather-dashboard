// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Author: Mark Drummond
// Date: 23-Oct-2021
// Assignment: Weather Dashboard
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
const liEl = "<li>";

// ~~~~~~~~~~~~~~~~~~~~
// GLOBAL VARIABLES
// ~~~~~~~~~~~~~~~~~~~~
let localStorageEntity = "dd-weather-cities";
let datetime;
let timer;
let myOpenWeatherApiKey = "2b2c5b74287143d7e917daac22179433";
let currentWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/weather?appid=" + myOpenWeatherApiKey + "&units=imperial&q=";
let oneCallWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/onecall?appid=" + myOpenWeatherApiKey + "&units=imperial&exclude=minutely,hourly&lat=";
let oneCallWeatherDataRequestUrl_suffix = "&lon=";
let forecastWeatherDataRequestUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?appid=" + myOpenWeatherApiKey + "&cnt=5&lat=";
let forecastWeatherDataRequestUrl_suffix = "&lon=";
let geocodingRequestUrl = "https://api.openweathermap.org/geo/1.0/direct?appid=" + myOpenWeatherApiKey + "&limit=1&q=";

// ~~~~~~~~~~~~~~~~~~~~
// FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~

function init() {
    datetime = moment();
    renderCities();
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
    // clear cityInput
    cityInput.val("");
    // render Hourglass to show the user we got their input
    weatherDataEl.html('<div class="d-flex flex-row justify-content-center"><i id="weatherWait" class="fas fa-hourglass-start p-2"></i></div>');
    setTimeout(() => {
        // wait 750ms to give user a visual cue that their input was received...
    }, 750);
    // begin api call
    fetch(currentWeatherDataRequestUrl + cityName)
        .then(function (response) {
            if (response.status === 404) {
                weatherDataEl.text("City not found. Please try again.");
                return;
            }
            return response.json();
        })
        .then(function (cityData) {
            $("#weatherWait").removeClass("fa-hourglass-start").addClass("fas fa-hourglass-end").attr("style", "box-shadow: 0 0 45px var(--success);"); // change it to -end to show data is being processed
            setTimeout(() => {
                // wait 750ms...
            }, 750);
            fetch(geocodingRequestUrl + cityData.name) // Neither other API call returns the city's state. The Geocoding API does so.
                .then(function (geocodingResponse) {
                    return geocodingResponse.json();
                })
                .then(function (geocodingData) {
                    fetch(oneCallWeatherDataRequestUrl + cityData.coord.lat + oneCallWeatherDataRequestUrl_suffix + cityData.coord.lon)
                        .then(function (oneCallResponse) {
                            return oneCallResponse.json();
                        })
                        .then(function (weatherData) {
                            renderData(cityData, geocodingData[0], weatherData);
                            saveData(cityData.name);
                            renderCities();
                        });
                });
        });
}

function renderData(cityData, geocodingData, weatherData) {
    let dataBlock = $(articleEl).attr('id', 'currentWeather').addClass("m-1 p-2");
    // city name & weather icon(s)
    let thisTitle = `Current Conditions in ${cityData.name}, `;
    // If city is in the US, display the State abbreviation as well
    if (geocodingData.state != null) {
        thisTitle += `${geocodingData.state}, `;
    }
    thisTitle += cityData.sys.country;
    for (i = 0; i < weatherData.current.weather.length; i++) {
        thisTitle += ` <img src="https://openweathermap.org/img/w/${weatherData.current.weather[i]['icon']}.png" alt="${weatherData.current.weather[i]['main']}" title="${weatherData.current.weather[i]['description']}" class="weatherImage" />`;
    }
    dataBlock.append($("<h2>").attr('id', 'currentWeatherCityName').html(thisTitle));
    // date
    dataBlock.append($("<h3>").attr('id', 'currentWeatherTime').text(`for ${moment(datetime).format("llll")}`)); // localized long form date
    // temp
    dataBlock.append($(divEl).attr('id', 'temperature').html(`Temperature: ${Math.round(weatherData.current.temp)}&deg;F`));
    // wind
    let windDirection = getWindDirection(weatherData.current.wind_deg);
    dataBlock.append($(divEl).attr('id', 'wind').html(`Wind Speed: ${Math.round(weatherData.current.wind_speed)} mph ${windDirection}`));
    // humidity
    dataBlock.append($(divEl).attr('id', 'humidity').text(`Humidity: ${weatherData.current.humidity}%`));
    // uv index
    let uvindexEl = $(divEl).attr('id', 'uvindexContainer').addClass("px-1").text('UV Index: ');;
    let uvindexValueEl = $(spanEl).attr('id', 'uvindex').addClass("uvindex px-1").text(weatherData.current.uvi);
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
            thisDescription += `<span id="weatherAlert-${i}" class="weatherAlert mx-1 p-1">${weatherData.alerts[i]['event']}</span>`;
            // jquery ui dialog widget to show the whole event
            thisDescription += `<div style="display: none;" class="dialog" title="Weather Alert: ${weatherData.alerts[i]['event']}">${weatherData.alerts[i]['description']}</div>`;
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
    // write the current weather to the page <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <--
    weatherDataEl.html(dataBlock.hide().fadeIn("slow"));

    let forecastBlock = $(divEl).attr("id", "currentForecast").addClass("row justify-content-around m-1 p-2");
    // now output the 5-day forecast
    for (let day = 0; day < 5; day++) {
        const thisDay = weatherData.daily[day];
        // create block for this day
        let thisForecastDay = $(articleEl).addClass("forecastDay p-1 mx-1 col-2");
        // this day weather conditions:
        // this day date
        let thisForecastDayDt = moment.unix(thisDay.dt).format("L"); // localized short form date
        // icon(s)
        for (i = 0; i < thisDay.weather.length; i++) {
            thisForecastDayDt += ` <img src="https://openweathermap.org/img/w/${thisDay.weather[i]['icon']}.png" alt="${thisDay.weather[i]['main']}" title="${thisDay.weather[i]['description']}" class="weatherImage" />`;
        }
        thisForecastDay.append($(divEl).addClass("border-bottom border-dark pb-1").html(thisForecastDayDt));
        // temperature, min max
        thisForecastDay.append($(divEl).attr('id', `day-${day}-temperature`).html(`High Temp: ${Math.round(thisDay.temp.max)}&deg;F`));
        thisForecastDay.append($(divEl).attr('id', `day-${day}-temperature`).html(`Low Temp: ${Math.round(thisDay.temp.min)}&deg;F`));
        // wind
        let windDirection = getWindDirection(thisDay.wind_deg);
        thisForecastDay.append($(divEl).attr('id', `day-${day}-wind`).html(`Wind: ${Math.round(thisDay.wind_speed)} mph ${windDirection}`));
        // humidity
        thisForecastDay.append($(divEl).attr('id', `day-${day}-humidity`).text(`Humidity: ${thisDay.humidity}%`));
        // more info
        // add jquery ui dialog widget for more info -- misc info above
        let thisForecastDescription = $(divEl).attr('id', `day-${day}-WeatherDescription`).addClass("forecastWeatherDescription").text('UV index:');

        thisForecastUvi = $(spanEl).attr("id", `day-${day}-uvi`).addClass("uvindex px-1 mx-1").text(thisDay.uvi);
        thisForecastDescription.append(thisForecastUvi);
        thisForecastDescription.append("<br />");
        for (let i = 0; i < thisDay.weather.length; i++) {
            thisForecastDescription.append(`${thisDay.weather[i]['description']}.`);
            if (i < (thisDay.weather.length - 1)) {
                thisForecastDescription.append(" ");
            }
        }
        thisForecastDay.append(thisForecastDescription);
        // thisForecastDay.append($(divEl).attr('id', `day-${day}-WeatherDescription`).addClass("forecastWeatherDescription").html(thisForecastDescription));
        // color the uvi element
        if (thisDay.uvi < 3) {
            thisForecastUvi.addClass('uvLow');
        } else if (thisDay.uvi >= 3 && thisDay.uvi < 6) {
            thisForecastUvi.addClass('uvModerate');
        } else if (thisDay.uvi >= 6 && thisDay.uvi < 7) {
            thisForecastUvi.addClass('uvHigh');
        } else {
            thisForecastUvi.addClass('uvSevere'); // weatherData.current.uvi >= 7
        }
        // add the day forecast to the block <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <--
        forecastBlock.append(thisForecastDay);
    }
    // write the whole forecast to the page <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <-- <--
    weatherDataEl.append(forecastBlock);
}

function getWindDirection(deg) {
    let arrowDeg = deg + 180; // wind direction is the direction *from which* the wind is coming, so we need to flip the arrow
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

// Render cities in sidebar list, in reverse order so the most recent search is on top
function renderCities() {
    citiesListEl.empty();
    let currentLocalStorage = getData();
    for (let index = currentLocalStorage.length - 1; index >= 0; index--) {
        citiesListEl.append($(liEl).attr("id", `savedCities-${index}`).addClass("savedCity btn btn-lg btn-block").text(currentLocalStorage[index]));
    }
    if (currentLocalStorage[0] !== "None") {
        citiesListEl.append($(liEl).attr("id", "deleteCities").addClass("btn btn-lg btn-block btn-danger").text("Remove All Saved Cities"));
        $("#deleteCities").click(destroyData);
    }
}

// Retreive from localStorage
function getData() {
    let currentLocalStorage = JSON.parse(localStorage.getItem(localStorageEntity)) || ["None"];
    return currentLocalStorage;
}

// Save to localStorage
function saveData(data) {
    let currentLocalStorage = getData();
    if (currentLocalStorage.includes("None")) {
        for (let index = 0; index < currentLocalStorage.length; index++) {
            if (currentLocalStorage[index] == "None") {
                currentLocalStorage.splice(index,1);
            }
        }
    }
    if (!currentLocalStorage.includes(data)) {
        currentLocalStorage.push(data);
        localStorage.setItem(localStorageEntity, JSON.stringify(currentLocalStorage));
    }
    return;
}

function destroyData() {
    localStorage.setItem(localStorageEntity, null);
    renderCities();
    return;
}

// ~~~~~~~~~~~~~~~~~~~~
// BEGIN EXECUTION HERE
// ~~~~~~~~~~~~~~~~~~~~
// Attach event listener for all elements with "savedCity" class, even dynamically-added ones.
$(document).on("click", ".savedCity", function() {
    console.log($(this)[0].innerText);
    getWeather($(this)[0].innerText);
});
$(document).on("click", ".weatherAlert", function() {
    $(this).next().dialog();
});
// Hook the dialog boxes/modals into jQuery UI Widgets.
// $( ".dialog" ).dialog();

init();

// eof