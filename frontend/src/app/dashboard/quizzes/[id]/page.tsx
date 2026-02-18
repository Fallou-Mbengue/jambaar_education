'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { Quiz } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';

const questionSchema = z.object({
  question: z.string().min(1, 'Question requise'),
  choices: z.string().min(1, 'Choix requis'),
  correctAnswer: z.coerce.number().min(0),
  explanation: z.string().optional(),
});

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteQuestion, setDeleteQuestion] = useState<string | null>(null);

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: ['admin-quizzes', id],
    queryFn: () => api.get(`/dashboard/quizzes/${id}`),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(questionSchema),
  });

  const addQuestion = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        choices: data.choices.split('|').map((c: string) => c.trim()),
      };
      return api.post(`/dashboard/quizzes/${id}/questions`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes', id] });
      toast.success('Question ajoutée');
      setShowAdd(false);
      reset();
    },
  });

  const removeQuestion = useMutation({
    mutationFn: (qid: string) => api.delete(`/dashboard/quizzes/${id}/questions/${qid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes', id] });
      toast.success('Question supprimée');
      setDeleteQuestion(null);
    },
  });

  if (isLoading) return <div className="animate-pulse p-6"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;
  if (!quiz) return <div>Quiz non trouvé</div>;

  return (
    <div>
      <PageHeader
        title={quiz.title}
        action={
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{quiz._count?.attempts || 0} tentatives</span>
            <Link href="/dashboard/quizzes" className="btn-secondary">Retour</Link>
          </div>
        }
      />

      {quiz.content && <p className="text-sm text-gray-500 mb-4">Lié au contenu : {quiz.content.title}</p>}
      {quiz.module && <p className="text-sm text-gray-500 mb-4">Lié au module : {quiz.module.title}</p>}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Questions ({quiz.questions?.length || 0})</h3>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Ajouter question
          </button>
        )}
      </div>

      <div className="space-y-3">
        {quiz.questions?.map((q, idx) => (
          <div key={q.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">{idx + 1}. {q.question}</p>
                <div className="space-y-1">
                  {(q.choices as string[]).map((choice, ci) => (
                    <div key={ci} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${ci === q.correctAnswer ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'}`}>
                      {ci === q.correctAnswer && <CheckCircle className="w-3 h-3" />}
                      {choice}
                    </div>
                  ))}
                </div>
                {q.explanation && <p className="text-xs text-gray-400 mt-2">Explication : {q.explanation}</p>}
              </div>
              {isAdmin && (
                <button onClick={() => setDeleteQuestion(q.id)} className="p-1 hover:bg-red-50 rounded text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Ajouter une question">
        <form onSubmit={handleSubmit((d) => addQuestion.mutate(d))} className="space-y-4">
          <div>
            <label className="label-field">Question *</label>
            <input {...register('question')} className="input-field" />
            {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message}</p>}
          </div>
          <div>
            <label className="label-field">Choix (séparés par |)</label>
            <input {...register('choices')} className="input-field" placeholder="var | let | const | define" />
            {errors.choices && <p className="text-red-500 text-xs mt-1">{errors.choices.message}</p>}
          </div>
          <div>
            <label className="label-field">Index bonne réponse (commence à 0)</label>
            <input {...register('correctAnswer')} type="number" className="input-field" />
          </div>
          <div>
            <label className="label-field">Explication</label>
            <textarea {...register('explanation')} className="input-field" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={addQuestion.isPending}>Ajouter</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteQuestion}
        onClose={() => setDeleteQuestion(null)}
        onConfirm={() => deleteQuestion && removeQuestion.mutate(deleteQuestion)}
        title="Supprimer la question"
        message="Êtes-vous sûr de vouloir supprimer cette question ?"
        confirmLabel="Supprimer"
        variant="danger"
        loading={removeQuestion.isPending}
      />
    </div>
  );
}
