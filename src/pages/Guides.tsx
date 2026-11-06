import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Bookmark,
  ChevronRight,
  Sprout,
  Droplets,
  Sun,
  Scissors,
  Beaker,
  Shield,
  Heart,
  BookmarkCheck,
  Wheat,
  Corn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Guides = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedGuides, setSavedGuides] = useState<string[]>([]);
  
  // Load saved guides from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kisanmitra_saved_cultivation_guides');
    setSavedGuides(saved ? JSON.parse(saved) : []);
  }, []);

  const categories = [
    { id: 'All', name: 'All', icon: BookOpen },
    { id: 'Planting', name: 'Planting', icon: Sprout },
    { id: 'Irrigation', name: 'Irrigation', icon: Droplets },
    { id: 'Harvesting', name: 'Harvesting', icon: Scissors }
  ];

  const cropGuides = [
    {
      id: 'tomato',
      name: 'Tomato',
      image: '🍅',
      keyStages: [
        { icon: Sprout, name: 'Seed', description: 'Variety selection & seed treatment' },
        { icon: Sun, name: 'Nursery', description: 'Spacing & nursery management' },
        { icon: Droplets, name: 'Irrigation', description: 'Drip irrigation setup' },
        { icon: Scissors, name: 'Harvest', description: 'Staking & maintenance' }
      ],
      summary: [
        'Variety selection + seed treatment',
        'Spacing & nursery management', 
        'Basal/top fertilization schedule',
        'Drip irrigation system',
        'Staking & maintenance techniques'
      ],
      categories: ['Planting', 'Irrigation']
    },
    {
      id: 'wheat',
      name: 'Wheat',
      image: '🌾',
      keyStages: [
        { icon: Beaker, name: 'Treatment', description: 'Seed treatment process' },
        { icon: Sprout, name: 'Sowing', description: 'Sowing method & seed rate' },
        { icon: Droplets, name: 'Irrigation', description: 'Six-stage irrigation' },
        { icon: Shield, name: 'Control', description: 'Weed & fertilizer control' }
      ],
      summary: [
        'Seed treatment protocols',
        'Sowing method & seed rate',
        'Six-stage irrigation schedule',
        'Fertilizer application timing',
        'Weed control strategies'
      ],
      categories: ['Planting', 'Irrigation']
    },
    {
      id: 'maize',
      name: 'Maize',
      image: '🌽', 
      keyStages: [
        { icon: Sun, name: 'Land Prep', description: 'Land prep & raised beds' },
        { icon: Beaker, name: 'Treatment', description: 'Seed rate & treatment' },
        { icon: Sprout, name: 'Spacing', description: 'Proper plant spacing' },
        { icon: Heart, name: 'Fertilizer', description: 'Trio fertilizer schedule' }
      ],
      summary: [
        'Land preparation & raised beds',
        'Seed rate & treatment methods',
        'Optimal plant spacing',
        'Trio fertilizer schedule',
        'Growth monitoring techniques'
      ],
      categories: ['Planting']
    }
  ];

  // Save/unsave cultivation guide
  const toggleSaveGuide = (guideId: string) => {
    const updatedSaved = savedGuides.includes(guideId)
      ? savedGuides.filter(id => id !== guideId)
      : [...savedGuides, guideId];
    
    setSavedGuides(updatedSaved);
    localStorage.setItem('kisanmitra_saved_cultivation_guides', JSON.stringify(updatedSaved));
  };

  const filteredGuides = cropGuides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.summary.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || guide.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/home')} className="text-white hover:bg-white/20 rounded-full p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Cultivation Guides</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search crops or guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 text-base bg-white border-gray-200 rounded-xl shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Crop Cards */}
        <div className="space-y-4">
          {filteredGuides.map((crop) => (
            <div key={crop.id} className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
              {/* Crop Header */}
              <div className="p-6 border-b border-green-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{crop.image}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{crop.name}</h3>
                      <p className="text-sm text-gray-500">Complete cultivation guide</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaveGuide(crop.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedGuides.includes(crop.id)
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {savedGuides.includes(crop.id) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Key Stages Icons */}
                <div className="flex items-center justify-between mb-4 bg-green-50 rounded-xl p-4">
                  {crop.keyStages.map((stage, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <stage.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-700">{stage.name}</p>
                        <p className="text-xs text-gray-500">{stage.description}</p>
                      </div>
                      {index < crop.keyStages.length - 1 && (
                        <ChevronRight className="absolute right-0 w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary Points */}
                <div className="space-y-2 mb-6">
                  {crop.summary.map((point, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => navigate(`/guides/${crop.id}`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 shadow-md transition-all"
                >
                  Read Full Guide
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No guides found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or browse different categories</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guides;