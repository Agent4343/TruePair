import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @Redirect('/api/docs', 302)
  @ApiExcludeEndpoint()
  root() {
    // Redirects to Swagger API documentation
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
