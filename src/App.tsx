import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAuthStore } from './store/authStore';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const theme = {
    token: {
      colorPrimary: '#00B58E',
      colorInfo: '#1D459A',
      colorText: '#46454D',
      colorBgBase: '#1a1a1a',
      borderRadius: 8,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Button: {
        borderRadius: 8,
        controlHeight: 44,
      },
      Input: {
        borderRadius: 8,
        controlHeight: 44,
      },
      Card: {
        borderRadius: 12,
      },
    },
  };

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/register" replace />
              }
            />
            <Route
              path="/oauth/callback"
              element={
                isAuthenticated ? <OAuthCallback /> : <Navigate to="/login" replace />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;