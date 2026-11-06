import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  loading = false,
  loadingText = 'Loading...',
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'lg',
  className = '',
  icon
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-agri-primary hover:bg-agri-secondary text-white shadow-large';
      case 'secondary':
        return 'bg-agri-secondary hover:bg-agri-primary text-white shadow-large';
      case 'outline':
        return 'border-2 border-agri-primary text-agri-primary hover:bg-agri-primary hover:text-white shadow-md';
      default:
        return 'bg-agri-primary hover:bg-agri-secondary text-white shadow-large';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-12 text-base px-6';
      case 'md':
        return 'h-16 text-lg px-8';
      case 'lg':
        return 'h-20 text-2xl px-8';
      default:
        return 'h-20 text-2xl px-8';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full font-bold rounded-2xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 transform
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-3">
          {icon && <span className="w-8 h-8 flex items-center justify-center">{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </Button>
  );
};

export default AuthButton;