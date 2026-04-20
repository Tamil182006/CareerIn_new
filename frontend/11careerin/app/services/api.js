import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// ── Axios instance with default config ───────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Helper: attach token to protected requests ────────────────────────────────
export const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Returns { message, token, user }
 */
export const signup = async (name, email, password) => {
  const { data } = await api.post('/auth/signup', { name, email, password });
  return data;
};

/**
 * POST /api/auth/login
 * Returns { message, token, user }
 */
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

/**
 * GET /api/auth/me  (protected)
 * Returns { user }
 */
export const getMe = async (token) => {
  const { data } = await api.get('/auth/me', authHeader(token));
  return data;
};

/**
 * PUT /api/auth/interests  (protected)
 * Body: { interests: [], skillLevel: "" }
 */
export const updateInterests = async (token, interests, skillLevel) => {
  const { data } = await api.put(
    '/auth/interests',
    { interests, skillLevel },
    authHeader(token)
  );
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PARSER (Phase 1 & 3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/resume/upload (protected)
 * Body: FormData (file)
 */
export const uploadResume = async (token, file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await api.post('/resume/upload', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CAREERS  (will be fully used on Day 3)
// ─────────────────────────────────────────────────────────────────────────────

export const getCareers   = async ()     => { const { data } = await api.get('/careers');           return data; };
export const getCareerById = async (id)  => { const { data } = await api.get(`/careers/${id}`);     return data; };
export const getRecommend  = async (token, interests) => {
  const { data } = await api.post('/careers/recommend', { interests }, authHeader(token));
  return data;
};

export const generateRoadmap = async (token, slug, skillLevel) => {
  const { data } = await api.post(`/careers/${slug}/generate`, { skillLevel }, authHeader(token));
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE  (will be used on Day 10)
// ─────────────────────────────────────────────────────────────────────────────

export const getProfile   = async (userId) => { const { data } = await api.get(`/profile/${userId}`);  return data; };

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS  (Phase 5)
// ─────────────────────────────────────────────────────────────────────────────

export const getProgress = async (token, slug) => {
  const { data } = await api.get(`/progress/${slug}`, authHeader(token));
  return data;
};

export const toggleProgress = async (token, slug, stepIndex) => {
  const { data } = await api.post(`/progress/${slug}/check`, { stepIndex }, authHeader(token));
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW  (Phase API Wrapper)
// ─────────────────────────────────────────────────────────────────────────────

export const sendInterviewMessage = async (token, payload) => {
  const { data } = await api.post(`/interview/chat`, payload, authHeader(token));
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// TRAINING (Phase 2 & 3 Integration)
// ─────────────────────────────────────────────────────────────────────────────

export const generateTrainingMaterials = async (token, payload) => {
  const { data } = await api.post(`/training/generate-materials`, payload, authHeader(token));
  return data;
};

export const generateTrainingExam = async (token, payload) => {
  const { data } = await api.post('/training/generate-exam', payload, authHeader(token));
  return data;
};

export default api;
