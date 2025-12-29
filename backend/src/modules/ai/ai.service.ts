import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Types for pattern-based analysis
interface AnalysisResult {
  score: number;
  flags: string[];
  insights: string[];
}

interface PatternRule {
  pattern: RegExp;
  flag?: string;
  insight?: string;
  scoreDelta: number;
}

interface WeightedPattern {
  pattern: RegExp;
  weight: number;
}

@Injectable()
export class AIService {
  private readonly hasLLM: boolean;

  // Safety analysis patterns
  private readonly safetyRules: PatternRule[] = [
    // Threat patterns (-30 each)
    { pattern: /\b(kill|hurt|harm|die)\b/i, flag: 'potential_threat', scoreDelta: -30 },
    { pattern: /\bi('ll| will)\s+find\s+you\b/i, flag: 'potential_threat', scoreDelta: -30 },
    { pattern: /\byou('ll| will)\s+(regret|pay|suffer)\b/i, flag: 'potential_threat', scoreDelta: -30 },
    // Pressure patterns (-10 each)
    { pattern: /\bwhy\s+(won't|don't)\s+you\b/i, flag: 'pressure_language', scoreDelta: -10 },
    { pattern: /\byou\s+(have|need|must)\s+to\b/i, flag: 'pressure_language', scoreDelta: -10 },
    { pattern: /\bif\s+you\s+(really|truly)\s+(loved|cared)\b/i, flag: 'pressure_language', scoreDelta: -10 },
    // Manipulation patterns (-15 each)
    { pattern: /\bdon't\s+tell\s+anyone\b/i, flag: 'manipulation', scoreDelta: -15 },
    { pattern: /\bkeep\s+(this|it)\s+secret\b/i, flag: 'manipulation', scoreDelta: -15 },
    { pattern: /\bno\s+one\s+will\s+believe\b/i, flag: 'manipulation', scoreDelta: -15 },
    // Positive signals
    { pattern: /\bthank\s+you\b/i, insight: 'polite_language', scoreDelta: 0 },
    { pattern: /\bi\s+understand\b/i, insight: 'empathetic_language', scoreDelta: 0 },
  ];

  // Intent analysis patterns
  private readonly casualPatterns: WeightedPattern[] = [
    { pattern: /\bhookup\b/g, weight: 3 },
    { pattern: /\bfwb\b/g, weight: 3 },
    { pattern: /\bno\s+strings\b/g, weight: 3 },
    { pattern: /\bjust\s+fun\b/g, weight: 2 },
    { pattern: /\bnothing\s+serious\b/g, weight: 3 },
  ];

  private readonly seriousPatterns: WeightedPattern[] = [
    { pattern: /\brelationship\b/g, weight: 2 },
    { pattern: /\bcommit(ment|ted)?\b/g, weight: 3 },
    { pattern: /\bfuture\s+together\b/g, weight: 3 },
    { pattern: /\blong[\s-]?term\b/g, weight: 3 },
    { pattern: /\bmarriage\b/g, weight: 4 },
  ];

  // Consistency analysis patterns
  private readonly contradictionPairs = [
    { a: /\bi\s+always\b/i, b: /\bi\s+never\b/i },
    { a: /\bi\s+love\b/i, b: /\bi\s+hate\b/i },
    { a: /\bi\s+want\b/i, b: /\bi\s+don't\s+want\b/i },
  ];

  private readonly hedgingPatterns: RegExp[] = [
    /\bi\s+guess\b/i,
    /\bmaybe\b/i,
    /\bprobably\b/i,
    /\bi\s+think\b/i,
    /\bsort\s+of\b/i,
    /\bkind\s+of\b/i,
  ];

  private readonly definitivePatterns: RegExp[] = [
    /\bi\s+definitely\b/i,
    /\bi'm\s+certain\b/i,
    /\bi\s+know\s+for\s+sure\b/i,
    /\babsolutely\b/i,
  ];

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
  ): Promise<AnalysisResult> {
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

  /**
   * Applies pattern rules to text and accumulates results
   */
  private applyPatternRules(
    text: string,
    rules: PatternRule[],
    baseScore: number,
  ): AnalysisResult {
    const flags: string[] = [];
    const insights: string[] = [];
    let score = baseScore;

    for (const rule of rules) {
      if (rule.pattern.test(text)) {
        score += rule.scoreDelta;
        if (rule.flag) flags.push(rule.flag);
        if (rule.insight) insights.push(rule.insight);
      }
    }

    return { score: Math.max(0, score), flags, insights };
  }

  /**
   * Calculates weighted score from pattern matches
   */
  private calculateWeightedScore(text: string, patterns: WeightedPattern[]): number {
    let score = 0;
    for (const { pattern, weight } of patterns) {
      const matches = text.match(pattern) || [];
      score += matches.length * weight;
    }
    return score;
  }

  /**
   * Counts how many patterns match in the text
   */
  private countPatternMatches(text: string, patterns: RegExp[]): number {
    return patterns.filter(pattern => pattern.test(text)).length;
  }

  private analyzeSafetyRuleBased(text: string): AnalysisResult {
    return this.applyPatternRules(text.toLowerCase(), this.safetyRules, 100);
  }

  private analyzeIntentRuleBased(text: string): AnalysisResult {
    const flags: string[] = [];
    const insights: string[] = [];
    const lowerText = text.toLowerCase();

    const casualScore = this.calculateWeightedScore(lowerText, this.casualPatterns);
    const seriousScore = this.calculateWeightedScore(lowerText, this.seriousPatterns);

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

  private analyzeConsistencyRuleBased(text: string): AnalysisResult {
    const flags: string[] = [];
    const insights: string[] = [];
    let score = 70;
    const lowerText = text.toLowerCase();

    // Check for contradictions
    for (const { a, b } of this.contradictionPairs) {
      if (a.test(lowerText) && b.test(lowerText)) {
        score -= 15;
        flags.push('potential_contradiction');
      }
    }

    // Check for hedging language (uncertainty)
    if (this.countPatternMatches(lowerText, this.hedgingPatterns) >= 3) {
      score -= 10;
      flags.push('high_uncertainty');
    }

    // Positive: Definitive language
    for (const pattern of this.definitivePatterns) {
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
    const wordCount = answer.split(/\s+/).length;

    const specificity = this.calculateFactorScore(50, [
      { condition: /\d/.test(answer), delta: 15 },
      { condition: /\b[A-Z][a-z]+\b/.test(answer), delta: 10 },
      { condition: wordCount >= 20, delta: 15 },
      { condition: wordCount >= 50, delta: 10 },
    ]);

    const depth = this.calculateFactorScore(50, [
      { condition: /\bbecause\b|\bsince\b/i.test(answer), delta: 15 },
      { condition: /\bfor example\b|\blike when\b/i.test(answer), delta: 15 },
      { condition: wordCount >= 30, delta: 10 },
    ]);

    const authenticity = this.calculateFactorScore(50, [
      { condition: /\bi\s+(feel|think|believe|value)\b/i.test(answer), delta: 20 },
      { condition: /\bpersonally\b|\bfor me\b/i.test(answer), delta: 15 },
      { condition: /\beveryone\b|\bpeople\b|\bnormal\b/i.test(answer), delta: -10 },
    ]);

    const score = Math.round((specificity + depth + authenticity) / 3);

    return {
      score: this.clampScore(score),
      factors: {
        specificity: this.clampScore(specificity),
        depth: this.clampScore(depth),
        authenticity: this.clampScore(authenticity),
      },
    };
  }

  /**
   * Calculates a factor score by applying conditional deltas
   */
  private calculateFactorScore(
    base: number,
    rules: { condition: boolean; delta: number }[],
  ): number {
    return rules.reduce((score, { condition, delta }) =>
      condition ? score + delta : score, base);
  }

  /**
   * Clamps score to valid range [0, 100]
   */
  private clampScore(score: number): number {
    return Math.max(0, Math.min(100, score));
  }
}
