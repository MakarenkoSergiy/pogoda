const API_KEY = "dee2781a12e94108927150921253105";

const conditionTranslations = {
  "Partly cloudy": "Мінлива хмарність",
  "Clear": "Ясно",
  "Sunny": "Сонячно",
  "Cloudy": "Хмарно",
  "Overcast": "Похмуро",
  "Mist": "Імла",
  "Patchy rain possible": "Можливий невеликий дощ",
  "Patchy snow possible": "Можливий невеликий сніг",
  "Patchy sleet possible": "Можлива мокра снігова крупа",
  "Patchy freezing drizzle possible": "Можливий крижаний дощ",
  "Thundery outbreaks possible": "Можливі грози",
  "Blowing snow": "Сніг з вітром",
  "Blizzard": "Хуртовина",
  "Fog": "Туман",
  "Freezing fog": "Морозний туман",
  "Patchy light drizzle": "Місцями слабка мряка",
  "Light drizzle": "Слабка мряка",
  "Freezing drizzle": "Крижана мряка",
  "Heavy freezing drizzle": "Сильна крижана мряка",
  "Patchy light rain": "Місцями слабкий дощ",
  "Light rain": "Слабкий дощ",
  "Moderate rain at times": "Помірний дощ часами",
  "Moderate rain": "Помірний дощ",
  "Heavy rain at times": "Сильний дощ часами",
  "Heavy rain": "Сильний дощ",
  "Light snow": "Слабкий сніг",
  "Moderate snow": "Помірний сніг",
  "Heavy snow": "Сильний сніг",
  "Ice pellets": "Крижаний град",
  "Light rain shower": "Короткочасний слабкий дощ",
  "Heavy rain shower": "Короткочасний сильний дощ",
  "Torrential rain shower": "Злива",
  "Light snow shower": "Короткочасний слабкий сніг",
  "Heavy snow shower": "Короткочасний сильний сніг",
  "Thundery shower": "Грозовий дощ",
  "Thunderstorms": "Гроза"
};

const windDirTranslations = {
  "N": "Пн", "NNE": "ПнПнСх", "NE": "ПнСх", "ENE": "СхПнСх",
  "E": "Сх", "ESE": "СхПдСх", "SE": "ПдСх", "SSE": "ПдПдСх",
  "S": "Пд", "SSW": "ПдПдЗх", "SW": "ПдЗх", "WSW": "ЗхПдЗх",
  "W": "Зх", "WNW": "ЗхПнЗх", "NW": "ПнЗх", "NNW": "ПнПнЗх"
};

async function translateCondition(text) {
  return Promise.resolve(conditionTranslations[text] || text);
}

async function translateWindDir(dir) {
  return Promise.resolve(windDirTranslations[dir] || dir);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedCity = localStorage.getItem("lastCity");
  if (savedCity) {
    document.getElementById("cityInput").value = savedCity;
    getWeather(1);
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "night") {
    document.body.classList.add("night-theme");
    document.getElementById("themeToggleBtn").textContent = "Денна тема";
  }

  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    document.body.classList.toggle("night-theme");
    if (document.body.classList.contains("night-theme")) {
      localStorage.setItem("theme", "night");
      document.getElementById("themeToggleBtn").textContent = "Денна тема";
    } else {
      localStorage.setItem("theme", "day");
      document.getElementById("themeToggleBtn").textContent = "Нічна тема";
    }
  });
});

function formatTemp(celsius) {
  return `${celsius}°C`;
}

function getAdvice(conditionText, tempC, isDay) {
  conditionText = conditionText.toLowerCase();

  if (conditionText.includes("rain") || conditionText.includes("дощ") || conditionText.includes("shower") || conditionText.includes("drizzle")) {
    return "Візьміть парасолю, ймовірний дощ.";
  }
  if (conditionText.includes("snow") || conditionText.includes("сніг")) {
    return "Одягайтеся тепло і обережно на слизьких дорогах.";
  }
  if (conditionText.includes("fog") || conditionText.includes("mist") || conditionText.includes("туман")) {
    return "Будьте уважні на дорозі через погану видимість.";
  }
  if (tempC <= 0) {
    return "На вулиці морозно, не забудьте теплий одяг.";
  }
  if (tempC >= 30) {
    return "Спека! Не забувайте пити воду та захищатися від сонця.";
  }
  if (!isDay) {
    return "Нічна пора. Рекомендуємо бути обережними на вулиці.";
  }
  return "Гарна погода! Приємного дня!";
}

