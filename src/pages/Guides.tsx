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
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AmbientBackground from '@/components/AmbientBackground';

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
    { id: 'All', name: 'All Crops', icon: BookOpen },
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
        { icon: Scissors, name: 'Harvest', description: 'Harvesting & storage' }
      ],
      summary: [
        'Seed treatment process',
        'Sowing method & optimal seed rate',
        'Six-stage irrigation schedule',
        'Balanced fertilizer application',
        'Timely weed & disease control'
      ],
      categories: ['Planting', 'Irrigation']
    },
    {
      id: 'maize',
      name: 'Maize (Corn)',
      image: '🌽',
      keyStages: [
        { icon: Sprout, name: 'Preparation', description: 'Land preparation & beds' },
        { icon: Sun, name: 'Planting', description: 'Ridge planting technique' },
        { icon: Droplets, name: 'Water', description: 'Critical moisture stages' },
        { icon: Scissors, name: 'Harvest', description: 'Silking & grain drying' }
      ],
      summary: [
        'Land preparation + raised beds',
        'Ridge planting technique',
        'Trio fertilizer schedule (Basal, Knee-high, Tasseling)',
        'Moisture monitoring at silking',
        'Cob harvesting & grain moisture check'
      ],
      categories: ['Planting', 'Harvesting']
    }
  ];

  const toggleSaveGuide = (cropId: string) => {
    const updatedGuides = savedGuides.includes(cropId)
      ? savedGuides.filter(id => id !== cropId)
      : [...savedGuides, cropId];
    
    setSavedGuides(updatedGuides);
    localStorage.setItem('kisanmitra_saved_cultivation_guides', JSON.stringify(updatedGuides));
  };

  const filteredGuides = cropGuides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.summary.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || guide.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-background to-emerald-50/20 pb-24">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)} 
              aria-label="Back"
              className="p-2.5 glass-panel rounded-full hover:bg-white text-slate-700 transition-all active:scale-90 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-900" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Cultivation Guides
              </h1>
              <p className="text-[11px] text-slate-500">Field-tested cultivation manuals</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/my-saved-cultivation-guides')}
            className="glass-pill px-3 py-1.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5 hover:bg-emerald-500/10 transition-colors"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Saved ({savedGuides.length})</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search crops or cultivation techniques (e.g. Tomato, Drip)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 h-11 text-sm glass-input shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition-all duration-200 active:scale-95 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md border border-emerald-400/40'
                  : 'glass-panel text-slate-600 hover:text-emerald-700 hover:bg-white/80'
              }`}
            >
              <category.icon className="w-3.5 h-3.5" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Crop Guides in Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {filteredGuides.map((crop) => (
            <div 
              key={crop.id} 
              className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.09)] transition-all flex flex-col justify-between"
            >
              <div className="p-5 sm:p-6">
                {/* Crop Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="text-3xl w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shadow-inner">
                      {crop.image}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{crop.name}</h3>
                      <p className="text-xs text-slate-500">Complete Agronomy Blueprint</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaveGuide(crop.id)}
                    className={`p-2.5 rounded-2xl transition-all active:scale-90 shadow-sm ${
                      savedGuides.includes(crop.id)
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'glass-panel text-slate-400 hover:text-emerald-700 hover:bg-white'
                    }`}
                    title={savedGuides.includes(crop.id) ? 'Saved' : 'Save Guide'}
                  >
                    {savedGuides.includes(crop.id) ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Key Stages Pills */}
                <div className="grid grid-cols-4 gap-2 mb-4 bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-100/50">
                  {crop.keyStages.map((stage, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className="p-2 bg-white rounded-xl shadow-xs text-emerald-700 mb-1">
                        <stage.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 leading-tight truncate w-full">{stage.name}</span>
                    </div>
                  ))}
                </div>

                {/* Summary Bullet Points */}
                <div className="space-y-1.5 mb-2">
                  {crop.summary.slice(0, 3).map((point, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="line-clamp-1">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-50/60 border-t border-slate-100/80">
                <Button 
                  onClick={() => navigate(`/guides/${crop.id}`)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl py-2.5 text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  <span>Open Full Cultivation Blueprint</span>
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-16 glass-panel-elevated rounded-3xl p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No guides found</h3>
            <p className="text-xs text-slate-500 mb-4">Try adjusting your search or category filter</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Guides;
