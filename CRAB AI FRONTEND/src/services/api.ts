import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private async getToken(): Promise<string | null> {
    // Always use the live Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await this.getToken();

    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ─── Auth ────────────────────────────────────────────────────────────────
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async updateProfile(userData: { display_name?: string; avatar_url?: string }) {
    return this.request('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // ─── Resumes ─────────────────────────────────────────────────────────────
  async getResumes() {
    return this.request('/api/resume-builder/resumes');
  }

  async createResume(resumeData: any) {
    return this.request('/api/resume-builder/resumes', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  }

  async updateResume(id: string, resumeData: any) {
    return this.request(`/api/resume-builder/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resumeData),
    });
  }

  async deleteResume(id: string) {
    return this.request(`/api/resume-builder/resumes/${id}`, { method: 'DELETE' });
  }

  // ─── ATS Scoring ─────────────────────────────────────────────────────────
  async analyzeATS(resumeId: number, jobDescription?: string) {
    return this.request(`/api/ats/analyze/${resumeId}`, {
      method: 'POST',
      body: JSON.stringify({ job_description: jobDescription }),
    });
  }

  async getAtsScores() {
    return this.request('/api/ats/user');
  }

  // ─── Resume Matching ─────────────────────────────────────────────────────
  async analyzeResumeMatch(resumeId: number, jobDescription: string, targetRole: string) {
    return this.request(`/api/resume-matcher/analyze/${resumeId}`, {
      method: 'POST',
      body: JSON.stringify({ job_description: jobDescription, target_role: targetRole }),
    });
  }

  // ─── Interview Prep ──────────────────────────────────────────────────────
  async generateInterviewQuestions(resumeContent: string, jobRole: string, company?: string) {
    return this.request('/api/interview/generate', {
      method: 'POST',
      body: JSON.stringify({ resume_content: resumeContent, job_role: jobRole, company }),
    });
  }

  async getInterviewSessions() {
    return this.request('/api/interview/sessions');
  }

  async saveInterviewSession(sessionData: any) {
    return this.request('/api/interview/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // ─── Course Recommendations ───────────────────────────────────────────────
  async getCourseRecommendations(currentSkills: string[], targetSkills: string[], careerGoal?: string) {
    return this.request('/api/courses/generate', {
      method: 'POST',
      body: JSON.stringify({ current_skills: currentSkills, target_skills: targetSkills, career_goal: careerGoal }),
    });
  }

  // ─── Portfolio ────────────────────────────────────────────────────────────
  async generatePortfolio(userData: any) {
    return this.request('/api/portfolio/generate', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getPortfolios() {
    return this.request('/api/portfolio/portfolios');
  }

  async savePortfolio(portfolioData: any) {
    return this.request('/api/portfolio/portfolios', {
      method: 'POST',
      body: JSON.stringify(portfolioData),
    });
  }

  // ─── File Upload ──────────────────────────────────────────────────────────
  async uploadFile(file: File, type: 'resume' | 'portfolio') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.request(`/api/upload/${type}`, { method: 'POST', body: formData });
  }
}

const apiService = new ApiService();

export const api = {
  getCurrentUser: async () => {
    try { return await apiService.getCurrentUser(); }
    catch (e) { throw e; }
  },
  updateProfile: async (data: any) => {
    try {
      const result = await apiService.updateProfile(data);
      toast.success('Profile updated!');
      return result;
    } catch (e) { toast.error('Failed to update profile.'); throw e; }
  },
  getResumes: async () => {
    try { return await apiService.getResumes(); }
    catch (e) { toast.error('Failed to load resumes.'); throw e; }
  },
  createResume: async (data: any) => {
    try {
      const r = await apiService.createResume(data);
      toast.success('Resume created!');
      return r;
    } catch (e) { toast.error('Failed to create resume.'); throw e; }
  },
  updateResume: async (id: string, data: any) => {
    try {
      const r = await apiService.updateResume(id, data);
      toast.success('Resume updated!');
      return r;
    } catch (e) { toast.error('Failed to update resume.'); throw e; }
  },
  deleteResume: async (id: string) => {
    try {
      await apiService.deleteResume(id);
      toast.success('Resume deleted!');
    } catch (e) { toast.error('Failed to delete resume.'); throw e; }
  },
  analyzeATS: async (resumeId: number, jobDescription?: string) => {
    try { return await apiService.analyzeATS(resumeId, jobDescription); }
    catch (e) { toast.error('Failed to analyze resume.'); throw e; }
  },
  getAtsScores: async () => {
    try { return await apiService.getAtsScores(); }
    catch (e) { toast.error('Failed to load ATS scores.'); throw e; }
  },
  analyzeResumeMatch: async (resumeId: number, jobDescription: string, targetRole: string) => {
    try { return await apiService.analyzeResumeMatch(resumeId, jobDescription, targetRole); }
    catch (e) { toast.error('Failed to match resume.'); throw e; }
  },
  generateInterviewQuestions: async (resumeContent: string, jobRole: string, company?: string) => {
    try { return await apiService.generateInterviewQuestions(resumeContent, jobRole, company); }
    catch (e) { toast.error('Failed to generate questions.'); throw e; }
  },
  getInterviewSessions: async () => {
    try { return await apiService.getInterviewSessions(); }
    catch (e) { toast.error('Failed to load sessions.'); throw e; }
  },
  saveInterviewSession: async (data: any) => {
    try {
      const r = await apiService.saveInterviewSession(data);
      toast.success('Session saved!');
      return r;
    } catch (e) { toast.error('Failed to save session.'); throw e; }
  },
  getCourseRecommendations: async (currentSkills: string[], targetSkills: string[], careerGoal?: string) => {
    try { return await apiService.getCourseRecommendations(currentSkills, targetSkills, careerGoal); }
    catch (e) { toast.error('Failed to get recommendations.'); throw e; }
  },
  generatePortfolio: async (data: any) => {
    try {
      const r = await apiService.generatePortfolio(data);
      toast.success('Portfolio generated!');
      return r;
    } catch (e) { toast.error('Failed to generate portfolio.'); throw e; }
  },
  getPortfolios: async () => {
    try { return await apiService.getPortfolios(); }
    catch (e) { toast.error('Failed to load portfolios.'); throw e; }
  },
  savePortfolio: async (data: any) => {
    try {
      const r = await apiService.savePortfolio(data);
      toast.success('Portfolio saved!');
      return r;
    } catch (e) { toast.error('Failed to save portfolio.'); throw e; }
  },
  uploadFile: async (file: File, type: 'resume' | 'portfolio') => {
    try {
      const r = await apiService.uploadFile(file, type);
      toast.success('File uploaded!');
      return r;
    } catch (e) { toast.error('Failed to upload file.'); throw e; }
  },
};

export default api;
