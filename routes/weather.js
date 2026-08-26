const express = require('express');
const router = express.Router();

// Maps Open-Meteo's numeric weather codes to plain-English descriptions
const weatherDescriptions = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  95: 'Thunderstorm'
};

// Takes latitude/longitude from the frontend, calls two external APIs, and returns simplified data
router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'Latitude and longitude must be valid numbers' });
    }

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!weatherResponse.ok) {
      return res.status(502).json({ message: 'Could not fetch weather data' });
    }
    const weatherData = await weatherResponse.json();

    const locationResponse = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!locationResponse.ok) {
      return res.status(502).json({ message: 'Could not fetch location data' });
    }
    const locationData = await locationResponse.json();

    res.status(200).json({
      city: locationData.city || locationData.locality || 'Unknown location',
      country: locationData.countryName || '',
      temperature: weatherData.current_weather.temperature,
      condition: weatherDescriptions[weatherData.current_weather.weathercode] || 'Unknown'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching weather data', error: error.message });
  }
});

module.exports = router;
