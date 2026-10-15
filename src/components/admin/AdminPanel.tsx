import React, { useState } from 'react';
import { 
  AppStateData, 
  ExamRule, 
  Question, 
  TestimonialFeedback,
  Subject
} from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  Shield, 
  Settings, 
  Database, 
  MessageSquareText, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Plus, 
  Save, 
  Trash2, 
  Lock, 
  Sliders, 
  Check, 
  BookOpen,
  ArrowRight,
  Eye,
  Star
} from 'lucide-react';

interface AdminPanelProps {
  appState: AppStateData;
  onRefresh: () => void;
  onBackToDashboard: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  appState,
  onRefresh,
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'exams' | 'questions' | 'feedbacks' | 'indicators'>('exams');
  const [editingExamId, setEditingExamId] = useState<string>('cpa');
  const [examForm, setExamForm] = useState<ExamRule>(appState.examRules['cpa'] || Object.values(appState.examRules)[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('all');

  const { examRules, questions, feedbacks, attempts, subjects } = appState;

  const handleSelectExamToEdit = (examId: string) => {
    setEditingExamId(examId);
    if (examRules[examId as keyof typeof examRules]) {
      setExamForm(JSON.parse(JSON.stringify(examRules[examId as keyof typeof examRules])));
    }
  };

  const handleSaveExamRule = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateExamRule(editingExamId, examForm);
    setSaveSuccess(true);
    onRefresh();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleFeedback = (id: string) => {
    StorageService.toggleFeedbackApproval(id);
    onRefresh();
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.stem.toLowerCase().includes(questionSearch.toLowerCase()) || q.topic.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesSub = questionSubjectFilter === 'all' || q.subjectId === questionSubjectFilter;
    return matchesSearch && matchesSub;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
              Bredi Exam Engine · Admin
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 font-medium">Motor Universal de Provas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">
            Painel de Administração Demonstrativo
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Configure parâmetros pedagógicos, regras de aprovação, exames multi-carreira e modere depoimentos.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Voltar ao Dashboard</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'exams'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configuração dos Exames ({Object.keys(examRules).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Banco de Questões ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'feedbacks'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Depoimentos & Avaliações ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('indicators')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'indicators'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Indicadores Gerais</span>
        </button>
      </div>

      {/* TAB 1: EXAM RULES CONFIGURATION */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Exam Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(examRules).map(rule => {
              const isSelected = editingExamId === rule.examId;
              return (
                <div
                  key={rule.examId}
                  onClick={() => handleSelectExamToEdit(rule.examId)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {rule.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      {rule.isActive ? 'Exame Ativo' : 'Módulo Demonstrativo (Inativo)'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">{rule.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{rule.description}</p>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    <span>{rule.totalQuestions} questões · {rule.durationMinutes} min</span>
                    <span className="font-semibold text-emerald-700">Corte: {rule.passingScorePercentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSaveExamRule} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Editar Parâmetros: {examForm.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  Alterações serão refletidas nas novas tentativas geradas pelo motor
                </p>
              </div>

              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 animate-in fade-in">
                  Configuração salva com sucesso!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Nome Oficial do Exame</label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={e => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Sigla / Nome Curto</label>
                <input
                  type="text"
                  value={examForm.shortName}
                  onChange={e => setExamForm({ ...examForm, shortName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Quantidade Total de Questões</label>
                <input
                  type="number"
                  value={examForm.totalQuestions}
                  onChange={e => setExamForm({ ...examForm, totalQuestions: parseInt(e.target.value) || 50 })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Duração Máxima (Minutos)</label>
                <input
                  type="number"
                  value={examForm.durationMinutes}
                  onChange={e => setExamForm({ ...examForm, durationMinutes: parseInt(e.target.value) || 150 })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Nota Mínima de Aprovação (%)</label>
                <input
                  type="number"
                  value={examForm.passingScorePercentage}
                  onChange={e => setExamForm({ ...examForm, passingScorePercentage: parseInt(e.target.value) || 70 })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Simulados Gratuitos Permitidos no Free</label>
                <input
                  type="number"
                  value={examForm.maxFreeSimulations}
                  onChange={e => setExamForm({ ...examForm, maxFreeSimulations: parseInt(e.target.value) || 1 })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Versão do Regulamento</label>
                <input
                  type="text"
                  value={examForm.ruleVersion}
                  onChange={e => setExamForm({ ...examForm, ruleVersion: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Fonte / Referência Oficial</label>
                <input
                  type="text"
                  value={examForm.sourceReference}
                  onChange={e => setExamForm({ ...examForm, sourceReference: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Status de Disponibilidade</label>
                <select
                  value={examForm.isActive ? 'active' : 'inactive'}
                  onChange={e => {
                    const activeVal = e.target.value === 'active';
                    setExamForm({ ...examForm, isActive: activeVal, active: activeVal });
                  }}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white"
                >
                  <option value="active">Exame Ativo (Disponível para simulados)</option>
                  <option value="inactive">Exame Desativado (Bloquear novas tentativas)</option>
                </select>
              </div>
            </div>

            {/* Modalidades de Treino Configuráveis */}
            <div className="pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-3">
                Parâmetros das Modalidades de Treino (Bredi Exam Engine)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Treino Direcionado */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">Treino Direcionado</span>
                    <input
                      type="checkbox"
                      checked={examForm.trainingSettings?.targetedTraining?.enabled ?? true}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: {
                            questionCount: examForm.trainingSettings?.targetedTraining?.questionCount ?? 20,
                            durationMinutes: examForm.trainingSettings?.targetedTraining?.durationMinutes ?? 60,
                            enabled: e.target.checked
                          },
                          errorReview: examForm.trainingSettings?.errorReview ?? { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
                          dailyChallenge: examForm.trainingSettings?.dailyChallenge ?? { enabled: true, questionCount: 5, durationMinutes: 15 }
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Qtd. Questões</label>
                    <input
                      type="number"
                      value={examForm.trainingSettings?.targetedTraining?.questionCount ?? 20}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: {
                            enabled: examForm.trainingSettings?.targetedTraining?.enabled ?? true,
                            durationMinutes: examForm.trainingSettings?.targetedTraining?.durationMinutes ?? 60,
                            questionCount: parseInt(e.target.value) || 20
                          },
                          errorReview: examForm.trainingSettings?.errorReview ?? { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
                          dailyChallenge: examForm.trainingSettings?.dailyChallenge ?? { enabled: true, questionCount: 5, durationMinutes: 15 }
                        }
                      })}
                      className="w-full p-2 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Duração (minutos)</label>
                    <input
                      type="number"
                      value={examForm.trainingSettings?.targetedTraining?.durationMinutes ?? 60}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: {
                            enabled: examForm.trainingSettings?.targetedTraining?.enabled ?? true,
                            questionCount: examForm.trainingSettings?.targetedTraining?.questionCount ?? 20,
                            durationMinutes: parseInt(e.target.value) || 60
                          },
                          errorReview: examForm.trainingSettings?.errorReview ?? { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
                          dailyChallenge: examForm.trainingSettings?.dailyChallenge ?? { enabled: true, questionCount: 5, durationMinutes: 15 }
                        }
                      })}
                      className="w-full p-2 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                </div>

                {/* Revisão de Erros */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">Revisão de Erros</span>
                    <input
                      type="checkbox"
                      checked={examForm.trainingSettings?.errorReview?.enabled ?? true}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: examForm.trainingSettings?.targetedTraining ?? { enabled: true, questionCount: 20, durationMinutes: 60 },
                          errorReview: {
                            maxQuestions: examForm.trainingSettings?.errorReview?.maxQuestions ?? 20,
                            minutesPerQuestion: examForm.trainingSettings?.errorReview?.minutesPerQuestion ?? 3,
                            enabled: e.target.checked
                          },
                          dailyChallenge: examForm.trainingSettings?.dailyChallenge ?? { enabled: true, questionCount: 5, durationMinutes: 15 }
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Máx. Questões</label>
                    <input
                      type="number"
                      value={examForm.trainingSettings?.errorReview?.maxQuestions ?? 20}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: examForm.trainingSettings?.targetedTraining ?? { enabled: true, questionCount: 20, durationMinutes: 60 },
                          errorReview: {
                            enabled: examForm.trainingSettings?.errorReview?.enabled ?? true,
                            minutesPerQuestion: examForm.trainingSettings?.errorReview?.minutesPerQuestion ?? 3,
                            maxQuestions: parseInt(e.target.value) || 20
                          },
                          dailyChallenge: examForm.trainingSettings?.dailyChallenge ?? { enabled: true, questionCount: 5, durationMinutes: 15 }
                        }
                      })}
                      className="w-full p-2 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Minutos / Questão</label>
                    <input
                      type="number"
                      value={examForm.trainingSettings?.errorReview?.minutesPerQuestion ?? 3}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: examForm.trainingSettings?.targetedTraining ?? { enabled: true, questionCount: 20, durationMinutes: 60 },
                          errorReview: {
                            enabled: examForm.trainingSettings?.errorReview?.enabled ?? true,
                            maxQuestions: examForm.trainingSettings?.errorReview?.maxQuestions ?? 20,
                            minutesPerQuestion: parseInt(e.target.value) || 3
                          },
                          dailyChallenge: examForm.trainingSettings?.dailyChallenge ?? { enabled: true, questionCount: 5, durationMinutes: 15 }
                        }
                      })}
                      className="w-full p-2 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                </div>

                {/* Desafio Diário */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">Desafio Diário</span>
                    <input
                      type="checkbox"
                      checked={examForm.trainingSettings?.dailyChallenge?.enabled ?? true}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: examForm.trainingSettings?.targetedTraining ?? { enabled: true, questionCount: 20, durationMinutes: 60 },
                          errorReview: examForm.trainingSettings?.errorReview ?? { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
                          dailyChallenge: {
                            questionCount: examForm.trainingSettings?.dailyChallenge?.questionCount ?? 5,
                            durationMinutes: examForm.trainingSettings?.dailyChallenge?.durationMinutes ?? 15,
                            enabled: e.target.checked
                          }
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Qtd. Questões</label>
                    <input
                      type="number"
                      value={examForm.trainingSettings?.dailyChallenge?.questionCount ?? 5}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: examForm.trainingSettings?.targetedTraining ?? { enabled: true, questionCount: 20, durationMinutes: 60 },
                          errorReview: examForm.trainingSettings?.errorReview ?? { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
                          dailyChallenge: {
                            enabled: examForm.trainingSettings?.dailyChallenge?.enabled ?? true,
                            durationMinutes: examForm.trainingSettings?.dailyChallenge?.durationMinutes ?? 15,
                            questionCount: parseInt(e.target.value) || 5
                          }
                        }
                      })}
                      className="w-full p-2 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Duração (minutos)</label>
                    <input
                      type="number"
                      value={examForm.trainingSettings?.dailyChallenge?.durationMinutes ?? 15}
                      onChange={e => setExamForm({
                        ...examForm,
                        trainingSettings: {
                          targetedTraining: examForm.trainingSettings?.targetedTraining ?? { enabled: true, questionCount: 20, durationMinutes: 60 },
                          errorReview: examForm.trainingSettings?.errorReview ?? { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
                          dailyChallenge: {
                            enabled: examForm.trainingSettings?.dailyChallenge?.enabled ?? true,
                            questionCount: examForm.trainingSettings?.dailyChallenge?.questionCount ?? 5,
                            durationMinutes: parseInt(e.target.value) || 15
                          }
                        }
                      })}
                      className="w-full p-2 rounded border border-zinc-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                O Bredi Exam Engine utiliza esta parametrização para calcular aprovações e cronômetros.
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configuração no LocalStorage</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: QUESTION BANK EXPLORER */}
      {activeTab === 'questions' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Banco de Questões Demonstrativas</h3>
              <p className="text-xs text-zinc-500">{filteredQuestions.length} questões encontradas</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={questionSubjectFilter}
                onChange={e => setQuestionSubjectFilter(e.target.value)}
                className="p-2 rounded-lg border border-zinc-300 bg-white"
              >
                <option value="all">Todas as Disciplinas</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={questionSearch}
                onChange={e => setQuestionSearch(e.target.value)}
                placeholder="Filtrar por texto..."
                className="p-2 rounded-lg border border-zinc-300 w-48"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredQuestions.map(q => (
              <div key={q.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-700">{q.id.toUpperCase()}</span>
                    <span>·</span>
                    <span className="font-semibold text-emerald-800">{q.subjectName}</span>
                    <span>·</span>
                    <span className="text-zinc-500">{q.topic}</span>
                  </div>
                  <span className="font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-zinc-900 font-medium mb-2 leading-relaxed">{q.stem}</p>
                <div className="text-emerald-700 font-semibold mb-1">
                  Correta: {String.fromCharCode(65 + q.correctOptionIndex)}) {q.options[q.correctOptionIndex]}
                </div>
                <div className="text-zinc-500 text-[11px] leading-relaxed">
                  <strong>Justificativa: </strong>{q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK MODERATION */}
      {activeTab === 'feedbacks' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-zinc-100">
            <h3 className="text-base font-bold text-zinc-900">Moderação de Avaliações & Depoimentos</h3>
            <p className="text-xs text-zinc-500">
              Avaliações enviadas por alunos com consentimento expresso. Aprove para exibir na landing page.
            </p>
          </div>

          <div className="divide-y divide-zinc-100">
            {feedbacks.map(fb => (
              <div key={fb.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-900">{fb.userName}</h4>
                    <span className="text-xs text-zinc-400">· {fb.userRole}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 ml-2">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 mt-1 italic">"{fb.comment}"</p>
                  {fb.improvementText && (
                    <p className="text-xs text-zinc-500 mt-1">
                      <strong>Sugestão interna: </strong>{fb.improvementText}
                    </p>
                  )}
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Autorização concedida: {fb.consentedToPublish ? 'Sim' : 'Não'} · {new Date(fb.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleFeedback(fb.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      fb.approvedForDisplay
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    {fb.approvedForDisplay ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{fb.approvedForDisplay ? 'Publicado na Landing' : 'Oculto (Aprovar)'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL ENGINE INDICATORS */}
      {activeTab === 'indicators' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500">Total de Questões Cadastradas</span>
            <span className="text-3xl font-extrabold text-zinc-900 mt-1 block">{questions.length}</span>
            <span className="text-[11px] text-zinc-400 mt-1 block">Distribuídas em 7 disciplinas</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500">Tentativas Registradas no LocalStorage</span>
            <span className="text-3xl font-extrabold text-zinc-900 mt-1 block">{attempts.length}</span>
            <span className="text-[11px] text-zinc-400 mt-1 block">Persistência 100% no navegador</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500">Média Geral dos Alunos</span>
            <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">67.8%</span>
            <span className="text-[11px] text-zinc-400 mt-1 block">Base de demonstração ativa</span>
          </div>
        </div>
      )}
    </div>
  );
};
