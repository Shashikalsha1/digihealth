import React from 'react';
import { Alert } from 'antd';
import { AlertTriangle } from 'lucide-react';

interface FormErrorProps {
  message: string;
  visible?: boolean;
}

const FormError: React.FC<FormErrorProps> = ({ message, visible = true }) => {
  if (!visible || !message) return null;

  return (
    <Alert
      type="error"
      message={message}
      showIcon
      icon={<AlertTriangle className="w-4 h-4" />}
      className="mb-4 rounded-lg"
      style={{ borderColor: '#ff4d4f' }}
    />
  );
};

export default FormError;