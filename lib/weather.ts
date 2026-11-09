export type WeatherSnapshot = {
  locationLabel: string;
  temperature: number;
  temperatureUnit: "celsius" | "fahrenheit";
  precipitationChance: number;
  windKph: number;
  summary: string;
  source: "open-meteo";
};

function toFahrenheit(celsius: number) {
  return Math.round((celsius * 9) / 5 + 32);
}

export async function fetchWeatherForCoords(input: {
  latitude: number;
  longitude: number;
  cityLabel: string;
  temperatureUnit: "celsius" | "fahrenheit";
}): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    current: "temperature_2m,precipitation,wind_speed_10m,weather_code",
    daily: "precipitation_probability_max",
    forecast_days: "1",
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { next: { revalidate: 300 } },
  );

  if (!response.ok) {
    throw new Error("Open-Meteo did not return a forecast.");
  }

  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      precipitation?: number;
      wind_speed_10m?: number;
      weather_code?: number;
    };
    daily?: { precipitation_probability_max?: number[] };
  };

  const celsius = data.current?.temperature_2m ?? 0;
  const temperature =
    input.temperatureUnit === "fahrenheit" ? toFahrenheit(celsius) : Math.round(celsius);

  const precip = data.current?.precipitation ?? 0;
  const rainChance = data.daily?.precipitation_probability_max?.[0] ?? 0;
  const wind = Math.round(data.current?.wind_speed_10m ?? 0);

  const summary =
    precip > 0 || rainChance >= 40
      ? "Rain likely — bring an umbrella."
      : wind >= 25
        ? "Windy — a light jacket helps."
        : temperature >= 28 && input.temperatureUnit === "celsius"
          ? "Warm and dry."
          : "Comfortable conditions right now.";

  return {
    locationLabel: input.cityLabel,
    temperature,
    temperatureUnit: input.temperatureUnit,
    precipitationChance: rainChance,
    windKph: wind,
    summary,
    source: "open-meteo",
  };
}
