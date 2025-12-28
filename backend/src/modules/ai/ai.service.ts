import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIService {
  private readonly hasLLM: boolean;

  constructor(private configService: ConfigService) {
    this.hasLLM = !!this.configService.get<string>('OPENAI_API_KEY');

    if (!this.hasLLM) {
      console.log('💡 AI Service running in rule-based mode (no LLM API key configured)');
    }
  }

  /**
   * Analyzes text for safety, intent, or consistency
   */
  async analyzeText(
    text: string,
    analysisType: 'safety' | 'intent' | 'consistency',
  ): Promise<{
    score: number;
    flags: string[];
    insights: string[];
  }> {
    // Use rule-based analysis (can be enhanced with LLM if API key is available)
    switch (analysisType) {
      case 'safety':
        return this.analyzeSafetyRuleBased(text);
      case 'intent':
        return this.analyzeIntentRuleBased(text);
      case 'consistency':
        return this.analyzeConsistencyRuleBased(text);
      default:
        return { score: 50, flags: [], insights: [] };
    }
  }

  private analyzeSafetyRuleBased(text: string): {
    score: number;
    flags: string[];
    insights: string[];
  } {
    let score = 100;
    const flags: string[] = [];
    const insights: string[] = [];

    const lowerText = text.toLowerCase();

    // Check for threat patterns
    const threatPatterns = [
      /\b(kill|hurt|harm|die)\b/i,
      /\bi('ll| will)\s+find\s+you\b/i,
      /\byou('ll| will)\s+(regret|pay|suffer)\b/i,
    ];

    for (const pattern of threatPatterns) {
      if (pattern.test(lowerText)) {
        score -= 30;
        flags.push('potential_threat');
      }
    }

    // Check for pressure patterns
    const pressurePatterns = [
      /\bwhy\s+(won't|don't)\s+you\b/i,
      /\byou\s+(have|need|must)\s+to\b/i,
      /\bif\s+you\s+(really|truly)\s+(loved|cared)\b/i,
    ];

    for (const pattern of pressurePatterns) {
      if (pattern.test(lowerText)) {
        score -= 10;
        flags.push('pressure_language');
      }
    }

    // Check for manipulation patterns
    const manipulationPatterns = [
      /\bdon't\s+tell\s+anyone\b/i,
      /\bkeep\s+(this|it)\s+secret\b/i,
      /\bno\s+one\s+will\s+believe\b/i,
    ];

    for (const pattern of manipulationPatterns) {
      if (pattern.test(lowerText)) {
        score -= 15;
        flags.push('manipulation');
      }
    }

    // Positive signals
    if (/\bthank\s+you\b/i.test(lowerText)) {
      insights.push('polite_language');
    }
    if (/\bi\s+understand\b/i.test(lowerText)) {
      insights.push('empathetic_language');
    }

    return { score: Math.max(0, score), flags, insights };
  }

  private analyzeIntentRuleBased(text: string): {
    score: number;
    flags: string[];
    insights: string[];
  } {
    const flags: string[] = [];
    const insights: string[] = [];
    let casualScore = 0;
    let seriousScore = 0;

    const lowerText = text.toLowerCase();

    // Casual relationship indicators
    const casualPatterns = [
      { pattern: /\bhookup\b/g, weight: 3 },
      { pattern: /\bfwb\b/g, weight: 3 },
      { pattern: /\bno\s+strings\b/g, weight: 3 },
      { pattern: /\bjust\s+fun\b/g, weight: 2 },
      { pattern: /\bnothing\s+serious\b/g, weight: 3 },
    ];

    for (const { pattern, weight } of casualPatterns) {
      const matches = lowerText.match(pattern) || [];
      casualScore += matches.length * weight;
    }

    // Serious relationship indicators
    const seriousPatterns = [
      { pattern: /\brelationship\b/g, weight: 2 },
      { pattern: /\bcommit(ment|ted)?\b/g, weight: 3 },
      { pattern: /\bfuture\s+together\b/g, weight: 3 },
      { pattern: /\blong[\s-]?term\b/g, weight: 3 },
      { pattern: /\bmarriage\b/g, weight: 4 },
    ];

    for (const { pattern, weight } of seriousPatterns) {
      const matches = lowerText.match(pattern) || [];
      seriousScore += matches.length * weight;
    }

    if (casualScore > seriousScore * 2) {
      flags.push('casual_leaning');
    } else if (seriousScore > casualScore * 2) {
      flags.push('serious_leaning');
    }

    // Normalize to 0-100 score (50 = neutral)
    const totalScore = casualScore + seriousScore;
    const score = totalScore === 0 ? 50 : 50 + ((seriousScore - casualScore) / totalScore) * 50;

    return { score: Math.max(0, Math.min(100, score)), flags, insights };
  }

  private analyzeConsistencyRuleBased(text: string): {
    score: number;
    flags: string[];
    insights: string[];
  } {
    const flags: string[] = [];
    const insights: string[] = [];
    let score = 70;

    const lowerText = text.toLowerCase();

    // Check for contradictions
    const contradictions = [
      { a: /\bi\s+always\b/i, b: /\bi\s+never\b/i },
      { a: /\bi\s+love\b/i, b: /\bi\s+hate\b/i },
      { a: /\bi\s+want\b/i, b: /\bi\s+don't\s+want\b/i },
    ];

    for (const { a, b } of contradictions) {
      if (a.test(lowerText) && b.test(lowerText)) {
        score -= 15;
        flags.push('potential_contradiction');
      }
    }

    // Check for hedging language (uncertainty)
    const hedgingPatterns = [
      /\bi\s+guess\b/i,
      /\bmaybe\b/i,
      /\bprobably\b/i,
      /\bi\s+think\b/i,
      /\bsort\s+of\b/i,
      /\bkind\s+of\b/i,
    ];

    let hedgeCount = 0;
    for (const pattern of hedgingPatterns) {
      if (pattern.test(lowerText)) {
        hedgeCount++;
      }
    }

    if (hedgeCount >= 3) {
      score -= 10;
      flags.push('high_uncertainty');
    }

    // Positive: Definitive language
    const definitivePatterns = [
      /\bi\s+definitely\b/i,
      /\bi'm\s+certain\b/i,
      /\bi\s+know\s+for\s+sure\b/i,
      /\babsolutely\b/i,
    ];

    for (const pattern of definitivePatterns) {
      if (pattern.test(lowerText)) {
        insights.push('confident_language');
        score += 5;
      }
    }

    return { score: Math.max(0, Math.min(100, score)), flags, insights };
  }

  /**
   * Generates follow-up questions for vague or inconsistent answers
   */
  generateFollowUp(answer: string, _questionContext: string): string | null {
    const lowerAnswer = answer.toLowerCase();

    // Too short
    if (answer.split(/\s+/).length < 5) {
      return 'Could you tell me more about that?';
    }

    // Vague/uncertain language
    if (/\bit depends\b|\bmaybe\b|\bsometimes\b/i.test(lowerAnswer)) {
      return 'Can you give me a specific example of when this has come up?';
    }

    // Contradictory
    if (/\bbut\b.*\bhowever\b|\bhowever\b.*\bbut\b/i.test(lowerAnswer)) {
      return 'I noticed some mixed feelings there. What feels most true to you?';
    }

    // Strong negative emotion
    if (/\bhate\b|\bcan't stand\b|\bnever\b/i.test(lowerAnswer)) {
      return 'That sounds like a strong feeling. What experiences shaped this view?';
    }

    return null;
  }

  /**
   * Scores answer quality for profile/onboarding responses
   */
  scoreAnswerQuality(answer: string): {
    score: number;
    factors: { specificity: number; depth: number; authenticity: number };
  } {
    const words = answer.split(/\s+/);
    const wordCount = words.length;

    // Specificity: Contains numbers, names, specific details
    let specificity = 50;
    if (/\d/.test(answer)) specificity += 15;
    if (/\b[A-Z][a-z]+\b/.test(answer)) specificity += 10;
    if (wordCount >= 20) specificity += 15;
    if (wordCount >= 50) specificity += 10;

    // Depth: Contains explanations, examples
    let depth = 50;
    if (/\bbecause\b|\bsince\b/i.test(answer)) depth += 15;
    if (/\bfor example\b|\blike when\b/i.test(answer)) depth += 15;
    if (wordCount >= 30) depth += 10;

    // Authenticity: Personal pronouns, emotional language
    let authenticity = 50;
    if (/\bi\s+(feel|think|believe|value)\b/i.test(answer)) authenticity += 20;
    if (/\bpersonally\b|\bfor me\b/i.test(answer)) authenticity += 15;
    // Generic language reduces authenticity
    if (/\beveryone\b|\bpeople\b|\bnormal\b/i.test(answer)) authenticity -= 10;

    const score = Math.round((specificity + depth + authenticity) / 3);

    return {
      score: Math.max(0, Math.min(100, score)),
      factors: {
        specificity: Math.max(0, Math.min(100, specificity)),
        depth: Math.max(0, Math.min(100, depth)),
        authenticity: Math.max(0, Math.min(100, authenticity)),
      },
    };
  }
}
