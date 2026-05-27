import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
}

class ApiService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body = null } = options
    const url = `${this.baseURL}${endpoint}`

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body)
    }

    const response = await fetch(url, fetchOptions)

    if (response.status === 401) {
      return { success: false, message: 'Authentication required' }
    }

    const data = await response.json()
    return data as ApiResponse<T>
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.request(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: { email, password, name },
    })
  }

  async login(email: string, password: string) {
    return this.request<{ user_id: number; email: string; name: string; level: string; is_admin: boolean; redirect: string }>(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: { email, password },
    })
  }

  async logout() {
    return this.request(API_ENDPOINTS.auth.logout, { method: 'POST' })
  }

  async sendOtp(email: string, name?: string) {
    return this.request(API_ENDPOINTS.auth.sendOtp, {
      method: 'POST',
      body: { email, name },
    })
  }

  async verifyOtp(email: string, otp: string) {
    return this.request<{ user_id: number; redirect: string }>(API_ENDPOINTS.auth.verifyOtp, {
      method: 'POST',
      body: { email, otp },
    })
  }

  async getMe() {
    return this.request<{ id: number; email: string; full_name: string; level: string; language: string; verified: boolean }>(API_ENDPOINTS.auth.me)
  }

  // Lessons
  async getLessons(level?: string, type?: string, limit?: number) {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    if (type) params.append('type', type)
    if (limit) params.append('limit', limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request<{ lessons: Lesson[]; total: number }>(API_ENDPOINTS.lessons.getAll + query)
  }

  async getLesson(id: number) {
    return this.request<Lesson>(`${API_ENDPOINTS.lessons.getOne}?id=${id}`)
  }

  async submitLessonAnswer(lessonId: number, answer: string) {
    return this.request<{ correct: boolean; correct_answer: string; explanation: string; score: number; xp_earned: number }>(API_ENDPOINTS.lessons.submitAnswer, {
      method: 'POST',
      body: { lesson_id: lessonId, answer },
    })
  }

  // Vocabulary
  async getVocabulary(level?: string, limit?: number) {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    if (limit) params.append('limit', limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request<{ vocabulary: VocabWord[]; total: number; learned: number }>(API_ENDPOINTS.vocabulary.getAll + query)
  }

  async markVocabularyLearned(vocabularyId: number, learned: boolean = true) {
    return this.request<{ vocabulary_id: number; learned: boolean; xp_earned: number }>(API_ENDPOINTS.vocabulary.markLearned, {
      method: 'POST',
      body: { vocabulary_id: vocabularyId, learned },
    })
  }

  // Exams
  async getExams(level?: string) {
    const query = level ? `?level=${level}` : ''
    return this.request<{ exams: Exam[] }>(API_ENDPOINTS.exams.getAll + query)
  }

  async getExam(id: number) {
    return this.request<Exam>(`${API_ENDPOINTS.exams.getOne}?id=${id}`)
  }

  async submitExam(examId: number, answers: { question_id: number; answer: string }[], timeSpent?: number) {
    return this.request<{ score: number; status: string; passed: boolean; correct_answers: number; total_questions: number; xp_earned: number }>(API_ENDPOINTS.exams.submit, {
      method: 'POST',
      body: { exam_id: examId, answers, time_spent_minutes: timeSpent },
    })
  }

  // User
  async getProfile() {
    return this.request<UserProfile>(API_ENDPOINTS.user.getProfile)
  }

  async updateProfile(data: { full_name?: string; language?: string }) {
    return this.request(API_ENDPOINTS.user.updateProfile, {
      method: 'POST',
      body: data,
    })
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.request(API_ENDPOINTS.user.changePassword, {
      method: 'POST',
      body: { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword },
    })
  }

  // Progress
  async getDashboard() {
    return this.request<DashboardData>(API_ENDPOINTS.progress.getDashboard)
  }
}

// Types
export interface Lesson {
  id: number
  title: string
  description: string
  level: string
  type: string
  content?: Record<string, unknown>
  duration_minutes: number
  xp_reward: number
  user_status?: string | null
  user_score?: number
  user_progress?: { status: string; score: number; completed_at: string } | null
}

export interface VocabWord {
  id: number
  german_word: string
  english_translation: string
  article: string
  part_of_speech: string
  difficulty_level: string
  example_sentence: string
  pronunciation: string
  image_url: string | null
  user_learned: boolean
  learned_at: string | null
}

export interface Exam {
  id: number
  title: string
  description: string
  level: string
  duration_minutes: number
  pass_score: number
  total_questions: number
  sections?: Record<string, unknown>
  content?: Record<string, unknown>
  best_score?: number | null
  passed?: number
  attempt_count?: number
  user_result?: { id: number; score: number; status: string; completed_at: string } | null
}

export interface UserProfile {
  user: {
    id: number
    email: string
    full_name: string
    level: string
    language: string
    verified: boolean
    created_at: string
  }
  points: number
  streak: { current_streak: number; longest_streak: number; last_activity_date: string | null }
  stats: {
    lessons_completed: number
    vocabulary_learned: number
    best_exam_score: number
    exams_passed: number
  }
}

export interface DashboardData {
  greeting: string
  user: { name: string; level: string; email: string }
  stats: {
    points: number
    streak: number
    lessons_done: number
    exams_passed: number
    vocabulary_learned: number
  }
  recent_lessons: { id: number; title: string; level: string; score: number; completed_at: string }[]
}

export const apiService = new ApiService(API_BASE_URL)
