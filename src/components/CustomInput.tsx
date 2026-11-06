import React, { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CustomInputProps {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'text' | 'tel' | 'email';
  validation?: {
    isValid: boolean;
    message: string;
  };
  prefix?: string;
  maxLength?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  validation,
  prefix,
  maxLength,
  className = '',
  inputClassName = '',
  disabled = false,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Apply specific formatting based on type
    if (type === 'tel') {
      newValue = newValue.replace(/\D/g, '');
    } else if (type === 'text' && label.toLowerCase().includes('name')) {
      // Only allow alphabets and spaces for name fields
      newValue = newValue.replace(/[^A-Za-z\s]/g, '');
    }
    
    onChange(newValue);
  };

  const getValidationStyle = () => {
    if (!validation || value.length === 0) {
      return 'border-agri-primary/30 focus:border-agri-primary';
    }
    
    return validation.isValid 
      ? 'border-green-400 focus:border-green-500' 
      : 'border-red-400 focus:border-red-500';
  };

  const showValidationIcon = validation && value.length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="text-lg font-bold text-agri-primary flex items-center">
        {icon}
        <span className="ml-3">{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-agri-light rounded-lg px-3 py-2">
            <span className="text-agri-primary font-bold text-lg">{prefix}</span>
          </div>
        )}

        {/* Input Field */}
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            ${prefix ? 'pl-24' : 'pl-4'} 
            ${showValidationIcon ? 'pr-16' : 'pr-4'}
            h-16 text-xl rounded-2xl border-2 
            ${getValidationStyle()}
            bg-agri-light/30 font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed
            ${type === 'tel' ? 'text-center tracking-wider font-bold' : ''}
            ${inputClassName}
          `}
        />

        {/* Validation Icon */}
        {showValidationIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {validation.isValid ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {validation && validation.message && value.length > 0 && (
        <div className={`text-sm px-3 py-2 rounded-lg ${
          validation.isValid 
            ? 'text-green-700 bg-green-50' 
            : 'text-red-700 bg-red-50'
        }`}>
          {validation.message}
        </div>
      )}

      {/* Character count for limited inputs */}
      {maxLength && value.length > 0 && (
        <div className="text-sm text-agri-gray text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default CustomInput;