import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Alert, Spin, Tabs, Select } from 'antd';
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
  const [timeRange, setTimeRange] = useState<'7days' | '1month'>('7days');

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

  const generateMockData = (days: number, baseValue: number, variance: number) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const value = baseValue + (Math.random() - 0.5) * variance;
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value * 10) / 10
      });
    }
    return data;
  };

  const getHistoricalData = (parameter: string) => {
    const days = timeRange === '7days' ? 7 : 30;

    switch (parameter) {
      case 'heart_rate':
        return generateMockData(days, 75, 15);
      case 'blood_pressure_sys':
        return generateMockData(days, 120, 20);
      case 'blood_pressure_dia':
        return generateMockData(days, 80, 10);
      case 'temperature':
        return generateMockData(days, 36.8, 1);
      case 'oxygen_level':
        return generateMockData(days, 98, 3);
      case 'steps':
        return generateMockData(days, 7500, 3000);
      case 'sleep_hours':
        return generateMockData(days, 7.5, 2);
      default:
        return [];
    }
  };

  const SimpleLineChart: React.FC<{ data: any[]; color: string; title: string; unit: string }> = ({
    data,
    color,
    title,
    unit
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    const padding = range * 0.1;

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (((point.value - minValue + padding) / (range + padding * 2)) * 100);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Text strong style={{ color: '#F7F7F7', fontSize: '16px' }}>
            {title}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
            Average: {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)} {unit}
          </Text>
        </div>

        <div className="relative" style={{ width: '100%', height: '250px', backgroundColor: '#111827', borderRadius: '8px', padding: '20px' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (((point.value - minValue + padding) / (range + padding * 2)) * 100);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1"
                  fill={color}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          {data.map((point, index) => {
            if (timeRange === '7days' || index % 3 === 0 || index === data.length - 1) {
              return (
                <div key={index} className="text-center">
                  <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>{point.date}</Text>
                  <br />
                  <Text style={{ color: color, fontSize: '12px', fontWeight: 500 }}>{point.value} {unit}</Text>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const Simple3DModel: React.FC = () => {
    return (
      <div className="flex items-center justify-center h-full w-full" style={{ minHeight: '500px' }}>
        <spline-viewer
          url="https://prod.spline.design/de7jQ4g3jVYN90Km/scene.splinecode"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '500px'
          }}
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

            <div className="relative flex items-center justify-center" style={{ height: '400px', overflow: 'hidden' }}>
              <Simple3DModel />

              {loading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10
                  }}
                >
                  <Spin size="large" />
                </div>
              )}
            </div>

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

      {/* Historical Data Tabs */}
      <Card
        className="shadow-lg rounded-xl border-0"
        style={{
          backgroundColor: '#1F2937',
          border: '1px solid #374151'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <Title level={3} style={{ color: '#F7F7F7', marginBottom: 0 }}>
            Historical Data
          </Title>
          <Select
            value={timeRange}
            onChange={(value) => setTimeRange(value)}
            style={{ width: 150 }}
            options={[
              { value: '7days', label: 'Last 7 Days' },
              { value: '1month', label: 'Last 30 Days' }
            ]}
          />
        </div>

        <Tabs
          defaultActiveKey="heart_rate"
          type="card"
          items={[
            {
              key: 'heart_rate',
              label: (
                <span className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Heart Rate</span>
                </span>
              ),
              children: (
                <SimpleLineChart
                  data={getHistoricalData('heart_rate')}
                  color="#EF4444"
                  title="Heart Rate Trend"
                  unit="bpm"
                />
              )
            },
            {
              key: 'blood_pressure',
              label: (
                <span className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Blood Pressure</span>
                </span>
              ),
              children: (
                <div className="space-y-8">
                  <SimpleLineChart
                    data={getHistoricalData('blood_pressure_sys')}
                    color="#F59E0B"
                    title="Systolic Blood Pressure"
                    unit="mmHg"
                  />
                  <SimpleLineChart
                    data={getHistoricalData('blood_pressure_dia')}
                    color="#10B981"
                    title="Diastolic Blood Pressure"
                    unit="mmHg"
                  />
                </div>
              )
            },
            {
              key: 'temperature',
              label: (
                <span className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature</span>
                </span>
              ),
              children: (
                <SimpleLineChart
                  data={getHistoricalData('temperature')}
                  color="#EF4444"
                  title="Body Temperature Trend"
                  unit="°C"
                />
              )
            },
            {
              key: 'oxygen',
              label: (
                <span className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4" />
                  <span>Oxygen Level</span>
                </span>
              ),
              children: (
                <SimpleLineChart
                  data={getHistoricalData('oxygen_level')}
                  color="#10B981"
                  title="Blood Oxygen Level Trend"
                  unit="%"
                />
              )
            },
            {
              key: 'steps',
              label: (
                <span className="flex items-center space-x-2">
                  <Footprints className="w-4 h-4" />
                  <span>Steps</span>
                </span>
              ),
              children: (
                <SimpleLineChart
                  data={getHistoricalData('steps')}
                  color="#1D459A"
                  title="Daily Steps Trend"
                  unit="steps"
                />
              )
            },
            {
              key: 'sleep',
              label: (
                <span className="flex items-center space-x-2">
                  <Moon className="w-4 h-4" />
                  <span>Sleep</span>
                </span>
              ),
              children: (
                <SimpleLineChart
                  data={getHistoricalData('sleep_hours')}
                  color="#8B5CF6"
                  title="Sleep Duration Trend"
                  unit="hours"
                />
              )
            }
          ]}
          className="custom-tabs"
        />
      </Card>
    </div>
  );
};

export default YourTwinPage;