import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Switch, 
  Divider,
  Alert,
  Space,
  Row,
  Col,
  Statistic,
  Modal
} from 'antd';
import { 
  Smartphone, 
  Activity, 
  Heart, 
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import apiService from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;

interface GoogleFitStatus {
  connected: boolean;
  expires_at: string | null;
  is_expired: boolean | null;
  scopes: string[];
  last_updated: string | null;
}

const GoogleFitSettings: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [googleFitStatus, setGoogleFitStatus] = useState<GoogleFitStatus | null>(null);
  const [disconnectModalVisible, setDisconnectModalVisible] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  // Check Google Fit status on component mount
  useEffect(() => {
    checkGoogleFitStatus();
  }, []);

  // Check for success/error messages from OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'google_fit_connected') {
      setIsConnected(true);
      setSyncEnabled(true);
      message.success('Google Fit connected successfully!');
      // Refresh status after successful connection
      checkGoogleFitStatus();
    }

    if (error) {
      let errorMessage = 'Failed to connect Google Fit. Please try again.';
      switch (error) {
        case 'oauth_failed':
          errorMessage = 'OAuth authorization failed. Please try again.';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Failed to exchange authorization token. Please try again.';
          break;
        case 'connection_failed':
          errorMessage = 'Connection to Google Fit failed. Please try again.';
          break;
        case 'missing_parameters':
          errorMessage = 'Missing required parameters. Please try again.';
          break;
      }
      message.error(errorMessage);
    }
  }, [searchParams]);

  const checkGoogleFitStatus = async () => {
    try {
      setStatusLoading(true);
      console.log('🔍 Checking Google Fit connection status...');
      
      const status = await apiService.getGoogleFitStatus();
      console.log('📊 Google Fit Status:', status);
      
      setGoogleFitStatus(status);
      setIsConnected(status.connected);
      setSyncEnabled(status.connected);
      
      if (status.connected) {
        console.log('✅ Google Fit is connected');
        console.log('📅 Expires at:', status.expires_at);
        console.log('🔄 Last updated:', status.last_updated);
        console.log('🔐 Scopes:', status.scopes);
      } else {
        console.log('❌ Google Fit is not connected');
      }
    } catch (error: any) {
      console.error('❌ Failed to check Google Fit status:', error);
      // Don't show error message for status check failure
      // as it might be expected for new users
      setIsConnected(false);
      setSyncEnabled(false);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user?.id) {
      message.error('User not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Initiating Google Fit auth for user:', user.id);
      
      const response = await apiService.initiateGoogleFitAuth(user.id);
      
      console.log('API Response:', response);
      
      if (response && response.oauth_url) {
        console.log('Redirecting to OAuth URL:', response.oauth_url);
        // Redirect to Google OAuth URL
        window.location.href = response.oauth_url;
      } else {
        console.error('Invalid response or missing oauth_url:', response);
        message.error('Failed to get Google Fit authorization URL.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Failed to initiate Google Fit auth:', error);
      message.error(error.message || 'Failed to initiate Google Fit connection.');
      setLoading(false);
    }
    // Note: Don't set loading to false here if redirect is successful,
    // as the page will navigate away
  };

  const handleDisconnect = () => {
    setDisconnectModalVisible(true);
  };

  const confirmDisconnect = async () => {
    try {
      setDisconnectLoading(true);
      console.log('🔌 Disconnecting Google Fit...');
      
      const response = await apiService.disconnectGoogleFit();
      console.log('✅ Disconnect response:', response);
      
      if (response.success) {
        setIsConnected(false);
        setSyncEnabled(false);
        setGoogleFitStatus(null);
        message.success(response.message || 'Google Fit disconnected successfully.');
        console.log('✅ Google Fit disconnected successfully');
      } else {
        throw new Error('Disconnect failed');
      }
    } catch (error: any) {
      console.error('❌ Failed to disconnect Google Fit:', error);
      message.error(error.message || 'Failed to disconnect Google Fit. Please try again.');
    } finally {
      setDisconnectLoading(false);
      setDisconnectModalVisible(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const fitDataTypes = [
    {
      scope: 'https://www.googleapis.com/auth/fitness.activity.read',
      icon: <Activity className="w-5 h-5 text-blue-500" />,
      title: 'Activity & Steps',
      description: 'Daily steps, distance, calories burned, and active minutes',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.activity.read'),
      category: 'fitness'
    },
    {
      scope: 'https://www.googleapis.com/auth/fitness.body.read',
      icon: <User className="w-5 h-5 text-indigo-500" />,
      title: 'Body Measurements',
      description: 'Weight, height, body fat percentage, and BMI',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.body.read'),
      category: 'body'
    },
    {
      scope: 'https://www.googleapis.com/auth/fitness.heart_rate.read',
      icon: <Heart className="w-5 h-5 text-red-500" />,
      title: 'Heart Rate',
      description: 'Resting heart rate, active heart rate, and heart rate zones',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.heart_rate.read'),
      category: 'vitals'
    },
    {
      scope: 'https://www.googleapis.com/auth/fitness.location.read',
      icon: <MapPin className="w-5 h-5 text-green-500" />,
      title: 'Location Data',
      description: 'Workout locations, routes, and GPS tracking data',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.location.read'),
      category: 'location'
    },
    {
      scope: 'https://www.googleapis.com/auth/fitness.blood_pressure.read',
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
      title: 'Blood Pressure',
      description: 'Systolic and diastolic blood pressure readings',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.blood_pressure.read'),
      category: 'vitals'
    },
    {
      scope: 'https://www.googleapis.com/auth/fitness.body_temperature.read',
      icon: <Activity className="w-5 h-5 text-yellow-500" />,
      title: 'Body Temperature',
      description: 'Body temperature measurements and fever tracking',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.body_temperature.read'),
      category: 'vitals'
    },
    {
      scope: 'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
      icon: <Heart className="w-5 h-5 text-cyan-500" />,
      title: 'Oxygen Saturation',
      description: 'Blood oxygen levels (SpO2) and respiratory health data',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.oxygen_saturation.read'),
      category: 'vitals'
    },
    {
      scope: 'https://www.googleapis.com/auth/fitness.sleep.read',
      icon: <Clock className="w-5 h-5 text-purple-500" />,
      title: 'Sleep Patterns',
      description: 'Sleep duration, sleep stages, and sleep quality metrics',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/fitness.sleep.read'),
      category: 'sleep'
    },
    {
      scope: 'https://www.googleapis.com/auth/userinfo.profile',
      icon: <User className="w-5 h-5 text-gray-500" />,
      title: 'Profile Information',
      description: 'Basic profile information and user identification',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/userinfo.profile'),
      category: 'profile'
    },
    {
      scope: 'https://www.googleapis.com/auth/userinfo.email',
      icon: <User className="w-5 h-5 text-gray-400" />,
      title: 'Email Access',
      description: 'Email address for account linking and notifications',
      enabled: syncEnabled && googleFitStatus?.scopes.includes('https://www.googleapis.com/auth/userinfo.email'),
      category: 'profile'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={3} style={{ color: '#F7F7F7', marginBottom: 8 }}>
          Google Fit Integration
        </Title>
        <Text style={{ color: '#9CA3AF' }}>
          Connect your Google Fit account to sync health and fitness data
        </Text>
      </div>

      {/* Connection Status */}
      <Card
        className="shadow-lg rounded-xl border-0"
        style={{ 
          backgroundColor: '#1F2937',
          border: '1px solid #374151'
        }}
      >
        {statusLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <Text style={{ color: '#9CA3AF' }}>Checking connection status...</Text>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isConnected ? '#10B981' : '#6B7280' }}
              >
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <Title level={4} style={{ color: '#F7F7F7', marginBottom: 4 }}>
                  Google Fit Account
                </Title>
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <Text style={{ color: '#10B981' }}>Connected</Text>
                      {googleFitStatus?.is_expired && (
                        <Text style={{ color: '#F59E0B', marginLeft: 8 }}>
                          (Token Expired)
                        </Text>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <Text style={{ color: '#9CA3AF' }}>Not Connected</Text>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              {isConnected ? (
                <Button
                  danger
                  loading={disconnectLoading}
                  onClick={handleDisconnect}
                  style={{ height: '40px' }}
                >
                  {disconnectLoading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              ) : (
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleConnect}
                  style={{
                    backgroundColor: '#00B58E',
                    borderColor: '#00B58E',
                    height: '40px',
                  }}
                >
                  {loading ? 'Connecting...' : 'Connect Google Fit'}
                </Button>
              )}
            </div>
          </div>
        )}

        {isConnected && googleFitStatus && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Connection Status:</Text>
                <br />
                <div className="flex items-center space-x-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Text style={{ color: '#10B981' }}>
                    {googleFitStatus.is_expired ? 'Connected (Expired)' : 'Active'}
                  </Text>
                </div>
              </div>
              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Expires At:</Text>
                <br />
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Text style={{ color: '#9CA3AF' }}>
                    {formatDate(googleFitStatus.expires_at)}
                  </Text>
                </div>
              </div>
              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Last Updated:</Text>
                <br />
                <Text style={{ color: '#9CA3AF' }}>
                  {formatDate(googleFitStatus.last_updated)}
                </Text>
              </div>
              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Scopes:</Text>
                <br />
                <Text style={{ color: '#9CA3AF' }}>
                  {googleFitStatus.scopes.length} permissions granted
                </Text>
              </div>
            </div>
          </div>
        )}

        {isConnected && !statusLoading && (
          <Alert
            message="Successfully Connected"
            description="Your Google Fit account is now connected and syncing health data."
            type="success"
            showIcon
            className="rounded-lg"
          />
        )}

        {!isConnected && !statusLoading && (
          <Alert
            message="Connect Your Google Fit Account"
            description="Connect to automatically sync your fitness and health data for better insights."
            type="info"
            showIcon
            className="rounded-lg"
          />
        )}
      </Card>

      {/* Data Sync Settings */}
      <Card
        className="shadow-lg rounded-xl border-0"
        style={{ 
          backgroundColor: '#1F2937',
          border: '1px solid #374151'
        }}
      >
        <Title level={4} style={{ color: '#F7F7F7', marginBottom: 16 }}>
          Data Synchronization
        </Title>

        <div className="flex items-center justify-between mb-6">
          <div>
            <Text strong style={{ color: '#F7F7F7' }}>
              Auto Sync
            </Text>
            <br />
            <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
              Automatically sync data from Google Fit
            </Text>
          </div>
          <Switch
            checked={syncEnabled}
            onChange={setSyncEnabled}
            disabled={!isConnected}
            style={{
              backgroundColor: syncEnabled ? '#00B58E' : undefined,
            }}
          />
        </div>

        <Divider style={{ borderColor: '#374151' }} />

        <div className="space-y-4">
          <Text strong style={{ color: '#F7F7F7', fontSize: '16px' }}>
            Data Types
          </Text>
          
          {/* Group data types by category */}
          {['fitness', 'vitals', 'body', 'sleep', 'location', 'profile'].map(category => {
            const categoryTypes = fitDataTypes.filter(type => type.category === category);
            if (categoryTypes.length === 0) return null;
            
            const categoryNames = {
              fitness: 'Fitness & Activity',
              vitals: 'Health Vitals',
              body: 'Body Measurements',
              sleep: 'Sleep & Recovery',
              location: 'Location & GPS',
              profile: 'Profile & Account'
            };
            
            return (
              <div key={category} className="space-y-3">
                <Text strong style={{ color: '#00B58E', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {categoryNames[category]}
                </Text>
                {categoryTypes.map((dataType, index) => (
                  <div key={`${category}-${index}`} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                    <div className="flex items-center space-x-3">
                      {dataType.icon}
                      <div>
                        <Text strong style={{ color: '#F7F7F7' }}>
                          {dataType.title}
                        </Text>
                        <br />
                        <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                          {dataType.description}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {dataType.enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                      )}
                      <Switch
                        checked={dataType.enabled}
                        disabled={!isConnected}
                        size="small"
                        style={{
                          backgroundColor: dataType.enabled ? '#00B58E' : undefined,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sync Statistics */}
      {isConnected && googleFitStatus && !statusLoading && (
        <Card
          className="shadow-lg rounded-xl border-0"
          style={{ 
            backgroundColor: '#1F2937',
            border: '1px solid #374151'
          }}
        >
          <Title level={4} style={{ color: '#F7F7F7', marginBottom: 16 }}>
            Sync Statistics
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Last Sync</span>}
                value={googleFitStatus.last_updated ? 'Recently' : 'Never'}
                valueStyle={{ color: '#00B58E' }}
                prefix={<Clock className="w-4 h-4" />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Data Points</span>}
                value={1234}
                valueStyle={{ color: '#1D459A' }}
                prefix={<TrendingUp className="w-4 h-4" />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Scopes</span>}
                value={googleFitStatus.scopes.length}
                suffix="permissions"
                valueStyle={{ color: '#10B981' }}
                prefix={<Activity className="w-4 h-4" />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Status</span>}
                value={googleFitStatus.is_expired ? 'Expired' : 'Active'}
                valueStyle={{ color: googleFitStatus.is_expired ? '#EF4444' : '#10B981' }}
                prefix={<Heart className="w-4 h-4" />}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card
        className="shadow-lg rounded-xl border-0"
        style={{ 
          backgroundColor: '#1F2937',
          border: '1px solid #374151'
        }}
      >
        <Title level={4} style={{ color: '#F7F7F7', marginBottom: 16 }}>
          Privacy & Security
        </Title>
        
        <Space direction="vertical" size="middle" className="w-full">
          <Paragraph style={{ color: '#9CA3AF', marginBottom: 0 }}>
            • Your health data is encrypted and stored securely
          </Paragraph>
          <Paragraph style={{ color: '#9CA3AF', marginBottom: 0 }}>
            • We only access data you explicitly authorize
          </Paragraph>
          <Paragraph style={{ color: '#9CA3AF', marginBottom: 0 }}>
            • You can disconnect and delete your data at any time
          </Paragraph>
          <Paragraph style={{ color: '#9CA3AF', marginBottom: 0 }}>
            • Data is used only for health insights and recommendations
          </Paragraph>
        </Space>
      </Card>

      {/* Disconnect Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
            <span style={{ color: '#F7F7F7' }}>Disconnect Google Fit</span>
          </div>
        }
        open={disconnectModalVisible}
        onCancel={() => setDisconnectModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setDisconnectModalVisible(false)}
            style={{ color: '#9CA3AF' }}
          >
            Cancel
          </Button>,
          <Button
            key="disconnect"
            type="primary"
            danger
            loading={disconnectLoading}
            onClick={confirmDisconnect}
          >
            {disconnectLoading ? 'Disconnecting...' : 'Disconnect'}
          </Button>,
        ]}
        styles={{
          content: {
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
          },
          header: {
            backgroundColor: '#1F2937',
            borderBottom: '1px solid #374151',
          },
        }}
      >
        <div className="py-4">
          <Text style={{ color: '#F7F7F7', fontSize: '16px' }}>
            Are you sure you want to disconnect your Google Fit account?
          </Text>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
            <Text style={{ color: '#9CA3AF' }}>
              This will:
            </Text>
            <ul className="mt-2 space-y-1" style={{ color: '#9CA3AF' }}>
              <li>• Stop syncing your health and fitness data</li>
              <li>• Remove access to your Google Fit account</li>
              <li>• Require re-authorization to reconnect</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GoogleFitSettings;