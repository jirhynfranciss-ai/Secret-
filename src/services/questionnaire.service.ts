/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';
import type { Question, QuestionnaireResponse } from '../types/database';

const db = supabase as any;

export const questionnaireService = {
  async getActiveQuestions(): Promise<Question[]> {
    const { data, error } = await db
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as Question[];
  },

  async getAllQuestions(): Promise<Question[]> {
    const { data, error } = await db
      .from('questions')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as Question[];
  },

  async getUserResponses(userId: string): Promise<QuestionnaireResponse[]> {
    const { data, error } = await db
      .from('questionnaire_responses')
      .select('*, questions(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data as QuestionnaireResponse[];
  },

  async saveResponse(
    userId: string,
    questionId: string,
    answer: string
  ): Promise<QuestionnaireResponse> {
    const { data: existing } = await db
      .from('questionnaire_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .single();

    if (existing) {
      const { data, error } = await db
        .from('questionnaire_responses')
        .update({ answer, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as QuestionnaireResponse;
    } else {
      const { data, error } = await db
        .from('questionnaire_responses')
        .insert({ user_id: userId, question_id: questionId, answer })
        .select()
        .single();
      if (error) throw error;
      return data as QuestionnaireResponse;
    }
  },

  async saveAllResponses(
    userId: string,
    responses: { questionId: string; answer: string }[]
  ) {
    const upserts = responses.map((r) => ({
      user_id: userId,
      question_id: r.questionId,
      answer: r.answer,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await db
      .from('questionnaire_responses')
      .upsert(upserts, { onConflict: 'user_id,question_id' });

    if (error) throw error;
  },

  async createQuestion(question: {
    question_text: string;
    question_type: 'text' | 'choice' | 'scale';
    options?: string[] | null;
    order_index: number;
    is_active: boolean;
  }) {
    const { data, error } = await db
      .from('questions')
      .insert(question)
      .select()
      .single();
    if (error) throw error;
    return data as Question;
  },

  async updateQuestion(
    id: string,
    updates: Partial<{
      question_text: string;
      question_type: 'text' | 'choice' | 'scale';
      options: string[] | null;
      order_index: number;
      is_active: boolean;
    }>
  ) {
    const { data, error } = await db
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Question;
  },

  async deleteQuestion(id: string) {
    const { error } = await db.from('questions').delete().eq('id', id);
    if (error) throw error;
  },

  async getAllResponses() {
    const { data, error } = await db
      .from('questionnaire_responses')
      .select('*, profiles(display_name, email), questions(question_text)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};
