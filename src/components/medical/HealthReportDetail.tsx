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
  Download,
  Sparkles,
  Brain,
  Stethoscope,
  Eye
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
      {/* Enhanced Header */}
      <div
        className="rounded-2xl p-6 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
          border: '1px solid #374151',
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBack}
          style={{ color: '#9CA3AF', marginBottom: '16px' }}
        >
          Back to Reports
        </Button>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className="p-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(0, 181, 142, 0.1)',
                border: '1px solid rgba(0, 181, 142, 0.3)',
              }}
            >
              <Sparkles className="w-8 h-8" style={{ color: '#00B58E' }} />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Title level={2} style={{ color: '#F7F7F7', marginBottom: 0 }}>
                  Medical Scan #{scan.id}
                </Title>
              </div>
              <Text style={{ color: '#9CA3AF', fontSize: '15px' }}>
                AI-powered detailed analysis and diagnosis
              </Text>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                    {scan.patient_name}
                  </Text>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                    {formatDate(scan.upload_date)}
                  </Text>
                </div>
              </div>
            </div>
          </div>
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
              <div className="flex items-center space-x-3 mb-6">
                <div
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl"
                  style={{
                    backgroundColor:
                      scan.scan_type === 'XRAY' ? 'rgba(0, 181, 142, 0.1)' :
                      scan.scan_type === 'REPORT' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(29, 69, 154, 0.1)',
                    border:
                      scan.scan_type === 'XRAY' ? '1px solid rgba(0, 181, 142, 0.3)' :
                      scan.scan_type === 'REPORT' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(29, 69, 154, 0.3)',
                  }}
                >
                  {scan.scan_type === 'XRAY' ? <FileImage className="w-5 h-5" style={{ color: '#00B58E' }} /> :
                   scan.scan_type === 'REPORT' ? <FileText className="w-5 h-5" style={{ color: '#F59E0B' }} /> :
                   <Activity className="w-5 h-5" style={{ color: '#1D459A' }} />}
                  <Text strong style={{
                    color:
                      scan.scan_type === 'XRAY' ? '#00B58E' :
                      scan.scan_type === 'REPORT' ? '#F59E0B' : '#1D459A',
                    fontSize: '15px'
                  }}>
                    {scan.scan_type_display}
                  </Text>
                </div>
                <div
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl"
                  style={{
                    backgroundColor: scan.is_analyzed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: scan.is_analyzed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  {scan.is_analyzed ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                  ) : (
                    <AlertCircle className="w-5 h-5" style={{ color: '#F59E0B' }} />
                  )}
                  <Text strong style={{ color: scan.is_analyzed ? '#10B981' : '#F59E0B', fontSize: '15px' }}>
                    {scan.is_analyzed ? 'Analyzed' : 'Pending'}
                  </Text>
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
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span style={{ fontWeight: 500 }}>AI Analysis</span>
                    </div>
                  ),
                  children: (
                    <div
                      className="p-6 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                        border: '1px solid #374151',
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-5">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(0, 181, 142, 0.1)',
                            border: '1px solid rgba(0, 181, 142, 0.3)',
                          }}
                        >
                          <Sparkles className="w-5 h-5" style={{ color: '#00B58E' }} />
                        </div>
                        <Text strong style={{ color: '#00B58E', fontSize: '17px' }}>
                          AI Analysis Report
                        </Text>
                      </div>
                      <div
                        className="p-5 rounded-lg"
                        style={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                        }}
                      >
                        <pre style={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          color: '#E5E7EB',
                          fontSize: '14px',
                          lineHeight: '1.8',
                          margin: 0,
                        }}>
                          {getPrimaryAnalysis(scan)}
                        </pre>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'diagnosis',
                  label: (
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4" />
                      <span style={{ fontWeight: 500 }}>Diagnosis</span>
                    </div>
                  ),
                  children: (
                    <div
                      className="p-6 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                        border: '1px solid #374151',
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-5">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          <Stethoscope className="w-5 h-5" style={{ color: '#EF4444' }} />
                        </div>
                        <Text strong style={{ color: '#EF4444', fontSize: '17px' }}>
                          Medical Diagnosis
                        </Text>
                      </div>
                      <div
                        className="p-5 rounded-xl mb-5"
                        style={{
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <pre style={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          color: '#F7F7F7',
                          fontSize: '15px',
                          fontWeight: 500,
                          margin: 0,
                          lineHeight: '1.9'
                        }}>
                          {getDiagnosis(scan)}
                        </pre>
                      </div>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4" style={{ color: '#6B7280' }} />
                          <Text strong style={{ color: '#F7F7F7', fontSize: '14px' }}>AI Model:</Text>
                          <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                            {scan.ai_analysis_report?.openai_analysis?.model_used || 'GPT-4o'}
                          </Text>
                        </div>
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
            className="shadow-lg rounded-2xl border-0"
            style={{
              background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
              border: '1px solid #374151'
            }}
          >
            <div className="flex items-center space-x-2 mb-4">
              {scan.report_file ? (
                <FileText className="w-5 h-5" style={{ color: '#F59E0B' }} />
              ) : (
                <FileImage className="w-5 h-5" style={{ color: '#00B58E' }} />
              )}
              <Title level={4} style={{ color: '#F7F7F7', marginBottom: 0 }}>
                {scan.report_file ? 'Medical Report' : 'Medical Image'}
              </Title>
            </div>
            <div className="text-center">
              {scan.report_file ? (
                <div
                  className="flex flex-col items-center justify-center p-10 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    minHeight: '400px'
                  }}
                >
                  <div
                    className="p-6 rounded-2xl mb-6"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <FileText className="w-20 h-20" style={{ color: '#F59E0B' }} />
                  </div>
                  <Text strong style={{ color: '#F7F7F7', fontSize: '17px', marginBottom: 8 }}>
                    PDF Report Available
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: 24 }}>
                    Click below to view or download
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    icon={<Download className="w-5 h-5" />}
                    onClick={() => window.open(scan.report_file, '_blank')}
                    style={{
                      backgroundColor: '#00B58E',
                      borderColor: '#00B58E',
                      height: '48px',
                      fontSize: '15px',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(0, 181, 142, 0.3)',
                    }}
                  >
                    View Full Report
                  </Button>
                </div>
              ) : scan.image ? (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: '1px solid #374151',
                  }}
                >
                  <Image
                    src={scan.image.startsWith('http') ? scan.image : apiService.getImageUrl(scan.image)}
                    alt={`${scan.scan_type_display} Scan`}
                    className="rounded-xl"
                    preview={{
                      mask: (
                        <div className="flex flex-col items-center space-y-2">
                          <Eye className="w-6 h-6" />
                          <span>View Full Size</span>
                        </div>
                      ),
                    }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      backgroundColor: '#0f0f0f',
                    }}
                    placeholder={
                      <div
                        className="flex items-center justify-center"
                        style={{
                          height: '300px',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #374151',
                          borderRadius: '12px'
                        }}
                      >
                        <Spin size="large" />
                      </div>
                    }
                  />
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center rounded-xl"
                  style={{
                    height: '400px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #374151',
                  }}
                >
                  <AlertCircle className="w-12 h-12 mb-3" style={{ color: '#6B7280' }} />
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