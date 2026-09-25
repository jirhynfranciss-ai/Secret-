import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X, FileText, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { questionnaireService } from '../../services/questionnaire.service';
import { Button } from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import type { Question, QuestionnaireResponse } from '../../types/database';

interface ResponseWithQuestion extends QuestionnaireResponse {
  questions?: Question;
}

export default function MyAnswersPage() {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [qs, rs] = await Promise.all([
        questionnaireService.getActiveQuestions(),
        questionnaireService.getUserResponses(user.id),
      ]);
      setQuestions(qs);
      const responseMap: Record<string, string> = {};
      (rs as ResponseWithQuestion[]).forEach((r) => {
        responseMap[r.question_id] = r.answer;
      });
      setResponses(responseMap);
      setHasAnswered(rs.length > 0);
    } catch {
      toast.error('Failed to load your answers');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (questionId: string) => {
    setEditingId(questionId);
    setEditValue(responses[questionId] || '');
  };

  const saveEdit = async (questionId: string) => {
    if (!user || !editValue.trim()) return;
    setIsSaving(true);
    try {
      await questionnaireService.saveResponse(user.id, questionId, editValue.trim());
      setResponses((prev) => ({ ...prev, [questionId]: editValue.trim() }));
      setEditingId(null);
      setHasAnswered(true);
      toast.success('Answer updated ✨');
    } catch {
      toast.error('Failed to save answer');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const loadFromSession = async () => {
    if (!user) return;
    const saved = sessionStorage.getItem('questionnaire_answers');
    if (!saved) {
      toast('No saved questionnaire found');
      return;
    }
    try {
      const answers = JSON.parse(saved) as Record<string, string>;
      // Map landing page question IDs to actual DB questions
      const qs = await questionnaireService.getActiveQuestions();
      const pairs = qs.map((q, i) => {
        const landingKey = `q${i + 1}`;
        return { questionId: q.id, answer: answers[landingKey] || '' };
      }).filter((p) => p.answer);

      if (pairs.length === 0) {
        toast('No answers to import');
        return;
      }

      await questionnaireService.saveAllResponses(user.id, pairs);
      const responseMap: Record<string, string> = {};
      pairs.forEach((p) => { responseMap[p.questionId] = p.answer; });
      setResponses(responseMap);
      setHasAnswered(true);
      sessionStorage.removeItem('questionnaire_answers');
      toast.success(`Imported ${pairs.length} answers 💌`);
    } catch {
      toast.error('Failed to import answers');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-8 md:pt-12">
        <SkeletonList count={4} />
      </div>
    );
  }

  const pendingImport = !!sessionStorage.getItem('questionnaire_answers');

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-6 pt-8 md:pt-12 space-y-8">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <h1 className="font-serif text-3xl text-white">My Answers</h1>
            </div>
            <p className="text-white/50 text-sm">
              Your questionnaire responses — honest, personal, and beautifully yours
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={loadData}
          >
            Refresh
          </Button>
        </motion.div>

        {/* Import from questionnaire */}
        {pendingImport && (
          <motion.div
            className="glass-rose rounded-2xl p-5 flex items-center justify-between gap-4"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div>
              <p className="text-rose-200 font-medium">💌 Questionnaire answers ready</p>
              <p className="text-rose-300/60 text-sm mt-0.5">
                You completed the intro questionnaire. Save your answers here.
              </p>
            </div>
            <Button size="sm" onClick={loadFromSession} leftIcon={<Save size={14} />}>
              Save them
            </Button>
          </motion.div>
        )}

        {/* Empty state */}
        {questions.length === 0 && (
          <motion.div
            className="glass-card p-12 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-5xl">💭</span>
            <h2 className="font-serif text-xl text-white/70">No questions yet</h2>
            <p className="text-white/40 text-sm">
              Your admirer hasn't set up questions yet. Check back soon!
            </p>
          </motion.div>
        )}

        {/* Questions & Answers */}
        <div className="space-y-5">
          {questions.map((q, i) => {
            const answer = responses[q.id];
            const isEditing = editingId === q.id;

            return (
              <motion.div
                key={q.id}
                className="glass-card p-6 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Question */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-rose-400 text-xs font-bold bg-rose-400/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <h3 className="text-white/90 font-medium leading-relaxed">
                      {q.question_text}
                    </h3>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(q.id)}
                      className="text-white/30 hover:text-rose-300 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-rose-400/10"
                    >
                      <Edit3 size={15} />
                    </button>
                  )}
                </div>

                {/* Answer */}
                {isEditing ? (
                  <div className="space-y-3">
                    {q.question_type === 'choice' && q.options ? (
                      <div className="grid grid-cols-1 gap-2">
                        {(q.options as string[]).map((opt) => (
                          <button
                            key={opt}
                            className={`text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                              editValue === opt
                                ? 'gradient-rose text-white'
                                : 'glass text-white/60 hover:text-white'
                            }`}
                            onClick={() => setEditValue(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : q.question_type === 'scale' ? (
                      <div className="space-y-3">
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={Number(editValue) || 5}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-center text-rose-300 font-bold text-2xl">
                          {editValue || 5}/10
                        </p>
                      </div>
                    ) : (
                      <textarea
                        className="w-full input-romantic px-4 py-3 text-sm resize-none"
                        rows={3}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        placeholder="Share your answer..."
                      />
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<X size={14} />}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<Save size={14} />}
                        onClick={() => saveEdit(q.id)}
                        isLoading={isSaving}
                        disabled={!editValue.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-xl px-5 py-4 ${
                      answer
                        ? 'bg-white/4 border border-white/6'
                        : 'border border-dashed border-white/10'
                    }`}
                  >
                    {answer ? (
                      <p className="text-white/70 text-sm leading-relaxed italic">
                        "{answer}"
                        {q.question_type === 'scale' && '/10'}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-white/30 text-sm">
                        <FileText size={14} />
                        <span>No answer yet — click the edit button to respond</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {hasAnswered && (
          <motion.p
            className="text-center text-white/30 text-xs pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your answers are private and visible only to your admirer 🔒
          </motion.p>
        )}
      </div>
    </div>
  );
}
