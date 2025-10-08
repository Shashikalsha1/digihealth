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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import apiService from '../../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

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

  const generateHeartRateData = (days: number) => {
    const data = [];
    const today = new Date();
    const zones = [
      { min: 50, max: 65, weight: 0.25 },
      { min: 65, max: 100, weight: 0.4 },
      { min: 100, max: 140, weight: 0.25 },
      { min: 140, max: 170, weight: 0.1 }
    ];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const random = Math.random();
      let cumulativeWeight = 0;
      let selectedZone = zones[1];

      for (const zone of zones) {
        cumulativeWeight += zone.weight;
        if (random <= cumulativeWeight) {
          selectedZone = zone;
          break;
        }
      }

      const value = selectedZone.min + Math.random() * (selectedZone.max - selectedZone.min);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value)
      });
    }
    return data;
  };

  const getHistoricalData = (parameter: string) => {
    const days = timeRange === '7days' ? 7 : 30;

    switch (parameter) {
      case 'heart_rate':
        return generateHeartRateData(days);
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

  const HeartRateChart: React.FC<{ data: any[]; unit: string }> = ({ data, unit }) => {
    const [chartType, setChartType] = React.useState<'line' | 'bar'>('line');
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;

    const getHeartRateZone = (value: number) => {
      if (value < 60) return { zone: 'Low', color: '#3B82F6', label: 'Resting' };
      if (value < 100) return { zone: 'Normal', color: '#10B981', label: 'Healthy' };
      if (value < 140) return { zone: 'Elevated', color: '#F59E0B', label: 'Active' };
      return { zone: 'High', color: '#EF4444', label: 'Intense' };
    };

    const zoneDistribution = data.reduce((acc, point) => {
      const zone = getHeartRateZone(point.value);
      acc[zone.label] = (acc[zone.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lineChartData = {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: 'Heart Rate',
          data: data.map(d => d.value),
          borderColor: '#EF4444',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
            return gradient;
          },
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: data.map(d => getHeartRateZone(d.value).color),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: data.map(d => getHeartRateZone(d.value).color),
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
        }
      ]
    };

    const lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#F7F7F7',
          bodyColor: '#F7F7F7',
          borderColor: '#374151',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context: any) {
              const value = context.parsed.y;
              const zone = getHeartRateZone(value);
              return [
                `Heart Rate: ${value} ${unit}`,
                `Zone: ${zone.label}`,
                `Status: ${zone.zone}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: '#374151',
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: '#374151',
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            },
            callback: function(value: any) {
              return value + ' ' + unit;
            }
          },
          beginAtZero: false
        }
      }
    };

    const barChartData = {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: 'Heart Rate',
          data: data.map(d => d.value),
          backgroundColor: data.map(d => {
            const zone = getHeartRateZone(d.value);
            return zone.color + '99';
          }),
          borderColor: data.map(d => getHeartRateZone(d.value).color),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    };

    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#F7F7F7',
          bodyColor: '#F7F7F7',
          borderColor: '#374151',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              const value = context.parsed.y;
              const zone = getHeartRateZone(value);
              return `${value} ${unit} (${zone.label})`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: '#374151',
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            },
            callback: function(value: any) {
              return value + ' ' + unit;
            }
          },
          beginAtZero: false
        }
      }
    };

    const doughnutChartData = {
      labels: ['Resting', 'Healthy', 'Active', 'Intense'],
      datasets: [
        {
          data: [
            zoneDistribution['Resting'] || 0,
            zoneDistribution['Healthy'] || 0,
            zoneDistribution['Active'] || 0,
            zoneDistribution['Intense'] || 0
          ],
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444'
          ],
          borderColor: '#1F2937',
          borderWidth: 3,
        }
      ]
    };

    const doughnutChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: '#F7F7F7',
            padding: 15,
            font: {
              size: 12
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#F7F7F7',
          bodyColor: '#F7F7F7',
          borderColor: '#374151',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context: any) {
              const total = data.length;
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} days (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%'
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card
            className="shadow-lg rounded-xl border-0"
            style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
          >
            <div className="text-center">
              <Text style={{ color: '#9CA3AF', fontSize: '13px' }}>Average</Text>
              <div className="mt-2">
                <Text strong style={{ color: '#10B981', fontSize: '28px' }}>
                  {avgValue.toFixed(0)}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>{unit}</Text>
              </div>
              <div className="mt-1">
                <Heart className="w-5 h-5 mx-auto" style={{ color: '#10B981' }} />
              </div>
            </div>
          </Card>

          <Card
            className="shadow-lg rounded-xl border-0"
            style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
          >
            <div className="text-center">
              <Text style={{ color: '#9CA3AF', fontSize: '13px' }}>Minimum</Text>
              <div className="mt-2">
                <Text strong style={{ color: '#3B82F6', fontSize: '28px' }}>
                  {minValue.toFixed(0)}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>{unit}</Text>
              </div>
              <div className="mt-1">
                <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                  {getHeartRateZone(minValue).label}
                </Text>
              </div>
            </div>
          </Card>

          <Card
            className="shadow-lg rounded-xl border-0"
            style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
          >
            <div className="text-center">
              <Text style={{ color: '#9CA3AF', fontSize: '13px' }}>Maximum</Text>
              <div className="mt-2">
                <Text strong style={{ color: '#EF4444', fontSize: '28px' }}>
                  {maxValue.toFixed(0)}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>{unit}</Text>
              </div>
              <div className="mt-1">
                <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                  {getHeartRateZone(maxValue).label}
                </Text>
              </div>
            </div>
          </Card>

          <Card
            className="shadow-lg rounded-xl border-0"
            style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
          >
            <div style={{ padding: '4px' }}>
              <Text strong style={{ color: '#F7F7F7', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                HR Zones
              </Text>
              <div className="space-y-1">
                {[
                  { label: 'Resting', range: '<60', color: '#3B82F6' },
                  { label: 'Healthy', range: '60-100', color: '#10B981' },
                  { label: 'Active', range: '100-140', color: '#F59E0B' },
                  { label: 'Intense', range: '>140', color: '#EF4444' }
                ].map((zone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: zone.color }}
                      />
                      <Text style={{ color: '#F7F7F7', fontSize: '11px' }}>
                        {zone.label}
                      </Text>
                    </div>
                    <Text style={{ color: zone.color, fontSize: '11px', fontWeight: 500 }}>
                      {zone.range}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            >
              <div className="flex items-center justify-between mb-4">
                <Text strong style={{ color: '#F7F7F7', fontSize: '18px' }}>
                  Heart Rate Trend
                </Text>
                <div className="flex items-center space-x-2">
                  <Button
                    type={chartType === 'line' ? 'primary' : 'default'}
                    onClick={() => setChartType('line')}
                    style={{
                      backgroundColor: chartType === 'line' ? '#00B58E' : '#374151',
                      borderColor: chartType === 'line' ? '#00B58E' : '#4B5563',
                      color: '#F7F7F7'
                    }}
                  >
                    Line Chart
                  </Button>
                  <Button
                    type={chartType === 'bar' ? 'primary' : 'default'}
                    onClick={() => setChartType('bar')}
                    style={{
                      backgroundColor: chartType === 'bar' ? '#00B58E' : '#374151',
                      borderColor: chartType === 'bar' ? '#00B58E' : '#4B5563',
                      color: '#F7F7F7'
                    }}
                  >
                    Bar Chart
                  </Button>
                </div>
              </div>
              <div style={{ height: '350px', padding: '10px' }}>
                {chartType === 'line' ? (
                  <Line data={lineChartData} options={lineChartOptions} />
                ) : (
                  <Bar data={barChartData} options={barChartOptions} />
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{ backgroundColor: '#111827', border: '1px solid #374151', height: '100%' }}
            >
              <div className="mb-4">
                <Text strong style={{ color: '#F7F7F7', fontSize: '18px' }}>
                  Zone Distribution
                </Text>
              </div>
              <div style={{ height: '300px', padding: '10px' }}>
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
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

  const LiveView = () => (
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
  );

  const HistoryView = () => (
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
                <HeartRateChart
                  data={getHistoricalData('heart_rate')}
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
  );

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

      {/* Main Tabs - Live and History */}
      <Tabs
        defaultActiveKey="live"
        type="line"
        size="large"
        items={[
          {
            key: 'live',
            label: (
              <span className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span style={{ fontSize: '16px' }}>Live</span>
              </span>
            ),
            children: <LiveView />
          },
          {
            key: 'history',
            label: (
              <span className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span style={{ fontSize: '16px' }}>History</span>
              </span>
            ),
            children: <HistoryView />
          }
        ]}
        className="main-twin-tabs"
      />
    </div>
  );
};

export default YourTwinPage;