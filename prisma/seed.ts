import { PrismaClient, CopyStatus, Tone, HookType, ProofType, CtaStyle, CreativeType, HypothesisStatus, WinningVariable } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample copy contents
const sampleCopies = [
  {
    title: 'Headline Principal - Pergunta Direta',
    content: `🔥 Você sabia que 87% das pessoas que usam suplementos NÃO veem resultados?

O problema não está no produto... está na ABSORÇÃO.

Seu corpo descarta 90% dos nutrientes que você consome porque seu intestino não consegue processar direito.

É como jogar dinheiro no lixo todos os dias.

Mas existe uma solução científica que muda tudo:

O ThermoMax Ultra foi desenvolvido com tecnologia de nano-partículas que aumenta a absorção em até 300%.

Isso significa resultados 3x mais rápidos com a mesma quantidade.

✅ Mais energia durante o dia
✅ Metabolismo acelerado
✅ Resultados visíveis em 14 dias

Mais de 47.000 brasileiros já transformaram seus resultados.

👉 Clique no botão abaixo e garanta 40% OFF hoje

[QUERO MEU DESCONTO]`,
    status: 'champion' as CopyStatus,
    roas: 4.2,
    ctr: 3.5,
    spend: 2500,
    impressions: 50000,
    clicks: 1750,
    conversions: 87,
    campaignsCount: 5,
  },
  {
    title: 'Storytelling - Jornada Pessoal',
    content: `Há 6 meses eu estava igual a você...

Acordava cansado, sem energia pra nada.
Olhava no espelho e não me reconhecia.
Tentei de tudo: dietas, exercícios, chás milagrosos.

Nada funcionava.

Até que descobri algo que mudou minha vida completamente.

Não foi um suplemento qualquer.
Foi ciência aplicada de verdade.

Em 30 dias, perdi 8kg.
Em 60 dias, minha energia triplicou.
Em 90 dias, as pessoas não me reconheciam mais.

O segredo? ThermoMax Ultra.

O único termogênico com tecnologia de absorção molecular.

Seu corpo finalmente vai aproveitar 100% dos nutrientes.

E hoje você pode começar essa transformação também.

🎁 OFERTA ESPECIAL: 50% OFF + Frete Grátis

Apenas para os próximos 100 pedidos.

[QUERO TRANSFORMAR MEU CORPO]`,
    status: 'champion' as CopyStatus,
    roas: 3.8,
    ctr: 4.1,
    spend: 3200,
    impressions: 65000,
    clicks: 2665,
    conversions: 102,
    campaignsCount: 7,
  },
  {
    title: 'Estatística Impactante',
    content: `📊 FATO: 73% dos brasileiros têm deficiência de vitamina D.

E isso está DESTRUINDO seu metabolismo sem você perceber.

Sintomas que você ignora:
❌ Cansaço constante
❌ Dificuldade para emagrecer
❌ Sono ruim
❌ Imunidade baixa

A solução não é só tomar sol.

É ABSORVER os nutrientes certos.

ThermoMax Ultra combina 12 vitaminas essenciais com tecnologia de nano-absorção.

Resultado: seu corpo finalmente funciona como deveria.

Milhares de resultados comprovados.

➡️ GARANTA O SEU COM 40% OFF

[VER OFERTA]`,
    status: 'scaling' as CopyStatus,
    roas: 3.2,
    ctr: 2.8,
    spend: 1800,
    impressions: 40000,
    clicks: 1120,
    conversions: 45,
    campaignsCount: 3,
  },
  {
    title: 'Urgência - Últimas Unidades',
    content: `⚠️ ATENÇÃO: Restam apenas 47 unidades

Devido à alta demanda, nosso estoque está acabando.

ThermoMax Ultra esgotou 3 vezes este mês.

Se você quer transformar seu corpo ainda em 2024...

ESSE É O MOMENTO.

✅ Fórmula exclusiva
✅ Resultados em 14 dias
✅ Garantia de 30 dias
✅ Frete grátis

Preço promocional: de R$197 por R$97

Válido apenas enquanto durar o estoque.

[GARANTIR MINHA UNIDADE]

⏰ Contagem regressiva: oferta expira em 2 horas`,
    status: 'testing' as CopyStatus,
    roas: 2.1,
    ctr: 3.2,
    spend: 450,
    impressions: 12000,
    clicks: 384,
    conversions: 12,
    campaignsCount: 1,
  },
  {
    title: 'Prova Social - Depoimentos',
    content: `"Perdi 12kg em 2 meses. Não acreditava que ia funcionar!" - Maria, 45 anos

"Minha energia triplicou. Acordo disposto todos os dias." - Carlos, 38 anos

"Já tentei de tudo. Só o ThermoMax funcionou de verdade." - Ana, 52 anos

+47.000 brasileiros já transformaram suas vidas.

⭐⭐⭐⭐⭐ 4.9/5 estrelas em avaliações

O que todos eles têm em comum?

Descobriram o poder da absorção molecular.

Seu corpo finalmente vai aproveitar 100% dos nutrientes.

🎁 OFERTA EXCLUSIVA HOJE

40% OFF + Frete Grátis + Garantia de 30 dias

[QUERO MINHA TRANSFORMAÇÃO]`,
    status: 'champion' as CopyStatus,
    roas: 4.5,
    ctr: 4.8,
    spend: 4500,
    impressions: 90000,
    clicks: 4320,
    conversions: 198,
    campaignsCount: 10,
  },
  {
    title: 'Copy Curta - Feed',
    content: `Cansado de gastar dinheiro com suplementos que não funcionam?

O problema está na ABSORÇÃO, não no produto.

ThermoMax Ultra = 300% mais absorção

Resultado: emagrecimento 3x mais rápido

👉 40% OFF só hoje

[SAIBA MAIS]`,
    status: 'testing' as CopyStatus,
    roas: 1.8,
    ctr: 2.1,
    spend: 280,
    impressions: 8000,
    clicks: 168,
    conversions: 5,
    campaignsCount: 1,
  },
  {
    title: 'Desafio - Tom Provocativo',
    content: `🚫 NÃO COMPRE este produto se:

❌ Você gosta de acordar cansado
❌ Prefere continuar igual
❌ Não quer ver resultados rápidos

Mas SE você quer...

✅ Energia de sobra
✅ Metabolismo acelerado
✅ Corpo que você sempre sonhou

Então ThermoMax Ultra foi feito pra você.

A única fórmula com absorção molecular do Brasil.

Resultados ou seu dinheiro de volta.

Simples assim.

[EU QUERO RESULTADOS]`,
    status: 'failed' as CopyStatus,
    roas: 0.8,
    ctr: 1.2,
    spend: 650,
    impressions: 15000,
    clicks: 180,
    conversions: 4,
    campaignsCount: 2,
  },
  {
    title: 'Autoridade Médica',
    content: `👨‍⚕️ RECOMENDADO POR 127 NUTRICIONISTAS

"A tecnologia de nano-absorção do ThermoMax é um avanço real na suplementação."
- Dr. Paulo Mendes, CRN 12345

A ciência por trás:
• Partículas 50x menores
• Absorção 300% maior
• Resultados comprovados em estudos

Não é promessa. É ciência.

+47.000 resultados reais de brasileiros como você.

Garantia de 30 dias ou seu dinheiro de volta.

🔬 OFERTA CIENTÍFICA: 40% OFF

[VER ESTUDO COMPLETO]`,
    status: 'testing' as CopyStatus,
    roas: 2.4,
    ctr: 2.6,
    spend: 520,
    impressions: 14000,
    clicks: 364,
    conversions: 11,
    campaignsCount: 1,
  },
  {
    title: 'Hook Número Grande',
    content: `47.382 brasileiros já perderam peso com isso...

E você pode ser o próximo.

ThermoMax Ultra não é mais um suplemento.

É a única fórmula com nano-absorção do Brasil.

O que isso significa pra você:
• 3x mais resultados
• 14 dias para ver diferença
• Zero efeitos colaterais

A matemática é simples:
Mais absorção = Mais resultado = Menos tempo

Junte-se aos 47.382 que já transformaram suas vidas.

OFERTA: 40% OFF + FRETE GRÁTIS

[QUERO FAZER PARTE]`,
    status: 'champion' as CopyStatus,
    roas: 3.9,
    ctr: 3.7,
    spend: 2800,
    impressions: 55000,
    clicks: 2035,
    conversions: 95,
    campaignsCount: 6,
  },
  {
    title: 'Copy Longa - Reels/Stories',
    content: `PARA. DE. JOGAR. DINHEIRO. FORA.

Sim, eu tô falando com você que compra suplemento e não vê resultado.

Deixa eu te contar um segredo que a indústria esconde:

90% do que você toma vai direto pro lixo.

Seu intestino simplesmente não absorve.

É como tentar encher um balde furado.

Mas existe UMA solução que muda tudo.

ThermoMax Ultra usa tecnologia de NANO-PARTÍCULAS.

São partículas 50x menores que seu corpo consegue absorver.

Resultado? 300% mais aproveitamento.

Traduzindo: você gasta menos e tem mais resultado.

47.000 brasileiros já descobriram isso.

Tá na hora de você descobrir também.

40% OFF só hoje.

Link na bio 👆`,
    status: 'failed' as CopyStatus,
    roas: 1.1,
    ctr: 1.5,
    spend: 780,
    impressions: 22000,
    clicks: 330,
    conversions: 7,
    campaignsCount: 2,
  },
];

