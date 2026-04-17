import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  user_type: 'fresher' | 'experienced';
  template: string;
  form_data: { fullName?: string; email?: string; phone?: string; summary?: string; skills?: string; };
  experiences: any[];
  education: any[];
  projects: any[];
  profile_links: any[];
  achievements: any[];
  certifications: any[];
  internships: any[];
  created_at: string;
  updated_at: string;
}

const MAX_RESUMES = 5;
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getToken = async (): Promise<string | null> => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

// Store resumes locally in memory + localStorage as fallback
const STORAGE_KEY = 'crab_ai_resumes';

const loadLocal = (): Resume[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveLocal = (resumes: Resume[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes)); } catch {}
};

export const useResumes = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeCount, setResumeCount] = useState(0);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      // First try backend API
      const token = await getToken();
      if (token) {
        const res = await fetch(`${API_BASE}/api/resumes/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setResumes(list);
          setResumeCount(list.length);
          saveLocal(list);
          setLoading(false);
          return;
        }
      }
      // Fallback to localStorage
      const local = loadLocal().filter(r => !user || r.user_id === user.id);
      setResumes(local);
      setResumeCount(local.length);
    } catch {
      const local = loadLocal().filter(r => !user || r.user_id === user.id);
      setResumes(local);
      setResumeCount(local.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, [user]);

  const canCreateResume = () => resumeCount < MAX_RESUMES;

  const createResume = async (resumeData: Omit<Resume, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) { toast.error('Please sign in to save your resume'); return null; }
    if (!canCreateResume()) { toast.error(`Maximum of ${MAX_RESUMES} resumes allowed`); return null; }

    const newResume: Resume = {
      ...resumeData,
      id: Date.now().toString(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Try backend
      const token = await getToken();
      if (token) {
        const res = await fetch(`${API_BASE}/api/resumes/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newResume),
        });
        if (res.ok) {
          const saved = await res.json();
          await fetchResumes();
          toast.success('Resume saved!');
          return saved;
        }
      }
    } catch {}

    // Fallback: save to localStorage
    const all = loadLocal();
    const userResumes = all.filter(r => r.user_id === user.id);
    if (userResumes.length >= MAX_RESUMES) { toast.error(`Max ${MAX_RESUMES} resumes`); return null; }
    all.push(newResume);
    saveLocal(all);
    setResumes(all.filter(r => r.user_id === user.id));
    setResumeCount(userResumes.length + 1);
    toast.success('Resume saved locally!');
    return newResume;
  };

  const deleteResume = async (id: string) => {
    if (!user) { toast.error('Please sign in'); return false; }
    try {
      const token = await getToken();
      if (token) {
        const res = await fetch(`${API_BASE}/api/resumes/${id}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { await fetchResumes(); toast.success('Resume deleted'); return true; }
      }
    } catch {}
    // Fallback localStorage
    const all = loadLocal().filter(r => r.id !== id);
    saveLocal(all);
    const userResumes = all.filter(r => r.user_id === user.id);
    setResumes(userResumes);
    setResumeCount(userResumes.length);
    toast.success('Resume deleted');
    return true;
  };

  const updateResume = async (id: string, data: Partial<Resume>) => {
    const updated = { ...data, updated_at: new Date().toISOString() };
    try {
      const token = await getToken();
      if (token) {
        const res = await fetch(`${API_BASE}/api/resumes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(updated),
        });
        if (res.ok) { await fetchResumes(); toast.success('Resume updated'); return true; }
      }
    } catch {}
    const all = loadLocal().map(r => r.id === id ? { ...r, ...updated } : r);
    saveLocal(all);
    setResumes(all.filter(r => r.user_id === user?.id));
    toast.success('Resume updated');
    return true;
  };

  return { resumes, loading, resumeCount, maxResumes: MAX_RESUMES, canCreateResume, createResume, updateResume, deleteResume, refetch: fetchResumes };
};
