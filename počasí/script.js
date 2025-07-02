let weather = {
    apiKey: "2c3496f80f144300c949a51bc51c98f6",

    fetchWeather: function (city) {
        fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`
        )
            .then((response) => {
                if (!response.ok) {
                    alert("Město nenalezeno, zkuste znovu.");
                    throw new Error("Město nenalezeno, zkuste znovu.");
                }
                return response.json();
            })
            .then((data) => this.displayWeather(data))
            .catch((error) => console.error("Chyba při načítání dat: ", error));
    },

    displayWeather: function (data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;

        document.querySelector(".city").innerText = "Počasí v " + name;
        document.querySelector(".icon").src =
            `https://openweathermap.org/img/wn/${icon}.png`;
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = Math.round(temp) + "°C";
        document.querySelector(".humidity").innerText = "Vlhkost: " + humidity + "%";
        document.querySelector(".wind").innerText = "Vítr: " + speed + " km/h";
        document.querySelector(".weather-loading").classList.remove("loading");
    },

    fetchForecast: function (city) {
        fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`
        )
            .then((response) => {
                if (!response.ok) throw new Error("Chyba při načítání předpovědi.");
                return response.json();
            })
            .then((data) => this.displayForecast(data))
            .catch((error) => console.error("Chyba předpovědi: ", error));
    },

    displayForecast: function (data) {
        const forecastContainer = document.getElementById("forecast");
        forecastContainer.innerHTML = "";

        const daysMap = {};

        data.list.forEach(entry => {
            const date = new Date(entry.dt * 1000);
            const dayKey = date.toLocaleDateString("cs-CZ"); // celé datum bez času
            const hour = date.getHours();

            if (!daysMap[dayKey]) {
                daysMap[dayKey] = entry;
            } else {
                // Vyber záznam nejblíže k 12:00 hodinám
                const currentDiff = Math.abs(new Date(daysMap[dayKey].dt * 1000).getHours() - 12);
                const newDiff = Math.abs(hour - 12);
                if (newDiff < currentDiff) {
                    daysMap[dayKey] = entry;
                }
            }
        });

        const days = Object.values(daysMap).slice(0, 5);

        days.forEach(entry => {
            const date = new Date(entry.dt * 1000);
            const dayName = date.toLocaleDateString("cs-CZ", { weekday: "short" });
            const temp = Math.round(entry.main.temp);
            const icon = entry.weather[0].icon;

            const card = document.createElement("div");
            card.className = "forecast-card";
            card.innerHTML = `
                <div class="day">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
                <div class="temp">${temp}°C</div>
            `;
            forecastContainer.appendChild(card);
        });
    },

    search: function () {
        const input = document.querySelector(".input");
        if (input.value.trim() === "") {
            alert("Zadejte město.");
            return;
        }
        this.fetchWeather(input.value);
        this.fetchForecast(input.value);
    }
};

// Vyhledání po kliknutí
document.querySelector(".search button").addEventListener("click", function () {
    weather.search();
});

// Vyhledání po stisku Enter
document.querySelector(".input").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        weather.search();
    }
});

// Výchozí město při načtení
weather.fetchWeather("Prague");
weather.fetchForecast("Prague");
