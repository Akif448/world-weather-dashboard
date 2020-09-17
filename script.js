$(document).ready(function () {

    // recover the previous searched cities from local storage using JSON
    function getCityHistory() {
        var history = JSON.parse(localStorage.getItem("searchHistory"))
        if (history === null) {
            history = [];
        }
        return history;
    }

    var searchHistory = getCityHistory();

    for (var i = 0; i < searchHistory.length; i++) {
        generateCityBtn(searchHistory[i]);
    }

    //using moment.js we retrieve the current date
    var currentDayNow;
    setInterval(() => {
        currentDayNow = moment().format("MMMM Do YYYY");
    }, 1000)

    //Calling the openweather API (using my personal API key) ensureing all figures are in metric 
    function openWeatherMapCall(cityInput) {

        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&units=metric&524901&appid=730e05e59773628aa2e0233697702ac8";
        return $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function (response) {
            console.log(response);
            return response;
        }).then(mainDisplay);
    }

    //retrieving the required data from API
    function mainDisplay(response) {

        var apiCity = response.name;
        var apiCountry = response.sys.country
        var temp = response.main.temp;
        var humidity = response.main.humidity;
        var windSpeed = response.wind.speed

        var longitude = response.coord.lat;;
        var latitude = response.coord.lon
        var getIcon = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"
        let icon = $("<img>").attr("src", getIcon);


        $("#cityName").text(apiCity + " , " + apiCountry + ". ").append(icon);
        $("#currentDate").text(currentDayNow);
        $("#temperature").text("Temperature(C): " + temp);
        $("#humidity").text("Humidity: " + humidity + " %");
        $("#windSpeed").text("Wind Speend: " + windSpeed + " KPH");
        uvIndexRender(latitude, longitude)
    }

    function uvIndexRender(latitude, longitude) {

        let uvqueryURL = "https://api.openweathermap.org/data/2.5/uvi?&524901&appid=730e05e59773628aa2e0233697702ac8" + "&lat=" + longitude + "&lon=" + latitude
        $.ajax({
            url: uvqueryURL,
            method: "GET"
        }).then(function (response) {
            $("#uvIndex").text("UV Index: " + response.value)
            if (response.value < 3) {
                $("#uvIndex").removeClass().addClass("badge badge-success");
            } else if (response.value > 2 && response.value < 8) {
                $("#uvIndex").removeClass().addClass("badge badge-warning")
            } else {
                $("#uvIndex").removeClass().addClass("badge badge-danger")
            }
        });
    }

    // Calling (future) 5 day forecast, ensuring all figures are in metric unites. 
    function forecastData(cityInput) {

        var forcastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityInput + "&units=metric&524901&appid=730e05e59773628aa2e0233697702ac8"
        return $.ajax({
            url: forcastQueryURL,
            method: "GET",
        }).then(forecastDisplay)

    }

    function forecastDisplay(forecastResponse) {

        for (var i = 0; i < forecastResponse.list.length; i++) {
            var response = forecastResponse.list[i];
            var forecast = new Date(response.dt_txt);

            if (forecast.getHours() === 12) {

                var forecastDay = $("<div>").text(response.dt_txt);
                var getForecastIcon = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"
                var forecastIcon = $("<img>").attr("src", getForecastIcon);

                var forecastTemp = $("<div>").text("Temp(C): " + response.main.temp);

                var forecastHumidity = $("<div>").text("Humidity: " + response.main.humidity + "%");

                $(".forecastBox").append($("<div>").addClass(" col-2 col-md-2 col-lg-2 border border-primary m-2").append(forecastDay, forecastIcon, forecastTemp, forecastHumidity))
            }
        }
    }

    //store all city searches into local storage 
    function storeCities() {
        var cityName = $("#inputCityName").val().trim().toLowerCase();
        searchHistory.push(cityName.toString())
        searchHistory = searchHistory.slice(-5);
        console.log(searchHistory);

        localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
    }

    function generateCityBtn(cityInput) {
        var searchButton = $("<button>");
        searchButton.attr("data-name", cityInput);
        searchButton.addClass("btn btn-info m-1")
        searchButton.text(cityInput);
        searchButton.on("click", function () {
            $(".forecastBox").html("");
            openWeatherMapCall(cityInput);
            forecastData(cityInput);
        })

        $("#citySearchList").prepend(searchButton);
    }

    //set onclick functions for buttons
    $("#searchbutton").on("click", function () {
        $(".forecastBox").html("");
        $(".mainDisplay").show();
        $("#forecastHeader").show();
        $(".forecastBox").show();

        var cityInput = $("#inputCityName").val().trim().toLowerCase();

        if (cityInput == "") {
            alert("Field cannot be empty")
            return;

        } else {
            openWeatherMapCall(cityInput);
            forecastData(cityInput);
        }

        storeCities();
        if (searchHistory.length < 5) {
            generateCityBtn(cityInput);
        }

        else {
            $("#citySearchList button").last().remove();
            generateCityBtn(cityInput)
        }

        $("#inputCityName").val("");

    })

    $("#clearButton").on("click", function () {
        $(".mainDisplay").hide();
        $("#forecastHeader").hide();
        $(".forecastBox").hide();
        $("#citySearchList").empty();
        localStorage.clear();
    })
});