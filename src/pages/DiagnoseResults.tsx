import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Store,
  MapPin,
  Plus,
  Leaf,
  Calendar,
  Award,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useGoBack } from '@/hooks/useGoBack';

interface DiagnosisResult {
  disease: string;
  confidence: number;
  affectedArea: string;
  stage: string;
  severity: 'low' | 'medium' | 'high';
  detectedDate: string;
  status?: string;
  isHealthy?: boolean;
  message?: string;
  error?: string;
}

// Treatment advice only applies when a real disease was identified
const needsTreatment = (result: DiagnosisResult) =>
  !result.isHealthy && !result.error && result.status !== 'uncertain' && result.status !== 'error';

interface Fertilizer {
  name: string;
  effectiveness: string;
  availability: string;
}

interface TreatmentStep {
  step: number;
  title: string;
  description: string;
}

const DiagnoseResults = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [loadingFertilizers, setLoadingFertilizers] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    const savedResults = localStorage.getItem('diagnosis_results');
    const savedImage = localStorage.getItem('plant_image');
    
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      
      // Load Gemini AI data for the diagnosed disease
      if (parsedResults.disease && needsTreatment(parsedResults)) {
        loadTreatmentSteps(parsedResults.disease);
        loadFertilizerRecommendations(parsedResults.disease);
      }
    }
    if (savedImage) {
      setPlantImage(savedImage);
    }
  }, []);

  const loadFertilizerRecommendations = async (diseaseName: string) => {
    setLoadingFertilizers(true);
    try {
      const response = await fetch('/api/treatment/fertilizers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disease: diseaseName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.fertilizers) {
          setFertilizers(data.fertilizers);
        }
      }
    } catch (error) {
      console.error('Error loading fertilizers:', error);
      // Use fallback fertilizers
      setFertilizers([
        { name: 'Copper Fungicide Spray', effectiveness: 'Highly effective against fungal diseases and bacterial infections', availability: 'Recommended' },
        { name: 'Organic Disease Control', effectiveness: 'Natural solution that strengthens plant immunity and prevents reinfection', availability: 'Recommended' },
        { name: 'Plant Immunity Booster', effectiveness: 'Enhances overall plant health and disease resistance', availability: 'Optional' }
      ]);
    } finally {
      setLoadingFertilizers(false);
    }
  };

  const loadTreatmentSteps = async (diseaseName: string) => {
    setLoadingSteps(true);
    try {
      const response = await fetch('/api/treatment/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disease: diseaseName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.steps) {
          setTreatmentSteps(data.steps);
        }
      }
    } catch (error) {
      console.error('Error loading treatment steps:', error);
      // Use fallback steps
      setTreatmentSteps([
        { step: 1, title: 'Remove Affected Parts', description: 'Carefully remove all affected leaves and stems. Dispose away from healthy plants.' },
        { step: 2, title: 'Apply Treatment', description: 'Apply appropriate fungicide or treatment as recommended. Follow label instructions.' },
        { step: 3, title: 'Improve Conditions', description: 'Improve air circulation and avoid overhead watering to prevent reinfection.' },
        { step: 4, title: 'Monitor Progress', description: 'Check daily for new symptoms. Recovery should begin within 5-7 days.' },
        { step: 5, title: 'Follow-up Care', description: 'Continue monitoring and apply follow-up treatments as needed.' }
      ]);
    } finally {
      setLoadingSteps(false);
    }
  };


  const addToActiveTreatments = () => {
    if (results) {
      try {
        // Clean up localStorage first to prevent quota issues
        cleanupLocalStorage();
        
        const treatment = {
          id: Date.now().toString(),
          disease: results.disease,
          startDate: new Date().toISOString(),
          status: 'active',
          progress: 0,
          duration: '14-21 days',
          successRate: 87,
          nextAction: treatmentSteps.length > 0 ? treatmentSteps[0].title : 'Remove affected parts and apply treatment',
          severity: results.severity,
          confidence: results.confidence,
          // Optimize storage by storing only essential data
          fertilizers: fertilizers.slice(0, 3), // Limit to top 3 fertilizers
          steps: treatmentSteps.map((step, index) => ({
            step: step.step,
            title: step.title,
            description: step.description,
            completed: false,
            dueDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString()
          }))
        };
        
        let existingTreatments = [];
        try {
          const stored = localStorage.getItem('active_treatments');
          existingTreatments = stored ? JSON.parse(stored) : [];
        } catch (error) {
          console.warn('Failed to parse existing treatments, starting fresh:', error);
          existingTreatments = [];
        }
        
        // Limit to max 10 treatments to prevent storage issues
        if (existingTreatments.length >= 10) {
          existingTreatments = existingTreatments.slice(-9); // Keep most recent 9
        }
        
        existingTreatments.push(treatment);
        
        try {
          localStorage.setItem('active_treatments', JSON.stringify(existingTreatments));
          
          toast({
            title: "✅ Treatment Saved!",
            description: "Added to your active treatments with AI-powered guidance and fertilizer recommendations."
          });
        } catch (storageError) {
          console.error('Storage error:', storageError);
          toast({
            title: "❌ Save Failed",
            description: "Storage is full. Clear some data and try again.",
            variant: "destructive",
            action: {
              label: "Clear Old Data",
              onClick: () => {
                cleanupLocalStorage();
                // Retry saving after cleanup
                try {
                  localStorage.setItem('active_treatments', JSON.stringify(existingTreatments));
                  toast({
                    title: "✅ Treatment Saved!",
                    description: "Successfully saved after cleanup."
                  });
                } catch (retryError) {
                  toast({
                    title: "❌ Still Failed",
                    description: "Please manually clear browser data.",
                    variant: "destructive"
                  });
                }
              }
            }
          });
        }
        
      } catch (error) {
        console.error('Error saving treatment:', error);
        toast({
          title: "❌ Save Failed",
          description: "Failed to save treatment. Please try again or clear some data.",
          variant: "destructive"
        });
      }
    }
  };

  // Helper function to clean up localStorage
  const cleanupLocalStorage = () => {
    try {
      // Remove old diagnosis results to free up space
      const diagnosisResults = localStorage.getItem('diagnosis_results');
      if (diagnosisResults && diagnosisResults.length > 50000) { // If over 50KB
        localStorage.removeItem('diagnosis_results');
      }
      
      // Remove old plant images to free up space
      const plantImage = localStorage.getItem('plant_image');
      if (plantImage && plantImage.length > 100000) { // If over 100KB
        localStorage.removeItem('plant_image');
      }
      
      // Clean up completed treatments older than 30 days
      const treatments = JSON.parse(localStorage.getItem('active_treatments') || '[]');
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const cleanedTreatments = treatments.filter(t => {
        if (t.status === 'completed' && t.completedDate) {
          return new Date(t.completedDate).getTime() > thirtyDaysAgo;
        }
        return true; // Keep active treatments
      });
      
      if (cleanedTreatments.length !== treatments.length) {
        localStorage.setItem('active_treatments', JSON.stringify(cleanedTreatments));
        console.log(`Cleaned up ${treatments.length - cleanedTreatments.length} old treatments`);
      }
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  };

  const handleFertilizerRecommendation = (fertilizerName: string) => {
    // Store fertilizer search query and navigate to shop
    localStorage.setItem('fertilizer_search', fertilizerName);
    navigate('/shop?search=' + encodeURIComponent(fertilizerName));
  };

  const getStepColor = (stepNumber: number) => {
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[(stepNumber - 1) % colors.length];
  };

  if (!results) {
    return (
      <div className="mobile-container">
        <div className="mobile-content flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-agri-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold text-agri-accent mb-2">No Results Found</h2>
            <p className="text-agri-gray mb-4">Please diagnose a plant first.</p>
            <Button onClick={() => goBack('/diagnose')}>
              Start Diagnosis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const showTreatment = needsTreatment(results);
  const isDiagnosed = showTreatment || results.isHealthy;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="mobile-header bg-agri-cream">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => goBack('/diagnose')}
            className="p-2 hover:bg-agri-light rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-agri-accent" />
          </button>
          <h1 className="text-xl font-bold text-agri-accent">Diagnosis Results</h1>
        </div>
      </div>

      <div className="mobile-content space-y-6 pt-4">
        {/* Success Header */}
        <div className="text-center">
          {isDiagnosed ? (
            <div className="w-16 h-16 bg-agri-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-agri-success animate-bounce" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-agri-accent mb-2">
            {isDiagnosed ? 'Diagnosis Complete' : 'Diagnosis Incomplete'}
          </h1>
          <p className="text-agri-gray">
            Analyzed on {new Date(results.detectedDate).toLocaleDateString()}
          </p>
        </div>

        {/* Plant Image */}
        {plantImage && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            <img 
              src={plantImage} 
              alt="Diagnosed plant" 
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-4 right-4 bg-green-500 rounded-full p-3 shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm font-medium opacity-90">Analyzed Image</div>
              <div className="text-xs opacity-70">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        )}

        {/* Disease Detection */}
        <div className={`plant-card border-l-4 ${results.isHealthy ? 'border-green-500' : isDiagnosed ? 'border-red-500' : 'border-yellow-500'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-2 ${results.isHealthy ? 'text-green-700' : isDiagnosed ? 'text-red-700' : 'text-yellow-700'}`}>
                {results.disease}
              </h2>
              <div className="flex items-center space-x-3 mb-3">
                {isDiagnosed ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Progress value={results.confidence} className="w-20 h-2" />
                      <span className={`text-sm font-medium ${results.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.round(results.confidence)}% Confidence
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      results.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {results.isHealthy ? 'HEALTHY' : 'NEEDS ATTENTION'}
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    NOT DIAGNOSED
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-agri-accent">Affected Area:</span>
                  <p className="text-agri-gray">{results.affectedArea}</p>
                </div>
                <div>
                  <span className="font-medium text-agri-accent">Stage:</span>
                  <p className="text-agri-gray">{results.stage}</p>
                </div>
              </div>
            </div>
            {results.isHealthy ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertTriangle className={`w-8 h-8 ${isDiagnosed ? 'text-red-500' : 'text-yellow-600'}`} />
            )}
          </div>
        </div>

        {!showTreatment && (
          <div className="bg-agri-cream rounded-xl p-4 border border-agri-primary/20 space-y-3">
            <p className="text-sm text-agri-gray">
              {results.isHealthy
                ? 'No treatment needed. Keep up your current care and check the plant regularly.'
                : results.message || results.error || 'We could not diagnose this photo. Please try again.'}
            </p>
            {!results.isHealthy && (
              <Button onClick={() => goBack('/diagnose')} className="w-full">
                Try Another Photo
              </Button>
            )}
          </div>
        )}

        {showTreatment && (
        <>
        {/* Treatment Steps */}
        <div className="bg-green-50 rounded-3xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-500 rounded-full p-3">
              {loadingSteps ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Target className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Treatment Steps</h3>
              <p className="text-sm text-gray-600">
                {loadingSteps ? 'Loading AI-powered treatment plan...' : 'AI-generated steps for best results'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {loadingSteps ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                <span className="ml-2 text-gray-600">Generating personalized treatment steps...</span>
              </div>
            ) : (
              treatmentSteps.map((step) => (
                <div key={step.step} className="flex items-start space-x-4 p-4 bg-white rounded-2xl shadow-sm">
                  <div className={`${getStepColor(step.step)} text-white rounded-full p-2 text-sm font-bold flex-shrink-0`}>
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Add to Active Treatments */}
        <div className="bg-green-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Save Treatment Plan</h3>
              <p className="text-green-100 text-sm">Track progress with daily reminders and monitoring</p>
            </div>
            <Calendar className="w-10 h-10 text-green-200" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          </div>
          
          <Button 
            onClick={addToActiveTreatments}
            className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Save to My Treatments
          </Button>
        </div>

        {/* Fertilizer Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-agri-accent">Recommended Fertilizers</h2>
            {loadingFertilizers && (
              <Loader2 className="w-5 h-5 text-agri-accent animate-spin" />
            )}
          </div>
          {loadingFertilizers && (
            <p className="text-sm text-gray-600">Getting AI-powered fertilizer recommendations...</p>
          )}
          
          {loadingFertilizers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading fertilizer recommendations...</span>
            </div>
          ) : (
            fertilizers.map((fertilizer, index) => (
              <div key={index} className="plant-card">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-agri-accent">{fertilizer.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      fertilizer.availability === 'Recommended' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {fertilizer.availability}
                    </span>
                  </div>
                  <p className="text-sm text-agri-gray leading-relaxed">{fertilizer.effectiveness}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alternative Options */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-agri-accent">Alternative Options</h2>
          
          {/* Nearby Shops */}
          <div className="plant-card bg-purple-500 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Visit Nearby Fertilizer Shops</h3>
                <p className="text-white/90 text-sm mb-4">Get directions and contact details</p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>3 shops within 5km</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>GPS navigation available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Expert advice included</span>
                  </div>
                </div>
              </div>
              <MapPin className="w-8 h-8 opacity-80" />
            </div>
            
            <Button 
              onClick={() => navigate('/nearby-shops')}
              className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find Nearest Shops
            </Button>
          </div>

        </div>

        {/* Action Summary */}
        <div className="bg-agri-cream rounded-xl p-4 border border-agri-primary/20">
          <h3 className="font-semibold text-agri-accent mb-2">Next Steps Summary:</h3>
          <ol className="space-y-1 text-sm text-agri-gray">
            <li>1. Add to active treatments for monitoring</li>
            <li>2. Order recommended fertilizers</li>
            <li>3. Apply treatment in early morning</li>
            <li>4. Monitor progress daily</li>
            <li>5. Monitor daily for improvement</li>
          </ol>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default DiagnoseResults;