function getWeather(days) {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Введіть назву міста");
    return;
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=${days}&aqi=no&alerts=no`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Місто не знайдено");
      return res.json();
    })
    .then(data => {
      localStorage.setItem("lastCity", city);
      if (days === 1) {
        showDetailedWeather(data);
      } else {
        showForecast(data, days);
      }
      if (data.current) {
        setBackground(data.current.condition.text, data.current.is_day);
      }
    })
    .catch(err => {
      document.getElementById("weatherResult").innerHTML = `<p style="color:red">${err.message}</p>`;
    });
}

async function showDetailedWeather(data) {
  const { location, current, forecast } = data;
  const today = forecast.forecastday[0];
  const hours = today?.hour || [];

  const translatedCondition = await translateCondition(current.condition.text);
  const translatedWindDir = await translateWindDir(current.wind_dir);

  let html = `
    <h2>${location.name}, ${location.country}</h2>
    <div class="current-weather">
      <img src="https:${current.condition.icon}" alt="${translatedCondition}" />
      <div>
        <p><strong>${formatTemp(current.temp_c)}</strong> — ${translatedCondition}</p>
        <p>Відчувається як: ${formatTemp(current.feelslike_c)}</p>
        <p>Вологість: ${current.humidity}%</p>
        <p>Тиск: ${current.pressure_mb} мбар</p>
        <p>Вітер: ${current.wind_kph} км/год, напрям: ${translatedWindDir}</p>
        <p>Пориви вітру: ${current.gust_kph} км/год</p>
        <p>Хмарність: ${current.cloud}%</p>
      </div>
    </div>

    <h3>Погодинний прогноз:</h3>
    <div class="hourly-container">
  `;

  for (const hour of hours) {
    const hourCondition = await translateCondition(hour.condition.text);
    html += `
      <div class="hour-card">
        <p><strong>${new Date(hour.time).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}</strong></p>
        <img src="https:${hour.condition.icon}" alt="${hourCondition}" />
        <p>${formatTemp(hour.temp_c)}</p>
        <p>${hourCondition}</p>
        <p>Вологість: ${hour.humidity}%</p>
        <p>Вітер: ${hour.wind_kph} км/год</p>
      </div>
    `;
  }

  html += `</div>`;

  const advice = getAdvice(current.condition.text, current.temp_c, current.is_day);
  html += `<div class="weather-advice" style="margin-top:15px; padding:10px; background:#e0f7fa; border-radius:8px; font-weight:bold;">
    <p>Порада: ${advice}</p>
  </div>`;

  document.getElementById("weatherResult").innerHTML = html;
}

async function showForecast(data, days) {
  const location = data.location;
  const forecast = data.forecast.forecastday;

  let html = `<h2>${location.name}, ${location.country}</h2>`;
  html += `<div class="forecast-container">`;

  for (const day of forecast) {
    const dayName = getUkrainianDayName(day.date);
    const formattedDate = formatDateYearDayMonth(day.date);
    const dayCondition = await translateCondition(day.day.condition.text);

    html += `
      <div class="weather-day">
        <h3>${dayName}, ${formattedDate}</h3>
        <img src="https:${day.day.condition.icon}" alt="${dayCondition}" />
        <p>${dayCondition}</p>
        <p>Середня температура: ${formatTemp(day.day.avgtemp_c)}</p>
        <p>Максимум: ${formatTemp(day.day.maxtemp_c)} | Мінімум: ${formatTemp(day.day.mintemp_c)}</p>
        <p>Макс. вітер: ${day.day.maxwind_kph} км/год</p>
      </div>
    `;
  }

  html += `</div>`;
  document.getElementById("weatherResult").innerHTML = html;
}

function getUkrainianDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("uk-UA", { weekday: "long" });
}

function formatDateYearDayMonth(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${day}-${month}`;
}

function setBackground(condition, isDay) {
  if (document.body.classList.contains("night-theme")) {
    document.body.style.backgroundImage = "none";
    return;
  }

  const body = document.body;
  condition = condition.toLowerCase();

  let bgUrl = "https://cdn.pixabay.com/photo/2016/11/29/05/08/default-1867270_1280.jpg";

  if (!isDay) {
    bgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4uLtPnjQutruYQp-v8btDxvJ347kv6N9M5A&s";
  } else if (condition.includes("sunny") || condition.includes("clear")) {
    bgUrl = "https://st.depositphotos.com/3008028/3901/i/450/depositphotos_39013839-stock-photo-shining-sun-at-clear-blue.jpg";
  } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) {
    bgUrl = "https://zn.ua/img/forall/u/518/53/1617373256_36-p-oboi-letnii-dozhd-38.jpg";
  } else if (condition.includes("snow")) {
    bgUrl = "https://cdn.pixabay.com/photo/2017/01/18/21/53/snowfall-1997285_1280.jpg";
  } else if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) {
    bgUrl = "https://img.freepik.com/premium-photo/foggy-weather-field_361360-3394.jpg";
  } else if (condition.includes("cloud")) {
    bgUrl = "https://city-news.ck.ua/wp-content/uploads/2024/03/14_pogoda3-2000x1332-1.jpg";
  }

  body.style.backgroundImage = `url('${bgUrl}')`;
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
  body.style.backgroundRepeat = "no-repeat";
  body.style.transition = "background-image 1s ease-in-out";
}
