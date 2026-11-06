import { useState, useEffect } from 'react';
import { 
  BookOpen,
  Bookmark,
  ChevronRight,
  Calendar,
  CheckCircle,
  Clock,
  Droplets,
  Beaker,
  Leaf,
  Star,
  TrendingUp,
  Package,
  ArrowLeft,
  Cloud,
  Sun,
  CloudRain,
  Thermometer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Advisory = () => {
  const navigate = useNavigate();
  const [savedGuidance, setSavedGuidance] = useState<string[]>([]);
  const [savedCultivationGuides, setSavedCultivationGuides] = useState<string[]>([]);
  const [appliedGuidance, setAppliedGuidance] = useState<string[]>(() => {
    const applied = localStorage.getItem('kisanmitra_applied_guidance');
    return applied ? JSON.parse(applied) : [];
  });

  // Load saved guides
  useEffect(() => {
    const savedFertilizer = localStorage.getItem('kisanmitra_saved_fertilizer_guides');
    setSavedGuidance(savedFertilizer ? JSON.parse(savedFertilizer) : []);
    
    const savedCultivation = localStorage.getItem('kisanmitra_saved_cultivation_guides');
    setSavedCultivationGuides(savedCultivation ? JSON.parse(savedCultivation) : []);
  }, []);

  const cropData = {
    'tomato': {
      name: 'Tomato',
      image: '🍅',
      season: 'Kharif/Rabi',
      fertilizers: [
        { name: 'NPK (10:26:26)', quantity: '200 kg/acre', timing: 'At planting' },
        { name: 'Urea (46% N)', quantity: '50 kg/acre', timing: '20 days after transplant' },
        { name: 'Calcium Nitrate', quantity: '25 kg/acre', timing: 'Flowering stage' }
      ]
    },
    'wheat': {
      name: 'Wheat',
      image: '🌾',
      season: 'Rabi',
      fertilizers: [
        { name: 'DAP (18:46:0)', quantity: '150 kg/acre', timing: 'At sowing' },
        { name: 'Urea (46% N)', quantity: '65 kg/acre', timing: '1st irrigation (21 days)' },
        { name: 'Urea (46% N)', quantity: '65 kg/acre', timing: '2nd irrigation (45 days)' }
      ]
    },
    'rice': {
      name: 'Rice',
      image: '🌾',
      season: 'Kharif',
      fertilizers: [
        { name: 'NPK (12:32:16)', quantity: '125 kg/acre', timing: 'Before transplanting' },
        { name: 'Urea (46% N)', quantity: '45 kg/acre', timing: '15 days after transplant' },
        { name: 'Urea (46% N)', quantity: '45 kg/acre', timing: 'At panicle initiation' }
      ]
    },
    'cotton': {
      name: 'Cotton',
      image: '☁️',
      season: 'Kharif',
      fertilizers: [
        { name: 'NPK (17:17:17)', quantity: '100 kg/acre', timing: 'At sowing' },
        { name: 'Urea (46% N)', quantity: '60 kg/acre', timing: '30-35 days after sowing' },
        { name: 'MOP (60% K2O)', quantity: '35 kg/acre', timing: 'At flowering' }
      ]
    },
    'maize': {
      name: 'Maize',
      image: '🌽',
      season: 'Kharif/Rabi',
      fertilizers: [
        { name: 'NPK (12:32:16)', quantity: '125 kg/acre', timing: 'At sowing' },
        { name: 'Urea (46% N)', quantity: '65 kg/acre', timing: '25-30 days after sowing' },
        { name: 'Urea (46% N)', quantity: '65 kg/acre', timing: 'Pre-tasseling stage' }
      ]
    }
  };

  const toggleAppliedStatus = (cropId: string) => {
    const updatedApplied = appliedGuidance.includes(cropId)
      ? appliedGuidance.filter(id => id !== cropId)
      : [...appliedGuidance, cropId];
    
    setAppliedGuidance(updatedApplied);
    localStorage.setItem('kisanmitra_applied_guidance', JSON.stringify(updatedApplied));
  };

  const savedCrops = savedGuidance.map(id => ({
    id,
    ...cropData[id as keyof typeof cropData]
  })).filter(crop => crop.name); // Filter out any invalid entries

  const cultivationGuideData = {
    tomato: { name: 'Tomato', image: '🍅', summary: 'Variety selection + seed treatment; drip irrigation best practices' },
    wheat: { name: 'Wheat', image: '🌾', summary: 'Six-stage irrigation; fertilizer application timing' },
    maize: { name: 'Maize', image: '🌽', summary: 'Land preparation + raised beds; trio fertilizer schedule' }
  };

  const savedCultivationCrops = savedCultivationGuides.map(id => ({
    id,
    ...cultivationGuideData[id as keyof typeof cultivationGuideData]
  })).filter(crop => crop.name);

  const removeCultivationGuide = (guideId: string) => {
    const updated = savedCultivationGuides.filter(id => id !== guideId);
    setSavedCultivationGuides(updated);
    localStorage.setItem('kisanmitra_saved_cultivation_guides', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            className="text-white hover:bg-white/20 rounded-full p-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-xl font-bold text-white flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Advisory
          </h1>
          
          <div className="w-12" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-8">

        {/* Saved Cultivation Guides Card */}
        <Card 
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200"
          onClick={() => navigate('/my-saved-cultivation-guides')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Saved Cultivation Guides</h3>
                <p className="text-gray-500 text-sm">
                  {savedCultivationCrops.length > 0 
                    ? `${savedCultivationCrops.length} saved guide${savedCultivationCrops.length !== 1 ? 's' : ''} • View all saved guides`
                    : 'Save cultivation guides to see them here'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {savedCultivationCrops.length > 0 && (
                  <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    {savedCultivationCrops.length}
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Fertilizer Guidance Card - Always clickable like Market Prices */}
        <Card 
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200"
          onClick={() => navigate('/my-fertilizer-guidance')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Beaker className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">My Fertilizer Guidance</h3>
                <p className="text-gray-500 text-sm">
                  {savedCrops.length > 0 
                    ? `${savedCrops.length} saved crop${savedCrops.length !== 1 ? 's' : ''} • ${appliedGuidance.length} applied`
                    : 'Save fertilizer guidance to see them here'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {savedCrops.length > 0 && (
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {savedCrops.length}
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* My Crops Card */}
        <Card 
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200"
          onClick={() => navigate('/sell')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">My Crops</h3>
                <p className="text-gray-500 text-sm">View your sold crops and listings</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  View Listings
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Advisory;