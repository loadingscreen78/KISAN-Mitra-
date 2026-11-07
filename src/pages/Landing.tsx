import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  CameraIcon,
  ChartLineUpIcon,
  ChatCircleDotsIcon,
  CheckIcon,
  CloudSunIcon,
  LeafIcon,
  ListChecksIcon,
  StorefrontIcon,
  type Icon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PageHeader from '@/components/PageHeader';
import { pageColumn } from '@/lib/layout';
import { signInWithGoogle, continueAsGuest } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// Crops in the PlantVillage model (see README).
const SUPPORTED_CROPS = [
  'Apple', 'Blueberry', 'Cherry', 'Corn', 'Grape', 'Orange', 'Peach',
  'Bell pepper', 'Potato', 'Raspberry', 'Soybean', 'Squash', 'Strawberry', 'Tomato',
];

const STEPS = [
  { title: 'Photograph one leaf', body: 'Get close so the spots or patches fill the frame. Daylight works best.' },
  { title: 'Read the likely disease', body: 'You see the disease name and how sure the model is. If it is unsure, it says so.' },
  { title: 'Treat it, or ask Mitra', body: 'Follow the treatment steps, or ask Mitra a follow up question in English or Hindi.' },
];

const FEATURES: { icon: Icon; title: string; body: string }[] = [
  { icon: CloudSunIcon, title: 'Weather and spray timing', body: 'A 7 day forecast for your area with a plain call on whether today is safe to spray.' },
  { icon: ChatCircleDotsIcon, title: 'Mitra, by text or voice', body: 'Ask about diseases, fertilizer doses or prices and get answers in English or Hindi.' },
  { icon: ChartLineUpIcon, title: 'Mandi prices', body: 'Compare crop rates across markets before you decide where to sell.' },
  { icon: StorefrontIcon, title: 'Seeds and inputs', body: 'Order seeds, fertilizer and crop protection, and find agri shops near you.' },
];

const GoogleMark = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

