import clearDay from "../assets/clear-day.svg";
import fogDay from "../assets/fog-day.svg";
import rainDay from "../assets/rain-day.svg";
import snowDay from "../assets/snow-day.svg";
import thunderstorm from "../assets/thunderstorm.svg";
import clearNight from "../assets/clear-night.svg";
import fogNight from "../assets/fog-night.svg";
import rainNight from "../assets/rain-night.svg";
import snowNight from "../assets/snow-night.svg";
import prevIcon from "../assets/prev-icon.svg";
import nextIcon from "../assets/next-icon.svg";
import weatherIcon from "../assets/weather-icon.svg";

export default function TodaySchedule() {
  return <p>hi</p>;
}


const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API;

function Weather(){
  const [weatherForcast, setWeatherForcast] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(() => {
      const currentTime = new Date().getHours();
      return Math.floor(currentTime / 4);
    });
    const [sunRiseTime, setSunRiseTime] = useState(null);
    const [sunSetTime, setSunSetTime] = useState(null);
    const [currentWeatherForcast, setCurrentWeatherForcast] = useState([]);
  
    useEffect(() => {
      const getLocation = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (positon) => {
              resolve({
                latitude: positon.coords.latitude,
                longitude: positon.coords.longitude,
              });
            },
            (error) => {
              reject(error);
            }
          );
        });
      };
  
      const getWeatherForcast = async () => {
        try {
          const location = await getLocation();
          const response = await fetch(
            `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location.latitude},${location.longitude}`,
            { method: "GET" }
          );
          const jsonRes = await response.json();
          const forecast = jsonRes.forecast.forecastday[0].hour;
  
          for (let i = 0; i < 24; i += 4) {
            const slicedForcast = forecast.slice(i, i + 4);
            setWeatherForcast((prev) => [...prev, slicedForcast]);
          }
  
          const sunRiseForecast = jsonRes.forecast.forecastday[0].astro.sunrise;
          const sunSetForecast = jsonRes.forecast.forecastday[0].astro.sunset;
  
          const SUNRISE_TIME =
            sunRiseForecast.split(" ")[1] === "PM"
              ? Number(sunRiseForecast.split(":")[0]) + 12
              : Number(sunRiseForecast.split(":")[0]);
          const SUNSET_TIME =
            sunSetForecast.split(" ")[1] === "PM"
              ? Number(sunSetForecast.split(":")[0]) + 12
              : Number(sunSetForecast.split(":")[0]);
  
          setSunRiseTime(SUNRISE_TIME);
          setSunSetTime(SUNSET_TIME);
        } catch (err) {
          console.error(err);
        }
      };
  
      getWeatherForcast();
    }, []);
  
    useEffect(() => {
      if (weatherForcast[currentIndex]) {
        setCurrentWeatherForcast(weatherForcast[currentIndex]);
      }
    }, [currentIndex, weatherForcast]);
  
    const getWeatherImageSrc = (code, time) => {
      const isNight = (time) => {
        return time >= sunSetTime || time < sunRiseTime;
      };
      const clearOrCloudy = [
        1000, // Sunny / Clear
        1003, // Partly cloudy
        1006, // Cloudy
        1009, // Overcast
      ];
      const foggy = [
        1030, // Mist
        1135, // Fog
        1147, // Freezing fog
      ];
  
      const rain = [
        1063,
        1150,
        1153,
        1168,
        1171,
        1180,
        1183,
        1186,
        1189,
        1192,
        1195,
        1198,
        1201,
        1240,
        1243,
        1246,
        1273,
        1276, // rain with thunder
      ];
  
      const snowOrIce = [
        1066,
        1069,
        1072,
        1114,
        1117,
        1204,
        1207,
        1210,
        1213,
        1216,
        1219,
        1222,
        1225,
        1237,
        1249,
        1252,
        1255,
        1258,
        1261,
        1264,
        1279,
        1282, // snow with thunder
      ];
      const thunder = [
        1087, // Thundery outbreaks possible
        1273, // Patchy light rain with thunder
        1276, // Moderate or heavy rain with thunder
        1279, // Patchy light snow with thunder
        1282, // Moderate or heavy snow with thunder
      ];
  
      if (isNight(time)) {
        if (clearOrCloudy.includes(code)) return clearNight;
        if (foggy.includes(code)) return fogNight;
        if (rain.includes(code)) return rainNight;
        if (snowOrIce.includes(code)) return snowNight;
        if (thunder.includes(code)) return thunderstorm;
      } else {
        if (clearOrCloudy.includes(code)) return clearDay;
        if (foggy.includes(code)) return fogDay;
        if (rain.includes(code)) return rainDay;
        if (snowOrIce.includes(code)) return snowDay;
        if (thunder.includes(code)) return thunderstorm;
      }
      return fogDay;
    };
  
    const handleNext = () => {
      if (currentIndex < weatherForcast.length - 1) {
        setCurrentIndex((prev) => (prev += 1));
      }
    };
    const handlePrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => (prev -= 1));
      }
    };
  return (
    <div className="w-full grid grid-rows-5 items-center justify-items-center gap-y-1">
            <div className="w-full h-full flex items-center justify-between">
              <div className="flex items-center gap-x-1">
                <span className="text-[17px] font-semibold">Today's Weather</span>
                <img src={weatherIcon} className="w-5 h-5 mt-1" />
              </div>
              <div className="flex items-center gap-x-2">
                <img
                  src={prevIcon}
                  className="w-4 h-4 cursor-pointer"
                  onClick={handlePrev}
                />
                <img
                  src={nextIcon}
                  className="w-4 h-4 cursor-pointer"
                  onClick={handleNext}
                />
              </div>
            </div>
            {currentWeatherForcast.length > 0 ? (
              currentWeatherForcast.map((forcast, index) => (
                <div
                  key={index}
                  className={`w-full h-full flex items-center justify-around border ${
                    forcast.time.split(" ")[1].split(":")[0] ===
                    String(new Date().getHours()).padStart(2, "0")
                      ? "border-[#295FA6] shadow-md"
                      : "border-gray-300"
                  } rounded-md p-1 gap-x-2`}
                >
                  <span className="font-semibold text-black">
                    {forcast.time.split(" ")[1].split(":")[0]}:00
                  </span>
                  <img
                    src={getWeatherImageSrc(
                      forcast.condition.code,
                      Number(forcast.time.split(" ")[1].split(":")[0])
                    )}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-black">
                    {forcast.temp_c}°C ({forcast.temp_f}°F)
                  </span>
                  <span className="text-gray-500">
                    Feels like {forcast.feelslike_c}°C
                  </span>
                  <div className="flex items-center gap-x-2">
                    <img src={rainDay} className="w-5 h-5" />
                    <span>{forcast.chance_of_rain}%</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-gray-300">Loading...</span>
            )}
          </div>
  )
}
