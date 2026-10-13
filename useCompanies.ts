import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Company = Tables<'companies'>;
export type Evaluation = Tables<'evaluations'>;
export type AdminNotification = Tables<'admin_notifications'>;

const PUBLIC_COMPANY_COLUMNS = 'id,name,sector,location,lat,lng,description,website,average_rating,review_count,created_at';

export interface EvalComment {
  id: string;
  evaluation_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

export interface EvalLike {
  id: string;
  evaluation_id: string;
  user_id: string;
  created_at: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [comments, setComments] = useState<EvalComment[]>([]);
  const [likes, setLikes] = useState<EvalLike[]>([]);

  const loadCompanies = useCallback(async () => {
    const { data } = await supabase
      .from('companies')
      .select(PUBLIC_COMPANY_COLUMNS)
      .order('name');
    setCompanies((data as Company[]) || []);
  }, []);

  const loadEvaluations = useCallback(async () => {
    // Use RPC to get evaluations with masked user_id for anonymous reviews
    const { data } = await supabase.rpc('get_public_evaluations');
    setEvaluations((data as unknown as Evaluation[]) || []);
  }, []);

  const loadNotifications = useCallback(async () => {
    const { data } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false });
    setNotifications(data || []);
  }, []);

  const loadComments = useCallback(async () => {
    const { data } = await supabase.from('evaluation_comments').select('*').order('created_at', { ascending: true });
    setComments((data as EvalComment[]) || []);
  }, []);

  const loadLikes = useCallback(async () => {
    const { data } = await supabase.from('evaluation_likes').select('*');
    setLikes((data as EvalLike[]) || []);
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([loadCompanies(), loadEvaluations(), loadNotifications(), loadComments(), loadLikes()]);
  }, [loadCompanies, loadEvaluations, loadNotifications, loadComments, loadLikes]);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations' }, () => {
        loadEvaluations();
        loadCompanies();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluation_comments' }, () => {
        loadComments();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluation_likes' }, () => {
        loadLikes();
      })
      .subscribe();

    // Poll admin notifications every 30s (no longer on realtime for security)
    const notifInterval = setInterval(loadNotifications, 30000);

    return () => { supabase.removeChannel(channel); clearInterval(notifInterval); };
  }, [loadData, loadNotifications, loadEvaluations, loadCompanies, loadComments, loadLikes]);

  const addCompany = useCallback(async (company: Omit<Company, 'id' | 'created_at'>): Promise<Company | null> => {
    const { data, error } = await supabase.from('companies').insert(company).select().single();
    if (!error && data) {
      await loadCompanies();
      return data;
    }
    return null;
  }, [loadCompanies]);

  const updateCompany = useCallback(async (companyId: string, updates: Partial<Company>) => {
    const { error } = await supabase.from('companies').update(updates).eq('id', companyId);
    if (!error) await loadCompanies();
    return !error;
  }, [loadCompanies]);

  const addEvaluation = useCallback(async (evalData: {
    company_id: string;
    user_id: string;
    user_name: string;
    rating: number;
    text: string;
    date: string;
    aviso_aceito: boolean;
    termos_aceitos_em: string;
    ambient?: string;
    benefits?: string[];
    salary_amount?: string;
    salary_period?: string;
    anonymous: boolean;
    flagged_profanity?: boolean;
  }) => {
    const sanitized = {
      ...evalData,
      user_name: evalData.user_name.slice(0, 100),
      text: evalData.text.slice(0, 5000),
      salary_amount: evalData.salary_amount?.slice(0, 20),
      ambient: evalData.ambient?.slice(0, 50),
      benefits: evalData.benefits?.map(b => b.slice(0, 100)).slice(0, 30),
      rating: Math.min(5, Math.max(1, Math.round(evalData.rating))),
    };
    const { error } = await supabase.from('evaluations').insert(sanitized);
    if (!error) await loadData();
    return !error;
  }, [loadData]);

  const deleteEvaluation = useCallback(async (evalId: string) => {
    await supabase.from('evaluations').delete().eq('id', evalId);
    await loadData();
  }, [loadData]);

  const deleteCompany = useCallback(async (companyId: string) => {
    await supabase.from('companies').delete().eq('id', companyId);
    await loadCompanies();
  }, [loadCompanies]);

  const approveEvaluation = useCallback(async (evalId: string) => {
    await supabase.from('evaluations').update({ status: 'approved' }).eq('id', evalId);
    await loadData();
  }, [loadData]);

  const rejectEvaluation = useCallback(async (evalId: string) => {
    await supabase.from('evaluations').update({ status: 'rejected' }).eq('id', evalId);
    await loadData();
  }, [loadData]);

  const reportEvaluation = useCallback(async (evalId: string, userId: string, reason: string) => {
    await supabase.from('evaluation_reports').insert({
      evaluation_id: evalId,
      user_id: userId,
      reason,
    });
  }, []);

  const markNotificationRead = useCallback(async (notifId: string) => {
    await supabase.from('admin_notifications').update({ is_read: true }).eq('id', notifId);
    await loadNotifications();
  }, [loadNotifications]);

  const addComment = useCallback(async (evaluationId: string, userId: string, userName: string, text: string) => {
    if (!text.trim() || text.length > 1000) return false;
    const { error } = await supabase.from('evaluation_comments').insert({
      evaluation_id: evaluationId,
      user_id: userId,
      user_name: userName.slice(0, 100),
      text: text.slice(0, 1000),
    } as any);
    if (!error) await loadComments();
    return !error;
  }, [loadComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    await supabase.from('evaluation_comments').delete().eq('id', commentId);
    await loadComments();
  }, [loadComments]);

  const toggleLike = useCallback(async (evaluationId: string, userId: string) => {
    const existing = likes.find(l => l.evaluation_id === evaluationId && l.user_id === userId);
    if (existing) {
      await supabase.from('evaluation_likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('evaluation_likes').insert({
        evaluation_id: evaluationId,
        user_id: userId,
      } as any);
    }
    await loadLikes();
  }, [likes, loadLikes]);

  const getVisibleEvaluations = useCallback((userId?: string) => {
    return evaluations.filter(e => {
      if (e.status === 'approved') return true;
      if (e.status === 'pending' && e.user_id === userId) return true;
      return false;
    });
  }, [evaluations]);

  return {
    companies, evaluations, notifications, comments, likes,
    addEvaluation, addCompany, updateCompany,
    deleteEvaluation, deleteCompany, loadData,
    approveEvaluation, rejectEvaluation, reportEvaluation,
    getVisibleEvaluations, markNotificationRead,
    addComment, deleteComment, toggleLike,
  };
}
