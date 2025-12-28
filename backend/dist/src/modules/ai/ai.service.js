"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AIService = class AIService {
    constructor(configService) {
        this.configService = configService;
        this.hasLLM = !!this.configService.get('OPENAI_API_KEY');
        if (!this.hasLLM) {
            console.log('💡 AI Service running in rule-based mode (no LLM API key configured)');
        }
    }
    async analyzeText(text, analysisType) {
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
    analyzeSafetyRuleBased(text) {
        let score = 100;
        const flags = [];
        const insights = [];
        const lowerText = text.toLowerCase();
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
        if (/\bthank\s+you\b/i.test(lowerText)) {
            insights.push('polite_language');
        }
        if (/\bi\s+understand\b/i.test(lowerText)) {
            insights.push('empathetic_language');
        }
        return { score: Math.max(0, score), flags, insights };
    }
    analyzeIntentRuleBased(text) {
        const flags = [];
        const insights = [];
        let casualScore = 0;
        let seriousScore = 0;
        const lowerText = text.toLowerCase();
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
        }
        else if (seriousScore > casualScore * 2) {
            flags.push('serious_leaning');
        }
        const totalScore = casualScore + seriousScore;
        const score = totalScore === 0 ? 50 : 50 + ((seriousScore - casualScore) / totalScore) * 50;
        return { score: Math.max(0, Math.min(100, score)), flags, insights };
    }
    analyzeConsistencyRuleBased(text) {
        const flags = [];
        const insights = [];
        let score = 70;
        const lowerText = text.toLowerCase();
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
    generateFollowUp(answer, _questionContext) {
        const lowerAnswer = answer.toLowerCase();
        if (answer.split(/\s+/).length < 5) {
            return 'Could you tell me more about that?';
        }
        if (/\bit depends\b|\bmaybe\b|\bsometimes\b/i.test(lowerAnswer)) {
            return 'Can you give me a specific example of when this has come up?';
        }
        if (/\bbut\b.*\bhowever\b|\bhowever\b.*\bbut\b/i.test(lowerAnswer)) {
            return 'I noticed some mixed feelings there. What feels most true to you?';
        }
        if (/\bhate\b|\bcan't stand\b|\bnever\b/i.test(lowerAnswer)) {
            return 'That sounds like a strong feeling. What experiences shaped this view?';
        }
        return null;
    }
    scoreAnswerQuality(answer) {
        const words = answer.split(/\s+/);
        const wordCount = words.length;
        let specificity = 50;
        if (/\d/.test(answer))
            specificity += 15;
        if (/\b[A-Z][a-z]+\b/.test(answer))
            specificity += 10;
        if (wordCount >= 20)
            specificity += 15;
        if (wordCount >= 50)
            specificity += 10;
        let depth = 50;
        if (/\bbecause\b|\bsince\b/i.test(answer))
            depth += 15;
        if (/\bfor example\b|\blike when\b/i.test(answer))
            depth += 15;
        if (wordCount >= 30)
            depth += 10;
        let authenticity = 50;
        if (/\bi\s+(feel|think|believe|value)\b/i.test(answer))
            authenticity += 20;
        if (/\bpersonally\b|\bfor me\b/i.test(answer))
            authenticity += 15;
        if (/\beveryone\b|\bpeople\b|\bnormal\b/i.test(answer))
            authenticity -= 10;
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
};
exports.AIService = AIService;
exports.AIService = AIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AIService);
//# sourceMappingURL=ai.service.js.map