import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  private hasLoggedError = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    if (!redisUrl) {
      this.logger.log('Redis URL not configured, running without cache');
      return;
    }

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          // Only retry once, then give up
          if (times > 1) {
            return null; // Stop retrying
          }
          return 1000; // Retry after 1 second
        },
        reconnectOnError: () => false, // Don't reconnect on errors
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (err) => {
        if (!this.hasLoggedError) {
          this.logger.warn(`Redis unavailable: ${err.message} - running without cache`);
          this.hasLoggedError = true;
        }
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error: any) {
      if (!this.hasLoggedError) {
        this.logger.warn(`Redis initialization failed: ${error.message} - running without cache`);
        this.hasLoggedError = true;
      }
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        // Ignore quit errors
      }
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      return await this.client!.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      if (ttlSeconds) {
        await this.client!.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client!.set(key, value);
      }
    } catch {
      // Ignore cache errors
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await this.client!.del(key);
    } catch {
      // Ignore cache errors
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }
}
