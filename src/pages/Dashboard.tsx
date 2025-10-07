import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Alert, Button, Spin } from 'antd';
import { 
  User, 
  Activity, 
  Heart, 
  Calendar,
  FileImage,
  Smartphone,
  TrendingUp,
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
  Stethoscope
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import DashboardLayout from '../components/layout/DashboardLayout';
import apiService from '../services/apiService';

const { Title, Text } = Typography;

interface DashboardStats {
  healthData: any;
  googleFitStatus: any;
  medicalScans: any[];
  healthScore: number;
  activeDays: number;
  lastCheckup: string;
  pendingReports: number;
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
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch all dashboard data in parallel
      const [healthDataResponse, googleFitResponse, medicalScansResponse] = await Promise.allSettled([
        apiService.syncAndGetLatestHealthData().catch(() => null),
        apiService.getGoogleFitStatus().catch(() => null),
        apiService.getMedicalScans().catch(() => ({ data: [] }))
      ]);

      const healthData = healthDataResponse.status === 'fulfilled' ? healthDataResponse.value?.data : null;
      const googleFitStatus = googleFitResponse.status === 'fulfilled' ? googleFitResponse.value : null;
      const medicalScans = medicalScansResponse.status === 'fulfilled' ? medicalScansResponse.value?.data || [] : [];

      // Calculate health score based on available data
      const healthScore = calculateHealthScore(healthData, googleFitStatus);
      
      // Calculate active days (mock calculation based on steps)
      const activeDays = healthData?.steps ? Math.min(Math.floor(healthData.steps / 1000), 30) : 0;
      
      // Get last checkup from medical scans
      const lastCheckup = medicalScans.length > 0 
        ? formatRelativeTime(medicalScans[0].upload_date)
        : 'Never';
      
      // Count pending reports
      const pendingReports = medicalScans.filter(scan => !scan.is_analyzed).length;

      setStats({
        healthData,
        googleFitStatus,
        medicalScans,
        healthScore,
        activeDays,
        lastCheckup,
        pendingReports
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateHealthScore = (healthData: any, googleFitStatus: any) => {
    let score = 0;
    let maxScore = 0;

    // Google Fit connection (20 points)
    maxScore += 20;
    if (googleFitStatus?.connected && !googleFitStatus?.is_expired) {
      score += 20;
    } else if (googleFitStatus?.connected) {
      score += 10; // Connected but expired
    }

    // Health data availability (60 points total)
    if (healthData) {
      // Heart rate (15 points)
      maxScore += 15;
      if (healthData.heart_rate) {
        if (healthData.heart_rate >= 60 && healthData.heart_rate <= 100) {
          score += 15; // Normal range
        } else {
          score += 8; // Outside normal but data available
        }
      }

      // Blood pressure (15 points)
      maxScore += 15;
      if (healthData.blood_pressure_sys && healthData.blood_pressure_dia) {
        if (healthData.blood_pressure_sys >= 90 && healthData.blood_pressure_sys <= 140) {
          score += 15; // Normal range
        } else {
          score += 8; // Outside normal but data available
        }
      }

      // Temperature (10 points)
      maxScore += 10;
      if (healthData.temperature) {
        if (healthData.temperature >= 36.1 && healthData.temperature <= 37.2) {
          score += 10; // Normal range
        } else {
          score += 5; // Outside normal but data available
        }
      }

      // Oxygen level (10 points)
      maxScore += 10;
      if (healthData.oxygen_level) {
        if (healthData.oxygen_level >= 95) {
          score += 10; // Normal range
        } else {
          score += 5; // Low but data available
        }
      }

      // Steps (10 points)
      maxScore += 10;
      if (healthData.steps) {
        if (healthData.steps >= 8000) {
          score += 10; // Excellent
        } else if (healthData.steps >= 5000) {
          score += 7; // Good
        } else if (healthData.steps >= 2000) {
          score += 4; // Fair
        } else {
          score += 2; // Some activity
        }
      }
    } else {
      maxScore += 60; // Add max points for health data categories
    }

    // Medical scans (20 points)
    maxScore += 20;
    if (stats.medicalScans.length > 0) {
      score += Math.min(stats.medicalScans.length * 5, 20);
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
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    if (score >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getHealthScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} style={{ color: '#F7F7F7', marginBottom: 8 }}>
              Welcome back, {user?.first_name}!
            </Title>
            <Text style={{ color: '#9CA3AF' }}>
              Here's your comprehensive health dashboard overview
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
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Health Score Card */}
        <Card
          className="shadow-lg rounded-xl border-0"
          style={{ 
            backgroundColor: '#1F2937',
            border: '1px solid #374151'
          }}
        >
          <Row gutter={24} align="middle">
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="relative inline-block">
                  <Progress
                    type="circle"
                    percent={stats.healthScore}
                    size={120}
                    strokeColor={getHealthScoreColor(stats.healthScore)}
                    trailColor="#374151"
                    strokeWidth={8}
                    format={(percent) => (
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F7F7F7' }}>
                          {percent}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                          Health Score
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <Text strong style={{ color: getHealthScoreColor(stats.healthScore), fontSize: '16px' }}>
                    {getHealthScoreStatus(stats.healthScore)}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={16}>
              <div className="space-y-4">
                <div>
                  <Title level={4} style={{ color: '#F7F7F7', marginBottom: 8 }}>
                    Health Overview
                  </Title>
                  <Text style={{ color: '#9CA3AF' }}>
                    Your health score is calculated based on device connectivity, vital signs, activity levels, and medical checkups.
                  </Text>
                </div>
                
                <Row gutter={16}>
                  <Col xs={12} sm={6}>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                      <Smartphone className="w-6 h-6 mx-auto mb-2" style={{ color: stats.googleFitStatus?.connected ? '#10B981' : '#6B7280' }} />
                      <Text style={{ color: '#F7F7F7', fontSize: '12px' }}>
                        {stats.googleFitStatus?.connected ? 'Connected' : 'Disconnected'}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                      <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: stats.healthData ? '#EF4444' : '#6B7280' }} />
                      <Text style={{ color: '#F7F7F7', fontSize: '12px' }}>
                        {stats.healthData ? 'Vitals Active' : 'No Vitals'}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                      <Activity className="w-6 h-6 mx-auto mb-2" style={{ color: stats.healthData?.steps ? '#1D459A' : '#6B7280' }} />
                      <Text style={{ color: '#F7F7F7', fontSize: '12px' }}>
                        {stats.healthData?.steps ? 'Active' : 'Inactive'}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                      <FileImage className="w-6 h-6 mx-auto mb-2" style={{ color: stats.medicalScans.length > 0 ? '#00B58E' : '#6B7280' }} />
                      <Text style={{ color: '#F7F7F7', fontSize: '12px' }}>
                        {stats.medicalScans.length > 0 ? 'Scans Available' : 'No Scans'}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Key Metrics */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151'
              }}
            >
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Active Days</span>}
                value={stats.activeDays}
                suffix="days"
                valueStyle={{ color: '#1D459A' }}
                prefix={<Activity className="w-4 h-4" style={{ color: '#1D459A' }} />}
              />
              <div className="mt-2">
                <Progress 
                  percent={(stats.activeDays / 30) * 100} 
                  showInfo={false} 
                  strokeColor="#1D459A"
                  trailColor="#374151"
                  size="small"
                />
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  This month
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151'
              }}
            >
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Last Checkup</span>}
                value={stats.lastCheckup}
                valueStyle={{ color: '#F59E0B' }}
                prefix={<Calendar className="w-4 h-4" style={{ color: '#F59E0B' }} />}
              />
              <div className="mt-2">
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {stats.medicalScans.length} total scans
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151'
              }}
            >
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Pending Reports</span>}
                value={stats.pendingReports}
                suffix="reports"
                valueStyle={{ color: stats.pendingReports > 0 ? '#EF4444' : '#10B981' }}
                prefix={stats.pendingReports > 0 ? 
                  <AlertTriangle className="w-4 h-4" style={{ color: '#EF4444' }} /> :
                  <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                }
              />
              <div className="mt-2">
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {stats.pendingReports === 0 ? 'All up to date' : 'Awaiting analysis'}
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151'
              }}
            >
              <Statistic
                title={<span style={{ color: '#9CA3AF' }}>Data Sources</span>}
                value={stats.googleFitStatus?.scopes?.length || 0}
                suffix="connected"
                valueStyle={{ color: '#00B58E' }}
                prefix={<Zap className="w-4 h-4" style={{ color: '#00B58E' }} />}
              />
              <div className="mt-2">
                <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  Google Fit integration
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Current Health Status */}
        {stats.healthData && (
          <Card
            className="shadow-lg rounded-xl border-0"
            style={{ 
              backgroundColor: '#1F2937',
              border: '1px solid #374151'
            }}
          >
            <Title level={4} style={{ color: '#F7F7F7', marginBottom: 16 }}>
              Current Health Status
            </Title>
            
            <Row gutter={[16, 16]}>
              {stats.healthData.heart_rate && (
                <Col xs={24} sm={12} lg={8}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <Text strong style={{ color: '#F7F7F7' }}>Heart Rate</Text>
                      </div>
                      <Text style={{ color: '#EF4444', fontSize: '18px', fontWeight: 'bold' }}>
                        {stats.healthData.heart_rate} bpm
                      </Text>
                    </div>
                    <Progress 
                      percent={Math.min((stats.healthData.heart_rate / 120) * 100, 100)}
                      showInfo={false}
                      strokeColor="#EF4444"
                      trailColor="#374151"
                      size="small"
                    />
                  </div>
                </Col>
              )}
              
              {stats.healthData.steps && (
                <Col xs={24} sm={12} lg={8}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <Text strong style={{ color: '#F7F7F7' }}>Steps Today</Text>
                      </div>
                      <Text style={{ color: '#1D459A', fontSize: '18px', fontWeight: 'bold' }}>
                        {stats.healthData.steps.toLocaleString()}
                      </Text>
                    </div>
                    <Progress 
                      percent={Math.min((stats.healthData.steps / 10000) * 100, 100)}
                      showInfo={false}
                      strokeColor="#1D459A"
                      trailColor="#374151"
                      size="small"
                    />
                  </div>
                </Col>
              )}
              
              {stats.healthData.temperature && (
                <Col xs={24} sm={12} lg={8}>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-5 h-5 text-yellow-500" />
                        <Text strong style={{ color: '#F7F7F7' }}>Temperature</Text>
                      </div>
                      <Text style={{ color: '#F59E0B', fontSize: '18px', fontWeight: 'bold' }}>
                        {stats.healthData.temperature}°C
                      </Text>
                    </div>
                    <Progress 
                      percent={((stats.healthData.temperature - 35) / 5) * 100}
                      showInfo={false}
                      strokeColor="#F59E0B"
                      trailColor="#374151"
                      size="small"
                    />
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* System Status Alerts */}
        <div className="space-y-4">
          {!stats.googleFitStatus?.connected && (
            <Alert
              message="Google Fit Not Connected"
              description="Connect your Google Fit account to start tracking your health data automatically."
              type="warning"
              showIcon
              action={
                <Button size="small" type="primary" style={{ backgroundColor: '#00B58E', borderColor: '#00B58E' }}>
                  Connect Now
                </Button>
              }
              className="rounded-lg"
            />
          )}
          
          {stats.googleFitStatus?.connected && stats.googleFitStatus?.is_expired && (
            <Alert
              message="Google Fit Token Expired"
              description="Your Google Fit connection has expired. Please reconnect to continue syncing data."
              type="error"
              showIcon
              action={
                <Button size="small" type="primary" danger>
                  Reconnect
                </Button>
              }
              className="rounded-lg"
            />
          )}
          
          {stats.pendingReports > 0 && (
            <Alert
              message={`${stats.pendingReports} Medical Reports Pending Analysis`}
              description="Some of your uploaded medical scans are still being analyzed by our AI system."
              type="info"
              showIcon
              className="rounded-lg"
            />
          )}
          
          {stats.healthScore >= 80 && (
            <Alert
              message="Excellent Health Status!"
              description="Your health metrics are looking great. Keep up the good work!"
              type="success"
              showIcon
              icon={<Award className="w-4 h-4" />}
              className="rounded-lg"
            />
          )}
        </div>

        {/* Quick Actions */}
        <Card
          className="shadow-lg rounded-xl border-0"
          style={{ 
            backgroundColor: '#1F2937',
            border: '1px solid #374151'
          }}
        >
          <Title level={4} style={{ color: '#F7F7F7', marginBottom: 16 }}>
            Quick Actions
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors group">
              <Brain className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <Text style={{ color: '#F7F7F7', fontWeight: 500, display: 'block' }}>
                View Digital Twin
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                3D health visualization
              </Text>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors group">
              <FileImage className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <Text style={{ color: '#F7F7F7', fontWeight: 500, display: 'block' }}>
                Upload Medical Scan
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                AI-powered analysis
              </Text>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors group">
              <BarChart3 className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <Text style={{ color: '#F7F7F7', fontWeight: 500, display: 'block' }}>
                View Health Reports
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                Detailed analysis history
              </Text>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors group">
              <Smartphone className="w-8 h-8 text-teal-500 mb-3 group-hover:scale-110 transition-transform" />
              <Text style={{ color: '#F7F7F7', fontWeight: 500, display: 'block' }}>
                Manage Connections
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                Device & app settings
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;