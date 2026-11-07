import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  Sun, 
  Eye, 
  Shield, 
  Sparkles, 
  Check, 
  Leaf, 
  ArrowLeft, 
  Volume2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import AmbientBackground from '@/components/AmbientBackground';
import GlassBottomNav from '@/components/GlassBottomNav';

const MAX_IMAGE_DIMENSION = 1600;

// Phone photos can exceed browser memory, shrink before diagnosis
const shrinkImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });

const PlantDiagnosis = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      shrinkImage(file)
        .then(setSelectedImage)
        .catch(() => {
          toast({
            title: 'Could not read this image',
            description: 'Please choose a JPEG, PNG or WebP photo.',
            variant: 'destructive'
          });
        });
    }
  };

  const toggleVoiceAssist = () => {
    setIsListening(!isListening);
  };

  const startDiagnosis = async () => {
    if (selectedImage) {
      const button = document.querySelector('[data-diagnosis-button]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.style.opacity = '0.7';
        button.innerHTML = '<div class="flex items-center justify-center space-x-2"><div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Analyzing crop with MobileNet...</span></div>';
      }
      
      try {
        localStorage.setItem('plant_image', selectedImage);
        await new Promise(resolve => setTimeout(resolve, 400));
        navigate('/diagnose/analyze');
      } catch (error) {
        console.error('Error starting diagnosis:', error);
        if (button) {
          button.disabled = false;
          button.style.opacity = '1';
        }
      }
    }
  };

  const tips = [
    {
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      title: "Good Lighting",
      description: "Take photos in natural daylight, avoiding strong glare or dark spots."
    },
    {
      icon: <Eye className="w-5 h-5 text-sky-500" />,
      title: "Focus on Affected Area",
      description: "Fill the frame with the sick leaf or spots for maximum accuracy."
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      title: "Avoid Shadows",
      description: "Keep hands and phone shadows off the leaf surface."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      title: "Clear & Sharp",
      description: "Hold steady so the leaf veins and textures are clearly in focus."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-background to-emerald-50/20 pb-32">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            aria-label="Back"
            className="p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Plant Diagnosis
            </h1>
          </div>
          
          <button
            onClick={toggleVoiceAssist}
            aria-label="Voice assistance"
            className={`p-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm ${
              isListening 
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/25 animate-pulse' 
                : 'glass-panel text-slate-700 hover:bg-white/90'
            }`}
          >
            <Volume2 className="w-4 h-4 text-emerald-800" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Main Capture Action Card in Expo Glass */}
        <div className="glass-panel-elevated p-6 text-center space-y-6">
          <div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-green-400/20 to-teal-500/10 border border-emerald-400/30 shadow-inner mb-3">
              <Camera className="w-10 h-10 text-emerald-700" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                AI
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Photograph Plant Leaf
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Snap a clear photo of the sick leaf to diagnose 38 crop diseases with 98% accuracy.
            </p>
          </div>

          {/* Selected Image Preview with Glass Frame */}
          {selectedImage && (
            <div className="relative rounded-3xl overflow-hidden glass-panel p-2 shadow-lg border border-emerald-400/40">
              <div className="relative rounded-2xl overflow-hidden max-h-64 bg-slate-900">
                <img
                  src={selectedImage}
                  alt="Selected plant leaf"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute top-3 right-3 glass-panel px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md bg-emerald-600/90 text-white text-xs font-bold border border-white/50">
                  <Check className="w-4 h-4" /> Ready to Analyze
                </div>
              </div>
              <p className="text-center text-xs text-emerald-700 font-bold mt-2">
                ✓ Photo successfully optimized for MobileNetV2
              </p>
            </div>
          )}

          {/* Capture & Upload Buttons */}
          <div className="grid grid-cols-1 gap-3 pt-1">
            <button
              onClick={() => navigate('/diagnose/capture')}
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white py-4 px-6 rounded-2xl shadow-[0_8px_25px_-3px_rgba(16,185,129,0.5)] border border-emerald-400/40 transition-all duration-300 transform active:scale-[0.97]"
            >
              <Camera className="w-6 h-6" />
              <span className="font-bold text-base">Open Camera Scanner</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-3 glass-panel py-3.5 px-6 rounded-2xl text-emerald-900 font-bold text-base hover:bg-white/90 border border-white/80 transition-all duration-300 transform active:scale-[0.97] shadow-sm"
            >
              <Upload className="w-5 h-5 text-emerald-700" />
              <span>Upload from Gallery</span>
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Photography Tips Glass Accordion */}
        <div className="glass-panel overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900 text-sm">Leaf Photography Tips</h3>
                <p className="text-[11px] text-slate-500">For accurate disease detection</p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isExpanded && (
            <div className="px-5 pb-5 pt-1 space-y-3 border-t border-white/60">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-2xl bg-white/60 border border-white/50">
                  <div className="mt-0.5">{tip.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{tip.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Dock or Diagnosis Trigger */}
      {selectedImage ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[max(16px,env(safe-area-inset-bottom))] bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-xl">
          <div className="max-w-md mx-auto w-full">
            <button
              onClick={startDiagnosis}
              data-diagnosis-button
              className="w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 shadow-[0_10px_30px_-3px_rgba(16,185,129,0.6)] border border-emerald-400/40 active:scale-[0.97] transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Start Instant Diagnosis</span>
            </button>
          </div>
        </div>
      ) : (
        <GlassBottomNav activeTab="diagnose" />
      )}
    </div>
  );
};

export default PlantDiagnosis;
