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
  Upload as UploadIcon
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

  const uploadProps: UploadProps = {
    name: 'image',
    multiple: false,
    accept: '.jpg,.jpeg,.png,.gif,.bmp,.tiff',
    beforeUpload: (file) => {
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
      return false; // Prevent auto upload
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const handleNewCase = async (values: { scan_type: string }) => {
    if (fileList.length === 0) {
      setFormError('Please select an image file to upload');
      return;
    }

    try {
      setUploadLoading(true);
      setFormError('');

      const formData = new FormData();
      formData.append('scan_type', values.scan_type);
      formData.append('image', fileList[0].originFileObj);

      await apiService.uploadMedicalScan(formData);
      
      message.success('Medical scan uploaded and analyzed successfully!');
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchScans(); // Refresh the list
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
      width: 80,
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'scan_type_display',
      key: 'scan_type',
      width: 100,
      render: (type, record) => (
        <Tag 
          color={record.scan_type === 'XRAY' ? '#00B58E' : '#1D459A'}
          icon={record.scan_type === 'XRAY' ? <FileImage className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
      render: (name) => <Text>{name}</Text>,
    },
    {
      title: 'Upload Date',
      dataIndex: 'upload_date',
      key: 'upload_date',
      render: (date) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <Text style={{ color: '#9CA3AF' }}>{formatDate(date)}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_analyzed',
      key: 'status',
      width: 100,
      render: (isAnalyzed) => (
        <Tag color={isAnalyzed ? 'success' : 'warning'}>
          {isAnalyzed ? 'Analyzed' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => onViewDetail(record.id)}
          style={{
            backgroundColor: '#00B58E',
            borderColor: '#00B58E',
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={3} style={{ color: '#F7F7F7', marginBottom: 8 }}>
            Health Reports
          </Title>
          <Text style={{ color: '#9CA3AF' }}>
            View and manage your medical scan reports
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setModalVisible(true)}
          style={{
            backgroundColor: '#00B58E',
            borderColor: '#00B58E',
            height: '44px',
          }}
        >
          New Case
        </Button>
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
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5" style={{ color: '#00B58E' }} />
            <span style={{ color: '#F7F7F7' }}>Upload New Medical Scan</span>
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
        width={600}
        style={{
          top: 50,
        }}
        styles={{
          content: {
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
          },
          header: {
            backgroundColor: '#1F2937',
            borderBottom: '1px solid #374151',
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
            label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Medical Image</span>}
            required
          >
            <Upload.Dragger
              {...uploadProps}
              fileList={fileList}
              className="rounded-lg"
              style={{
                backgroundColor: '#2a2a2a',
                border: '2px dashed #404040',
              }}
            >
              <div className="p-6">
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <Title level={4} style={{ color: '#F7F7F7', marginBottom: 8 }}>
                  Click or drag file to upload
                </Title>
                <Text style={{ color: '#9CA3AF' }}>
                  Support for JPG, PNG, GIF, BMP, TIFF (Max: 10MB)
                </Text>
              </div>
            </Upload.Dragger>
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