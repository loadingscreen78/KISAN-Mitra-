import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Camera,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Feedback = () => {
  const navigate = useNavigate();
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const categories = [
    { id: 'crop', emoji: '🌾', label: 'Crop' },
    { id: 'fertilizer', emoji: '🧪', label: 'Fertilizer' },
    { id: 'pest', emoji: '🐞', label: 'Pest' },
    { id: 'weather', emoji: '🌦️', label: 'Weather' },
    { id: 'market', emoji: '💲', label: 'Market' },
    { id: 'app', emoji: '⚙️', label: 'App' }
  ];

  const outcomes = [
    { id: 'worked', label: 'Worked', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'partly', label: 'Partly worked', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'didnt-work', label: "Didn't work", color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'wrong', label: 'Wrong suggestion', color: 'bg-orange-100 text-orange-800 border-orange-200' }
  ];

  const handleSubmit = () => {
    // Simulate feedback submission
    setShowConfirmation(true);
    
    // Auto-hide confirmation after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false);
      navigate('/home');
    }, 3000);
  };

  const handleBack = () => {
    navigate('/profile');
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-green-200 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Thank You! 🙏
          </h2>
          <p className="text-gray-600 text-lg">
            Your feedback helps us improve
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <MessageCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Feedback Matters</h1>
                <p className="text-base text-gray-600">Help us improve advice for you</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">

        {/* Category Section */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Which topic was this about?
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-2xl border-3 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 border-blue-400 shadow-lg scale-105'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{category.emoji}</div>
                  <div className="text-sm font-bold text-gray-700">{category.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Outcome Chips */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            How did it work for you?
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {outcomes.map((outcome) => (
              <button
                key={outcome.id}
                onClick={() => setSelectedOutcome(outcome.id)}
                className={`py-4 px-6 rounded-2xl border-2 font-bold text-base transition-all duration-200 ${
                  selectedOutcome === outcome.id
                    ? `${outcome.color} shadow-lg scale-105`
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {outcome.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Inputs */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 text-center">
            Tell us more (optional)
          </h3>
          
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Write your feedback here..."
            className="w-full p-4 border-2 border-gray-200 rounded-2xl text-lg resize-none focus:border-green-400 focus:outline-none"
            rows={3}
          />
          
          <button className="w-full py-4 bg-gray-100 border-2 border-gray-200 rounded-2xl hover:bg-gray-200 transition-colors">
            <div className="flex items-center justify-center space-x-3">
              <Camera className="w-6 h-6 text-gray-600" />
              <span className="text-lg font-medium text-gray-700">Add Photo</span>
            </div>
          </button>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full py-6 text-xl font-bold rounded-3xl transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
        >
          Submit Feedback
        </Button>

        {/* Bottom spacing for mobile */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default Feedback;
