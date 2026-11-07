import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowClockwiseIcon,
  DropIcon,
  EyeIcon,
  GaugeIcon,
  LightbulbIcon,
  MapPinIcon,
  SunHorizonIcon,
  WindIcon,
  type Icon,
} from '@phosphor-icons/react';
import { weatherService, type WeatherData, type DailyForecast } from '@/lib/weather';
import PageHeader from '@/components/PageHeader';
import { pageColumn } from '@/lib/layout';
import { authService } from '@/lib/authService';
import { cn } from '@/lib/utils';

const INDIAN_REGIONS = [
  'Punjab',
  'Tamil Nadu',
  'Maharashtra',
  'Uttar Pradesh',
  'Gujarat',
  'Karnataka',
  'Haryana',
  'Madhya Pradesh'
];

const formatTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

const Metric = ({ icon: MetricIcon, label, value }: { icon: Icon; label: string; value: string }) => (
  <div className="rounded-2xl bg-white/50 p-3 shadow-[inset_0_0_0_0.5px_rgb(27_31_25/0.08)]">
    <dt className="caption-5 flex items-center gap-1 text-field-500">
      <MetricIcon size={14} aria-hidden="true" />
      {label}
    </dt>
    <dd className="body-4 figures mt-1 text-field-900">{value}</dd>
  </div>
);

