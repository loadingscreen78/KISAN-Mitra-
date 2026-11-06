import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PINInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showStrengthIndicator?: boolean;
  className?: string;
}

const PINInput: React.FC<PINInputProps> = ({
  value,
  onChange,
  placeholder = "Enter PIN",
  label = "4-Digit PIN",
  showStrengthIndicator = false,
  className = ""
}) => {
  const [showPin, setShowPin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange(newValue);
  };

  const getPinStrength = (): 'weak' | 'medium' | 'strong' => {
    if (value.length < 4) return 'weak';
    
    const hasRepeating = /(.)\1{2,}/.test(value);
    const isSequential = /^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(value);
    const isCommon = ['1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '0000', '1234', '4321'].includes(value);
    
    if (hasRepeating || isSequential || isCommon) return 'weak';
    
    const uniqueDigits = new Set(value.split('')).size;
    return uniqueDigits >= 3 ? 'strong' : 'medium';
  };

  const getStrengthColor = () => {
    const strength = getPinStrength();
    switch (strength) {
      case 'weak': return 'text-red-500 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'strong': return 'text-green-600 bg-green-100';
    }
  };

  const getStrengthText = () => {
    const strength = getPinStrength();
    switch (strength) {
      case 'weak': return 'Weak PIN';
      case 'medium': return 'Medium PIN';
      case 'strong': return 'Strong PIN';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="text-lg font-bold text-agri-primary flex items-center">
        <Lock className="w-6 h-6 mr-3" />
        {label}
      </label>

      {/* PIN Input */}
      <div className="relative">
        <Input
          type={showPin ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          maxLength={4}
          className="pr-16 h-16 text-2xl rounded-2xl border-2 border-agri-primary/30 focus:border-agri-primary bg-agri-light/30 font-bold text-center tracking-[0.8em] placeholder:tracking-normal placeholder:text-base"
        />
        
        {/* Show/Hide Button */}
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-xl hover:bg-agri-light transition-colors"
        >
          {showPin ? (
            <EyeOff className="w-6 h-6 text-agri-primary" />
          ) : (
            <Eye className="w-6 h-6 text-agri-primary" />
          )}
        </button>
      </div>

      {/* PIN Dots Indicator */}
      <div className="flex justify-center space-x-4 mt-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < value.length 
                ? 'bg-agri-primary scale-125 shadow-md' 
                : 'bg-agri-light'
            }`}
          />
        ))}
      </div>

      {/* PIN Strength Indicator */}
      {showStrengthIndicator && value.length > 0 && (
        <div className="mt-3">
          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium ${getStrengthColor()}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              getPinStrength() === 'weak' ? 'bg-red-500' :
              getPinStrength() === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            {getStrengthText()}
          </div>
          
          {/* Strength Tips */}
          {value.length === 4 && getPinStrength() === 'weak' && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              💡 <strong>Tip:</strong> Avoid repeating digits (1111), sequences (1234), or common patterns
            </div>
          )}
        </div>
      )}

      {/* PIN Requirements */}
      {value.length > 0 && value.length < 4 && (
        <div className="text-sm text-agri-gray">
          PIN must be exactly 4 digits ({value.length}/4)
        </div>
      )}
    </div>
  );
};

export default PINInput;