/** What a diagnosis looks like in the app. Labelled as an example, not a real reading. */
const ProductPreview = () => (
  <div className="glass-panel-elevated mx-auto w-full max-w-md p-6">
    <div className="flex items-center gap-3">
      <span className="icon-tile h-11 w-11 text-leaf-700">
        <LeafIcon size={22} weight="duotone" aria-hidden="true" />
      </span>
      <div>
        <p className="caption-4 text-field-500">Example result</p>
        <p className="title-2 text-field-900">Tomato, early blight</p>
      </div>
    </div>
    <p className="caption-3 mt-4 inline-flex rounded-full bg-leaf-600/10 px-3 py-1 text-leaf-800">Model is confident</p>
    <h3 className="title-4 mt-4 text-field-900">Next steps</h3>
    <ul className="body-6 mt-2 space-y-2 text-field-700">
      {['Remove lower leaves that show brown rings', 'Spray a copper or mancozeb fungicide as the label directs', 'Water at the base of the plant, not over the leaves'].map((step) => (
        <li key={step} className="flex gap-2">
          <CheckIcon size={16} weight="bold" className="mt-0.5 shrink-0 text-leaf-600" aria-hidden="true" />
          {step}
        </li>
      ))}
    </ul>
    <div className="glass mt-6 rounded-2xl rounded-bl-md p-4">
      <p className="caption-4 flex items-center gap-1 text-leaf-700">
        <ChatCircleDotsIcon size={16} weight="fill" aria-hidden="true" />
        Mitra
      </p>
      <p className="body-6 mt-1 text-field-800">
        इस रोग में पत्तियों पर गोल भूरे धब्बे बनते हैं। बारिश से पहले फफूंदनाशक का छिड़काव करें।
      </p>
    </div>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kisanmitra_user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      // Ignore parse error
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        toast({ title: `Signed in as ${result.user.name}` });
        navigate('/home');
      } else if (result.error) {
        toast({ title: 'Google sign in did not finish', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast({
        title: 'Sign in failed',
        description: 'Check your connection and try again, or continue as a guest.',
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    toast({ title: 'You are using KisanMitra as a guest', description: 'Sign in later to keep your history.' });
    navigate('/home');
  };

  const renderSignIn = (className?: string) => (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isAuthenticating}
      className={cn(
        'glass button-md inline-flex h-12 items-center justify-center gap-3 rounded-full px-6 text-field-900 transition-transform duration-500 ease-spring active:scale-[0.98] disabled:opacity-60',
        className,
      )}
    >
      <GoogleMark />
      {isAuthenticating ? 'Opening Google' : 'Continue with Google'}
    </button>
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        leading={
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src="/assets/kisanmitra-logo-clean.png"
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1 shadow-[0_0_0_0.5px_rgb(27_31_25/0.12),0_4px_14px_-8px_rgb(27_31_25/0.35)]"
            />
            <span className="title-3 text-field-900">KisanMitra</span>
          </div>
        }
        actions={
          <>
            <LanguageSwitcher className="hidden sm:grid" />
            {currentUser ? (
              <Button size="sm" className="h-11 rounded-full px-4" onClick={() => navigate('/home')}>
                Open app
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </Button>
            ) : (
              <Button size="sm" variant="glass" className="h-11 rounded-full px-4" onClick={handleGoogleSignIn} disabled={isAuthenticating}>
                Sign in
              </Button>
            )}
          </>
        }
      />

      <main>
        <section className={cn(pageColumn('wide'), 'grid items-center gap-12 py-12 lg:grid-cols-2 lg:py-20')}>
          <div className="stagger">
            <h1 className="heading-3 max-w-[680px] bg-gradient-to-r from-field-950 to-field-600 bg-clip-text text-transparent sm:heading-2">
              Snap a leaf.
              <br />
              Know the disease.
            </h1>
            <p className="body-3 mt-6 max-w-[680px] text-field-600">
              KisanMitra names the likely disease from a photo of one leaf, shows how to treat it, and answers your
              follow up questions in English or हिन्दी.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {renderSignIn()}
              <Button variant="ghost" size="lg" className="rounded-full" onClick={handleGuestEntry}>
                Explore as a guest
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </Button>
            </div>
            <ul className="caption-1 mt-8 flex flex-wrap gap-x-6 gap-y-2 text-field-600">
              {['Works on 14 crops', 'About a second per photo', 'English and हिन्दी'].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <CheckIcon size={16} weight="bold" className="text-leaf-600" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </section>

        <section aria-labelledby="how-heading" className={cn(pageColumn('wide'), 'py-12')}>
          <h2 id="how-heading" className="heading-4 text-field-900">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="glass-panel rounded-3xl p-6">
                <span className="caption-3 figures grid h-8 w-8 place-items-center rounded-full bg-leaf-600 text-white">
                  {index + 1}
                </span>
                <h3 className="title-2 mt-4 text-field-900">{step.title}</h3>
                <p className="body-6 mt-2 text-field-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="features-heading" className={cn(pageColumn('wide'), 'py-12')}>
          <h2 id="features-heading" className="heading-4 text-field-900">Also in the app</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <li key={feature.title} className="glass-panel flex gap-4 rounded-3xl p-6">
                  <span className="icon-tile h-11 w-11 text-leaf-700">
                    <FeatureIcon size={22} weight="duotone" aria-hidden="true" />
                  </span>
                  <span>
                    <h3 className="title-3 text-field-900">{feature.title}</h3>
                    <p className="body-6 mt-1 text-field-600">{feature.body}</p>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="crops-heading" className={cn(pageColumn('wide'), 'py-12')}>
          <div className="flex items-center gap-3">
            <span className="icon-tile h-11 w-11 text-leaf-700">
              <ListChecksIcon size={22} weight="duotone" aria-hidden="true" />
            </span>
            <h2 id="crops-heading" className="heading-4 text-field-900">Crops the model knows</h2>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {SUPPORTED_CROPS.map((crop) => (
              <li key={crop} className="glass-pill body-5 px-4 py-2 text-field-800">
                {crop}
              </li>
            ))}
          </ul>
          <p className="body-6 mt-4 max-w-[680px] text-field-600">
            Rice, wheat and cotton are not in the model yet. Photos of other crops can be misidentified, so check
            the result against what you see in the field.
          </p>
        </section>

        <section className={cn(pageColumn('wide'), 'py-12')}>
          <div className="glass-tinted rounded-3xl px-6 py-12 text-center sm:px-12">
            <CameraIcon size={32} weight="fill" className="mx-auto" aria-hidden="true" />
            <h2 className="heading-4 mx-auto mt-4 max-w-[680px] text-white">Check your next sick plant in a minute</h2>
            <p className="body-6 mx-auto mt-2 max-w-md text-white/80">
              Free to use. Sign in to keep your history, or start as a guest.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {renderSignIn('w-full sm:w-auto')}
              <button
                type="button"
                onClick={handleGuestEntry}
                className="button-md h-12 w-full rounded-full px-6 text-white ring-1 ring-inset ring-white/40 transition-colors duration-300 hover:bg-white/10 sm:w-auto"
              >
                Explore as a guest
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className={cn(pageColumn('wide'), 'caption-5 flex flex-col gap-2 border-t border-field-900/10 py-8 text-field-500 sm:flex-row sm:justify-between')}>
        <span>KisanMitra, the farmer's friend</span>
        <span>Open source under the MIT License</span>
      </footer>
    </div>
  );
};

export default Landing;
