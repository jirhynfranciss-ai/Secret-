import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Edit3, Trash2, Save, X, GripVertical, ToggleLeft, ToggleRight } from 'lucide-react';
import { questionnaireService } from '../../services/questionnaire.service';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import type { Question } from '../../types/database';

interface QuestionForm {
  question_text: string;
  question_type: 'text' | 'choice' | 'scale';
  options: string;
  is_active: boolean;
}

const DEFAULT_FORM: QuestionForm = {
  question_text: '',
  question_type: 'text',
  options: '',
  is_active: true,
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [form, setForm] = useState<QuestionForm>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await questionnaireService.getAllQuestions();
      setQuestions(data);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingQ(null);
    setForm({ ...DEFAULT_FORM, order_index: questions.length + 1 } as unknown as QuestionForm);
    setShowModal(true);
  };

  const openEdit = (q: Question) => {
    setEditingQ(q);
    setForm({
      question_text: q.question_text,
      question_type: q.question_type,
      options: (q.options as string[] | null)?.join('\n') || '',
      is_active: q.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question_text.trim()) {
      toast.error('Question text is required');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        question_text: form.question_text.trim(),
        question_type: form.question_type,
        options:
          form.question_type === 'choice'
            ? form.options
                .split('\n')
                .map((o) => o.trim())
                .filter(Boolean)
            : null,
        is_active: form.is_active,
      };

      if (editingQ) {
        await questionnaireService.updateQuestion(editingQ.id, payload);
        toast.success('Question updated ✓');
      } else {
        await questionnaireService.createQuestion({
          ...payload,
          order_index: questions.length + 1,
        });
        toast.success('Question created ✓');
      }

      setShowModal(false);
      loadQuestions();
    } catch {
      toast.error('Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (q: Question) => {
    try {
      await questionnaireService.updateQuestion(q.id, { is_active: !q.is_active });
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, is_active: !item.is_active } : item
        )
      );
      toast.success(`Question ${q.is_active ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update question');
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete this question? This will also remove all responses.')) return;
    try {
      await questionnaireService.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete question');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <HelpCircle size={24} className="text-amber-400" />
          <div>
            <h1 className="text-white font-bold text-2xl">Questions</h1>
            <p className="text-white/40 text-sm">Manage questionnaire questions</p>
          </div>
        </div>
        <Button
          variant="admin"
          leftIcon={<Plus size={16} />}
          onClick={openCreate}
        >
          Add Question
        </Button>
      </motion.div>

      {/* Empty state */}
      {questions.length === 0 && (
        <div className="glass-card p-12 text-center space-y-4">
          <HelpCircle size={40} className="text-white/20 mx-auto" />
          <p className="text-white/50">No questions yet. Create your first one!</p>
          <Button onClick={openCreate} leftIcon={<Plus size={16} />}>
            Create Question
          </Button>
        </div>
      )}

      {/* Question List */}
      <AnimatePresence>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              className={`glass-card p-5 space-y-3 ${!q.is_active ? 'opacity-50' : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: q.is_active ? 1 : 0.5, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-white/20 mt-1 cursor-grab flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-rose-400 text-xs font-bold bg-rose-400/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {q.order_index}
                    </span>
                    <Badge
                      variant={
                        q.question_type === 'text'
                          ? 'gray'
                          : q.question_type === 'choice'
                          ? 'purple'
                          : 'yellow'
                      }
                    >
                      {q.question_type}
                    </Badge>
                    {!q.is_active && <Badge variant="gray">Inactive</Badge>}
                  </div>
                  <p className="text-white font-medium">{q.question_text}</p>
                  {q.options && (q.options as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(q.options as string[]).map((opt) => (
                        <span
                          key={opt}
                          className="text-xs text-white/40 bg-white/5 rounded px-2 py-0.5"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(q)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors"
                    title={q.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {q.is_active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => openEdit(q)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingQ ? 'Edit Question' : 'New Question'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm text-white/60">Question Text</label>
            <textarea
              className="w-full input-romantic px-4 py-3 text-sm resize-none"
              rows={3}
              placeholder="What would you like to ask?"
              value={form.question_text}
              onChange={(e) => setForm((p) => ({ ...p, question_text: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-white/60">Answer Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['text', 'choice', 'scale'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((p) => ({ ...p, question_type: type }))}
                  className={`py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                    form.question_type === type
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'glass text-white/50 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {form.question_type === 'choice' && (
            <div className="space-y-1.5">
              <label className="text-sm text-white/60">Options (one per line)</label>
              <textarea
                className="w-full input-romantic px-4 py-3 text-sm resize-none"
                rows={5}
                placeholder={"Option 1\nOption 2\nOption 3"}
                value={form.options}
                onChange={(e) => setForm((p) => ({ ...p, options: e.target.value }))}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              className={`flex items-center gap-2 text-sm transition-colors ${
                form.is_active ? 'text-emerald-400' : 'text-white/40'
              }`}
            >
              {form.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              {form.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="ghost"
              leftIcon={<X size={14} />}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="admin"
              leftIcon={<Save size={14} />}
              onClick={handleSave}
              isLoading={isSaving}
            >
              {editingQ ? 'Save Changes' : 'Create Question'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
