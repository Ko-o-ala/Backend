import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!, success entrance';
  }
}
