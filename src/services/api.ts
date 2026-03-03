/// <reference types="vite/client" />

import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 404) {
      console.warn('API endpoint not found:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string; phone?: string }) => 
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  completeOnboarding: (data: any) => api.put('/auth/complete-onboarding', data),
  sendOTP: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOTPRegister: (data: { email: string; otp: string; name: string; password: string; role: string; phone?: string }) =>
    api.post('/auth/verify-otp-register', data),
  sendLoginOTP: (email: string) => api.post('/auth/send-login-otp', { email }),
  verifyOTPLogin: (email: string, otp: string) => api.post('/auth/verify-otp-login', { email, otp }),
  updatePhone: (phone: string) => api.put('/auth/phone', { phone })
};

export const coursesAPI = {
  getAll: (params?: { category?: string; difficulty?: string; search?: string; page?: number; sort?: string }) =>
    api.get('/courses', { params }),
  getFeatured: () => api.get('/courses/featured'),
  getCategories: () => api.get('/courses/categories'),
  getMyCourses: () => api.get('/courses/my-courses'),
  getTeacherCourses: () => api.get('/courses/teacher'),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
  review: (id: string, data: any) => api.post(`/courses/${id}/review`, data)
};

export const learningAPI = {
  getNextModule: (courseId: string) => api.get(`/learn/next/${courseId}`),
  updateProgress: (data: { courseId: string; moduleId: string; completed?: boolean; timeSpent?: number }) =>
    api.post('/learn/progress', data),
  submitAnswer: (data: { courseId: string; assessmentId: string; questionId: string; answer: string }) =>
    api.post('/learn/submit-answer', data),
  getProgress: (courseId: string) => api.get(`/learn/progress/${courseId}`)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPerformance: () => api.get('/analytics/performance'),
  getCognitiveLoad: () => api.get('/analytics/cognitive-load'),
  getDailyProgress: () => api.get('/analytics/daily-progress')
};

export const mlAPI = {
  getRecommendations: () => api.get('/ml/recommendations'),
  submitFeedback: (data: { feedback: string; type: string; courseId?: string }) =>
    api.post('/ml/feedback', data),
  getIntent: () => api.get('/ml/intent'),
  getCognitivePattern: (courseId: string) => api.get(`/ml/cognitive-pattern?courseId=${courseId}`),
  getDifficultySuggestion: (loadLevel: number) => api.get(`/ml/difficulty-suggestion?loadLevel=${loadLevel}`),
  analyzeResponse: (data: { response: string; question?: string }) =>
    api.post('/ml/analyze-response', data),
  updateCognitiveLoad: (data: { courseId: string; metrics: any }) =>
    api.post('/ml/cognitive-load', data),
  uploadPDF: (file: File, subject: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subject', subject);
    return api.post('/ml/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const examsAPI = {
  getAll: () => api.get('/exams'),
  getById: (id: string) => api.get(`/exams/${id}`),
  create: (data: any) => api.post('/exams', data),
  update: (id: string, data: any) => api.put(`/exams/${id}`, data),
  publish: (id: string) => api.post(`/exams/${id}/publish`),
  start: (id: string) => api.post(`/exams/${id}/start`),
  submit: (id: string, data: any) => api.post(`/exams/${id}/submit`, data),
  getResults: (id: string) => api.get(`/exams/${id}/results`)
};

export const diaryAPI = {
  getEntries: (params?: any) => api.get('/diary/entries', { params }),
  getEntry: (id: string) => api.get(`/diary/entries/${id}`),
  createEntry: (data: any) => api.post('/diary/entries', data),
  updateEntry: (id: string, data: any) => api.put(`/diary/entries/${id}`, data),
  deleteEntry: (id: string) => api.delete(`/diary/entries/${id}`),
  lock: (password: string) => api.post('/diary/lock', { password }),
  unlock: (password: string) => api.post('/diary/unlock', { password }),
  getStatus: () => api.get('/diary/status'),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/diary/change-password', { currentPassword, newPassword })
};

export const chatbotAPI = {
  getGreeting: () => api.get('/chatbot/greeting'),
  chat: (message: string) => api.post('/chatbot/chat', { message }),
  getSuggestion: () => api.get('/chatbot/suggestion'),
  getContext: () => api.get('/chatbot/context'),
  clearContext: () => api.post('/chatbot/clear-context'),
  getWeakTopics: () => api.get('/chatbot/weak-topics'),
  addWeakTopic: (topic: string, subject: string) => api.post('/chatbot/add-weak-topic', { topic, subject }),
  updateWeakTopic: (id: string, completed: boolean) => api.put(`/chatbot/weak-topics/${id}`, { completed }),
  deleteWeakTopic: (id: string) => api.delete(`/chatbot/weak-topics/${id}`),
  getWeakTopicVideos: (id: string) => api.get(`/chatbot/weak-topics/${id}/videos`),
  generateTodo: (id: string) => api.post(`/chatbot/weak-topics/${id}/generate-todo`, {}),
  getTodos: () => api.get('/chatbot/todos'),
  completeTodo: (id: string) => api.put(`/chatbot/todos/${id}/complete`, {}),
  getNextVideo: () => api.get('/chatbot/next-video')
};

export const adminAPI = {
  login: (username: string, password: string) => api.post('/admin/login', { username, password }),
  listAdmins: () => api.get('/admin/list'),
  addAdmin: (data: { username: string; password: string; email: string; isSuperAdmin?: boolean }) => 
    api.post('/admin/add', data),
  removeAdmin: (id: string) => api.delete(`/admin/${id}`),
  
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  
  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  // Courses
  getCourses: (params?: any) => api.get('/admin/courses', { params }),
  getCourse: (id: string) => api.get(`/admin/courses/${id}`),
  updateCourseFeatured: (id: string, featured: boolean) => api.put(`/admin/courses/${id}/featured`, { featured }),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
  
  // Exams
  getExams: (params?: any) => api.get('/admin/exams', { params }),
  deleteExam: (id: string) => api.delete(`/admin/exams/${id}`),
  
  // Analytics
  getAnalytics: (days?: number) => api.get('/admin/analytics', { params: { days } })
};

export default api;
