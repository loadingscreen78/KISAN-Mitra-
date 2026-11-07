import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BellIcon,
  CameraIcon,
  CaretRightIcon,
  ChartLineUpIcon,
  DropIcon,
  FirstAidKitIcon,
  FlaskIcon,
  MapPinAreaIcon,
  MapPinIcon,
  PackageIcon,
  PlantIcon,
  TestTubeIcon,
  TrendUpIcon,
  WindIcon,
  type Icon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PageHeader from '@/components/PageHeader';
import { pageColumn } from '@/lib/layout';
import { weatherService, type WeatherData } from '@/lib/weather';
import { marketData, type Crop, type Market } from '@/lib/marketData';
import { authService } from '@/lib/authService';
import { dataService } from '@/lib/dataService';
import { cn } from '@/lib/utils';

interface Tool {
  to: string;
  title: string;
  caption: string;
  icon: Icon;
}

const TOOLS: Tool[] = [
  { to: '/soil-health', title: 'home.soil_health', caption: 'home.check_nutrient_levels', icon: TestTubeIcon },
  { to: '/fertilizer-guide', title: 'home.fertilizer_guide', caption: 'home.get_nutrient_advice', icon: FlaskIcon },
  { to: '/market-prices', title: 'ui.mandi_prices', caption: 'ui.rates_by_market', icon: ChartLineUpIcon },
  { to: '/shops', title: 'home.nearby_shops', caption: 'home.find_agri_stores', icon: MapPinAreaIcon },
];

/** A spray call a farmer can act on, from the same numbers the card shows. */
const sprayVerdict = (weather: WeatherData) => {
  const sky = weather.description.toLowerCase();
  if (['rain', 'drizzle', 'thunder', 'storm'].some((word) => sky.includes(word))) {
    return { ok: false, label: 'ui.spray_rain' };
  }
  if (weather.windSpeed > 15) return { ok: false, label: 'ui.spray_wind' };
  return { ok: true, label: 'ui.spray_ok' };
};

