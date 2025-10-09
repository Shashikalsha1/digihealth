import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/apiService';
import FormError from '../components/error/FormError';

const { Title, Text } = Typography;

interface RegisterForm {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setUser, setLoading, setError, isLoading, error } = useAuthStore();
  const [formError, setFormError] = useState<string>('');

  const onFinish = async (values: RegisterForm) => {
    try {
      setLoading(true);
      setError(null);
      setFormError('');

      const response = await apiService.register(values);
      const { user, tokens } = response.data;

      // Store tokens
      apiService.setTokens(tokens.access, tokens.refresh);

      // Update auth state
      setUser(user);

      message.success('Registration successful! Welcome aboard!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';

      setError(errorMessage);
      setFormError(errorMessage);

      // Handle field-specific errors
      if (err.response?.data?.errors) {
        const fieldErrors = err.response.data.errors;
        Object.keys(fieldErrors).forEach((field) => {
          form.setFields([
            {
              name: field,
              errors: [fieldErrors[field][0]],
            },
          ]);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value || value.length < 8) {
      return Promise.reject('Password must be at least 8 characters long');
    }
    return Promise.resolve();
  };

  const validatePasswordConfirm = (_: any, value: string) => {
    const password = form.getFieldValue('password');
    if (value && value !== password) {
      return Promise.reject('Passwords do not match');
    }
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="w-full max-w-md">
        <Card
          className="registration-card shadow-lg rounded-xl border-0"
          style={{
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/QQ Health Logo-01 1.png"
                alt="QQ Health Logo"
                className="h-20 w-auto"
              />
            </div>
            <Title level={2} style={{ color: '#46454D', marginBottom: 8 }}>
              Create Account
            </Title>
            <Text style={{ color: '#F7F7F7' }}>
              Join us and start your journey
            </Text>
          </div>

          <FormError message={formError} />

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="first_name"
                label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>First Name</span>}
                rules={[
                  { required: true, message: 'Please enter your first name' },
                  { min: 2, message: 'First name must be at least 2 characters' },
                ]}
              >
                <Input
                  prefix={<User className="w-4 h-4" style={{ color: '#00B58E' }} />}
                  placeholder="Enter first name"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="last_name"
                label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Last Name</span>}
                rules={[
                  { required: true, message: 'Please enter your last name' },
                  { min: 2, message: 'Last name must be at least 2 characters' },
                ]}
              >
                <Input
                  prefix={<User className="w-4 h-4" style={{ color: '#00B58E' }} />}
                  placeholder="Enter last name"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="username"
              label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Username</span>}
              rules={[
                { required: true, message: 'Please enter a username' },
                { min: 3, message: 'Username must be at least 3 characters' },
              ]}
            >
              <Input
                prefix={<User className="w-4 h-4" style={{ color: '#00B58E' }} />}
                placeholder="Choose a username"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Email Address</span>}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                prefix={<Mail className="w-4 h-4" style={{ color: '#00B58E' }} />}
                placeholder="Enter email address"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Password</span>}
              rules={[
                { required: true, message: 'Please enter a password' },
                { validator: validatePassword },
              ]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4" style={{ color: '#00B58E' }} />}
                placeholder="Create password"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password_confirm"
              label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Confirm Password</span>}
              rules={[
                { required: true, message: 'Please confirm your password' },
                { validator: validatePasswordConfirm },
              ]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4" style={{ color: '#00B58E' }} />}
                placeholder="Confirm password"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full h-12 rounded-lg font-semibold text-base"
                style={{
                  backgroundColor: '#00B58E',
                  borderColor: '#00B58E',
                  '&:hover': {
                    backgroundColor: '#009a7a',
                    borderColor: '#009a7a',
                  },
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <Text style={{ color: '#F7F7F7' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: '#1D459A', fontWeight: 500 }}
                className="hover:underline"
              >
                Sign In
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;