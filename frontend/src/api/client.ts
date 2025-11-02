import axios from 'axios';
import type {
  LLMModel,
  LegalQuestion,
  GetArenaMatchResponse,
  SubmitComparisonRequest,
  LeaderboardResponse,
} from '@legal-llm-arena/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = {
  // Models
  getModels: () => api.get<LLMModel[]>('/api/models'),
  getModel: (id: string) => api.get<LLMModel>(`/api/models/${id}`),
  getModelPerformance: (id: string) => api.get(`/api/models/${id}/performance`),

  // Questions
  getQuestions: (limit?: number, offset?: number) =>
    api.get<LegalQuestion[]>('/api/questions', { params: { limit, offset } }),
  getQuestion: (id: string) => api.get<LegalQuestion>(`/api/questions/${id}`),
  getRandomQuestion: () => api.get<LegalQuestion>('/api/questions/random'),
  createQuestion: (question: any) => api.post<LegalQuestion>('/api/questions', question),

  // Arena
  createMatch: (customQuestion?: string, urls?: string[]) =>
    api.post<GetArenaMatchResponse>('/api/arena/match', { customQuestion, urls }),
  submitComparison: (data: SubmitComparisonRequest) =>
    api.post('/api/arena/submit', data),
  getLeaderboard: () => api.get<LeaderboardResponse>('/api/arena/leaderboard'),

  // Analytics
  getOverview: () => api.get('/api/analytics/overview'),
  getDomainPerformance: () => api.get('/api/analytics/domain-performance'),
  getErrorFrequency: (modelId?: string) =>
    api.get('/api/analytics/error-frequency', { params: { modelId } }),
  getComplexityAnalysis: () => api.get('/api/analytics/complexity-analysis'),
  getChallengingQuestions: () => api.get('/api/analytics/challenging-questions'),
  getModelComparison: (modelAId: string, modelBId: string) =>
    api.get('/api/analytics/model-comparison', { params: { modelAId, modelBId } }),
};

export default apiClient;
