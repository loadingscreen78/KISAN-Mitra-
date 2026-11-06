import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Sprout,
  Droplets,
  Sun,
  Scissors,
  Beaker,
  Shield,
  Heart,
  Leaf,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const CropGuideDetail = () => {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const [savedGuides, setSavedGuides] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Load saved guides from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kisanmitra_saved_cultivation_guides');
    setSavedGuides(saved ? JSON.parse(saved) : []);
  }, []);

  const toggleSaveGuide = (guideId: string) => {
    const updatedSaved = savedGuides.includes(guideId)
      ? savedGuides.filter(id => id !== guideId)
      : [...savedGuides, guideId];
    
    setSavedGuides(updatedSaved);
    localStorage.setItem('kisanmitra_saved_cultivation_guides', JSON.stringify(updatedSaved));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const cropData = {
    tomato: {
      name: 'Tomato',
      image: '🍅',
      description: 'Complete step-by-step guide for growing healthy tomatoes',
      sections: [
        {
          id: 'variety-seed',
          title: 'Variety & Seed Treatment',
          icon: Sprout,
          points: [
            'Choose disease-resistant varieties like Indeterminate or Determinate types',
            'Treat seeds with fungicide (Thiram 2g/kg) before sowing',
            'Soak seeds in warm water for 6-8 hours for better germination'
          ],
          illustration: '🌱'
        },
        {
          id: 'land-prep',
          title: 'Land Preparation & Sowing',
          icon: Sun,
          points: [
            'Prepare well-drained beds with 15-20cm height',
            'Mix organic compost (5-10 tons/hectare) in soil',
            'Maintain spacing of 60cm x 45cm between plants'
          ],
          illustration: '🚜'
        },
        {
          id: 'fertilization',
          title: 'Fertilization & Nutrient Management',
          icon: Beaker,
          points: [
            'Apply NPK (19:19:19) at 400kg/hectare as basal dose',
            'First top dressing with Urea (50kg/hectare) after 20 days',
            'Apply Calcium Nitrate during flowering to prevent blossom end rot'
          ],
          illustration: '⚗️'
        },
        {
          id: 'irrigation',
          title: 'Irrigation Schedule',
          icon: Droplets,
          points: [
            'Install drip irrigation system for water efficiency',
            'Water daily for first 2 weeks, then alternate days',
            'Maintain soil moisture at 70-80% field capacity'
          ],
          illustration: '💧'
        },
        {
          id: 'support-control',
          title: 'Support/Weed/Disease Control',
          icon: Shield,
          points: [
            'Install bamboo stakes or trellis system for plant support',
            'Manual weeding or use herbicides like Pendimethalin',
            'Apply Copper Oxychloride for early blight prevention'
          ],
          illustration: '🛡️'
        }
      ]
    },
    wheat: {
      name: 'Wheat',
      image: '🌾',
      description: 'Comprehensive guide for wheat cultivation and management',
      sections: [
        {
          id: 'variety-seed',
          title: 'Variety & Seed Treatment',
          icon: Sprout,
          points: [
            'Select high-yielding varieties like HD-2967, PBW-343, or DBW-88',
            'Treat seeds with fungicide (Vitavax 2.5g/kg) against seed-borne diseases',
            'Use certified seeds with 90%+ germination rate'
          ],
          illustration: '🌱'
        },
        {
          id: 'land-prep',
          title: 'Land Preparation & Sowing',
          icon: Sun,
          points: [
            'Deep plowing followed by 2-3 cross harrowing for fine tilth',
            'Maintain seed rate of 100-125 kg/hectare for irrigated conditions',
            'Sow at 2-3cm depth with row spacing of 20-22.5cm'
          ],
          illustration: '🚜'
        },
        {
          id: 'fertilization',
          title: 'Fertilization & Nutrient Management',
          icon: Beaker,
          points: [
            'Apply DAP (150kg/hectare) and MOP (50kg/hectare) at sowing',
            'First Urea application (65kg/hectare) at 21 days (Crown Root stage)',
            'Second Urea application (65kg/hectare) at 45 days (Tillering stage)'
          ],
          illustration: '⚗️'
        },
        {
          id: 'irrigation',
          title: 'Six-Stage Irrigation Schedule',
          icon: Droplets,
          points: [
            'Crown Root stage (20-25 days) - First irrigation',
            'Tillering stage (40-45 days) - Second irrigation',
            'Jointing stage (60-65 days) - Third irrigation',
            'Flowering stage (80-85 days) - Fourth irrigation',
            'Milk stage (100-105 days) - Fifth irrigation',
            'Dough stage (115-120 days) - Sixth irrigation'
          ],
          illustration: '💧'
        },
        {
          id: 'weed-control',
          title: 'Weed & Disease Control',
          icon: Shield,
          points: [
            'Use pre-emergence herbicide Pendimethalin @ 1kg/hectare',
            'Post-emergence application of 2,4-D for broad-leaf weeds',
            'Monitor for Yellow Rust and apply Propiconazole if needed'
          ],
          illustration: '🛡️'
        }
      ]
    },
    maize: {
      name: 'Maize',
      image: '🌽',
      description: 'Step-by-step maize cultivation guide for optimal yield',
      sections: [
        {
          id: 'land-prep',
          title: 'Land Preparation & Raised Beds',
          icon: Sun,
          points: [
            'Prepare field with deep plowing (20-25cm) followed by harrowing',
            'Create raised beds of 3-4 meter width with proper drainage',
            'Apply farmyard manure (10-15 tons/hectare) during land preparation'
          ],
          illustration: '🚜'
        },
        {
          id: 'seed-treatment',
          title: 'Seed Rate & Treatment',
          icon: Beaker,
          points: [
            'Use 20-25 kg/hectare seed rate for optimal plant population',
            'Treat seeds with fungicide (Thiram @ 2g/kg) and insecticide',
            'Select high-yielding hybrids suitable for local climate conditions'
          ],
          illustration: '🌱'
        },
        {
          id: 'spacing',
          title: 'Spacing & Plant Management',
          icon: Sprout,
          points: [
            'Maintain row-to-row spacing of 60cm and plant-to-plant 20cm',
            'Sow 2-3 seeds per hill and thin to single healthy plant',
            'Ensure plant population of 75,000-80,000 plants/hectare'
          ],
          illustration: '📏'
        },
        {
          id: 'fertilizer',
          title: 'Trio Fertilizer Schedule',
          icon: Heart,
          points: [
            'Basal dose: NPK (120:60:40 kg/hectare) at sowing',
            'First top dressing: Urea (65kg/hectare) at 25-30 days',
            'Second top dressing: Urea (65kg/hectare) at knee-high stage (45-50 days)'
          ],
          illustration: '⚗️'
        },
        {
          id: 'monitoring',
          title: 'Growth Monitoring & Care',
          icon: Leaf,
          points: [
            'Regular monitoring for stem borer and apply appropriate insecticides',
            'Earthing up operation at 30-35 days for better root development',
            'Maintain adequate soil moisture throughout vegetative growth'
          ],
          illustration: '👀'
        }
      ]
    }
  };

  const currentCrop = cropData[cropId as keyof typeof cropData];

  if (!currentCrop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Guide Not Found</h2>
          <Button onClick={() => navigate('/guides')} className="bg-green-600 hover:bg-green-700">
            Back to Guides
          </Button>
        </div>
      </div>
    );
  }

  const isSaved = savedGuides.includes(cropId!);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/guides')} className="text-white hover:bg-white/20 rounded-full p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{currentCrop.image}</div>
              <div>
                <h1 className="text-xl font-bold text-white">{currentCrop.name}</h1>
                <p className="text-green-100 text-sm">{currentCrop.description}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleSaveGuide(cropId!)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-6 h-6" />
            ) : (
              <Bookmark className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {currentCrop.sections.map((section, index) => (
          <Card key={section.id} className="bg-white shadow-lg border border-green-100 overflow-hidden">
            <Collapsible
              open={expandedSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <section.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{section.title}</CardTitle>
                        <p className="text-sm text-gray-500">Step {index + 1} of {currentCrop.sections.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">{section.illustration}</div>
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {section.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {/* Save Guide Button */}
        <div className="sticky bottom-4 pt-4">
          <Button 
            onClick={() => toggleSaveGuide(cropId!)}
            className={`w-full py-4 rounded-xl shadow-lg transition-all ${
              isSaved
                ? 'bg-green-100 text-green-700 border-2 border-green-600 hover:bg-green-50'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-5 h-5 mr-2" />
                Saved to My Guides
              </>
            ) : (
              <>
                <Bookmark className="w-5 h-5 mr-2" />
                Save This Guide
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CropGuideDetail;