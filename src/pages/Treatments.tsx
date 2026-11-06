import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Camera,
  Edit3,
  Mic,
  Globe,
  TrendingUp,
  Droplets,
  Bug,
  Leaf,
  Clock,
  ChevronRight,
  Check,
  X,
  ArrowLeft,
  Search,
  Filter,
  Badge,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface TreatmentStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

interface Treatment {
  id: string;
  disease: string;
  startDate: string;
  status: 'active' | 'completed';
  progress?: number;
  duration?: string;
  successRate?: number;
  nextAction?: string;
  image?: string;
  severity?: string;
  confidence?: number;
  fertilizers?: Array<{name: string; price: string; availability: string}>;
  steps: TreatmentStep[];
  completedDate?: string;
}

const ActiveTreatments = () => {
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'completed', or 'all'
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const languages = {
    en: { label: 'English', flag: '🇬🇧' },
    hi: { label: 'हिन्दी', flag: '🇮🇳' },
    ta: { label: 'தமிழ்', flag: '🇮🇳' }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = () => {
    try {
      const savedTreatments = localStorage.getItem('active_treatments');
      if (savedTreatments) {
        try {
          const parsedTreatments = JSON.parse(savedTreatments);
          
          // Validate and clean up treatments
          const validTreatments = parsedTreatments.filter(treatment => {
            // Ensure treatment has required fields and valid steps array
            return treatment && 
                   treatment.id && 
                   treatment.disease && 
                   treatment.status && 
                   Array.isArray(treatment.steps) &&
                   treatment.steps.length > 0;
          }).map(treatment => {
            // Ensure each step has required fields
            const validSteps = treatment.steps.filter(step => 
              step && 
              step.title && 
              step.description && 
              typeof step.completed === 'boolean'
            );
            
            return {
              ...treatment,
              steps: validSteps,
              progress: treatment.progress || 0
            };
          });
          
          // Save cleaned data back if we removed invalid entries
          if (validTreatments.length !== parsedTreatments.length) {
            console.log(`Cleaned up ${parsedTreatments.length - validTreatments.length} invalid treatments`);
            localStorage.setItem('active_treatments', JSON.stringify(validTreatments));
          }
          
          setTreatments(validTreatments);
        } catch (parseError) {
          console.error('Error parsing treatments, clearing corrupted data:', parseError);
          localStorage.removeItem('active_treatments');
          setTreatments([]);
          toast({
            title: "🔧 Data Restored",
            description: "Cleared corrupted treatment data. You can start fresh with new treatments."
          });
        }
      } else {
        setTreatments([]);
      }
    } catch (error) {
      console.error('Error loading treatments:', error);
      setTreatments([]);
    }
  };

  // Filter treatments based on active filter and search query
  const filteredTreatments = treatments.filter(treatment => {
    const matchesFilter = activeFilter === 'all' || treatment.status === activeFilter;
    const matchesSearch = !searchQuery || 
      treatment.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (treatment.severity && treatment.severity.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const summaryData = {
    active: treatments.filter(t => t.status === 'active').length,
    completed: treatments.filter(t => t.status === 'completed').length,
    successRate: treatments.length > 0 ? Math.round((treatments.filter(t => t.status === 'completed').length / treatments.length) * 100) : 0
  };

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    );
  };

  const markStepComplete = (treatmentId: string, stepIndex: number) => {
    const updatedTreatments = treatments.map(treatment => {
      if (treatment.id === treatmentId) {
        const updatedSteps = [...treatment.steps];
        updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], completed: true };
        
        // Calculate progress
        const completedSteps = updatedSteps.filter(step => step.completed).length;
        const progress = Math.round((completedSteps / updatedSteps.length) * 100);
        
        // If all steps completed, mark treatment as completed
        const isAllCompleted = completedSteps === updatedSteps.length;
        
        return {
          ...treatment,
          steps: updatedSteps,
          progress,
          status: isAllCompleted ? ('completed' as const) : ('active' as const),
          completedDate: isAllCompleted ? new Date().toISOString() : treatment.completedDate
        };
      }
      return treatment;
    });
    
    setTreatments(updatedTreatments);
    
    try {
      localStorage.setItem('active_treatments', JSON.stringify(updatedTreatments));
      toast({
        title: "✅ Step Completed!",
        description: "Treatment progress updated successfully."
      });
    } catch (storageError) {
      console.error('Storage error updating treatment:', storageError);
      toast({
        title: "⚠️ Save Warning",
        description: "Step marked complete but not saved. Storage may be full.",
        variant: "destructive"
      });
    }
  };

  const moveToCompleted = (treatmentId: string) => {
    const updatedTreatments = treatments.map(treatment => {
      if (treatment.id === treatmentId) {
        return {
          ...treatment,
          status: 'completed' as const,
          completedDate: new Date().toISOString(),
          progress: 100
        };
      }
      return treatment;
    });
    
    setTreatments(updatedTreatments);
    
    try {
      localStorage.setItem('active_treatments', JSON.stringify(updatedTreatments));
      toast({
        title: "🎉 Treatment Completed!",
        description: "Treatment has been moved to completed treatments."
      });
    } catch (storageError) {
      console.error('Storage error completing treatment:', storageError);
      toast({
        title: "⚠️ Completion Warning",
        description: "Treatment completed but not saved. Storage may be full.",
        variant: "destructive"
      });
    }
  };

  const getProgress = (treatment: Treatment) => {
    if (treatment.status === 'completed') return 100;
    if (!treatment.steps || treatment.steps.length === 0) return 0;
    
    const completedSteps = treatment.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / treatment.steps.length) * 100);
  };

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysFromStart = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Active Treatments</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
                <span className="text-lg">{languages[selectedLanguage].flag}</span>
                <span className="text-sm font-medium text-gray-700">{languages[selectedLanguage].label}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by plant or disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* Summary Strip with Filter Buttons */}
      <div className="px-6 py-2">
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveFilter('active')}
            className={`rounded-2xl p-4 transition-all duration-200 ${
              activeFilter === 'active' 
                ? 'bg-blue-100 border-2 border-blue-400 shadow-lg' 
                : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-blue-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-blue-700">{summaryData.active}</p>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveFilter('completed')}
            className={`rounded-2xl p-4 transition-all duration-200 ${
              activeFilter === 'completed' 
                ? 'bg-green-100 border-2 border-green-400 shadow-lg' 
                : 'bg-green-50 border border-green-200 hover:bg-green-100'
            }`}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700">{summaryData.completed}</p>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveFilter('all')}
            className={`rounded-2xl p-4 transition-all duration-200 ${
              activeFilter === 'all' 
                ? 'bg-purple-100 border-2 border-purple-400 shadow-lg' 
                : 'bg-purple-50 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-medium text-purple-600 mb-1">All</p>
              <p className="text-2xl font-bold text-purple-700">{summaryData.active + summaryData.completed}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Treatment Cards */}
      <div className="px-6 pb-24 space-y-6">
        {filteredTreatments.length === 0 ? (
          <div className="text-center py-12">
            <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Treatments Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No treatments match your search.' : 'You haven\'t started any treatments yet.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/diagnose')} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Start Diagnosis</span>
              </Button>
            )}
          </div>
        ) : (
          filteredTreatments.map(treatment => {
            const isExpanded = expandedCards.includes(treatment.id);
            const progress = getProgress(treatment);
            const isCompleted = treatment.status === 'completed';
            const daysFromStart = getDaysFromStart(treatment.startDate);
          
          return (
            <div key={treatment.id} className={`bg-white rounded-3xl shadow-md border overflow-hidden ${
              isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
            }`}>
              {/* Main Card Content */}
              <div className="p-6">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{treatment.disease}</h3>
                      {treatment.severity && (
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getSeverityStyle(treatment.severity)} uppercase tracking-wide`}>
                          {treatment.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-600 font-medium">Started {daysFromStart} days ago</p>
                    {treatment.duration && (
                      <p className="text-sm text-gray-500">Expected duration: {treatment.duration}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpand(treatment.id)}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      {treatment.steps ? `${treatment.steps.filter(s => s.completed).length} of ${treatment.steps.length} steps completed` : 'Treatment Progress'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-800">{progress}% Complete</span>
                      {treatment.successRate && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {treatment.successRate}% success rate
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Next Action or Completion Status */}
                {isCompleted ? (
                  <div className="p-5 rounded-2xl bg-green-50 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 mb-1">Treatment Completed</p>
                          <p className="text-base font-medium text-green-800 mb-2">
                            Successfully completed on {treatment.completedDate ? new Date(treatment.completedDate).toLocaleDateString() : 'Recently'}
                          </p>
                          <p className="text-sm text-green-700 font-medium">
                            ✓ 100% Progress Complete
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/diagnose')}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Re-analyze
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Treatment Steps */}
                    {treatment.steps && treatment.steps.length > 0 && (
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-600" />
                          Treatment Steps
                        </h4>
                        <div className="space-y-2">
                          {treatment.steps.map((step, index) => (
                            <div 
                              key={step.step} 
                              className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                                step.completed ? 'bg-green-100' : 'bg-white hover:bg-blue-50'
                              }`}
                            >
                              <button
                                onClick={() => !step.completed && markStepComplete(treatment.id, index)}
                                disabled={step.completed}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  step.completed 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {step.completed && <Check className="w-4 h-4 text-white" />}
                              </button>
                              <div className="flex-1">
                                <p className={`font-medium ${step.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                                  {step.title}
                                </p>
                                <p className={`text-sm ${step.completed ? 'text-green-600' : 'text-gray-600'}`}>
                                  {step.description}
                                </p>
                              </div>
                              {step.completed && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {progress === 100 && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <Button 
                              onClick={() => moveToCompleted(treatment.id)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Treatment as Completed
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {/* Recommended Fertilizers */}
                    {treatment.fertilizers && treatment.fertilizers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-orange-500" />
                          Recommended Fertilizers
                        </p>
                        <div className="space-y-2">
                          {treatment.fertilizers.map((fertilizer, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{fertilizer.name}</p>
                                <p className="text-xs text-gray-600">{fertilizer.price}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                fertilizer.availability === 'In Stock' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {fertilizer.availability}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatment Image */}
                    {treatment.image && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Original Diagnosis Image</p>
                        <img 
                          src={treatment.image} 
                          alt="Treatment plant" 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="border-t pt-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate('/diagnose')}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Add Photo
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
          })
        )}
      </div>

    </div>
  );
};

export default ActiveTreatments;