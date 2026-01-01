export const DNA_ANALYSIS_PROMPT = `Analise esta copy de marketing e extraia os seguintes elementos em formato JSON:

Copy:
"""
{copy_content}
"""

Retorne APENAS um JSON válido com esta estrutura:
{
  "tone": "formal" | "casual" | "urgent" | "empathetic" | "provocative",
  "hookLength": number (palavras do hook - primeira frase ou até primeira quebra),
  "hookType": "question" | "statement" | "number" | "story" | "challenge",
  "proofType": "social" | "authority" | "logic" | "testimonial" | "none",
  "ctaStyle": "direct" | "soft" | "urgency" | "curiosity",
  "hasStorytelling": boolean,
  "triggers": ["scarcity", "urgency", "curiosity", "social_proof", "authority", "reciprocity", "fomo"],
  "wordCount": number,
  "emojiCount": number
}

Critérios:
- hookType "number": começa com número ou estatística
- hookType "question": começa com pergunta
- hookType "story": começa com narrativa pessoal ou "eu/minha/meu"
- hasStorytelling: true se tem arco narrativo (problema → jornada → solução)
- Inclua apenas os triggers que estão CLARAMENTE presentes

Retorne APENAS o JSON, sem explicações ou texto adicional.`;

export const INSIGHTS_PROMPT = `Analise estes dados de performance de copies e gere 3-5 insights acionáveis:

Copies Campeãs (DNA + métricas):
{champion_copies_data}

Copies que Falharam (DNA + métricas + motivos):
{failed_copies_data}

Gere insights no seguinte formato JSON:
[
  {
    "pattern": "Descrição do padrão identificado",
    "evidence": "Dados que suportam este padrão",
    "action": "Ação sugerida baseada neste insight"
  }
]

Exemplo de insight:
{
  "pattern": "Headlines curtos performam melhor",
  "evidence": "78% das copies campeãs têm hooks com menos de 8 palavras vs 23% das falhas",
  "action": "Priorize hooks curtos e diretos em novas copies"
}

Retorne APENAS o JSON, sem explicações ou texto adicional.`;

export const AUDIENCE_SIGNATURE_PROMPT = `Analise a performance de copies por segmento de audiência:

Segmento: {segment_name}

Copies campeãs deste segmento (DNA + métricas):
{champion_data}

Copies que falharam neste segmento:
{failed_data}

Identifique o padrão vencedor para este segmento específico.

Retorne no formato JSON:
{
  "segment": "nome do segmento",
  "winningPattern": {
    "tone": "tom ideal",
    "hookType": "tipo de hook ideal",
    "triggers": ["gatilhos mais eficazes"],
    "ctaStyle": "estilo de CTA ideal"
  },
  "summary": "Para [segmento], o padrão ideal é: [descrição resumida]",
  "confidence": "high" | "medium" | "low"
}

Retorne APENAS o JSON, sem explicações ou texto adicional.`;

export const CREATIVE_CORRELATION_PROMPT = `Com base nestes dados de copies + tipos de criativo:
{copies_with_creative_data}

Identifique correlações entre:
1. Tipo de criativo (UGC, estático, vídeo, carrossel) e performance
2. Elementos do DNA da copy que performam melhor com cada tipo de criativo

Retorne no formato JSON:
{
  "correlations": [
    {
      "finding": "Descrição da correlação encontrada",
      "creativeType": "tipo de criativo",
      "strength": "high" | "medium" | "low",
      "recommendation": "Recomendação baseada nesta correlação"
    }
  ],
  "bestCombinations": [
    {
      "creativeType": "tipo",
      "idealDNA": {
        "tone": "tom",
        "hookType": "tipo de hook",
        "triggers": ["gatilhos"]
      }
    }
  ]
}

Retorne APENAS o JSON, sem explicações ou texto adicional.`;
