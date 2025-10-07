import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { User, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/apiService';
import FormError from '../components/error/FormError';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setUser, setLoading, setError, isLoading, error } = useAuthStore();
  const [formError, setFormError] = useState<string>('');

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);
      setError(null);
      setFormError('');

      const response = await apiService.login(values);
      const { user, tokens } = response;

      // Store tokens
      apiService.setTokens(tokens.access, tokens.refresh);

      // Update auth state
      setUser(user);

      message.success('Login successful! Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.message ||
        'Login failed. Please check your credentials and try again.';

      setError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#00B58E' }}
            >
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <Title level={2} style={{ color: '#46454D', marginBottom: 8 }}>
              Welcome Back
            </Title>
            <Text style={{ color: '#F7F7F7' }}>
              Sign in to your account
            </Text>
          </div>

          <FormError message={formError} />

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Username</span>}
              rules={[
                { required: true, message: 'Please enter your username' },
              ]}
            >
              <Input
                prefix={<User className="w-4 h-4" style={{ color: '#00B58E' }} />}
                placeholder="Enter your username"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: '#F7F7F7', fontWeight: 500 }}>Password</span>}
              rules={[
                { required: true, message: 'Please enter your password' },
              ]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4" style={{ color: '#00B58E' }} />}
                placeholder="Enter your password"
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
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <Text style={{ color: '#F7F7F7' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{ color: '#1D459A', fontWeight: 500 }}
                className="hover:underline"
              >
                Create Account
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;