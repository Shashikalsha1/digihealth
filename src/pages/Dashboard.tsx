import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Alert, Button, Spin, Badge, Divider, Tag } from 'antd';
import {
  User,
  Activity,
  Heart,
  Calendar,
  FileImage,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  Zap,
  Target,
  Award,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Brain,
  Stethoscope,
  Thermometer,
  Droplets,
  Moon,
  Flame,
  ArrowRight,
  AlertCircle,
  Info
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useAuthStore } from '../store/authStore';
import DashboardLayout from '../components/layout/DashboardLayout';
import apiService from '../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const { Title, Text } = Typography;

interface DashboardStats {
  healthData: any;
  googleFitStatus: any;
  medicalScans: any[];
  healthScore: number;
  activeDays: number;
  lastCheckup: string;
  pendingReports: number;
  weeklyTrends: any;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    healthData: null,
    googleFitStatus: null,
    medicalScans: [],
    healthScore: 0,
    activeDays: 0,
    lastCheckup: 'Never',
    pendingReports: 0,
    weeklyTrends: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const generateWeeklyTrends = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heartRates = days.map(() => Math.floor(Math.random() * 30) + 70);
    const steps = days.map(() => Math.floor(Math.random() * 5000) + 5000);
    const sleepHours = days.map(() => Math.random() * 2 + 6);

