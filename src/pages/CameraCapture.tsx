import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowCounterClockwiseIcon,
  CameraRotateIcon,
  CameraSlashIcon,
  CheckIcon,
  ImageSquareIcon,
  XIcon,
} from '@phosphor-icons/react';
import { toast } from '@/components/ui/use-toast';
import { useGoBack } from '@/hooks/useGoBack';
import { captureFrame, shrinkImage } from '@/lib/image';
import { cn } from '@/lib/utils';

type Facing = 'environment' | 'user';
type CameraState = 'starting' | 'live' | 'unavailable';

const reasonFor = (error: unknown) => {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'ui.camera_denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'ui.camera_missing';
  if (name === 'NotReadableError') return 'ui.camera_busy';
  return 'ui.camera_denied';
};

/**
 * Full screen camera in the style of a native camera app. The viewfinder takes
 * whatever height is left between the header and the controls, so the shutter
 * is always on screen, from a phone to a wide desktop window.
 */
const CameraCapture = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Bumped on every start and on unmount, so a slow permission prompt that
  // resolves late cannot leave a stream running.
  const sessionRef = useRef(0);
  const [facing, setFacing] = useState<Facing>('environment');
  const [cameraState, setCameraState] = useState<CameraState>('starting');
  const [reason, setReason] = useState('ui.camera_denied');
  const [canFlip, setCanFlip] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (mode: Facing) => {
    stopCamera();
    const session = ++sessionRef.current;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setReason('ui.camera_insecure');
      setCameraState('unavailable');
      return;
    }
    setCameraState('starting');
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') throw error;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      if (session !== sessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraState('live');
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCanFlip(devices.filter((device) => device.kind === 'videoinput').length > 1);
    } catch (error) {
      if (session !== sessionRef.current) return;
      console.error('Error accessing camera:', error);
      setReason(reasonFor(error));
      setCameraState('unavailable');
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!capturedImage) startCamera(facing);
  }, [facing, capturedImage, startCamera]);

  // Never leave the camera running after this screen closes.
  useEffect(
    () => () => {
      sessionRef.current += 1;
      stopCamera();
    },
    [stopCamera],
  );

  const leave = () => {
    stopCamera();
    goBack('/diagnose');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const frame = captureFrame(video);
    if (!frame) return;
    setFlash(true);
    navigator.vibrate?.(12);
    setCapturedImage(frame);
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'That file is not a photo', description: 'Choose a JPEG, PNG or WebP image.', variant: 'destructive' });
      return;
    }
    shrinkImage(file)
      .then((image) => {
        stopCamera();
        setCapturedImage(image);
      })
      .catch(() => {
        toast({ title: 'Could not read this image', description: 'Choose a JPEG, PNG or WebP photo.', variant: 'destructive' });
      });
  };

  const usePhoto = () => {
    if (!capturedImage) return;
    try {
      localStorage.setItem('plant_image', capturedImage);
      navigate('/diagnose/analyze');
    } catch {
      toast({
        title: 'Could not keep this photo',
        description: 'The photo is too large to store on this device. Try a smaller one.',
        variant: 'destructive',
      });
    }
  };

  const retake = () => setCapturedImage(null);

  const sideButton = 'glass-dark grid h-14 w-14 shrink-0 place-items-center rounded-full transition-transform duration-500 ease-spring active:scale-90';

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-field-950 text-white">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
        <button type="button" onClick={leave} aria-label={t('navigation.back')} className="glass-dark grid h-11 w-11 place-items-center rounded-full">
          <XIcon size={20} weight="bold" aria-hidden="true" />
        </button>
        <h1 className="title-3 truncate">{capturedImage ? t('ui.camera_review') : t('ui.camera_title')}</h1>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center px-4">
        <div className="relative min-h-0 w-full max-w-4xl flex-1 overflow-hidden rounded-3xl bg-black shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured leaf" className="absolute inset-0 h-full w-full animate-fade-in object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
                  cameraState === 'live' ? 'opacity-100' : 'opacity-0',
                  facing === 'user' && '-scale-x-100',
                )}
              />

              {cameraState === 'live' && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 animate-fade-in">
                  <div className="absolute left-1/2 top-1/2 aspect-square w-[min(72%,26rem)] -translate-x-1/2 -translate-y-1/2">
                    <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-[3px] border-t-[3px] border-white/85" />
                    <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-[3px] border-t-[3px] border-white/85" />
                    <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-[3px] border-l-[3px] border-white/85" />
                    <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-[3px] border-r-[3px] border-white/85" />
                  </div>
                  <p className="glass-dark caption-1 absolute bottom-4 left-1/2 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full px-4 py-2 text-center">
                    {t('ui.camera_hint')}
                  </p>
                </div>
              )}

              {cameraState === 'starting' && (
                <p className="caption-1 absolute inset-0 grid place-items-center text-white/70" role="status">
                  {t('ui.camera_starting')}
                </p>
              )}

              {cameraState === 'unavailable' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <span className="glass-dark grid h-16 w-16 place-items-center rounded-2xl">
                    <CameraSlashIcon size={32} weight="duotone" aria-hidden="true" />
                  </span>
                  <div className="max-w-sm">
                    <h2 className="heading-6">{t('ui.camera_unavailable')}</h2>
                    <p className="body-6 mt-2 text-white/70">{t(reason)}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="button-md inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-field-900 transition-transform duration-500 ease-spring active:scale-95"
                    >
                      <ImageSquareIcon size={20} aria-hidden="true" />
                      {t('ui.upload_gallery')}
                    </button>
                    {reason !== 'ui.camera_insecure' && (
                      <button type="button" onClick={() => startCamera(facing)} className="glass-dark button-md h-12 rounded-full px-6">
                        {t('ui.try_again')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {flash && (
            <span
              aria-hidden="true"
              onAnimationEnd={() => setFlash(false)}
              className="pointer-events-none absolute inset-0 bg-white [animation:fade-in_300ms_var(--ease-out)_reverse_both]"
            />
          )}
        </div>
      </main>

      <footer className="shrink-0 px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
        {capturedImage ? (
          <div className="mx-auto flex max-w-md items-center gap-3">
            <button type="button" onClick={retake} className="glass-dark button-md flex h-14 flex-1 items-center justify-center gap-2 rounded-full">
              <ArrowCounterClockwiseIcon size={20} weight="bold" aria-hidden="true" />
              {t('ui.retake')}
            </button>
            <button
              type="button"
              onClick={usePhoto}
              className="button-md flex h-14 flex-[1.4] items-center justify-center gap-2 rounded-full bg-white text-leaf-800 transition-transform duration-500 ease-spring active:scale-[0.98]"
            >
              <CheckIcon size={20} weight="bold" aria-hidden="true" />
              {t('ui.use_photo')}
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md items-center justify-between">
            <button type="button" onClick={() => fileInputRef.current?.click()} aria-label={t('ui.upload_gallery')} className={sideButton}>
              <ImageSquareIcon size={24} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              disabled={cameraState !== 'live'}
              aria-label={t('ui.take_photo')}
              className="grid h-20 w-20 place-items-center rounded-full border-4 border-white/90 transition-transform duration-500 ease-spring active:scale-90 disabled:opacity-40"
            >
              <span className="h-16 w-16 rounded-full bg-white" />
            </button>

            {canFlip ? (
              <button
                type="button"
                onClick={() => setFacing((mode) => (mode === 'environment' ? 'user' : 'environment'))}
                aria-label={t('ui.flip_camera')}
                className={sideButton}
              >
                <CameraRotateIcon size={24} aria-hidden="true" />
              </button>
            ) : (
              <span className="h-14 w-14" aria-hidden="true" />
            )}
          </div>
        )}
      </footer>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  );
};

export default CameraCapture;
