const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000/api',
  },
  production: {
    baseURL: '/api',
  },
}

const env = import.meta.env.MODE || 'development'
export const API_BASE_URL = API_CONFIG[env as keyof typeof API_CONFIG]?.baseURL ?? API_CONFIG.development.baseURL

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register.php',
    login: '/auth/login.php',
    logout: '/auth/logout.php',
    sendOtp: '/auth/send-otp.php',
    verifyOtp: '/auth/verify-otp.php',
    me: '/auth/me.php',
  },
  lessons: {
    getAll: '/lessons/get-lessons.php',
    getOne: '/lessons/get-lesson.php',
    submitAnswer: '/lessons/submit-answer.php',
  },
  vocabulary: {
    getAll: '/vocabulary/get-vocabulary.php',
    markLearned: '/vocabulary/mark-learned.php',
  },
  exams: {
    getAll: '/exams/get-exams.php',
    getOne: '/exams/get-exam.php',
    submit: '/exams/submit-exam.php',
  },
  user: {
    getProfile: '/user/get-profile.php',
    updateProfile: '/user/update-profile.php',
    changePassword: '/user/change-password.php',
  },
  progress: {
    getDashboard: '/progress/get-dashboard.php',
  },
}
