import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, User, HelpCircle, Calendar } from 'lucide-react';
import { questionnaireService } from '../../services/questionnaire.service';
import { SkeletonList } from '../../components/ui/LoadingScreen';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ResponseRow {
  id: string;
  answer: string;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string | null; email: string };
  questions?: { question_text: string };
}

export default function AdminResponses() {
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [filtered, setFiltered] = useState<ResponseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      responses.filter(
        (r) =>
          (r.profiles?.display_name || '').toLowerCase().includes(q) ||
          (r.profiles?.email || '').toLowerCase().includes(q) ||
          (r.questions?.question_text || '').toLowerCase().includes(q) ||
          r.answer.toLowerCase().includes(q)
      )
    );
  }, [search, responses]);

  const loadResponses = async () => {
    setIsLoading(true);
    try {
      const data = await questionnaireService.getAllResponses();
      setResponses(data || []);
      setFiltered(data || []);
    } catch {
      toast.error('Failed to load responses');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-amber-400" />
          <div>
            <h1 className="text-white font-bold text-2xl">Responses</h1>
            <p className="text-white/40 text-sm">{responses.length} total responses</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search responses..."
          className="w-full pl-11 pr-4 py-3 input-romantic text-sm"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center text-white/30">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search ? 'No matching responses' : 'No responses yet'}</p>
        </div>
      )}

      {/* Response cards */}
      <div className="space-y-4">
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            className="glass-card p-5 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* Meta */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <User size={14} className="text-blue-400" />
                <span className="text-white/70 text-sm font-medium">
                  {r.profiles?.display_name || r.profiles?.email || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-white/30" />
                <span className="text-white/30 text-xs">
                  {format(new Date(r.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="flex items-start gap-2">
              <HelpCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-white/60 text-sm font-medium">
                {r.questions?.question_text || 'Unknown question'}
              </p>
            </div>

            {/* Answer */}
            <div className="bg-white/3 rounded-xl px-5 py-4">
              <p className="text-white/80 text-sm italic leading-relaxed">
                "{r.answer}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
