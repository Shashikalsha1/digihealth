import React from 'react';
import { Alert } from 'antd';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  code?: string;
  message: string;
  type?: 'error' | 'warning';
  showIcon?: boolean;
  closable?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  code,
  message,
  type = 'error',
  showIcon = true,
  closable = false,
  className = '',
}) => {
  const displayMessage = code ? `${code}: ${message}` : message;

  return (
    <Alert
      type={type}
      message={displayMessage}
      showIcon={showIcon}
      closable={closable}
      icon={<AlertCircle className="w-4 h-4" />}
      className={`rounded-lg ${className}`}
      style={{
        borderColor: type === 'error' ? '#ff4d4f' : '#faad14',
      }}
    />
  );
};

export default ErrorDisplay;