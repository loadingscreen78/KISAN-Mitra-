import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen,
  Bookmark,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MySavedCultivationGuides = () => {
  const navigate = useNavigate();
  const [savedCultivationGuides, setSavedCultivationGuides] = useState<string[]>([]);

  // Load saved guides
  useEffect(() => {
    const saved = localStorage.getItem('kisanmitra_saved_cultivation_guides');
    setSavedCultivationGuides(saved ? JSON.parse(saved) : []);
  }, []);

  const cultivationGuideData = {
    tomato: { 
      name: 'Tomato', 
      image: '🍅', 
      summary: 'Variety selection + seed treatment; drip irrigation best practices',
      details: 'Complete step-by-step guide for growing healthy tomatoes'
    },
    wheat: { 
      name: 'Wheat', 
      image: '🌾', 
      summary: 'Six-stage irrigation; fertilizer application timing',
      details: 'Comprehensive guide for wheat cultivation and management'
    },
    maize: { 
      name: 'Maize', 
      image: '🌽', 
      summary: 'Land preparation + raised beds; trio fertilizer schedule',
      details: 'Step-by-step maize cultivation guide for optimal yield'
    }
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/advisory')} className="text-white hover:bg-white/20 rounded-full p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Saved Cultivation Guides</h1>
              <p className="text-green-100 text-sm">Your bookmarked farming guides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {savedCultivationCrops.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Info */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {savedCultivationCrops.length} Saved Guide{savedCultivationCrops.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-gray-700 text-base">
                      Your personalized collection of cultivation guides for quick access
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Guides */}
            <div className="space-y-4">
              {savedCultivationCrops.map((crop) => (
                <Card 
                  key={crop.id} 
                  className="bg-white shadow-lg border border-green-100 hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/guides/${crop.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{crop.image}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{crop.name}</h4>
                        <p className="text-gray-600 text-sm mb-2">{crop.details}</p>
                        <p className="text-gray-500 text-sm">{crop.summary}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCultivationGuide(crop.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">No Saved Guides</h3>
            <p className="text-gray-500 mb-8 text-lg leading-relaxed max-w-md mx-auto">
              Save cultivation guides from the Guides section to quickly access them here
            </p>
            <Button 
              onClick={() => navigate('/guides')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg"
            >
              Browse Cultivation Guides
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySavedCultivationGuides;