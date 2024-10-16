// src/app/api/weather/route.js

// GET REQUEST FOR WEATHER API 
export const GET = async (req) => { 
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("q");
    const days = searchParams.get("days") || 1;
    const apiKey = 'f1819e8089b14156bfe223139241510'; // Put in .env file later 
  
    if (!location) {
      return new Response("Location param 'q' is required", { status: 400 });
    }
    
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=${days}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
  
      const weatherData = await response.json();
    // Convert localtime to a 12-hour format using Date object
    const formatTime = (localtime) => {
        const date = new Date(localtime.replace(" ", "T")); // Replace space with "T" for ISO format
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    };
    // Extract Data
      const data = {
        temp_f: weatherData.current.temp_f,
        condition: weatherData.current.condition,
        time: formatTime(weatherData.location.localtime)
      }

      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  };
  