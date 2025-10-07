const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://74bbf7a1bdc0.ngrok-free.app';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface ApiResponse<T> {
  message: string;
  user?: any;
  tokens?: {
    access: string;
    refresh: string;
  };
  data?: T;
}

export interface MedicalScanResponse {
  id: number;
  scan_type: string;
  scan_type_display: string;
  image: string;
  upload_date: string;
  diagnosis: string;
  ai_analysis_report: {
    success: boolean;
    openai_analysis: {
      success: boolean;
      analysis: string;
      model_used: string;
    };
  };
  is_analyzed: boolean;
  patient_name: string;
}

class ApiService {
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private getFormHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'ngrok-skip-browser-warning': 'true',
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(data: LoginData): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || responseData.detail || 'Login failed');
    }

    return responseData;
  }

  async register(data: RegisterData): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  }

  async uploadMedicalScan(scanType: string, imageFile: File): Promise<ApiResponse<MedicalScanResponse>> {
  }
  async uploadMedicalScan(formData: FormData): Promise<ApiResponse<MedicalScanResponse>> {

    const response = await fetch(`${API_BASE_URL}/medical/upload/`, {
      method: 'POST',
      headers: this.getFormHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to upload medical scan');
    }

    return response.json();
  }

  async getMedicalScans(): Promise<ApiResponse<MedicalScanResponse[]>> {
    const response = await fetch(`${API_BASE_URL}/medical/upload/`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch medical scans');
    }

    const data = await response.json();
    // Handle paginated response structure
    if (data.results) {
      return {
        message: 'Medical scans retrieved successfully',
        data: data.results
      };
    }
    return data;
  }

  async getMedicalScanById(id: number): Promise<ApiResponse<MedicalScanResponse>> {
    const response = await fetch(`${API_BASE_URL}/medical/upload/${id}/`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to fetch medical scan details');
    }

    const data = await response.json();
    // Handle direct response format
    return {
      message: 'Medical scan details retrieved successfully',
      data: data
    };
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  logout() {
    // Remove tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getImageUrl(imagePath: string): string {
    // Remove /api from the base URL and append the image path
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  async getGoogleFitStatus(): Promise<{
    connected: boolean;
    expires_at: string | null;
    is_expired: boolean | null;
    scopes: string[];
    last_updated: string | null;
  }> {
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/status/`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to get Google Fit status');
    }

    return response.json();
  }

  async disconnectGoogleFit(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/disconnect/`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to disconnect Google Fit');
    }

    return response.json();
  }

  async initiateGoogleFitAuth(userId: number): Promise<{ oauth_url: string; message: string }> {
    console.log('Making API call to initiate Google Fit auth');
    
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/initiate/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        state: `user_${userId}`,
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || errorData.detail || 'Failed to initiate Google Fit authentication');
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    // Validate that we have the required oauth_url
    if (!data.oauth_url) {
      throw new Error('No OAuth URL received from server');
    }
    
    return data;
  }

  async completeGoogleFitAuth(code: string, state: string): Promise<ApiResponse<any>> {
    console.log('Completing Google Fit auth with code:', code.substring(0, 20) + '...', 'and state:', state);
    
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/callback/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        code,
        state,
      }),
    });

    console.log('Complete auth response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Complete auth error:', errorData);
      throw new Error(errorData.message || errorData.detail || 'Failed to complete Google Fit authentication');
    }

    const data = await response.json();
    console.log('Complete auth response data:', data);
    return data;
  }

  async syncAndGetLatestHealthData(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/google-fit/sync-and-get-latest/`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to sync and get health data');
    }

    const data = await response.json();
    return {
      message: 'Health data synced successfully',
      data: data
    };
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  logout() {
    // Remove tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getImageUrl(imagePath: string): string {
    // Remove /api from the base URL and append the image path
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  async getGoogleFitStatus(): Promise<{
    connected: boolean;
    expires_at: string | null;
    is_expired: boolean | null;
    scopes: string[];
    last_updated: string | null;
  }> {
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/status/`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to get Google Fit status');
    }

    return response.json();
  }

  async disconnectGoogleFit(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/disconnect/`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to disconnect Google Fit');
    }

    return response.json();
  }

  async initiateGoogleFitAuth(userId: number): Promise<{ oauth_url: string; message: string }> {
    console.log('Making API call to initiate Google Fit auth');
    
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/initiate/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        state: `user_${userId}`,
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || errorData.detail || 'Failed to initiate Google Fit authentication');
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    // Validate that we have the required oauth_url
    if (!data.oauth_url) {
      throw new Error('No OAuth URL received from server');
    }
    
    return data;
  }

  async completeGoogleFitAuth(code: string, state: string): Promise<ApiResponse<any>> {
    console.log('Completing Google Fit auth with code:', code.substring(0, 20) + '...', 'and state:', state);
    
    const response = await fetch(`${API_BASE_URL}/google-fit/auth/callback/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        code,
        state,
      }),
    });

    console.log('Complete auth response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Complete auth error:', errorData);
      throw new Error(errorData.message || errorData.detail || 'Failed to complete Google Fit authentication');
    }

    const data = await response.json();
    console.log('Complete auth response data:', data);
    return data;
  }
}

export const apiService = new ApiService();

export default apiService