// DNA data for copies
const dnaData = [
  { tone: 'urgent' as Tone, hookType: 'question' as HookType, hookLength: 12, proofType: 'logic' as ProofType, ctaStyle: 'direct' as CtaStyle, hasStorytelling: false, triggers: ['curiosity', 'social_proof', 'fomo'], wordCount: 142, emojiCount: 3 },
  { tone: 'empathetic' as Tone, hookType: 'story' as HookType, hookLength: 8, proofType: 'testimonial' as ProofType, ctaStyle: 'urgency' as CtaStyle, hasStorytelling: true, triggers: ['social_proof', 'fomo'], wordCount: 156, emojiCount: 1 },
  { tone: 'formal' as Tone, hookType: 'number' as HookType, hookLength: 10, proofType: 'authority' as ProofType, ctaStyle: 'direct' as CtaStyle, hasStorytelling: false, triggers: ['authority', 'curiosity'], wordCount: 98, emojiCount: 2 },
  { tone: 'urgent' as Tone, hookType: 'statement' as HookType, hookLength: 6, proofType: 'none' as ProofType, ctaStyle: 'urgency' as CtaStyle, hasStorytelling: false, triggers: ['scarcity', 'urgency', 'fomo'], wordCount: 87, emojiCount: 2 },
  { tone: 'casual' as Tone, hookType: 'statement' as HookType, hookLength: 14, proofType: 'social' as ProofType, ctaStyle: 'direct' as CtaStyle, hasStorytelling: false, triggers: ['social_proof', 'authority'], wordCount: 112, emojiCount: 2 },
  { tone: 'casual' as Tone, hookType: 'question' as HookType, hookLength: 9, proofType: 'logic' as ProofType, ctaStyle: 'soft' as CtaStyle, hasStorytelling: false, triggers: ['curiosity'], wordCount: 52, emojiCount: 1 },
  { tone: 'provocative' as Tone, hookType: 'challenge' as HookType, hookLength: 7, proofType: 'none' as ProofType, ctaStyle: 'direct' as CtaStyle, hasStorytelling: false, triggers: ['curiosity'], wordCount: 78, emojiCount: 2 },
  { tone: 'formal' as Tone, hookType: 'statement' as HookType, hookLength: 5, proofType: 'authority' as ProofType, ctaStyle: 'curiosity' as CtaStyle, hasStorytelling: false, triggers: ['authority', 'social_proof'], wordCount: 94, emojiCount: 1 },
  { tone: 'casual' as Tone, hookType: 'number' as HookType, hookLength: 8, proofType: 'social' as ProofType, ctaStyle: 'direct' as CtaStyle, hasStorytelling: false, triggers: ['social_proof', 'curiosity'], wordCount: 105, emojiCount: 0 },
  { tone: 'provocative' as Tone, hookType: 'statement' as HookType, hookLength: 6, proofType: 'logic' as ProofType, ctaStyle: 'soft' as CtaStyle, hasStorytelling: false, triggers: ['curiosity'], wordCount: 168, emojiCount: 1 },
];

