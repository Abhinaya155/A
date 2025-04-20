const API_KEY = "618de78bde2365ff255665ed3d5e2a56";

let weatherData = {
    temp: 0,
    windSpeed: 0,
    windDeg: 0,
    humidity: 0,
    condition: "clear",
    isDay: true,
    sunrise: 0,
    sunset: 0,
    city: "Unknown"
};

let plane = { x: 200, y: 150, angle: 0 };



let clouds = [], raindrops = [], snowflakes = [], windArrows = [];
let lightningTimer = 0;

// 📍 Get location
function getLocationAndWeather() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            reverseGeocode(lat, lon);
            fetchWeatherByCoords(lat, lon);
        },
        () => {
            fetchWeatherByCoords(28.6139, 77.2090); // Delhi coordinates
            ; // fallback: New York
        }
    );
}

// 🌍 Reverse geocode for city name (OpenWeather already returns city too)
async function reverseGeocode(lat, lon) {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    if (data.address && data.address.city) {
        weatherData.city = data.address.city;
    }
}

async function fetchWeatherByCoords(lat, lon) {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await res.json();

    const now = Date.now() / 1000;
    weatherData = {
        ...weatherData,
        temp: data.main.temp,
        windSpeed: data.wind.speed,
        windDeg: data.wind.deg,
        humidity: data.main.humidity,
        condition: data.weather[0].main.toLowerCase(),
        isDay: now > data.sys.sunrise && now < data.sys.sunset,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        city: data.name
    };

    const dayEmoji = weatherData.isDay ? "🌞 Day" : "🌙 Night";

    document.getElementById("weather-data").innerText =
        `📍 ${weatherData.city} | ${dayEmoji} | ${data.weather[0].main}, Temp: ${weatherData.temp}°C, Humidity: ${weatherData.humidity}%, Wind: ${weatherData.windSpeed} m/s`;
    
    initElements();
}

function initElements() {
    clouds = Array.from({ length: 5 }, () => ({
        x: Math.random() * 600,
        y: Math.random() * 100 + 20,
        size: Math.random() * 30 + 30
    }));

    raindrops = Array.from({ length: 40 }, () => ({
        x: Math.random() * 600,
        y: Math.random() * 300
    }));

    snowflakes = Array.from({ length: 30 }, () => ({
        x: Math.random() * 600,
        y: Math.random() * 300,
        radius: Math.random() * 2 + 2
    }));

    windArrows = Array.from({ length: 10 }, () => ({
        x: Math.random() * 600,
        y: Math.random() * 300
    }));
}

function drawAndAnimate() {
    const canvas = document.getElementById("weatherCanvas");
    const ctx = canvas.getContext("2d");

    const windAngle = weatherData.windDeg * Math.PI / 180;
    const windDx = Math.cos(windAngle) * weatherData.windSpeed;
    const windDy = Math.sin(windAngle) * weatherData.windSpeed;

  
    // 🔁 Dynamic sky background
    if (weatherData.isDay) {
        ctx.fillStyle = "#87ceeb"; // Light blue
    } else {
        ctx.fillStyle = "#001B33"; // Night blue
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ✨ Stars at night
    if (!weatherData.isDay) {
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * 100;
            const radius = Math.random() * 1.5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();
        }
    }

    // 🌞 or 🌙
    const sunX = 100 + 400 * (weatherData.isDay ? 1 : 0.5);
    const sunY = 80;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = weatherData.isDay ? "yellow" : "#ccc";
    ctx.fill();

    // 🌞/🌙 Label
    ctx.font = "20px Arial";
    ctx.fillStyle = weatherData.isDay ? "black" : "white";
    ctx.fillText(weatherData.isDay ? "🌞 Daytime" : "🌙 Nighttime", canvas.width - 150, 30);

    // Leave rest of the existing visualization below as-is:
    // temperature bars, humidity bars, clouds, wind, rain, snow, lightning

    // (👇 Keep all this part)
    // 🌡 Temp bar
    const tempColor = `rgb(${Math.min(255, weatherData.temp * 10)}, 50, ${255 - weatherData.temp * 4})`;
    ctx.fillStyle = tempColor;
    ctx.fillRect(10, canvas.height - (weatherData.temp + 20) * 3, 25, (weatherData.temp + 20) * 3);
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText(`${weatherData.temp}°C`, 10, canvas.height - (weatherData.temp + 20) * 3 - 5);

    // 💧 Humidity bar
    ctx.fillStyle = "#33ccff";
    ctx.fillRect(50, canvas.height - (weatherData.humidity * 2), 20, weatherData.humidity * 2);
    ctx.fillStyle = "#000";
    ctx.fillText(`${weatherData.humidity}%`, 50, canvas.height - (weatherData.humidity * 2) - 5);

    // ☁️ Clouds
    if (weatherData.condition.includes("cloud")) {
        ctx.fillStyle = "#fff";
        clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.arc(cloud.x + 25, cloud.y - 10, cloud.size * 0.8, 0, Math.PI * 2);
            ctx.arc(cloud.x + 50, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.fill();
            cloud.x += windDx * 0.1;
            if (cloud.x > canvas.width + 60) cloud.x = -60;
        });
    }

    // 🌧 Rain
    if (weatherData.condition.includes("rain")) {
        ctx.strokeStyle = "#33aaff";
        raindrops.forEach(drop => {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + windDx * 0.2, drop.y + 10 + windDy);
            ctx.stroke();
            drop.x += windDx * 0.2;
            drop.y += 5 + windDy;
            if (drop.y > canvas.height) {
                drop.y = -10;
                drop.x = Math.random() * canvas.width;
            }
        });
    }

    // ❄ Snow
    if (weatherData.condition.includes("snow")) {
        ctx.fillStyle = "#fff";
        snowflakes.forEach(snow => {
            ctx.beginPath();
            ctx.arc(snow.x, snow.y, snow.radius, 0, 2 * Math.PI);
            ctx.fill();
            snow.x += windDx * 0.05;
            snow.y += 1 + Math.random();
            if (snow.y > canvas.height) {
                snow.y = -10;
                snow.x = Math.random() * canvas.width;
            }
        });
    }

    // 💨 Wind Arrows
    ctx.strokeStyle = "#444";
    windArrows.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(w.x, w.y);
        ctx.lineTo(w.x + 15 * Math.cos(windAngle), w.y + 15 * Math.sin(windAngle));
        ctx.stroke();
        w.x += windDx * 0.2;
        w.y += windDy * 0.2;
        if (w.x > canvas.width) w.x = 0;
        if (w.y > canvas.height) w.y = 0;
    });

    // ⚡ Lightning
    if (weatherData.condition.includes("storm") || weatherData.condition.includes("thunder")) {
        lightningTimer++;
        if (Math.random() < 0.01 || lightningTimer % 250 === 0) {
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "#ffff33";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(300, 60);
            ctx.lineTo(320, 130);
            ctx.lineTo(290, 130);
            ctx.lineTo(310, 200);
            ctx.stroke();
        }
    }
 
    
    requestAnimationFrame(drawAndAnimate);
}


// 🚀 Start simulation
getLocationAndWeather();
setInterval(getLocationAndWeather, 600000); // refresh every 10 minutes
setTimeout(() => requestAnimationFrame(drawAndAnimate), 1000);

document.getElementById("citySelect").addEventListener("change", (e) => {
    const [lat, lon] = e.target.value.split(",");
    fetchWeatherByCoords(parseFloat(lat), parseFloat(lon));
});


