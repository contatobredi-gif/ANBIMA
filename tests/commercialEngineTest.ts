import { StorageService } from '../src/services/storageService';
import { AccessControlService } from '../src/services/accessControlService';
import { ExamEngine } from '../src/services/examEngine';
import { INITIAL_APP_STATE } from '../src/data/initialData';

// Polyfill localStorage in Node test environment
if (typeof localStorage === 'undefined' || !global.localStorage) {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

console.log('================================================================');
console.log('INICIANDO TESTES DO MODELO COMERCIAL MULTI-EXAME (PROMPT 2 & 2.1)');
console.log('================================================================');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ [TEST PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [TEST FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

// Setup initial state
StorageService.restoreInitialData();

// 1. Catálogo e Preços
const cpaProPlan = AccessControlService.getPlanById('plan-cpa-pro');
assert(
  cpaProPlan !== null && cpaProPlan.priceCents === 2990 && cpaProPlan.type === 'Pro' && cpaProPlan.isActive === true,
  'Plano Pro da CPA custa exatamente R$ 29,90 (2990 centavos) e está ativo no catálogo'
);

const oabProPlan = AccessControlService.getPlanById('plan-oab-pro');
assert(
  oabProPlan !== null && oabProPlan.priceCents === null && oabProPlan.isActive === false,
  'Plano Pro da OAB possui priceCents null (preço a definir) e contratação pública desativada'
);

// 2. Estado Inicial do Usuário: CPA Pro e OAB Free
assert(
  AccessControlService.isPro('cpa') === true,
  'Usuário demonstrativo inicial possui CPA com Plano Pro ativo'
);

assert(
  AccessControlService.isPro('oab') === false,
  'Usuário demonstrativo inicial possui OAB com Plano Free (isolamento entre exames)'
);

// 3. Isolamento Total: Alterar CPA não afeta OAB
AccessControlService.cancelSubscription('cpa');
assert(
  AccessControlService.isPro('cpa') === false,
  'Cancelamento da assinatura de CPA torna CPA Free'
);
assert(
  AccessControlService.isPro('oab') === false,
  'Cancelamento da assinatura de CPA mantém OAB inalterada'
);

// Reativar CPA
AccessControlService.reactivateSubscription('cpa');
assert(
  AccessControlService.isPro('cpa') === true,
  'Reativação da assinatura de CPA restaura status Pro com nova vigência'
);
assert(
  AccessControlService.isPro('oab') === false,
  'Reativação de CPA não contamina nem altera status da OAB'
);

// 4. Bloqueio de Contratação da OAB (sem preço / desativado)
try {
  AccessControlService.subscribeToExam('oab');
  assert(false, 'Tentativa de assinar OAB Pro deveria disparar exceção');
} catch (err: any) {
  assert(
    err.message.includes('desativado') || err.message.includes('preço comercial'),
    'Tentativa de contratar OAB Pro é rejeitada com mensagem clara sobre exame/plano indisponível',
    err.message
  );
}

// 5. Tentativa de Contratar Exame Inexistente
try {
  AccessControlService.subscribeToExam('exame_inexistente' as any);
  assert(false, 'Contratar exame inexistente deveria falhar');
} catch (err: any) {
  assert(
    err.message.includes('não encontrado'),
    'Contratação de exame inexistente rejeitada sem fallback silencioso',
    err.message
  );
}

// 6. Limite de Simulados Free na OAB
// A OAB desativada não permite simulados
const oabInactiveAccess = AccessControlService.canStartSimulation('oab');
assert(
  oabInactiveAccess.allowed === false,
  'Exame OAB desativado bloqueia início de simulado'
);

// Se a OAB for ativada no catálogo, em modo Free ela concede exatamente maxFreeSimulations (1)
const testState = StorageService.getState();
testState.examRules['oab'].isActive = true;
testState.attempts = testState.attempts.filter(a => a.examId !== 'oab');
StorageService.saveState(testState);

const oabActiveFreeAccess = AccessControlService.canStartSimulation('oab');
assert(
  oabActiveFreeAccess.allowed === true && oabActiveFreeAccess.remainingFree === 1,
  'Exame OAB ativo no Plano Free concede exatamente 1 simulado gratuito inicial'
);

// Restaurar OAB para desativada
testState.examRules['oab'].isActive = false;
StorageService.saveState(testState);

// 7. Simular que o usuário atingiu o limite Free na CPA quando em modo Free
AccessControlService.cancelSubscription('cpa'); // CPA vira Free
// O usuário Rafael Martins já tem 4 tentativas FULL_EXAM em CPA
const cpaFreeCheck = AccessControlService.canStartSimulation('cpa');
assert(
  cpaFreeCheck.allowed === false && cpaFreeCheck.remainingFree === 0,
  'No Plano Free da CPA, após esgotar o limite, canStartSimulation bloqueia com allowed: false'
);

// 8. O motor ExamEngine.startSession barra a tentativa comercialmente
try {
  StorageService.setSelectedExam('cpa');
  ExamEngine.startSession('FULL_EXAM');
  assert(false, 'ExamEngine deveria rejeitar início de simulado após limite esgotado');
} catch (err: any) {
  assert(
    err.message.includes('Limite de simulados') || err.message.includes('gratuito'),
    'ExamEngine respeita barreira comercial do AccessControlService',
    err.message
  );
}

// 9. Restaurar Pro e verificar que volta a permitir ilimitado
AccessControlService.subscribeToExam('cpa');
assert(
  AccessControlService.isPro('cpa') === true,
  'Contratação de Pro para CPA bem-sucedida'
);
const cpaProCheck = AccessControlService.canStartSimulation('cpa');
assert(
  cpaProCheck.allowed === true,
  'Com Plano Pro ativo, simulados da CPA tornam-se ilimitados'
);

// 10. Migração de preço de LocalStorage: se houver 4990 antigo no storage, migra para 2990
const stateWithOldPrice = StorageService.getState();
const oldCpa = stateWithOldPrice.examPlans.find(p => p.id === 'plan-cpa-pro');
if (oldCpa) oldCpa.priceCents = 4990;
StorageService.saveState(stateWithOldPrice);

// Limpar cache em memória para forçar nova leitura e ciclo de migração do LocalStorage
StorageService.clearCache();
const migratedState = StorageService.getState();
const migratedCpa = migratedState.examPlans.find(p => p.id === 'plan-cpa-pro');
assert(
  migratedCpa?.priceCents === 2990,
  'Migração de LocalStorage converte preço demonstrativo antigo de 4990 para 2990 automaticamente'
);

console.log('================================================================');
console.log(`RESULTADO COMERCIAL: ${passed} PASSADOS | ${failed} FALHADOS`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
