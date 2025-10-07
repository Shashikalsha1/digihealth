import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Alert } from 'antd';
import { Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/apiService';

const { Title, Text } = Typography;

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting to Google Fit...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== OAuth Callback Processing ===');
      console.log('Current URL:', window.location.href);
      console.log('Search params:', window.location.search);
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      console.log('Extracted parameters:');
      console.log('  code:', code ? `${code.substring(0, 20)}...` : 'NOT FOUND');
      console.log('  state:', state || 'NOT FOUND');
      console.log('  error:', error || 'NOT FOUND');

      // Handle OAuth error
      if (error) {
        console.error('OAuth error detected:', error);
        setStatus('error');
        setMessage(`OAuth error: ${error}`);
        setTimeout(() => {
          navigate('/dashboard?error=oauth_failed');
        }, 3000);
        return;
      }

      // Handle missing parameters
      if (!code || !state) {
        console.error('Missing required parameters');
        setStatus('error');
        setMessage('Missing authorization code or state parameter');
        setTimeout(() => {
          navigate('/dashboard?error=missing_parameters');
        }, 3000);
        return;
      }

      // Process the authorization code
      try {
        console.log('✅ Processing authorization code...');
        setMessage('Exchanging authorization code...');

        const response = await apiService.completeGoogleFitAuth(code, state);
        
        console.log('✅ OAuth callback response:', response);

        if (response.success) {
          console.log('✅ Google Fit connection successful');
          setStatus('success');
          setMessage('Google Fit connected successfully!');
          
          // Redirect to dashboard with success message after 2 seconds
          setTimeout(() => {
            navigate('/dashboard?success=google_fit_connected&tab=settings');
          }, 2000);
        } else {
          console.error('❌ OAuth callback failed:', response);
          setStatus('error');
          setMessage('Failed to connect Google Fit. Please try again.');
          setTimeout(() => {
            navigate('/dashboard?error=token_exchange_failed');
          }, 3000);
        }
      } catch (error: any) {
        console.error('❌ Token exchange error:', error);
        setStatus('error');
        setMessage(error.message || 'Connection failed. Please try again.');
        setTimeout(() => {
          navigate('/dashboard?error=connection_failed');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, user]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Spin size="large" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Spin size="large" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#00B58E';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="w-full max-w-md">
        <Card
          className="shadow-lg rounded-xl border-0 text-center"
          style={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="py-8">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {status === 'processing' ? (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#00B58E' }}
                >
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
              ) : (
                getStatusIcon()
              )}
            </div>

            {/* Status Title */}
            <Title level={2} style={{ color: getStatusColor(), marginBottom: 16 }}>
              {status === 'processing' && 'Connecting...'}
              {status === 'success' && 'Connected!'}
              {status === 'error' && 'Connection Failed'}
            </Title>

            {/* Status Message */}
            <Text style={{ color: '#F7F7F7', fontSize: '16px' }}>
              {message}
            </Text>

            {/* Loading indicator for processing state */}
            {status === 'processing' && (
              <div className="mt-6">
                <Spin size="small" />
                <Text style={{ color: '#9CA3AF', marginLeft: 8 }}>
                  Please wait...
                </Text>
              </div>
            )}

            {/* Success message */}
            {status === 'success' && (
              <Alert
                message="Success"
                description="You will be redirected to your dashboard shortly."
                type="success"
                showIcon
                className="mt-6 rounded-lg"
              />
            )}

            {/* Error message */}
            {status === 'error' && (
              <Alert
                message="Error"
                description="You will be redirected to your dashboard shortly."
                type="error"
                showIcon
                className="mt-6 rounded-lg"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OAuthCallback;