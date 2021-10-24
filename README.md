# Week 06: Weather Dashboard

## My Task

Third-party APIs allow developers like me to access their data and functionality by making requests with specific parameters to a URL. I'll often be tasked with retrieving data from another application's API and using it in the context of my own. I built a weather dashboard that runs in the browser and features dynamically updated HTML and CSS.

I'm using the [OpenWeather One Call API](https://openweathermap.org/api/one-call-api) to retrieve weather data for cities. I set up an account with an API key and read through the documentation. And I'm using `localStorage` to store persistent data.

I deployed the webapp on [Github Pages](https://mjamesd.github.io/wk6-weather-dashboard/). The URL to the repo is [https://github.com/mjamesd/wk6-weather-dashboard](https://github.com/mjamesd/wk6-weather-dashboard).

## User Story

```
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly
```

## Acceptance Criteria

```
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
WHEN I view the UV index
THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
```

## Mock-Up

I was given the following image which shows the web application's appearance and functionality:

![The weather app includes a search option, a list of cities, and a five-day forecast and current weather conditions for Atlanta.](./assets/spec/Assets/06-server-side-apis-homework-demo.png)