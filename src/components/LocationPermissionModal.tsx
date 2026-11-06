import React from 'react';
import { MapPin, Shield, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onRequestPermission: () => void;
  onSkip: () => void;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onRequestPermission,
  onSkip,
  permissionStatus
}) => {
  const getModalContent = () => {
    switch (permissionStatus) {
      case 'denied':
        return {
          icon: <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />,
          title: "Location Access Blocked",
          description: "Location access has been denied. To auto-fill your location, please:",
          instructions: [
            "Click the location icon in your browser's address bar",
            "Select 'Allow' for location access",
            "Refresh this page and try again"
          ],
          buttonText: "Manual Entry Instead",
          buttonAction: onSkip
        };
      
      case 'unsupported':
        return {
          icon: <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />,
          title: "Location Not Supported",
          description: "Your device doesn't support automatic location detection.",
          instructions: [
            "You can manually select your state and district",
            "This won't affect your farming experience"
          ],
          buttonText: "Continue Manually",
          buttonAction: onSkip
        };
      
      default:
        return {
          icon: <Navigation className="w-16 h-16 text-agri-primary mx-auto mb-4" />,
          title: "Help Us Serve You Better",
          description: "KisanMitra would like to access your location to:",
          instructions: [
            "🌾 Auto-fill your state and district",
            "🌤️ Provide local weather information",
            "📍 Show nearby farming services",
            "💰 Display regional market prices"
          ],
          buttonText: "Allow Location Access",
          buttonAction: onRequestPermission
        };
    }
  };

  const { icon, title, description, instructions, buttonText, buttonAction } = getModalContent();

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm mx-auto bg-white rounded-3xl p-6 border-2 border-agri-primary/20">
        <DialogHeader className="text-center">
          {icon}
          <DialogTitle className="text-2xl font-bold text-agri-primary mb-2">
            {title}
          </DialogTitle>
          <DialogDescription className="text-agri-gray text-base mb-4">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-agri-light/30 rounded-2xl p-4">
            <ul className="space-y-2">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex items-start text-agri-gray text-sm">
                  <span className="inline-block w-2 h-2 rounded-full bg-agri-primary mr-3 mt-2 flex-shrink-0" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={buttonAction}
              className="w-full h-14 bg-agri-primary hover:bg-agri-secondary text-white font-bold text-lg rounded-2xl"
            >
              {buttonText}
            </Button>
            
            {permissionStatus === 'prompt' && (
              <Button
                onClick={onSkip}
                variant="outline"
                className="w-full h-12 border-2 border-agri-primary/30 text-agri-primary font-semibold rounded-2xl hover:bg-agri-light/50"
              >
                Enter Manually
              </Button>
            )}
          </div>

          {permissionStatus === 'prompt' && (
            <div className="flex items-center justify-center text-center pt-2">
              <Shield className="w-4 h-4 text-agri-primary mr-2" />
              <p className="text-xs text-agri-gray">
                Your location data is secure and stays on your device
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPermissionModal;