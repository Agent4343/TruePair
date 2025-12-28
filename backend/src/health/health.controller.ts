import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiExcludeEndpoint()
  root() {
    return {
      name: 'TrueMatch API',
      version: '1.0.0',
      description: 'Trust-first dating platform API',
      docs: '/api/docs',
      health: '/api/health',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        profiles: '/api/profiles',
        matching: '/api/matching',
        messages: '/api/messages',
        safety: '/api/safety',
      },
    };
  }

  @Get('api/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/health/ready')
  @ApiOperation({ summary: 'Readiness check' })
  ready() {
    return { status: 'ready' };
  }

  @Get('api/health/live')
  @ApiOperation({ summary: 'Liveness check' })
  live() {
    return { status: 'live' };
  }
}
