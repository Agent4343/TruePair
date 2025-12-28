import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class FaviconController {
  @Get('favicon.ico')
  favicon(@Res() res: Response) {
    res.status(204).send();
  }
}
