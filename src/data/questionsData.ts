import { Question, Subject } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'mat_fin',
    name: 'Matemática Financeira',
    shortName: 'Mat. Financeira',
    weightPercentage: 15,
    topics: ['Juros Simples e Compostos', 'Taxa Nominal e Taxa Efetiva', 'Desconto Racional e Comercial', 'Valor Presente Líquido (VPL) e TIR', 'Duration e Convexidade'],
    recommendedQuestionCount: 8,
  },
  {
    id: 'fundos_inv',
    name: 'Fundos de Investimento',
    shortName: 'Fundos de Inv.',
    weightPercentage: 20,
    topics: ['Classificação CVM', 'Come-cotas e Tributação', 'Marcação a Mercado (MaM)', 'Políticas de Resgate e Cotização', 'Taxas de Administração e Performance'],
    recommendedQuestionCount: 10,
  },
  {
    id: 'renda_fixa_var',
    name: 'Instrumentos de Renda Fixa e Variável',
    shortName: 'Renda Fixa e Variável',
    weightPercentage: 20,
    topics: ['Tesouro Direto e Títulos Públicos', 'CDB, LCI, LCA e Debêntures', 'Ações, Dividendos e JCP', 'Derivativos Básicos e Hedge'],
    recommendedQuestionCount: 10,
  },
  {
    id: 'sfn_mercado',
    name: 'Sistema Financeiro Nacional e Participantes',
    shortName: 'SFN e Participantes',
    weightPercentage: 15,
    topics: ['Estrutura do CMN e BACEN', 'Atuação da CVM e ANBIMA', 'Instituições Financeiras e Intermediários', 'Bancos Múltiplos e Corretoras'],
    recommendedQuestionCount: 8,
  },
  {
    id: 'previdencia',
    name: 'Previdência Complementar Aberta',
    shortName: 'Previdência Aberta',
    weightPercentage: 10,
    topics: ['Diferenças entre PGBL e VGBL', 'Regimes Tributários: Progressivo e Regressivo', 'Portabilidade e Resgates'],
    recommendedQuestionCount: 5,
  },
  {
    id: 'risco_compliance',
    name: 'Gestão de Risco, Compliance e PLD-FT',
    shortName: 'Risco e Compliance',
    weightPercentage: 10,
    topics: ['Risco de Mercado, Crédito e Liquidez', 'Prevenção à Lavagem de Dinheiro (Lei 9.613)', 'Princípio Conheça seu Cliente (KYC)', 'Chinese Wall e Conflito de Interesses'],
    recommendedQuestionCount: 5,
  },
  {
    id: 'economia_fin',
    name: 'Conceitos de Economia e Finanças',
    shortName: 'Economia e Finanças',
    weightPercentage: 10,
    topics: ['Indicadores Econômicos: IPCA, IGP-M e PIB', 'Taxa Selic, CDI e Política Monetária', 'Copom e Metas para Inflação', 'Câmbio e Balanço de Pagamentos'],
    recommendedQuestionCount: 4,
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- MATEMÁTICA FINANCEIRA (12 questões) ---
  {
    id: 'mf-01',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Juros Simples e Compostos',
    difficulty: 'Fácil',
    stem: 'Um investidor aplicou R$ 10.000,00 a uma taxa de juros compostos de 10% ao ano pelo período de 2 anos. Qual o montante final resgatado ao término da operação?',
    options: [
      'R$ 12.000,00',
      'R$ 12.100,00',
      'R$ 11.000,00',
      'R$ 12.210,00'
    ],
    correctOptionIndex: 1,
    explanation: 'Em juros compostos a fórmula é M = C × (1 + i)^n. M = 10.000 × (1 + 0,10)^2 = 10.000 × 1,21 = R$ 12.100,00.'
  },
  {
    id: 'mf-02',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Taxa Nominal e Taxa Efetiva',
    difficulty: 'Médio',
    stem: 'Uma instituição financeira divulga uma taxa de empréstimo de 12% ao ano com capitalização mensal. Como essa taxa divulgada e a taxa calculada no período anual devem ser classificadas?',
    options: [
      'A taxa de 12% a.a. é a taxa efetiva e a taxa anual resultante é a taxa nominal.',
      'A taxa de 12% a.a. é uma taxa nominal, enquanto a taxa anual composta decorrente da capitalização mensal é a taxa efetiva.',
      'Ambas as taxas são consideradas equivalentes contínuas sob o regime de juros simples.',
      'A taxa nominal é sempre calculada após descontar os efeitos da inflação do período.'
    ],
    correctOptionIndex: 1,
    explanation: 'Quando a unidade de tempo da taxa (ano) difere da unidade de tempo da capitalização (mês), a taxa informada é nominal. A taxa apurada com a capitalização efetiva dos 1% ao mês ao longo dos 12 meses resulta na taxa efetiva de aprox. 12,68% a.a.'
  },
  {
    id: 'mf-03',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Valor Presente Líquido (VPL) e TIR',
    difficulty: 'Difícil',
    stem: 'Ao avaliar dois projetos de investimento mutuamente excludentes com mesma taxa mínima de atratividade (TMA), o analista observou que o Projeto Alfa tem VPL maior, enquanto o Projeto Beta tem maior Taxa Interna de Retorno (TIR). Qual critério deve prevalecer para maximizar a riqueza do investidor?',
    options: [
      'O critério da TIR deve sempre prevalecer por representar a taxa percentual de retorno.',
      'O critério do VPL deve prevalecer, pois mede diretamente o acréscimo absoluto de valor econômico.',
      'Deve-se optar pelo projeto com menor prazo de payback simples, desconsiderando ambos.',
      'Os dois projetos são indiferentes quando o VPL é estritamente positivo.'
    ],
    correctOptionIndex: 1,
    explanation: 'Em situações de conflito entre VPL e TIR em projetos mutuamente excludentes, a regra do VPL prevalece, pois indica o valor monetário absoluto agregado ao patrimônio do investidor.'
  },
  {
    id: 'mf-04',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Duration e Convexidade',
    difficulty: 'Difícil',
    stem: 'A Duration de Macaulay de um título de renda fixa mede:',
    options: [
      'O prazo total legal até a data de vencimento final do título.',
      'O prazo médio ponderado pelo valor presente dos fluxos de caixa para recuperação do capital investido.',
      'A taxa de juros nominal negociada na emissão primária do papel.',
      'O spread de crédito de contraparte exigido pelo mercado secundário.'
    ],
    correctOptionIndex: 1,
    explanation: 'A Duration de Macaulay representa a média ponderada dos prazos de cada fluxo de caixa, tendo como ponderador o valor presente de cada parcela em relação ao preço atual do título.'
  },
  {
    id: 'mf-05',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Juros Simples e Compostos',
    difficulty: 'Fácil',
    stem: 'Em um regime de capitalização simples, o juro produzido em cada período sucessivo sobre o mesmo capital inicial é:',
    options: [
      'Crescente de forma exponencial.',
      'Constante, calculado exclusivamente sobre o principal inicial.',
      'Decrescente em razão da amortização acumulada.',
      'Variável conforme a oscilação da taxa DI do período.'
    ],
    correctOptionIndex: 1,
    explanation: 'No regime de juros simples, os juros de cada período são apurados apenas sobre o principal inicial (J = C × i × t), permanecendo constantes.'
  },
  {
    id: 'mf-06',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Taxa Nominal e Taxa Efetiva',
    difficulty: 'Médio',
    stem: 'Duas taxas de juros são ditas equivalentes sob o regime de juros compostos quando:',
    options: [
      'Apresentam a mesma taxa percentual com o mesmo prazo de referência.',
      'Aplicadas ao mesmo capital inicial durante o mesmo intervalo de tempo total, geram o mesmo montante final.',
      'Possuem proporcionalidade linear direta entre seus prazos (regra de três simples).',
      'São regulamentadas pelo mesmo indexador de inflação.'
    ],
    correctOptionIndex: 1,
    explanation: 'No regime composto, taxas equivalentes produzem o mesmo valor futuro (montante) a partir do mesmo capital inicial quando aplicadas por períodos iguais no tempo.'
  },
  {
    id: 'mf-07',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Desconto Racional e Comercial',
    difficulty: 'Médio',
    stem: 'Qual a principal distinção técnica entre o Desconto Racional (por dentro) e o Desconto Comercial (por fora)?',
    options: [
      'O desconto racional incide sobre o valor nominal do título, enquanto o comercial incide sobre o valor presente.',
      'O desconto racional incide sobre o valor atual (presente), enquanto o desconto comercial incide sobre o valor nominal (futuro).',
      'O desconto comercial sempre gera um encargo financeiro menor do que o desconto racional.',
      'Ambos utilizam a mesma base de cálculo, mudando apenas a alíquota de IOF.'
    ],
    correctOptionIndex: 1,
    explanation: 'O Desconto Racional calcula os juros sobre o valor atual (valor descontado), sendo o modelo financeiramente correto; já o Desconto Comercial calcula os juros sobre o valor nominal (valor de face futuro), gerando uma taxa efetiva maior.'
  },
  {
    id: 'mf-08',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Duration e Convexidade',
    difficulty: 'Difícil',
    stem: 'Considerando dois títulos públicos com mesmo vencimento de 5 anos: o Título A é zero cupom (LTN) e o Título B paga cupons semestrais de juros (NTN-F). Em relação à duration desses títulos:',
    options: [
      'A duration do Título A é menor que a duration do Título B.',
      'A duration do Título A é igual a 5 anos e é estritamente maior que a duration do Título B.',
      'Ambos possuem exatamente a mesma duration de 5 anos.',
      'A duration do Título B é maior porque há mais pagamentos ao longo do tempo.'
    ],
    correctOptionIndex: 1,
    explanation: 'Para títulos zero cupom, a duration é exatamente igual ao prazo de vencimento (5 anos). Títulos que pagam cupons antecipam o retorno de fluxos de caixa, reduzindo o prazo médio ponderado (duration < 5 anos).'
  },
  {
    id: 'mf-09',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Valor Presente Líquido (VPL) e TIR',
    difficulty: 'Médio',
    stem: 'Se a Taxa Interna de Retorno (TIR) de um projeto é exatamente igual à Taxa Mínima de Atratividade (TMA), qual é o Valor Presente Líquido (VPL)?',
    options: [
      'O VPL é estritamente positivo.',
      'O VPL é igual a zero.',
      'O VPL é negativo.',
      'O VPL é indeterminado sem o conhecimento do prazo total.'
    ],
    correctOptionIndex: 1,
    explanation: 'Por definição matemática, a TIR é a taxa de desconto que iguala a soma dos fluxos de caixa descontados ao investimento inicial, tornando o VPL igual a zero.'
  },
  {
    id: 'mf-10',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Taxa Nominal e Taxa Efetiva',
    difficulty: 'Fácil',
    stem: 'Se um investimento rende 1% ao mês no regime de juros compostos durante 12 meses, a taxa anual acumulada será:',
    options: [
      'Exatamente 12,00% ao ano.',
      'Superior a 12,00% ao ano (aproximadamente 12,68% a.a.).',
      'Inferior a 12,00% ao ano devido à corrosão inflacionária.',
      'Exatamente 13,00% ao ano.'
    ],
    correctOptionIndex: 1,
    explanation: '(1 + 0,01)^12 - 1 = 1,126825 - 1 ≈ 12,68% a.a., devido ao efeito cumulativo dos juros sobre juros.'
  },
  {
    id: 'mf-11',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Juros Simples e Compostos',
    difficulty: 'Médio',
    stem: 'Qual é o montante acumulado de um capital de R$ 5.000,00 aplicado a juros simples de 2% ao mês durante 5 meses?',
    options: [
      'R$ 5.500,00',
      'R$ 5.520,40',
      'R$ 5.400,00',
      'R$ 5.600,00'
    ],
    correctOptionIndex: 0,
    explanation: 'J = C × i × t = 5.000 × 0,02 × 5 = R$ 500. Montante = C + J = 5.000 + 500 = R$ 5.500,00.'
  },
  {
    id: 'mf-12',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Duration e Convexidade',
    difficulty: 'Difícil',
    stem: 'Quando as taxas de juros de mercado sobem bruscamente, o que acontece com o preço de mercado (PU) de um título prefixado de longo prazo?',
    options: [
      'O preço unitário (PU) sobe na mesma proporção.',
      'O preço unitário (PU) cai, e quanto maior a duration do título, maior é a queda de preço.',
      'O preço unitário permanece inalterado, pois o cupom é prefixado.',
      'O preço unitário converte-se automaticamente em indexação pós-fixada.'
    ],
    correctOptionIndex: 1,
    explanation: 'Existe uma relação inversa entre taxa de juros e preço de títulos prefixados. A duration quantifica essa sensibilidade: quanto mais longa a duration, mais sensível é o preço às oscilações da taxa.'
  },

  // --- FUNDOS DE INVESTIMENTO (12 questões) ---
  {
    id: 'fi-01',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Come-cotas e Tributação',
    difficulty: 'Fácil',
    stem: 'O mecanismo de antecipação semestral de recolhimento de Imposto de Renda em fundos de investimento, conhecido como "come-cotas", incide nos últimos dias úteis dos meses de:',
    options: [
      'Janeiro e Julho.',
      'Maio e Novembro.',
      'Março e Setembro.',
      'Abril e Outubro.'
    ],
    correctOptionIndex: 1,
    explanation: 'O come-cotas ocorre semestralmente no último dia útil dos meses de maio e novembro, aplicando a alíquota mínima do tipo de fundo (15% para longo prazo e 20% para curto prazo).'
  },
  {
    id: 'fi-02',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Classificação CVM',
    difficulty: 'Médio',
    stem: 'De acordo com as regras da CVM, um fundo classificado como "Fundo de Renda Fixa Simples" deve manter, no mínimo, que percentual de seu patrimônio líquido alocado em títulos públicos federais ou ativos com risco de crédito equivalente?',
    options: [
      '67%',
      '80%',
      '95%',
      '100%'
    ],
    correctOptionIndex: 2,
    explanation: 'Os Fundos de Renda Fixa Simples devem manter no mínimo 95% do patrimônio investido em títulos da dívida pública federal ou títulos de emissão privada de baixo risco de crédito semelhante.'
  },
  {
    id: 'fi-03',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Marcação a Mercado (MaM)',
    difficulty: 'Médio',
    stem: 'A Marcação a Mercado (MaM) nos fundos de investimento tem como principal objetivo:',
    options: [
      'Garantir rentabilidade positiva e constante para todos os cotistas.',
      'Evitar a transferência de riqueza entre cotistas que entram, permanecem ou saem do fundo.',
      'Isentar os cotistas do pagamento de taxa de administração e custódia.',
      'Eliminar completamente o risco de crédito dos emissores privados.'
    ],
    correctOptionIndex: 1,
    explanation: 'A Marcação a Mercado registra os ativos pelo preço que seriam liquidados no mercado no dia, impedindo que cotistas que resgatam suas cotas transfiram lucros ou prejuízos não realizados para os que permanecem no fundo.'
  },
  {
    id: 'fi-04',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Políticas de Resgate e Cotização',
    difficulty: 'Médio',
    stem: 'Em um fundo aberto com prazo de cotização de resgate D+1 e prazo de liquidação financeira de D+2 úteis após a cotização, o cotista que solicitar resgate em uma segunda-feira receberá os recursos em sua conta corrente:',
    options: [
      'Na terça-feira da mesma semana.',
      'Na quarta-feira da mesma semana.',
      'Na quinta-feira da mesma semana.',
      'Na sexta-feira da mesma semana.'
    ],
    correctOptionIndex: 2,
    explanation: 'Segunda (D+0, pedido) -> Terça (D+1, cotização do valor da cota) -> Quinta (+2 dias úteis após cotização: quarta D+1, quinta D+2) para o crédito financeiro na conta.'
  },
  {
    id: 'fi-05',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Taxas de Administração e Performance',
    difficulty: 'Fácil',
    stem: 'A cobrança da taxa de administração em um fundo de investimento impacta a cota do fundo da seguinte forma:',
    options: [
      'É debitada diretamente da conta corrente do cotista no final de cada mês.',
      'É apropriada e deduzida diariamente no cálculo do valor da cota, divulgando-se rentabilidade líquida dessa taxa.',
      'Incide apenas quando o fundo supera o seu benchmark de referência.',
      'É retida na fonte no momento em que o cotista faz o resgate do principal.'
    ],
    correctOptionIndex: 1,
    explanation: 'A taxa de administração é calculada e provisionada diariamente sobre o patrimônio líquido do fundo, de modo que o valor divulgado da cota já é líquido de taxa de administração.'
  },
  {
    id: 'fi-06',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Classificação CVM',
    difficulty: 'Médio',
    stem: 'Para ser classificado como Fundo de Ações de acordo com a regulamentação, o fundo deve manter, no mínimo, que percentual de sua carteira aplicado em ações, bônus de subscrição ou recibos de subscrição?',
    options: [
      '50%',
      '67%',
      '80%',
      '95%'
    ],
    correctOptionIndex: 1,
    explanation: 'Os Fundos de Ações exigem que no mínimo 67% (dois terços) de seu patrimônio líquido esteja alocado em ações admitidas à negociação em mercado organizado ou certificados representativos.'
  },
  {
    id: 'fi-07',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Come-cotas e Tributação',
    difficulty: 'Médio',
    stem: 'Qual dos seguintes tipos de fundos NÃO sofre a incidência semestral do come-cotas?',
    options: [
      'Fundo de Renda Fixa Curto Prazo.',
      'Fundo Multimercado Longo Prazo.',
      'Fundo de Ações.',
      'Fundo de Renda Fixa Referenciado DI.'
    ],
    correctOptionIndex: 2,
    explanation: 'Os Fundos de Ações não estão sujeitos ao come-cotas. A tributação de IR (alíquota única de 15%) ocorre exclusivamente no momento do resgate das cotas.'
  },
  {
    id: 'fi-08',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Taxas de Administração e Performance',
    difficulty: 'Médio',
    stem: 'A Linha d’Água (high water mark) em fundos de investimento é uma regra que determina que a taxa de performance:',
    options: [
      'Só poderá ser cobrada se o valor da cota superar o seu maior valor histórico anterior no momento da apuração.',
      'Pode ser cobrada a qualquer momento, independente de o fundo estar abaixo do seu topo histórico.',
      'Deve ser repassada integralmente aos cotistas em forma de amortização.',
      'Limita o percentual de performance em até 5% da taxa Selic.'
    ],
    correctOptionIndex: 0,
    explanation: 'O princípio da linha d’água estabelece que a taxa de performance só pode ser cobrada se a cota do fundo estiver acima do valor mais alto registrado na última cobrança de performance realizada.'
  },
  {
    id: 'fi-09',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Políticas de Resgate e Cotização',
    difficulty: 'Fácil',
    stem: 'Em um fundo de condomínio fechado, o cotista que desejar desinvestir antes do encerramento do prazo do fundo deve:',
    options: [
      'Exigir o resgate imediato junto ao administrador do fundo.',
      'Negociar suas cotas no mercado secundário (caso admitido em bolsa ou balcão).',
      'Acionar o Fundo Garantidor de Créditos (FGC).',
      'Aguardar o próximo come-cotas semestral para solicitar a amortização.'
    ],
    correctOptionIndex: 1,
    explanation: 'Nos fundos fechados não é permitido o resgate de cotas a qualquer tempo. O cotista pode sair alienando suas cotas a terceiros no mercado secundário ou aguardando amortização/liquidação do fundo.'
  },
  {
    id: 'fi-10',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Classificação CVM',
    difficulty: 'Fácil',
    stem: 'Qual dos seguintes participantes é o responsável legal perante os cotistas e os órgãos reguladores pela constituição, fiscalização dos prestadores de serviço e funcionamento de um fundo?',
    options: [
      'O Administrador fiduciário.',
      'O Agente Autônomo de Investimentos.',
      'O Custodiante independente.',
      'O Auditor contábil terceirizado.'
    ],
    correctOptionIndex: 0,
    explanation: 'O Administrador fiduciário é a instituição autorizada responsável legal pela estrutura e conformidade do fundo de investimento perante os cotistas e os órgãos fiscalizadores.'
  },

  // --- INSTRUMENTOS DE RENDA FIXA E VARIÁVEL (12 questões) ---
  {
    id: 'rf-01',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'Tesouro Direto e Títulos Públicos',
    difficulty: 'Fácil',
    stem: 'O Tesouro Selic (LFT) é um título público federal caracterizado por ser:',
    options: [
      'Prefixado com pagamentos semestrais de juros.',
      'Pós-fixado indexado à variação diária da taxa Selic Over.',
      'Indexado à inflação medida pelo IPCA com cupom real.',
      'Prefixado sem pagamento de juros periódicos.'
    ],
    correctOptionIndex: 1,
    explanation: 'A LFT (Tesouro Selic) é um título público pós-fixado cujo rendimento acompanha a variação acumulada da taxa Selic Over diária.'
  },
  {
    id: 'rf-02',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'CDB, LCI, LCA e Debêntures',
    difficulty: 'Fácil',
    stem: 'Para pessoas físicas residentes no Brasil, os rendimentos auferidos na aplicação em Letras de Crédito Imobiliário (LCI) e Letras de Crédito do Agronegócio (LCA) são:',
    options: [
      'Tributados pela tabela regressiva de 22,5% a 15% de IR.',
      'Isentos de Imposto de Renda e contam com garantia do FGC até os limites regulamentares.',
      'Tributados na fonte à alíquota exclusiva de 15%, sem garantia de crédito.',
      'Isentos de IR, porém sujeitos a IOF após 30 dias de aplicação.'
    ],
    correctOptionIndex: 1,
    explanation: 'LCI e LCA emitidas por instituições financeiras contam com isenção de IR para pessoas físicas e possuem a garantia ordinária do Fundo Garantidor de Créditos (FGC).'
  },
  {
    id: 'rf-03',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'Ações, Dividendos e JCP',
    difficulty: 'Médio',
    stem: 'No mercado acionário brasileiro, qual a principal diferença tributária para o acionista entre proventos recebidos na forma de Dividendos e Juros sobre Capital Próprio (JCP)?',
    options: [
      'Dividendos sofrem retenção de 15% de IR na fonte; JCP é totalmente isento para pessoa física.',
      'Dividendos são isentos de IR para a pessoa física receptora; JCP sofre retenção de 15% de IR na fonte.',
      'Ambos são tributados à alíquota regressiva de renda fixa.',
      'Dividendos reduzem a base do lucro real da empresa emissora; JCP não é dedutível.'
    ],
    correctOptionIndex: 1,
    explanation: 'Para a pessoa física, os dividendos são isentos de IR (já tributados na pessoa jurídica), enquanto o JCP é tributado na fonte à alíquota de 15% no momento do crédito ao acionista.'
  },
  {
    id: 'rf-04',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'CDB, LCI, LCA e Debêntures',
    difficulty: 'Médio',
    stem: 'As debêntures incentivadas (instituídas pela Lei 12.431) destinam-se ao financiamento de projetos prioritários de infraestrutura e concedem aos investidores pessoas físicas:',
    options: [
      'Isenção de Imposto de Renda sobre os rendimentos auferidos.',
      'Cobertura e garantia integral do FGC sem limite de valor.',
      'Garantia do Tesouro Nacional contra qualquer tipo de inadimplência.',
      'Prioridade absoluta no recebimento em relação a salários e tributos.'
    ],
    correctOptionIndex: 0,
    explanation: 'Debêntures incentivadas de infraestrutura possuem isenção de IR sobre rendimentos para pessoas físicas, mas não contam com garantia do FGC nem do Tesouro.'
  },
  {
    id: 'rf-05',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'Tesouro Direto e Títulos Públicos',
    difficulty: 'Médio',
    stem: 'O Tesouro IPCA+ com juros semestrais (NTN-B) é indicado para investidores que desejam:',
    options: [
      'Apenas valorização nominal pura, sem fluxo intermediário de renda.',
      'Proteção contra a inflação combinada com recebimento periódico semestral de cupons de renda real.',
      'Investimento de altíssima liquidez com volatilidade nula no mercado secundário.',
      'Garantia cambial atrelada à cotação do dólar norte-americano.'
    ],
    correctOptionIndex: 1,
    explanation: 'A NTN-B paga cupom de juros semestral baseado em uma taxa real prefixada mais a correção do valor nominal pelo IPCA, provendo fluxo de caixa periódico.'
  },
  {
    id: 'rf-06',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'Ações, Dividendos e JCP',
    difficulty: 'Fácil',
    stem: 'A data a partir da qual as ações são negociadas sem o direito de receber os proventos (dividendos ou juros sobre capital próprio) recém-anunciados é denominada:',
    options: [
      'Data COM.',
      'Data EX.',
      'Data de Liquidação Financeira.',
      'Data de Custódia.'
    ],
    correctOptionIndex: 1,
    explanation: 'A data EX é o primeiro dia de negociação em que o adquirente da ação não terá direito ao provento anunciado pela companhia.'
  },
  {
    id: 'rf-07',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'CDB, LCI, LCA e Debêntures',
    difficulty: 'Fácil',
    stem: 'O Certificado de Depósito Bancário (CDB) é um título representativo de captação emitido por:',
    options: [
      'Sociedades anônimas não financeiras de capital aberto.',
      'Instituições financeiras bancárias (bancos comerciais, múltiplos ou de investimento).',
      'Empresas públicas prestadoras de serviços de saneamento.',
      'Fundos imobiliários com patrimônio de afetação.'
    ],
    correctOptionIndex: 1,
    explanation: 'O CDB é emitido exclusivamente por bancos (comerciais, múltiplos, de desenvolvimento ou de investimento) para captação de recursos a prazo.'
  },
  {
    id: 'rf-08',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'Derivativos Básicos e Hedge',
    difficulty: 'Difícil',
    stem: 'Um exportador brasileiro que receberá US$ 1.000.000 daqui a 6 meses deseja eliminar o risco de queda da cotação do dólar frente ao real. Qual operação com derivativos atende a esse objetivo de hedge?',
    options: [
      'Comprar contratos futuros de dólar na B3.',
      'Vender contratos futuros de dólar na B3 ou comprar opção de venda (put) de dólar.',
      'Comprar opção de compra (call) de dólar no mercado de balcão.',
      'Aplicar seus recursos em títulos públicos pós-fixados LFT.'
    ],
    correctOptionIndex: 1,
    explanation: 'Quem tem receita futura em moeda estrangeira teme a desvalorização do dólar. Para travar a taxa de câmbio, deve assumir posição vendida no mercado futuro ou comprar uma opção de venda (put).'
  },

  // --- SISTEMA FINANCEIRO NACIONAL E PARTICIPANTES (10 questões) ---
  {
    id: 'sfn-01',
    examId: 'cpa',
    subjectId: 'sfn_mercado',
    subjectName: 'Sistema Financeiro Nacional e Participantes',
    topic: 'Estrutura do CMN e BACEN',
    difficulty: 'Fácil',
    stem: 'No Sistema Financeiro Nacional, o Conselho Monetário Nacional (CMN) atua como órgão:',
    options: [
      'Fiscalizador e punitivo das sociedades corretoras de títulos.',
      'Normativo máximo, responsável por formular as diretrizes gerais da política da moeda e do crédito.',
      'Operador de custódia e liquidação de ativos privados.',
      'Emissor de papel-moeda e gestor das reservas internacionais.'
    ],
    correctOptionIndex: 1,
    explanation: 'O CMN é o órgão deliberativo máximo do SFN, fixando diretrizes da política monetária e de crédito, além da meta de inflação.'
  },
  {
    id: 'sfn-02',
    examId: 'cpa',
    subjectId: 'sfn_mercado',
    subjectName: 'Sistema Financeiro Nacional e Participantes',
    topic: 'Atuação da CVM e ANBIMA',
    difficulty: 'Fácil',
    stem: 'Qual órgão tem como atribuição legal regular, fiscalizar e desenvolver o mercado de valores mobiliários no Brasil?',
    options: [
      'Banco Central do Brasil (BACEN).',
      'Comissão de Valores Mobiliários (CVM).',
      'Superintendência de Seguros Privados (SUSEP).',
      'Tribunal de Contas da União (TCU).'
    ],
    correctOptionIndex: 1,
    explanation: 'A CVM é a entidade autárquica vinculada ao Ministério da Fazenda responsável por normatizar, fiscalizar e desenvolver o mercado de capitais e valores mobiliários.'
  },
  {
    id: 'sfn-03',
    examId: 'cpa',
    subjectId: 'sfn_mercado',
    subjectName: 'Sistema Financeiro Nacional e Participantes',
    topic: 'Bancos Múltiplos e Corretoras',
    difficulty: 'Médio',
    stem: 'Para ser configurado como Banco Múltiplo, uma instituição financeira deve possuir, no mínimo, duas carteiras de atuação, sendo obrigatoriamente uma delas:',
    options: [
      'De Crédito Imobiliário ou de Arrendamento Mercantil.',
      'Comercial ou de Investimento.',
      'De Câmbio ou de Distribuidora de Títulos.',
      'De Desenvolvimento ou de Microfinanças.'
    ],
    correctOptionIndex: 1,
    explanation: 'Um banco múltiplo precisa operar com ao menos duas carteiras, sendo uma delas obrigatoriamente comercial (para captar depósitos à vista) ou de investimento.'
  },
  {
    id: 'sfn-04',
    examId: 'cpa',
    subjectId: 'sfn_mercado',
    subjectName: 'Sistema Financeiro Nacional e Participantes',
    topic: 'Atuação da CVM e ANBIMA',
    difficulty: 'Fácil',
    stem: 'A ANBIMA (Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais) é uma instituição representativa privada que atua por meio de:',
    options: [
      'Poder de polícia estatal com competência para decretar liquidação extrajudicial de bancos.',
      'Códigos voluntários de Autorregulação e certificação continuada de profissionais do mercado.',
      'Fixação da taxa básica de juros Selic no Copom.',
      'Julgamento definitivo de crimes contra o sistema financeiro nacional.'
    ],
    correctOptionIndex: 1,
    explanation: 'A ANBIMA é uma associação autorreguladora voluntária que estabelece regras de conduta, padrões de mercado e certifica profissionais financeiros.'
  },
  {
    id: 'sfn-05',
    examId: 'cpa',
    subjectId: 'sfn_mercado',
    subjectName: 'Sistema Financeiro Nacional e Participantes',
    topic: 'Estrutura do CMN e BACEN',
    difficulty: 'Médio',
    stem: 'O Banco Central do Brasil (BACEN) é responsável por executar a política monetária. Entre seus instrumentos clássicos de controle da liquidez do sistema econômico NÃO se inclui:',
    options: [
      'Operações de mercado aberto (Open Market).',
      'Depósito compulsório exigido sobre recursos captados pelos bancos.',
      'Fixação unilateral de alíquotas do imposto sobre a renda das empresas.',
      'Operações de redesconto bancário e empréstimos de liquidez.'
    ],
    correctOptionIndex: 2,
    explanation: 'A fixação de alíquotas tributárias de impostos (como o Imposto de Renda) compete ao Poder Legislativo e à política fiscal do governo federal, e não ao BACEN.'
  },

  // --- PREVIDÊNCIA COMPLEMENTAR ABERTA (8 questões) ---
  {
    id: 'prev-01',
    examId: 'cpa',
    subjectId: 'previdencia',
    subjectName: 'Previdência Complementar Aberta',
    topic: 'Diferenças entre PGBL e VGBL',
    difficulty: 'Fácil',
    stem: 'O plano de previdência PGBL (Plano Gerador de Benefício Livre) é especialmente recomendado para clientes que:',
    options: [
      'Utilizam a declaração simplificada do Imposto de Renda e não contribuem para o INSS.',
      'Fazem a declaração completa do Imposto de Renda e desejam deduzir aportes até o limite de 12% da sua renda bruta anual tributável.',
      'Desejam que o Imposto de Renda incida apenas sobre os rendimentos auferidos no momento do resgate.',
      'Buscam isenção total e permanente de Imposto de Renda no momento do resgate dos recursos.'
    ],
    correctOptionIndex: 1,
    explanation: 'O PGBL permite abater os aportes realizados até o limite de 12% da renda bruta anual tributável para contribuintes do regime geral da previdência que entregam a declaração completa.'
  },
  {
    id: 'prev-02',
    examId: 'cpa',
    subjectId: 'previdencia',
    subjectName: 'Previdência Complementar Aberta',
    topic: 'Diferenças entre PGBL e VGBL',
    difficulty: 'Fácil',
    stem: 'No momento do resgate em um plano de previdência complementar do tipo VGBL (Vida Gerador de Benefício Livre), a base de cálculo para a incidência do Imposto de Renda é:',
    options: [
      'O valor total acumulado resgatado (principal mais rendimentos).',
      'Apenas o montante correspondente aos rendimentos auferidos.',
      'O capital originalmente aportado, isentando os juros compostos.',
      'O saldo total líquido após dedução da taxa de carregamento de saída.'
    ],
    correctOptionIndex: 1,
    explanation: 'No VGBL, a tributação de IR recai unicamente sobre os rendimentos gerados pelo plano, pois os aportes foram feitos com recursos que já sofreram tributação prévia.'
  },
  {
    id: 'prev-03',
    examId: 'cpa',
    subjectId: 'previdencia',
    subjectName: 'Previdência Complementar Aberta',
    topic: 'Regimes Tributários: Progressivo e Regressivo',
    difficulty: 'Médio',
    stem: 'Em relação à tabela regressiva definitiva de tributação da previdência complementar aberta, a menor alíquota de Imposto de Renda possível é:',
    options: [
      '5% após 8 anos de acumulação.',
      '10% para recursos mantidos por prazo superior a 10 anos.',
      '15% para recursos mantidos por mais de 5 anos.',
      'Zero para planos com beneficiários em linha reta.'
    ],
    correctOptionIndex: 1,
    explanation: 'A tabela regressiva inicia com 35% (até 2 anos) e decresce 5 pontos percentuais a cada 2 anos adicionais, atingindo a alíquota mínima de 10% para recursos com mais de 10 anos.'
  },
  {
    id: 'prev-04',
    examId: 'cpa',
    subjectId: 'previdencia',
    subjectName: 'Previdência Complementar Aberta',
    topic: 'Portabilidade e Resgates',
    difficulty: 'Médio',
    stem: 'Durante a fase de diferimento (acumulação) da previdência aberta, a transferência de recursos entre planos (portabilidade):',
    options: [
      'Obriga o recolhimento imediato de 15% de Imposto de Renda a título de antecipação.',
      'Não acarreta incidência de Imposto de Renda nem cobrança de taxa de saída.',
      'Permite a migração direta de saldo de um PGBL para um VGBL sem custos tributários.',
      'Só pode ser realizada entre planos mantidos sob o mesmo CNPJ da seguradora de origem.'
    ],
    correctOptionIndex: 1,
    explanation: 'A portabilidade entre planos da mesma modalidade (PGBL para PGBL ou VGBL para VGBL) não gera incidência de Imposto de Renda nem cobrança de taxas de transferência.'
  },

  // --- GESTÃO DE RISCO, COMPLIANCE E PLD-FT (8 questões) ---
  {
    id: 'risco-01',
    examId: 'cpa',
    subjectId: 'risco_compliance',
    subjectName: 'Gestão de Risco, Compliance e PLD-FT',
    topic: 'Prevenção à Lavagem de Dinheiro (Lei 9.613)',
    difficulty: 'Fácil',
    stem: 'O processo de Lavagem de Dinheiro é tradicionalmente estruturado em três fases sucessivas:',
    options: [
      'Investigação, Julgamento e Condenação.',
      'Colocação (Placement), Ocultação (Layering) e Integração (Integration).',
      'Arrecadação, Custódia e Liquidação.',
      'Compliance, Due Diligence e Auditoria externa.'
    ],
    correctOptionIndex: 1,
    explanation: 'As 3 etapas clássicas são: Colocação (introdução do dinheiro ilícito no sistema), Ocultação (camuflagem da origem com múltiplas transações) e Integração (retorno como recursos formalmente lícitos).'
  },
  {
    id: 'risco-02',
    examId: 'cpa',
    subjectId: 'risco_compliance',
    subjectName: 'Gestão de Risco, Compliance e PLD-FT',
    topic: 'Risco de Mercado, Crédito e Liquidez',
    difficulty: 'Fácil',
    stem: 'O risco de um emissor de um título de renda fixa privado não honrar o pagamento dos juros ou do principal no prazo acordado é denominado:',
    options: [
      'Risco de Mercado.',
      'Risco de Crédito.',
      'Risco de Liquidez.',
      'Risco Operacional.'
    ],
    correctOptionIndex: 1,
    explanation: 'Risco de crédito é a probabilidade de inadimplência (default) ou rebaixamento da classificação de risco (rating) da contraparte emissora.'
  },
  {
    id: 'risco-03',
    examId: 'cpa',
    subjectId: 'risco_compliance',
    subjectName: 'Gestão de Risco, Compliance e PLD-FT',
    topic: 'Chinese Wall e Conflito de Interesses',
    difficulty: 'Médio',
    stem: 'O conceito de "Chinese Wall" (Muralha da China) nas instituições financeiras consiste em:',
    options: [
      'Um sistema de criptografia para transações internacionais em moedas asiáticas.',
      'A segregação física e administrativa entre áreas que possam apresentar conflito de interesses, como gestão de recursos próprios e gestão de recursos de terceiros.',
      'A proibição de transferências patrimoniais para pessoas politicamente expostas.',
      'A barreira alfandegária que limita aportes de investidores não residentes.'
    ],
    correctOptionIndex: 1,
    explanation: 'A política de segregação de atividades (Chinese Wall) visa impedir o fluxo indevido de informações privilegiadas e dirimir conflitos de interesse entre diferentes departamentos da mesma instituição.'
  },
  {
    id: 'risco-04',
    examId: 'cpa',
    subjectId: 'risco_compliance',
    subjectName: 'Gestão de Risco, Compliance e PLD-FT',
    topic: 'Princípio Conheça seu Cliente (KYC)',
    difficulty: 'Fácil',
    stem: 'O princípio Conheça Seu Cliente (Know Your Customer - KYC) tem por objetivo primordial:',
    options: [
      'Garantir a venda casada de produtos de maior margem para clientes de alta renda.',
      'Identificar o perfil de risco, a capacidade financeira e a veracidade da origem dos recursos patrimoniais do investidor.',
      'Assegurar isenção de impostos federais em operações no mercado à vista.',
      'Substituir a necessidade de assinatura de termos de adesão a fundos de investimento.'
    ],
    correctOptionIndex: 1,
    explanation: 'KYC permite verificar a identidade do cliente, sua atividade econômica, sua compatibilidade financeira e prevenir fraudes e lavagem de capitais.'
  },

  // --- CONCEITOS BÁSICOS DE ECONOMIA E FINANÇAS (8 questões) ---
  {
    id: 'eco-01',
    examId: 'cpa',
    subjectId: 'economia_fin',
    subjectName: 'Conceitos de Economia e Finanças',
    topic: 'Copom e Metas para Inflação',
    difficulty: 'Fácil',
    stem: 'No Brasil, a taxa de juros básica da economia (Meta da Taxa Selic) é definida e divulgada periodicamente por qual órgão?',
    options: [
      'Conselho Monetário Nacional (CMN).',
      'Comitê de Política Monetária (Copom) do Banco Central.',
      'Comissão de Valores Mobiliários (CVM).',
      'Comitê Gestor da B3.'
    ],
    correctOptionIndex: 1,
    explanation: 'O Copom (Comitê de Política Monetária do BACEN) reúne-se a cada 45 dias para deliberar e definir a Meta da Taxa Selic.'
  },
  {
    id: 'eco-02',
    examId: 'cpa',
    subjectId: 'economia_fin',
    subjectName: 'Conceitos de Economia e Finanças',
    topic: 'Indicadores Econômicos: IPCA, IGP-M e PIB',
    difficulty: 'Fácil',
    stem: 'O índice oficial utilizado pelo governo brasileiro no regime de metas para a inflação é o:',
    options: [
      'IGP-M, calculado pelo Ibre/FGV.',
      'IPCA, calculado pelo IBGE.',
      'INPC, calculado pela Fipe.',
      'IPA-DI, apurado pelo Banco Central.'
    ],
    correctOptionIndex: 1,
    explanation: 'O IPCA (Índice Nacional de Preços ao Consumidor Amplo), medido pelo IBGE, é o balizador oficial do sistema de metas para a inflação no Brasil.'
  },
  {
    id: 'eco-03',
    examId: 'cpa',
    subjectId: 'economia_fin',
    subjectName: 'Conceitos de Economia e Finanças',
    topic: 'Taxa Selic, CDI e Política Monetária',
    difficulty: 'Médio',
    stem: 'Quando o Banco Central decide elevar a taxa básica Selic para conter pressões inflacionárias, o efeito esperado na economia real no curto a médio prazo é:',
    options: [
      'Aumento imediato do consumo das famílias e forte expansão da concessão de crédito.',
      'Encarecimento do crédito, desestímulo ao consumo e arrefecimento da demanda agregada.',
      'Desvalorização imediata do Real frente a moedas fortes.',
      'Redução da remuneração de títulos públicos federais pós-fixados.'
    ],
    correctOptionIndex: 1,
    explanation: 'A alta de juros encarece o custo do dinheiro, desestimulando empréstimos, investimentos produtivos e consumo, o que desacelera a pressão sobre os preços.'
  },
  {
    id: 'eco-04',
    examId: 'cpa',
    subjectId: 'economia_fin',
    subjectName: 'Conceitos de Economia e Finanças',
    topic: 'Indicadores Econômicos: IPCA, IGP-M e PIB',
    difficulty: 'Médio',
    stem: 'O Produto Interno Bruto (PIB) calculado pela ótica da despesa agrega:',
    options: [
      'Consumo das famílias + Investimentos (FBKF) + Gastos do governo + Exportações líquidas (Exportações - Importações).',
      'Salários pagos + Lucros retidos + Impostos arrecadados sobre produtos exportados.',
      'Receita cambial bruta somada à arrecadação do FGTS.',
      'Total de depósitos à vista e a prazo do sistema bancário comercial.'
    ],
    correctOptionIndex: 0,
    explanation: 'Pela ótica da demanda (despesa), PIB = C + I + G + (X - M).'
  },

  // --- QUESTÕES COMPLEMENTARES DE REFORÇO (10 questões adicionais para totalizar 66+) ---
  {
    id: 'mf-13',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Juros Simples e Compostos',
    difficulty: 'Fácil',
    stem: 'Um empréstimo de R$ 20.000,00 foi contratado para pagamento após 3 meses à taxa de juros simples de 3% ao mês. Qual o valor total dos juros pagos?',
    options: [
      'R$ 600,00',
      'R$ 1.800,00',
      'R$ 1.854,54',
      'R$ 2.400,00'
    ],
    correctOptionIndex: 1,
    explanation: 'J = C × i × t = 20.000 × 0,03 × 3 = R$ 1.800,00.'
  },
  {
    id: 'mf-14',
    examId: 'cpa',
    subjectId: 'mat_fin',
    subjectName: 'Matemática Financeira',
    topic: 'Desconto Racional e Comercial',
    difficulty: 'Difícil',
    stem: 'Um título de R$ 10.000,00 com vencimento em 60 dias é descontado à taxa de 5% ao mês. Se for utilizado o desconto bancário (comercial simples), qual será o valor do desconto obtido pela instituição?',
    options: [
      'R$ 909,09',
      'R$ 1.000,00',
      'R$ 1.025,00',
      'R$ 500,00'
    ],
    correctOptionIndex: 1,
    explanation: 'No desconto comercial (por fora): D = N × d × t = 10.000 × 0,05 × 2 meses = R$ 1.000,00.'
  },
  {
    id: 'fi-11',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Classificação CVM',
    difficulty: 'Fácil',
    stem: 'Os Fundos de Renda Fixa de Curto Prazo, para fins tributários de Imposto de Renda, são aqueles cuja carteira de títulos mantém prazo médio ponderado de vencimento de:',
    options: [
      'Até 60 dias.',
      'Até 365 dias.',
      'Superior a 365 dias.',
      'Até 180 dias.'
    ],
    correctOptionIndex: 1,
    explanation: 'Para efeitos fiscais, fundos de curto prazo têm carteira de títulos com prazo médio igual ou inferior a 365 dias (alíquotas de 22,5% até 180 dias e 20% acima disso).'
  },
  {
    id: 'fi-12',
    examId: 'cpa',
    subjectId: 'fundos_inv',
    subjectName: 'Fundos de Investimento',
    topic: 'Come-cotas e Tributação',
    difficulty: 'Médio',
    stem: 'Um investidor aplicou em um Fundo de Renda Fixa Longo Prazo e resgatou a totalidade dos seus recursos após 740 dias de aplicação. Qual alíquota de Imposto de Renda incidirá sobre o ganho de capital obtido no resgate?',
    options: [
      '22,5%',
      '20,0%',
      '17,5%',
      '15,0%'
    ],
    correctOptionIndex: 3,
    explanation: 'Tabela regressiva de longo prazo: até 180 dias = 22,5%; 181 a 360 dias = 20%; 361 a 720 dias = 17,5%; acima de 720 dias = 15%.'
  },
  {
    id: 'rf-09',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'CDB, LCI, LCA e Debêntures',
    difficulty: 'Fácil',
    stem: 'Qual dos títulos de renda fixa a seguir NÃO conta com a garantia ordinária do Fundo Garantidor de Créditos (FGC)?',
    options: [
      'Certificado de Depósito Bancário (CDB).',
      'Letra de Crédito Imobiliário (LCI).',
      'Debênture corporativa de emissão de sociedade não financeira.',
      'Depósito a prazo com garantia especial emitido por banco.'
    ],
    correctOptionIndex: 2,
    explanation: 'Debêntures são títulos de dívida corporativa emitidos por empresas não bancárias e não contam com a proteção do FGC.'
  },
  {
    id: 'rf-10',
    examId: 'cpa',
    subjectId: 'renda_fixa_var',
    subjectName: 'Instrumentos de Renda Fixa e Variável',
    topic: 'Ações, Dividendos e JCP',
    difficulty: 'Médio',
    stem: 'As ações ordinárias (ON) proporcionam ao seu detentor:',
    options: [
      'Prioridade na distribuição de dividendos fixos sem direito a voto.',
      'Direito essencial de voto nas assembleias gerais da companhia.',
      'Garantia de recompra pelo valor patrimonial a qualquer tempo.',
      'Rendimento prefixado com garantia da B3.'
    ],
    correctOptionIndex: 1,
    explanation: 'Ações ordinárias conferem direito de voto nas deliberações das assembleias de acionistas da companhia aberta.'
  },
  {
    id: 'sfn-06',
    examId: 'cpa',
    subjectId: 'sfn_mercado',
    subjectName: 'Sistema Financeiro Nacional e Participantes',
    topic: 'Atuação da CVM e ANBIMA',
    difficulty: 'Fácil',
    stem: 'A prática ilegal de utilizar informações confidenciais relevantes ainda não divulgadas ao público para obter vantagem indevida no mercado de valores mobiliários é tipificada como:',
    options: [
      'Front Running.',
      'Insider Trading.',
      'Churning.',
      'Spoofing.'
    ],
    correctOptionIndex: 1,
    explanation: 'O uso de informação privilegiada não pública para auferir ganhos no mercado de ações caracteriza o ilícito de Insider Trading.'
  },
  {
    id: 'prev-05',
    examId: 'cpa',
    subjectId: 'previdencia',
    subjectName: 'Previdência Complementar Aberta',
    topic: 'Diferenças entre PGBL e VGBL',
    difficulty: 'Fácil',
    stem: 'Em um plano de previdência complementar aberta, caso o titular venha a falecer durante o período de acumulação, os recursos destinados aos beneficiários indicados:',
    options: [
      'Entram compulsoriamente no processo de inventário judicial.',
      'São pagos diretamente aos beneficiários sem necessidade de inventário, observada a legislação sucessória aplicável.',
      'São revertidos integralmente para a seguradora mantenedora.',
      'Ficam bloqueados no Banco Central por no mínimo 12 meses.'
    ],
    correctOptionIndex: 1,
    explanation: 'Por sua natureza securitária, os planos de previdência aberta são transferidos diretamente aos beneficiários indicados, não integrando a massa do inventário tradicional.'
  },
  {
    id: 'risco-05',
    examId: 'cpa',
    subjectId: 'risco_compliance',
    subjectName: 'Gestão de Risco, Compliance e PLD-FT',
    topic: 'Prevenção à Lavagem de Dinheiro (Lei 9.613)',
    difficulty: 'Médio',
    stem: 'Operações financeiras que apresentem indícios de lavagem de capitais ou financiamento do terrorismo devem ser comunicadas confidencialmente pelas instituições financeiras ao:',
    options: [
      'Conselho de Controle de Atividades Financeiras (COAF).',
      'Ministério Público do Trabalho.',
      'Procon estadual.',
      'Comitê de Auditoria da Bolsa de Valores.'
    ],
    correctOptionIndex: 0,
    explanation: 'O COAF (unidade de inteligência financeira do Brasil) é o órgão responsável por receber, examinar e identificar ocorrências suspeitas de lavagem de dinheiro.'
  },
  {
    id: 'eco-05',
    examId: 'cpa',
    subjectId: 'economia_fin',
    subjectName: 'Conceitos de Economia e Finanças',
    topic: 'Indicadores Econômicos: IPCA, IGP-M e PIB',
    difficulty: 'Médio',
    stem: 'O Índice Geral de Preços do Mercado (IGP-M) possui em sua composição a maior ponderação (60%) associada ao:',
    options: [
      'Índice de Preços ao Produtor Amplo (IPA).',
      'Índice de Preços ao Consumidor (IPC).',
      'Índice Nacional de Custo da Construção (INCC).',
      'Custo Unitário Básico (CUB).'
    ],
    correctOptionIndex: 0,
    explanation: 'O IGP-M é composto por: 60% IPA (preços ao produtor), 30% IPC (preços ao consumidor) e 10% INCC (custo da construção).'
  }
];
