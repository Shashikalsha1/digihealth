import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Typography, 
  Tag, 
  Space,
  Modal,
  Form,
  Select,
  Upload,
  message,
  Spin
} from 'antd';
import {
  Plus,
  FileImage,
  Activity,
  Calendar,
  Eye,
  Upload as UploadIcon,
  FileText,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import apiService from '../../services/apiService';
import type { MedicalScanResponse } from '../../services/apiService';
import FormError from '../error/FormError';

const { Title, Text } = Typography;
const { Option } = Select;

interface HealthReportListProps {
  onViewDetail: (scanId: number) => void;
}

const HealthReportList: React.FC<HealthReportListProps> = ({ onViewDetail }) => {
  const [scans, setScans] = useState<MedicalScanResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [formError, setFormError] = useState<string>('');

  const scanTypes = [
    { value: 'XRAY', label: 'X-Ray', icon: <FileImage className="w-4 h-4" /> },
    { value: 'ECG', label: 'ECG', icon: <Activity className="w-4 h-4" /> },
    { value: 'REPORT', label: 'Medical Report', icon: <FileText className="w-4 h-4" /> },
  ];

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedicalScans();
      console.log('API Response:', response); // Debug log
      setScans(response.data || []);
    } catch (error) {
      console.error('Error fetching scans:', error); // Debug log
      message.error('Failed to fetch medical scans');
    } finally {
      setLoading(false);
    }
  };

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

  const handleNewCase = async (values: { scan_type: string }) => {
    if (fileList.length === 0) {
      setFormError('Please select a file to upload');
      return;
    }

    try {
      setUploadLoading(true);
      setFormError('');

      const formData = new FormData();
      formData.append('scan_type', values.scan_type);

      const isReport = values.scan_type === 'REPORT';
      const fieldName = isReport ? 'report_file' : 'image';
      formData.append(fieldName, fileList[0].originFileObj);

      await apiService.uploadMedicalScan(formData);

      message.success(isReport ? 'Medical report uploaded and analyzed successfully!' : 'Medical scan uploaded and analyzed successfully!');
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchScans();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Upload failed. Please try again.';

      setFormError(errorMessage);
      message.error('Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: ColumnsType<MedicalScanResponse> = [
    {
      title: 'Scan ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => (
        <div
          className="inline-flex items-center justify-center px-3 py-1 rounded-lg"
          style={{
            backgroundColor: '#374151',
            border: '1px solid #4B5563',
          }}
        >
          <Text strong style={{ color: '#F7F7F7', fontSize: '13px' }}>#{id}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'scan_type_display',
      key: 'scan_type',
      width: 150,
      render: (type, record) => {
        let bgColor = 'rgba(0, 181, 142, 0.1)';
        let borderColor = 'rgba(0, 181, 142, 0.3)';
        let textColor = '#00B58E';
        let icon = <FileImage className="w-4 h-4" />;

        if (record.scan_type === 'ECG') {
          bgColor = 'rgba(29, 69, 154, 0.1)';
          borderColor = 'rgba(29, 69, 154, 0.3)';
          textColor = '#1D459A';
          icon = <Activity className="w-4 h-4" />;
        } else if (record.scan_type === 'REPORT') {
          bgColor = 'rgba(245, 158, 11, 0.1)';
          borderColor = 'rgba(245, 158, 11, 0.3)';
          textColor = '#F59E0B';
          icon = <FileText className="w-4 h-4" />;
        }

        return (
          <div
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            <span style={{ color: textColor }}>{icon}</span>
            <Text strong style={{ color: textColor, fontSize: '13px' }}>
              {type}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
      render: (name) => (
        <Text strong style={{ color: '#F7F7F7', fontSize: '14px' }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Upload Date',
      dataIndex: 'upload_date',
      key: 'upload_date',
      render: (date) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" style={{ color: '#6B7280' }} />
          <Text style={{ color: '#9CA3AF', fontSize: '13px' }}>{formatDate(date)}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_analyzed',
      key: 'status',
      width: 130,
      render: (isAnalyzed) => (
        <div
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: isAnalyzed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: isAnalyzed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          {isAnalyzed ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
          ) : (
            <AlertCircle className="w-4 h-4" style={{ color: '#F59E0B' }} />
          )}
          <Text strong style={{ color: isAnalyzed ? '#10B981' : '#F59E0B', fontSize: '13px' }}>
            {isAnalyzed ? 'Analyzed' : 'Pending'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="middle"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => onViewDetail(record.id)}
          style={{
            backgroundColor: '#00B58E',
            borderColor: '#00B58E',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0, 181, 142, 0.25)',
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div
        className="rounded-2xl p-8 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
          border: '1px solid #374151',
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: 'rgba(0, 181, 142, 0.1)',
                  border: '1px solid rgba(0, 181, 142, 0.3)',
                }}
              >
                <Sparkles className="w-6 h-6" style={{ color: '#00B58E' }} />
              </div>
              <Title level={2} style={{ color: '#F7F7F7', marginBottom: 0 }}>
                Health Reports
              </Title>
            </div>
            <Text style={{ color: '#9CA3AF', fontSize: '15px' }}>
              AI-powered analysis of your medical scans and reports
            </Text>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00B58E' }}></div>
                <Text style={{ color: '#9CA3AF', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {scans.filter(s => s.is_analyzed).length} Analyzed
                </Text>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <Text style={{ color: '#9CA3AF', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {scans.filter(s => !s.is_analyzed).length} Pending
                </Text>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
                <Text style={{ color: '#9CA3AF', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  Total: {scans.length}
                </Text>
              </div>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setModalVisible(true)}
            style={{
              backgroundColor: '#00B58E',
              borderColor: '#00B58E',
              height: '48px',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0, 181, 142, 0.3)',
            }}
          >
            Upload New Scan
          </Button>
        </div>
      </div>

      {/* Reports Table */}
      <Card
        className="shadow-lg rounded-xl border-0"
        style={{ 
          backgroundColor: '#1F2937',
          border: '1px solid #374151'
        }}
      >
        <Table
          columns={columns}
          dataSource={scans}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} reports`,
          }}
          className="dark-table"
        />
      </Card>

      {/* New Case Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(0, 181, 142, 0.1)',
                border: '1px solid rgba(0, 181, 142, 0.3)',
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: '#00B58E' }} />
            </div>
            <div>
              <div style={{ color: '#F7F7F7', fontSize: '18px', fontWeight: 600 }}>
                Upload New Medical Scan
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 400 }}>
                AI will analyze and provide insights
              </div>
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
          setFormError('');
        }}
        footer={null}
        width={650}
        style={{
          top: 40,
        }}
        styles={{
          content: {
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '16px',
          },
          header: {
            backgroundColor: '#1F2937',
            borderBottom: '1px solid #374151',
            padding: '20px 24px',
          },
          body: {
            padding: '24px',
          },
        }}
      >
        <FormError message={formError} />

        <Form
          form={form}
          onFinish={handleNewCase}
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

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                  setFormError('');
                }}
                style={{ color: '#9CA3AF' }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploadLoading}
                disabled={fileList.length === 0}
                style={{
                  backgroundColor: '#00B58E',
                  borderColor: '#00B58E',
                }}
              >
                {uploadLoading ? 'Uploading...' : 'Upload & Analyze'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthReportList;