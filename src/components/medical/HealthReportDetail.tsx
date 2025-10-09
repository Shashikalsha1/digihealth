import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Typography, 
  Tag, 
  Button, 
  Spin, 
  Alert,
  Row,
  Col,
  Divider,
  Image
} from 'antd';
import {
  ArrowLeft,
  Calendar,
  User,
  FileImage,
  Activity,
  CheckCircle,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';
import apiService from '../../services/apiService';
import type { MedicalScanResponse } from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface HealthReportDetailProps {
  scanId: number;
  onBack: () => void;
}

const HealthReportDetail: React.FC<HealthReportDetailProps> = ({ scanId, onBack }) => {
  const [scan, setScan] = useState<MedicalScanResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScanDetail();
  }, [scanId]);

  const fetchScanDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedicalScanById(scanId);
      setScan(response.data);
    } catch (error) {
      console.error('Failed to fetch scan detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPrimaryAnalysis = (scan: MedicalScanResponse) => {
    // Get AI analysis from ai_analysis_report
    if (scan.ai_analysis_report?.openai_analysis?.analysis) {
      return scan.ai_analysis_report.openai_analysis.analysis
        .replace(/^\s+/gm, '') // Remove leading whitespace
        .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
        .trim();
    }
    
    return 'No AI analysis available';
  };

  const getDiagnosis = (scan: MedicalScanResponse) => {
    const diagnosis = scan.diagnosis;
    if (!diagnosis) return 'No diagnosis available';

    return diagnosis
      .replace(/\s*-\s*/g, '\n- ')
      .replace(/^\n/, '')
      .trim();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="text-center py-12">
        <Text style={{ color: '#9CA3AF' }}>Scan not found</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          type="text"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBack}
          style={{ color: '#9CA3AF' }}
        >
          Back to Reports
        </Button>
        <div>
          <Title level={3} style={{ color: '#F7F7F7', marginBottom: 4 }}>
            Medical Scan #{scan.id}
          </Title>
          <Text style={{ color: '#9CA3AF' }}>
            Detailed analysis and diagnosis
          </Text>
        </div>
      </div>

      <Row gutter={24}>
        {/* Left Column - Analysis Tabs */}
        <Col xs={24} lg={16}>
          <Card
            className="shadow-lg rounded-xl border-0"
            style={{ 
              backgroundColor: '#1F2937',
              border: '1px solid #374151'
            }}
          >
            {/* Scan Information Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Tag
                    color={
                      scan.scan_type === 'XRAY' ? '#00B58E' :
                      scan.scan_type === 'REPORT' ? '#F59E0B' : '#1D459A'
                    }
                    icon={
                      scan.scan_type === 'XRAY' ? <FileImage className="w-3 h-3" /> :
                      scan.scan_type === 'REPORT' ? <FileText className="w-3 h-3" /> :
                      <Activity className="w-3 h-3" />
                    }
                    className="text-sm px-3 py-1"
                  >
                    {scan.scan_type_display}
                  </Tag>
                  <div className="flex items-center space-x-2">
                    {scan.is_analyzed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Text style={{ color: '#10B981' }}>Analyzed</Text>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <Text style={{ color: '#F59E0B' }}>Pending</Text>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text strong style={{ color: '#F7F7F7' }}>Patient:</Text>
                  <br />
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <Text style={{ color: '#9CA3AF' }}>{scan.patient_name}</Text>
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#F7F7F7' }}>Upload Date:</Text>
                  <br />
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Text style={{ color: '#9CA3AF' }}>{formatDate(scan.upload_date)}</Text>
                  </div>
                </div>
              </div>
            </div>

            <Divider style={{ borderColor: '#374151' }} />

            {/* Analysis Tabs */}
            <Tabs
              defaultActiveKey="primary"
              size="large"
              className="dark-tabs"
              items={[
                {
                  key: 'primary',
                  label: (
                    <span style={{ color: '#F7F7F7', fontWeight: 500 }}>
                      AI Analysis
                    </span>
                  ),
                  children: (
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }}
                    >
                      <div className="mb-4">
                        <Text strong style={{ color: '#00B58E', fontSize: '16px' }}>
                          AI Analysis Report:
                        </Text>
                      </div>
                      <Paragraph style={{ color: '#F7F7F7', marginBottom: 0 }}>
                        <pre style={{ 
                          whiteSpace: 'pre-wrap', 
                          fontFamily: 'inherit',
                          color: '#F7F7F7',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {getPrimaryAnalysis(scan)}
                        </pre>
                      </Paragraph>
                    </div>
                  ),
                },
                {
                  key: 'diagnosis',
                  label: (
                    <span style={{ color: '#F7F7F7', fontWeight: 500 }}>
                      Diagnosis
                    </span>
                  ),
                  children: (
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }}
                    >
                      <div className="mb-4">
                        <Text strong style={{ color: '#EF4444', fontSize: '16px' }}>
                          Medical Diagnosis:
                        </Text>
                      </div>
                      <div
                        className="p-4 rounded-lg mb-4"
                        style={{ backgroundColor: '#1a1a1a', border: '1px solid #EF4444' }}
                      >
                        <pre style={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          color: '#F7F7F7',
                          fontSize: '16px',
                          fontWeight: 500,
                          margin: 0,
                          lineHeight: '1.8'
                        }}>
                          {getDiagnosis(scan)}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <Text strong style={{ color: '#F7F7F7' }}>AI Model Used:</Text>
                        <br />
                        <Text style={{ color: '#9CA3AF' }}>
                          {scan.ai_analysis_report?.openai_analysis?.model_used || 'GPT-4o'}
                        </Text>
                      </div>
                    </div>
                  ),
                },
              ]}
            />

            <Alert
              message="Medical Disclaimer"
              description="This AI analysis is for educational purposes only and should not be used for medical diagnosis. Always consult healthcare professionals for medical concerns."
              type="warning"
              showIcon
              className="mt-6 rounded-lg"
            />
          </Card>
        </Col>

        {/* Right Column - Image or Report File */}
        <Col xs={24} lg={8}>
          <Card
            className="shadow-lg rounded-xl border-0"
            style={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151'
            }}
          >
            <Title level={4} style={{ color: '#F7F7F7', marginBottom: 16 }}>
              {scan.report_file ? 'Medical Report File' : 'Medical Image'}
            </Title>
            <div className="text-center">
              {scan.report_file ? (
                <div
                  className="flex flex-col items-center justify-center p-8"
                  style={{
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    minHeight: '300px'
                  }}
                >
                  <FileText className="w-24 h-24 mb-4" style={{ color: '#F59E0B' }} />
                  <Text style={{ color: '#F7F7F7', fontSize: '16px', marginBottom: 16 }}>
                    PDF Report Available
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => window.open(scan.report_file, '_blank')}
                    style={{
                      backgroundColor: '#00B58E',
                      borderColor: '#00B58E',
                    }}
                  >
                    View Report
                  </Button>
                </div>
              ) : scan.image ? (
                <Image
                  src={scan.image.startsWith('http') ? scan.image : apiService.getImageUrl(scan.image)}
                  alt={`${scan.scan_type_display} Scan`}
                  className="rounded-lg"
                  preview={false}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }}
                  placeholder={
                    <div
                      className="flex items-center justify-center"
                      style={{
                        height: '200px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #404040',
                        borderRadius: '8px'
                      }}
                    >
                      <Spin size="large" />
                    </div>
                  }
                />
              ) : (
                <div
                  className="flex items-center justify-center"
                  style={{
                    height: '300px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                >
                  <Text style={{ color: '#9CA3AF' }}>No file available</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HealthReportDetail;