import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import onboarding1 from '@/assets/onboarding-1.png';
import onboarding2 from '@/assets/onboarding-2.png';
import onboarding3 from '@/assets/onboarding-3.png';

const onboardingData = [
  {
    id: 1,
    image: onboarding1,
    title: 'Find out what is wrong with a sick plant',
    description: 'Take a photo of one leaf. KisanMitra names the likely disease and how to treat it.',
  },
  {
    id: 2,
    image: onboarding2,
    title: 'Buy inputs and sell your harvest',
    description: 'Order seeds and fertilizer, check mandi prices and list your crop for buyers.',
  },
  {
    id: 3,
    image: onboarding3,
    title: 'Plan field work around the weather',
    description: 'See the 7 day forecast for your area and know when it is safe to spray.',
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const isLast = currentStep === onboardingData.length - 1;
  const currentData = onboardingData[currentStep];

  const handleGetStarted = () => {
    localStorage.setItem('kisanmitra_onboarding_seen', 'true');
    navigate('/');
  };

  const handleNext = () => {
    if (isLast) handleGetStarted();
    else setCurrentStep(currentStep + 1);
  };

  return (
    <div className="flex min-h-screen flex-col px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(currentStep - 1)}
          aria-label="Previous"
          className={cn('glass-icon-button', currentStep === 0 && 'pointer-events-none opacity-0')}
        >
          <ArrowLeftIcon size={20} weight="bold" aria-hidden="true" />
        </button>
        <button type="button" onClick={handleGetStarted} className="button-sm h-11 rounded-full px-4 text-field-600 hover:text-field-900">
          Skip
        </button>
      </div>

      <main key={currentData.id} className="mx-auto flex w-full max-w-md flex-1 animate-rise-in flex-col items-center justify-center text-center">
        <img src={currentData.image} alt="" className="h-60 w-full max-w-xs object-contain" />
        <h1 className="heading-4 mt-8 text-field-900">{currentData.title}</h1>
        <p className="body-3 mt-4 text-field-600">{currentData.description}</p>
      </main>

      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex justify-center gap-2" aria-hidden="true">
          {onboardingData.map((step, index) => (
            <span
              key={step.id}
              className={cn(
                'h-2 rounded-full transition-[width,background-color] duration-500',
                index === currentStep ? 'w-8 bg-leaf-600' : 'w-2 bg-field-900/15',
              )}
            />
          ))}
        </div>
        <Button size="lg" className="w-full" onClick={handleNext}>
          {isLast ? 'Get started' : 'Next'}
          <ArrowRightIcon weight="bold" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