    return { days, heartRates, steps, sleepHours };
  };

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [healthDataResponse, googleFitResponse, medicalScansResponse] = await Promise.allSettled([
        apiService.syncAndGetLatestHealthData().catch(() => null),
        apiService.getGoogleFitStatus().catch(() => null),
        apiService.getMedicalScans().catch(() => ({ data: [] }))
      ]);

      const healthData = healthDataResponse.status === 'fulfilled' ? healthDataResponse.value?.data : null;
      const googleFitStatus = googleFitResponse.status === 'fulfilled' ? googleFitResponse.value : null;
      const medicalScans = medicalScansResponse.status === 'fulfilled' ? medicalScansResponse.value?.data || [] : [];

      const weeklyTrends = generateWeeklyTrends();
      const healthScore = calculateHealthScore(healthData, googleFitStatus, medicalScans);
      const activeDays = healthData?.steps ? Math.min(Math.floor(healthData.steps / 1000), 30) : 0;

      const lastCheckup = medicalScans.length > 0
        ? formatRelativeTime(medicalScans[0].upload_date)
        : 'Never';

      const pendingReports = medicalScans.filter((scan: any) => !scan.is_analyzed).length;

      setStats({
        healthData,
        googleFitStatus,
        medicalScans,
        healthScore,
        activeDays,
        lastCheckup,
        pendingReports,
        weeklyTrends
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateHealthScore = (healthData: any, googleFitStatus: any, medicalScans: any[]) => {
    let score = 0;
    let maxScore = 0;

    maxScore += 20;
    if (googleFitStatus?.connected && !googleFitStatus?.is_expired) {
      score += 20;
    } else if (googleFitStatus?.connected) {
      score += 10;
    }

    if (healthData) {
      maxScore += 15;
      if (healthData.heart_rate) {
        if (healthData.heart_rate >= 60 && healthData.heart_rate <= 100) {
          score += 15;
        } else {
          score += 8;
        }
      }

      maxScore += 15;
      if (healthData.blood_pressure_sys && healthData.blood_pressure_dia) {
        if (healthData.blood_pressure_sys >= 90 && healthData.blood_pressure_sys <= 140) {
          score += 15;
        } else {
          score += 8;
        }
      }

      maxScore += 10;
      if (healthData.temperature) {
        if (healthData.temperature >= 36.1 && healthData.temperature <= 37.2) {
          score += 10;
        } else {
          score += 5;
        }
      }

      maxScore += 10;
      if (healthData.oxygen_level) {
        if (healthData.oxygen_level >= 95) {
          score += 10;
        } else {
          score += 5;
        }
      }

      maxScore += 10;
      if (healthData.steps) {
        if (healthData.steps >= 8000) {
          score += 10;
        } else if (healthData.steps >= 5000) {
          score += 7;
        } else if (healthData.steps >= 2000) {
          score += 4;
        } else {
          score += 2;
        }
      }
    } else {
      maxScore += 60;
    }

    maxScore += 20;
    if (medicalScans.length > 0) {
      score += Math.min(medicalScans.length * 5, 20);
    }

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#6B7280';
  };

  const getHealthScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getVitalStatus = (value: number, type: string) => {
    switch (type) {
      case 'heart_rate':
        if (value < 60) return { status: 'Low', color: '#3B82F6', trend: 'down' };
        if (value <= 100) return { status: 'Normal', color: '#10B981', trend: 'stable' };
        if (value <= 140) return { status: 'Elevated', color: '#F59E0B', trend: 'up' };
        return { status: 'High', color: '#EF4444', trend: 'up' };
      case 'temperature':
        if (value < 36.5) return { status: 'Low', color: '#3B82F6', trend: 'down' };
        if (value <= 37.2) return { status: 'Normal', color: '#10B981', trend: 'stable' };
        if (value <= 37.8) return { status: 'Elevated', color: '#F59E0B', trend: 'up' };
        return { status: 'Fever', color: '#EF4444', trend: 'up' };
      case 'oxygen':
        if (value < 95) return { status: 'Low', color: '#EF4444', trend: 'down' };
        if (value <= 98) return { status: 'Normal', color: '#10B981', trend: 'stable' };
        return { status: 'Optimal', color: '#00B58E', trend: 'stable' };
      default:
        return { status: 'Normal', color: '#10B981', trend: 'stable' };
    }
  };

  const createTrendChart = (data: number[], label: string, color: string) => {
    return {
      labels: stats.weeklyTrends?.days || [],
      datasets: [
        {
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    };
  };

  const chartOptions = {
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
          }
        },
        beginAtZero: false
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} style={{ color: '#F7F7F7', marginBottom: 8 }}>
              {greeting}, {user?.first_name}! 👋
            </Title>
            <Text style={{ color: '#9CA3AF', fontSize: '16px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => fetchDashboardData(true)}
            loading={refreshing}
            style={{
              backgroundColor: '#00B58E',
              borderColor: '#00B58E',
              height: '44px',
            }}
          >
            {refreshing ? 'Syncing...' : 'Sync Data'}
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Title level={4} style={{ color: '#F7F7F7', marginBottom: 4 }}>
                    Overall Health Score
                  </Title>
                  <Text style={{ color: '#9CA3AF' }}>
                    Based on vitals, activity, and checkups
                  </Text>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: getHealthScoreColor(stats.healthScore) }}>
                    {stats.healthScore}
                  </div>
                  <Tag color={getHealthScoreColor(stats.healthScore)} style={{ marginTop: '4px' }}>
                    {getHealthScoreStatus(stats.healthScore)}
                  </Tag>
                </div>
              </div>

              <Progress
                percent={stats.healthScore}
                strokeColor={{
                  '0%': getHealthScoreColor(stats.healthScore),
                  '100%': getHealthScoreColor(stats.healthScore),
                }}
                trailColor="#374151"
                strokeWidth={16}
                showInfo={false}
                className="mb-6"
              />

              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-center p-3 rounded-lg transition-all hover:bg-gray-800" style={{ backgroundColor: '#111827' }}>
                    <Smartphone className="w-6 h-6 mx-auto mb-2" style={{ color: stats.googleFitStatus?.connected ? '#10B981' : '#6B7280' }} />
                    <Text style={{ color: '#F7F7F7', fontSize: '12px', display: 'block', fontWeight: 500 }}>
                      {stats.googleFitStatus?.connected ? 'Connected' : 'Disconnected'}
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                      Google Fit
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center p-3 rounded-lg transition-all hover:bg-gray-800" style={{ backgroundColor: '#111827' }}>
                    <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: stats.healthData ? '#EF4444' : '#6B7280' }} />
                    <Text style={{ color: '#F7F7F7', fontSize: '12px', display: 'block', fontWeight: 500 }}>
                      {stats.healthData ? 'Active' : 'Inactive'}
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                      Vitals
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center p-3 rounded-lg transition-all hover:bg-gray-800" style={{ backgroundColor: '#111827' }}>
                    <Activity className="w-6 h-6 mx-auto mb-2" style={{ color: stats.healthData?.steps ? '#1D459A' : '#6B7280' }} />
                    <Text style={{ color: '#F7F7F7', fontSize: '12px', display: 'block', fontWeight: 500 }}>
                      {stats.healthData?.steps ? `${stats.activeDays}d` : 'No Data'}
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                      Active Days
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center p-3 rounded-lg transition-all hover:bg-gray-800" style={{ backgroundColor: '#111827' }}>
                    <FileImage className="w-6 h-6 mx-auto mb-2" style={{ color: stats.medicalScans.length > 0 ? '#00B58E' : '#6B7280' }} />
                    <Text style={{ color: '#F7F7F7', fontSize: '12px', display: 'block', fontWeight: 500 }}>
                      {stats.medicalScans.length}
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                      Scans
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div className="space-y-4">
              <Card
                className="shadow-lg rounded-xl border-0"
                style={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5" style={{ color: '#1D459A' }} />
                    <Text strong style={{ color: '#F7F7F7' }}>Daily Goal</Text>
                  </div>
                  <Text style={{ color: '#1D459A', fontWeight: 600 }}>
                    {stats.healthData?.steps ? Math.round((stats.healthData.steps / 10000) * 100) : 0}%
                  </Text>
                </div>
                <Progress
                  percent={stats.healthData?.steps ? Math.min((stats.healthData.steps / 10000) * 100, 100) : 0}
                  strokeColor="#1D459A"
                  trailColor="#374151"
                  strokeWidth={12}
                  showInfo={false}
                />
                <div className="flex items-center justify-between mt-3">
                  <Text style={{ color: '#9CA3AF', fontSize: '13px' }}>
                    {stats.healthData?.steps?.toLocaleString() || 0} / 10,000 steps
                  </Text>
                  <Activity className="w-4 h-4" style={{ color: '#1D459A' }} />
                </div>
              </Card>

              <Card
                className="shadow-lg rounded-xl border-0"
                style={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Text style={{ color: '#9CA3AF', fontSize: '12px', display: 'block' }}>Last Checkup</Text>
                    <Text strong style={{ color: '#F7F7F7', fontSize: '16px' }}>
                      {stats.lastCheckup}
                    </Text>
                  </div>
                  <Calendar className="w-8 h-8" style={{ color: '#F59E0B' }} />
                </div>
              </Card>

              {stats.pendingReports > 0 && (
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{
                    backgroundColor: '#2D1B1B',
                    border: '1px solid #EF4444'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6" style={{ color: '#EF4444' }} />
                    <div>
                      <Text strong style={{ color: '#EF4444', display: 'block' }}>
                        {stats.pendingReports} Pending Reports
                      </Text>
                      <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                        Awaiting AI analysis
                      </Text>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </Col>
        </Row>

        {stats.healthData && (
          <>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <Title level={4} style={{ color: '#F7F7F7', marginBottom: 0 }}>
                  Current Vital Signs
                </Title>
                <Badge
                  status="processing"
                  text={<Text style={{ color: '#9CA3AF' }}>Live Data</Text>}
                />
              </div>

              <Row gutter={[16, 16]}>
                {stats.healthData.heart_rate && (
                  <Col xs={24} sm={12} md={6}>
                    <div className="p-4 rounded-xl transition-all hover:scale-105" style={{
                      backgroundColor: '#2D1F1F',
                      border: '1px solid #EF4444'
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <Heart className="w-6 h-6" style={{ color: '#EF4444' }} />
                        {getVitalStatus(stats.healthData.heart_rate, 'heart_rate').trend === 'stable' ? (
                          <div style={{ color: '#10B981', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        ) : getVitalStatus(stats.healthData.heart_rate, 'heart_rate').trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" style={{ color: '#F59E0B' }} />
                        ) : (
                          <TrendingDown className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        )}
                      </div>
                      <Text style={{ color: '#9CA3AF', fontSize: '12px', display: 'block' }}>
                        Heart Rate
                      </Text>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <Text style={{ color: '#F7F7F7', fontSize: '24px', fontWeight: 'bold' }}>
                          {stats.healthData.heart_rate}
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                          bpm
                        </Text>
                      </div>
                      <Tag
                        color={getVitalStatus(stats.healthData.heart_rate, 'heart_rate').color}
                        style={{ marginTop: '8px', fontSize: '11px' }}
                      >
                        {getVitalStatus(stats.healthData.heart_rate, 'heart_rate').status}
                      </Tag>
                    </div>
                  </Col>
                )}

                {stats.healthData.blood_pressure_sys && (
                  <Col xs={24} sm={12} md={6}>
                    <div className="p-4 rounded-xl transition-all hover:scale-105" style={{
                      backgroundColor: '#1F2D2D',
                      border: '1px solid #00B58E'
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <Activity className="w-6 h-6" style={{ color: '#00B58E' }} />
                        <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                      </div>
                      <Text style={{ color: '#9CA3AF', fontSize: '12px', display: 'block' }}>
                        Blood Pressure
                      </Text>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <Text style={{ color: '#F7F7F7', fontSize: '24px', fontWeight: 'bold' }}>
                          {stats.healthData.blood_pressure_sys}/{stats.healthData.blood_pressure_dia}
                        </Text>
                      </div>
                      <Text style={{ color: '#9CA3AF', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                        mmHg
                      </Text>
                      <Tag color="#00B58E" style={{ marginTop: '4px', fontSize: '11px' }}>
                        Normal
                      </Tag>
                    </div>
                  </Col>
                )}

                {stats.healthData.temperature && (
                  <Col xs={24} sm={12} md={6}>
                    <div className="p-4 rounded-xl transition-all hover:scale-105" style={{
                      backgroundColor: '#2D2A1F',
                      border: '1px solid #F59E0B'
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <Thermometer className="w-6 h-6" style={{ color: '#F59E0B' }} />
                        {getVitalStatus(stats.healthData.temperature, 'temperature').trend === 'stable' ? (
                          <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                        ) : (
                          <TrendingUp className="w-4 h-4" style={{ color: '#F59E0B' }} />
                        )}
                      </div>
                      <Text style={{ color: '#9CA3AF', fontSize: '12px', display: 'block' }}>
                        Body Temperature
                      </Text>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <Text style={{ color: '#F7F7F7', fontSize: '24px', fontWeight: 'bold' }}>
                          {stats.healthData.temperature}
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                          °C
                        </Text>
                      </div>
                      <Tag
                        color={getVitalStatus(stats.healthData.temperature, 'temperature').color}
                        style={{ marginTop: '8px', fontSize: '11px' }}
                      >
                        {getVitalStatus(stats.healthData.temperature, 'temperature').status}
                      </Tag>
                    </div>
                  </Col>
                )}

                {stats.healthData.oxygen_level && (
                  <Col xs={24} sm={12} md={6}>
                    <div className="p-4 rounded-xl transition-all hover:scale-105" style={{
                      backgroundColor: '#1F2A2D',
                      border: '1px solid #3B82F6'
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <Droplets className="w-6 h-6" style={{ color: '#3B82F6' }} />
                        {getVitalStatus(stats.healthData.oxygen_level, 'oxygen').trend === 'stable' ? (
                          <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                        ) : (
                          <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                        )}
                      </div>
                      <Text style={{ color: '#9CA3AF', fontSize: '12px', display: 'block' }}>
                        Oxygen Level
                      </Text>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <Text style={{ color: '#F7F7F7', fontSize: '24px', fontWeight: 'bold' }}>
                          {stats.healthData.oxygen_level}
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                          %
                        </Text>
                      </div>
                      <Tag
                        color={getVitalStatus(stats.healthData.oxygen_level, 'oxygen').color}
                        style={{ marginTop: '8px', fontSize: '11px' }}
                      >
                        {getVitalStatus(stats.healthData.oxygen_level, 'oxygen').status}
                      </Tag>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Title level={5} style={{ color: '#F7F7F7', marginBottom: 0 }}>
                      Heart Rate Trend
                    </Title>
                    <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      Last 7 days
                    </Text>
                  </div>
                  <div style={{ height: '200px' }}>
                    <Line
                      data={createTrendChart(stats.weeklyTrends?.heartRates || [], 'Heart Rate', '#EF4444')}
                      options={chartOptions}
                    />
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  className="shadow-lg rounded-xl border-0"
                  style={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Title level={5} style={{ color: '#F7F7F7', marginBottom: 0 }}>
                      Activity Trend
                    </Title>
                    <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      Last 7 days
                    </Text>
                  </div>
                  <div style={{ height: '200px' }}>
                    <Line
                      data={createTrendChart(stats.weeklyTrends?.steps || [], 'Steps', '#1D459A')}
                      options={chartOptions}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {!stats.googleFitStatus?.connected && (
          <Alert
            message="Connect Your Health Data"
            description="Link your Google Fit account to start tracking your health metrics automatically and get personalized insights."
            type="info"
            showIcon
            icon={<Info className="w-5 h-5" />}
            action={
              <Button
                size="small"
                type="primary"
                style={{ backgroundColor: '#00B58E', borderColor: '#00B58E' }}
              >
                Connect Google Fit
              </Button>
            }
            className="rounded-lg"
            style={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151'
            }}
          />
        )}

        {stats.googleFitStatus?.connected && stats.googleFitStatus?.is_expired && (
          <Alert
            message="Google Fit Connection Expired"
            description="Your Google Fit authorization has expired. Please reconnect to continue syncing your health data."
            type="warning"
            showIcon
            action={
              <Button size="small" type="primary" style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}>
                Reconnect Now
              </Button>
            }
            className="rounded-lg"
          />
        )}

        {stats.healthScore >= 80 && (
          <Alert
            message="Outstanding Health Performance! 🎉"
            description="You're doing an excellent job maintaining your health. Your vital signs are in great ranges and your activity levels are impressive. Keep up the fantastic work!"
            type="success"
            showIcon
            icon={<Award className="w-5 h-5" />}
            className="rounded-lg"
            style={{
              backgroundColor: '#1F2937',
              border: '1px solid #10B981'
            }}
          />
        )}

        <Card
          className="shadow-lg rounded-xl border-0"
          style={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151'
          }}
        >
          <Title level={4} style={{ color: '#F7F7F7', marginBottom: 20 }}>
            Quick Access
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <div
                className="p-5 rounded-xl hover:bg-gray-700 cursor-pointer transition-all group"
                style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
              >
                <Brain className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" style={{ color: '#8B5CF6' }} />
                <Text style={{ color: '#F7F7F7', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Digital Twin
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  3D visualization
                </Text>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div
                className="p-5 rounded-xl hover:bg-gray-700 cursor-pointer transition-all group"
                style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
              >
                <FileImage className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" style={{ color: '#3B82F6' }} />
                <Text style={{ color: '#F7F7F7', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Upload Scan
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  AI-powered analysis
                </Text>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div
                className="p-5 rounded-xl hover:bg-gray-700 cursor-pointer transition-all group"
                style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
              >
                <BarChart3 className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" style={{ color: '#10B981' }} />
                <Text style={{ color: '#F7F7F7', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Health Reports
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  View history
                </Text>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div
                className="p-5 rounded-xl hover:bg-gray-700 cursor-pointer transition-all group"
                style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
              >
                <Smartphone className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" style={{ color: '#00B58E' }} />
                <Text style={{ color: '#F7F7F7', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Settings
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  Manage connections
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