// Failure reasons
const failureReasons = [
  { reasons: ['weak_hook', 'wrong_audience'], notes: 'Tom muito agressivo para o público' },
  { reasons: ['confusing_body', 'weak_cta'], notes: 'Texto muito longo para formato de reels' },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create test user
  const hashedPassword = await bcrypt.hash('123456', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@voyra.com' },
    update: {},
    create: {
      email: 'demo@voyra.com',
      name: 'Usuário Demo',
      password: hashedPassword,
      niche: 'suplementos',
    },
  });

  console.log('✅ Usuário criado:', user.email);

  // Create project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-suplementos' },
    update: {},
    create: {
      id: 'demo-project-suplementos',
      userId: user.id,
      name: 'ThermoMax Ultra - Campanha Principal',
      description: 'Campanha de vendas do suplemento termogênico ThermoMax Ultra',
      niche: 'suplementos',
    },
  });

  console.log('✅ Projeto criado:', project.name);

  // Create hypotheses
  const hypothesis1 = await prisma.hypothesis.upsert({
    where: { id: 'hypothesis-hook-type' },
    update: {},
    create: {
      id: 'hypothesis-hook-type',
      projectId: project.id,
      name: 'Tipo de Hook - Pergunta vs Número',
      description: 'Testar se hooks com perguntas performam melhor que hooks com estatísticas',
      variableA: 'Hook com pergunta direta',
      variableB: 'Hook com número/estatística',
      status: 'active' as HypothesisStatus,
    },
  });

  const hypothesis2 = await prisma.hypothesis.upsert({
    where: { id: 'hypothesis-storytelling' },
    update: {},
    create: {
      id: 'hypothesis-storytelling',
      projectId: project.id,
      name: 'Storytelling vs Direto',
      description: 'Comparar copies com arco narrativo vs copies diretas',
      variableA: 'Copy com storytelling pessoal',
      variableB: 'Copy direta ao ponto',
      status: 'concluded' as HypothesisStatus,
      conclusion: 'Copies com storytelling performaram 23% melhor em ROAS médio. A conexão emocional gerou mais conversões.',
      winningVariable: 'A' as WinningVariable,
      concludedAt: new Date(),
    },
  });

  const hypothesis3 = await prisma.hypothesis.upsert({
    where: { id: 'hypothesis-urgency' },
    update: {},
    create: {
      id: 'hypothesis-urgency',
      projectId: project.id,
      name: 'Gatilho de Urgência',
      description: 'Testar eficácia de gatilhos de escassez e urgência',
      variableA: 'Com gatilho de urgência/escassez',
      variableB: 'Sem gatilho de urgência',
      status: 'active' as HypothesisStatus,
    },
  });

  console.log('✅ Hipóteses criadas');

  // Create copies with DNA
  for (let i = 0; i < sampleCopies.length; i++) {
    const copyData = sampleCopies[i];
    const dna = dnaData[i];

    // Assign hypothesis to some copies
    let hypothesisId = null;
    let hypothesisVariable = null;

    if (i === 0 || i === 2) {
      hypothesisId = hypothesis1.id;
      hypothesisVariable = i === 0 ? 'A' : 'B';
    } else if (i === 1 || i === 5) {
      hypothesisId = hypothesis2.id;
      hypothesisVariable = i === 1 ? 'A' : 'B';
    } else if (i === 3 || i === 7) {
      hypothesisId = hypothesis3.id;
      hypothesisVariable = i === 3 ? 'A' : 'B';
    }

    const copy = await prisma.copy.create({
      data: {
        projectId: project.id,
        title: copyData.title,
        content: copyData.content,
        status: copyData.status,
        roas: copyData.roas,
        ctr: copyData.ctr,
        spend: copyData.spend,
        impressions: copyData.impressions,
        clicks: copyData.clicks,
        conversions: copyData.conversions,
        campaignsCount: copyData.campaignsCount,
        creativeType: ['ugc', 'static', 'video', 'carousel'][Math.floor(Math.random() * 4)] as CreativeType,
        audienceSegment: {
          temperature: ['cold', 'warm', 'hot'][Math.floor(Math.random() * 3)],
          ageRange: ['25-34', '35-44', '45-54'][Math.floor(Math.random() * 3)],
          gender: ['female', 'male', 'all'][Math.floor(Math.random() * 3)],
        },
        hypothesisId,
        hypothesisVariable,
        dna: {
          create: dna,
        },
      },
    });

    // Add failure reason for failed copies
    if (copyData.status === 'failed' && failureReasons.length > 0) {
      const failureData = failureReasons.shift();
      if (failureData) {
        await prisma.failureReason.create({
          data: {
            copyId: copy.id,
            reasons: failureData.reasons,
            notes: failureData.notes,
          },
        });
      }
    }

    // Add status change history
    if (copyData.status !== 'testing') {
      await prisma.statusChange.create({
        data: {
          copyId: copy.id,
          fromStatus: 'testing',
          toStatus: copyData.status,
          metrics: {
            roas: copyData.roas,
            ctr: copyData.ctr,
            spend: copyData.spend,
          },
        },
      });
    }

    console.log(`✅ Copy criada: ${copyData.title}`);
  }

  // Create niche benchmarks
  const benchmarks = [
    { niche: 'suplementos', avgChampionRate: 28, avgRoas: 3.2, topPercentileRoas: 5.5, sampleSize: 1250 },
    { niche: 'skincare', avgChampionRate: 32, avgRoas: 2.8, topPercentileRoas: 4.8, sampleSize: 890 },
    { niche: 'emagrecimento', avgChampionRate: 22, avgRoas: 2.5, topPercentileRoas: 4.2, sampleSize: 2100 },
    { niche: 'infoprodutos', avgChampionRate: 35, avgRoas: 3.8, topPercentileRoas: 6.5, sampleSize: 3500 },
    { niche: 'ecommerce_moda', avgChampionRate: 25, avgRoas: 2.2, topPercentileRoas: 3.8, sampleSize: 1800 },
    { niche: 'ecommerce_eletronicos', avgChampionRate: 20, avgRoas: 1.8, topPercentileRoas: 3.2, sampleSize: 950 },
    { niche: 'servicos_locais', avgChampionRate: 38, avgRoas: 4.2, topPercentileRoas: 7.0, sampleSize: 650 },
    { niche: 'saas_b2b', avgChampionRate: 30, avgRoas: 5.5, topPercentileRoas: 9.0, sampleSize: 420 },
  ];

  for (const benchmark of benchmarks) {
    await prisma.nicheBenchmark.upsert({
      where: { niche: benchmark.niche },
      update: benchmark,
      create: benchmark,
    });
  }

  console.log('✅ Benchmarks criados');

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📧 Login de teste:');
  console.log('   Email: demo@voyra.com');
  console.log('   Senha: 123456');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
