import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Alert, Spin } from 'antd';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Footprints,
  Moon,
  Zap,
  RefreshCw,
  User,
  TrendingUp,
  Clock
} from 'lucide-react';
import apiService from '../../services/apiService';

const { Title, Text } = Typography;

interface HealthData {
  user_id: number;
  heart_rate: number | null;
  blood_pressure_sys: number | null;
  blood_pressure_dia: number | null;
  stress: number | null;
  ecg: string | null;
  temperature: number | null;
  oxygen_level: number | null;
  steps: number | null;
  sleep_hours: number | null;
  recorded_at: string;
}

const YourTwinPage: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.syncAndGetLatestHealthData();
      setHealthData(response.data);
      setLastUpdated(new Date());
      
      console.log('Health data fetched:', response.data);
    } catch (err: any) {
      console.error('Failed to fetch health data:', err);
      setError(err.message || 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getHealthStatus = (value: number | null, type: string) => {
    if (value === null) return { status: 'No data', color: '#9CA3AF' };
    
    switch (type) {
      case 'heart_rate':
        if (value < 60) return { status: 'Low', color: '#EF4444' };
        if (value > 100) return { status: 'High', color: '#EF4444' };
        return { status: 'Normal', color: '#10B981' };
      
      case 'blood_pressure_sys':
        if (value < 90) return { status: 'Low', color: '#EF4444' };
        if (value > 140) return { status: 'High', color: '#EF4444' };
        return { status: 'Normal', color: '#10B981' };
      
      case 'temperature':
        if (value < 36.1) return { status: 'Low', color: '#3B82F6' };
        if (value > 37.2) return { status: 'High', color: '#EF4444' };
        return { status: 'Normal', color: '#10B981' };
      
      case 'oxygen_level':
        if (value < 95) return { status: 'Low', color: '#EF4444' };
        return { status: 'Normal', color: '#10B981' };
      
      default:
        return { status: 'Normal', color: '#10B981' };
    }
  };

  const Simple3DModel: React.FC = () => {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <iframe
          src='https://my.spline.design/untitled-gDQkmatQc8qeHm9NYbc7valn/'
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
            minHeight: '400px'
          }}
          title="3D Health Model"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#00B58E' }}
          >
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <Title level={2} style={{ color: '#F7F7F7', marginBottom: 4 }}>
              Your Digital Twin
            </Title>
            <Text style={{ color: '#9CA3AF' }}>
              Real-time health monitoring and visualization
            </Text>
          </div>
        </div>
        
        <Button
          type="primary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={fetchHealthData}
          loading={loading}
          style={{
            backgroundColor: '#00B58E',
            borderColor: '#00B58E',
            height: '44px',
          }}
        >
          Sync Data
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="rounded-lg"
        />
      )}

      {/* Main Content */}
      <Row gutter={24} style={{ minHeight: '600px' }}>
        {/* Left Side - 3D Model */}
        <Col xs={24} lg={12}>
          <Card
            className="shadow-lg rounded-xl border-0 h-full"
            style={{ 
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              minHeight: '600px'
            }}
          >
            <div className="text-center mb-4">
              <Title level={4} style={{ color: '#F7F7F7' }}>
                Health Visualization
              </Title>
              <Text style={{ color: '#9CA3AF' }}>
                Your body's current state
              </Text>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <Spin size="large" />
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ height: '400px', overflow: 'hidden' }}>
                <Simple3DModel />
              </div>
            )}
            
            {lastUpdated && (
              <div className="text-center mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </Text>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Side - Live Data */}
        <Col xs={24} lg={12}>
          <div className="space-y-4">
            {/* Health Metrics Grid */}
            <Row gutter={[16, 16]}>
              {/* Heart Rate */}
              <Col xs={24} sm={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#9CA3AF' }}>Heart Rate</span>}
                    value={healthData?.heart_rate || 'N/A'}
                    suffix={healthData?.heart_rate ? 'bpm' : ''}
                    valueStyle={{ 
                      color: healthData?.heart_rate 
                        ? getHealthStatus(healthData.heart_rate, 'heart_rate').color 
                        : '#9CA3AF' 
                    }}
                    prefix={<Heart className="w-4 h-4" style={{ color: '#EF4444' }} />}
                  />
                  {healthData?.heart_rate && (
                    <Text style={{ 
                      color: getHealthStatus(healthData.heart_rate, 'heart_rate').color,
                      fontSize: '12px'
                    }}>
                      {getHealthStatus(healthData.heart_rate, 'heart_rate').status}
                    </Text>
                  )}
                </Card>
              </Col>

              {/* Blood Pressure */}
              <Col xs={24} sm={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#9CA3AF' }}>Blood Pressure</span>}
                    value={
                      healthData?.blood_pressure_sys && healthData?.blood_pressure_dia
                        ? `${healthData.blood_pressure_sys}/${healthData.blood_pressure_dia}`
                        : 'N/A'
                    }
                    suffix={healthData?.blood_pressure_sys ? 'mmHg' : ''}
                    valueStyle={{ 
                      color: healthData?.blood_pressure_sys 
                        ? getHealthStatus(healthData.blood_pressure_sys, 'blood_pressure_sys').color 
                        : '#9CA3AF' 
                    }}
                    prefix={<TrendingUp className="w-4 h-4" style={{ color: '#F59E0B' }} />}
                  />
                  {healthData?.blood_pressure_sys && (
                    <Text style={{ 
                      color: getHealthStatus(healthData.blood_pressure_sys, 'blood_pressure_sys').color,
                      fontSize: '12px'
                    }}>
                      {getHealthStatus(healthData.blood_pressure_sys, 'blood_pressure_sys').status}
                    </Text>
                  )}
                </Card>
              </Col>

              {/* Temperature */}
              <Col xs={24} sm={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#9CA3AF' }}>Temperature</span>}
                    value={healthData?.temperature || 'N/A'}
                    suffix={healthData?.temperature ? '°C' : ''}
                    precision={1}
                    valueStyle={{ 
                      color: healthData?.temperature 
                        ? getHealthStatus(healthData.temperature, 'temperature').color 
                        : '#9CA3AF' 
                    }}
                    prefix={<Thermometer className="w-4 h-4" style={{ color: '#EF4444' }} />}
                  />
                  {healthData?.temperature && (
                    <Text style={{ 
                      color: getHealthStatus(healthData.temperature, 'temperature').color,
                      fontSize: '12px'
                    }}>
                      {getHealthStatus(healthData.temperature, 'temperature').status}
                    </Text>
                  )}
                </Card>
              </Col>

              {/* Oxygen Level */}
              <Col xs={24} sm={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#9CA3AF' }}>Oxygen Level</span>}
                    value={healthData?.oxygen_level || 'N/A'}
                    suffix={healthData?.oxygen_level ? '%' : ''}
                    valueStyle={{ 
                      color: healthData?.oxygen_level 
                        ? getHealthStatus(healthData.oxygen_level, 'oxygen_level').color 
                        : '#9CA3AF' 
                    }}
                    prefix={<Droplets className="w-4 h-4" style={{ color: '#10B981' }} />}
                  />
                  {healthData?.oxygen_level && (
                    <Text style={{ 
                      color: getHealthStatus(healthData.oxygen_level, 'oxygen_level').color,
                      fontSize: '12px'
                    }}>
                      {getHealthStatus(healthData.oxygen_level, 'oxygen_level').status}
                    </Text>
                  )}
                </Card>
              </Col>

              {/* Steps */}
              <Col xs={24} sm={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#9CA3AF' }}>Steps Today</span>}
                    value={healthData?.steps || 'N/A'}
                    suffix={healthData?.steps ? 'steps' : ''}
                    valueStyle={{ color: '#1D459A' }}
                    prefix={<Footprints className="w-4 h-4" style={{ color: '#1D459A' }} />}
                  />
                </Card>
              </Col>

              {/* Sleep Hours */}
              <Col xs={24} sm={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#9CA3AF' }}>Sleep Hours</span>}
                    value={healthData?.sleep_hours || 'N/A'}
                    suffix={healthData?.sleep_hours ? 'hrs' : ''}
                    precision={1}
                    valueStyle={{ color: '#8B5CF6' }}
                    prefix={<Moon className="w-4 h-4" style={{ color: '#8B5CF6' }} />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Data Timestamp */}
            {healthData && (
              <Card
                className="shadow-lg rounded-xl border-0"
                style={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151'
                }}
              >
                <div className="text-center">
                  <Text strong style={{ color: '#F7F7F7' }}>
                    Data Recorded At
                  </Text>
                  <br />
                  <Text style={{ color: '#9CA3AF' }}>
                    {formatDate(healthData.recorded_at)}
                  </Text>
                </div>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default YourTwinPage;