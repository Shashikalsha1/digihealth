import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Alert, Spin, Tabs, Select, Radio, Modal, Table } from 'antd';
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
  const [bpType, setBpType] = useState<'sys' | 'dia'>('sys');
  const [activeTabKey, setActiveTabKey] = useState<string>('heart_rate');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);

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

      const detailedReadings = [];
      const readingsCount = Math.floor(Math.random() * 6) + 5;

      for (let j = 0; j < readingsCount; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);

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
        detailedReadings.push({
          time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(value),
          timestamp: timestamp
        });
      }

      detailedReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const avgValue = Math.round(detailedReadings.reduce((sum, r) => sum + r.value, 0) / detailedReadings.length);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: avgValue,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        detailedReadings: detailedReadings
      });
    }
    return data;
  };

  const generateBloodPressureData = (days: number, type: 'sys' | 'dia') => {
    const data = [];
    const today = new Date();
    const zones = type === 'sys'
      ? [
          { min: 90, max: 110, weight: 0.15 },
          { min: 110, max: 130, weight: 0.5 },
          { min: 130, max: 145, weight: 0.25 },
          { min: 145, max: 165, weight: 0.1 }
        ]
      : [
          { min: 60, max: 70, weight: 0.15 },
          { min: 70, max: 85, weight: 0.5 },
          { min: 85, max: 95, weight: 0.25 },
          { min: 95, max: 105, weight: 0.1 }
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

      const detailedReadings = [];
      const readingsCount = Math.floor(Math.random() * 6) + 5;

      for (let j = 0; j < readingsCount; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);

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
        detailedReadings.push({
          time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(value),
          timestamp: timestamp
        });
      }

      detailedReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const avgValue = Math.round(detailedReadings.reduce((sum, r) => sum + r.value, 0) / detailedReadings.length);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: avgValue,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        detailedReadings: detailedReadings
      });
    }
    return data;
  };

  const generateTemperatureData = (days: number) => {
    const data = [];
    const today = new Date();
    const zones = [
      { min: 36.0, max: 36.5, weight: 0.2 },
      { min: 36.5, max: 37.2, weight: 0.6 },
      { min: 37.2, max: 37.8, weight: 0.15 },
      { min: 37.8, max: 38.5, weight: 0.05 }
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

      const detailedReadings = [];
      const readingsCount = Math.floor(Math.random() * 6) + 5;

      for (let j = 0; j < readingsCount; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);

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
        detailedReadings.push({
          time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: parseFloat(value.toFixed(1)),
          timestamp: timestamp
        });
      }

      detailedReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const avgValue = parseFloat((detailedReadings.reduce((sum, r) => sum + r.value, 0) / detailedReadings.length).toFixed(1));

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: avgValue,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        detailedReadings: detailedReadings
      });
    }
    return data;
  };

  const generateOxygenData = (days: number) => {
    const data = [];
    const today = new Date();
    const zones = [
      { min: 92, max: 95, weight: 0.1 },
      { min: 95, max: 98, weight: 0.5 },
      { min: 98, max: 100, weight: 0.4 }
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

      const detailedReadings = [];
      const readingsCount = Math.floor(Math.random() * 6) + 5;

      for (let j = 0; j < readingsCount; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);

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
        detailedReadings.push({
          time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(value),
          timestamp: timestamp
        });
      }

      detailedReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const avgValue = Math.round(detailedReadings.reduce((sum, r) => sum + r.value, 0) / detailedReadings.length);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: avgValue,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        detailedReadings: detailedReadings
      });
    }
    return data;
  };

  const generateStepsData = (days: number) => {
    const data = [];
    const today = new Date();
    const zones = [
      { min: 2000, max: 5000, weight: 0.2 },
      { min: 5000, max: 8000, weight: 0.4 },
      { min: 8000, max: 12000, weight: 0.3 },
      { min: 12000, max: 18000, weight: 0.1 }
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

      const detailedReadings = [];
      const readingsCount = Math.floor(Math.random() * 6) + 5;

      for (let j = 0; j < readingsCount; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);

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
        detailedReadings.push({
          time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(value),
          timestamp: timestamp
        });
      }

      detailedReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const avgValue = Math.round(detailedReadings.reduce((sum, r) => sum + r.value, 0) / detailedReadings.length);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: avgValue,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        detailedReadings: detailedReadings
      });
    }
    return data;
  };

  const generateSleepData = (days: number) => {
    const data = [];
    const today = new Date();
    const zones = [
      { min: 4, max: 6, weight: 0.15 },
      { min: 6, max: 8, weight: 0.5 },
      { min: 8, max: 9, weight: 0.25 },
      { min: 9, max: 11, weight: 0.1 }
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

      const detailedReadings = [];
      const readingsCount = Math.floor(Math.random() * 6) + 5;

      for (let j = 0; j < readingsCount; j++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(date);
        timestamp.setHours(hour, minute, 0, 0);

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
        detailedReadings.push({
          time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: parseFloat(value.toFixed(1)),
          timestamp: timestamp
        });
      }

      detailedReadings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const avgValue = parseFloat((detailedReadings.reduce((sum, r) => sum + r.value, 0) / detailedReadings.length).toFixed(1));

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: avgValue,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        detailedReadings: detailedReadings
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
        return generateBloodPressureData(days, 'sys');
      case 'blood_pressure_dia':
        return generateBloodPressureData(days, 'dia');
      case 'temperature':
        return generateTemperatureData(days);
      case 'oxygen_level':
        return generateOxygenData(days);
      case 'steps':
        return generateStepsData(days);
      case 'sleep_hours':
        return generateSleepData(days);
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
      onClick: (event: any, elements: any) => {
        if (elements && elements.length > 0) {
          const dataIndex = elements[0].index;
          setSelectedDayData({
            ...data[dataIndex],
            metricName: 'Heart Rate',
            unit: unit
          });
          setDetailModalVisible(true);
        }
      },
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
                `Status: ${zone.zone}`,
                'Click to view detailed readings'
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
      onClick: (event: any, elements: any) => {
        if (elements && elements.length > 0) {
          const dataIndex = elements[0].index;
          setSelectedDayData({
            ...data[dataIndex],
            metricName: 'Heart Rate',
            unit: unit
          });
          setDetailModalVisible(true);
        }
      },
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
              return [
                `${value} ${unit} (${zone.label})`,
                'Click to view detailed readings'
              ];
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

  interface GenericChartProps {
    data: any[];
    unit: string;
    title: string;
    color: string;
    zones: Array<{ label: string; range: string; color: string; min: number; max: number }>;
    showZoneDistribution?: boolean;
  }

  const GenericChart: React.FC<GenericChartProps> = ({ data, unit, title, color, zones, showZoneDistribution = true }) => {
    const [chartType, setChartType] = React.useState<'line' | 'bar'>('line');
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;

    const getZoneForValue = (value: number) => {
      for (const zone of zones) {
        if (value >= zone.min && value < zone.max) {
          return zone;
        }
      }
      return zones[zones.length - 1];
    };

    const zoneDistribution = data.reduce((acc, point) => {
      const zone = getZoneForValue(point.value);
      acc[zone.label] = (acc[zone.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lineChartData = {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: title,
          data: data.map(d => d.value),
          borderColor: color,
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, color + '66');
            gradient.addColorStop(1, color + '00');
            return gradient;
          },
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: data.map(d => getZoneForValue(d.value).color),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: data.map(d => getZoneForValue(d.value).color),
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
        }
      ]
    };

    const lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event: any, elements: any) => {
        if (elements && elements.length > 0) {
          const dataIndex = elements[0].index;
          setSelectedDayData({
            ...data[dataIndex],
            metricName: title,
            unit: unit
          });
          setDetailModalVisible(true);
        }
      },
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
              const zone = getZoneForValue(value);
              return [
                `${title}: ${value} ${unit}`,
                `Zone: ${zone.label}`,
                'Click to view detailed readings'
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
          label: title,
          data: data.map(d => d.value),
          backgroundColor: data.map(d => {
            const zone = getZoneForValue(d.value);
            return zone.color + '99';
          }),
          borderColor: data.map(d => getZoneForValue(d.value).color),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    };

    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event: any, elements: any) => {
        if (elements && elements.length > 0) {
          const dataIndex = elements[0].index;
          setSelectedDayData({
            ...data[dataIndex],
            metricName: title,
            unit: unit
          });
          setDetailModalVisible(true);
        }
      },
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
              const zone = getZoneForValue(value);
              return [
                `${value} ${unit} (${zone.label})`,
                'Click to view detailed readings'
              ];
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
      labels: zones.map(z => z.label),
      datasets: [
        {
          data: zones.map(z => zoneDistribution[z.label] || 0),
          backgroundColor: zones.map(z => z.color),
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

    const formatValue = (val: number) => {
      if (Number.isInteger(val)) return val.toFixed(0);
      return val.toFixed(1);
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
                <Text strong style={{ color: color, fontSize: '28px' }}>
                  {formatValue(avgValue)}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>{unit}</Text>
              </div>
              <div className="mt-1">
                <Heart className="w-5 h-5 mx-auto" style={{ color: color }} />
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
                <Text strong style={{ color: getZoneForValue(minValue).color, fontSize: '28px' }}>
                  {formatValue(minValue)}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>{unit}</Text>
              </div>
              <div className="mt-1">
                <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                  {getZoneForValue(minValue).label}
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
                <Text strong style={{ color: getZoneForValue(maxValue).color, fontSize: '28px' }}>
                  {formatValue(maxValue)}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>{unit}</Text>
              </div>
              <div className="mt-1">
                <Text style={{ color: '#9CA3AF', fontSize: '11px' }}>
                  {getZoneForValue(maxValue).label}
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
                Zones
              </Text>
              <div className="space-y-1">
                {zones.map((zone, index) => (
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
          <Col xs={24} lg={showZoneDistribution ? 16 : 24}>
            <Card
              className="shadow-lg rounded-xl border-0"
              style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            >
              <div className="flex items-center justify-between mb-4">
                <Text strong style={{ color: '#F7F7F7', fontSize: '18px' }}>
                  {title} Trend
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

          {showZoneDistribution && (
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
          )}
        </Row>
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
          <div className="space-y-4 mt-6">
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

  const HistoryView = () => {
    const menuItems = [
      {
        key: 'heart_rate',
        icon: <Heart className="w-5 h-5" />,
        label: 'Heart Rate'
      },
      {
        key: 'blood_pressure',
        icon: <TrendingUp className="w-5 h-5" />,
        label: 'Blood Pressure'
      },
      {
        key: 'temperature',
        icon: <Thermometer className="w-5 h-5" />,
        label: 'Temperature'
      },
      {
        key: 'oxygen',
        icon: <Droplets className="w-5 h-5" />,
        label: 'Oxygen Level'
      },
      {
        key: 'steps',
        icon: <Footprints className="w-5 h-5" />,
        label: 'Steps'
      },
      {
        key: 'sleep',
        icon: <Moon className="w-5 h-5" />,
        label: 'Sleep'
      }
    ];

    const renderContent = () => {
      switch (activeTabKey) {
        case 'heart_rate':
          return (
            <HeartRateChart
              data={getHistoricalData('heart_rate')}
              unit="bpm"
            />
          );
        case 'blood_pressure':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <Radio.Group
                  value={bpType}
                  onChange={(e) => setBpType(e.target.value)}
                  buttonStyle="solid"
                  size="large"
                >
                  <Radio.Button
                    value="sys"
                    style={{
                      backgroundColor: bpType === 'sys' ? '#F59E0B' : '#374151',
                      borderColor: bpType === 'sys' ? '#F59E0B' : '#4B5563',
                      color: '#F7F7F7'
                    }}
                  >
                    Systolic
                  </Radio.Button>
                  <Radio.Button
                    value="dia"
                    style={{
                      backgroundColor: bpType === 'dia' ? '#10B981' : '#374151',
                      borderColor: bpType === 'dia' ? '#10B981' : '#4B5563',
                      color: '#F7F7F7'
                    }}
                  >
                    Diastolic
                  </Radio.Button>
                </Radio.Group>
              </div>
              <GenericChart
                data={getHistoricalData(bpType === 'sys' ? 'blood_pressure_sys' : 'blood_pressure_dia')}
                unit="mmHg"
                title={bpType === 'sys' ? 'Blood Pressure (Systolic)' : 'Blood Pressure (Diastolic)'}
                color={bpType === 'sys' ? '#F59E0B' : '#10B981'}
                zones={
                  bpType === 'sys'
                    ? [
                        { label: 'Low', range: '<110', color: '#3B82F6', min: 0, max: 110 },
                        { label: 'Normal', range: '110-130', color: '#10B981', min: 110, max: 130 },
                        { label: 'Elevated', range: '130-145', color: '#F59E0B', min: 130, max: 145 },
                        { label: 'High', range: '>145', color: '#EF4444', min: 145, max: 200 }
                      ]
                    : [
                        { label: 'Low', range: '<70', color: '#3B82F6', min: 0, max: 70 },
                        { label: 'Normal', range: '70-85', color: '#10B981', min: 70, max: 85 },
                        { label: 'Elevated', range: '85-95', color: '#F59E0B', min: 85, max: 95 },
                        { label: 'High', range: '>95', color: '#EF4444', min: 95, max: 130 }
                      ]
                }
                showZoneDistribution={true}
              />
            </div>
          );
        case 'temperature':
          return (
            <GenericChart
              data={getHistoricalData('temperature')}
              unit="°C"
              title="Body Temperature"
              color="#F59E0B"
              zones={[
                { label: 'Low', range: '<36.5', color: '#3B82F6', min: 35, max: 36.5 },
                { label: 'Normal', range: '36.5-37.2', color: '#10B981', min: 36.5, max: 37.2 },
                { label: 'Elevated', range: '37.2-37.8', color: '#F59E0B', min: 37.2, max: 37.8 },
                { label: 'Fever', range: '>37.8', color: '#EF4444', min: 37.8, max: 40 }
              ]}
              showZoneDistribution={true}
            />
          );
        case 'oxygen':
          return (
            <GenericChart
              data={getHistoricalData('oxygen_level')}
              unit="%"
              title="Blood Oxygen Level"
              color="#10B981"
              zones={[
                { label: 'Low', range: '<95', color: '#EF4444', min: 85, max: 95 },
                { label: 'Normal', range: '95-98', color: '#10B981', min: 95, max: 98 },
                { label: 'Optimal', range: '98-100', color: '#00B58E', min: 98, max: 100 }
              ]}
              showZoneDistribution={true}
            />
          );
        case 'steps':
          return (
            <GenericChart
              data={getHistoricalData('steps')}
              unit="steps"
              title="Daily Steps"
              color="#1D459A"
              zones={[
                { label: 'Sedentary', range: '<5000', color: '#EF4444', min: 0, max: 5000 },
                { label: 'Low Active', range: '5000-8000', color: '#F59E0B', min: 5000, max: 8000 },
                { label: 'Active', range: '8000-12000', color: '#10B981', min: 8000, max: 12000 },
                { label: 'Highly Active', range: '>12000', color: '#00B58E', min: 12000, max: 25000 }
              ]}
              showZoneDistribution={true}
            />
          );
        case 'sleep':
          return (
            <GenericChart
              data={getHistoricalData('sleep_hours')}
              unit="hours"
              title="Sleep Duration"
              color="#8B5CF6"
              zones={[
                { label: 'Insufficient', range: '<6', color: '#EF4444', min: 0, max: 6 },
                { label: 'Adequate', range: '6-8', color: '#10B981', min: 6, max: 8 },
                { label: 'Optimal', range: '8-9', color: '#00B58E', min: 8, max: 9 },
                { label: 'Excessive', range: '>9', color: '#F59E0B', min: 9, max: 12 }
              ]}
              showZoneDistribution={true}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex" style={{ minHeight: '600px', gap: '24px' }}>
        <Card
          className="shadow-lg rounded-xl border-0"
          style={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            width: '280px',
            flexShrink: 0
          }}
        >
          <div className="mb-4">
            <Title level={5} style={{ color: '#F7F7F7', marginBottom: 4 }}>
              Metrics
            </Title>
            <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
              Select a metric to view
            </Text>
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <div
                key={item.key}
                onClick={() => setActiveTabKey(item.key)}
                className="cursor-pointer transition-all duration-200"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: activeTabKey === item.key ? '#00B58E' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: activeTabKey === item.key ? '1px solid #00B58E' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTabKey !== item.key) {
                    e.currentTarget.style.backgroundColor = '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTabKey !== item.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ color: activeTabKey === item.key ? '#FFFFFF' : '#9CA3AF' }}>
                  {item.icon}
                </div>
                <Text
                  style={{
                    color: activeTabKey === item.key ? '#FFFFFF' : '#F7F7F7',
                    fontWeight: activeTabKey === item.key ? 600 : 400,
                    fontSize: '14px'
                  }}
                >
                  {item.label}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className="shadow-lg rounded-xl border-0"
          style={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            flex: 1
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <Title level={4} style={{ color: '#F7F7F7', marginBottom: 0 }}>
              {menuItems.find(item => item.key === activeTabKey)?.label}
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

          <div>
            {renderContent()}
          </div>
        </Card>
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

      <Modal
        title={
          <div style={{ color: '#F7F7F7' }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              {selectedDayData?.metricName} - Detailed Readings
            </div>
            <div style={{ fontSize: '14px', fontWeight: 400, color: '#9CA3AF', marginTop: '4px' }}>
              {selectedDayData?.fullDate}
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModalVisible(false)}
            style={{
              backgroundColor: '#00B58E',
              borderColor: '#00B58E',
              color: '#FFFFFF'
            }}
          >
            Close
          </Button>
        ]}
        width={700}
        styles={{
          body: {
            backgroundColor: '#111827',
            maxHeight: '60vh',
            overflowY: 'auto'
          },
          header: {
            backgroundColor: '#1F2937',
            borderBottom: '1px solid #374151'
          },
          footer: {
            backgroundColor: '#1F2937',
            borderTop: '1px solid #374151'
          },
          content: {
            backgroundColor: '#111827'
          }
        }}
      >
        {selectedDayData?.detailedReadings && (
          <div>
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#1F2937',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-around'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Total Readings</div>
                <div style={{ color: '#F7F7F7', fontSize: '20px', fontWeight: 600 }}>
                  {selectedDayData.detailedReadings.length}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Average</div>
                <div style={{ color: '#F7F7F7', fontSize: '20px', fontWeight: 600 }}>
                  {selectedDayData.value} {selectedDayData.unit}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Min</div>
                <div style={{ color: '#F7F7F7', fontSize: '20px', fontWeight: 600 }}>
                  {Math.min(...selectedDayData.detailedReadings.map((r: any) => r.value))} {selectedDayData.unit}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Max</div>
                <div style={{ color: '#F7F7F7', fontSize: '20px', fontWeight: 600 }}>
                  {Math.max(...selectedDayData.detailedReadings.map((r: any) => r.value))} {selectedDayData.unit}
                </div>
              </div>
            </div>

            <Table
              dataSource={selectedDayData.detailedReadings.map((reading: any, index: number) => ({
                key: index,
                time: reading.time,
                value: reading.value
              }))}
              columns={[
                {
                  title: 'Time',
                  dataIndex: 'time',
                  key: 'time',
                  width: '40%',
                  render: (text: string) => (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#F7F7F7',
                      fontSize: '14px'
                    }}>
                      <Clock className="w-4 h-4 mr-2" style={{ color: '#9CA3AF' }} />
                      {text}
                    </div>
                  )
                },
                {
                  title: selectedDayData.metricName,
                  dataIndex: 'value',
                  key: 'value',
                  width: '30%',
                  render: (value: number) => (
                    <div style={{
                      color: '#F7F7F7',
                      fontSize: '16px',
                      fontWeight: 500
                    }}>
                      {value} {selectedDayData.unit}
                    </div>
                  )
                },
                {
                  title: 'Status',
                  key: 'status',
                  width: '30%',
                  render: (_: any, record: any) => {
                    const value = record.value;
                    let status = { text: 'Normal', color: '#10B981' };

                    if (selectedDayData.metricName === 'Heart Rate') {
                      if (value < 60) status = { text: 'Low', color: '#3B82F6' };
                      else if (value >= 60 && value < 100) status = { text: 'Normal', color: '#10B981' };
                      else if (value >= 100 && value < 140) status = { text: 'Elevated', color: '#F59E0B' };
                      else status = { text: 'High', color: '#EF4444' };
                    } else if (selectedDayData.metricName === 'Blood Pressure (Systolic)') {
                      if (value < 110) status = { text: 'Low', color: '#3B82F6' };
                      else if (value >= 110 && value < 130) status = { text: 'Normal', color: '#10B981' };
                      else if (value >= 130 && value < 145) status = { text: 'Elevated', color: '#F59E0B' };
                      else status = { text: 'High', color: '#EF4444' };
                    } else if (selectedDayData.metricName === 'Blood Pressure (Diastolic)') {
                      if (value < 70) status = { text: 'Low', color: '#3B82F6' };
                      else if (value >= 70 && value < 85) status = { text: 'Normal', color: '#10B981' };
                      else if (value >= 85 && value < 95) status = { text: 'Elevated', color: '#F59E0B' };
                      else status = { text: 'High', color: '#EF4444' };
                    } else if (selectedDayData.metricName === 'Body Temperature') {
                      if (value < 36.5) status = { text: 'Low', color: '#3B82F6' };
                      else if (value >= 36.5 && value < 37.2) status = { text: 'Normal', color: '#10B981' };
                      else if (value >= 37.2 && value < 37.8) status = { text: 'Elevated', color: '#F59E0B' };
                      else status = { text: 'Fever', color: '#EF4444' };
                    } else if (selectedDayData.metricName === 'Blood Oxygen Level') {
                      if (value < 95) status = { text: 'Low', color: '#EF4444' };
                      else if (value >= 95 && value < 98) status = { text: 'Normal', color: '#10B981' };
                      else status = { text: 'Optimal', color: '#00B58E' };
                    } else if (selectedDayData.metricName === 'Daily Steps') {
                      if (value < 5000) status = { text: 'Sedentary', color: '#EF4444' };
                      else if (value >= 5000 && value < 8000) status = { text: 'Low Active', color: '#F59E0B' };
                      else if (value >= 8000 && value < 12000) status = { text: 'Active', color: '#10B981' };
                      else status = { text: 'Highly Active', color: '#00B58E' };
                    } else if (selectedDayData.metricName === 'Sleep Duration') {
                      if (value < 6) status = { text: 'Insufficient', color: '#EF4444' };
                      else if (value >= 6 && value < 8) status = { text: 'Adequate', color: '#10B981' };
                      else if (value >= 8 && value < 9) status = { text: 'Optimal', color: '#00B58E' };
                      else status = { text: 'Excessive', color: '#F59E0B' };
                    }

                    return (
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: status.color + '20',
                        color: status.color,
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-block'
                      }}>
                        {status.text}
                      </div>
                    );
                  }
                }
              ]}
              pagination={false}
              style={{
                backgroundColor: '#1F2937'
              }}
              className="detailed-readings-table"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default YourTwinPage;