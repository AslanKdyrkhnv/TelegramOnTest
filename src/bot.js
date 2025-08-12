require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function getLocationKey(city) {
  const url = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${
    process.env.API_KEY
  }&q=${encodeURIComponent(city)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.length > 0) return data[0].Key;
  throw new Error("Город не найден");
}

async function getCurrentWeather(key) {
  const url = `https://dataservice.accuweather.com/currentconditions/v1/${key}?apikey=${process.env.API_KEY}&language=ru-RU`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.length > 0) {
    return {
      text: data[0].WeatherText,
      temp: data[0].Temperature.Metric.Value,
    };
  }
  throw new Error("Не удалось получить погоду");
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const city = msg.text?.trim();

  if (!city) {
    return bot.sendMessage(chatId, "Введите название города 🌆");
  }

  try {
    const key = await getLocationKey(city);
    const weather = await getCurrentWeather(key);
    const message = `🌤 Погода в городе ${city}:\n${weather.text}, ${weather.temp}°C`;

    bot.sendMessage(chatId, message);
  } catch (err) {
    bot.sendMessage(chatId, `Ошибка: ${err.message}`);
  }
});

module.exports = bot;
