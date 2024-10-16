import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sun, Cloud } from "lucide-react";

const WeatherCard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather?q=92821&days=1');
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        console.log("Fetched weather data:", data); // Log the data
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error); // Log the error
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <p>Loading weather...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Ensure the weather data is in the expected structure
  if (!weatherData || !weatherData.temp_f || !weatherData.condition) {
    return <p>No weather data available.</p>;
  }

  const temperature = weatherData.temp_f;
  const condition = weatherData.condition.text || "Unknown";
  const recommendation = temperature > 70 ? "Light jacket" : "Warm coat";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Weather</CardTitle>
        <Sun className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={weatherData.condition.icon} alt="weather icon" className="w-12 h-12 mr-2" />
            <div>
              <p className="text-2xl font-bold">{temperature}°F</p>
              <p className="text-sm text-muted-foreground">{condition}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Recommendation:</p>
            <p className="text-sm text-muted-foreground">{recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
