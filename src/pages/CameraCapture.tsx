import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  ArrowLeft, 
  RefreshCw,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useGoBack } from '@/hooks/useGoBack';

const CameraCapture = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCamera, setIsCamera] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      // Try multiple approaches for camera access
      let getUserMedia = null;
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      } else if ((navigator as any).getUserMedia) {
        getUserMedia = (navigator as any).getUserMedia.bind(navigator);
      } else if ((navigator as any).webkitGetUserMedia) {
        getUserMedia = (navigator as any).webkitGetUserMedia.bind(navigator);
      } else if ((navigator as any).mozGetUserMedia) {
        getUserMedia = (navigator as any).mozGetUserMedia.bind(navigator);
      }

      if (!getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      // Try to access camera with different constraint sets
      let mediaStream = null;
      
      try {
        // Try with environment camera first
        mediaStream = await getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (envError) {
        console.log('Environment camera failed, trying any camera:', envError);
        try {
          // Fallback to any available camera
          mediaStream = await getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        } catch (anyError) {
          console.log('Any camera failed, trying basic constraints:', anyError);
          // Final fallback with minimal constraints
          mediaStream = await getUserMedia({
            video: true
          });
        }
      }

      if (mediaStream) {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        console.log('Camera started successfully');
      } else {
        throw new Error('Failed to get media stream');
      }

    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = "Unable to access camera. ";
      
      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow camera permissions when prompted by your browser.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage += "Camera not supported on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage += "Camera is being used by another application.";
      } else if (error.name === 'SecurityError' || error.message.includes('secure')) {
        errorMessage += "Camera access requires HTTPS for security. Please use the Gallery option instead.";
      } else {
        errorMessage += "Please try using the Gallery option instead.";
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Automatically switch to gallery mode
      setIsCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, etc.).",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        toast({
          title: "Image Uploaded",
          description: "Image ready for analysis!",
          variant: "default"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const proceedWithAnalysis = () => {
    if (capturedImage) {
      // Store image in localStorage for the diagnosis process
      localStorage.setItem('plant_image', capturedImage);
      navigate('/diagnose/analyze');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (isCamera) {
      startCamera();
    }
  };

  // Start camera when component mounts - but check network access first
  useEffect(() => {
    const isNetworkAccess = !window.location.hostname.includes('localhost') && 
                           !window.location.hostname.includes('127.0.0.1') &&
                           window.location.protocol === 'http:';
    
    // Check if we're on mobile and using network URL
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isNetworkAccess || (isMobile && window.location.protocol === 'http:')) {
      // Network access via HTTP or mobile HTTP - camera won't work, switch to gallery
      setIsCamera(false);
      toast({
        title: "Camera Unavailable",
        description: isMobile 
          ? "Camera requires HTTPS on mobile devices. Using Gallery mode instead." 
          : "Camera requires HTTPS when accessing from network. Using Gallery mode instead.",
        variant: "default"
      });
    } else if (isCamera) {
      startCamera();
    }
  }, [isCamera, startCamera]);

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="mobile-header bg-agri-cream">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              stopCamera();
              goBack('/diagnose');
            }}
            className="p-2 hover:bg-agri-light rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-agri-accent" />
          </button>
          <h1 className="text-xl font-bold text-agri-accent">
            {capturedImage ? 'Review Image' : 'Capture Plant Image'}
          </h1>
        </div>
      </div>

      <div className="mobile-content space-y-6 pt-4">
        {!capturedImage ? (
          <>
            {/* Camera View */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3]">
              {isCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-agri-light">
                  <Upload className="w-16 h-16 text-agri-primary" />
                </div>
              )}
              
              {/* Camera Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-6 border-2 border-white/50 rounded-2xl" />
                <div className="absolute top-4 left-4 bg-black/20 rounded-full px-3 py-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Capture Methods */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    setIsCamera(true);
                    startCamera();
                  }}
                  variant={isCamera ? "default" : "outline"}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button
                  onClick={() => {
                    setIsCamera(false);
                    stopCamera();
                    fileInputRef.current?.click();
                  }}
                  variant={!isCamera ? "default" : "outline"}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Gallery
                </Button>
              </div>

              {/* Capture Button */}
              {isCamera && stream && (
                <div className="flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white border-4 border-agri-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95 touch-manipulation select-none"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'manipulation'
                    }}
                  >
                    <div className="w-16 h-16 bg-agri-primary rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </>
        ) : (
          <>
            {/* Captured Image Preview */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured plant"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute top-4 right-4 bg-agri-success rounded-full p-2">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Image Quality Check */}
              <div className="bg-agri-light rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Sparkles className="w-5 h-5 text-agri-primary" />
                  <span className="font-semibold text-agri-accent">Image Quality Check</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-agri-gray">Clarity</span>
                    <span className="text-sm font-medium text-agri-success">Good ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-agri-gray">Lighting</span>
                    <span className="text-sm font-medium text-agri-success">Good ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-agri-gray">Plant Focus</span>
                    <span className="text-sm font-medium text-agri-success">Good ✓</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={proceedWithAnalysis}
                  className="flex-1 bg-agri-primary hover:bg-agri-secondary touch-manipulation select-none"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'manipulation'
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Tips */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">📸 Best Photo Tips:</h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            <li>• Focus on affected leaves or areas</li>
            <li>• Ensure good natural lighting</li>
            <li>• Keep image clear and close-up</li>
            <li>• Avoid shadows and reflections</li>
          </ul>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;