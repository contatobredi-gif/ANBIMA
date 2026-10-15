/**
 * Testes de Regressão Automatizados do Bredi Exam Engine v5.0
 * Prompt 1.1 — Validação dos 12 requisitos obrigatórios
 */

import { ExamEngine } from '../src/services/examEngine';
import { StorageService } from '../src/services/storageService';
import { INITIAL_APP_STATE, INITIAL_EXAM_RULES } from '../src/data/initialData';
import { AppStateData, Attempt, ActiveExamSession } from '../src/types';

// Mock in-memory LocalStorage simulating browser environment
let mockStorage: Record<string, string> = {};

(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    mockStorage = {};
  }
};

(global as any).window = {
  dispatchEvent: () => true
};

function resetToSeed(): AppStateData {
  StorageService.clearCache();
  const seed = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
  mockStorage['simulados_anbima_engine_v1'] = JSON.stringify(seed);
  return StorageService.getState();
}

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testNum: number, description: string) {
  if (condition) {
    console.log(`✅ [TEST ${testNum.toString().padStart(2, '0')}] PASS: ${description}`);
    passedTests++;
  } else {
    console.error(`❌ [TEST ${testNum.toString().padStart(2, '0')}] FAIL: ${description}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('INICIANDO SUÍTE DE TESTES DE REGRESSÃO — BREDI EXAM ENGINE V5.0');
console.log('================================================================\n');

// 1. CPA inicia um simulado completo de 50 questões
try {
  resetToSeed();
  const session = ExamEngine.startSession('FULL_EXAM', undefined, 'cpa');
  assert(
    session.questionIds.length === 50 && session.mode === 'FULL_EXAM' && session.examId === 'cpa',
    1,
    'CPA inicia um simulado completo de 50 questões respeitando a matriz curricular.'
  );
} catch (e: any) {
  assert(false, 1, `Erro inesperado: ${e.message}`);
}

// 2. CPA inicia um treino de Matemática Financeira com exatamente 20 questões
try {
  resetToSeed();
  const session = ExamEngine.startSession('TARGETED_TRAINING', 'mat_fin', 'cpa');
  assert(
    session.questionIds.length === 20 && session.mode === 'TARGETED_TRAINING' && session.targetSubjectId === 'mat_fin',
    2,
    'CPA inicia um treino de Matemática Financeira com exatamente 20 questões.'
  );
} catch (e: any) {
  assert(false, 2, `Erro inesperado: ${e.message}`);
}

// 3. Alterar questionCount para 10 resulta em treino com exatamente 10 questões
try {
  resetToSeed();
  StorageService.updateExamRule('cpa', {
    trainingSettings: {
      targetedTraining: { enabled: true, questionCount: 10, durationMinutes: 60 },
      errorReview: { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
      dailyChallenge: { enabled: true, questionCount: 5, durationMinutes: 15 }
    }
  });
  const session = ExamEngine.startSession('TARGETED_TRAINING', 'mat_fin', 'cpa');
  assert(
    session.questionIds.length === 10,
    3,
    'Alterar questionCount para 10 resulta dinamicamente em treino com exatamente 10 questões.'
  );
} catch (e: any) {
  assert(false, 3, `Erro inesperado: ${e.message}`);
}

// 4. Alterar durationMinutes modifica corretamente o cronômetro das novas tentativas
try {
  resetToSeed();
  StorageService.updateExamRule('cpa', {
    trainingSettings: {
      targetedTraining: { enabled: true, questionCount: 20, durationMinutes: 45 },
      errorReview: { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
      dailyChallenge: { enabled: true, questionCount: 5, durationMinutes: 15 }
    }
  });
  const session = ExamEngine.startSession('TARGETED_TRAINING', 'mat_fin', 'cpa');
  const remaining = ExamEngine.getRemainingSeconds(session);
  // Total duration in seconds: 45 * 60 = 2700
  assert(
    session.totalDurationSeconds === 2700 && remaining >= 2698 && remaining <= 2700,
    4,
    'Alterar durationMinutes para 45min modifica corretamente o cronômetro (2700s) das novas tentativas.'
  );
} catch (e: any) {
  assert(false, 4, `Erro inesperado: ${e.message}`);
}

// 5. Exame inexistente não utiliza regras da CPA
try {
  resetToSeed();
  let caughtError = false;
  try {
    ExamEngine.startSession('FULL_EXAM', undefined, 'exame_fantasma' as any);
  } catch (err: any) {
    caughtError = err.message.includes('Não foi possível iniciar a prova');
  }
  assert(
    caughtError,
    5,
    'Exame inexistente ("exame_fantasma") rejeita início sem fallback silencioso para CPA.'
  );
} catch (e: any) {
  assert(false, 5, `Erro inesperado: ${e.message}`);
}

// 6. Exame desativado não permite criar novas tentativas
try {
  resetToSeed();
  // OAB está configurada com isActive: false
  let caughtError = false;
  try {
    ExamEngine.startSession('FULL_EXAM', undefined, 'oab');
  } catch (err: any) {
    caughtError = err.message.includes('ainda não está disponível');
  }
  assert(
    caughtError,
    6,
    'Exame desativado (OAB isActive: false) bloqueia a criação de novas tentativas com mensagem clara.'
  );
} catch (e: any) {
  assert(false, 6, `Erro inesperado: ${e.message}`);
}

// 7. Modalidade desabilitada é bloqueada
try {
  resetToSeed();
  StorageService.updateExamRule('cpa', {
    trainingSettings: {
      targetedTraining: { enabled: false, questionCount: 20, durationMinutes: 60 },
      errorReview: { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
      dailyChallenge: { enabled: true, questionCount: 5, durationMinutes: 15 }
    }
  });
  let caughtError = false;
  try {
    ExamEngine.startSession('TARGETED_TRAINING', 'mat_fin', 'cpa');
  } catch (err: any) {
    caughtError = err.message.includes('não está habilitada');
  }
  assert(
    caughtError,
    7,
    'Modalidade desabilitada (targetedTraining.enabled = false) é estritamente bloqueada pelo motor.'
  );
} catch (e: any) {
  assert(false, 7, `Erro inesperado: ${e.message}`);
}

// 8. Tentativa anterior mantém suas regras e questões originais
try {
  resetToSeed();
  // Inicia e finaliza com regras vigentes
  const session = ExamEngine.startSession('FULL_EXAM', undefined, 'cpa');
  const attempt = ExamEngine.finalizeSession(session);
  const originalQuestions = attempt.totalQuestions;
  const originalRule = attempt.ruleSnapshot;

  // Modifica regra do exame para 60 questões e nova versão
  StorageService.updateExamRule('cpa', {
    totalQuestions: 60,
    ruleVersion: 'Regulamento 2027.0 - Futuro'
  });

  // Consulta tentativa persistida
  const loadedAttempt = StorageService.getAttemptById(attempt.id);
  assert(
    loadedAttempt !== undefined &&
    loadedAttempt.totalQuestions === originalQuestions &&
    loadedAttempt.ruleSnapshot?.totalQuestions === 50 &&
    loadedAttempt.ruleVersion === originalRule?.ruleVersion,
    8,
    'Tentativa anterior mantém imutáveis suas regras, questões e snapshots originais após alteração da regra.'
  );
} catch (e: any) {
  assert(false, 8, `Erro inesperado: ${e.message}`);
}

// 9. Atualizar a página não perde respostas
try {
  resetToSeed();
  const session = ExamEngine.startSession('FULL_EXAM', undefined, 'cpa');
  const qId1 = session.questionIds[0];
  const qId2 = session.questionIds[1];

  // Aluno respondeu questão 1 (opção 2) e questão 2 (opção 0)
  session.answers[qId1] = 2;
  session.answers[qId2] = 0;
  StorageService.saveActiveSession(session);

  // Simula reabertura / reload lendo do LocalStorage através do StorageService
  const restoredSession = StorageService.getActiveSession();
  assert(
    restoredSession !== null &&
    restoredSession.answers[qId1] === 2 &&
    restoredSession.answers[qId2] === 0 &&
    restoredSession.id === session.id,
    9,
    'Atualização da página preserva integralmente as respostas marcadas na sessão ativa.'
  );
} catch (e: any) {
  assert(false, 9, `Erro inesperado: ${e.message}`);
}

// 10. Finalizar repetidamente não cria duplicidades
try {
  resetToSeed();
  const session = ExamEngine.startSession('FULL_EXAM', undefined, 'cpa');
  const initialAttemptsCount = StorageService.getAttempts().length;

  const attempt1 = ExamEngine.finalizeSession(session);
  const countAfterFirst = StorageService.getAttempts().length;

  // Chamada duplicada (ex: duplo clique ou múltiplos gatilhos)
  const attempt2 = ExamEngine.finalizeSession(session);
  const countAfterSecond = StorageService.getAttempts().length;

  assert(
    countAfterFirst === initialAttemptsCount + 1 &&
    countAfterSecond === countAfterFirst &&
    attempt1.id === attempt2.id,
    10,
    'Finalizar repetidamente é idempotente e impede duplicação de tentativas no histórico.'
  );
} catch (e: any) {
  assert(false, 10, `Erro inesperado: ${e.message}`);
}

// 11. Falta de questões aprovadas impede iniciar um treino incompleto
try {
  resetToSeed();
  // Altera cota de questões para 100 em Matemática Financeira (banco tem 42)
  StorageService.updateExamRule('cpa', {
    trainingSettings: {
      targetedTraining: { enabled: true, questionCount: 100, durationMinutes: 60 },
      errorReview: { enabled: true, maxQuestions: 20, minutesPerQuestion: 3 },
      dailyChallenge: { enabled: true, questionCount: 5, durationMinutes: 15 }
    }
  });

  let caughtError = false;
  try {
    ExamEngine.startSession('TARGETED_TRAINING', 'mat_fin', 'cpa');
  } catch (err: any) {
    caughtError = err.message.includes('Questões insuficientes');
  }
  assert(
    caughtError,
    11,
    'Falta de questões aprovadas suficientes (necessárias 100, disponíveis 42) bloqueia o início do treino.'
  );
} catch (e: any) {
  assert(false, 11, `Erro inesperado: ${e.message}`);
}

// 12. Histórico existente permanece após migração
try {
  // Simula estado legado com estrutura anterior no LocalStorage (sem trainingSettings, sem ruleSnapshot)
  const legacyState = {
    user: {
      id: 'legacy-user',
      name: 'Aluno Antigo',
      email: 'antigo@exemplo.com',
      plan: 'Pro',
      selectedExamId: 'cpa',
      consecutiveDays: 14,
      lastActiveDate: '2026-10-10',
      engagementPoints: 850
    },
    attempts: [
      {
        id: 'legacy-att-01',
        userId: 'legacy-user',
        examId: 'cpa',
        mode: 'FULL_EXAM',
        startedAt: '2026-10-01T10:00:00Z',
        finishedAt: '2026-10-01T12:00:00Z',
        durationSeconds: 7200,
        totalQuestions: 50,
        correctCount: 35,
        wrongCount: 15,
        unansweredCount: 0,
        scorePercentage: 70,
        passed: true,
        answers: [],
        disciplineScores: []
      }
    ],
    examRules: {
      cpa: {
        examId: 'cpa',
        name: 'CPA Legada',
        shortName: 'CPA',
        description: 'Regra legada',
        totalQuestions: 50,
        durationMinutes: 150,
        passingScorePercentage: 70,
        ruleVersion: 'Regulamento 2025',
        sourceReference: 'Fonte Antiga',
        effectiveDate: '01/01/2025',
        enabledDisciplines: ['mat_fin'],
        maxFreeSimulations: 1,
        isActive: true,
        category: 'Certificação Financeira'
        // Sem trainingSettings!
      }
    }
  };

  mockStorage['simulados_anbima_engine_v1'] = JSON.stringify(legacyState);
  StorageService.clearCache();
  // Invoca migração via StorageService.getState()
  const migratedState = StorageService.getState();

  assert(
    migratedState.attempts.length === 1 &&
    migratedState.attempts[0].id === 'legacy-att-01' &&
    migratedState.user.name === 'Aluno Antigo' &&
    migratedState.examRules['cpa'].trainingSettings !== undefined &&
    migratedState.examRules['cpa'].trainingSettings.targetedTraining.questionCount === 20 &&
    migratedState.examRules['cpa'].active === true,
    12,
    'Migração do LocalStorage preserva tentativas, perfil e histórico, preenchendo novos parâmetros com segurança.'
  );
} catch (e: any) {
  assert(false, 12, `Erro inesperado: ${e.message}`);
}

console.log('\n================================================================');
console.log(`RESULTADO FINAL DOS TESTES: ${passedTests} PASSADOS | ${failedTests} FALHADOS`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
