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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.client = null;
        this.isConnected = false;
    }
    async onModuleInit() {
        try {
            const redisUrl = this.configService.get('REDIS_URL');
            if (redisUrl) {
                this.client = new ioredis_1.default(redisUrl, {
                    maxRetriesPerRequest: 3,
                    lazyConnect: true,
                });
                this.client.on('connect', () => {
                    this.isConnected = true;
                    console.log('📦 Redis connected');
                });
                this.client.on('error', (err) => {
                    console.warn('Redis connection error:', err.message);
                    this.isConnected = false;
                });
                await this.client.connect();
            }
            else {
                console.log('💡 Redis URL not configured, running without cache');
            }
        }
        catch (error) {
            console.warn('Redis initialization failed, running without cache:', error);
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
    getClient() {
        return this.client;
    }
    isAvailable() {
        return this.isConnected && this.client !== null;
    }
    async get(key) {
        if (!this.isAvailable())
            return null;
        try {
            return await this.client.get(key);
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.isAvailable())
            return;
        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch {
        }
    }
    async del(key) {
        if (!this.isAvailable())
            return;
        try {
            await this.client.del(key);
        }
        catch {
        }
    }
    async getJson(key) {
        const value = await this.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    }
    async setJson(key, value, ttlSeconds) {
        await this.set(key, JSON.stringify(value), ttlSeconds);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map