const countActiveTreatments = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('active_treatments') || '[]');
    return Array.isArray(saved) ? saved.filter((treatment) => treatment?.status === 'active').length : 0;
  } catch {
    return 0;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [userName, setUserName] = useState('Farmer');
  const [activeTreatments] = useState(countActiveTreatments);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const user = authService.getCurrentUser() || dataService.getCurrentUser();
        if (user) {
          const name = user.name || (user as { user_metadata?: { name?: string } }).user_metadata?.name || 'Farmer';
          setUserName(name);
        } else {
          const localUserData = JSON.parse(localStorage.getItem('kisanmitra_user') || '{}');
          setUserName(localUserData.name || 'Farmer');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        const localUserData = JSON.parse(localStorage.getItem('kisanmitra_user') || '{}');
        setUserName(localUserData.name || 'Farmer');
      }
    };

    loadUserData();
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.good_morning');
    if (hour < 17) return t('greeting.good_afternoon');
    return t('greeting.good_evening');
  };

  // Load weather data
  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true);
        try {
          const location = await weatherService.getCurrentLocation();
          const weatherData = await weatherService.getCurrentWeather(location.lat, location.lon);
          setWeather(weatherData);
          return;
        } catch {
          try {
            const user = authService.getCurrentUser() || dataService.getCurrentUser();
            if (user && (user.location || user.state)) {
              const locationQuery = user.location && user.location !== 'India'
                ? `${user.location}, ${user.state || 'IN'}`
                : user.state && user.state !== 'India'
                ? `${user.state}, IN`
                : null;
              if (locationQuery) {
                const userLocation = await weatherService.getWeatherByCity(locationQuery);
                setWeather(userLocation);
                return;
              }
            }
            const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
            setWeather(defaultWeather);
          } catch {
            const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
            setWeather(defaultWeather);
          }
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeather();
  }, []);

  // Calculate top price hikes dynamically
  const getTopPriceHikes = () => {
    const cropHikes: Array<{crop: string, price: string, trend: string, change: string, changePercent: number}> = [];
    marketData.forEach((market: Market) => {
      market.crops?.forEach((crop: Crop) => {
        if (crop.trend === 'up') {
          const changePercent = parseInt(crop.change?.replace('%', '').replace('+', '') || '0');
          cropHikes.push({
            crop: crop.name,
            price: crop.price,
            trend: crop.trend,
            change: crop.change,
            changePercent
          });
        }
      });
    });

    const uniqueHikes = cropHikes.filter((crop, index, arr) =>
      arr.findIndex(c => c.crop === crop.crop) === index
    );

    return uniqueHikes.sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  };

  const marketPrices = getTopPriceHikes();
  const verdict = weather ? sprayVerdict(weather) : null;

  const farmRows = [
    {
      to: '/treatments',
      icon: FirstAidKitIcon,
      title: t('home.active_treatments'),
      caption: activeTreatments > 0
        ? t('ui.treatments_in_progress', { count: activeTreatments })
        : t('ui.no_active_treatments'),
      count: activeTreatments,
    },
    { to: '/guides', icon: PlantIcon, title: t('home.cultivation_guides'), caption: t('home.growing_tips'), count: 0 },
    { to: '/orders', icon: PackageIcon, title: t('home.my_orders'), caption: t('home.track_purchases'), count: 0 },
  ];

  return (
    <div className="min-h-screen pb-tabbar">
      <PageHeader
        leading={
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src="/assets/kisanmitra-logo-clean.png"
              alt="KisanMitra"
              className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1 shadow-[0_0_0_0.5px_rgb(27_31_25/0.12),0_4px_14px_-8px_rgb(27_31_25/0.35)]"
            />
            <span className="title-3 hidden text-field-900 sm:inline">KisanMitra</span>
          </div>
        }
        actions={
          <>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              aria-label={t('navigation.notifications')}
              className="glass-icon-button"
            >
              <BellIcon size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label={t('navigation.profile')}
              className="glass-icon-button title-4 text-leaf-800"
            >
              {userName ? userName.charAt(0).toUpperCase() : 'F'}
            </button>
          </>
        }
      />

      <main className={cn(pageColumn('wide'), 'stagger space-y-8 pt-2')}>
        <section aria-labelledby="greeting">
          <p className="body-6 text-field-500">{getGreeting()}</p>
          <h1 id="greeting" className="heading-4 truncate text-field-900">
            {userName}
          </h1>
        </section>

        {/* Today: weather and the main action */}
        <section className="grid gap-4 md:grid-cols-2">
          <Link to="/weather" className="glass-card-interactive flex flex-col rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="caption-1 flex min-w-0 items-center gap-1 text-field-600">
                <MapPinIcon size={16} weight="fill" className="shrink-0 text-leaf-600" aria-hidden="true" />
                <span className="truncate">
                  {weatherLoading ? t('ui.finding_location') : weather?.location || 'India'}
                </span>
              </span>
              <span className="caption-4 flex shrink-0 items-center gap-1 text-leaf-700">
                {t('ui.forecast_7_day')}
                <CaretRightIcon size={12} weight="bold" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-4 flex min-h-20 items-center gap-4">
              {weatherLoading || !weather ? (
                <>
                  <span className="skeleton h-16 w-16 shrink-0 rounded-2xl" />
                  <span className="flex-1 space-y-2">
                    <span className="skeleton block h-10 w-28" />
                    <span className="skeleton block h-4 w-36" />
                  </span>
                </>
              ) : (
                <>
                  <img
                    src={weatherService.getWeatherIconUrl(weather.icon)}
                    alt=""
                    className="-m-2 h-20 w-20 shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="heading-2 figures text-field-900">{weather.temperature}°</p>
                    <p className="body-6 truncate capitalize text-field-600">{weather.description}</p>
                  </div>
                </>
              )}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-field-900/10 pt-4">
              <div>
                <dt className="caption-5 flex items-center gap-1 text-field-500">
                  <DropIcon size={14} aria-hidden="true" /> {t('ui.humidity')}
                </dt>
                <dd className="body-4 figures mt-1 text-field-900">
                  {weather && !weatherLoading ? `${weather.humidity}%` : '–'}
                </dd>
              </div>
              <div>
                <dt className="caption-5 flex items-center gap-1 text-field-500">
                  <WindIcon size={14} aria-hidden="true" /> {t('ui.wind')}
                </dt>
                <dd className="body-4 figures mt-1 text-field-900">
                  {weather && !weatherLoading ? `${weather.windSpeed} km/h` : '–'}
                </dd>
              </div>
            </dl>

            {verdict && !weatherLoading && (
              <p className={cn('caption-4 mt-4 flex items-center gap-2', verdict.ok ? 'text-leaf-700' : 'text-amber-800')}>
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-current" />
                {t(verdict.label)}
              </p>
            )}
          </Link>

          <Link to="/diagnose" className="glass-tinted glass-interactive flex flex-col justify-between gap-8 rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="heading-5 text-white">{t('home.diagnose_plant_health')}</h2>
                <p className="body-6 mt-2 text-white/80">{t('home.take_photo_check_diseases')}</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]">
                <CameraIcon size={24} weight="fill" aria-hidden="true" />
              </span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <p className="caption-5 max-w-56 text-white/75">{t('ui.works_on_crops')}</p>
              <span className="button-sm inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-white px-4 text-leaf-800">
                {t('ui.scan_leaf')}
                <CaretRightIcon size={14} weight="bold" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </section>

        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="title-3 mb-3 text-field-800">
            {t('ui.tools')}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TOOLS.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <Link key={tool.to} to={tool.to} className="glass-card-interactive flex min-h-32 flex-col justify-between gap-4 p-4">
                  <span className="icon-tile h-10 w-10 text-leaf-700">
                    <ToolIcon size={22} weight="duotone" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="title-4 block text-field-900">{t(tool.title)}</span>
                    <span className="caption-5 block text-field-500">{t(tool.caption)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-8 md:grid-cols-2 md:gap-4">
          <section aria-labelledby="mandi-heading" className="flex flex-col">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id="mandi-heading" className="title-3 text-field-800">
                {t('home.todays_mandi_prices')}
              </h2>
              <Link to="/market-prices" className="caption-4 rounded-md text-leaf-700 hover:text-leaf-900">
                {t('home.see_prices')}
              </Link>
            </div>
            <div className="glass-panel flex flex-1 flex-col rounded-3xl px-4 pb-4">
              <ul className="divide-y divide-field-900/10">
                {marketPrices.map((item) => (
                  <li key={item.crop} className="flex items-center justify-between gap-3 py-3">
                    <span className="body-5 min-w-0 truncate text-field-900">{item.crop}</span>
                    <span className="shrink-0 text-right">
                      <span className="body-4 figures block text-field-900">{item.price}</span>
                      <span className="caption-3 figures flex items-center justify-end gap-1 text-leaf-700">
                        <TrendUpIcon size={12} weight="bold" aria-hidden="true" />
                        {item.change}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <Button variant="glass" className="mt-auto w-full" onClick={() => navigate('/sell')}>
                <ChartLineUpIcon aria-hidden="true" />
                {t('home.sell_crops')}
              </Button>
            </div>
          </section>

          <section aria-labelledby="farm-heading" className="flex flex-col">
            <h2 id="farm-heading" className="title-3 mb-3 text-field-800">
              {t('home.sections.my_farm')}
            </h2>
            <ul className="glass-panel flex-1 divide-y divide-field-900/10 overflow-hidden rounded-3xl">
              {farmRows.map((row) => {
                const RowIcon = row.icon;
                return (
                  <li key={row.to}>
                    <Link
                      to={row.to}
                      className="flex items-center gap-4 px-4 py-4 transition-colors duration-300 hover:bg-white/50 active:bg-field-900/5"
                    >
                      <span className="icon-tile h-10 w-10 text-leaf-700">
                        <RowIcon size={20} weight="duotone" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="title-4 block truncate text-field-900">{row.title}</span>
                        <span className="caption-5 block truncate text-field-500">{row.caption}</span>
                      </span>
                      {row.count > 0 && (
                        <span className="caption-3 figures grid h-6 min-w-6 place-items-center rounded-full bg-leaf-600 px-2 text-white">
                          {row.count}
                        </span>
                      )}
                      <CaretRightIcon size={16} className="shrink-0 text-field-400" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
