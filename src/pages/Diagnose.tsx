import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CameraIcon,
  CaretDownIcon,
  CheckCircleIcon,
  EyeIcon,
  HandPalmIcon,
  ImageSquareIcon,
  LeafIcon,
  SunIcon,
  type Icon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import { pageColumn } from '@/lib/layout';
import { cn } from '@/lib/utils';
import { shrinkImage } from '@/lib/image';

const TIPS: { icon: Icon; title: string; body: string }[] = [
  { icon: SunIcon, title: 'ui.tip_light_title', body: 'ui.tip_light_body' },
  { icon: EyeIcon, title: 'ui.tip_focus_title', body: 'ui.tip_focus_body' },
  { icon: HandPalmIcon, title: 'ui.tip_shadow_title', body: 'ui.tip_shadow_body' },
  { icon: LeafIcon, title: 'ui.tip_sharp_title', body: 'ui.tip_sharp_body' },
];

const PlantDiagnosis = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) {
      shrinkImage(file)
        .then(setSelectedImage)
        .catch(() => {
          toast({
            title: 'Could not read this image',
            description: 'Choose a JPEG, PNG or WebP photo.',
            variant: 'destructive'
          });
        });
    }
  };

  const startDiagnosis = () => {
    if (!selectedImage || isStarting) return;
    setIsStarting(true);
    try {
      localStorage.setItem('plant_image', selectedImage);
      navigate('/diagnose/analyze');
    } catch (error) {
      console.error('Error starting diagnosis:', error);
      setIsStarting(false);
      toast({
        title: 'Could not start the diagnosis',
        description: 'The photo is too large to store on this device. Try a smaller photo.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className={cn('min-h-screen', selectedImage ? 'pb-tabbar-cta' : 'pb-tabbar')}>
      <PageHeader title={t('ui.diagnose_title')} width="default" />

      <main className={cn(pageColumn('default'), 'stagger space-y-6 pt-2')}>
        <section className="glass-panel-elevated p-4 sm:p-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-field-900/5 shadow-[inset_0_0_0_1px_rgb(27_31_25/0.08)]">
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Selected leaf" className="h-full w-full animate-fade-in object-cover" />
                <span className="glass-pill caption-3 absolute left-3 top-3 flex items-center gap-1 px-3 py-1 text-leaf-800">
                  <CheckCircleIcon size={16} weight="fill" aria-hidden="true" />
                  {t('ui.photo_ready')}
                </span>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <span className="icon-tile h-16 w-16 rounded-2xl text-leaf-700">
                  <LeafIcon size={32} weight="duotone" aria-hidden="true" />
                </span>
                <div className="max-w-sm">
                  <h2 className="heading-6 text-field-900">{t('ui.diagnose_photo_title')}</h2>
                  <p className="body-6 mt-2 text-field-500">{t('ui.diagnose_photo_body')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button size="lg" onClick={() => navigate('/diagnose/capture')}>
              <CameraIcon weight="fill" aria-hidden="true" />
              {t('ui.open_camera')}
            </Button>
            <Button size="lg" variant="glass" onClick={() => fileInputRef.current?.click()}>
              <ImageSquareIcon aria-hidden="true" />
              {selectedImage ? t('ui.change_photo') : t('ui.upload_gallery')}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </section>

        <section className="glass-panel overflow-hidden rounded-3xl">
          <button
            type="button"
            onClick={() => setTipsOpen((open) => !open)}
            aria-expanded={tipsOpen}
            aria-controls="photo-tips"
            className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-300 hover:bg-white/50"
          >
            <span className="icon-tile h-11 w-11 text-leaf-700">
              <SunIcon size={22} weight="duotone" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="title-4 block text-field-900">{t('ui.photo_tips')}</span>
              <span className="caption-5 block text-field-500">{t('ui.photo_tips_caption')}</span>
            </span>
            <CaretDownIcon
              size={16}
              aria-hidden="true"
              className={cn('shrink-0 text-field-500 transition-transform duration-500 ease-spring', tipsOpen && 'rotate-180')}
            />
          </button>

          <div id="photo-tips" className="disclosure" data-open={tipsOpen}>
            <div>
              <ul className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
                {TIPS.map((tip) => {
                  const TipIcon = tip.icon;
                  return (
                    <li key={tip.title} className="flex gap-3 rounded-2xl bg-white/50 p-3 shadow-[inset_0_0_0_0.5px_rgb(27_31_25/0.08)]">
                      <TipIcon size={20} className="mt-0.5 shrink-0 text-leaf-700" aria-hidden="true" />
                      <span>
                        <span className="title-4 block text-field-900">{t(tip.title)}</span>
                        <span className="caption-5 mt-0.5 block text-field-600">{t(tip.body)}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {selectedImage && (
        <div className="pointer-events-none fixed inset-x-0 bottom-tabbar z-40 animate-slide-up px-4">
          <div className="pointer-events-auto mx-auto max-w-md">
            <button
              type="button"
              onClick={startDiagnosis}
              disabled={isStarting}
              data-diagnosis-button
              className="glass-tinted button-md flex h-14 w-full items-center justify-center gap-2 rounded-full transition-transform duration-500 ease-spring active:scale-[0.98] active:duration-200"
            >
              <LeafIcon size={20} weight="fill" aria-hidden="true" />
              {isStarting ? t('ui.analyzing') : t('ui.start_diagnosis')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDiagnosis;
