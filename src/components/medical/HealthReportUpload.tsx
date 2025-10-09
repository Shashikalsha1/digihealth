import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Select, 
  Upload, 
  Button, 
  Typography, 
  message, 
  Spin,
  Alert,
  Divider,
  Tag
} from 'antd';
import {
  Upload as UploadIcon,
  FileImage,
  Activity,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import type { UploadProps } from 'antd';
import apiService from '../../services/apiService';
import FormError from '../error/FormError';
import type { ApiResponse, MedicalScanResponse } from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const HealthReportUpload: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ApiResponse<MedicalScanResponse> | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [fileList, setFileList] = useState<any[]>([]);

  const scanTypes = [
    { value: 'XRAY', label: 'X-Ray', icon: <FileImage className="w-4 h-4" /> },
    { value: 'ECG', label: 'ECG', icon: <Activity className="w-4 h-4" /> },
    { value: 'REPORT', label: 'Medical Report', icon: <FileText className="w-4 h-4" /> },
  ];

  const getUploadProps = (scanType: string): UploadProps => {
    const isReport = scanType === 'REPORT';

    return {
      name: isReport ? 'report_file' : 'image',
      multiple: false,
      accept: isReport ? '.pdf,.doc,.docx' : '.jpg,.jpeg,.png,.gif,.bmp,.tiff',
      beforeUpload: (file) => {
        if (isReport) {
          const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
          const isDoc = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          if (!isPDF && !isDoc) {
            message.error('You can only upload PDF or Word documents!');
            return false;
          }
          const isLt20M = file.size / 1024 / 1024 < 20;
          if (!isLt20M) {
            message.error('File must be smaller than 20MB!');
            return false;
          }
        } else {
          const isImage = file.type.startsWith('image/');
          if (!isImage) {
            message.error('You can only upload image files!');
            return false;
          }
          const isLt10M = file.size / 1024 / 1024 < 10;
          if (!isLt10M) {
            message.error('Image must be smaller than 10MB!');
            return false;
          }
        }
        return false;
      },
      onChange: (info) => {
        setFileList(info.fileList);
      },
      onRemove: () => {
        setFileList([]);
      },
    };
  };

  const onFinish = async (values: { scan_type: string }) => {
    if (fileList.length === 0) {
      setFormError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setFormError('');
      setUploadResult(null);

      const formData = new FormData();
      formData.append('scan_type', values.scan_type);

      const isReport = values.scan_type === 'REPORT';
      const fieldName = isReport ? 'report_file' : 'image';
      formData.append(fieldName, fileList[0].originFileObj);

      const response = await apiService.uploadMedicalScan(formData);
      setUploadResult(response);

      message.success(isReport ? 'Medical report uploaded and analyzed successfully!' : 'Medical scan uploaded and analyzed successfully!');
      form.resetFields();
      setFileList([]);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Upload failed. Please try again.';

      setFormError(errorMessage);
      message.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseAnalysis = (diagnosis: string) => {
    if (!diagnosis) return 'No analysis available';

    // Clean up the diagnosis text by removing comparison headers and notes
    let cleanedDiagnosis = diagnosis
      .replace('=== AI X-RAY ANALYSIS COMPARISON ===', '')
      .replace('=== END COMPARISON ===', '')
      .replace(/\*\*Note:\*\* Compare both analyses above to determine which provides better insights for this specific x-ray\./, '')
      .replace(/🤖 \*\*OpenAI GPT-4o Analysis:\*\*/, '**AI Analysis Report:**')
      .trim();

    // Remove excessive whitespace and normalize formatting
    cleanedDiagnosis = cleanedDiagnosis
      .replace(/\n\s+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleanedDiagnosis) {
      return cleanedDiagnosis;
    }
    
    return diagnosis;
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card
        className="shadow-lg rounded-xl border-0"
        style={{ 
          backgroundColor: '#1F2937',
          border: '1px solid #374151'
        }}
      >
        <div className="mb-6">
          <Title level={3} style={{ color: '#F7F7F7', marginBottom: 8 }}>
            Upload Medical Scan or Report
          </Title>
          <Text style={{ color: '#9CA3AF' }}>
            Upload your X-Ray, ECG scan, or medical report (PDF) for AI-powered analysis
          </Text>
        </div>

        <FormError message={formError} />

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="scan_type"
            label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Scan Type</span>}
            rules={[{ required: true, message: 'Please select a scan type' }]}
          >
            <Select
              placeholder="Select scan type"
              className="rounded-lg"
              style={{ height: 44 }}
            >
              {scanTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    {type.icon}
                    <span>{type.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.scan_type !== currentValues.scan_type}
          >
            {({ getFieldValue }) => {
              const scanType = getFieldValue('scan_type');
              const isReport = scanType === 'REPORT';

              return (
                <Form.Item
                  label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>{isReport ? 'Medical Report' : 'Medical Image'}</span>}
                  required
                >
                  <Upload.Dragger
                    {...getUploadProps(scanType)}
                    fileList={fileList}
                    className="rounded-lg"
                    style={{
                      backgroundColor: '#2a2a2a',
                      border: '2px dashed #404040',
                    }}
                  >
                    <div className="p-6">
                      {isReport ? (
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      ) : (
                        <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      )}
                      <Title level={4} style={{ color: '#F7F7F7', marginBottom: 8 }}>
                        Click or drag file to upload
                      </Title>
                      <Text style={{ color: '#9CA3AF' }}>
                        {isReport
                          ? 'Support for PDF, DOC, DOCX (Max: 20MB)'
                          : 'Support for JPG, PNG, GIF, BMP, TIFF (Max: 10MB)'}
                      </Text>
                    </div>
                  </Upload.Dragger>
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 rounded-lg font-semibold text-base"
              style={{
                backgroundColor: '#00B58E',
                borderColor: '#00B58E',
              }}
              disabled={fileList.length === 0}
            >
              {loading ? 'Analyzing...' : 'Upload & Analyze'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Analysis Results */}
      {uploadResult && uploadResult.data && (
        <Card
          className="shadow-lg rounded-xl border-0"
          style={{ 
            backgroundColor: '#1F2937',
            border: '1px solid #374151'
          }}
        >
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <Title level={3} style={{ color: '#F7F7F7', marginBottom: 0 }}>
                Analysis Complete
              </Title>
            </div>
            
            <Alert
              message={uploadResult.message}
              type="success"
              showIcon
              className="mb-6 rounded-lg"
            />
          </div>

          {/* Scan Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Scan ID:</Text>
                <br />
                <Text style={{ color: '#9CA3AF' }}>#{uploadResult.data.id}</Text>
              </div>
              
              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Scan Type:</Text>
                <br />
                <Tag color="#00B58E" className="mt-1">
                  {uploadResult.data.scan_type_display}
                </Tag>
              </div>

              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Patient:</Text>
                <br />
                <div className="flex items-center space-x-2 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <Text style={{ color: '#9CA3AF' }}>
                    {uploadResult.data.patient_name}
                  </Text>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Upload Date:</Text>
                <br />
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Text style={{ color: '#9CA3AF' }}>
                    {formatDate(uploadResult.data.upload_date)}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong style={{ color: '#F7F7F7' }}>Analysis Status:</Text>
                <br />
                <div className="flex items-center space-x-2 mt-1">
                  {uploadResult.data.is_analyzed ? (
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

              <div>
                <Text strong style={{ color: '#F7F7F7' }}>AI Model:</Text>
                <br />
                <Text style={{ color: '#9CA3AF' }}>
                  {uploadResult.data.ai_analysis_report?.model_used || uploadResult.data.ai_analysis_report?.openai_analysis?.model_used || 'N/A'}
                </Text>
              </div>
            </div>
          </div>

          <Divider style={{ borderColor: '#374151' }} />

          {/* AI Analysis */}
          <div>
            <Title level={4} style={{ color: '#F7F7F7', marginBottom: 16 }}>
              🤖 Medical Scan Analysis
            </Title>
            
            {/* Primary Analysis from diagnosis field */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }}
            >
              <div className="mb-4">
                <Text strong style={{ color: '#00B58E', fontSize: '16px' }}>
                  Primary Analysis:
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
                  {parseAnalysis(uploadResult.data.diagnosis)}
                </pre>
              </Paragraph>
            </div>

            {/* Secondary Analysis from ai_analysis_report if different */}
            {((uploadResult.data.ai_analysis_report?.openai_analysis?.analysis &&
             uploadResult.data.ai_analysis_report.openai_analysis.analysis !== uploadResult.data.diagnosis) ||
             (uploadResult.data.ai_analysis_report?.analysis &&
             uploadResult.data.ai_analysis_report.analysis !== uploadResult.data.diagnosis)) && (
              <div
                className="p-4 rounded-lg mt-4"
                style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }}
              >
                <div className="mb-4">
                  <Text strong style={{ color: '#1D459A', fontSize: '16px' }}>
                    Detailed AI Analysis:
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
                    {uploadResult.data.ai_analysis_report?.analysis || uploadResult.data.ai_analysis_report?.openai_analysis?.analysis}
                  </pre>
                </Paragraph>
              </div>
            )}

            <Alert
              message="Medical Disclaimer"
              description="This AI analysis is for educational purposes only and should not be used for medical diagnosis. Always consult healthcare professionals for medical concerns."
              type="warning"
              showIcon
              className="mt-4 rounded-lg"
            />
          </div>
        </Card>
      )}

      {loading && (
        <Card
          className="shadow-lg rounded-xl border-0 text-center"
          style={{ 
            backgroundColor: '#1F2937',
            border: '1px solid #374151'
          }}
        >
          <Spin size="large" />
          <Title level={4} style={{ color: '#F7F7F7', marginTop: 16 }}>
            Analyzing your medical scan...
          </Title>
          <Text style={{ color: '#9CA3AF' }}>
            Please wait while our AI analyzes your medical image
          </Text>
        </Card>
      )}
    </div>
  );
};

export default HealthReportUpload;