const Weather = () => {
  const { t } = useTranslation();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('Punjab');

  const loadWeatherData = async (regionOverride?: string) => {
    setLoading(true);
    try {
      const targetRegion = regionOverride || selectedRegion;

      // Try quick GPS or user profile
      try {
        const coords = await weatherService.getCurrentLocation();
        const [weather, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(coords.lat, coords.lon, targetRegion),
          weatherService.getForecast(coords.lat, coords.lon)
        ]);
        setCurrentWeather(weather);
        setForecast(forecastData);
      } catch {
        // Fallback or specified region
        const [weather, forecastData] = await Promise.all([
          weatherService.getWeatherByCity(targetRegion),
          weatherService.getForecast(28.6139, 77.2090)
        ]);
        setCurrentWeather(weather);
        setForecast(forecastData);
      }
    } catch (err) {
      console.error('Weather load notice:', err);
      setCurrentWeather(weatherService.generateFallbackWeather(selectedRegion));
      setForecast(weatherService.generateFallbackForecast());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user has state in profile
    try {
      const user = authService.getCurrentUser();
      if (user && user.state && user.state !== 'India') {
        setSelectedRegion(user.state);
        loadWeatherData(user.state);
        return;
      }
    } catch {
      // Ignore
    }
    loadWeatherData();
  }, []);

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    loadWeatherData(region);
  };

  // One shared scale so every day's bar can be compared at a glance.
  const weekLow = Math.min(...forecast.map((day) => day.temperature.min));
  const weekHigh = Math.max(...forecast.map((day) => day.temperature.max));
  const weekSpan = Math.max(weekHigh - weekLow, 1);

  return (
    <div className="min-h-screen pb-tabbar">
      <PageHeader
        title={t('ui.weather_title')}
        subtitle={t('ui.weather_subtitle')}
        back="/home"
        actions={
          <button
            type="button"
            onClick={() => loadWeatherData()}
            aria-label={t('ui.refresh')}
            className="glass-icon-button"
          >
            <ArrowClockwiseIcon size={20} className={cn(loading && 'animate-spin')} aria-hidden="true" />
          </button>
        }
      />

      <main className={cn(pageColumn('wide'), 'stagger space-y-6 pt-2')}>
        <div
          role="radiogroup"
          aria-label={t('ui.region')}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 [scrollbar-width:none]"
        >
          {INDIAN_REGIONS.map((region) => {
            const selected = selectedRegion === region;
            return (
              <button
                key={region}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelectRegion(region)}
                className={cn(
                  'button-sm h-10 shrink-0 rounded-full px-4 transition-transform duration-500 ease-spring active:scale-95',
                  selected ? 'glass-tinted' : 'glass-pill text-field-700 hover:text-field-900',
                )}
              >
                {region}
              </button>
            );
          })}
        </div>

        <div className="grid items-start gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <section aria-label={currentWeather?.location} className="glass-panel-elevated p-6">
              {currentWeather ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="caption-1 flex items-center gap-1 text-field-600">
                        <MapPinIcon size={16} weight="fill" className="shrink-0 text-leaf-600" aria-hidden="true" />
                        <span className="truncate">{currentWeather.location}</span>
                      </p>
                      <p className="heading-1 figures mt-2 text-field-900">{currentWeather.temperature}°</p>
                      <p className="body-5 mt-2 capitalize text-field-800">{currentWeather.description}</p>
                      <p className="caption-5 figures text-field-500">
                        {t('ui.feels_like', { value: currentWeather.feelsLike })}
                      </p>
                    </div>
                    <img
                      src={weatherService.getWeatherIconUrl(currentWeather.icon)}
                      alt=""
                      className="-m-2 h-24 w-24 shrink-0 object-contain"
                    />
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-3">
                    <Metric icon={DropIcon} label={t('ui.humidity')} value={`${currentWeather.humidity}%`} />
                    <Metric icon={WindIcon} label={t('ui.wind')} value={`${currentWeather.windSpeed} km/h`} />
                    <Metric icon={GaugeIcon} label={t('ui.pressure')} value={`${currentWeather.pressure} hPa`} />
                    <Metric icon={EyeIcon} label={t('ui.visibility')} value={`${currentWeather.visibility} km`} />
                  </dl>

                  <div className="caption-5 figures mt-4 flex items-center justify-between gap-3 border-t border-field-900/10 pt-4 text-field-600">
                    <span className="flex items-center gap-1">
                      <SunHorizonIcon size={16} className="text-amber-600" aria-hidden="true" />
                      {t('ui.sunrise')} {formatTime(currentWeather.sunrise)}
                    </span>
                    <span className="flex items-center gap-1">
                      <SunHorizonIcon size={16} className="rotate-180 text-field-500" aria-hidden="true" />
                      {t('ui.sunset')} {formatTime(currentWeather.sunset)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-4" aria-busy="true">
                  <span className="skeleton block h-4 w-40" />
                  <span className="skeleton block h-14 w-32" />
                  <span className="skeleton block h-4 w-52" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[0, 1, 2, 3].map((cell) => (
                      <span key={cell} className="skeleton block h-16 rounded-2xl" />
                    ))}
                  </div>
                </div>
              )}
            </section>

            {currentWeather && (
              <section className="tip-card">
                <h2 className="title-4 flex items-center gap-2 text-amber-900">
                  <LightbulbIcon size={18} weight="fill" className="text-amber-600" aria-hidden="true" />
                  {t('ui.farm_advice')}
                </h2>
                <p className="body-6 mt-2 text-field-800">{weatherService.generateFarmingAdvice(currentWeather)}</p>
              </section>
            )}
          </div>

          <section aria-labelledby="forecast-heading">
            <h2 id="forecast-heading" className="title-3 mb-3 text-field-800">
              {t('ui.next_7_days')}
            </h2>
            <ol className="glass-panel divide-y divide-field-900/10 rounded-3xl px-4">
              {forecast.length === 0
                ? [0, 1, 2, 3, 4, 5, 6].map((row) => (
                    <li key={row} className="flex items-center gap-4 py-4">
                      <span className="skeleton h-4 w-12" />
                      <span className="skeleton h-8 w-8 rounded-full" />
                      <span className="skeleton h-2 flex-1 rounded-full" />
                    </li>
                  ))
                : forecast.map((day, index) => {
                    const start = ((day.temperature.min - weekLow) / weekSpan) * 100;
                    const width = Math.max(((day.temperature.max - day.temperature.min) / weekSpan) * 100, 6);
                    return (
                      <li key={day.date} className="flex items-center gap-3 py-3">
                        <span className="title-4 w-12 shrink-0 text-field-900">
                          {index === 0 ? t('ui.today') : day.dayName}
                        </span>
                        <img
                          src={weatherService.getWeatherIconUrl(day.icon)}
                          alt={day.description}
                          title={day.description}
                          className="h-10 w-10 shrink-0 object-contain"
                        />
                        <span className="caption-5 figures w-10 shrink-0 text-right text-field-500">
                          {day.temperature.min}°
                        </span>
                        <span className="relative h-2 flex-1 rounded-full bg-field-900/10" aria-hidden="true">
                          <span
                            className="absolute inset-y-0 rounded-full bg-amber-400"
                            style={{ left: `${start}%`, width: `${width}%` }}
                          />
                        </span>
                        <span className="body-4 figures w-10 shrink-0 text-field-900">{day.temperature.max}°</span>
                        <span className="caption-5 figures hidden w-14 shrink-0 items-center justify-end gap-1 text-field-500 sm:flex">
                          <DropIcon size={12} aria-hidden="true" />
                          {day.humidity}%
                        </span>
                      </li>
                    );
                  })}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Weather;
