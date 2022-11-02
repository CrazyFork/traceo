import { Controller, Get } from '@nestjs/common';
import { VERSION } from './helpers/constants';

@Controller()
export class AppController {
  @Get("/heartbeat")
  async heartbeat(): Promise<any> {
    return `Traceo - backend, v.${VERSION} - ${process.env.NODE_ENV}`;
  }
}
