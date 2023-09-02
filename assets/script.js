var searchBtn = document.getElementById("searchBtn");
var cityList = document.getElementById("city-list");
var cityName = document.getElementById("city-search");
var forcast = document.getElementById("fiveDayForecast");
var date = document.getElementById("date");
var temp = document.getElementById("temp");
var windSpeed = document.getElementById("windSpeed");
var humidity = document.getElementById("humidity");
var SearchHistory = document.getElementById("SearchHistory");


var apiKey = 'fd5bcdf5b68d3fbf74e736379ffe6e3c';

var endpoint = 'https://api.openweathermap.org';



function getLocalstorage(key) {
    var cityRes = localStorage.getItem("city") || "[]";
    var cityArray = JSON.parse(cityRes);
    return cityArray;
}

function searchCity() {
    var city = cityName.value.trim();
    searchHistory = getLocalstorage("city");

    searchHistory.push(city);
    localStorage.setItem("city", JSON.stringify(searchHistory));

    getData(city, true);
}

function getData(city, newButton = false) {
    var geocodeUrl = `${endpoint}/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    var latLong = [];
    var weather = {};

    fetch(geocodeUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            if (data.length === 0) {
                alert("City not found");
                return;
            }
            else {
                latLong[0] = data[0].lat;
                latLong[1] = data[0].lon;
                if (newButton) {
                    return fetch(`${endpoint}/data/2.5/forecast?lat=${latLong[0]}&lon=${latLong[1]}&appid=${apiKey}&units=imperial`);
                }
            }
        })
        .then(function (response) {
            cityName.value = "";

            return response ? response.json() : {};
        })
        .then(function (data) {
            weather.fiveday = getFiveDay(data);
        })
        .then(function () {
            if (!latLong.lenght) return;

            fetch(`${endpoint}/data/2.5/onecall?lat=${latLong[0]}&lon=${latLong[1]}&units=imperial&appid=${apiKey}`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    weather.current = getCurrent(data);
                })
            return weather;
        }
        )
}

function getCurrent(currentData) {
    if (!currentData) return;

    date.textContent = `${currentData.name} (${day.js().format("M/D/YYYY")})`;
    var icon = document.createElement("img");
    icon.classList.add("icon");
    icon.src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png`;
    date.appendChild(icon);

    temp.textContent = `Temp: ${currentData.main.temp} \u00B0F`;
    humidity.textContent = `Humidity: ${currentData.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${currentData.wind.speed} MPH`;

c
}

saveHistory();
function saveHistory() {
    var citiesArray = getLocalstorage("city");
    searchHistory.innerHTML = "";
    citiesArray.forEach(function (city) {
        var historyButton = document.createElement("button");
        historyButton.classList.add("list-group-item", "list-group-item-action");
        historyButton.textContent = city;
        historyButton.addEventListener("click", function () {
            getData(city);
        });
        searchHistory.prepend(historyButton);
        historyButton.onclick = () => {
            getData(city);
        };
    });

}

function getFiveDay(fiveDayForecastData) {
    fiveDayForecastData.innerHTML = "";
    var currentForecast = fiveDayForecastData.list || [];
    var fiveDayTrim = [];
    for (let i = 0; i < currentForecast.length; i += 8) {
        const day = currentForecast[i];
        dailyWeather = {
            "date": [day.dt_txt],
            "icon": [day.weather[0].icon],
            "temp": [day.main.temp],
            "humidity": [day.main.humidity],
            "windSpeed": [day.wind.speed],
        }
        fiveDayTrim.push(dailyWeather);

    }

    return printFiveDay(fiveDayTrim);
}

function printFiveDay(forecast) {
    for (let i =0; i < forecast.length; i++) {
        var day = forecast[i];
        var card = document.createElement("div");
       
        card.classList.add("card", "bg-primary", "text-white", "col-md-2", "col-sm-12", "m-2");

        for (const weatherType in day) {
            if (weatherType === "date") {
                var date = document.createElement("h5");
                card.append(date);
                date.textContent = dayjs(day.date[0]).format("M/D/YYYY");
                date.setAttribute("style", "font-weight: bold");
            }
            else if (weatherType === "icon") {
                var condition = document.createElement("img");
                condition.classList.add("icon");
                condition.src = `http://openweathermap.org/img/w/${day[weatherType][0]}.png`;
                card.append(condition);

            } else {
                var condition = document.createElement("span");
                condition.textContent = `${day[weatherType][1]}: ${day[weatherType][0]} `;
                condition.classList.add("d-block");
                card.append(condition);
                condition.setAttribute("style", "font-weight: bold");
            }
        }
    }
    fiveDayForecast.append(card);

}

searchBtn.addEventListener("click", function (event) {
    event.preventDefault();
    searchCity(event);

})






