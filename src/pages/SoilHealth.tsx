import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, TestTube2, Calculator } from 'lucide-react';

const SoilHealth = () => {
  const navigate = useNavigate();
  
  // State for soil parameters
  const [pH, setPH] = useState([6.5]); // Default 6.5
  const [moisture, setMoisture] = useState("Medium");
  const [organicMatter, setOrganicMatter] = useState("Moderate");
  const [showResults, setShowResults] = useState(false);

  /**
   * Soil Health Scoring Logic (Weighted System)
   * Total possible score: 6 points
   * - pH: 0-2 points
   * - Moisture: 0-2 points  
   * - Organic Matter: 0-2 points
   */
  const calculateSoilHealth = () => {
    let score = 0;
    const pHValue = pH[0];

    // pH Scoring: 6-7.5 = 2 points, 5.5-6 or 7.5-8 = 1 point, outside = 0 points
    if (pHValue >= 6.0 && pHValue <= 7.5) {
      score += 2;
    } else if ((pHValue >= 5.5 && pHValue < 6.0) || (pHValue > 7.5 && pHValue <= 8.0)) {
      score += 1;
    } else {
      score += 0;
    }

    // Moisture Scoring: Medium = 2 points, Dry/Wet = 1 point, otherwise 0
    // Interpreting as: Medium (40-70%) = 2 points, Dry/Wet (30-40% or 70-80%) = 1 point
    if (moisture === "Medium") {
      score += 2;
    } else if (moisture === "Dry" || moisture === "Wet") {
      score += 1;
    }

    // Organic Matter Scoring: Good = 2 points, Moderate = 1 point, Poor = 0 points
    if (organicMatter === "Good") {
      score += 2;
    } else if (organicMatter === "Moderate") {
      score += 1;
    } else {
      score += 0;
    }

    return score;
  };

  /**
   * Get soil health status and recommendations based on total score
   * 5-6 points = Healthy
   * 3-4 points = Moderate  
   * 0-2 points = Poor
   */
  const getSoilHealthStatus = (score: number) => {
    if (score >= 5) {
      return {
        status: "Healthy",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        recommendation: "Soil is healthy. Maintain current practices.",
        details: [
          "Continue current soil management practices",
          "Monitor soil conditions regularly",
          "Maintain proper crop rotation",
          "Keep up organic matter levels"
        ]
      };
    } else if (score >= 3) {
      return {
        status: "Moderate", 
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        recommendation: "Soil health is moderate. Consider irrigation adjustment and adding organic matter.",
        details: [
          "Adjust irrigation frequency based on moisture levels",
          "Add organic compost or manure",
          "Consider pH correction if needed",
          "Implement cover cropping"
        ]
      };
    } else {
      return {
        status: "Poor",
        color: "text-red-600", 
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        recommendation: "Soil health is poor. Add compost/organic matter, adjust irrigation, and correct pH.",
        details: [
          "Add 2-3 tons organic compost per acre",
          "Correct pH using lime (if acidic) or sulfur (if alkaline)",
          "Improve drainage or irrigation system",
          "Consider soil testing for detailed analysis"
        ]
      };
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  const soilScore = calculateSoilHealth();
  const healthStatus = getSoilHealthStatus(soilScore);
  const scorePercentage = (soilScore / 6) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
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
            <TestTube2 className="w-6 h-6 mr-2" />
            Soil Health Assessment
          </h1>
          
          <div className="w-12" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-4 py-6 space-y-6 overflow-y-auto">
        
        {/* Instructions Card */}
        <Card className="border-blue-200 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              📋 How to Test Your Soil
            </CardTitle>
            <CardDescription className="text-blue-600">
              Follow these simple steps to assess your soil health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {/* pH Instructions */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-1 text-sm">🧪 Soil pH Testing</h3>
                <p className="text-xs text-green-700 leading-relaxed">
                  Use a pH strip or digital meter. Mix 1 part soil with 1 part clean water, wait 30 minutes, then test. 
                  Ideal range: 6.0-7.5 for most crops.
                </p>
              </div>

              {/* Moisture Instructions */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-1 text-sm">💧 Soil Moisture Check</h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Squeeze test: <strong>Dry</strong> = crumbles apart, <strong>Medium</strong> = holds shape but crumbles when poked, 
                  <strong>Wet</strong> = water drips out when squeezed.
                </p>
              </div>

              {/* Organic Matter Instructions */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-1 text-sm">🍃 Organic Matter Assessment</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Check soil color: <strong>Good</strong> = dark brown/black with visible organic bits, 
                  <strong>Moderate</strong> = medium brown, <strong>Poor</strong> = light brown/sandy color.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Controls Card */}
        <Card className="border-green-200 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800">Enter Your Soil Measurements</CardTitle>
            <CardDescription className="text-green-600">
              Use the instructions above to fill in these values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            {/* pH Slider */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-green-800 block">
                Soil pH Level: <span className="text-green-600 font-bold">{pH[0].toFixed(1)}</span>
              </label>
              <div className="px-2">
                <Slider 
                  value={pH} 
                  onValueChange={setPH} 
                  max={14} 
                  min={0} 
                  step={0.1} 
                  className="w-full h-6" 
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 px-1">
                <span>0 (Very Acidic)</span>
                <span>7 (Neutral)</span>
                <span>14 (Very Alkaline)</span>
              </div>
            </div>

            {/* Soil Moisture Level */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-blue-800 block">Soil Moisture Level</label>
              <div className="grid grid-cols-3 gap-2">
                {["Dry", "Medium", "Wet"].map((level) => (
                  <Button
                    key={level}
                    variant={moisture === level ? "default" : "outline"}
                    onClick={() => setMoisture(level)}
                    className={`h-12 text-sm font-medium ${
                      moisture === level
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-blue-300 text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-gray-600 text-center">
                Choose based on squeeze test results
              </div>
            </div>

            {/* Organic Matter Level */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-amber-800 block">Organic Matter Level</label>
              <div className="grid grid-cols-3 gap-2">
                {["Poor", "Moderate", "Good"].map((level) => (
                  <Button
                    key={level}
                    variant={organicMatter === level ? "default" : "outline"}
                    onClick={() => setOrganicMatter(level)}
                    className={`h-12 text-sm font-medium ${
                      organicMatter === level
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "border-amber-300 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-gray-600 text-center">
                Based on soil color and visible organic matter
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-4">
              <Button
                onClick={handleCalculate}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Calculator className="w-5 h-5" />
                <span>Calculate Soil Health</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {showResults && (
          <Card className={`border-2 ${healthStatus.borderColor} ${healthStatus.bgColor} backdrop-blur-sm shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-center">
                <span className={healthStatus.color}>
                  Score: {soilScore}/6 ({Math.round(scorePercentage)}%)
                </span>
              </CardTitle>
              <CardDescription className="text-center">
                <span className={`font-semibold text-lg ${healthStatus.color}`}>
                  {healthStatus.status} Soil Health
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    soilScore >= 5
                      ? "bg-green-500"
                      : soilScore >= 3
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>

              {/* Main Recommendation */}
              <div className={`p-4 rounded-xl border-2 ${healthStatus.borderColor} ${healthStatus.bgColor}`}>
                <h3 className={`text-base font-semibold mb-2 ${healthStatus.color}`}>
                  🎯 Primary Recommendation
                </h3>
                <p className={`${healthStatus.color} font-medium leading-relaxed`}>
                  {healthStatus.recommendation}
                </p>
              </div>

              {/* Detailed Action Steps */}
              <div className="space-y-2">
                <h3 className={`text-base font-semibold ${healthStatus.color}`}>
                  📋 Action Steps:
                </h3>
                <ul className="space-y-2">
                  {healthStatus.details.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`${healthStatus.color} mt-0.5 text-sm font-bold`}>
                        {index + 1}.
                      </span>
                      <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parameter Breakdown */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">📊 Score Breakdown:</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <div className="font-semibold">pH</div>
                    <div className={healthStatus.color}>
                      {pH[0] >= 6.0 && pH[0] <= 7.5 ? '2' : 
                       ((pH[0] >= 5.5 && pH[0] < 6.0) || (pH[0] > 7.5 && pH[0] <= 8.0)) ? '1' : '0'}/2
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <div className="font-semibold">Moisture</div>
                    <div className={healthStatus.color}>
                      {moisture === "Medium" ? '2' : (moisture === "Dry" || moisture === "Wet") ? '1' : '0'}/2
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <div className="font-semibold">Organic</div>
                    <div className={healthStatus.color}>
                      {organicMatter === "Good" ? '2' : organicMatter === "Moderate" ? '1' : '0'}/2
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Tips Card */}
        <Card className="border-blue-200 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-4">
            <p className="text-center text-xs text-gray-600 leading-relaxed">
              💡 <strong>Pro Tip:</strong> Test your soil 2-3 times per year (before planting seasons) for best results. 
              For detailed nutrient analysis, contact your local agricultural extension office.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SoilHealth;